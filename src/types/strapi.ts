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

// For single types in Strapi v5, fields are returned directly without an attributes wrapper
export type AboutPageContent = {
  id: number
  documentId?: string
  title: string
  description: unknown // Blocks type - can be string or structured content
  images: StrapiImage[] // In Strapi v5, media fields are returned as flat arrays when populated
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export type ProfilePhotoContent = {
  id: number
  documentId?: string
  image: StrapiImage[]
  localTitle: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export type TechStackItem = {
  category: string
  items: string[]
}

export type TechStackContent = {
  id: number
  documentId?: string
  localTitle: string
  technologies: TechStackItem[]
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export type StrapiResponse<T> = {
  data: T
  meta: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}
