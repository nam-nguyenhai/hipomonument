<script setup lang="ts">
import type { Monument } from '~/types/types'

const emit = defineEmits<{
  selectMonument: [monument: Monument]
}>()

const { t } = useI18n()
const { public: { baseURL } } = useRuntimeConfig()

// Fetch recommended monuments from API
const { monuments, error, isLoading, isEmpty } = useRecommendedMonuments()

// Helper to get full image URL from Strapi
function getImageUrl(imageUrl?: string) {
  if (!imageUrl)
    return '/hero.webp' // fallback
  return imageUrl.startsWith('http') ? imageUrl : `${baseURL}${imageUrl}`
}

// Handle show on map button click
function handleShowOnMap(monument: Monument) {
  emit('selectMonument', monument)
}
</script>

<template>
  <section class="py-16 bg-gradient-to-b from-white to-gray-50">
    <div class="container mx-auto px-4 md:px-8">
      <!-- Heading -->
      <div class="mb-12 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          {{ t('recommended.title') }}
        </h2>
        <div class="flex items-center justify-center gap-3 mb-6">
          <div class="h-1 w-12 bg-gold rounded-full" />
          <div class="h-1 w-6 bg-gold/50 rounded-full" />
        </div>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          {{ t('recommended.subtitle') }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <p class="text-gray-600">
            {{ t('recommended.loading') }}
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <div class="max-w-md mx-auto">
          <div class="text-6xl mb-4">
            ⚠️
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">
            {{ t('recommended.error') }}
          </h3>
          <p class="text-gray-600 mb-6">
            {{ t('recommended.errorMessage') }}
          </p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="isEmpty" class="text-center py-20">
        <div class="max-w-md mx-auto">
          <div class="text-6xl mb-4">
            🏛️
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">
            {{ t('recommended.empty') }}
          </h3>
          <p class="text-gray-600">
            {{ t('recommended.emptyMessage') }}
          </p>
        </div>
      </div>

      <!-- Grid of Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <article
          v-for="monument in monuments"
          :key="monument.documentId || monument.id"
          class="monument-card group flex flex-col overflow-hidden rounded-lg border-2 border-tan-light bg-cream shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <!-- Image Container -->
          <div class="relative overflow-hidden aspect-[4/3]">
            <NuxtImg
              :src="getImageUrl(monument.image?.url)"
              :alt="monument.image?.alternativeText || monument.title"
              class="w-full h-full object-cover sepia transition-all duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>

          <!-- Text Content -->
          <div class="flex-1 p-5 flex flex-col">
            <h3 class="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
              {{ monument.title }}
            </h3>
            <div v-if="monument.description" class="mb-4 flex-1">
              <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {{ monument.description }}
              </p>
              <NuxtLink
                v-if="monument.slug"
                :to="`/${monument.slug}`"
                class="text-gold hover:text-gold-dark text-sm font-semibold hover:underline transition-colors duration-200 inline-block mt-1"
              >
                {{ t('recommended.readMore') }}
              </NuxtLink>
            </div>

            <!-- Action Button -->
            <button
              class="w-full px-4 py-2.5 bg-gold text-amber-900 font-semibold rounded-lg shadow-md transition-all duration-200 hover:bg-gold-dark hover:shadow-lg flex items-center justify-center gap-2 mt-auto"
              @click="handleShowOnMap(monument)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>{{ t('recommended.showOnMap') }}</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Sepia tone filter */
.sepia {
  filter: sepia(0.4) contrast(1.1);
}

.monument-card {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(139, 69, 19, 0.1);
}

.monument-card:hover {
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.15),
    0 5px 10px rgba(139, 69, 19, 0.15);
}
</style>
