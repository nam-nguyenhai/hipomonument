<script setup lang="ts">
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
          class="monument-card group relative overflow-hidden rounded-lg border-2 border-tan-light bg-cream shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
        >
          <!-- Image Container -->
          <div class="relative overflow-hidden aspect-[4/3]">
            <NuxtImg
              :src="getImageUrl(monument.image?.url)"
              :alt="monument.image?.alternativeText || monument.title"
              class="w-full h-full object-cover sepia transition-all duration-500 group-hover:scale-110"
              loading="lazy"
            />

            <!-- Hover Overlay -->
            <NuxtLink
              :to="monument.slug ? `/${monument.slug}` : '#'"
              class="absolute inset-0 bg-gradient-to-t from-amber-900/80 via-amber-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6"
            >
              <span class="px-6 py-2 bg-white/95 text-amber-900 font-semibold rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white">
                {{ t('recommended.viewMore') }}
              </span>
            </NuxtLink>
          </div>

          <!-- Text Content -->
          <div class="p-5">
            <h3 class="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
              {{ monument.title }}
            </h3>
            <p v-if="monument.description" class="text-gray-600 text-sm leading-relaxed line-clamp-2">
              {{ monument.description }}
            </p>
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
