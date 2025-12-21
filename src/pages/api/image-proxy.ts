/**
 * Image proxy endpoint that fetches images from Strapi and serves them
 * with proper cache headers to improve Lighthouse cache lifetime scores.
 *
 * Usage: /api/image-proxy?url=<encoded-strapi-image-url>
 */

import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const imageUrl = context.url.searchParams.get('url')

  if (!imageUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  try {
    // Decode the URL
    const decodedUrl = decodeURIComponent(imageUrl)

    // Validate that the URL is from Strapi
    // URL must be a valid HTTP(S) URL
    if (
      !decodedUrl.startsWith('http://') &&
      !decodedUrl.startsWith('https://')
    ) {
      return new Response('Invalid image URL: must be HTTP(S)', { status: 400 })
    }

    // Validate that the URL is from Strapi (either API URL or media CDN)
    const strapiUrl = import.meta.env.STRAPI_URL
    const isStrapiApiUrl = strapiUrl && decodedUrl.includes(strapiUrl)
    // Strapi Cloud uses *.media.strapiapp.com for media files
    const isStrapiMediaCdn = decodedUrl.includes('.media.strapiapp.com')

    if (!isStrapiApiUrl && !isStrapiMediaCdn) {
      return new Response(
        'Invalid image URL: must be from Strapi API or media CDN',
        { status: 400 }
      )
    }

    // Fetch the image from Strapi
    const response = await fetch(decodedUrl)
    if (!response.ok) {
      return new Response('Failed to fetch image', { status: response.status })
    }

    // Get the image data
    const imageData = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Return the image with proper cache headers
    // Cache for 1 year (31536000 seconds) for optimal Lighthouse score
    return new Response(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error proxying image:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
