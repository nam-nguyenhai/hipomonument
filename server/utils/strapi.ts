import type { H3Event } from 'h3'
import process from 'node:process'

/**
 * Base URL of the Strapi Cloud instance, read from runtime config (NUXT_BASE_URL).
 * Server routes proxy through here so the browser never talks to Strapi directly.
 */
export function strapiBase(event: H3Event): string {
  const base = useRuntimeConfig(event).public.baseURL || process.env.NUXT_BASE_URL
  if (!base)
    throw createError({ statusCode: 500, statusMessage: 'NUXT_BASE_URL is not configured' })
  return base.replace(/\/$/, '')
}

/** Normalize ?locale= to a supported value (defaults to cs). */
export function getLocale(event: H3Event): string {
  const locale = getQuery(event).locale
  return locale === 'en' ? 'en' : 'cs'
}
