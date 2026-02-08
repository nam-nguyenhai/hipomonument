<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="w-full bg-brown-dark py-6 md:py-8">
    <div class="container mx-auto px-4 md:px-8">
      <div class="flex items-center justify-center gap-4 md:gap-8 lg:gap-12">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <!-- Mobile: Cropped logo -->
          <img
            src="/logo-faculty-cropped.png"
            :alt="t('partnership.facultyAlt')"
            class="h-10 sm:h-12 md:hidden w-auto object-contain"
          >
          <!-- Desktop: Full logo -->
          <img
            src="/logo-faculty.png"
            :alt="t('partnership.facultyAlt')"
            class="hidden md:block md:h-14 lg:h-16 w-auto object-contain"
          >
        </div>

        <!-- Vertical divider -->
        <div class="h-12 sm:h-14 md:h-16 lg:h-20 w-px bg-tan/30" />

        <!-- Text content -->
        <div class="flex flex-col justify-center text-cream">
          <p class="text-xs sm:text-sm md:text-base text-tan font-medium mb-1">
            {{ t('partnership.inCooperationWith') }}
          </p>
          <p class="text-sm sm:text-base md:text-lg font-semibold leading-tight">
            {{ t('partnership.universityName') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
