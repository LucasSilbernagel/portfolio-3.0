import type { APIContext } from 'astro'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './image-proxy'

// HTTP status codes
const HTTP_BAD_REQUEST = 400
const HTTP_OK = 200
const HTTP_NOT_FOUND = 404
const HTTP_INTERNAL_SERVER_ERROR = 500

// Mock fetch globally
global.fetch = vi.fn()

// Helper to create mock APIContext
const createMockContext = (url: string, requestUrl?: string): APIContext => {
  const mockUrl = new URL(url, 'http://localhost:4321')
  return {
    url: mockUrl,
    request: requestUrl
      ? ({
          url: requestUrl,
        } as Request)
      : undefined,
    params: {},
    props: {},
    locals: {},
    cookies: {
      get: vi.fn(),
      has: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      getAll: vi.fn(),
    },
    redirect: vi.fn(),
    site: undefined,
    generator: 'astro',
  } as unknown as APIContext
}

describe('image-proxy API route', () => {
  beforeEach(() => {
    vi.stubEnv('STRAPI_URL', 'https://api.example.com')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should return 400 when url parameter is missing', async () => {
    const context = createMockContext('http://localhost:4321/api/image-proxy')

    const response = await GET(context)

    expect(response.status).toBe(HTTP_BAD_REQUEST)
    const text = await response.text()
    expect(text).toBe('Missing url parameter')
  })

  it('should return 400 when url parameter is empty', async () => {
    const context = createMockContext(
      'http://localhost:4321/api/image-proxy?url='
    )

    const response = await GET(context)

    expect(response.status).toBe(HTTP_BAD_REQUEST)
    const text = await response.text()
    expect(text).toBe('Missing url parameter')
  })

  it('should return 400 when URL is not HTTP or HTTPS', async () => {
    const invalidUrl = 'ftp://example.com/image.jpg'
    const encodedUrl = encodeURIComponent(invalidUrl)
    const context = createMockContext(
      `http://localhost:4321/api/image-proxy?url=${encodedUrl}`
    )

    const response = await GET(context)

    expect(response.status).toBe(HTTP_BAD_REQUEST)
    const text = await response.text()
    expect(text).toBe('Invalid image URL: must be HTTP(S)')
  })

  it('should return 400 when URL is not from Strapi API', async () => {
    const externalUrl = 'https://external-site.com/image.jpg'
    const encodedUrl = encodeURIComponent(externalUrl)
    const context = createMockContext(
      `http://localhost:4321/api/image-proxy?url=${encodedUrl}`
    )

    const response = await GET(context)

    expect(response.status).toBe(HTTP_BAD_REQUEST)
    const text = await response.text()
    expect(text).toBe('Invalid image URL: must be from Strapi API or media CDN')
  })

  it('should accept URLs from Strapi API', async () => {
    const strapiUrl = 'https://api.example.com/uploads/image.jpg'
    const encodedUrl = encodeURIComponent(strapiUrl)
    const context = createMockContext(
      `http://localhost:4321/api/image-proxy?url=${encodedUrl}`
    )

    const mockImageResponse = new Response(new Blob(['fake-image-data']), {
      status: HTTP_OK,
      headers: {
        'content-type': 'image/jpeg',
      },
    })

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockImageResponse
    )

    const response = await GET(context)

    expect(response.status).toBe(HTTP_OK)
    expect(global.fetch).toHaveBeenCalledWith(strapiUrl, { cache: 'default' })
    expect(response.headers.get('Content-Type')).toBe('image/jpeg')
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=31536000, immutable'
    )
  })

  it('should accept URLs from Strapi media CDN', async () => {
    const cdnUrl = 'https://example.media.strapiapp.com/image.jpg'
    const encodedUrl = encodeURIComponent(cdnUrl)
    const context = createMockContext(
      `http://localhost:4321/api/image-proxy?url=${encodedUrl}`
    )

    const mockImageResponse = new Response(new Blob(['fake-image-data']), {
      status: HTTP_OK,
      headers: {
        'content-type': 'image/png',
      },
    })

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockImageResponse
    )

    const response = await GET(context)

    expect(response.status).toBe(HTTP_OK)
    expect(global.fetch).toHaveBeenCalledWith(cdnUrl, { cache: 'default' })
    expect(response.headers.get('Content-Type')).toBe('image/png')
  })

  it('should decode URL parameter correctly', async () => {
    const strapiUrl = 'https://api.example.com/uploads/image with spaces.jpg'
    const encodedUrl = encodeURIComponent(strapiUrl)
    const context = createMockContext(
      `http://localhost:4321/api/image-proxy?url=${encodedUrl}`
    )

    const mockImageResponse = new Response(new Blob(['fake-image-data']), {
      status: HTTP_OK,
      headers: {
        'content-type': 'image/jpeg',
      },
    })

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockImageResponse
    )

    const response = await GET(context)

    expect(response.status).toBe(HTTP_OK)
    expect(global.fetch).toHaveBeenCalledWith(strapiUrl, { cache: 'default' })
  })

  it('should handle fetch errors gracefully', async () => {
    const strapiUrl = 'https://api.example.com/uploads/image.jpg'
    const encodedUrl = encodeURIComponent(strapiUrl)
    const context = createMockContext(
      `http://localhost:4321/api/image-proxy?url=${encodedUrl}`
    )

    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    )

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await GET(context)

    expect(response.status).toBe(HTTP_INTERNAL_SERVER_ERROR)
    const text = await response.text()
    expect(text).toBe('Internal server error')
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error proxying image:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('should return error status when image fetch fails', async () => {
    const strapiUrl = 'https://api.example.com/uploads/missing.jpg'
    const encodedUrl = encodeURIComponent(strapiUrl)
    const context = createMockContext(
      `http://localhost:4321/api/image-proxy?url=${encodedUrl}`
    )

    const mockErrorResponse = new Response('Not Found', {
      status: HTTP_NOT_FOUND,
    })

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockErrorResponse
    )

    const response = await GET(context)

    expect(response.status).toBe(HTTP_NOT_FOUND)
    const text = await response.text()
    expect(text).toBe('Failed to fetch image')
  })

  it('should set proper cache headers', async () => {
    const strapiUrl = 'https://api.example.com/uploads/image.jpg'
    const encodedUrl = encodeURIComponent(strapiUrl)
    const context = createMockContext(
      `http://localhost:4321/api/image-proxy?url=${encodedUrl}`
    )

    const mockImageResponse = new Response(new Blob(['fake-image-data']), {
      status: HTTP_OK,
      headers: {
        'content-type': 'image/webp',
      },
    })

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockImageResponse
    )

    const response = await GET(context)

    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=31536000, immutable'
    )
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET')
  })

  it('should use default content type when not provided', async () => {
    const strapiUrl = 'https://api.example.com/uploads/image.jpg'
    const encodedUrl = encodeURIComponent(strapiUrl)
    const context = createMockContext(
      `http://localhost:4321/api/image-proxy?url=${encodedUrl}`
    )

    const mockImageResponse = new Response(new Blob(['fake-image-data']), {
      status: HTTP_OK,
      headers: {},
    })

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockImageResponse
    )

    const response = await GET(context)

    expect(response.headers.get('Content-Type')).toBe('image/jpeg')
  })

  it('should extract URL from request.url when context.url is not available', async () => {
    const strapiUrl = 'https://api.example.com/uploads/image.jpg'
    const encodedUrl = encodeURIComponent(strapiUrl)
    const context = createMockContext(
      'http://localhost:4321/api/image-proxy',
      `http://localhost:4321/api/image-proxy?url=${encodedUrl}`
    )
    // Remove url from context to test fallback
    context.url = undefined as unknown as URL

    const mockImageResponse = new Response(new Blob(['fake-image-data']), {
      status: HTTP_OK,
      headers: {
        'content-type': 'image/jpeg',
      },
    })

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockImageResponse
    )

    const response = await GET(context)

    expect(response.status).toBe(HTTP_OK)
    expect(global.fetch).toHaveBeenCalledWith(strapiUrl, { cache: 'default' })
  })

  it('should handle URL extraction from malformed request URL', async () => {
    const strapiUrl = 'https://api.example.com/uploads/image.jpg'
    const encodedUrl = encodeURIComponent(strapiUrl)
    const context = createMockContext(
      'http://localhost:4321/api/image-proxy',
      `invalid-url-format?url=${encodedUrl}`
    )
    context.url = undefined as unknown as URL

    const mockImageResponse = new Response(new Blob(['fake-image-data']), {
      status: HTTP_OK,
      headers: {
        'content-type': 'image/jpeg',
      },
    })

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockImageResponse
    )

    const response = await GET(context)

    expect(response.status).toBe(HTTP_OK)
    expect(global.fetch).toHaveBeenCalledWith(strapiUrl, { cache: 'default' })
  })
})
