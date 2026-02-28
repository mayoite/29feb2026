# Route and Link Findings

## Validation Method
- Route probes executed against local server (`http://127.0.0.1:3000`) with `curl` status/redirect capture.
- Cross-checks:
  - redirect map in `next.config.js`
  - historical link artifacts (`final_link_errors*.txt`, `link_errors*.txt`)
  - recovered historical errors context (previous `errors.md` content)

## Reproducible Current Failures

### 1) Dynamic solutions route throws 500
- URL: `/solutions/government-office/`
- Status: `500`
- Root cause:
  - `app/solutions/[category]/page.tsx:9-16` uses `params.category` synchronously.
  - On current Next.js behavior, `params` is async in this route path and must be awaited.
  - Failing expression at `app/solutions/[category]/page.tsx:13`: `params.category.replace(...)`.
- Fix task:
  - Convert route signature to async params contract and await params before access.
- Validation:
  - Route returns 200 (or intentional 404) for invalid category path, never 500.

## Redirect Validation (Pass)
Legacy category routes currently redirect as configured in `next.config.js`:
- `/products/oando-workstations/` -> `/products/workstations`
- `/products/oando-seating/` -> `/products/chairs-others`
- `/products/oando-tables/` -> `/products/meeting-conference-tables`
- `/products/oando-soft-seating/` -> `/products/soft-seating`
- `/products/oando-collaborative/` -> `/products/others-1`
- `/products/oando-educational/` -> `/products/education`
- `/products/oando-storage/` -> `/products/storages`
- All above returned `307` with correct `Location` header.

## Static and Dynamic Route Health (Sample)
- `200`: `/`, `/about/`, `/contact/`, `/products/`, `/projects/`, `/service/`, `/showrooms/`, `/downloads/`, `/sustainability/`, `/privacy/`, `/terms/`, `/tracking/`, `/news/`, `/planning/`, `/catalog/`
- `200`: `/products/chairs-mesh/`, `/products/workstations/`
- `200`: `/products/oando-workstations/oando-workstations--adaptable/`
- `200`: `/products/oando-soft-seating/oando-soft-seating--accent/`

## Link Artifact Reconciliation
- Current link-health text artifacts are overwhelmingly `200` responses.
- No currently reproducible broken-link set emerged from those artifacts.
- Marked stale/closed from historical context:
  - old link/lint noise from `.lh-*` trees
  - earlier transient AI endpoint failures not reproduced in static crawl context

## Actionable List (Current)
1. Fix `/solutions/[category]` params handling to eliminate 500.
2. Keep redirect map as-is unless business taxonomy changes.
3. Re-run full link crawl after route fix and store a fresh, source-only report.