import { asSitemapUrl, defineSitemapEventHandler } from '#imports'

interface StrapiMonument {
  slug: string
  updatedAt?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
}

interface StrapiResponse {
  data: StrapiMonument[]
}

export default defineSitemapEventHandler(async () => {
  // Use the cached internal proxy routes instead of hitting Strapi directly.
  const [csResponse, enResponse] = await Promise.all([
    $fetch<StrapiResponse>('/api/monuments', { params: { locale: 'cs' } }),
    $fetch<StrapiResponse>('/api/monuments', { params: { locale: 'en' } }),
  ])

  const urls = []

  for (const monument of csResponse.data) {
    if (monument.slug) {
      urls.push(asSitemapUrl({
        loc: `/${monument.slug}`,
        lastmod: monument.updatedAt,
      }))
    }
  }

  for (const monument of enResponse.data) {
    if (monument.slug) {
      urls.push(asSitemapUrl({
        loc: `/en/${monument.slug}`,
        lastmod: monument.updatedAt,
      }))
    }
  }

  return urls
})
