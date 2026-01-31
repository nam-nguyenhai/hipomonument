<script setup lang="ts">
import { monuments } from '~/data/monuments'

const { t } = useI18n()
const { isVisible, targetElement } = useScrollAnimation({ threshold: 0.15 })

// Select 6 interesting monuments for the recommended places
const recommendedPlaces = [
  {
    ...monuments.find(m => m.id === 1)!, // Pomník sv. Václava
    description: 'Ikonická jezdecká socha patrona Čech od Josefa Václava Myslbeka na Václavském náměstí.',
    image: '/hero.webp', // placeholder
  },
  {
    ...monuments.find(m => m.id === 2)!, // Jan Žižka
    description: 'Největší jezdecká socha na světě zobrazující husitského vojevůdce.',
    image: '/hero.webp', // placeholder
  },
  {
    ...monuments.find(m => m.id === 3)!, // Trigy na ND
    description: 'Dramatické sousoší trig symbolizující sílu českého umění a kultury.',
    image: '/hero.webp', // placeholder
  },
  {
    ...monuments.find(m => m.id === 8)!, // Trojský zámek
    description: 'Barokní konírna s unikátními freskami a historickou atmosférou.',
    image: '/hero.webp', // placeholder
  },
  {
    ...monuments.find(m => m.id === 7)!, // Jízdárna Pražského hradu
    description: 'Historická císařská jízdárna, dnes prostor pro výstavy a kulturní akce.',
    image: '/hero.webp', // placeholder
  },
  {
    ...monuments.find(m => m.id === 29)!, // Sv. Jiří
    description: 'Kopie gotické sochy sv. Jiří bojujícího s drakem na třetím nádvoří hradu.',
    image: '/hero.webp', // placeholder
  },
]
</script>

<template>
  <section ref="targetElement" class="py-16 bg-gradient-to-b from-white to-gray-50">
    <div class="container mx-auto px-4 md:px-8">
      <!-- Heading -->
      <div
        class="mb-12 text-center transition-all duration-700 ease-out"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
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

      <!-- Grid of Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <article
          v-for="(place, index) in recommendedPlaces"
          :key="place.id"
          class="monument-card group relative overflow-hidden rounded-lg border-2 border-tan-light bg-cream shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
          :style="{ transitionDelay: isVisible ? `${index * 100 + 200}ms` : '0ms' }"
        >
          <!-- Image Container -->
          <div class="relative overflow-hidden aspect-[4/3]">
            <img
              :src="place.image"
              :alt="place.name"
              class="w-full h-full object-cover sepia transition-all duration-500 group-hover:scale-110"
            >

            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-amber-900/80 via-amber-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
              <button class="px-6 py-2 bg-white/95 text-amber-900 font-semibold rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white">
                {{ t('recommended.viewMore') }}
              </button>
            </div>
          </div>

          <!-- Text Content -->
          <div class="p-5">
            <h3 class="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
              {{ place.shortName || place.name }}
            </h3>
            <p class="text-gray-600 text-sm leading-relaxed line-clamp-2">
              {{ place.description }}
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
