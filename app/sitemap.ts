import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/getProducts";
import { buildRequestedCategoryCatalog } from "@/lib/afcCategories";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.oando.co.in")
).replace(/\/+$/, "");

const STATIC_PATHS = [
  "/",
  "/about",
  "/products",
  "/solutions",
  "/projects",
  "/gallery",
  "/contact",
  "/service",
  "/showrooms",
  "/downloads",
  "/sustainability",
  "/privacy",
  "/terms",
  "/imprint",
  "/quote-cart",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  try {
    const catalog = buildRequestedCategoryCatalog(await getCatalog());
    for (const category of catalog) {
      entries.push({
        url: `${BASE_URL}/products/${category.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });

      for (const series of category.series) {
        for (const product of series.products) {
          const slug = product.slug || product.id;
          entries.push({
            url: `${BASE_URL}/products/${category.id}/${slug}`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
          });
        }
      }
    }
  } catch {
    // Keep static sitemap if catalog fetch fails.
  }

  return entries;
}

