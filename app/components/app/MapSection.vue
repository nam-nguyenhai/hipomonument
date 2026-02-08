<script setup lang="ts">
import type { Monument } from '~/types/types'

defineProps<{
  monuments: Monument[]
}>()

const { t } = useI18n()
</script>

<template>
  <section class="map-section bg-cream py-16">
    <div class="container mx-auto px-4 md:px-8">
      <div class="text-center mb-8">
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

      <div class="rounded-[12px] border border-tan shadow-soft overflow-hidden bg-white">
        <ClientOnly>
          <AppMonumentsMap :monuments="monuments" />
          <template #fallback>
            <div class="w-full h-[600px] md:h-[700px] bg-gray-100 flex items-center justify-center">
              <p class="text-gray-500">
                {{ t('map.loading') }}
              </p>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>
