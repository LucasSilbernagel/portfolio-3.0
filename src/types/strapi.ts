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
  image: StrapiImage
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

// Type for Blocks content structure
export type BlockType = {
  type: string
  children?: Array<{ text?: string }>
}

export type ExperienceItem = {
  id: number
  documentId?: string
  startDate: string
  endDate: string | null
  Company: string
  Position: string
  Location: string
  Website: string
  Highlights: unknown // Blocks type - can be string or structured content
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export type ProjectContent = {
  id: number
  documentId?: string
  projectName: string
  completedYear: string
  technologies: string[] // JSON field parsed as array
  description: string
  liveUrl: string
  githubUrl: string
  image: StrapiImage | StrapiImage[] // Single media field, but may be returned as array when populated
  createdAt: string
  updatedAt: string
  publishedAt: string
}

// Strapi file type (for non-image files like PDFs)
export type StrapiFile = {
  id: number
  documentId?: string
  name: string
  alternativeText: string | null
  caption: string | null
  url: string
  hash: string
  ext: string
  mime: string
  size: number
}

export type ResumeContent = {
  id: number
  documentId?: string
  Resume: StrapiFile
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export type MapContent = {
  id: number
  documentId?: string
  mapIframeSrc: string
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
