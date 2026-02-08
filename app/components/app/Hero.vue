<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="relative w-full bg-cream overflow-hidden">
    <div class="container mx-auto px-8">
      <div class="flex flex-col xl:flex-row items-center md:min-h-[700px] gap-12 xl:gap-16 py-16 xl:py-0">
        <div class="flex-1 space-y-6 xl:space-y-8">
          <div class="inline-block">
            <span class="inline-flex items-center gap-2 bg-gold/10 text-brown-dark px-4 py-2 rounded-full text-sm font-semibold border border-brown-dark/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ t('hero.badge') }}
            </span>
          </div>

          <div class="relative">
            <h1 class="text-4xl md:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
              {{ t('hero.title') }} <span class="relative inline-block">{{ t('hero.titleHighlight') }}</span>
            </h1>
          </div>

          <div class="flex items-center gap-3">
            <div class="h-1 w-24 bg-gold rounded-full" />
          </div>

          <div class="space-y-4">
            <p class="text-lg md:text-xl leading-relaxed">
              <span class="font-semibold text-gray-900">{{ t('hero.description1Bold') }}</span> {{ t('hero.description1Rest') }} <span class="font-semibold">{{ t('hero.description1Highlight') }}</span>.
            </p>
            <p class="text-lg md:text-xl leading-relaxed">
              {{ t('hero.description2Start') }} <span class="font-semibold text-gray-900">{{ t('hero.description2Bold') }}</span> {{ t('hero.description2End') }}
            </p>
          </div>

          <div class="flex gap-5 flex-wrap">
            <AppButton href="#map">
              {{ t('hero.showMap') }}
            </AppButton>

            <AppButton href="#recommended-places">
              {{ t('hero.showRecommended') }}
            </AppButton>
          </div>
        </div>

        <div class="hidden xl:flex flex-1 items-center justify-center xl:justify-end">
          <img
            src="/hero.webp"
            :alt="`${t('hero.title')} ${t('hero.titleHighlight')}`"
            class="w-full max-w-[500px] xl:max-w-[600px] h-auto object-contain"
          >
        </div>
      </div>
    </div>
  </section>
</template>
