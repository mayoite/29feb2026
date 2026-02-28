import { NextResponse } from "next/server";
import type { CompatProduct } from "@/lib/getProducts";
import { getCatalog } from "@/lib/getProducts";
import {
  AFC_CATEGORY_ORDER,
  AFC_SUBCATEGORY_LABELS,
  classifyToRequestedCategory,
  getAfcCategoryLabel,
} from "@/lib/afcCategories";
import { groupCategories, type CategoryApiItem } from "@/lib/navigation";

export const dynamic = "force-dynamic";

type FlattenedProduct = {
  product: CompatProduct;
  baseCategoryId: string;
  seriesName: string;
};

function normalizeSubcategory(value: unknown): string {
  const text = String(value || "").trim();
  return text.length > 0 ? text : "General";
}

function canonicalizeSubcategory(categoryId: string, rawValue: unknown): string {
  const value = normalizeSubcategory(rawValue).toLowerCase();

  if (categoryId === "seating") {
    if (value.includes("mesh")) return "Mesh chairs";
    if (value.includes("training")) return "Training chairs";
    if (value.includes("cafe") || value.includes("stool")) return "Cafe chairs";
    return "Leather chairs";
  }

  if (categoryId === "workstations") {
    if (value.includes("height")) return "Height Adjustable Series";
    if (value.includes("panel")) return "Panel Series";
    return "Desking Series";
  }

  if (categoryId === "tables") {
    if (value.includes("meeting") || value.includes("conference")) return "Meeting Tables";
    if (value.includes("cafe")) return "Cafe Tables";
    if (value.includes("training")) return "Training Tables";
    return "Cabin Tables";
  }

  if (categoryId === "storages") {
    if (value.includes("locker")) return "Locker";
    if (value.includes("compactor")) return "Compactor Storage";
    if (value.includes("metal")) return "Metal Storage";
    return "Prelam Storage";
  }

  if (categoryId === "soft-seating") {
    if (value.includes("sofa")) return "Sofa";
    if (value.includes("collaborative") || value.includes("pod")) return "Collaborative";
    if (value.includes("pouf") || value.includes("pouffee") || value.includes("ottoman")) {
      return "Pouffee";
    }
    if (
      value.includes("occasional table") ||
      value.includes("coffee table") ||
      value.includes("side table")
    ) {
      return "Occasional Tables";
    }
    return "Lounge";
  }

  if (value.includes("library")) return "Library";
  if (value.includes("hostel")) return "Hostel";
  if (value.includes("auditorium")) return "Auditorium";
  return "Classroom";
}

function subcategoryId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const baseCatalog = await getCatalog();
    const flat: FlattenedProduct[] = [];

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

    const countMap = new Map<string, number>();
    const subMap = new Map<string, Map<string, number>>();

    for (const categoryId of AFC_CATEGORY_ORDER) {
      countMap.set(categoryId, 0);
      subMap.set(categoryId, new Map<string, number>());
    }

    for (const item of flat) {
      const mappedCategory = classifyToRequestedCategory({
        product: item.product,
        baseCategoryId: item.baseCategoryId,
        seriesName: item.seriesName,
      });
      countMap.set(mappedCategory, (countMap.get(mappedCategory) || 0) + 1);

      const subcategory = canonicalizeSubcategory(
        mappedCategory,
        item.product.metadata?.subcategory,
      );
      const bucket = subMap.get(mappedCategory)!;
      bucket.set(subcategory, (bucket.get(subcategory) || 0) + 1);
    }

    const categories: CategoryApiItem[] = AFC_CATEGORY_ORDER.map((categoryId) => {
      const counts = subMap.get(categoryId) || new Map<string, number>();
      const canonicalOrder = AFC_SUBCATEGORY_LABELS[categoryId] || [];
      const ordered = [...canonicalOrder];

      for (const name of counts.keys()) {
        if (!ordered.includes(name)) ordered.push(name);
      }

      const subcategories = ordered.map((name) => ({
          id: subcategoryId(name),
          name,
          count: counts.get(name),
          href: `/products/${categoryId}?sub=${encodeURIComponent(name)}`,
        }));

      return {
        id: categoryId,
        name: getAfcCategoryLabel(categoryId, categoryId),
        count: countMap.get(categoryId) || 0,
        subcategories,
      };
    });

    const groups = groupCategories(categories);
    return NextResponse.json({ groups, categories });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nav categories fetch failed" },
      { status: 500 },
    );
  }
}
