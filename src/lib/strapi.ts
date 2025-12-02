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
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  // Retry logic for when Strapi is still starting up
  const maxRetries = 10
  const retryDelay = 1000 // 1 second
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url.toString())

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        // If it's a 404 and we're in early retries, might be Strapi still starting
        if (res.status === 404 && attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          continue
        }
        throw new Error(
          `Strapi API error (${res.status}): ${errorData.error?.message || res.statusText || 'Unknown error'}`
        )
      }

      let data = await res.json()

      // Check for Strapi error response structure
      if (data.error) {
        // If it's a 404 and we're in early retries, might be Strapi still starting
        if (data.error.status === 404 && attempt < maxRetries - 1) {
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
 * Get media URL from Strapi
 */
export function getStrapiMedia(url: string | null): string {
  if (!url) {
    return ''
  }

  // Return API URL if url is relative
  if (url.startsWith('/')) {
    return `${import.meta.env.STRAPI_URL}${url}`
  }

  return url
}

/**
 * Format Strapi image data for use in components
 */
// Strapi v5 returns media fields as flat objects when populated
export type StrapiImage = {
  id: number
  documentId?: string
  name: string
  alternativeText: string | null
  caption: string | null
  width: number
  height: number
  formats?: {
    thumbnail?: {
      url: string
      width: number
      height: number
      size: number
      sizeInBytes: number
    }
    small?: {
      url: string
      width: number
      height: number
      size: number
      sizeInBytes: number
    }
    medium?: {
      url: string
      width: number
      height: number
      size: number
      sizeInBytes: number
    }
    large?: {
      url: string
      width: number
      height: number
      size: number
      sizeInBytes: number
    }
  }
  url: string
  hash: string
  ext: string
  mime: string
  size: number
}

export function formatImageUrl(image: StrapiImage): string {
  // Strapi v5 returns media fields as flat objects, so url is directly on the image
  return getStrapiMedia(image.url)
}
