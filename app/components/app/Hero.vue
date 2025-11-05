<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isLoaded = ref(false)

onMounted(() => {
  // Trigger animations after component is mounted
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<template>
  <section class="relative w-full bg-cream overflow-hidden">
    <div class="container mx-auto px-8">
      <div class="flex flex-col lg:flex-row items-center md:min-h-[700px] gap-12 lg:gap-16 py-16 lg:py-0">
        <div class="flex-1 space-y-6 lg:space-y-8">
          <div
            class="inline-block transition-all duration-700 ease-out"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
          >
            <span class="inline-flex items-center gap-2 bg-[#d4af37]/10 text-[#2b1e17] px-4 py-2 rounded-full text-sm font-semibold border border-[#2b1e17]/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Interaktivní průvodce historií
            </span>
          </div>

          <div
            class="relative transition-all duration-700 ease-out delay-100"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
          >
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Po stopách <span class="relative inline-block">koní</span>
            </h1>
          </div>

          <div
            class="flex items-center gap-3 transition-all duration-700 ease-out delay-200"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
          >
            <div class="h-1 w-24 bg-[#d4af37] rounded-full" />
          </div>

          <div
            class="space-y-4 transition-all duration-700 ease-out delay-300"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
          >
            <p class="text-lg md:text-xl leading-relaxed">
              <span class="font-semibold text-gray-900">Interaktivní webová mapa</span> a průvodce po historických místech, která spojuje jeden motiv - <span class="font-semibold">koně</span>.
            </p>
            <p class="text-lg md:text-xl leading-relaxed">
              Objevuj <span class="font-semibold text-gray-900">sochy, památníky, jízdárny, závodiště</span> i zapomenutá místa, kde kůň sehrál důležitou roli v dějinách i kultuře.
            </p>
          </div>

          <div class="flex gap-5 flex-wrap">
            <BaseButton href="#map" :is-loaded="isLoaded">
              Zobrazit mapu
            </BaseButton>

            <BaseButton href="#recommended-places" :is-loaded="isLoaded">
              Zobrazit doporučená místa
            </BaseButton>
          </div>
        </div>

        <div
          class="hidden lg:flex flex-1 items-center justify-center lg:justify-end transition-all duration-1000 ease-out delay-200"
          :class="isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'"
        >
          <img
            src="/hero.webp"
            alt="Po stopách koní"
            class="w-full max-w-[500px] lg:max-w-[600px] h-auto object-contain"
          >
        </div>
      </div>
    </div>
  </section>
</template>
