# Changelog — One and Only Website Rebrand & Fixes

**Date:** 2026-02-22  
**Project:** `e:\ourwebsite_copy_2026-02-21`  
**Repository:** `https://github.com/ayushmayoite/antigravity.git`

---

## 1. Rebranding: Catalog → Oando / One and Only

### 1.1 Catalog Export Rename

- **`lib/catalog.ts`**: Renamed `export const catalogCatalog` → `export const oandoCatalog`
- Updated all **13 files** that imported `catalogCatalog` to use `oandoCatalog`:
  - `components/layout/Header.tsx`
  - `components/home/CategoryGrid.tsx`
  - `components/home/InteractiveRoom.tsx`
  - `app/products/[category]/page.tsx`
  - `app/products/[category]/FilterGrid.tsx`
  - `app/products/[category]/[series]/page.tsx`
  - `app/products/[category]/[series]/[product]/page.tsx`
  - `app/solutions/[category]/page.tsx`

### 1.2 Category IDs

All category IDs in `catalog.ts` changed from `catalog-` to `oando-` prefix:
| Before | After |
|---|---|
| `catalog-workstations` | `oando-workstations` |
| `catalog-tables` | `oando-tables` |
| `catalog-storage` | `oando-storage` |
| `catalog-soft-seating` | `oando-soft-seating` |
| `catalog-seating` | `oando-seating` |
| `catalog-educational` | `oando-educational` |
| `catalog-collaborative` | `oando-collaborative` |

### 1.3 Category Display Names

Removed "Oando" prefix from display names so they read cleanly:

- `"Oando Workstations"` → `"Workstations"`
- `"Oando Tables"` → `"Tables"`
- `"Oando Storage"` → `"Storage"`
- `"Oando Seating"` → `"Seating"`
- `"Oando Soft Seating"` → `"Soft Seating"`
- `"Oando Educational"` → `"Educational"`

### 1.4 Series Names

- Removed "Oando" prefix from all series names (e.g., `"Oando Workstations Series"` → `"Workstations Series"`)

### 1.5 Product IDs in `data/products.ts`

- Changed all `catalog-ws-*`, `catalog-ch-*`, `catalog-tb-*` product IDs to `oando-ws-*`, `oando-ch-*`, `oando-tb-*`

### 1.6 Text Content Cleanup

- **`lib/catalog.ts`**: Replaced `"Catalog India"` → `"One and Only"` in all product descriptions
- **`lib/catalog.ts`**: Replaced `catalogindia.in` → `oando.co.in` in metadata source URLs
- **`components/bot/AdvancedBot.tsx`**:
  - `"Enquiry for One and Only (Catalog India partner)"` → `"Enquiry for One and Only"`
  - `"One and Only x Catalog workspace enquiry"` → `"One and Only workspace enquiry"`
  - `"One and Only x Catalog Assistant"` → `"One and Only Assistant"`
- **`app/layout.tsx`**: Metadata description removed "Authorized Strategic Partner of Catalog India"
- **`components/home/CatalogSection.tsx`**: Renamed function to `PartnerSection`, updated all URLs
- **`components/home/PartnershipBanner.tsx`**: Updated all `catalogindia.com` → `oando.co.in`
- **`components/home/PartnershipSection.tsx`**: Updated all Catalog URLs and alt text
- **`components/configurator/productMapping.ts`**: Removed Catalog references in comments

### 1.7 Navigation Links Fixed

All navigation links updated from `catalog-` to `oando-` paths:

| File                               | Links Fixed                       |
| ---------------------------------- | --------------------------------- |
| `components/layout/Header.tsx`     | Mega menu items + cards (3 links) |
| `components/layout/MobileMenu.tsx` | 5 category links                  |
| `app/products/page.tsx`            | 3 "Explore" links + Fluid X link  |

---

## 2. Image Path Migration

### 2.1 Extension: `.jpg` → `.webp`

Updated all image references from `.jpg` to `.webp` across:

- **`app/page.tsx`**: Hero teaser image
- **`app/products/page.tsx`**: Hero background, ergonomics section, highlight section
- **`app/products/[category]/page.tsx`**: Fallback hero image
- **`components/configurator/ConfiguratorPreview.tsx`**: All 7 layout images + fallback
- **`components/layout/Header.tsx`**: 3 mega menu card images
- **`data/products.ts`**: 2 category grid images
- **`lib/catalog.ts`**: Soft seating flagship and gallery images

### 2.2 Path Prefix: `/products/` → `/images/products/`

All image paths updated to include the correct `/images/` prefix to match the actual file structure in `public/images/products/`.

### 2.3 Catalog Image Paths: `/images/catalog/` → `/images/products/imported/`

- All 100+ product `flagshipImage` paths in `catalog.ts` changed from `/images/oando/PRODUCT/1.png` to `/images/products/imported/PRODUCT/image-1.webp`
- Products without matching imported folders were mapped to a fallback image

### 2.4 CategoryGrid Thumbnails

- Updated `CATEGORY_THUMBNAILS` map keys from `catalog-*` to `oando-*`
- Changed all thumbnail paths from `.jpg` to `.webp`
- Switched from Next.js `Image` to `<img>` with `onError` fallback for resilience

---

## 3. Product Name Cleanup

The scraped product data had severely corrupted names (e.g., `"CurvivoCurvivoCurvivo moves with your team..."`). Fixed using:

1. Regex to collapse repeated leading tokens (`WordWord...` → `Word`)
2. Truncation of names longer than 30 characters without commas
3. Manual fixes for specific products: Curvivo, Adaptable, DeskPro, Orbit, Toro, Fusion, Audi Chair

---

## 4. Layout Component Switch

- **`app/layout.tsx`**: Switched from `<Navbar />` to `<Header />` component
  - The `Navbar` had a "Catalog" link next to "Contact" that was not desired
  - The `Header` component has the correct premium navigation with mega menu

---

## 5. Bot Component Fix

- **`components/bot/AdvancedBot.tsx`**: Restored accidentally deleted functions:
  - `whatsappUrl` (useMemo)
  - `mailtoUrl` (useMemo)
  - `resetBot` function
  - These were accidentally removed during a previous multi-replace operation

---

## 6. Header Component Restore

- **`components/layout/Header.tsx`**: Full rewrite to restore broken structure
  - A previous edit accidentally merged the `discoverMenuItems` map with the component body
  - Restored: proper function declaration, state hooks, scroll handler, full JSX

---

## 7. JPEG Backup

- All `.jpg` and `.jpeg` files from `public/` backed up to `e:\git-backups\jpegs-backup\`
- Backup preserves original directory structure

---

## 8. Automation Setup

### 8.1 Auto-Commit (every 10 minutes)

- Script: `e:\git-backups\auto-commit.ps1`
- Runs `git add -A`, `git commit`, `git push origin master --force`
- Running as background PowerShell process

### 8.2 Auto-Backup (every 30 minutes)

- Script: `e:\git-backups\auto-backup.ps1`
- Uses `robocopy /MIR` to create timestamped backups
- Excludes: `node_modules`, `.next`, `.git`, `test-results`, `playwright-report`
- Destination: `e:\git-backups\backup-YYYY-MM-DD_HH-mm\`

---

## 9. Known Remaining Issues

### 9.1 Product Images — Incorrect Fallbacks

- ~100 products in `catalog.ts` reference image folders that don't exist in `public/images/products/imported/`
- These currently fall back to `/images/products/imported/accent/image-1.webp` (a chair) regardless of product type
- **Workstations** products show a chair image instead of workstation images
- **Tables** products show a chair image instead of table images
- **Fix needed:** Map each product to an appropriate image from its category's imported folder

### 9.2 Category Hero Images

- Some category landing pages show black/blank heroes when the first product's flagship image doesn't load
- Fix needed: Set explicit hero images per category using known-good imported images

### 9.3 Placeholder Content

- Product detail pages have generic "Performance Details" (Manufacturing, Sustainability)
- Dimensions show "Customizable" instead of actual measurements
- Materials show "Premium materials" instead of specifics

### 9.4 Minor Lint Warnings

- `aspect-[4/3]` can be written as `aspect-4/3` in ConfiguratorPreview.tsx
- Bot component has accessibility warnings (missing button title, form label)
- `bg-gradient-to-t` can be written as `bg-linear-to-t` in CategoryGrid.tsx

---

## Files Modified (Summary)

| File                                                  | Changes                                                     |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| `app/layout.tsx`                                      | Navbar → Header, metadata cleanup                           |
| `app/page.tsx`                                        | Image paths                                                 |
| `app/products/page.tsx`                               | Image paths, broken links                                   |
| `app/products/[category]/page.tsx`                    | Image fallback path                                         |
| `app/products/[category]/FilterGrid.tsx`              | catalogCatalog → oandoCatalog                                   |
| `app/products/[category]/[series]/page.tsx`           | catalogCatalog → oandoCatalog, Catalog text                         |
| `app/products/[category]/[series]/[product]/page.tsx` | catalogCatalog → oandoCatalog                                   |
| `app/solutions/[category]/page.tsx`                   | catalogCatalog → oandoCatalog                                   |
| `components/bot/AdvancedBot.tsx`                      | Catalog text, restored deleted functions                        |
| `components/configurator/ConfiguratorPreview.tsx`     | Image paths                                                 |
| `components/configurator/productMapping.ts`           | Catalog comments                                                |
| `components/home/CatalogSection.tsx`                      | Full rebrand                                                |
| `components/home/CategoryGrid.tsx`                    | Thumbnails, image paths, oandoCatalog                       |
| `components/home/PartnershipBanner.tsx`               | Catalog URLs/text                                               |
| `components/home/PartnershipSection.tsx`              | Catalog URLs/text                                               |
| `components/layout/Header.tsx`                        | Full restore + rebrand                                      |
| `components/layout/MobileMenu.tsx`                    | Navigation links                                            |
| `data/products.ts`                                    | Product IDs, image paths                                    |
| `lib/catalog.ts`                                      | Export name, category IDs, names, image paths, descriptions |
