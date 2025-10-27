export function getStrapiMedia(url: string) {
  if (!url)
    return null
    // If it's already absolute (starts with http), just return it
  if (url.startsWith('http'))
    return url

  const { public: { baseURL } } = useRuntimeConfig()

  const base = baseURL || 'http://localhost:1337'
  return `${base}${url}`
}
