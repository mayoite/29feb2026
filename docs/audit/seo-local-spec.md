# Patna-Focused SEO Local Spec

## Current Gaps
1. `app/layout.tsx:39-45`
- Fallback site URL points to old deployment domain (`ourwebsitecopy...vercel.app`).
2. `app/layout.tsx:70`
- Global canonical set to `/` at root metadata; risk of canonical duplication across pages.
3. `app/layout.tsx:112`
- Placeholder phone `+91-XXXXXXXXXX` in LocalBusiness schema.
4. No explicit `app/sitemap.ts` and `app/robots.ts` detected.

## Metadata Contract Updates
1. Canonical strategy
- Root layout: keep `metadataBase` only.
- Each route/page defines its own `alternates.canonical`.
2. Domain strategy
- Use production domain env only (`NEXT_PUBLIC_SITE_URL`), no stale hardcoded fallback.
3. Local keyword enrichment (non-spammy)
- “office furniture in Patna”
- “modular workstations Patna Bihar”
- “ergonomic office chairs Patna”
- “corporate furniture supplier Patna”

## Schema Updates
1. `FurnitureStore` schema:
- Replace placeholder phone with real support number.
- Add `address.streetAddress`, `postalCode` if available.
- Add `hasMap` and `sameAs` social links.
2. Add route-level schemas:
- Product page: `Product` + `Offer` + `AggregateRating` (when data exists).
- Projects page: `CollectionPage`.
- Sustainability page: `WebPage` + `FAQPage` block.

## Internal Linking and IA
1. Homepage + products + solutions should link to:
- `/showrooms`
- `/contact`
- `/projects`
- `/sustainability`
with anchor text including Patna/Bihar intent where natural.
2. Footer should include a local intent snippet:
- “Serving Patna, Bihar and nearby enterprise hubs.”

## Sitemap/Robots Tasks
1. Add `app/sitemap.ts`
- Include all indexable static + dynamic product/category routes.
- Exclude private/system/test routes.
2. Add `app/robots.ts`
- Allow public crawl.
- Reference sitemap URL.
- Disallow build/test artifact endpoints if any.

## Verification Tasks
1. Validate canonical URL for home + 3 representative deep pages.
2. Validate JSON-LD with Rich Results Test.
3. Confirm `/sitemap.xml` and `/robots.txt` return `200`.
4. Search Console submit + index coverage check.

## Implementation Priority
1. Fix canonical/domain and LocalBusiness phone (highest impact).
2. Add sitemap/robots.
3. Add route-level structured data for product and sustainability pages.