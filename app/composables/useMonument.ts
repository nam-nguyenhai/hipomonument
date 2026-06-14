import type { Monument } from '~/types/types'

/**
 * Fetches a monument for the current slug + locale.
 *
 * Locale switching is the tricky part: i18n flips the URL prefix but keeps the
 * previous locale's slug (it can't know the localized slug), so a slug lookup
 * in the new locale 404s. We handle that by falling back to a documentId lookup,
 * then reconcile the URL to the correct localized slug.
 */
export function useMonument(slugParam: Ref<string | string[] | null>) {
  const { locale, defaultLocale } = useI18n()

  // Normalize slug to string
  const slug = computed(() => {
    const value = slugParam.value
    if (Array.isArray(value))
      return value[0] || ''
    return value || ''
  })

  // documentId of the last successfully loaded monument — used as the fallback
  // when the current (foreign-locale) slug no longer resolves after a switch.
  const documentId = useState<string | null>('monument-documentId', () => null)

  const fetchBySlug = (slugValue: string, localeValue: string) =>
    $fetch<Monument>(`/api/monuments/${slugValue}`, { params: { locale: localeValue } })

  const fetchByDocumentId = (docId: string, localeValue: string) =>
    $fetch<Monument>(`/api/monuments/by-document-id/${docId}`, { params: { locale: localeValue } })

  const { data: monument, error } = useAsyncData<Monument>(
    () => `monument-${locale.value}-${slug.value}`,
    async () => {
      const want = locale.value
      // Prefer the slug; if it doesn't resolve in this locale (e.g. right after a
      // locale switch the URL still has the other locale's slug), fall back to the
      // documentId of the monument we already have loaded.
      try {
        const data = await fetchBySlug(slug.value, want)
        // Guard: if the response is for the wrong locale (a misbehaving cache or
        // a default-locale fallback), resolve by documentId instead. Don't trust
        // a 200 alone.
        if (data.locale && data.locale !== want && documentId.value)
          return await fetchByDocumentId(documentId.value, want)
        return data
      }
      catch (err) {
        if (documentId.value)
          return await fetchByDocumentId(documentId.value, want)
        throw err
      }
    },
    { watch: [locale, slug] },
  )

  // Driven off the hydrated monument data (not a side-effect inside the fetch
  // handler, which doesn't re-run on the client when the page arrives via a
  // prefetched payload). Two jobs:
  //   1. Track the current documentId so a locale switch can fall back to it.
  //   2. Reconcile the URL to the localized slug — done here so it runs AFTER
  //      i18n's own locale navigation settles, avoiding a navigation race.
  watch(monument, (m) => {
    if (m?.documentId)
      documentId.value = m.documentId
    if (m?.slug && m.slug !== slug.value) {
      const localePrefix = locale.value === defaultLocale ? '' : `/${locale.value}`
      navigateTo(`${localePrefix}/${m.slug}`, { replace: true })
    }
  }, { immediate: true })

  return { monument, error }
}
