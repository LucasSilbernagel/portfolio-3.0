import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import {
  aboutSchema,
  experienceSchema,
  projectsSchema,
  siteSchema,
  techStackSchema,
} from './lib/content-schemas'

// The frontmatter schemas live in src/lib/content-schemas.ts so unit tests
// can verify they stay in sync with the Sveltia config (public/admin/config.yml)

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) => projectsSchema(image),
})

const experience = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/experience' }),
  schema: experienceSchema,
})

const techStack = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/tech-stack' }),
  schema: techStackSchema,
})

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: ({ image }) => aboutSchema(image),
})

const site = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/site' }),
  schema: ({ image }) => siteSchema(image),
})

export const collections = { projects, experience, techStack, about, site }
