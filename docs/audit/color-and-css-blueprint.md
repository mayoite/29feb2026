# Color and CSS Blueprint

## Current Drift Snapshot
- Duplicate Tailwind configs with conflicting design tokens:
  - `tailwind.config.ts`
  - `tailwind.config.js`
- Duplicate global styles:
  - `app/globals.css`
  - root `globals.css`
- Mixed brand token definitions in CSS (`#1434CB`, yellow hover) vs requested palette.

## Target Semantic Palette
- `primary`: `#1a1f71`
- `background`: `#ffffff`
- `accent1`: `#fdbb0a`
- `accent2`: `#faaa13`
- `neutral`: `#75787b`

## Token Migration Map (Old -> New)
- `--color-primary: #1434CB` -> `#1a1f71`
- `--color-primary-hover: #fdbb0a/#F7B600` -> split semantic usage:
  - hover dark intent: use `primary`
  - highlight intent: use `accent1`/`accent2`
- `neutral scale` custom values -> keep scale, but set base semantic neutral to `#75787b`

## Implementation Contract
1. Keep **one** Tailwind config source of truth (`tailwind.config.ts`).
2. Remove/retire `tailwind.config.js` to prevent stale token reintroduction.
3. Keep **one** global stylesheet source of truth (`app/globals.css`).
4. Define semantic CSS vars at `:root` and consume via utility classes.
5. Replace hardcoded color literals in components with semantic utilities (`bg-primary`, `text-neutral`, `bg-accent1`, etc.).

## Recommended Token Block (Implementation-ready)
```css
:root {
  --color-primary: #1a1f71;
  --color-background: #ffffff;
  --color-accent1: #fdbb0a;
  --color-accent2: #faaa13;
  --color-neutral: #75787b;
}
```

## Tailwind Usage Strategy
- Add semantic colors in `theme.extend.colors`:
  - `primary`, `background`, `accent1`, `accent2`, `neutral`
- Keep existing neutral scale for utility compatibility where needed.
- Refactor common components first:
  - Buttons, links, badges, cards, hero overlays, footer CTA.

## Performance Cleanup List
1. Lint/config scope cleanup:
  - Exclude `.lh-*`, generated/browser-profile trees from lint and style processing.
2. Tailwind config dedupe:
  - Remove duplicate config file to eliminate duplicate content scans.
3. Content globs optimization:
  - Keep only real code roots (`app`, `components`, `lib`, optional `tests`).
  - Remove unused `src/**` glob if folder is absent.
4. Utility bloat reduction:
  - Consolidate repeated long utility strings into component classes (`@layer components`).
5. Motion cost control:
  - Keep heavy transforms to targeted elements; preserve `prefers-reduced-motion` handling.

## WCAG Contrast Matrix (Key Combinations)
- `primary (#1a1f71)` on `background (#ffffff)`: **14.20:1** (AAA)
- `neutral (#75787b)` on `background (#ffffff)`: **4.44:1** (fails AA for normal text; passes for large text)
- `accent1 (#fdbb0a)` on white: **1.71:1** (fails)
- `accent2 (#faaa13)` on white: **1.94:1** (fails)
- `primary` on `accent1`: **8.31:1** (AAA)
- `primary` on `accent2`: **7.32:1** (AAA)

## Accessibility Rules for Rollout
1. Do not use accent colors as body text on white.
2. Use accent colors for backgrounds, borders, chips, highlights.
3. For text on accent backgrounds, use dark text (`#111827` or `primary`) not white.
4. For neutral paragraph text, use darker neutral (`neutral-700/800`) for AA compliance at normal size.