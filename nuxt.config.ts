import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  features: {
    inlineStyles: false,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'cs' },
      title: 'Hipomonument | Po stopách koní',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Objevte historické jezdecké památky v České republice. Interaktivní mapa a průvodce po hipomonumentech.' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Hipomonument' },
        { property: 'og:title', content: 'Hipomonument | Po stopách koní' },
        { property: 'og:description', content: 'Objevte historické jezdecké památky v České republice. Interaktivní mapa a průvodce po hipomonumentech.' },
        { property: 'og:image', content: '/og-image.png' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Hipomonument | Po stopách koní' },
        { name: 'twitter:description', content: 'Objevte historické jezdecké památky v České republice.' },
        { name: 'twitter:image', content: '/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxtjs/leaflet',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
  ],

  leaflet: {
    markerCluster: true,
  },

  i18n: {
    locales: [
      { code: 'cs', name: 'Čeština', language: 'cs-CZ', file: 'cs.json' },
      { code: 'en', name: 'English', language: 'en-US', file: 'en.json' },
    ],
    defaultLocale: 'cs',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

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
