# Caching & Strapi cold-start mitigation

The Strapi Cloud ($10 tier) is slow to respond / cold-starts. To keep the Vercel
frontend fast we cache aggressively and only revalidate when content changes.

## What's in place

### 1. ISR (Incremental Static Regeneration) — `nuxt.config.ts` `routeRules`
```ts
routeRules: {
  '/':       { isr: 3600 },
  '/en':     { isr: 3600 },
  '/**':     { isr: 3600 },   // [slug] + /en/** monument pages
  '/api/**': { swr: 3600 },   // cached proxy routes (below)
}
```
- Vercel renders each page once, serves it from the edge, and revalidates in the
  background after 1h. **Visitors never wait on a cold Strapi** — only the occasional
  background revalidation does.

### 2. Cached server proxy routes — `server/api/**`
The browser and SSR no longer hit Strapi directly. All monument data goes through:
- `GET /api/monuments?locale=` — list (was the heaviest call)
- `GET /api/monuments/:slug?locale=`
- `GET /api/monuments/by-document-id/:id?locale=`
- `GET /api/recommended-monuments?locale=`

Each is a `defineCachedEventHandler` (1h fresh, 24h stale-while-revalidate). This also
fixes the **cs↔en locale switch**, which previously hit Strapi directly from the browser.

## 3. Instant freshness on content edits — Strapi lifecycle → Vercel Deploy Hook

ISR's 1h TTL means edits could take up to an hour to appear. To make them go live
immediately, a redeploy is triggered when content changes (a redeploy resets ISR + all
caches). This is wired **in the CMS repo** (version-controlled), not in the admin UI:

`hipomonumenty-cms/src/api/monument/content-types/monument/lifecycles.ts`
- Fires on publish / republish and delete (plain draft saves do **not** rebuild).
- Debounced (10s) so a burst of edits collapses into one rebuild.
- POSTs to the URL in the `VERCEL_DEPLOY_HOOK_URL` env var; no-ops if unset.

### Setup (one-time)
1. **Create a Vercel Deploy Hook**: Vercel → Project (hipomonument) →
   **Settings → Git → Deploy Hooks** → name `strapi-content`, branch `main` →
   **Create Hook** → copy the URL.
2. **Set it in Strapi Cloud**: Strapi → **Settings → Variables** →
   `VERCEL_DEPLOY_HOOK_URL = <that URL>` → redeploy the CMS.

Now: publish a monument → lifecycle fires → Vercel rebuilds (~1–2 min) → fresh content live.

> Edits are infrequent, so rebuild cost is negligible. The 1h ISR TTL is the safety net
> if the hook is ever unset or fails.

## Tuning
- Want fresher without webhooks? Lower the `isr`/`swr` numbers (e.g. `600` = 10 min).
- Want zero runtime Strapi hits? Switch `routeRules` page entries to `{ prerender: true }`
  and rely entirely on the deploy hook to rebuild — fastest, but every edit needs a rebuild.
