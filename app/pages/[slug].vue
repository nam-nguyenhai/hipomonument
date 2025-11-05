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
  <div v-if="monument" class="container prose mx-auto px-4 pb-16">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
      {{ monument.title }}
    </h1>
    <section v-html="monument.content" />
  </div>
</template>

<style>
.prose {
  color: #2b1e17;
  line-height: 1.7;
  font-family: var(--font-family-poppins), system-ui, sans-serif;
  max-width: 75ch;
  margin: 0 auto;
}

/* Nadpisy */
.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: #2b1e17;
  margin-top: 1.8em;
  margin-bottom: 0.6em;
  line-height: 1.3;
}

.prose h1 {
  font-size: 2.2rem;
  border-bottom: 1px solid #c4a46e;
  padding-bottom: 0.3rem;
}
.prose h2 {
  font-size: 1.7rem;
  color: #2b1e17;
}
.prose h3 {
  font-size: 1.3rem;
  color: #3a2b1f;
}

/* Odstavce */
.prose p {
  margin: 1rem 0;
}

/* Odkazy */
.prose a {
  color: #c4a46e;
  text-decoration: none;
  border-bottom: 1px solid #c4a46e;
  transition: all 0.2s ease;
}
.prose a:hover {
  color: #2b1e17;
  border-color: #2b1e17;
}

/* Citace */
.prose blockquote {
  border-left: 3px solid #c4a46e;
  background-color: #f7f4ef;
  padding: 0.75rem 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  border-radius: 6px;
  color: #2b1e17;
}

/* Seznamy */
.prose ul,
.prose ol {
  margin: 1rem 0 1rem 1.5rem;
  padding-left: 1rem;
}
.prose li {
  margin: 0.4rem 0;
}
.prose ul li::marker {
  color: #c4a46e;
}

/* Obrázky */
.prose img {
  display: block;
  margin: 1.5rem auto;
  border-radius: 8px;
  max-width: 100%;
  height: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* YouTube/Video embeds */
.prose iframe {
  display: block;
  margin: 1.5rem auto;
  max-width: 100%;
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Responsive video container */
.prose .video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  max-width: 100%;
  margin: 1.5rem auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.prose .video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  box-shadow: none;
}

/* Figure a popisky */
.prose figure {
  text-align: center;
  margin: 1.25rem 0;
}

/* Media figure for embeds */
.prose figure.media {
  margin: 1.5rem auto;
  max-width: 100%;
}

.prose figure.media iframe {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.prose figcaption {
  font-size: 0.9rem;
  color: #5a4b3e;
  font-style: italic;
  margin-top: 0.4rem;
}

/* Tabulky */
.prose table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5rem 0;
  border-radius: 6px;
  overflow: hidden;
}
.prose th,
.prose td {
  border: 1px solid #e0d8c6;
  padding: 0.6rem 0.75rem;
  text-align: left;
}
.prose thead th {
  background-color: #efe9de;
  font-family: "Cormorant Garamond", serif;
  font-weight: 600;
}

/* Kód */
.prose code {
  background: #f1ede6;
  color: #2b1e17;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  font-size: 0.95em;
}
.prose pre {
  background: #1d1611;
  color: #f7f4ef;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.9rem;
}

/* Oddělovací čára */
.prose hr {
  border: none;
  border-top: 1px solid #c4a46e;
  opacity: 0.6;
  margin: 2rem 0;
}

/* Zarovnání */
.prose .text-center {
  text-align: center;
}
.prose .text-right {
  text-align: right;
}

/* Drop cap (volitelně – první písmeno větší jako v knize) */
.prose p.dropcap:first-letter {
  float: left;
  font-size: 3rem;
  line-height: 2.8rem;
  padding-right: 0.4rem;
  font-family: "Cormorant Garamond", serif;
  color: #c4a46e;
}
</style>
