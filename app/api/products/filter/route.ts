import { NextRequest, NextResponse } from "next/server";
import Fuse from "fuse.js";
import { buildRequestedCategoryCatalog } from "@/lib/afcCategories";
import { getCatalog, type CompatProduct } from "@/lib/getProducts";
import {
  PRICE_RANGES,
  parseEcoMin,
  parseSortOption,
  normalizeOptionValue,
  type SortOption,
} from "@/lib/productFilters";

export const dynamic = "force-dynamic";

export interface FlatProduct extends CompatProduct {
  seriesId: string;
  seriesName: string;
  altText: string;
}

interface AppliedFilters {
  category: string;
  q: string;
  series: string;
  sub: string[];
  price: string[];
  mat: string[];
  headrest: boolean;
  heightAdj: boolean;
  bifma: boolean;
  stackable: boolean;
  ecoMin: number | null;
  sort: SortOption;
}

interface FilterResponse {
  products: FlatProduct[];
  total: number;
  facets: {
    series: string[];
    subcategory: string[];
    material: string[];
    priceRange: string[];
    ecoMin: { min: number; max: number };
    featureAvailability: {
      hasHeadrest: boolean;
      isHeightAdjustable: boolean;
      bifmaCertified: boolean;
      isStackable: boolean;
    };
  };
  meta: {
    categoryId: string;
    applied: AppliedFilters;
    catalogTotal: number;
  };
}

function productAltText(product: CompatProduct, categoryLabel: string): string {
  const metadata = (product.metadata || {}) as Record<string, unknown>;
  const aiAltText =
    (typeof metadata.ai_alt_text === "string" && metadata.ai_alt_text) ||
    (typeof metadata.aiAltText === "string" && metadata.aiAltText) ||
    "";
  const explicitAlt =
    (product as unknown as { altText?: string; alt_text?: string }).altText ||
    (product as unknown as { altText?: string; alt_text?: string }).alt_text ||
    aiAltText;

  const fallback = `${product.name} ${categoryLabel}`.replace(/\s+/g, " ").trim();
  return (explicitAlt || fallback).replace(/\s+/g, " ").trim().slice(0, 140);
}

function toFlatProduct(categoryLabel: string, seriesId: string, seriesName: string, product: CompatProduct): FlatProduct {
  return {
    ...product,
    seriesId,
    seriesName,
    altText: productAltText(product, categoryLabel),
  };
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

function parseAppliedFilters(request: NextRequest): AppliedFilters {
  const sp = request.nextUrl.searchParams;
  const sub = Array.from(new Set(sp.getAll("sub").map((v) => v.trim()).filter(Boolean)));
  const price = Array.from(
    new Set(
      sp
        .getAll("price")
        .filter((v) => PRICE_RANGES.includes(v as (typeof PRICE_RANGES)[number])),
    ),
  );
  const mat = Array.from(new Set(sp.getAll("mat").map((v) => v.trim()).filter(Boolean)));

  return {
    category: (sp.get("category") || "").trim(),
    q: (sp.get("q") || "").trim(),
    series: (sp.get("series") || "all").trim() || "all",
    sub,
    price,
    mat,
    headrest: sp.get("headrest") === "1",
    heightAdj: sp.get("heightAdj") === "1" || sp.get("height-adj") === "1",
    bifma: sp.get("bifma") === "1",
    stackable: sp.get("stackable") === "1",
    ecoMin: parseEcoMin(sp.get("ecoMin")),
    sort: parseSortOption(sp.get("sort")),
  };
}

function buildFacets(products: FlatProduct[]): FilterResponse["facets"] {
  const series = uniqueSorted(products.map((product) => product.seriesName || "").filter(Boolean));
  const subcategory = uniqueSorted(
    products.map((product) => product.metadata?.subcategory || "").filter(Boolean),
  );
  const material = uniqueSorted(
    products.flatMap((product) => product.metadata?.material || []).filter(Boolean),
  );
  const priceRange = PRICE_RANGES.filter((range) =>
    products.some((product) => product.metadata?.priceRange === range),
  );

  const ecoScores = products
    .map((product) => product.metadata?.sustainabilityScore)
    .filter((score): score is number => typeof score === "number");
  const ecoMin = ecoScores.length > 0 ? Math.min(...ecoScores) : 0;
  const ecoMax = ecoScores.length > 0 ? Math.max(...ecoScores) : 10;

  const total = products.length;
  const withHeadrest = products.filter((product) => Boolean(product.metadata?.hasHeadrest)).length;
  const withHeightAdj = products.filter((product) => Boolean(product.metadata?.isHeightAdjustable)).length;
  const withBifma = products.filter((product) => Boolean(product.metadata?.bifmaCertified)).length;
  const withStackable = products.filter((product) => Boolean(product.metadata?.isStackable)).length;

  return {
    series,
    subcategory,
    material,
    priceRange,
    ecoMin: { min: ecoMin, max: ecoMax },
    featureAvailability: {
      hasHeadrest: withHeadrest > 0 && withHeadrest < total,
      isHeightAdjustable: withHeightAdj > 0 && withHeightAdj < total,
      bifmaCertified: withBifma > 0 && withBifma < total,
      isStackable: withStackable > 0 && withStackable < total,
    },
  };
}

function applyFilters(products: FlatProduct[], filters: AppliedFilters): FlatProduct[] {
  let list = [...products];

  if (filters.series !== "all") {
    const seriesNeedle = normalizeOptionValue(filters.series);
    list = list.filter((product) => normalizeOptionValue(product.seriesName) === seriesNeedle);
  }

  if (filters.q.length > 0) {
    const fuse = new Fuse(list, {
      keys: ["name", "description", "seriesName", "metadata.subcategory", "metadata.category", "metadata.tags"],
      threshold: 0.35,
      ignoreLocation: true,
    });
    const ids = new Set(fuse.search(filters.q).map((result) => result.item.id));
    list = list.filter((product) => ids.has(product.id));
  }

  if (filters.sub.length > 0) {
    const needles = new Set(filters.sub.map((value) => normalizeOptionValue(value)));
    list = list.filter((product) => {
      const subcategory = normalizeOptionValue(product.metadata?.subcategory || "");
      return needles.has(subcategory);
    });
  }

  if (filters.price.length > 0) {
    const needles = new Set(filters.price);
    list = list.filter((product) => product.metadata?.priceRange && needles.has(product.metadata.priceRange));
  }

  if (filters.mat.length > 0) {
    const needles = new Set(filters.mat.map((value) => normalizeOptionValue(value)));
    list = list.filter((product) =>
      (product.metadata?.material || []).some((material) =>
        needles.has(normalizeOptionValue(material)),
      ),
    );
  }

  if (filters.headrest) {
    list = list.filter((product) => Boolean(product.metadata?.hasHeadrest));
  }
  if (filters.heightAdj) {
    list = list.filter((product) => Boolean(product.metadata?.isHeightAdjustable));
  }
  if (filters.bifma) {
    list = list.filter((product) => Boolean(product.metadata?.bifmaCertified));
  }
  if (filters.stackable) {
    list = list.filter((product) => Boolean(product.metadata?.isStackable));
  }
  if (typeof filters.ecoMin === "number") {
    list = list.filter((product) => (product.metadata?.sustainabilityScore || 0) >= filters.ecoMin!);
  }

  list.sort((left, right) => {
    if (filters.sort === "za") return right.name.localeCompare(left.name);
    if (filters.sort === "ecoDesc") {
      return (right.metadata?.sustainabilityScore || 0) - (left.metadata?.sustainabilityScore || 0);
    }
    if (filters.sort === "ecoAsc") {
      return (left.metadata?.sustainabilityScore || 0) - (right.metadata?.sustainabilityScore || 0);
    }
    return left.name.localeCompare(right.name);
  });

  return list;
}

export async function GET(request: NextRequest) {
  const filters = parseAppliedFilters(request);
  if (!filters.category) {
    return NextResponse.json(
      {
        products: [],
        total: 0,
        facets: {
          series: [],
          subcategory: [],
          material: [],
          priceRange: [],
          ecoMin: { min: 0, max: 10 },
          featureAvailability: {
            hasHeadrest: false,
            isHeightAdjustable: false,
            bifmaCertified: false,
            isStackable: false,
          },
        },
        meta: { categoryId: "", applied: filters, catalogTotal: 0 },
      } satisfies FilterResponse,
      { status: 400 },
    );
  }

  try {
    const catalog = buildRequestedCategoryCatalog(await getCatalog());
    const category = catalog.find((entry) => entry.id === filters.category);

    if (!category) {
      return NextResponse.json(
        {
          products: [],
          total: 0,
          facets: {
            series: [],
            subcategory: [],
            material: [],
            priceRange: [],
            ecoMin: { min: 0, max: 10 },
            featureAvailability: {
              hasHeadrest: false,
              isHeightAdjustable: false,
              bifmaCertified: false,
              isStackable: false,
            },
          },
          meta: { categoryId: filters.category, applied: filters, catalogTotal: 0 },
        } satisfies FilterResponse,
        { status: 404 },
      );
    }

    const allProducts = category.series.flatMap((series) =>
      series.products.map((product) =>
        toFlatProduct(category.name, series.id, series.name, product),
      ),
    );

    const facets = buildFacets(allProducts);
    const filtered = applyFilters(allProducts, filters);

    return NextResponse.json(
      {
        products: filtered,
        total: filtered.length,
        facets,
        meta: {
          categoryId: category.id,
          applied: filters,
          catalogTotal: allProducts.length,
        },
      } satisfies FilterResponse,
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        products: [],
        total: 0,
        facets: {
          series: [],
          subcategory: [],
          material: [],
          priceRange: [],
          ecoMin: { min: 0, max: 10 },
          featureAvailability: {
            hasHeadrest: false,
            isHeightAdjustable: false,
            bifmaCertified: false,
            isStackable: false,
          },
        },
        meta: {
          categoryId: filters.category,
          applied: filters,
          catalogTotal: 0,
        },
      } satisfies FilterResponse,
      { status: 500 },
    );
  }
}
