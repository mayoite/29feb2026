This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## One and Only Furniture

Premium furniture solutions for modern offices. Built with Next.js, Tailwind CSS, and Supabase.

## Deployment Guide

### Vercel Integration

To avoid 404 errors on product pages and 500 errors in the AI Advisor, you **MUST** configure the following environment variables in your Vercel Project Settings:

1. `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
3. `OPENROUTER_API_KEY`: Your OpenRouter API Key (sk-or-...).

### Vercel Setup In This Repo

1. Install dependencies: `npm install`
2. Link project (first time): `npx vercel link`
3. Preview deploy: `npm run vercel:preview`
4. Production deploy: `npm run vercel:prod`

This repository also includes `.vercelignore` to keep local artifacts out of Vercel uploads.

### Supabase RLS Warnings

During the `npm run seed` process, you may see RLS (Row Level Security) warnings. These are **informational only** and expected because the seed script uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass restrictions for bulk data management. In production, anonymous users have read-only access to the products table.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Stack
- Next.js
- Tailwind CSS
- Supabase
- Vercel Analytics
- Vercel Speed Insights

## Dynamic Product Filters

Category listing pages use URL-driven filters backed by `GET /api/products/filter`.

### Query Parameters

| Param | Type | Example | Notes |
|---|---|---|---|
| `category` | string | `seating` | Required in API request |
| `q` | string | `ergonomic` | Debounced text search |
| `series` | string | `Fluid Series` | Use `all` to reset |
| `sub` | repeatable string | `sub=Mesh%20chairs` | Subcategory filter |
| `price` | repeatable string | `price=mid` | `budget`, `mid`, `premium`, `luxury` |
| `mat` | repeatable string | `mat=Mesh` | Material filter |
| `ecoMin` | integer | `ecoMin=6` | Sustainability minimum score |
| `headrest` | `1` | `headrest=1` | Boolean toggle |
| `heightAdj` | `1` | `heightAdj=1` | Boolean toggle |
| `bifma` | `1` | `bifma=1` | Boolean toggle |
| `stackable` | `1` | `stackable=1` | Boolean toggle |
| `sort` | string | `sort=ecoDesc` | `az`, `za`, `ecoDesc`, `ecoAsc` |

### Shareable URL Example

```text
/products/seating?sub=Mesh%20chairs&price=mid&mat=Mesh&ecoMin=6&sort=ecoDesc
```

Product cards preserve current filter context through a `from` query param so breadcrumb navigation returns users to the same filtered listing state.

### Filter E2E Regression

```bash
npm run test:e2e:filters
```

This suite verifies:
- URL filter hydration and shareability
- sustainability filter URL updates and clear-all reset
- listing-to-detail `from` context and breadcrumb return behavior

## Accessibility Compliance

### Automated Checks

```bash
npm run test:a11y
```

This runs Playwright + axe scans for:
- `/`
- `/products`
- `/products/seating`
- one product detail route
- `/contact`
- `/quote-cart`

Release gate: no `critical` or `serious` violations for enabled rules.

Current limitation: the automated suite temporarily excludes `color-contrast` while legacy typography shades are being remediated across older pages.

### Manual Verification

- Keyboard-only navigation for navbar, filters, drawers, and product actions
- Visible focus indicators
- Escape key behavior for modal/drawer flows
- Screen reader checks on primary pages

## Alt Text Sync Workflow

Generate missing alt text for products in Supabase:

```bash
npm run alt:sync:dry
npm run alt:sync:apply
```

Optional parameters:

```bash
tsx scripts/sync-missing-alt-text.ts --apply --limit=100 --batch-size=20 --retries=3
```

Environment variables required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (recommended for updates)
- `OPENAI_API_KEY` (optional; fallback generation is used when missing)

# 26022026
