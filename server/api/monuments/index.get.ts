import type { FindMany, Monument } from '~/types/types'

/**
 * Cached proxy: list all monuments for a locale.
 * Shields Strapi Cloud cold-starts behind a 1h-fresh / 24h-stale-while-revalidate cache.
 */
export default defineCachedEventHandler(
  async (event) => {
    const locale = getLocale(event)
    const base = strapiBase(event)
    return await $fetch<FindMany<Monument>>(`${base}/api/monuments`, {
      params: {
        'populate': '*',
        locale,
        'pagination[pageSize]': 1000,
      },
    })
  },
  {
    maxAge: 60 * 60, // fresh for 1h
    staleMaxAge: 60 * 60 * 24, // serve stale up to 24h while revalidating in background
    swr: true,
    name: 'monuments-list',
    getKey: event => `list-${getLocale(event)}`,
  },
)
