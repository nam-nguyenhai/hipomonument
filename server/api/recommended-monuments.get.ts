import type { Monument } from '~/types/types'

interface RecommendedResponse {
  data: Monument[]
}

/**
 * Cached proxy: recommended monuments for a locale (Strapi custom route).
 */
export default defineCachedEventHandler(
  async (event) => {
    const locale = getLocale(event)
    const base = strapiBase(event)
    return await $fetch<RecommendedResponse>(`${base}/api/recommended-monuments/with-locale`, {
      params: { locale },
    })
  },
  {
    maxAge: 60 * 60,
    staleMaxAge: 60 * 60 * 24,
    swr: true,
    name: 'recommended-monuments',
    getKey: event => `recommended-${getLocale(event)}`,
  },
)
