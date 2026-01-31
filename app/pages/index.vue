<script setup lang="ts">
import type { FindMany, Monument } from '~/types/types'

const { t, locale } = useI18n()
const { public: { baseURL } } = useRuntimeConfig()

// SEO
useSeoMeta({
  title: () => t('seo.title'),
  ogTitle: () => t('seo.title'),
  description: () => t('seo.description'),
  ogDescription: () => t('seo.description'),
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
})

const { data: monuments } = await useAsyncData<Monument[]>(
  `monuments-${locale.value}`,
  async () => {
    const response = await $fetch<FindMany<Monument>>(
      `${baseURL}/api/monuments?populate=*&locale=${locale.value}`,
    )
    return response.data
  },
  { watch: [locale] },
)
</script>

<template>
  <AppHero />

  <AppPartnership />

  <AppMapSection id="map" :monuments="monuments || []" />

  <AppRecommendedPlaces id="recommended-places" />
</template>
