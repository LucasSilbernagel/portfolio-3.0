import { getViteConfig } from 'astro/config'

export default getViteConfig({
  test: {
    globals: true,
    environment: 'node',
    // No unit tests currently; the previous suite only covered the removed
    // Strapi data layer. Keep the runner green until unit coverage is re-added.
    passWithNoTests: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/pages/**',
        'src/layouts/**',
        'src/components/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
      ],
    },
  },
} as Parameters<typeof getViteConfig>[0])
