<script setup lang="ts">
const isMenuOpen = ref(false)

const navItems = [
  { label: 'O projektu', href: '#' },
  { label: 'Mapa', href: '#map' },
  { label: 'Doporučená místa', href: '#' },
]

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<template>
  <header class="w-full sticky top-0 z-50 transition-all duration-300 bg-black">
    <div class="mx-auto container text-white flex gap-8 justify-between items-center w-full py-2 md:py-4 px-4">
      <AppLogo />

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex gap-8">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          class="hover:text-[#d4af37] transition-colors"
        >
          {{ item.label }}
        </a>
      </nav>

      <!-- Hamburger Button (Mobile) -->
      <button
        class="md:hidden z-50 p-2"
        aria-label="Toggle menu"
        @click="toggleMenu"
      >
        <svg
          v-if="!isMenuOpen"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
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
            class="text-white hover:text-[#d4af37] transition-colors py-2 text-lg"
            @click="closeMenu"
          >
            {{ item.label }}
          </a>
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
