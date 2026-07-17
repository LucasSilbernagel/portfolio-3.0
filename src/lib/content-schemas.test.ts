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
// Nothing else enforces that they match, so this test fails on field-name
// drift: a field added in only one place would otherwise surface as either
// an uneditable field or a broken production build.

type CmsField = {
  name: string
  fields?: CmsField[]
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

// 'body' is the markdown body, not a frontmatter field, so it has no
// counterpart in the Zod schemas
const cmsFieldNames = (fields: CmsField[]): string[] =>
  fields
    .map((field) => field.name)
    .filter((name) => name !== 'body')
    .toSorted()

const zodFieldNames = (schema: z.AnyZodObject): string[] =>
  Object.keys(schema.shape).toSorted()

// Stand-in for the image() helper Astro passes to collection schemas; only
// the field names matter here
const image = () => z.string()

describe('Sveltia config matches the content collection schemas', () => {
  it('projects fields match', () => {
    expect(cmsFieldNames(getCmsFields(getCmsCollection('projects')))).toEqual(
      zodFieldNames(projectsSchema(image))
    )
  })

  it('experience fields match', () => {
    expect(cmsFieldNames(getCmsFields(getCmsCollection('experience')))).toEqual(
      zodFieldNames(experienceSchema)
    )
  })

  it('tech stack fields match', () => {
    expect(cmsFieldNames(getCmsFields(getCmsCollection('techStack')))).toEqual(
      zodFieldNames(techStackSchema)
    )
  })

  it('about page fields match', () => {
    expect(cmsFieldNames(getCmsFields(getCmsCollection('about')))).toEqual(
      zodFieldNames(aboutSchema(image))
    )
  })

  it('about page nested image fields match', () => {
    const imagesField = getCmsFields(getCmsCollection('about')).find(
      (field) => field.name === 'images'
    )
    expect(imagesField?.fields).toBeDefined()
    expect(cmsFieldNames(imagesField?.fields ?? [])).toEqual(
      zodFieldNames(aboutSchema(image).shape.images.element)
    )
  })

  it('site settings fields match', () => {
    expect(cmsFieldNames(getCmsFields(getCmsCollection('site')))).toEqual(
      zodFieldNames(siteSchema(image))
    )
  })

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
