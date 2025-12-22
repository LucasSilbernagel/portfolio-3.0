// @ts-check
import netlify from '@astrojs/netlify'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
  output: 'server', // Enable SSR for API routes; pages are still pre-rendered at build time
  adapter: netlify(),
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    icon(),
  ],
  site: 'https://lucassilbernagel.com',
  build: {
    // Inline all stylesheets to eliminate render-blocking requests
    // This will inline the main CSS bundle (~6.58KB) directly in the HTML,
    // removing the blocking request and improving critical path latency
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      cssCodeSplit: false, // Bundle all CSS into one file to reduce requests
      cssMinify: true, // Minify CSS for smaller file size
    },
  },
})
