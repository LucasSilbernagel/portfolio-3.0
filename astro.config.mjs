// @ts-check
import netlify from '@astrojs/netlify'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'

import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
  output: 'hybrid', // Enable hybrid mode: static pages by default, SSR for API routes
  adapter: netlify(),
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    icon(),
  ],
  site: 'https://lucassilbernagel.com',
  vite: {
    build: {
      cssCodeSplit: false,
    },
  },
})
