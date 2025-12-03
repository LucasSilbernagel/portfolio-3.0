const fs = require('fs')
const path = require('path')

const publicDir = path.join(__dirname, '..', 'public')
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads')

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
  console.log(`Created public directory: ${publicDir}`)
}

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log(`Created uploads directory: ${uploadsDir}`)
} else {
  console.log(`Uploads directory already exists: ${uploadsDir}`)
}

