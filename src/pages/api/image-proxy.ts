/**
 * Image proxy endpoint that fetches images from Strapi and serves them
 * with proper cache headers to improve Lighthouse cache lifetime scores.
 *
 * Usage: /api/image-proxy?url=<encoded-strapi-image-url>
 */

export async function GET({ url }: { url: URL }) {
  const imageUrl = url.searchParams.get('url')

  if (!imageUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  try {
    // Decode the URL
    const decodedUrl = decodeURIComponent(imageUrl)

    // Validate that the URL is from Strapi
    const strapiUrl = import.meta.env.STRAPI_URL
    if (!strapiUrl) {
      return new Response('Strapi URL not configured', { status: 500 })
    }

    // Only allow proxying of Strapi URLs for security
    // URL must be a valid HTTP(S) URL and must include the Strapi URL
    if (
      !decodedUrl.startsWith('http://') &&
      !decodedUrl.startsWith('https://')
    ) {
      return new Response('Invalid image URL: must be HTTP(S)', { status: 400 })
    }

    if (!decodedUrl.includes(strapiUrl)) {
      return new Response('Invalid image URL: must be from Strapi', {
        status: 400,
      })
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
