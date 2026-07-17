import { getEntry } from 'astro:content'

/**
 * Load the site settings singleton, failing the build with a descriptive
 * error if the entry is missing (e.g. the file was renamed or deleted).
 */
export const getSiteSettings = async () => {
  const site = await getEntry('site', 'settings')
  if (!site) {
    throw new Error(
      'Site settings entry not found: expected src/content/site/settings.md'
    )
  }
  return site
}

/**
 * Load the About page singleton, failing the build with a descriptive
 * error if the entry is missing.
 */
export const getAboutPage = async () => {
  const about = await getEntry('about', 'about')
  if (!about) {
    throw new Error(
      'About page entry not found: expected src/content/about/about.md'
    )
  }
  return about
}
