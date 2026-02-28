# Rollout Checklist (Audit -> Fix -> Release)

## A. Pre-Implementation Safety
- [ ] Confirm branch is `main` and capture `git status --short` snapshot.
- [ ] Keep unrelated local changes isolated (`.env.local`, `.gitignore`, `.vscode/settings.json`, `package*.json`).
- [ ] Create feature branch for fixes (recommended): `fix/audit-hardening-2026-02-28`.

## B. Security Fixes
- [ ] Remove hardcoded Supabase fallback values in `lib/db.ts`.
- [ ] Add env validation and fail-fast startup checks.
- [ ] Replace body-supplied `userId` with server-derived identity in:
  - `/api/tracking`
  - `/api/ai-advisor`
- [ ] Add request + response schema validation in `/api/ai-advisor`.
- [ ] Remove raw prompt/user-id logging.
- [ ] Verify RLS policies protect `user_history` read/write.

## C. Lint Scope and Build Hygiene
- [ ] Update ESLint ignores to exclude `.lh-*`, `coverage`, and non-source junk.
- [ ] Introduce source-only lint script in `package.json` (CI target).
- [ ] Keep full lint optional for deep maintenance only.
- [ ] Run `npm run build` and record status.

## D. Color/CSS Migration
- [ ] Keep one Tailwind config (`tailwind.config.ts`) and remove drift file.
- [ ] Keep one global stylesheet (`app/globals.css`) as source of truth.
- [ ] Introduce semantic tokens:
  - primary `#1a1f71`
  - background `#ffffff`
  - accent1 `#fdbb0a`
  - accent2 `#faaa13`
  - neutral `#75787b`
- [ ] Replace hardcoded color literals in shared components.
- [ ] Verify contrast rules (accent text not on white backgrounds).

## E. Route and Link Health
- [ ] Fix `/solutions/[category]` params handling to eliminate 500.
- [ ] Re-run route probe set (static + dynamic + legacy redirects).
- [ ] Re-run link crawl and keep only reproducible issues.

## F. AI + SEO Delivery
- [ ] Implement strict AI contract and fallback/error envelope.
- [ ] Add `app/sitemap.ts` and `app/robots.ts`.
- [ ] Remove stale fallback domain from metadata.
- [ ] Replace placeholder business phone in LocalBusiness schema.
- [ ] Apply Patna/Bihar local keyword strategy to metadata and internal links.
- [ ] Upgrade sustainability page with measurable proof + conversion CTA.

## G. Verification Gates
- [ ] Lint (source-only) passes or only accepted backlog warnings remain.
- [ ] `npm run build` passes.
- [ ] Route checks: no unexpected 5xx.
- [ ] `/api/ai-advisor` invalid payload test returns controlled error.
- [ ] WCAG checks pass for primary/neutral text combinations.
- [ ] `sitemap.xml` and `robots.txt` return 200.

## H. Git/Release Closure
- [ ] Verify cleanup commit scope remains isolated (`git show --name-status 1caba638`).
- [ ] Push to `origin/main` after credential fix.
- [ ] Confirm remote head updated via `git ls-remote origin main`.

## Rollback Plan
1. If runtime issues appear post-fix:
- Revert the latest fix commit(s) only (do not reset unrelated local work):
  - `git revert <commit-hash>`
2. If color migration causes UI regressions:
- Revert token migration commit and redeploy previous stable theme commit.
3. If AI endpoint errors spike:
- Toggle fallback-only mode (disable provider call), keep endpoint contract stable.
4. If SEO metadata causes canonical conflicts:
- Temporarily set canonical per-route to self URL and remove global override until corrected.