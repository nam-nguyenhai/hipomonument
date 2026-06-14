import type { Monument } from '~/types/types'

/**
 * Proxy: a single monument by documentId (used on locale switch to resolve the
 * localized slug). Not cached here — see server/api/monuments/index.get.ts.
 */
export default defineEventHandler(async (event) => {
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
})
