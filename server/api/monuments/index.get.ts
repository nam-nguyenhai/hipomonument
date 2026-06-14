import type { FindMany, Monument } from '~/types/types'

/**
 * Proxy: list all monuments for a locale.
 *
 * Not cached at this layer — Vercel's edge cache keys by path and ignores the
 * ?locale= query, which would serve wrong-locale data. The ISR page cache shields
 * Strapi cold-starts instead.
 */
export default defineEventHandler(async (event) => {
  const locale = getLocale(event)
  const base = strapiBase(event)
  return await $fetch<FindMany<Monument>>(`${base}/api/monuments`, {
    params: {
      'populate': '*',
      locale,
      'pagination[pageSize]': 1000,
    },
  })
})
