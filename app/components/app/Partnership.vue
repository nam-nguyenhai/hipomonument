<script setup lang="ts">
const { isVisible, targetElement } = useScrollAnimation({ threshold: 0.3 })
</script>

<template>
  <section ref="targetElement" class="w-full bg-[#2b1e17] py-6 md:py-8">
    <div class="container mx-auto px-4 md:px-8">
      <div
        class="flex items-center justify-center gap-4 md:gap-8 lg:gap-12 transition-all duration-700 ease-out"
        :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
      >
        <!-- Logo -->
        <div class="flex-shrink-0">
          <!-- Mobile: Cropped logo -->
          <img
            src="/logo-faculty-cropped.png"
            alt="Fakulta agrobiologie, potravinových a přírodních zdrojů"
            class="h-10 sm:h-12 md:hidden w-auto object-contain"
          >
          <!-- Desktop: Full logo -->
          <img
            src="/logo-faculty.png"
            alt="Fakulta agrobiologie, potravinových a přírodních zdrojů"
            class="hidden md:block md:h-14 lg:h-16 w-auto object-contain"
          >
        </div>

        <!-- Vertical divider -->
        <div class="h-12 sm:h-14 md:h-16 lg:h-20 w-px bg-[#c4a46e]/30" />

        <!-- Text content -->
        <div class="flex flex-col justify-center text-[#f7f4ef]">
          <p class="text-xs sm:text-sm md:text-base text-[#c4a46e] font-medium mb-1">
            Ve spolupráci s
          </p>
          <p class="text-sm sm:text-base md:text-lg font-semibold leading-tight">
            Českou zemědělskou univerzitou v Praze
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
