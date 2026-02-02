import type { Monument } from '~/types/types'

/**
 * Composable for fetching monument data with locale-aware slug handling.
 * When locale changes, it fetches by documentId to get the correct localized slug.
 */
export function useMonument(slugParam: Ref<string | string[] | null>) {
  const { locale, defaultLocale } = useI18n()
  const { public: { baseURL } } = useRuntimeConfig()

  // Normalize slug to string
  const slug = computed(() => {
    const value = slugParam.value
    if (Array.isArray(value)) return value[0] || ''
    return value || ''
  })

  // Persist state across SSR hydration
  const documentId = useState<string | null>(`monument-documentId-${slug.value}`, () => null)
  const previousLocale = useState<string>(`monument-locale-${slug.value}`, () => locale.value)

  const fetchBySlug = (slugValue: string, localeValue: string) =>
    $fetch<Monument>(`${baseURL}/api/monuments/${slugValue}?locale=${localeValue}`)

  const fetchByDocumentId = (docId: string, localeValue: string) =>
    $fetch<Monument>(`${baseURL}/api/monuments/by-document-id/${docId}?locale=${localeValue}`)

  const updateUrlForNewSlug = async (newSlug: string) => {
    if (newSlug && newSlug !== slug.value) {
      const localePrefix = locale.value === defaultLocale ? '' : `/${locale.value}`
      await navigateTo(`${localePrefix}/${newSlug}`, { replace: true })
    }
  }

  const { data: monument, error } = useAsyncData<Monument>(
    `monument-${slug.value}`,
    async () => {
      const isLocaleSwitch = documentId.value && previousLocale.value !== locale.value

      const data = isLocaleSwitch
        ? await fetchByDocumentId(documentId.value!, locale.value)
        : await fetchBySlug(slug.value, locale.value)

      // Update URL if slug changed (locale switch)
      if (isLocaleSwitch && data.slug) {
        await updateUrlForNewSlug(data.slug)
      }

      // Store documentId for future locale switches
      if (data.documentId) {
        documentId.value = data.documentId
      }

      previousLocale.value = locale.value
      return data
    },
    { watch: [locale] },
  )

  return { monument, error }
}
