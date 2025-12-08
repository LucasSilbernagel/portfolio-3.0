import * as fs from 'fs'
import * as path from 'path'

function ensureUploadsDirectory() {
  const publicDir = path.resolve(process.cwd(), 'public')
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads')
  
  try {
    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
      console.log(`Created public directory: ${publicDir}`)
    }
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
      console.log(`Created uploads directory: ${uploadsDir}`)
    }
  } catch (error) {
    console.error('Error creating uploads directory:', error)
    // Don't throw - let Strapi continue, but log the error
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi } */) {
    // Ensure uploads directory exists before plugins initialize
    ensureUploadsDirectory()
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi } */) {
    // Ensure uploads directory exists as a fallback
    ensureUploadsDirectory()
  },
}

