import type { CompatCategory, CompatProduct, CompatSeries } from "@/lib/getProducts";

export const AFC_CATEGORY_ORDER = [
  "seating",
  "workstations",
  "tables",
  "storages",
  "soft-seating",
  "education",
] as const;

export type RequestedCategoryId = (typeof AFC_CATEGORY_ORDER)[number];

export const AFC_CATEGORY_LABELS: Record<RequestedCategoryId, string> = {
  seating: "Seating",
  workstations: "Workstations",
  tables: "Tables",
  storages: "Storages",
  "soft-seating": "Soft Seating",
  education: "Education",
};

export const AFC_CATEGORY_DESCRIPTIONS: Record<RequestedCategoryId, string> = {
  seating: "Leather, mesh, training and cafe chair collections.",
  workstations: "Height-adjustable, panel and desking workstation systems.",
  tables: "Cabin, meeting, training and cafe table collections.",
  storages: "Compactor, metal and prelam storage systems.",
  "soft-seating": "Lounge and comfort-focused seating collections.",
  education: "Classroom, auditorium, hostel and library furniture systems.",
};

export const AFC_SUBCATEGORY_LABELS: Record<RequestedCategoryId, readonly string[]> = {
  seating: ["Mesh Chair", "Leather Chair", "Training Chair", "Cafe Chair"],
  workstations: ["Height Adjustable Series", "Desking Series", "Panel Series"],
  tables: ["Cabin Tables", "Meeting Tables", "Cafe Tables", "Training Tables"],
  storages: ["Prelam Storage", "Metal Storage", "Compactor Storage", "Locker"],
  "soft-seating": ["Lounge", "Sofa", "Collaborative", "Pouffee", "Occasional Tables"],
  education: ["Classroom", "Library", "Hostel", "Auditorium"],
};

type ProductWithContext = {
  product: CompatProduct;
  baseCategoryId: string;
  seriesName: string;
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function productText(item: ProductWithContext): string {
  const p = item.product;
  return normalize(
    [
      p.id,
      p.slug || "",
      p.name,
      p.description || "",
      item.baseCategoryId,
      item.seriesName,
      p.metadata?.category || "",
      p.metadata?.subcategory || "",
      ...(p.metadata?.tags || []),
    ].join(" "),
  );
}

function hasToken(text: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
  return re.test(text);
}

export function classifyToRequestedCategory(
  item: ProductWithContext,
): RequestedCategoryId {
  const text = productText(item);
  const baseCategoryId = item.baseCategoryId;

  if (baseCategoryId === "oando-educational") return "education";
  if (baseCategoryId === "oando-storage") return "storages";
  if (baseCategoryId === "oando-tables") return "tables";
  if (baseCategoryId === "oando-soft-seating") return "soft-seating";
  if (baseCategoryId === "oando-collaborative") return "soft-seating";
  if (baseCategoryId === "oando-workstations") return "workstations";
  if (
    baseCategoryId === "oando-seating" ||
    baseCategoryId === "oando-other-seating" ||
    baseCategoryId === "oando-chairs"
  ) {
    return "seating";
  }

  if (
    hasToken(text, "classroom") ||
    hasToken(text, "auditorium") ||
    hasToken(text, "hostel") ||
    hasToken(text, "library")
  ) {
    return "education";
  }

  if (
    hasToken(text, "compactor") ||
    hasToken(text, "metal storage") ||
    hasToken(text, "prelam") ||
    hasToken(text, "locker") ||
    hasToken(text, "pedestal") ||
    hasToken(text, "cabinet")
  ) {
    return "storages";
  }

  if (
    hasToken(text, "lounge") ||
    hasToken(text, "sofa") ||
    hasToken(text, "collaborative") ||
    hasToken(text, "pouffee") ||
    hasToken(text, "pouf") ||
    hasToken(text, "pod")
  ) {
    return "soft-seating";
  }

  if (
    hasToken(text, "height adjustable") ||
    hasToken(text, "height-adjustable") ||
    hasToken(text, "panel series") ||
    hasToken(text, "desking series") ||
    hasToken(text, "workstation") ||
    hasToken(text, "deskpro") ||
    hasToken(text, "fenix")
  ) {
    return "workstations";
  }

  if (
    hasToken(text, "cabin table") ||
    hasToken(text, "meeting table") ||
    hasToken(text, "training table") ||
    hasToken(text, "cafe table") ||
    hasToken(text, "conference table") ||
    hasToken(text, "table")
  ) {
    return "tables";
  }

  if (
    hasToken(text, "leather chair") ||
    hasToken(text, "mesh chair") ||
    hasToken(text, "training chair") ||
    hasToken(text, "cafe chair") ||
    hasToken(text, "chair")
  ) {
    return "seating";
  }

  return "seating";
}

function classifyToRequestedSubcategory(
  categoryId: RequestedCategoryId,
  item: ProductWithContext,
): string {
  const text = productText(item);

  if (categoryId === "seating") {
    if (hasToken(text, "mesh")) return "Mesh Chair";
    if (hasToken(text, "training")) return "Training Chair";
    if (hasToken(text, "cafe") || hasToken(text, "stool")) return "Cafe Chair";
    return "Leather Chair";
  }

  if (categoryId === "workstations") {
    if (hasToken(text, "height adjustable") || hasToken(text, "height-adjustable")) {
      return "Height Adjustable Series";
    }
    if (hasToken(text, "panel")) return "Panel Series";
    return "Desking Series";
  }

  if (categoryId === "tables") {
    if (hasToken(text, "meeting") || hasToken(text, "conference")) return "Meeting Tables";
    if (hasToken(text, "cafe")) return "Cafe Tables";
    if (hasToken(text, "training")) return "Training Tables";
    return "Cabin Tables";
  }

  if (categoryId === "storages") {
    if (hasToken(text, "locker")) return "Locker";
    if (hasToken(text, "compactor")) return "Compactor Storage";
    if (hasToken(text, "metal")) return "Metal Storage";
    return "Prelam Storage";
  }

  if (categoryId === "soft-seating") {
    if (hasToken(text, "sofa")) return "Sofa";
    if (hasToken(text, "collaborative") || hasToken(text, "pod")) return "Collaborative";
    if (
      hasToken(text, "occasional table") ||
      hasToken(text, "coffee table") ||
      hasToken(text, "side table")
    ) {
      return "Occasional Tables";
    }
    if (hasToken(text, "pouffee") || hasToken(text, "pouf") || hasToken(text, "ottoman")) {
      return "Pouffee";
    }
    return "Lounge";
  }

  if (hasToken(text, "library")) return "Library";
  if (hasToken(text, "hostel")) return "Hostel";
  if (hasToken(text, "auditorium")) return "Auditorium";
  return "Classroom";
}

export function getAfcCategoryLabel(categoryId: string, fallback: string): string {
  return AFC_CATEGORY_LABELS[categoryId as RequestedCategoryId] || fallback;
}

export function getAfcCategoryDescription(
  categoryId: string,
  fallback: string,
): string {
  return AFC_CATEGORY_DESCRIPTIONS[categoryId as RequestedCategoryId] || fallback;
}

export function getAfcCategoryHref(categoryId: string): string {
  return `/products/${categoryId}`;
}

export function buildAfcCategoryNav(categoryIds: readonly string[]) {
  return categoryIds.map((id) => ({
    id,
    label: getAfcCategoryLabel(id, id),
    href: getAfcCategoryHref(id),
  }));
}

export function buildRequestedCategoryCatalog(
  baseCatalog: CompatCategory[],
): CompatCategory[] {
  const flat: ProductWithContext[] = [];
  for (const category of baseCatalog) {
    for (const series of category.series) {
      for (const product of series.products) {
        flat.push({
          product,
          baseCategoryId: category.id,
          seriesName: series.name,
        });
      }
    }
  }

  const buckets = new Map<RequestedCategoryId, ProductWithContext[]>();
  for (const id of AFC_CATEGORY_ORDER) buckets.set(id, []);
  for (const item of flat) {
    const bucketId = classifyToRequestedCategory(item);
    buckets.get(bucketId)!.push(item);
  }

  return AFC_CATEGORY_ORDER.map((id) => {
    const products = buckets.get(id) || [];
    const seriesMap = new Map<string, CompatProduct[]>();
    for (const item of products) {
      const key = item.seriesName || "Series";
      if (!seriesMap.has(key)) seriesMap.set(key, []);
      const canonicalSubcategory = classifyToRequestedSubcategory(id, item);
      seriesMap.get(key)!.push({
        ...item.product,
        metadata: {
          ...(item.product.metadata || {}),
          category: AFC_CATEGORY_LABELS[id],
          subcategory: canonicalSubcategory,
        },
      });
    }

    const series: CompatSeries[] = [...seriesMap.entries()]
      .map(([name, sProducts], idx) => ({
        id: `${id}-series-${idx + 1}`,
        name,
        description: `${AFC_CATEGORY_LABELS[id]} series`,
        products: sProducts.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      id,
      name: AFC_CATEGORY_LABELS[id],
      description: AFC_CATEGORY_DESCRIPTIONS[id],
      series,
    };
  });
}
