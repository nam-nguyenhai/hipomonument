/**
 * Extracts YouTube video ID from various URL formats.
 */
export function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/embed\/([^?&/]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&/]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Converts oembed tags to YouTube iframes in the DOM.
 * Call this in onMounted() after content with oembeds is rendered.
 */
export function convertOembedToIframes() {
  const oembeds = document.querySelectorAll('oembed[url]')

  oembeds.forEach((oembed) => {
    const url = oembed.getAttribute('url')
    if (!url) {
      return
    }

    const videoId = extractYoutubeVideoId(url)
    if (!videoId) {
      return
    }

    const iframe = document.createElement('iframe')
    iframe.src = `https://www.youtube.com/embed/${videoId}`
    iframe.frameBorder = '0'
    iframe.allowFullscreen = true
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'

    oembed.replaceWith(iframe)
  })
}
