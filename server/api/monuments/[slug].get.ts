import type { Monument } from '~/types/types'

/**
 * Cached proxy: a single monument by slug (with SEO populated).
 */
export default defineCachedEventHandler(
  async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug)
      throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
    const locale = getLocale(event)
    const base = strapiBase(event)
    return await $fetch<Monument>(`${base}/api/monuments/${encodeURIComponent(slug)}`, {
      params: {
        locale,
        'populate[seo][populate]': '*',
      },
    })
  },
  {
    maxAge: 60 * 60,
    staleMaxAge: 60 * 60 * 24,
    swr: true,
    name: 'monument-by-slug',
    getKey: event => `${getRouterParam(event, 'slug')}-${getLocale(event)}`,
  },
)
