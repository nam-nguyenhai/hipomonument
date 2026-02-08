import type { Monument } from '~/types/types'

/**
 * API response type for recommended monuments endpoint
 */
export interface RecommendedMonumentsResponse {
  data: Monument[]
}

/**
 * Composable for fetching recommended monuments with locale support.
 * Automatically refetches when locale changes.
 */
export function useRecommendedMonuments() {
  const { locale } = useI18n()
  const { public: { baseURL } } = useRuntimeConfig()

  const { data: monuments, error, status, refresh } = useAsyncData<Monument[]>(
    () => `recommended-monuments-${locale.value}`,
    async () => {
      try {
        const response = await $fetch<RecommendedMonumentsResponse>(
          `${baseURL}/api/recommended-monuments/with-locale`,
          {
            params: {
              locale: locale.value,
            },
          },
        )

        return response.data || []
      }
      catch (err) {
        console.error('Failed to fetch recommended monuments:', err)
        throw err
      }
    },
    {
      watch: [locale],
    },
  )

  return {
    monuments,
    error,
    status,
    refresh,
    isLoading: computed(() => status.value === 'pending'),
    isEmpty: computed(() => !monuments.value || monuments.value.length === 0),
  }
}
