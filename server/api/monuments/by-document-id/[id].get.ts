import type { Monument } from '~/types/types'

/**
 * Cached proxy: a single monument by documentId (used on locale switch to resolve
 * the localized slug). With SEO populated.
 */
export default defineCachedEventHandler(
  async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id)
      throw createError({ statusCode: 400, statusMessage: 'Missing documentId' })
    const locale = getLocale(event)
    const base = strapiBase(event)
    return await $fetch<Monument>(`${base}/api/monuments/by-document-id/${encodeURIComponent(id)}`, {
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
    name: 'monument-by-document-id',
    getKey: event => `${getRouterParam(event, 'id')}-${getLocale(event)}`,
  },
)
