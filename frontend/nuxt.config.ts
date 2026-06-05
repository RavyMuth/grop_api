export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  tailwindcss: {
    configPath: '~/tailwind.config.js',
    cssPath: '~/assets/css/main.css',
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:4000',
    },
  },
  compatibilityDate: '2026-06-05',
})
