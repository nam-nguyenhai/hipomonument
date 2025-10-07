import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  ssr: false,

  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    'nuxt-lightningcss',
    '@nuxtjs/leaflet',
    '@nuxt/fonts',
  ],

  fonts: {
    families: [
      {
        name: 'Poppins',
        preload: true,
        global: true,
        display: 'swap',
        weights: [400, 500, 600, 700],
      },
    ],
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
