import { z } from 'astro/zod'

// Frontmatter schemas for the content collections, kept in a plain module
// (importable outside Astro's virtual `astro:content`) so unit tests can
// verify they stay in sync with the Sveltia CMS config.
//
// IMPORTANT: public/admin/config.yml defines the same content model for the
// CMS editing UI. If you add, remove, or rename a field here, update
// config.yml to match (and vice versa) - content-schemas.test.ts fails the
// build on any field-name drift.

// Matches the `image()` helper Astro passes to collection schemas; tests
// substitute a plain string schema
type ImageFn<T extends z.ZodTypeAny> = () => T

export const projectsSchema = <T extends z.ZodTypeAny>(image: ImageFn<T>) =>
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
  })

export const experienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  location: z.string(),
  website: z.string().url(),
  // Local dates in YYYY-MM-DD form (parsed as local time to avoid TZ drift)
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // A current role has no end date. Sveltia writes an empty string when the
  // datetime field is cleared, so the `z.literal('')` branch must stay in
  // this union; both '' and a missing field are normalized to null
  endDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(''), z.null()])
    .transform((value) => value || null)
    .default(null),
  highlights: z.array(z.string()),
})

export const techStackSchema = z.object({
  // Controls display order of categories (ascending)
  order: z.number(),
  category: z.string(),
  items: z.array(z.string()),
})

// The about page layout only has four image position slots
const MAX_ABOUT_IMAGES = 4

export const aboutSchema = <T extends z.ZodTypeAny>(image: ImageFn<T>) =>
  z.object({
    title: z.string(),
    // Ordered images positioned around the about card; capped to the
    // layout's position slots to keep manual edits honest
    images: z
      .array(
        z.object({
          src: image(),
          alt: z.string(),
        })
      )
      .max(MAX_ABOUT_IMAGES),
  })

export const siteSchema = <T extends z.ZodTypeAny>(image: ImageFn<T>) =>
  z.object({
    profilePhoto: image(),
    profilePhotoAlt: z.string(),
    socialShareImage: image(),
    // Resume is served as a static file from public/ (not processed by
    // astro:assets), so the schema can only require a root-relative path;
    // the resume-download e2e test verifies the file is actually served
    resumeFile: z.string().startsWith('/'),
    resumeFileName: z.string(),
    mapIframeSrc: z.string().url(),
  })
