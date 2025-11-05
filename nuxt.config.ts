import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxtjs/leaflet',
    '@nuxt/fonts',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    public: {
      baseURL: process.env.NUXT_BASE_URL,
    },
  },

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

  css: [
    '~/assets/css/main.css',
    'leaflet/dist/leaflet.css',
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
    css: {
      postcss: {
        plugins: [],
      },
    },
    optimizeDeps: {
      include: ['leaflet'],
    },
  },
})
