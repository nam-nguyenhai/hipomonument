export function useStrapiLocale() {
  const { locale } = useI18n()
  const { public: { baseURL } } = useRuntimeConfig()

  const fetchWithLocale = async <T>(endpoint: string, options?: Record<string, unknown>) => {
    const separator = endpoint.includes('?') ? '&' : '?'
    const url = `${baseURL}${endpoint}${separator}locale=${locale.value}`
    return await $fetch<T>(url, options)
  }

  return { fetchWithLocale, locale, baseURL }
}
