import { supabase } from "./db";
import { oandoCatalog } from "./catalog";

// ── Supabase-sourced Product types ──────────────────────────────────────────

export interface ProductVariant {
    id: string;
    variantName: string;
    galleryImages: string[];
    threeDModelUrl?: string;
}

export interface ProductDetailedInfo {
    overview: string;
    features: string[];
    dimensions: string;
    materials: string[];
}

export interface ProductMetadata {
    source?: string;
    category?: string;
    subcategory?: string;
    bifmaCertified?: boolean;
    warrantyYears?: number;
    sustainabilityScore?: number;
    tags?: string[];
    priceRange?: "budget" | "mid" | "premium" | "luxury";
    useCase?: string[];
    material?: string[];
    colorOptions?: string[];
    hasHeadrest?: boolean;
    isHeightAdjustable?: boolean;
    isStackable?: boolean;
    isNestable?: boolean;
    isBifoldable?: boolean;
    seriesId?: string;
    ai_alt_text?: string;
    aiAltText?: string;
}

export interface Product {
    id: string;
    category_id: string;
    series: string;
    name: string;
    slug: string;
    description?: string;
    images: string[];
    flagship_image?: string;
    // Fallback map layout
    map_layout?: string;
    features?: string[];
    finishes?: string[];
    "3d_model"?: string; // Optional 3D model path (e.g. .glb)
    metadata?: ProductMetadata;
    specs: {
        dimensions: string;
        materials: string[];
        features: string[];
        sustainability_score?: number;
    };
    series_id: string;
    series_name: string;
    created_at: string;
    alt_text?: string;
}

// ── Compatibility types that match the old catalog.ts shape ─────────────────
// These let existing components work without changes to their prop types.

export interface CompatProduct {
    id: string;
    slug?: string;
    name: string;
    description: string;
    flagshipImage: string;
    sceneImages: string[];
    variants: ProductVariant[];
    detailedInfo: ProductDetailedInfo;
    metadata: ProductMetadata;
    "3d_model"?: string;
    threeDModelUrl?: string;
    technicalDrawings?: string[];
    documents?: string[];
    images?: string[];
    altText?: string;
}

export interface CompatSeries {
    id: string;
    name: string;
    description: string;
    products: CompatProduct[];
}

export interface CompatCategory {
    id: string;
    name: string;
    description: string;
    series: CompatSeries[];
}

/** Map a Supabase row to the shape the old catalog.ts used */
function toCompatProduct(p: Product): CompatProduct {
    const explicitAlt =
        p.alt_text ||
        p.metadata?.ai_alt_text ||
        p.metadata?.aiAltText ||
        `${p.name} product image`;

    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description || "",
        flagshipImage: p.flagship_image || "",
        sceneImages: [],
        variants: [],
        detailedInfo: { overview: "", features: [], dimensions: "", materials: [] },
        metadata: {
            ...(p.metadata ?? {}),
            sustainabilityScore: p.specs?.sustainability_score ?? 5, // fallback if missing
        },
        "3d_model": p["3d_model"],
        threeDModelUrl: p["3d_model"],
        images: p.images ?? [],
        altText: explicitAlt.replace(/\s+/g, " ").trim().slice(0, 140),
    };
}

// ── Query helpers ──────────────────────────────────────────────────────────

/** Fetch ALL products from Supabase */
export async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("[getProducts] Supabase error:", error.message);
        return [];
    }
    return ((data ?? []) as Product[]).map(p => ({
        ...p,
        images: p.images ?? [],
        category_id: p.category_id,
    }));
}

/** Fetch products filtered by category id, with category join */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("category_id", categoryId)
        .order("name", { ascending: true });

    if (error) {
        console.error("[getProductsByCategory] Supabase error:", error.message);
        return [];
    }
    return ((data ?? []) as Product[]).map(p => ({
        ...p,
        images: p.images ?? [],
        category_id: p.category_id,
    }));
}

/** Fetch a single product by its slug */
export async function getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        console.error("[getProductBySlug] Supabase error:", error.message);
        return null;
    }
    return data as Product;
}

interface CategoryRow {
    id: string;
    name: string;
}

const CATALOG_FETCH_RETRIES = 3;
const CATALOG_RETRY_DELAY_MS = 500;

function summarizeSupabaseError(message?: string): string {
    if (!message) return "Unknown Supabase error";
    const singleLine = message.replace(/\s+/g, " ").trim();
    return singleLine.length > 260 ? `${singleLine.slice(0, 260)}...` : singleLine;
}

function isTransientCatalogError(message?: string): boolean {
    if (!message) return false;
    const normalized = message.toLowerCase();
    return (
        normalized.includes("ssl handshake failed") ||
        normalized.includes("error code 525") ||
        normalized.includes("fetch failed") ||
        normalized.includes("network") ||
        normalized.includes("timeout")
    );
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function fallbackCatalog(reason: string): CompatCategory[] {
    console.warn(`[getCatalog] Falling back to local catalog: ${reason}`);
    return oandoCatalog as unknown as CompatCategory[];
}

/** Fetch all products and group them into the old Category[] shape.
 *  This is the main bridge used by pages during migration. */
export async function getCatalog(): Promise<CompatCategory[]> {
    let categories: CategoryRow[] = [];
    let products: Product[] = [];
    let lastError = "";

    for (let attempt = 1; attempt <= CATALOG_FETCH_RETRIES; attempt += 1) {
        const [catRes, prodRes] = await Promise.all([
            supabase.from("categories").select("*"),
            supabase.from("products").select("*, categories(name)").order("name", { ascending: true }),
        ]);

        const categoryError = catRes.error?.message;
        const productError = prodRes.error?.message;

        if (!categoryError && !productError) {
            categories = catRes.data as CategoryRow[];
            products = prodRes.data as Product[];
            break;
        }

        const summarizedCategoryError = summarizeSupabaseError(categoryError);
        const summarizedProductError = summarizeSupabaseError(productError);
        const combinedError = categoryError || productError || "Unknown fetch error";
        lastError = combinedError;

        if (categoryError) {
            console.error(`[getCatalog] Categories error (attempt ${attempt}/${CATALOG_FETCH_RETRIES}):`, summarizedCategoryError);
        }
        if (productError) {
            console.error(`[getCatalog] Products error (attempt ${attempt}/${CATALOG_FETCH_RETRIES}):`, summarizedProductError);
        }

        if (attempt < CATALOG_FETCH_RETRIES && isTransientCatalogError(combinedError)) {
            await wait(CATALOG_RETRY_DELAY_MS * attempt);
            continue;
        }

        return fallbackCatalog(summarizeSupabaseError(combinedError));
    }

    if (categories.length === 0 && products.length === 0 && lastError) {
        return fallbackCatalog(summarizeSupabaseError(lastError));
    }

    // Group by category, then by series
    const catMap = new Map<string, { info: CategoryRow; products: Product[] }>();

    for (const cat of categories) {
        catMap.set(cat.id, { info: cat, products: [] });
    }

    for (const p of products) {
        const catId = p.category_id;
        if (!catMap.has(catId)) {
            // Should not happen if data is clean, but handle gracefully
            continue;
        }
        catMap.get(catId)!.products.push(p);
    }

    const result: CompatCategory[] = [];

    for (const [catId, catData] of catMap) {
        if (catData.products.length === 0) continue;

        // Group products by series
        const seriesMap = new Map<string, Product[]>();
        for (const p of catData.products) {
            const sId = p.series_id || `${catId}-series`;
            if (!seriesMap.has(sId)) seriesMap.set(sId, []);
            seriesMap.get(sId)!.push(p);
        }

        const series: CompatSeries[] = [];
        for (const [sId, sProducts] of seriesMap) {
            series.push({
                id: sId,
                name: sProducts[0]?.series_name || "Series",
                description: `Premium ${catData.info.name.toLowerCase()} solutions`,
                products: sProducts.map(toCompatProduct),
            });
        }

        result.push({
            id: catId,
            name: catData.info.name,
            description: `Professional furniture systems for ${catData.info.name.toLowerCase()}`,
            series,
        });
    }

    return result.length > 0 ? result : fallbackCatalog("Supabase catalog returned no usable categories");
}

/** Get all unique category IDs from Supabase (for generateStaticParams) */
export async function getCategoryIds(): Promise<string[]> {
    const { data, error } = await supabase
        .from("products")
        .select("category")
        .order("category");

    if (error) {
        console.error("[getCategoryIds] Supabase error:", error.message);
        return [];
    }

    const unique: string[] = [...new Set((data ?? []).map((r: { category: string }) => r.category))];
    return unique;
}
