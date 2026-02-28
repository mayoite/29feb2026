# Security Findings (Supabase + API)

## Severity Summary
- High: 3
- Medium: 4
- Low: 2

## Findings

### 1) Hardcoded Supabase URL + anon key fallback
- Severity: **High**
- File: `lib/db.ts:3-4`
- Context: `supabaseUrl` and `supabaseAnonKey` fall back to literal values.
- Risk:
  - Environment drift (prod/staging/local mismatch).
  - Key rotation becomes fragile.
  - Accidental reuse of a single public project key across environments.
- Remediation task:
  - Remove literal fallbacks.
  - Fail fast when required env vars are missing.
  - Example policy: throw in server runtime if `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` missing.
- Validation:
  - `rg -n "sb_publishable_|supabase.co" lib/db.ts` returns no literal credential fallback.
  - Build passes with env set, fails clearly without env set.

### 2) Trusting client-supplied `userId` in tracking write path
- Severity: **High**
- File: `app/api/tracking/route.ts:6-31`
- Context:
  - API accepts `{ userId, productId }` from client and upserts by `user_id`.
  - Caller creates local random ID in browser (`app/products/[category]/[slug]/ProductViewer.tsx:73-82`).
- Risk:
  - Any caller can write or overwrite another profile history by spoofing `userId`.
  - If RLS is permissive/misconfigured, this becomes cross-user data tampering.
- Remediation task:
  - Derive user identity server-side (Supabase auth/session or signed first-party cookie).
  - Reject arbitrary `userId` from body.
  - Enforce RLS policy `user_id = auth.uid()` for write/read.
- Validation:
  - Integration test: spoofed `userId` request returns `401/403`.
  - Valid authenticated request updates only caller’s row.

### 3) AI endpoint user-history lookup uses untrusted `userId`
- Severity: **High**
- File: `app/api/ai-advisor/route.ts:18,34-41`
- Context: route accepts `userId` and queries `user_history` with it.
- Risk:
  - Potential cross-user history inference if RLS or table exposure is weak.
  - User persona poisoning (attacker influences recommendations by fabricated history id).
- Remediation task:
  - Remove `userId` from request body contract.
  - Resolve identity from authenticated session/cookie only.
  - Add server-side schema validation and explicit allowlist for fields.
- Validation:
  - Request with foreign id cannot fetch history.
  - Recommendation context only includes caller-owned records.

### 4) Raw model output parse can produce 500 and unstable API behavior
- Severity: **Medium**
- File: `app/api/ai-advisor/route.ts:90-99`
- Context: `JSON.parse` on LLM output without schema validation/fallback.
- Risk:
  - Model output drift causes frequent 500s.
  - Client receives inconsistent payload types.
- Remediation task:
  - Validate with a strict schema (e.g., Zod).
  - Add deterministic fallback payload on parse/schema failure.
  - Return standardized error envelope.
- Validation:
  - Fuzz tests with malformed model outputs return 200 fallback or controlled 502 envelope (not unhandled 500).

### 5) Verbose logging of user prompt and identifiers
- Severity: **Medium**
- File: `app/api/ai-advisor/route.ts:16,19`
- Context: logs raw `query` and `userId`.
- Risk:
  - PII/business details can land in logs.
- Remediation task:
  - Remove raw prompt logging or redact/hash user ids.
  - Use structured logs with request id and error class only.
- Validation:
  - Log snapshots contain no full user prompt or raw personal identifiers.

### 6) Placeholder OpenRouter key anti-pattern
- Severity: **Medium**
- File: `app/api/ai-advisor/route.ts:8`
- Context: SDK initialized with `"placeholder"` key when env is missing.
- Risk:
  - Misleading runtime behavior and noisy failed outbound calls in future refactors.
- Remediation task:
  - Initialize client lazily only after env validation.
- Validation:
  - Missing key path returns deterministic `503` without any provider call.

### 7) Supabase data-access mismatch in category helper
- Severity: **Low**
- File: `lib/getProducts.ts:250-263`
- Context: selects `category` field even though product model uses `category_id`.
- Risk:
  - Incorrect params generation / hidden data bugs.
- Remediation task:
  - Query `category_id` or join `categories(name)` and normalize output.
- Validation:
  - Helper returns non-empty expected category list in integration test.

### 8) Placeholder legal content in production routes
- Severity: **Low**
- Files:
  - `app/privacy/page.tsx`
  - `app/terms/page.tsx`
- Risk:
  - Legal/compliance risk, especially for analytics and tracking behavior.
- Remediation task:
  - Replace placeholder text with approved legal copy and revision date.
- Validation:
  - Stakeholder-approved legal text present in production build.

## Critical/High Fix Queue (Direct Tasks)
1. Remove credential fallbacks in `lib/db.ts` and enforce env validation.
2. Replace body-level `userId` trust with server-derived identity in both tracking and ai-advisor routes.
3. Add strict RLS checks and integration tests for unauthorized read/write attempts.