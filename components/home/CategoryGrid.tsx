import Link from "next/link";
import { getCatalog } from "@/lib/getProducts";
import { CategoryImage } from "@/components/home/CategoryImage";
import { unstable_cache } from "next/cache";
import {
  buildRequestedCategoryCatalog,
  getCatalogCategoryHref,
  getCatalogCategoryLabel,
} from "@/lib/catalogCategories";

const getCachedCatalog = unstable_cache(
  async () => getCatalog(),
  ["home-category-grid"],
  { revalidate: 3600, tags: ["catalog"] },
);

export async function CategoryGrid() {
  const requestedCatalog = buildRequestedCategoryCatalog(await getCachedCatalog());

  return (
    <section className="w-full bg-white py-20 md:py-28">
      <div className="container px-6 2xl:px-0">
        {/* Section header */}
        <div className="mb-12 md:mb-16 max-w-2xl">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.22em] mb-3">
            Product Range
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-neutral-900 leading-[1] tracking-tight">
            Explore Solutions
          </h2>
        </div>

        {/* Uniform 3-col grid — 1 col mobile / 2 col tablet / 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-100">
          {requestedCatalog.map((category) => {
            const allProducts = category.series.flatMap((s) => s.products);
            const categoryName = getCatalogCategoryLabel(category.id, category.name);
            const categoryHref = getCatalogCategoryHref(category.id);
            const firstProductWithImage = allProducts.find(
              (p) => (p.images && p.images.length > 0) || p.flagshipImage,
            );
            const flagshipImage =
              firstProductWithImage?.images?.[0] ||
              firstProductWithImage?.flagshipImage ||
              "/images/hero/hero-1.webp";

            return (
              <Link
                key={category.id}
                href={categoryHref}
                className="group relative bg-white block overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Uniform square image */}
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  <CategoryImage src={flagshipImage} alt={categoryName} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-500" />
                </div>

                {/* Card text */}
                <div className="px-5 py-5 border-t border-neutral-100 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl leading-[0.95] text-neutral-900 group-hover:text-primary transition-colors duration-200">
                      {categoryName}
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      {allProducts.length} products
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 shrink-0 text-neutral-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
