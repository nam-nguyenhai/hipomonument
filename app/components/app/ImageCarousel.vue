<script setup lang="ts">
import type { Media } from '~/types/types'
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Props {
  images: Media[]
  alt?: string
}

const props = defineProps<Props>()

const currentIndex = ref(0)
const isLightboxOpen = ref(false)
const touchStartX = ref(0)
const touchEndX = ref(0)

const currentImage = computed(() => props.images[currentIndex.value])

const hasMultipleImages = computed(() => props.images.length > 1)

function getImageUrl(image: Media, size: 'thumbnail' | 'small' | 'medium' | 'large' | 'original' = 'original'): string | undefined {
  if (size === 'original') {
    return getStrapiMedia(image.url) ?? undefined
  }
  return getStrapiMedia(image.formats?.[size]?.url || image.url) ?? undefined
}

function next() {
  if (!hasMultipleImages.value)
    return
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

function prev() {
  if (!hasMultipleImages.value)
    return
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

function goToSlide(index: number) {
  currentIndex.value = index
}

function openLightbox(index?: number) {
  if (typeof index === 'number') {
    currentIndex.value = index
  }
  isLightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  isLightboxOpen.value = false
  document.body.style.overflow = ''
}

// Touch handlers for swipe support
function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0]?.clientX || 0
}

function handleTouchMove(e: TouchEvent) {
  touchEndX.value = e.touches[0]?.clientX || 0
}

function handleTouchEnd() {
  const swipeThreshold = 50
  const diff = touchStartX.value - touchEndX.value

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      next()
    }
    else {
      prev()
    }
  }
  touchStartX.value = 0
  touchEndX.value = 0
}

// Keyboard navigation
function handleKeydown(e: KeyboardEvent) {
  if (!isLightboxOpen.value)
    return

  switch (e.key) {
    case 'ArrowLeft':
      prev()
      break
    case 'ArrowRight':
      next()
      break
    case 'Escape':
      closeLightbox()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="images && images.length > 0" class="image-carousel">
    <!-- Main Carousel -->
    <div
      class="relative overflow-hidden rounded-xl bg-gray-900"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Main Image Display -->
      <div class="relative aspect-[4/3] md:aspect-[3/2] lg:aspect-[16/9]">
        <TransitionGroup name="fade">
          <div
            v-for="(image, index) in images"
            v-show="index === currentIndex"
            :key="image.id"
            class="absolute inset-0"
          >
            <img
              :src="getImageUrl(image, 'large')"
              :alt="image.alternativeText || alt || `Obrázek ${index + 1}`"
              class="size-full object-contain bg-gray-900 cursor-zoom-in"
              loading="lazy"
              @click="openLightbox(index)"
            >
          </div>
        </TransitionGroup>

        <!-- Image Counter -->
        <div
          v-if="hasMultipleImages"
          class="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium"
        >
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Fullscreen Button -->
        <button
          class="absolute top-3 left-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
          aria-label="Zobrazit na celou obrazovku"
          @click="openLightbox()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        <!-- Navigation Arrows -->
        <template v-if="hasMultipleImages">
          <button
            class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Předchozí obrázek"
            @click="prev"
          >
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Další obrázek"
            @click="next"
          >
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </template>
      </div>
    </div>

    <!-- Thumbnail Strip -->
    <div v-if="hasMultipleImages" class="mt-3">
      <div class="flex gap-3 overflow-x-auto p-1 scrollbar-thin">
        <button
          v-for="(image, index) in images"
          :key="image.id"
          class="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all duration-200"
          :class="[
            index === currentIndex
              ? 'ring-2 ring-gold ring-offset-2 opacity-100'
              : 'opacity-60 hover:opacity-100 ring-1 ring-gray-200',
          ]"
          :aria-label="`Přejít na obrázek ${index + 1}`"
          @click="goToSlide(index)"
        >
          <img
            :src="getImageUrl(image, 'thumbnail')"
            :alt="image.alternativeText || `Náhled ${index + 1}`"
            class="size-full object-cover"
            loading="lazy"
          >
        </button>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="isLightboxOpen"
          class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          @click.self="closeLightbox"
        >
          <!-- Close Button -->
          <button
            class="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
            aria-label="Zavřít"
            @click="closeLightbox"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Image Counter in Lightbox -->
          <div
            v-if="hasMultipleImages"
            class="absolute top-4 left-4 text-white/80 text-lg font-medium"
          >
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>

          <!-- Main Lightbox Image -->
          <div
            class="relative w-full h-full flex items-center justify-center p-4 md:p-12"
            @click.self="closeLightbox"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <img
              v-if="currentImage"
              :src="getImageUrl(currentImage, 'original')"
              :alt="currentImage.alternativeText || alt || `Obrázek ${currentIndex + 1}`"
              class="max-w-full max-h-full object-contain"
              @click.stop
            >
          </div>

          <!-- Lightbox Navigation -->
          <template v-if="hasMultipleImages">
            <button
              class="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-colors"
              aria-label="Předchozí obrázek"
              @click="prev"
            >
              <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              class="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-colors"
              aria-label="Další obrázek"
              @click="next"
            >
              <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </template>

          <!-- Lightbox Thumbnails (Desktop only) -->
          <div
            v-if="hasMultipleImages"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex gap-2 max-w-[80%] overflow-x-auto pb-2"
          >
            <button
              v-for="(image, index) in images"
              :key="image.id"
              class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200"
              :class="[
                index === currentIndex
                  ? 'ring-2 ring-white opacity-100'
                  : 'opacity-50 hover:opacity-100',
              ]"
              :aria-label="`Přejít na obrázek ${index + 1}`"
              @click="goToSlide(index)"
            >
              <img
                :src="getImageUrl(image, 'thumbnail')"
                :alt="image.alternativeText || `Náhled ${index + 1}`"
                class="size-full object-cover"
              >
            </button>
          </div>

          <!-- Mobile Dots Navigation -->
          <div
            v-if="hasMultipleImages"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 flex md:hidden gap-2"
          >
            <button
              v-for="(image, index) in images"
              :key="image.id"
              class="w-2 h-2 rounded-full transition-all duration-200"
              :class="[
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/40',
              ]"
              :aria-label="`Přejít na obrázek ${index + 1}`"
              @click="goToSlide(index)"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Fade transition for main carousel */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Lightbox transition */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

/* Custom scrollbar for thumbnail strip */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #9ca3af transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #9ca3af;
  border-radius: 3px;
}
</style>
