import { z } from 'astro/zod'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import {
  aboutSchema,
  experienceSchema,
  projectsSchema,
  siteSchema,
  techStackSchema,
} from './content-schemas'

// The content model is defined twice: once as Zod schemas (validated at
// build time) and once in the Sveltia CMS config (drives the editing UI).
// Nothing else enforces that they match, so this test fails on drift in
// either field names or requiredness. A field present in only one place, or
// one that is optional in the CMS (`required: false`) but required in Zod,
// would otherwise surface as an uneditable field or a build that breaks the
// moment an editor saves without it. Requiredness is encoded in the field
// signature as a trailing `?` so a single assertion covers both.

type CmsField = {
  name: string
  required?: boolean
  fields?: CmsField[]
  // Sveltia string-widget validation: [regex, error message]
  pattern?: [string, string]
  // datetime widget storage format
  format?: string
}

type CmsCollection = {
  name: string
  fields?: CmsField[]
  files?: { name: string; fields: CmsField[] }[]
}

const configUrl = new URL('../../public/admin/config.yml', import.meta.url)
const config = parse(readFileSync(configUrl, 'utf8')) as {
  collections: CmsCollection[]
}

const getCmsCollection = (name: string): CmsCollection => {
  const collection = config.collections.find((c) => c.name === name)
  if (!collection) {
    throw new Error(`Collection "${name}" not found in public/admin/config.yml`)
  }
  return collection
}

const getCmsFields = (collection: CmsCollection): CmsField[] => {
  // File collections (singletons) nest their fields under files[0]
  const fields = collection.files?.[0]?.fields ?? collection.fields
  if (!fields) {
    throw new Error(`Collection "${collection.name}" has no fields`)
  }
  return fields
}

const findField = (collectionName: string, fieldName: string): CmsField => {
  const field = getCmsFields(getCmsCollection(collectionName)).find(
    (f) => f.name === fieldName
  )
  if (!field) {
    throw new Error(`Field "${fieldName}" not found in "${collectionName}"`)
  }
  return field
}

const HTTPS_PATTERN = '^https?://'

// Field signature: the name, plus a trailing `?` when the field is optional,
// so name and requiredness are compared together. Sveltia fields are required
// unless `required: false`; Zod fields are optional when they accept a missing
// value (`.optional()` or `.default()`). 'body' is the markdown body, not a
// frontmatter field, so it has no counterpart in the Zod schemas.
const cmsFieldSignatures = (fields: CmsField[]): string[] =>
  fields
    .filter((field) => field.name !== 'body')
    .map((field) => `${field.name}${field.required === false ? '?' : ''}`)
    .toSorted()

const zodFieldSignatures = (schema: z.AnyZodObject): string[] =>
  Object.entries(schema.shape)
    .map(
      ([name, value]) =>
        `${name}${(value as z.ZodTypeAny).isOptional() ? '?' : ''}`
    )
    .toSorted()

// Stand-in for the image() helper Astro passes to collection schemas; only
// the field names matter here
const image = () => z.string()

describe('Sveltia config matches the content collection schemas', () => {
  it('projects fields match', () => {
    expect(
      cmsFieldSignatures(getCmsFields(getCmsCollection('projects')))
    ).toEqual(zodFieldSignatures(projectsSchema(image)))
  })

  it('experience fields match', () => {
    expect(
      cmsFieldSignatures(getCmsFields(getCmsCollection('experience')))
    ).toEqual(zodFieldSignatures(experienceSchema))
  })

  it('tech stack fields match', () => {
    expect(
      cmsFieldSignatures(getCmsFields(getCmsCollection('techStack')))
    ).toEqual(zodFieldSignatures(techStackSchema))
  })

  it('about page fields match', () => {
    expect(cmsFieldSignatures(getCmsFields(getCmsCollection('about')))).toEqual(
      zodFieldSignatures(aboutSchema(image))
    )
  })

  it('about page nested image fields match', () => {
    const imagesField = getCmsFields(getCmsCollection('about')).find(
      (field) => field.name === 'images'
    )
    expect(imagesField?.fields).toBeDefined()
    expect(cmsFieldSignatures(imagesField?.fields ?? [])).toEqual(
      zodFieldSignatures(aboutSchema(image).shape.images.element)
    )
  })

  it('site settings fields match', () => {
    expect(cmsFieldSignatures(getCmsFields(getCmsCollection('site')))).toEqual(
      zodFieldSignatures(siteSchema(image))
    )
  })

  // Field names/requiredness matching is not enough: the Zod schemas lean on
  // guards that only exist in the CMS config. A URL field whose `pattern` is
  // dropped, or a date field whose `format` drifts off YYYY-MM-DD, would still
  // pass every test above but break a save or a build. These assert the guards
  // the schemas depend on are actually present.

  // Every httpUrl() field in content-schemas.ts must carry the matching
  // save-time pattern guard so CMS edits are held to the same contract as the
  // build-time regex in httpUrl()
  it.each([
    ['projects', 'liveUrl'],
    ['projects', 'githubUrl'],
    ['experience', 'website'],
    ['site', 'mapIframeSrc'],
  ])('%s.%s carries the https URL pattern guard', (collection, field) => {
    expect(findField(collection, field).pattern?.[0]).toBe(HTTPS_PATTERN)
  })

  // The experience date regex (/^\d{4}-\d{2}-\d{2}$/) and local-date parsing
  // both assume the CMS writes YYYY-MM-DD; guard against a format drift
  it.each([['startDate'], ['endDate']])(
    'experience.%s is stored as YYYY-MM-DD',
    (field) => {
      expect(findField('experience', field).format).toBe('YYYY-MM-DD')
    }
  )

  it('every CMS collection has a schema counterpart', () => {
    const schemaCollections = [
      'projects',
      'experience',
      'techStack',
      'about',
      'site',
    ].toSorted()
    expect(config.collections.map((c) => c.name).toSorted()).toEqual(
      schemaCollections
    )
  })
})
