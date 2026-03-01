import { getCatalog } from "@/lib/getProducts";
import type { CompatCategory } from "@/lib/getProducts";
import { notFound, redirect } from "next/navigation";
import { Hero } from "@/components/home/Hero";
import { FilterGrid } from "./FilterGrid";
import Link from "next/link";
import { supabase } from "@/lib/db";
import { fetchWithSupabaseRetry } from "@/lib/supabaseSafe";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Catalog_CATEGORY_ORDER,
  buildRequestedCategoryCatalog,
  getCatalogCategoryDescription,
  getCatalogCategoryLabel,
} from "@/lib/catalogCategories";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.oando.co.in";

const LEGACY_CATEGORY_REDIRECTS: Record<string, string> = {
  "oando-seating": "seating",
  "oando-workstations": "workstations",
  "oando-tables": "tables",
  "oando-storage": "storages",
  "oando-soft-seating": "soft-seating",
  "oando-collaborative": "soft-seating",
  "oando-educational": "education",
  "oando-chairs": "seating",
  "oando-other-seating": "seating",
  "chairs-mesh": "seating",
  "chairs-others": "seating",
  "cafe-seating": "seating",
  "desks-cabin-tables": "tables",
  "meeting-conference-tables": "tables",
  "others-1": "soft-seating",
  "others-2": "seating",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categoryId } = await params;
  const redirectedId = LEGACY_CATEGORY_REDIRECTS[categoryId] || categoryId;
  const requestedCatalog = buildRequestedCategoryCatalog(await getCatalog());
  const category = requestedCatalog.find(
    (c: CompatCategory) => c.id === redirectedId,
  );
  if (!category) return {};
  const displayName = getCatalogCategoryLabel(redirectedId, category.name);
  const displayDescription = getCatalogCategoryDescription(
    redirectedId,
    category.description,
  );
  const title = `${displayName} | One and Only Furniture`;
  const description = `${displayDescription} Browse our full range of ${displayName.toLowerCase()} in Patna, Bihar.`;
  const url = `${BASE_URL}/products/${redirectedId}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export async function generateStaticParams() {
  const data = await fetchWithSupabaseRetry<Array<{ category_id: string | null }>>(
    "category-static-params",
    async () => supabase.from("products").select("category_id"),
    [],
  );
  const legacyCategoryIds = [
    ...new Set((data ?? []).map((p) => p.category_id).filter(Boolean)),
  ];
  const merged = [...new Set([...Catalog_CATEGORY_ORDER, ...legacyCategoryIds])];
  return merged.map((category) => ({ category }));
}

// Loading skeleton for the grid while Supabase data resolves
function GridSkeleton() {
  return (
    <div className="container-wide py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-neutral-100 rounded-sm aspect-4/3"
          />
        ))}
      </div>
    </div>
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categoryId } = await params;
  const redirectedId = LEGACY_CATEGORY_REDIRECTS[categoryId];
  if (redirectedId) {
    redirect(`/products/${redirectedId}`);
  }
  const requestedCatalog = buildRequestedCategoryCatalog(await getCatalog());
  const category = requestedCatalog.find((c: CompatCategory) => c.id === categoryId);

  if (requestedCatalog.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
        <h1 className="text-2xl font-light mb-4 text-neutral-900">
          Workspace Engineering Engine - Offline
        </h1>
        <p className="max-w-md text-neutral-500 mb-8">
          Product data is temporarily unavailable. You can continue from the
          fallback product snapshot while the database reconnects.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-6 py-2 bg-primary text-white text-sm tracking-widest uppercase font-bold"
          >
            Return Home
          </Link>
          <Link
            href="/fallback/fallback-products.html"
            className="px-6 py-2 border border-neutral-300 text-neutral-800 text-sm tracking-widest uppercase font-bold"
          >
            Open Fallback
          </Link>
        </div>
      </div>
    );
  }

  if (!category) {
    notFound();
  }
  const normalizedCategory: CompatCategory = {
    ...category,
    name: getCatalogCategoryLabel(categoryId, category.name),
    description: getCatalogCategoryDescription(categoryId, category.description),
  };

  const firstProductWithImage = normalizedCategory.series
    .flatMap((series) => series.products)
    .find((product) => product.images?.[0] || product.flagshipImage);
  const heroImage =
    firstProductWithImage?.images?.[0] ||
    firstProductWithImage?.flagshipImage ||
    "/images/hero/hero-1.webp";

  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <Hero
        variant="small"
        title={normalizedCategory.name}
        subtitle={normalizedCategory.description}
        showButton={false}
        backgroundImage={heroImage}
      />
      <Suspense fallback={<GridSkeleton />}>
        <FilterGrid category={normalizedCategory} categoryId={categoryId} />
      </Suspense>
    </main>
  );
}

