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
      `${baseURL}/api/monuments?populate=*&locale=${locale.value}&pagination[pageSize]=1000`,
    )
    return response.data
  },
  { watch: [locale] },
)

// Shared state for selected monument (to zoom to on map)
const selectedMonument = ref<Monument | null>(null)

// Handle monument selection from recommended places
function handleMonumentSelect(monument: Monument) {
  selectedMonument.value = monument
  // Scroll to map section
  nextTick(() => {
    const mapElement = document.getElementById('map')
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}
</script>

<template>
  <AppHero />

  <AppPartnership />

  <AppMapSection id="map" :monuments="monuments || []" :selected-monument="selectedMonument" />

  <AppRecommendedPlaces id="recommended-places" @select-monument="handleMonumentSelect" />
</template>
