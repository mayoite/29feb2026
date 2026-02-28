# Fix Blueprint (Implementation-Ready)

## Priority 0 (Same Day)
1. **Route crash fix**
- File: `app/solutions/[category]/page.tsx`
- Change:
  - update page signature to async params contract (`params: Promise<{ category: string }>`), await before use.
- Outcome:
  - Removes reproducible 500 for `/solutions/*` dynamic paths.

2. **Supabase env hardening**
- File: `lib/db.ts`
- Change:
  - remove hardcoded fallback URL/key.
  - add explicit env validation and deterministic throw with clear message.
- Outcome:
  - predictable runtime env behavior and safer key handling.

3. **Tracking identity hardening**
- Files:
  - `app/api/tracking/route.ts`
  - `app/products/[category]/[slug]/ProductViewer.tsx`
- Change:
  - stop trusting body `userId`; derive identity server-side (auth/session/signed cookie).
- Outcome:
  - prevents client-side id spoof and cross-profile tampering.

## Priority 1 (This Sprint)
1. **AI endpoint contract + parser hardening**
- File: `app/api/ai-advisor/route.ts`
- Add:
  - request schema validation
  - response schema validation
  - timeout (`AbortController`)
  - fallback/error envelope
  - logging redaction

2. **Lint policy cleanup**
- Files:
  - `eslint.config.mjs`
  - `package.json`
- Add:
  - ignore `.lh-*`, `coverage`, other non-source trees.
  - source-only CI lint script.

3. **Token system consolidation**
- Files:
  - `tailwind.config.ts`
  - `tailwind.config.js` (remove/retire)
  - `app/globals.css`
  - root `globals.css` (remove/retire)
- Add:
  - semantic brand tokens and documented contrast-safe usage.

## Priority 2 (Next Sprint)
1. **SEO local pack completion**
- Files:
  - `app/layout.tsx`
  - new `app/sitemap.ts`
  - new `app/robots.ts`
  - selected route metadata exports
- Add:
  - canonical consistency and correct production base URL.
  - valid local business details (phone/address completeness).

2. **Sustainability page v2**
- File: `app/sustainability/page.tsx`
- Add:
  - measurable metrics strip
  - FAQ schema-ready section
  - conversion CTAs and downloadable ESG assets.

## Suggested Commit Breakdown
1. `fix(routes): handle async params in solutions category page`
2. `fix(security): harden supabase env loading and tracking identity`
3. `fix(ai): enforce advisor schema, timeout, and fallback envelope`
4. `chore(lint): scope eslint to source paths and ignore local artifacts`
5. `feat(theme): migrate to semantic brand tokens and remove config drift`
6. `feat(seo): add sitemap/robots and local metadata/schema improvements`
7. `feat(sustainability): add metrics-led sustainability page sections`

## Validation Pack per Commit
- Lint (source-only)
- Build
- Route probe subset
- API contract tests for `/api/ai-advisor`
- Snapshot checks for color contrast-sensitive components