import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      // Controls display order on the Projects page (ascending)
      order: z.number(),
      projectName: z.string(),
      completedYear: z.string(),
      technologies: z.array(z.string()),
      description: z.string(),
      liveUrl: z.string().url(),
      githubUrl: z.string().url(),
      image: image(),
    }),
})

const experience = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(),
    position: z.string(),
    location: z.string(),
    website: z.string().url(),
    // Local dates in YYYY-MM-DD form (parsed as local time to avoid TZ drift)
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    // Empty (current role) is normalized to null so a blank CMS field is valid
    endDate: z
      .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(''), z.null()])
      .transform((value) => value || null)
      .default(null),
    highlights: z.array(z.string()),
  }),
})

const techStack = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/tech-stack' }),
  schema: z.object({
    // Controls display order of categories (ascending)
    order: z.number(),
    category: z.string(),
    items: z.array(z.string()),
  }),
})

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Ordered images positioned around the about card (max 4 used by layout)
      images: z.array(
        z.object({
          src: image(),
          alt: z.string(),
        })
      ),
    }),
})

const site = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/site' }),
  schema: ({ image }) =>
    z.object({
      profilePhoto: image(),
      profilePhotoAlt: z.string(),
      socialShareImage: image(),
      // Resume is served as a static file (not processed by astro:assets)
      resumeFile: z.string(),
      resumeFileName: z.string(),
      mapIframeSrc: z.string().url(),
    }),
})

export const collections = { projects, experience, techStack, about, site }
