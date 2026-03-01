import { supabase } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { ProductViewer } from "./ProductViewer";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { Product, CompatProduct, ProductVariant } from "@/lib/getProducts";
import { classifyToRequestedCategory } from "@/lib/afcCategories";

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

type CategoryResolutionRow = {
  id?: string;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  category_id?: string | null;
  series_name?: string | null;
  metadata?: Product["metadata"] | null;
  images?: string[] | null;
  flagship_image?: string | null;
};

function resolveRequestedCategoryId(
  row: CategoryResolutionRow,
  fallbackCategoryId?: string,
): string {
  const rawCategoryId = row.category_id || fallbackCategoryId || "";
  const aliased = LEGACY_CATEGORY_REDIRECTS[rawCategoryId];
  if (aliased) return aliased;

  return classifyToRequestedCategory({
    baseCategoryId: rawCategoryId,
    seriesName: row.series_name || "",
    product: {
      id: row.id || row.slug || rawCategoryId,
      slug: row.slug || "",
      name: row.name || "",
      description: row.description || "",
      flagshipImage: row.flagship_image || "",
      sceneImages: [],
      variants: [],
      detailedInfo: {
        overview: "",
        features: [],
        dimensions: "",
        materials: [],
      },
      metadata: row.metadata || {},
      images: Array.isArray(row.images) ? row.images : [],
    },
  });
}

export async function generateStaticParams() {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, category_id, name, description, metadata, series_name, images, flagship_image",
    );
  if (error || !data) {
    console.error("Error fetching products for static params:", error);
    return [];
  }

  const seen = new Set<string>();
  const params: Array<{ category: string; slug: string }> = [];
  for (const row of data as CategoryResolutionRow[]) {
    if (!row.slug) continue;
    const category = resolveRequestedCategoryId(row);
    const key = `${category}::${row.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    params.push({ category, slug: row.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category: categoryId, slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, category_id, metadata, series_name, images, flagship_image",
    )
    .eq("slug", slug)
    .single();

  if (!product) return {};
  const resolvedCategoryId = resolveRequestedCategoryId(
    product as CategoryResolutionRow,
    categoryId,
  );

  const title = `${product.name} | One and Only Furniture`;
  const description =
    product.description ||
    `${product.name} — premium office furniture from One and Only Furniture.`;
  const images = Array.isArray(product.images) ? product.images : [];
  const image =
    (images.length > 0 ? images[0] : null) ||
    product.flagship_image ||
    "/images/fallback/category.webp";
  const url = `${BASE_URL}/products/${resolvedCategoryId}/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

function ProductLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-4 w-full max-w-4xl px-6">
        <div className="h-96 bg-neutral-100 rounded" />
        <div className="h-8 bg-neutral-100 rounded w-1/3" />
        <div className="h-4 bg-neutral-100 rounded w-2/3" />
      </div>
    </div>
  );
}

async function ProductContent({
  categoryId,
  slug,
  fromQuery,
}: {
  categoryId: string;
  slug: string;
  fromQuery?: string;
}) {
  const { data: rawProduct } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!rawProduct) {
    notFound();
  }

  const p = rawProduct as Product & {
    alt_text?: string;
    metadata?: (Product["metadata"] & { ai_alt_text?: string }) | null;
    scene_images?: string[] | null;
    detailed_info?: {
      overview?: string;
      features?: string[];
      dimensions?: string;
      materials?: string[];
    } | null;
    variants?: unknown;
  };
  const resolvedCategoryId = resolveRequestedCategoryId(
    p as CategoryResolutionRow,
    categoryId,
  );
  if (categoryId !== resolvedCategoryId) {
    redirect(`/products/${resolvedCategoryId}/${slug}`);
  }
  const aiOverview = p.alt_text || p.metadata?.ai_alt_text || p.description || "";
  const deterministicAlt =
    p.alt_text ||
    p.metadata?.ai_alt_text ||
    `${p.name} ${resolvedCategoryId.replace(/-/g, " ")}`.replace(/\s+/g, " ").trim();
  const variantList: ProductVariant[] = Array.isArray(p.variants)
    ? p.variants
        .map((variant, idx) => {
          const v = variant as {
            id?: string;
            variantName?: string;
            galleryImages?: string[];
            threeDModelUrl?: string;
          };
          return {
            id: v.id || `variant-${idx + 1}`,
            variantName: v.variantName || `Option ${idx + 1}`,
            galleryImages: Array.isArray(v.galleryImages)
              ? v.galleryImages.filter(Boolean)
              : [],
            threeDModelUrl: v.threeDModelUrl || undefined,
          };
        })
        .filter((variant) => variant.galleryImages.length > 0 || variant.threeDModelUrl)
    : [];

  const compatProduct: CompatProduct = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description || "",
    flagshipImage: p.flagship_image || "",
    sceneImages: Array.isArray(p.scene_images) ? p.scene_images.filter(Boolean) : [],
    images: p.images || [],
    threeDModelUrl: variantList.find((v) => v.threeDModelUrl)?.threeDModelUrl,
    variants: variantList,
    detailedInfo: {
      overview: p.detailed_info?.overview || aiOverview,
      features:
        p.detailed_info?.features?.filter(Boolean) ||
        p.specs?.features?.filter(Boolean) ||
        p.features?.filter(Boolean) ||
        [],
      dimensions: p.detailed_info?.dimensions || p.specs?.dimensions || "",
      materials:
        p.detailed_info?.materials?.filter(Boolean) ||
        p.specs?.materials?.filter(Boolean) ||
        [],
    },
    metadata: p.metadata || {},
    altText: deterministicAlt,
  };

  const categoryRoute = fromQuery
    ? `/products/${resolvedCategoryId}?${fromQuery}`
    : `/products/${resolvedCategoryId}`;

  const url = `${BASE_URL}/products/${resolvedCategoryId}/${p.slug}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: aiOverview,
    image: p.images || [p.flagship_image],
    url,
    brand: { "@type": "Brand", name: "One and Only Furniture" },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "INR",
      seller: { "@type": "Organization", name: "One and Only Furniture" },
    },
    category: resolvedCategoryId,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductViewer
        product={compatProduct}
        seriesName={p.series_name}
        categoryRoute={categoryRoute}
        categoryId={resolvedCategoryId}
      />
    </>
  );
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category: categoryId, slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawFrom = resolvedSearchParams.from;
  const fromQuery = Array.isArray(rawFrom) ? rawFrom[0] : rawFrom;
  const safeFromQuery =
    typeof fromQuery === "string" && fromQuery.length > 0
      ? fromQuery.slice(0, 1500)
      : undefined;

  return (
    <Suspense fallback={<ProductLoadingSkeleton />}>
      <ProductContent categoryId={categoryId} slug={slug} fromQuery={safeFromQuery} />
    </Suspense>
  );
}
