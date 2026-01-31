<script setup lang="ts">
import type { Monument } from '~/types/types'

const slug = useRouteParams('slug')

const { public: { baseURL } } = useRuntimeConfig()

const { data: monument } = await useAsyncData<Monument>(`monument-${slug.value}`, async () => {
  return await $fetch<Monument>(`${baseURL}/api/monuments/${slug.value}`)
})

// Convert oembed tags to iframes after component mounts
onMounted(() => {
  const oembeds = document.querySelectorAll('oembed[url]')
  oembeds.forEach((oembed) => {
    const url = oembed.getAttribute('url')
    if (url) {
      // Extract video ID from various YouTube URL formats
      let videoId = ''
      const embedMatch = url.split('youtube.com/embed/')
      const watchMatch = url.split('v=')
      const shortMatch = url.split('youtu.be/')

      if (url.includes('youtube.com/embed/') && embedMatch.length > 1 && embedMatch[1]) {
        videoId = embedMatch[1].split('?')[0] || ''
      }
      else if (url.includes('youtube.com/watch?v=') && watchMatch.length > 1 && watchMatch[1]) {
        videoId = watchMatch[1].split('&')[0] || ''
      }
      else if (url.includes('youtu.be/') && shortMatch.length > 1 && shortMatch[1]) {
        videoId = shortMatch[1].split('?')[0] || ''
      }

      if (videoId) {
        const iframe = document.createElement('iframe')
        iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}`)
        iframe.setAttribute('frameborder', '0')
        iframe.setAttribute('allowfullscreen', 'true')
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture')
        oembed.replaceWith(iframe)
      }
    }
  })
})
</script>

<template>
  <div v-if="monument" class="container mx-auto px-4 pb-16">
    <div class="max-w-prose lg:max-w-3xl mx-auto">
      <!-- Back Navigation -->
      <nav class="pt-6 pb-4">
        <NuxtLink
          to="/#map"
          class="inline-flex items-center gap-2 text-sm text-tan hover:text-brown-dark transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Zpět na mapu
        </NuxtLink>
      </nav>

      <!-- Content -->
      <article class="prose prose-brand">
        <h1>{{ monument.title }}</h1>
        <section v-html="monument.content" />
      </article>
    </div>
  </div>
</template>
