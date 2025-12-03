const fs = require('fs')
const path = require('path')

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log(`Created uploads directory: ${uploadsDir}`)
} else {
  console.log(`Uploads directory already exists: ${uploadsDir}`)
}

