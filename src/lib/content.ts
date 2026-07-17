import { getImage } from 'astro:assets'
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

// OG images standard size is 1200x630px, so optimize for 1200px width
const OG_IMAGE_OPTIMIZED_WIDTH = 1200

/**
 * Build the absolute URL for the social share image from site settings.
 * Social crawlers require an absolute URL.
 */
export const getOgImageUrl = async (siteUrl: string): Promise<string> => {
  const site = await getSiteSettings()
  const socialShareImage = await getImage({
    src: site.data.socialShareImage,
    width: OG_IMAGE_OPTIMIZED_WIDTH,
    format: 'webp',
  })
  return new URL(socialShareImage.src, siteUrl).href
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
