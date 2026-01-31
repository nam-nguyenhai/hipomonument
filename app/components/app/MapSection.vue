<script setup lang="ts">
import type { Monument } from '~/types/types'

defineProps<{
  monuments: Monument[]
}>()

const { t } = useI18n()
const { isVisible, targetElement } = useScrollAnimation({ threshold: 0.2 })
</script>

<template>
  <section ref="targetElement" class="map-section bg-cream py-16">
    <div class="container mx-auto px-4 md:px-8">
      <div
        class="text-center mb-8 transition-all duration-700 ease-out"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <h2 class="text-3xl md:text-4xl font-bold text-brown-dark">
          {{ t('map.title') }}
        </h2>
        <p class="text-sm md:text-base text-brown-dark/80 mt-3">
          {{ t('map.subtitle') }}
        </p>
        <div class="flex items-center justify-center gap-3 mt-4">
          <div class="h-1 w-12 bg-gold rounded-full" />
          <div class="h-1 w-6 bg-gold/50 rounded-full" />
        </div>
      </div>

      <div
        class="rounded-[12px] border border-tan shadow-soft overflow-hidden bg-white transition-all duration-700 ease-out delay-200"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <AppMonumentsMap :monuments="monuments" />
      </div>
    </div>
  </section>
</template>
