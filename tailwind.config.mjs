import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          blue: '#0066CC',
          yellow: '#FFD700',
          white: '#FFFFFF',
          'dark-gray': '#1F2937',
          'light-gray': '#F3F4F6',
          'success-green': '#10B981',
          'error-red': '#EF4444',
        },
      },
      fontFamily: {
        terminal: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'progress-bar': 'progressBar 2s ease-in-out',
      },
      keyframes: {
        progressBar: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [typography],
}
