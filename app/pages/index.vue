<script setup lang="ts">
import type { FindMany, Monument } from '~/types/types'

const { public: { baseURL } } = useRuntimeConfig()

const { data: monuments } = await useAsyncData<Monument[]>('monuments', async () => {
  const response = await $fetch<FindMany<Monument>>(`${baseURL}/api/monuments?populate=*`)
  return response.data
})
</script>

<template>
  <AppHero />

  <AppPartnership />

  <AppMapSection id="map" :monuments="monuments || []" />

  <AppRecommendedPlaces id="recommended-places" />
</template>
