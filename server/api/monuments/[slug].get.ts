import type { Monument } from '~/types/types'

/**
 * Proxy: a single monument by slug (with SEO populated).
 * Not cached here — see server/api/monuments/index.get.ts for the reason.
 */
export default defineEventHandler(async (event) => {
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
})
