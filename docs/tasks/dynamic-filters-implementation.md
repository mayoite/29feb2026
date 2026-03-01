# Dynamic Filters Implementation

## Goal
Implement URL-driven product filters on `/products` and subproduct pages for `price`, `material`, and `sustainabilityScore`, using TanStack Query for data fetching and reactive updates.

## Scope
- Review Supabase `products` schema and metadata fields used by `/products`.
- Add URL-based filter state (`?price=...&material=...&sustainability=...`).
- Implement filter UI components and wire them to query params.
- Use TanStack Query for filtered data requests and caching.
- Apply `#fdbb0a` accent styling for active filter states and controls.
- Integrate filters on category and subproduct pages.
- Support real-time updates and mobile-first behavior.
- Add implementation notes to `README.md`.

## Execution Steps
1. Audit Supabase product structure used by `lib/getProducts` and category routes.
2. Define URL filter contract:
   - `price=min-max` (or bucket keys)
   - `material=mesh,metal,...`
   - `sustainability=1-5` (or threshold)
3. Build query-key strategy with TanStack Query:
   - include category/subcategory + filter params in keys.
4. Add reusable React filter components:
   - price range control
   - material multi-select
   - sustainability score selector.
5. Style active/hover/focus states with `#fdbb0a` accents.
6. Connect filter state to URL and restore state on refresh/share.
7. Apply the same filter contract on subproduct routes.
8. Validate real-time updates:
   - URL changes update result list immediately
   - back/forward browser navigation restores filters.
9. Optimize mobile:
   - sticky filter trigger
   - bottom-sheet/drawer filter UX
   - large tap targets.
10. Document usage and URL examples in `README.md`.

## Acceptance Criteria
- Filtering works on `/products` and subproduct/category pages.
- Filter state is URL-driven and shareable.
- Results update without full-page reload.
- Mobile filtering is usable and accessible.
- TanStack Query cache keys are deterministic and avoid stale cross-page data.
- README includes filter API and examples.

## Test Checklist
- Unit/integration tests for filter parsing and query key generation.
- E2E:
  - apply each filter independently
  - combine filters
  - refresh page with existing query params
  - back/forward navigation behavior
  - mobile drawer open/apply/reset flow.
- Performance:
  - no redundant refetch loops
  - smooth updates on filter toggle.
