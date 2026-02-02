<script setup lang="ts">
import { convertOembedToIframes } from '~/utils/youtube'

const slug = useRouteParams('slug')
const { t } = useI18n()
const localePath = useLocalePath()

const { monument, error } = await useMonument(slug)

if (error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('error.monumentNotFound'),
    fatal: true,
  })
}

useSeoMeta({
  title: () => monument.value?.title ? `${monument.value.title} | Hipomonument` : t('seo.title'),
  ogTitle: () => monument.value?.title || t('seo.title'),
  description: () => monument.value?.description || t('seo.description'),
  ogDescription: () => monument.value?.description || t('seo.description'),
  ogImage: () => monument.value?.carousel?.files?.[0]?.url || '/og-image.png',
  twitterCard: 'summary_large_image',
})

onMounted(convertOembedToIframes)
</script>

<template>
  <div v-if="monument" class="container mx-auto px-4 pb-16">
    <div class="max-w-prose lg:max-w-3xl mx-auto">
      <!-- Back Navigation -->
      <nav class="pt-6 pb-4">
        <NuxtLink
          :to="`${localePath('index')}#map`"
          class="inline-flex items-center gap-2 text-sm text-tan hover:text-brown-dark transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ t('nav.backToMap') }}
        </NuxtLink>
      </nav>

      <!-- Content -->
      <article class="prose prose-brand">
        <h1>{{ monument.title }}</h1>

        <!-- Image Carousel -->
        <AppImageCarousel
          v-if="monument.carousel?.files && monument.carousel.files.length > 0"
          :images="monument.carousel.files"
          :alt="monument.title"
          class="not-prose my-6"
        />

        <section v-html="monument.content" />
      </article>
    </div>
  </div>
</template>
