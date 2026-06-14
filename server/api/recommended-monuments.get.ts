import type { Monument } from '~/types/types'

interface RecommendedResponse {
  data: Monument[]
}

/**
 * Proxy: recommended monuments for a locale (Strapi custom route).
 * Not cached here — see server/api/monuments/index.get.ts.
 */
export default defineEventHandler(async (event) => {
  const locale = getLocale(event)
  const base = strapiBase(event)
  return await $fetch<RecommendedResponse>(`${base}/api/recommended-monuments/with-locale`, {
    params: { locale },
  })
})
