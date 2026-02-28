import { NextResponse } from "next/server";
import type { CompatProduct } from "@/lib/getProducts";
import { getCatalog } from "@/lib/getProducts";
import {
  AFC_CATEGORY_ORDER,
  classifyToRequestedCategory,
  getAfcCategoryLabel,
} from "@/lib/afcCategories";
import { groupCategories, type CategoryApiItem } from "@/lib/navigation";

type FlattenedProduct = {
  product: CompatProduct;
  baseCategoryId: string;
  seriesName: string;
};

function normalizeSubcategory(value: unknown): string {
  const text = String(value || "").trim();
  return text.length > 0 ? text : "General";
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

      const subcategory = normalizeSubcategory(item.product.metadata?.subcategory);
      const bucket = subMap.get(mappedCategory)!;
      bucket.set(subcategory, (bucket.get(subcategory) || 0) + 1);
    }

    const categories: CategoryApiItem[] = AFC_CATEGORY_ORDER.map((categoryId) => {
      const subcategories = [...(subMap.get(categoryId)?.entries() || [])]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([name, count]) => ({
          id: subcategoryId(name),
          name,
          count,
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
