<script setup lang="ts">
import type { FindMany, Monument } from '~/types/types'

const { locale } = useI18n()
const { public: { baseURL } } = useRuntimeConfig()

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
