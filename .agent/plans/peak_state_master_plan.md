# Peak State Master Plan: WINI Digital Excellence (HIGH-FIDELITY)

This document is the definitive, multi-dimensional roadmap for the WINI Replication project. It mandates an elite standard of "Visual Vastness" and "Information Fidelity" inspired by global industry leaders (**Steelcase**, **Herman Miller**) and local benchmarks (**Oando**, **Catalog India**).

---

## 🛡️ Workspace Safety & Environment

- **POLICY: BACKUP-ONLY**: No file deletion. All legacy code or removed assets MUST be archived to `e:\ourwebsite\backup/`.
- **ENVIRONMENT**: Next.js 16.1.6, React 19.2.4, Turbopack enabled (`--turbo`).
- **RULES**: Codified in [safety_rules.md](file:///e:/ourwebsite/.agent/rules/safety_rules.md).

---

## 1. Design Language: "THE VASTNESS" (Metric-Driven)

_Targeting the aesthetics of Herman Miller and Steelcase._

### A. Typography Tokens

- **Hero H1 Scale**: `90px` (Desktop) / `48px` (Mobile) font-size.
- **Letter Spacing**: `-0.022em` (Tight tracking for large headers).
- **Secondary Headers**: `Sans-serif`, bold, uppercase with `0.2em` tracking for technical context.
- **Micro-Copy**: `10px` bold uppercase tracking for labels.

### B. Spatial Layout ("Breathing Room")

- **Standard Section Padding**: Mandatory `128px` (8rem) vertical padding for all major content segments.
- **Horizontal Container**: Max-width `2000px` for ultra-wide screen immersion.
- **Aspect Ratios**:
  - **Cinematic Banners**: `5:1` or `21:9` for section starts.
  - **Product Portraits**: `1:1` or `4:5` with high internal whitespace.
  - **Gallery Grids**: Mixed masonry (asymmetric) for a premium architectural feel.

---

## 2. Technical Infrastructure (Hardware Accelerated)

- **Universal GPU Injection**: `motion-gpu`, `translate3d(0,0,0)`, and `will-change` hints on all animated layers.
- **Viewport Optimization**: `powerPreference: "high-performance"` with adaptive `dpr` (up to `2.5`) for 3D viewers.
- **State Management**: Zero-latency transitions using `Zustand` and query-parameter-driven UI state (e.g., Specs drawer toggles).

---

## 3. Information Fidelity: THE MASTER CATALOG

_Mapping the technical depth of catalogindia.in and oando.co.in._

### A. Data Schema Requirements

Each product in `catalog.ts` must eventually contain:

- **`specifications`**: Granular numeric data (e.g., `635 ± 10 mm`) including overall dimensions, adjustment ranges, and material lists.
- **`gallery_sets`**:
  - `studio`: High-res product-on-white.
  - `lifestyle`: Architectural contextual shots (office/collaborative settings).
  - `technical`: CAD-style wireframes/drawings for dimension visualization.
- **`metadata`**: Tags for BIFMA certification, sustainability scores, and sub-category filtering.

### B. Interaction Model

- **Real-Time Swatch Swapping**: Product images and 3D models must update instantaneously upon selection.
- **Technical Drawer**: Side-sliding spec sheets instead of accordions to preserve layout "vastness."

---

## 4. Execution Phases

### Phase 1: Global Aesthetic Reset (Current)

- [x] Consolidate into root directory and enable Turbopack.
- [/] **Styling Audit**: Update `globals.css` with 90px typography and 128px padding utilities.
- [/] **Component Refactor**: Inject `motion-gpu` into all Hero and Gallery components.

### Phase 2: High-Fidelity Data Ingestion

- [ ] Enrich `catalog.ts` using scrapers/pulls from `oando.co.in` and `catalogindia.in`.
- [ ] Integrate CAD-style wireframes for the "Dimensions" tab.

### Phase 3: The Storytelling Layers

- [ ] Build `ContentBlock` (Zig-Zag) for Solutions narrative.
- [ ] Finalize "Cinema" variants for all Home components.

---

> [!IMPORTANT]
> If a section looks "crowded," it violates the Master Plan. Triple the whitespace and increase the font size. No compromises on Vastness.
