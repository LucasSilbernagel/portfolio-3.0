import type { StrapiImage } from '../types/strapi'

type FetchApiOptions = {
  endpoint: string
  query?: Record<string, string>
  wrappedByKey?: string
  wrappedByList?: boolean
}

/**
 * Fetches data from the Strapi API with retry logic for startup
 */
export default async function fetchApi<T>({
  endpoint,
  query,
  wrappedByKey,
  wrappedByList,
}: FetchApiOptions): Promise<T> {
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.slice(1)
  }

  const url = new URL(`${import.meta.env.STRAPI_URL}/api/${endpoint}`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.append(key, value)
    }
  }

  // Retry logic for when Strapi is still starting up
  const maxRetries = 10
  const retryDelay = 1000 // 1 second
  const HTTP_NOT_FOUND = 404
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url.toString())

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        if (res.status === HTTP_NOT_FOUND && attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          continue
        }
        throw new Error(
          `Strapi API error (${res.status}): ${errorData.error?.message || res.statusText || 'Unknown error'}`
        )
      }

      let data = await res.json()

      if (data.error) {
        // If it's a 404 and we're in early retries, might be Strapi still starting
        if (data.error.status === HTTP_NOT_FOUND && attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          continue
        }
        throw new Error(
          `Strapi API error: ${data.error.message || 'Unknown error'}`
        )
      }

      if (wrappedByKey) {
        data = data[wrappedByKey]
      }

      if (wrappedByList) {
        data = data[0]
      }

      return data as T
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // If it's a network error and we have retries left, wait and retry
      if (
        (lastError instanceof TypeError &&
          lastError.message.includes('fetch')) ||
        lastError.message.includes('Failed to connect')
      ) {
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          continue
        }
        throw new Error(
          `Failed to connect to Strapi at ${import.meta.env.STRAPI_URL} after ${maxRetries} attempts. Make sure Strapi is running.`
        )
      }

      // For other errors, throw immediately
      throw lastError
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('Failed to fetch from Strapi')
}

/**
 * Proxy an image URL through our image proxy endpoint to add proper cache headers
 * This improves Lighthouse cache lifetime scores by serving images with long cache TTL
 *
 * NOTE: Currently disabled because API routes don't work reliably on Netlify for static sites.
 * TODO: Implement alternative solution (Netlify Edge Functions, _headers file, or CDN)
 */
function proxyImageUrl(imageUrl: string): string {
  // Disabled for now - API routes don't work on Netlify static sites
  // Return direct URL instead
  return imageUrl

  // Original implementation (disabled):
  // const isProduction = import.meta.env.PROD && import.meta.env.SITE
  // if (!isProduction) {
  //   return imageUrl
  // }
  // const encodedUrl = encodeURIComponent(imageUrl)
  // return `/api/image-proxy?url=${encodedUrl}`
}

/**
 * Get media URL from Strapi
 */
export function getStrapiMedia(url: string | null, useProxy = true): string {
  if (!url) {
    return ''
  }

  // Return API URL if url is relative
  const fullUrl = url.startsWith('/')
    ? `${import.meta.env.STRAPI_URL}${url}`
    : url

  // Use proxy for images to add proper cache headers
  const imageExtensionRegex = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|$)/i
  if (useProxy && imageExtensionRegex.test(fullUrl)) {
    return proxyImageUrl(fullUrl)
  }

  return fullUrl
}

/**
 * Format Strapi image data for use in components
 */
export function formatImageUrl(image: StrapiImage, useProxy = true): string {
  // Strapi v5 returns media fields as flat objects, so url is directly on the image
  return getStrapiMedia(image.url, useProxy)
}

/**
 * Format Strapi image URL with size optimization
 * First tries to use a pre-generated format if it's close to the desired size,
 * otherwise adds width and format query parameters
 */
export function formatImageUrlWithSize(
  image: StrapiImage,
  width: number,
  format: 'webp' | 'jpg' | 'png' = 'webp',
  useProxy = true
): string {
  // Check if there's a pre-generated format suitable for the desired size
  if (image.formats) {
    // Collect all available formats
    const formats = [
      { name: 'large', format: image.formats.large },
      { name: 'medium', format: image.formats.medium },
      { name: 'small', format: image.formats.small },
      { name: 'thumbnail', format: image.formats.thumbnail },
    ].filter((f) => f.format !== undefined) as Array<{
      name: string
      format: NonNullable<(typeof image.formats)[keyof typeof image.formats]>
    }>

    // Find formats that are at least the desired width (to avoid upscaling)
    const suitableFormats = formats.filter((f) => f.format.width >= width)

    if (suitableFormats.length > 0) {
      // Use the smallest format that's still >= desired width (closest match)
      let bestFormat = suitableFormats[0]
      for (const format of suitableFormats) {
        if (format.format.width < bestFormat.format.width) {
          bestFormat = format
        }
      }
      return getStrapiMedia(bestFormat.format.url, useProxy)
    }

    // If no format is large enough, use the largest available format
    if (formats.length > 0) {
      let largestFormat = formats[0]
      for (const format of formats) {
        if (format.format.width > largestFormat.format.width) {
          largestFormat = format
        }
      }
      return getStrapiMedia(largestFormat.format.url, useProxy)
    }
  }

  // Fallback: use query parameters for on-the-fly transformation
  // First get the base URL without proxy to build the query params
  const baseUrlWithoutProxy = getStrapiMedia(image.url, false)

  try {
    const url = new URL(baseUrlWithoutProxy)

    // Add width parameter for optimization
    url.searchParams.set('width', width.toString())

    // Add format parameter for better compression (WebP is smaller than JPG/PNG)
    url.searchParams.set('format', format)

    // Now apply proxy if needed
    return useProxy ? proxyImageUrl(url.toString()) : url.toString()
  } catch {
    // If URL parsing fails, return the original URL (with or without proxy)
    return getStrapiMedia(image.url, useProxy)
  }
}

type FetchSingleTypeOptions = {
  endpoint: string
  query?: Record<string, string>
}

type FetchCollectionTypeOptions = {
  endpoint: string
  query?: Record<string, string>
}

/**
 * Helper to fetch a single Strapi content type (single type)
 */
export async function fetchSingleType<T>({
  endpoint,
  query = {},
}: FetchSingleTypeOptions): Promise<T | null> {
  return fetchApi<T | null>({
    endpoint,
    query: {
      populate: '*',
      ...query,
    },
    wrappedByKey: 'data',
  })
}

/**
 * Helper to fetch a collection of Strapi content (collection type)
 */
export async function fetchCollection<T>({
  endpoint,
  query = {},
}: FetchCollectionTypeOptions): Promise<T[]> {
  return fetchApi<T[]>({
    endpoint,
    query: {
      populate: '*',
      ...query,
    },
    wrappedByKey: 'data',
  })
}

/**
 * Helper to safely fetch Strapi data with error handling
 * Returns null on error and logs a warning
 */
export async function safeFetchSingleType<T>({
  endpoint,
  query = {},
  contentTypeName,
}: FetchSingleTypeOptions & { contentTypeName?: string }): Promise<T | null> {
  try {
    return await fetchSingleType<T>({ endpoint, query })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      `Failed to fetch ${contentTypeName || endpoint} from Strapi: ${error instanceof Error ? error.message : String(error)}.`
    )
    return null
  }
}

/**
 * Helper to safely fetch Strapi collection with error handling
 * Returns empty array on error and logs a warning
 */
export async function safeFetchCollection<T>({
  endpoint,
  query = {},
  contentTypeName,
}: FetchCollectionTypeOptions & { contentTypeName?: string }): Promise<T[]> {
  try {
    return await fetchCollection<T>({ endpoint, query })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      `Failed to fetch ${contentTypeName || endpoint} from Strapi: ${error instanceof Error ? error.message : String(error)}.`
    )
    return []
  }
}

/**
 * Helper to fetch Strapi data with validation and error throwing
 * Throws descriptive error if content is not found
 */
export async function fetchSingleTypeWithValidation<T>({
  endpoint,
  query = {},
  contentTypeName,
}: FetchSingleTypeOptions & { contentTypeName: string }): Promise<T> {
  try {
    const data = await fetchSingleType<T>({ endpoint, query })
    if (!data) {
      throw new Error(
        `${contentTypeName} content not found in Strapi. Please:\n1. Create and publish the content in the Strapi admin panel\n2. Go to Settings > Users & Permissions Plugin > Roles > Public\n3. Enable "find" permission for "${contentTypeName}"`
      )
    }
    return data
  } catch (error) {
    if (error instanceof Error && error.message.includes('content not found')) {
      throw error
    }
    throw new Error(
      `Failed to fetch content from Strapi: ${error instanceof Error ? error.message : String(error)}. Make sure Strapi is running and the ${contentTypeName} content type has public permissions enabled.`
    )
  }
}

/**
 * Helper to fetch Strapi collection with validation and error throwing
 * Throws descriptive error if collection is empty
 */
export async function fetchCollectionWithValidation<T>({
  endpoint,
  query = {},
  contentTypeName,
}: FetchCollectionTypeOptions & { contentTypeName: string }): Promise<T[]> {
  try {
    const data = await fetchCollection<T>({ endpoint, query })
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error(
        `${contentTypeName} content not found in Strapi. Please:\n1. Create and publish the content in the Strapi admin panel\n2. Go to Settings > Users & Permissions Plugin > Roles > Public\n3. Enable "find" permission for "${contentTypeName}"`
      )
    }
    return data
  } catch (error) {
    if (error instanceof Error && error.message.includes('content not found')) {
      throw error
    }
    throw new Error(
      `Failed to fetch content from Strapi: ${error instanceof Error ? error.message : String(error)}. Make sure Strapi is running and the ${contentTypeName} content type has public permissions enabled.`
    )
  }
}
