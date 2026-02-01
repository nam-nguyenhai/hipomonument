<script setup lang="ts">
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()

// Get switch locale path without hash to avoid hydration mismatch
function getSwitchLocalePath(code: 'cs' | 'en') {
  const basePath = switchLocalePath(code)
  // Remove any hash from the path to ensure consistent SSR/client rendering
  return basePath.split('#')[0]
}

const isMenuOpen = ref(false)
const isScrolled = ref(false)
const isMapVisible = ref(false)

// Detect mobile/tablet devices (screens smaller than 1024px)
const isMobileOrTablet = useMediaQuery('(max-width: 1023px)')

const navItems = computed(() => [
  { label: t('nav.map'), href: `${localePath('index')}#map` },
  { label: t('nav.recommended'), href: `${localePath('index')}#recommended-places` },
])

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

let mapObserver: IntersectionObserver | null = null

// Setup scroll listener and map observer
function setupMobileListeners() {
  window.addEventListener('scroll', handleScroll)

  // Observe the map section to hide header when it's visible
  const mapSection = document.querySelector('.map-section')
  if (mapSection) {
    mapObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isMapVisible.value = entry.isIntersecting && entry.intersectionRatio > 0.3
        })
      },
      {
        threshold: [0, 0.3, 0.5, 1],
        rootMargin: '-80px 0px 0px 0px', // Account for header height
      },
    )
    mapObserver.observe(mapSection)
  }
}

// Cleanup scroll listener and map observer
function cleanupMobileListeners() {
  window.removeEventListener('scroll', handleScroll)
  if (mapObserver) {
    mapObserver.disconnect()
    mapObserver = null
  }
  // Reset visibility state when switching to desktop
  isMapVisible.value = false
  isScrolled.value = false
}

// Watch for changes in screen size and dynamically add/remove listeners
watch(isMobileOrTablet, (isMobile) => {
  if (import.meta.client) {
    if (isMobile) {
      setupMobileListeners()
    }
    else {
      cleanupMobileListeners()
    }
  }
}, { immediate: true })

onUnmounted(() => {
  cleanupMobileListeners()
})
</script>

<template>
  <header
    class="w-full sticky top-0 z-50 transition-all duration-500 bg-black"
    :class="{
      'shadow-lg': isScrolled,
      'md:translate-y-0 md:opacity-100 md:pointer-events-auto -translate-y-full opacity-0 pointer-events-none': isMapVisible && isMobileOrTablet,
    }"
  >
    <div class="mx-auto container text-white flex gap-8 justify-between items-center w-full py-2 md:py-4 px-4">
      <NuxtLink :to="localePath('index')" class="flex items-center gap-3">
        <AppLogo />
        <span class="hidden sm:block text-gray-400">|</span>
        <span class="hidden sm:block text-sm text-gray-300 italic">{{ t('nav.subtitle') }}</span>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex gap-8 items-center">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          class="hover:text-gold transition-all duration-300 relative group"
        >
          {{ item.label }}
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full" />
        </a>

        <!-- Language Switcher -->
        <div class="flex gap-2 ml-4 border-l border-gray-600 pl-4">
          <NuxtLink
            v-for="loc in locales"
            :key="loc.code"
            :to="getSwitchLocalePath(loc.code)"
            class="text-sm font-medium transition-colors duration-200 hover:text-gold"
            :class="locale === loc.code ? 'text-gold' : 'text-gray-400'"
          >
            {{ loc.code.toUpperCase() }}
          </NuxtLink>
        </div>
      </nav>

      <!-- Hamburger Button (Mobile) -->
      <button
        class="md:hidden z-50 p-2 transition-transform duration-200 hover:scale-110"
        aria-label="Toggle menu"
        @click="toggleMenu"
      >
        <svg
          v-if="!isMenuOpen"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 transition-transform duration-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 transition-transform duration-200 rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <Transition name="slide-down">
      <nav
        v-if="isMenuOpen"
        class="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 z-40"
      >
        <div class="container mx-auto px-4 py-6 flex flex-col gap-4">
          <a
            v-for="item in navItems"
            :key="item.label"
            :href="item.href"
            class="text-white hover:text-gold transition-colors py-2 text-lg"
            @click="closeMenu"
          >
            {{ item.label }}
          </a>

          <!-- Mobile Language Switcher -->
          <div class="flex gap-4 pt-4 border-t border-gray-700">
            <NuxtLink
              v-for="loc in locales"
              :key="loc.code"
              :to="getSwitchLocalePath(loc.code)"
              class="text-base font-medium transition-colors duration-200 hover:text-gold"
              :class="locale === loc.code ? 'text-gold' : 'text-gray-400'"
              @click="closeMenu"
            >
              {{ loc.name }}
            </NuxtLink>
          </div>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
