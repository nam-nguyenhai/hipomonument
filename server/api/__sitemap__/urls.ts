import { defineSitemapEventHandler, asSitemapUrl } from '#imports'

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
  const baseURL = process.env.NUXT_BASE_URL || ''

  const [csResponse, enResponse] = await Promise.all([
    $fetch<StrapiResponse>(`${baseURL}/api/monuments?populate=seo&locale=cs&pagination[pageSize]=1000`),
    $fetch<StrapiResponse>(`${baseURL}/api/monuments?populate=seo&locale=en&pagination[pageSize]=1000`),
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
