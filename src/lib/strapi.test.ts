import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { StrapiImage } from '../types/strapi'
import { formatImageUrlWithSize, getStrapiMedia } from './strapi'

// Test constants
const TEST_IMAGE_WIDTH_500 = 500
const TEST_IMAGE_WIDTH_600 = 600
const TEST_IMAGE_WIDTH_400 = 400
const TEST_IMAGE_WIDTH_800 = 800
const TEST_IMAGE_WIDTH_1000 = 1000
const TEST_SIZE_50KB = 50_000
const TEST_SIZE_75KB = 75_000
const TEST_SIZE_100KB = 100_000
const TEST_SIZE_10KB = 10_000

// Helper function to create test images with formats
const createImageWithFormats = (
  formats: Partial<StrapiImage['formats']>
): StrapiImage => ({
  id: 1,
  name: 'test-image',
  alternativeText: null,
  caption: null,
  width: 1920,
  height: 1080,
  url: '/uploads/test-image.jpg',
  hash: 'abc123',
  ext: '.jpg',
  mime: 'image/jpeg',
  size: TEST_SIZE_100KB,
  formats: formats as StrapiImage['formats'],
})

describe('getStrapiMedia', () => {
  beforeEach(() => {
    vi.stubEnv('STRAPI_URL', 'https://api.example.com')
    // Note: vi.stubEnv for boolean values should use actual boolean, but
    // import.meta.env.DEV is a compile-time constant, so we can't change it in tests
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should return empty string for null URL', () => {
    expect(getStrapiMedia(null)).toBe('')
  })

  it('should return empty string for empty string URL', () => {
    expect(getStrapiMedia('')).toBe('')
  })

  it('should prepend STRAPI_URL to relative URLs', () => {
    const result = getStrapiMedia('/uploads/image.jpg')
    expect(result).toBe('https://api.example.com/uploads/image.jpg')
  })

  it('should return absolute URLs as-is', () => {
    const absoluteUrl = 'https://cdn.example.com/image.jpg'
    const result = getStrapiMedia(absoluteUrl)
    expect(result).toBe(absoluteUrl)
  })

  it('should return direct URLs for all images', () => {
    // Static sites return direct URLs without proxying
    const result = getStrapiMedia('/uploads/image.jpg')
    expect(result).toBe('https://api.example.com/uploads/image.jpg')
  })

  it('should handle various file types', () => {
    // All files are returned as direct URLs
    const imageUrl = 'https://api.example.com/uploads/image.jpg'
    const pdfUrl = 'https://api.example.com/uploads/document.pdf'

    expect(getStrapiMedia(imageUrl)).toBe(imageUrl)
    expect(getStrapiMedia(pdfUrl)).toBe(pdfUrl)
  })

  it('should handle all image extensions', () => {
    // All image extensions are returned as direct URLs
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']

    for (const ext of extensions) {
      const url = `https://api.example.com/image.${ext}`
      const result = getStrapiMedia(url)
      // Returns direct URL
      expect(result).toBe(url)
    }
  })
})

describe('formatImageUrlWithSize', () => {
  beforeEach(() => {
    vi.stubEnv('STRAPI_URL', 'https://api.example.com')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should use exact match format when available', () => {
    const image = createImageWithFormats({
      small: {
        url: '/uploads/small.jpg',
        width: TEST_IMAGE_WIDTH_500,
        height: 300,
        size: TEST_SIZE_50KB,
        sizeInBytes: TEST_SIZE_50KB,
      },
      medium: {
        url: '/uploads/medium.jpg',
        width: 750,
        height: 450,
        size: TEST_SIZE_75KB,
        sizeInBytes: TEST_SIZE_75KB,
      },
    })

    const result = formatImageUrlWithSize(
      image,
      TEST_IMAGE_WIDTH_500,
      'webp',
      false
    )
    expect(result).toBe('https://api.example.com/uploads/small.jpg')
  })

  it('should use smallest suitable format within acceptable range', () => {
    const image = createImageWithFormats({
      small: {
        url: '/uploads/small.jpg',
        width: TEST_IMAGE_WIDTH_500,
        height: 300,
        size: TEST_SIZE_50KB,
        sizeInBytes: TEST_SIZE_50KB,
      },
      medium: {
        url: '/uploads/medium.jpg',
        width: 750,
        height: 450,
        size: TEST_SIZE_75KB,
        sizeInBytes: TEST_SIZE_75KB,
      },
      large: {
        url: '/uploads/large.jpg',
        width: TEST_IMAGE_WIDTH_1000,
        height: 600,
        size: TEST_SIZE_100KB,
        sizeInBytes: TEST_SIZE_100KB,
      },
    })

    // Request 600px, should use medium (750px) as it's within 1.25x multiplier
    const result = formatImageUrlWithSize(image, TEST_IMAGE_WIDTH_600, 'webp')
    expect(result).toBe('https://api.example.com/uploads/medium.jpg')
  })

  it('should use smallest oversized format when all formats are too large', () => {
    const image = createImageWithFormats({
      medium: {
        url: '/uploads/medium.jpg',
        width: 750,
        height: 450,
        size: TEST_SIZE_75KB,
        sizeInBytes: TEST_SIZE_75KB,
      },
      large: {
        url: '/uploads/large.jpg',
        width: TEST_IMAGE_WIDTH_1000,
        height: 600,
        size: TEST_SIZE_100KB,
        sizeInBytes: TEST_SIZE_100KB,
      },
    })

    // Request 400px, both formats are larger, should use smallest (medium)
    const result = formatImageUrlWithSize(image, TEST_IMAGE_WIDTH_400, 'webp')
    expect(result).toBe('https://api.example.com/uploads/medium.jpg')
  })

  it('should use largest format when no format is large enough', () => {
    const image = createImageWithFormats({
      thumbnail: {
        url: '/uploads/thumbnail.jpg',
        width: 150,
        height: 150,
        size: TEST_SIZE_10KB,
        sizeInBytes: TEST_SIZE_10KB,
      },
      small: {
        url: '/uploads/small.jpg',
        width: TEST_IMAGE_WIDTH_500,
        height: 300,
        size: TEST_SIZE_50KB,
        sizeInBytes: TEST_SIZE_50KB,
      },
    })

    // Request 1000px, no format is large enough, should use largest (small)
    const result = formatImageUrlWithSize(image, TEST_IMAGE_WIDTH_1000, 'webp')
    expect(result).toBe('https://api.example.com/uploads/small.jpg')
  })

  it('should fall back to query parameters when no formats available', () => {
    const image = createImageWithFormats({})

    const result = formatImageUrlWithSize(image, TEST_IMAGE_WIDTH_800, 'webp')
    expect(result).toContain('width=800')
    expect(result).toContain('format=webp')
    expect(result).toContain('https://api.example.com/uploads/test-image.jpg')
  })

  it('should handle images without formats property', () => {
    const image = {
      id: 1,
      name: 'test-image',
      alternativeText: null,
      caption: null,
      width: 1920,
      height: 1080,
      url: '/uploads/test-image.jpg',
      hash: 'abc123',
      ext: '.jpg',
      mime: 'image/jpeg',
      size: TEST_SIZE_100KB,
    } satisfies StrapiImage

    const result = formatImageUrlWithSize(image, TEST_IMAGE_WIDTH_800, 'webp')
    expect(result).toContain('width=800')
    expect(result).toContain('format=webp')
  })

  it('should handle invalid URL gracefully', () => {
    const image = {
      id: 1,
      name: 'test-image',
      alternativeText: null,
      caption: null,
      width: 1920,
      height: 1080,
      url: 'not-a-valid-url',
      hash: 'abc123',
      ext: '.jpg',
      mime: 'image/jpeg',
      size: TEST_SIZE_100KB,
    } satisfies StrapiImage

    // Should return the original URL
    const result = formatImageUrlWithSize(image, TEST_IMAGE_WIDTH_800, 'webp')
    expect(result).toBe('not-a-valid-url')
  })

  it('should respect format parameter', () => {
    const image = createImageWithFormats({})

    const webpResult = formatImageUrlWithSize(
      image,
      TEST_IMAGE_WIDTH_800,
      'webp'
    )
    const jpgResult = formatImageUrlWithSize(image, TEST_IMAGE_WIDTH_800, 'jpg')
    const pngResult = formatImageUrlWithSize(image, TEST_IMAGE_WIDTH_800, 'png')

    expect(webpResult).toContain('format=webp')
    expect(jpgResult).toContain('format=jpg')
    expect(pngResult).toContain('format=png')
  })

  it('should prefer exact width match over slightly larger format', () => {
    const image = createImageWithFormats({
      small: {
        url: '/uploads/small.jpg',
        width: TEST_IMAGE_WIDTH_500,
        height: 300,
        size: TEST_SIZE_50KB,
        sizeInBytes: TEST_SIZE_50KB,
      },
      medium: {
        url: '/uploads/medium.jpg',
        width: 750,
        height: 450,
        size: TEST_SIZE_75KB,
        sizeInBytes: TEST_SIZE_75KB,
      },
    })

    // Request 500px, should use small (exact match) not medium
    const result = formatImageUrlWithSize(
      image,
      TEST_IMAGE_WIDTH_500,
      'webp',
      false
    )
    expect(result).toBe('https://api.example.com/uploads/small.jpg')
  })

  it('should handle formats with undefined values', () => {
    const image = createImageWithFormats({
      thumbnail: undefined,
      small: {
        url: '/uploads/small.jpg',
        width: TEST_IMAGE_WIDTH_500,
        height: 300,
        size: TEST_SIZE_50KB,
        sizeInBytes: TEST_SIZE_50KB,
      },
      medium: undefined,
      large: undefined,
    })

    const result = formatImageUrlWithSize(
      image,
      TEST_IMAGE_WIDTH_400,
      'webp',
      false
    )
    expect(result).toBe('https://api.example.com/uploads/small.jpg')
  })
})
