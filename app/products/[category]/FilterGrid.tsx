"use client";

import type {
  CompatCategory as Category,
  CompatProduct as Product,
} from "@/lib/getProducts";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search as SearchIcon,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Filter,
  ShoppingCart,
} from "lucide-react";
import {
  useState,
  useMemo,
  useCallback,
  Suspense,
  useEffect,
  useRef,
} from "react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { useQuoteCart } from "@/lib/store/quoteCart";
import {
  SUSTAINABILITY_THRESHOLDS,
  buildFilterParams,
  buildFilterUrl,
  countActiveFilters,
  parseFiltersFromSearchParams,
  type ActiveFilters,
  type SortOption,
} from "@/lib/productFilters";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface FlatProduct extends Product {
  seriesId: string;
  seriesName: string;
  altText?: string;
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    catalogTotal: number;
  };
}

function fallbackAltText(productName: string, categoryName: string): string {
  return `${productName} ${categoryName}`.replace(/\s+/g, " ").trim().slice(0, 140);
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function flattenCategoryProducts(category: Category): FlatProduct[] {
  return category.series.flatMap((series) =>
    series.products.map((product) => ({
      ...product,
      seriesId: series.id,
      seriesName: series.name,
      altText:
        (product as unknown as { altText?: string; alt_text?: string }).altText ||
        (product as unknown as { altText?: string; alt_text?: string }).alt_text ||
        (product.metadata as Record<string, unknown> | undefined)?.ai_alt_text?.toString() ||
        (product.metadata as Record<string, unknown> | undefined)?.aiAltText?.toString() ||
        fallbackAltText(product.name, category.name),
    })),
  );
}

function buildFallbackFacets(products: FlatProduct[]): FilterResponse["facets"] {
  const uniqueSorted = (values: string[]) =>
    Array.from(
      new Set(
        values
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));

  const ecoScores = products
    .map((product) => product.metadata?.sustainabilityScore)
    .filter((score): score is number => typeof score === "number");
  const total = products.length;
  const hasHeadrestCount = products.filter((product) => product.metadata?.hasHeadrest).length;
  const heightAdjCount = products.filter(
    (product) => product.metadata?.isHeightAdjustable,
  ).length;
  const bifmaCount = products.filter((product) => product.metadata?.bifmaCertified).length;
  const stackableCount = products.filter((product) => product.metadata?.isStackable).length;

  return {
    series: uniqueSorted(products.map((product) => product.seriesName)),
    subcategory: uniqueSorted(
      products.map((product) => product.metadata?.subcategory || ""),
    ),
    material: uniqueSorted(
      products.flatMap((product) => product.metadata?.material || []),
    ),
    priceRange: uniqueSorted(
      products.map((product) => product.metadata?.priceRange || ""),
    ),
    ecoMin: {
      min: ecoScores.length > 0 ? Math.min(...ecoScores) : 0,
      max: ecoScores.length > 0 ? Math.max(...ecoScores) : 10,
    },
    featureAvailability: {
      hasHeadrest: hasHeadrestCount > 0 && hasHeadrestCount < total,
      isHeightAdjustable: heightAdjCount > 0 && heightAdjCount < total,
      bifmaCertified: bifmaCount > 0 && bifmaCount < total,
      isStackable: stackableCount > 0 && stackableCount < total,
    },
  };
}

// â”€â”€â”€ Accordion Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AccordionSection({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left group"
        aria-expanded={open}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-600 group-hover:text-neutral-900 transition-colors flex items-center gap-2">
          {title}
          {count !== undefined && count > 0 && (
            <span className="bg-neutral-900 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
              {count}
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        )}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// â”€â”€â”€ Multi-checkbox list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CheckList({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  if (!options.length)
    return (
      <p className="text-xs text-neutral-400 italic">No options available</p>
    );
  return (
    <ul className="space-y-1.5">
      {options.map((opt) => (
        <li key={opt}>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
              className="w-3.5 h-3.5 accent-neutral-900"
            />
            <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors capitalize">
              {opt}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}

// â”€â”€â”€ Price Range Buttons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PriceButtons({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onToggle(p)}
          className={clsx(
            "px-3 py-1.5 text-xs rounded-sm border transition-all capitalize font-medium",
            selected.includes(p)
              ? "bg-[#fdbb0a] text-neutral-900 border-[#fdbb0a]"
              : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400",
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function SustainabilityButtons({
  selected,
  onSelect,
}: {
  selected: number | null;
  onSelect: (value: number | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={clsx(
          "px-3 py-1.5 text-xs rounded-sm border transition-all font-medium",
          selected === null
            ? "bg-[#fdbb0a] border-[#fdbb0a] text-neutral-900"
            : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400",
        )}
      >
        Any
      </button>
      {SUSTAINABILITY_THRESHOLDS.map((threshold) => (
        <button
          key={threshold}
          type="button"
          onClick={() => onSelect(threshold)}
          className={clsx(
            "px-3 py-1.5 text-xs rounded-sm border transition-all font-medium",
            selected === threshold
              ? "bg-[#fdbb0a] border-[#fdbb0a] text-neutral-900"
              : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400",
          )}
        >
          &gt;= {threshold}
        </button>
      ))}
    </div>
  );
}

// â”€â”€â”€ Feature Toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer py-1">
      <span className="text-sm text-neutral-600">{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative w-9 h-5 rounded-full transition-colors flex items-center shrink-0",
          checked ? "bg-[#fdbb0a]" : "bg-neutral-200",
        )}
      >
        <span
          className={clsx(
            "absolute w-3.5 h-3.5 bg-white rounded-full shadow transition-all",
            checked ? "left-[18px]" : "left-[3px]",
          )}
        />
      </button>
    </label>
  );
}

// â”€â”€â”€ Product Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ProductCard({
  product,
  categoryId,
  categoryName,
  contextQueryString,
}: {
  product: FlatProduct;
  categoryId: string;
  categoryName: string;
  contextQueryString: string;
}) {
  const addItem = useQuoteCart((state) => state.addItem);
  const firstImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : product.flagshipImage;

  const [imgSrc, setImgSrc] = useState(
    firstImage || "/images/fallback/category.webp",
  );
  const displayName = product.name;
  const ecoScore = product.metadata?.sustainabilityScore || 0;
  const baseHref = `/products/${categoryId}/${product.slug || product.id}`;
  const productHref = contextQueryString
    ? `${baseHref}?from=${encodeURIComponent(contextQueryString)}`
    : baseHref;
  const imageAlt =
    product.altText ||
    (product.metadata as Record<string, unknown> | undefined)?.ai_alt_text?.toString() ||
    (product.metadata as Record<string, unknown> | undefined)?.aiAltText?.toString() ||
    fallbackAltText(displayName, categoryName);

  return (
    <article className="group bg-white border border-neutral-100 hover:border-neutral-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Link href={productHref} className="block">
        <div className="relative w-full aspect-square bg-stone-50 rounded-md overflow-hidden">
          <Image
            src={imgSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-103"
            onError={() => setImgSrc("/images/fallback/category.webp")}
          />
          {product.metadata?.bifmaCertified && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-600 px-2.5 py-1.5 rounded-sm shadow-sm">
              BIFMA
            </div>
          )}
          {product.metadata?.priceRange && (
            <div className="absolute top-2 right-2 bg-neutral-900/75 text-white text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-sm shadow-sm">
              {product.metadata.priceRange}
            </div>
          )}
          {ecoScore > 0 && (
            <div
              className={clsx(
                "absolute bottom-2 left-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-sm shadow-sm",
                ecoScore > 7
                  ? "bg-green-100/90 text-green-800"
                  : "bg-white/90 text-neutral-600",
              )}
            >
              Eco-Score: {ecoScore}/10
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium mb-1">
            {product.seriesName}
          </p>
          <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors leading-tight">
            {displayName}
          </h3>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          {product.metadata?.useCase && product.metadata.useCase.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.metadata.useCase.slice(0, 2).map((uc) => (
                <span
                  key={uc}
                  className="text-[9px] uppercase tracking-wider font-medium text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded-sm"
                >
                  {uc}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() =>
            addItem({
              id: `quote-${product.slug || product.id}`,
              name: displayName,
              image: imgSrc,
              href: productHref,
              qty: 1,
            })
          }
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border border-neutral-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 transition-colors hover:border-primary hover:text-primary"
        >
          <ShoppingCart className="h-4 w-4" />
          Add To Quote
        </button>
      </div>
    </article>
  );
}

// â”€â”€â”€ Active Filter Chips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ActiveChips({
  filters,
  onRemove,
  onClearAll,
  total,
}: {
  filters: ActiveFilters;
  onRemove: (key: string, value?: string | number) => void;
  onClearAll: () => void;
  total: number;
}) {
  if (total === 0) return null;
  const chips: { label: string; key: string; value?: string | number }[] = [];
  if (filters.series !== "all")
    chips.push({ label: `Series: ${filters.series}`, key: "series" });
  filters.subcategory.forEach((v) =>
    chips.push({ label: v, key: "subcategory", value: v }),
  );
  filters.priceRange.forEach((v) =>
    chips.push({ label: `${v} range`, key: "priceRange", value: v }),
  );
  filters.material.forEach((v) =>
    chips.push({ label: v, key: "material", value: v }),
  );
  if (filters.hasHeadrest)
    chips.push({ label: "With headrest", key: "hasHeadrest" });
  if (filters.isHeightAdjustable)
    chips.push({ label: "Height adjustable", key: "isHeightAdjustable" });
  if (filters.bifmaCertified)
    chips.push({ label: "BIFMA certified", key: "bifmaCertified" });
  if (filters.isStackable)
    chips.push({ label: "Stackable", key: "isStackable" });
  if (typeof filters.ecoMin === "number")
    chips.push({ label: `Eco >= ${filters.ecoMin}`, key: "ecoMin", value: filters.ecoMin });

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 border-b border-neutral-100">
      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        Active:
      </span>
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value ?? ""}`}
          type="button"
          onClick={() => onRemove(chip.key, chip.value)}
          className="flex items-center gap-1.5 bg-[#fdbb0a] text-neutral-900 text-xs px-2.5 py-1 rounded-sm hover:bg-[#faaa13] transition-colors"
        >
          <span className="capitalize">{chip.label}</span>
          <X className="w-3 h-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-neutral-500 hover:text-neutral-900 underline transition-colors ml-1"
      >
        Clear all
      </button>
    </div>
  );
}

// â”€â”€â”€ Inner Component (needs useSearchParams) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AdvancedFilterGridInner({
  category,
  categoryId,
}: {
  category: Category;
  categoryId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(() => searchParams.get("q") ?? "");
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerOpenButtonRef = useRef<HTMLButtonElement>(null);
  const wasDrawerOpenRef = useRef(false);

  const filters = useMemo(
    () => parseFiltersFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const debouncedSearch = useDebouncedValue(searchInput, 250);

  const updateFilters = useCallback(
    (next: Partial<ActiveFilters>, options?: { replace?: boolean }) => {
      const updated = { ...filters, ...next } as ActiveFilters;
      const nextUrl = buildFilterUrl(pathname, updated);
      if (options?.replace) {
        router.replace(nextUrl, { scroll: false });
        return;
      }
      router.push(nextUrl, { scroll: false });
    },
    [filters, pathname, router],
  );

  useEffect(() => {
    if (debouncedSearch === filters.query) return;
    updateFilters({ query: debouncedSearch }, { replace: true });
  }, [debouncedSearch, filters.query, updateFilters]);

  const fallbackProducts = useMemo(() => flattenCategoryProducts(category), [category]);
  const fallbackFacets = useMemo(
    () => buildFallbackFacets(fallbackProducts),
    [fallbackProducts],
  );

  const filterQueryString = useMemo(
    () => buildFilterParams(filters).toString(),
    [filters],
  );

  const apiQueryString = useMemo(() => {
    const params = new URLSearchParams(filterQueryString);
    params.set("category", categoryId);
    return params.toString();
  }, [categoryId, filterQueryString]);

  const { data, isLoading, isFetching, error } = useQuery<FilterResponse>({
    queryKey: ["category-products", categoryId, apiQueryString],
    queryFn: async () => {
      const response = await fetch(`/api/products/filter?${apiQueryString}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Filter request failed: ${response.status}`);
      return (await response.json()) as FilterResponse;
    },
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    gcTime: 300_000,
  });

  const filteredProducts = data?.products ?? fallbackProducts;
  const options = data?.facets ?? fallbackFacets;
  const allProducts = data?.meta.catalogTotal ?? fallbackProducts.length;

  const showFeatureFilters =
    categoryId === "seating" &&
    (options.featureAvailability.hasHeadrest ||
      options.featureAvailability.isHeightAdjustable ||
      options.featureAvailability.bifmaCertified ||
      options.featureAvailability.isStackable);

  const toggleArray = useCallback(
    (
      key: "subcategory" | "priceRange" | "material",
      value: string,
    ) => {
      const current = filters[key] as string[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      updateFilters({ [key]: next });
    },
    [filters, updateFilters],
  );

  const removeChip = useCallback(
    (key: string, value?: string | number) => {
      if (
        key === "subcategory" ||
        key === "priceRange" ||
        key === "material"
      ) {
        const current = filters[key] as string[];
        updateFilters({ [key]: current.filter((v) => v !== value) });
      } else if (
        key === "hasHeadrest" ||
        key === "isHeightAdjustable" ||
        key === "bifmaCertified" ||
        key === "isStackable"
      ) {
        updateFilters({ [key]: false });
      } else if (key === "series") {
        updateFilters({ series: "all" });
      } else if (key === "ecoMin") {
        updateFilters({ ecoMin: null });
      }
    },
    [filters, updateFilters],
  );

  const clearAll = useCallback(() => {
    setSearchInput("");
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    if (!drawerOpen) {
      if (wasDrawerOpenRef.current) drawerOpenButtonRef.current?.focus();
      wasDrawerOpenRef.current = false;
      return;
    }

    wasDrawerOpenRef.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      if (!drawerRef.current) return;
      const firstFocusable = drawerRef.current.querySelector<HTMLElement>(
        "button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      firstFocusable?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (!drawerRef.current) return;
      if (event.key === "Escape") {
        setDrawerOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  // â”€â”€ Sidebar content (shared between desktop + drawer) â”€â”€
  const SidebarContent = (
    <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="bg-neutral-900 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-[10px] text-neutral-500 hover:text-neutral-900 underline transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Series */}
      {options.series.length > 1 && (
        <AccordionSection
          title="Series"
          count={filters.series !== "all" ? 1 : 0}
          defaultOpen
        >
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => updateFilters({ series: "all" })}
              className={clsx(
                "w-full text-left text-sm py-1.5 px-2 rounded-sm transition-colors",
                filters.series === "all"
                  ? "bg-[#fdbb0a] text-neutral-900 font-semibold"
                  : "text-neutral-600 hover:bg-neutral-50",
              )}
            >
              All Series
            </button>
            {options.series.map((seriesName) => (
              <button
                key={seriesName}
                type="button"
                onClick={() => updateFilters({ series: seriesName })}
                className={clsx(
                  "w-full text-left text-sm py-1.5 px-2 rounded-sm transition-colors",
                  filters.series === seriesName
                    ? "bg-[#fdbb0a] text-neutral-900 font-semibold"
                    : "text-neutral-600 hover:bg-neutral-50",
                )}
              >
                {seriesName}
              </button>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Subcategory */}
      {options.subcategory.length > 1 && (
        <AccordionSection
          title="Type"
          count={filters.subcategory.length}
          defaultOpen={filters.subcategory.length > 0}
        >
          <CheckList
            options={options.subcategory}
            selected={filters.subcategory}
            onToggle={(v) => toggleArray("subcategory", v)}
          />
        </AccordionSection>
      )}

      {/* Price Range */}
      {options.priceRange.length > 1 && (
        <AccordionSection
          title="Price Range"
          count={filters.priceRange.length}
          defaultOpen={filters.priceRange.length > 0}
        >
          <PriceButtons
            options={options.priceRange}
            selected={filters.priceRange}
            onToggle={(v) => toggleArray("priceRange", v)}
          />
        </AccordionSection>
      )}

      {/* Material */}
      {options.material.length > 1 && (
        <AccordionSection
          title="Material"
          count={filters.material.length}
          defaultOpen={filters.material.length > 0}
        >
          <CheckList
            options={options.material}
            selected={filters.material}
            onToggle={(v) => toggleArray("material", v)}
          />
        </AccordionSection>
      )}

      <AccordionSection
        title="Sustainability"
        count={typeof filters.ecoMin === "number" ? 1 : 0}
        defaultOpen={typeof filters.ecoMin === "number"}
      >
        <SustainabilityButtons
          selected={filters.ecoMin}
          onSelect={(ecoMin) => updateFilters({ ecoMin })}
        />
      </AccordionSection>

      {/* Feature Toggles */}
      {showFeatureFilters && (
        <AccordionSection
          title="Features"
          count={
            (filters.hasHeadrest ? 1 : 0) +
            (filters.isHeightAdjustable ? 1 : 0) +
            (filters.bifmaCertified ? 1 : 0) +
            (filters.isStackable ? 1 : 0)
          }
        >
          <div className="space-y-1">
            {options.featureAvailability.hasHeadrest && (
              <Toggle
                label="With Headrest"
                checked={filters.hasHeadrest}
                onChange={(v) => updateFilters({ hasHeadrest: v })}
              />
            )}
            {options.featureAvailability.isHeightAdjustable && (
              <Toggle
                label="Height Adjustable"
                checked={filters.isHeightAdjustable}
                onChange={(v) => updateFilters({ isHeightAdjustable: v })}
              />
            )}
            {options.featureAvailability.bifmaCertified && (
              <Toggle
                label="BIFMA Certified"
                checked={filters.bifmaCertified}
                onChange={(v) => updateFilters({ bifmaCertified: v })}
              />
            )}
            {options.featureAvailability.isStackable && (
              <Toggle
                label="Stackable"
                checked={filters.isStackable}
                onChange={(v) => updateFilters({ isStackable: v })}
              />
            )}
          </div>
        </AccordionSection>
      )}

    </div>
  );

  return (
    <section
      className="w-full bg-neutral-50"
      aria-label={`${category.name} product catalog`}
    >
      {/* â”€â”€ Top Toolbar â”€â”€ */}
      <div className="w-full bg-white border-b border-neutral-200 sticky top-16 z-20">
        <div className="container-wide py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Mobile filter button */}
            <button
              ref={drawerOpenButtonRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 h-10 px-3 bg-white border border-neutral-200 rounded-sm text-sm text-neutral-700 hover:border-neutral-400 transition-colors shrink-0"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeCount > 0 && (
                <span className="bg-neutral-900 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {activeCount}
                </span>
              )}
            </button>

            {/* Search */}
            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder={`Search ${category.name.toLowerCase()}...`}
                aria-label={`Search ${category.name}`}
                className="w-full h-10 pl-9 pr-8 bg-white border border-neutral-200 rounded-sm text-sm focus:outline-none focus:border-neutral-800 transition-colors"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-800" />
                </button>
              )}
            </div>

            {/* Count + Sort */}
            <div className="flex items-center gap-3 shrink-0">
              <span
                aria-live="polite"
                aria-atomic="true"
                className="text-xs text-neutral-500 font-medium whitespace-nowrap"
              >
                {filteredProducts.length} / {allProducts} products
              </span>
              <select
                aria-label="Sort products"
                className="h-10 px-3 bg-white border border-neutral-200 rounded-sm text-sm text-neutral-700 focus:outline-none focus:border-neutral-800"
                value={filters.sort}
                onChange={(e) =>
                  updateFilters({ sort: e.target.value as SortOption })
                }
              >
                <option value="az">Name A-Z</option>
                <option value="za">Name Z-A</option>
                <option value="ecoDesc">Eco Score High-Low</option>
                <option value="ecoAsc">Eco Score Low-High</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          <ActiveChips
            filters={filters}
            onRemove={removeChip}
            onClearAll={clearAll}
            total={activeCount}
          />
          {isFetching && (
            <p className="pt-2 text-xs text-neutral-400">Refreshing products…</p>
          )}
          {error && (
            <p className="pt-2 text-xs text-red-600">
              Live filter sync failed. Showing fallback product set.
            </p>
          )}
        </div>
      </div>

      {/* â”€â”€ Main layout â”€â”€ */}
      <div className="container-wide py-8 flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 self-start sticky top-32">
          {SidebarContent}
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {isLoading && filteredProducts.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`loading-${index}`}
                  className="h-[24rem] rounded-sm border border-neutral-100 bg-white animate-pulse"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <SearchIcon className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-base font-semibold text-neutral-700 mb-1">
                No products found
              </p>
              <p className="text-sm text-neutral-400 mb-4">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={clearAll}
                className="text-sm underline text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="transition-all duration-300 animate-fadein"
                >
                  <ProductCard
                    product={product}
                    categoryId={categoryId}
                    categoryName={category.name}
                    contextQueryString={filterQueryString}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ Mobile Drawer â”€â”€ */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div
            ref={drawerRef}
            tabIndex={-1}
            className="fixed inset-y-0 left-0 w-80 max-w-full bg-neutral-50 z-50 overflow-y-auto lg:hidden shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-200 bg-white">
              <span className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {activeCount > 0 && (
                  <span className="bg-neutral-900 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                    {activeCount}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="min-h-11 min-w-11 inline-flex items-center justify-center"
              >
                <X className="w-5 h-5 text-neutral-500 hover:text-neutral-900" />
              </button>
            </div>
            <div className="p-4">{SidebarContent}</div>
            <div className="sticky bottom-0 bg-white border-t border-neutral-100 p-4 flex gap-2">
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearAll();
                    setDrawerOpen(false);
                  }}
                  className="flex-1 h-11 border border-neutral-200 text-sm text-neutral-700 rounded-sm hover:bg-neutral-50 transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex-1 h-11 bg-neutral-900 text-white text-sm rounded-sm hover:bg-neutral-700 transition-colors font-medium"
              >
                View {filteredProducts.length} results
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

// â”€â”€â”€ Exported wrapper (Suspense for useSearchParams) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function FilterGrid({
  category,
  categoryId,
}: {
  category: Category;
  categoryId: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-64 flex items-center justify-center text-neutral-400 text-sm">
          Loading products...
        </div>
      }
    >
      <AdvancedFilterGridInner category={category} categoryId={categoryId} />
    </Suspense>
  );
}

