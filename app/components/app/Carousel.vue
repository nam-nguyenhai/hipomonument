<script setup lang="ts">
import { computed, ref } from 'vue'

interface CarouselSlide {
  image: string
  title: string
  description: string
}

const props = defineProps<{
  slides: CarouselSlide[]
}>()

const currentIndex = ref(0)

const currentSlide = computed(() => props.slides[currentIndex.value])

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.slides.length
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + props.slides.length) % props.slides.length
}

function goToSlide(index: number) {
  currentIndex.value = index
}
</script>

<template>
  <div class="relative w-full">
    <!-- Carousel Container -->
    <div class="relative overflow-hidden bg-gray-900 h-[500px]">
      <!-- Slides -->
      <div class="relative size-full">
        <TransitionGroup name="slide">
          <div
            v-for="(slide, index) in slides"
            v-show="index === currentIndex"
            :key="index"
            class="absolute inset-0"
          >
            <img
              :src="slide.image"
              :alt="slide.title"
              class="size-full object-cover aspect-square"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </TransitionGroup>
      </div>

      <!-- Previous Button -->
      <button
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
        aria-label="Previous slide"
        @click="prev"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Next Button -->
      <button
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
        aria-label="Next slide"
        @click="next"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Dots Navigation -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        <button
          v-for="(slide, index) in slides"
          :key="index"
          class="w-3 h-3 rounded-full transition-all duration-300"
          :class="index === currentIndex ? 'bg-[#d4af37] w-8' : 'bg-white/50 hover:bg-white/70'"
          :aria-label="`Go to slide ${index + 1}`"
          @click="goToSlide(index)"
        />
      </div>
    </div>

    <!-- Text Content Below Carousel -->
    <div class="mt-8 px-4 max-w-6xl mx-auto">
      <div v-show="currentSlide" :key="currentIndex" class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          {{ currentSlide?.title }}
        </h2>
        <p class="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
          {{ currentSlide?.description }}
        </p>
      </div>
    </div>
  </div>
</template>
