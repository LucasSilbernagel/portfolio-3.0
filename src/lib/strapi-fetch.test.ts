import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchCollection,
  fetchCollectionWithValidation,
  fetchSingleType,
  fetchSingleTypeWithValidation,
  safeFetchCollection,
  safeFetchSingleType,
} from './strapi'

// Mock fetch globally
global.fetch = vi.fn()

describe('fetchSingleType', () => {
  beforeEach(() => {
    vi.stubEnv('STRAPI_URL', 'https://api.example.com')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should fetch single type data', async () => {
    const mockData = { id: 1, title: 'Test' }
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    })

    const result = await fetchSingleType({
      endpoint: 'about-page',
    })

    expect(result).toEqual(mockData)
    // When populate is undefined, it's not added to the URL
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/about-page'
    )
  })

  it('should handle custom query parameters', async () => {
    const mockData = { id: 1, title: 'Test' }
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    })

    await fetchSingleType({
      endpoint: 'about-page',
      query: { locale: 'en' },
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('locale=en')
    )
  })

  it('should handle custom populate parameter', async () => {
    const mockData = { id: 1, title: 'Test' }
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    })

    await fetchSingleType({
      endpoint: 'about-page',
      populate: 'image',
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/about-page?populate=image'
    )
  })

  it('should handle array populate parameter', async () => {
    const mockData = { id: 1, title: 'Test' }
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    })

    await fetchSingleType({
      endpoint: 'about-page',
      populate: ['image', 'technologies'],
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/about-page?populate=image%2Ctechnologies'
    )
  })

  it('should handle endpoint with leading slash', async () => {
    const mockData = { id: 1, title: 'Test' }
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    })

    await fetchSingleType({
      endpoint: '/about-page',
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/about-page')
    )
  })
})

describe('fetchCollection', () => {
  beforeEach(() => {
    vi.stubEnv('STRAPI_URL', 'https://api.example.com')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should fetch collection data', async () => {
    const mockData = [
      { id: 1, title: 'Test 1' },
      { id: 2, title: 'Test 2' },
    ]
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    })

    const result = await fetchCollection({
      endpoint: 'projects',
    })

    expect(result).toEqual(mockData)
    // When populate is undefined, it's not added to the URL
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/projects'
    )
  })

  it('should handle empty collection', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    })

    const result = await fetchCollection({
      endpoint: 'projects',
    })

    expect(result).toEqual([])
  })
})

describe('safeFetchSingleType', () => {
  beforeEach(() => {
    vi.stubEnv('STRAPI_URL', 'https://api.example.com')
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('should return data on success', async () => {
    const mockData = { id: 1, title: 'Test' }
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    })

    const result = await safeFetchSingleType({
      endpoint: 'about-page',
      contentTypeName: 'About Page',
    })

    expect(result).toEqual(mockData)
    // eslint-disable-next-line no-console
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('should return null and log warning on error', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    )

    const result = await safeFetchSingleType({
      endpoint: 'about-page',
      contentTypeName: 'About Page',
    })

    expect(result).toBeNull()
    // eslint-disable-next-line no-console
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch About Page')
    )
  })
})

describe('safeFetchCollection', () => {
  beforeEach(() => {
    vi.stubEnv('STRAPI_URL', 'https://api.example.com')
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('should return data on success', async () => {
    const mockData = [{ id: 1, title: 'Test' }]
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    })

    const result = await safeFetchCollection({
      endpoint: 'projects',
      contentTypeName: 'Projects',
    })

    expect(result).toEqual(mockData)
    // eslint-disable-next-line no-console
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('should return empty array and log warning on error', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    )

    const result = await safeFetchCollection({
      endpoint: 'projects',
      contentTypeName: 'Projects',
    })

    expect(result).toEqual([])
    // eslint-disable-next-line no-console
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch Projects')
    )
  })
})

describe('fetchSingleTypeWithValidation', () => {
  beforeEach(() => {
    vi.stubEnv('STRAPI_URL', 'https://api.example.com')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should return data when found', async () => {
    const mockData = { id: 1, title: 'Test' }
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    })

    const result = await fetchSingleTypeWithValidation({
      endpoint: 'about-page',
      contentTypeName: 'About Page',
    })

    expect(result).toEqual(mockData)
  })

  it('should throw error when data is null', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: null }),
    })

    await expect(
      fetchSingleTypeWithValidation({
        endpoint: 'about-page',
        contentTypeName: 'About Page',
      })
    ).rejects.toThrow('About Page content not found')
  })

  it('should throw descriptive error on fetch failure', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    )

    await expect(
      fetchSingleTypeWithValidation({
        endpoint: 'about-page',
        contentTypeName: 'About Page',
      })
    ).rejects.toThrow('Failed to fetch content from Strapi')
  })
})

describe('fetchCollectionWithValidation', () => {
  beforeEach(() => {
    vi.stubEnv('STRAPI_URL', 'https://api.example.com')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should return data when collection is not empty', async () => {
    const mockData = [{ id: 1, title: 'Test' }]
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    })

    const result = await fetchCollectionWithValidation({
      endpoint: 'projects',
      contentTypeName: 'Projects',
    })

    expect(result).toEqual(mockData)
  })

  it('should throw error when collection is empty', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    })

    await expect(
      fetchCollectionWithValidation({
        endpoint: 'projects',
        contentTypeName: 'Projects',
      })
    ).rejects.toThrow('Projects content not found')
  })

  it('should throw error when data is null', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: null }),
    })

    await expect(
      fetchCollectionWithValidation({
        endpoint: 'projects',
        contentTypeName: 'Projects',
      })
    ).rejects.toThrow('Projects content not found')
  })
})
