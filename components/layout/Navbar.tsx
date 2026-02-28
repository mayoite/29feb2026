"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { OneAndOnlyLogo } from "@/components/ui/Logo";
import {
  NAV_CATEGORY_GROUP_ORDER,
  NAV_CATEGORY_GROUPS,
  NAV_PRIMARY_LINKS,
  NAV_RESOURCE_LINKS,
  groupCategories,
  type GroupedCategory,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useQuoteCart } from "@/lib/store/quoteCart";

interface NavSearchResult {
  id: string;
  title: string;
  href: string;
  type: "product" | "category" | "page";
  source: "ai" | "local";
}

function prettify(id: string): string {
  return id
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

const FALLBACK_CATEGORY_GROUPS: GroupedCategory[] = NAV_CATEGORY_GROUP_ORDER.map((groupId) => ({
  groupId,
  groupLabel: NAV_CATEGORY_GROUPS[groupId].label,
  items: NAV_CATEGORY_GROUPS[groupId].ids.map((id) => ({
    id,
    name: prettify(id),
    count: undefined,
    href: `/products/${id}`,
  })),
}));

const FEATURED_CARDS = [
  {
    title: "Ergonomic Seating",
    description: "Mesh chairs and premium seating for long working hours.",
    href: "/products/chairs-mesh",
    image: "/images/products/imported/fluid/image-1.webp",
  },
  {
    title: "Modular Workstations",
    description: "Scalable desking systems for growing teams.",
    href: "/products/workstations",
    image: "/images/products/imported/cabin/image-1.webp",
  },
  {
    title: "Need Help Choosing?",
    description: "Use AI-assisted search to find the right furniture faster.",
    href: "/products",
    image: "/images/products/imported/cocoon/image-1.webp",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const totalQty = useQuoteCart((state) => state.totalQty);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<string | null>(null);
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategory[]>(
    FALLBACK_CATEGORY_GROUPS,
  );
  const [mobileAccordion, setMobileAccordion] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NavSearchResult[]>([]);
  const [searchSource, setSearchSource] = useState<"ai" | "local" | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  const searchPanelRef = useRef<HTMLDivElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const hideDesktopSearch = isMobileMenuOpen || pathname.startsWith("/quote-cart");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: Array<{ id: string; name: string; count?: number }>) => {
        if (!Array.isArray(data) || data.length === 0) return;
        setGroupedCategories(groupCategories(data));
      })
      .catch(() => {
        setGroupedCategories(FALLBACK_CATEGORY_GROUPS);
      });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 16);
      setParallaxOffset(Math.min(40, scrollY * 0.12));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchSource(null);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch("/api/nav-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            query: searchQuery.trim(),
            limit: 8,
            context: isMobileMenuOpen ? "mobile" : "header",
          }),
        });
        const data = (await response.json()) as {
          results?: NavSearchResult[];
          fallbackUsed?: boolean;
        };

        if (!response.ok) {
          setSearchResults([]);
          setSearchSource(null);
          return;
        }

        const results = Array.isArray(data.results) ? data.results : [];
        setSearchResults(results);
        const source = results[0]?.source || (data.fallbackUsed ? "local" : null);
        setSearchSource(source);
      } catch {
        setSearchResults([]);
        setSearchSource(null);
      } finally {
        setSearchLoading(false);
      }
    }, 260);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery, isMobileMenuOpen]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!searchPanelRef.current) return;
      if (!searchPanelRef.current.contains(event.target as Node)) {
        setShowSearchPanel(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDesktopMenu(null);
        setShowSearchPanel(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !mobileMenuRef.current) return;

      const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex='-1'])",
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
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileMenuOpen]);

  const searchSectionTitle = useMemo(() => {
    if (!searchQuery.trim()) return "Popular Links";
    if (searchLoading) return "Searching";
    return searchResults.length > 0 ? "Results" : "No Results";
  }, [searchLoading, searchQuery, searchResults.length]);

  const onSearchResultClick = () => {
    setShowSearchPanel(false);
    setSearchQuery("");
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 z-50 w-full border-b border-neutral-200/70 bg-white/90 backdrop-blur-xl transition-all duration-300",
          scrolled ? "shadow-[0_14px_45px_-28px_rgba(0,0,0,0.45)]" : "shadow-none",
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/8 to-transparent"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        />
        <div className="container-wide relative">
          <div className="nav-shell flex h-20 items-center justify-between px-3 sm:px-4">
            <Link href="/" aria-label="One and Only Furniture Home" className="shrink-0">
              <OneAndOnlyLogo className="h-9 md:h-10 lg:h-11" variant="orange" />
            </Link>

            <nav className="hidden lg:flex items-center gap-6" aria-label="Primary Navigation">
              {NAV_PRIMARY_LINKS.map((link) =>
                "hasMega" in link && link.hasMega ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setActiveDesktopMenu(link.label)}
                    onMouseLeave={() => setActiveDesktopMenu(null)}
                  >
                    <button
                      type="button"
                      aria-expanded={activeDesktopMenu === link.label}
                      aria-controls="products-mega-menu"
                      onFocus={() => setActiveDesktopMenu(link.label)}
                      className={cn(
                        "nav-pill inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold",
                        activeDesktopMenu === link.label
                          ? "text-primary"
                          : "text-neutral-700 hover:text-primary",
                      )}
                    >
                      {link.label}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          activeDesktopMenu === link.label && "rotate-180",
                        )}
                      />
                    </button>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "nav-pill px-3 py-2 text-sm font-semibold transition-colors",
                      pathname === link.href
                        ? "text-primary"
                        : "text-neutral-700 hover:text-primary",
                    )}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              {!hideDesktopSearch && (
                <div ref={searchPanelRef} className="relative hidden xl:block">
                  <label className="ai-search-shell flex h-11 items-center gap-2.5 rounded-full px-4">
                    <Search className="h-4 w-4 text-neutral-500" />
                    <input
                      ref={desktopSearchInputRef}
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onFocus={() => setShowSearchPanel(true)}
                      placeholder="AI search products..."
                      className="w-52 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
                      aria-label="Search products"
                    />
                    <Sparkles className="h-4 w-4 text-accent1" />
                  </label>

                  <AnimatePresence>
                    {showSearchPanel && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-[24rem] overflow-hidden rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_24px_55px_-30px_rgba(0,0,0,0.45)]"
                      >
                        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                          <span>{searchSectionTitle}</span>
                          {searchSource && (
                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px]">
                              {searchSource === "ai" ? "AI Ranked" : "Local Fallback"}
                            </span>
                          )}
                        </div>
                        {searchLoading ? (
                          <p className="py-6 text-sm text-neutral-500">Searching...</p>
                        ) : searchResults.length > 0 ? (
                          <ul className="space-y-1">
                            {searchResults.map((result) => (
                              <li key={result.id}>
                                <Link
                                  href={result.href}
                                  onClick={onSearchResultClick}
                                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                                >
                                  <span>{result.title}</span>
                                  <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                                    {result.type}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="space-y-1 py-2">
                            {NAV_RESOURCE_LINKS.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={onSearchResultClick}
                                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              >
                                {item.label}
                                <ChevronRight className="h-4 w-4 text-neutral-400" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <Link
                href="/quote-cart"
                className="nav-pill relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:text-primary"
                aria-label="Quote cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalQty > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {Math.min(totalQty, 99)}
                  </span>
                )}
              </Link>

              <Link
                href="/contact"
                className="hidden md:inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-primary/90"
              >
                Request Quote
              </Link>

              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-800 lg:hidden"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav-drawer"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {activeDesktopMenu === "Products" && (
            <motion.div
              id="products-mega-menu"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.16 }}
              onMouseEnter={() => setActiveDesktopMenu("Products")}
              onMouseLeave={() => setActiveDesktopMenu(null)}
              className="hidden lg:block border-t border-neutral-200 bg-white/95 backdrop-blur-xl"
            >
              <div className="container-wide py-8">
                <div className="grid grid-cols-5 gap-5">
                  {groupedCategories.map((group) => (
                    <div key={group.groupId} className="rounded-2xl border border-neutral-100 bg-white p-4">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                        {group.groupLabel}
                      </p>
                      <ul className="space-y-1">
                        {group.items.map((item) => (
                          <li key={item.id}>
                            <Link
                              href={item.href}
                              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                            >
                              <span>{item.name}</span>
                              {typeof item.count === "number" && (
                                <span className="text-[10px] text-neutral-400">{item.count}</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-5">
                  {FEATURED_CARDS.map((card) => (
                    <Link
                      key={card.title}
                      href={card.href}
                      className="mega-card group overflow-hidden rounded-3xl border border-neutral-100 bg-white"
                    >
                      <div
                        className="h-28 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${card.image})` }}
                      />
                      <div className="p-4">
                        <p className="mb-1 text-sm font-semibold text-neutral-900">{card.title}</p>
                        <p className="text-xs leading-relaxed text-neutral-500">{card.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-nav-drawer"
            ref={mobileMenuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.24, ease: "easeInOut" }}
            className="fixed inset-y-0 right-0 z-[70] w-full max-w-md overflow-y-auto border-l border-neutral-200 bg-white p-5 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="mb-6 flex items-center justify-between">
              <OneAndOnlyLogo className="h-8" variant="orange" />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="ai-search-shell mb-5 flex items-center gap-2 rounded-2xl px-3 py-2.5">
              <Search className="h-4 w-4 text-neutral-500" />
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setShowSearchPanel(true);
                }}
                placeholder="Search products..."
                className="w-full bg-transparent text-sm text-neutral-800 outline-none"
                aria-label="Mobile search products"
              />
              <Sparkles className="h-4 w-4 text-accent1" />
            </div>

            {(showSearchPanel || searchQuery.trim().length >= 2) && (
              <div className="mb-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  {searchSectionTitle}
                </p>
                {searchLoading ? (
                  <p className="text-sm text-neutral-500">Searching...</p>
                ) : searchResults.length > 0 ? (
                  <ul className="space-y-1">
                    {searchResults.map((result) => (
                      <li key={result.id}>
                        <Link
                          href={result.href}
                          onClick={onSearchResultClick}
                          className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-neutral-700"
                        >
                          <span>{result.title}</span>
                          <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                            {result.type}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500">No results found.</p>
                )}
              </div>
            )}

            <nav className="space-y-2" aria-label="Mobile primary navigation">
              {NAV_PRIMARY_LINKS
                .filter((item) => !("hasMega" in item && item.hasMega))
                .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center rounded-xl px-3 text-base text-neutral-800 hover:bg-neutral-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                ))}
            </nav>

            <div className="mt-6 border-t border-neutral-200 pt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                Product Categories
              </p>
              <div className="space-y-2">
                {groupedCategories.map((group) => {
                  const open = Boolean(mobileAccordion[group.groupId]);
                  return (
                    <div key={group.groupId} className="rounded-2xl border border-neutral-200 bg-white">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                        aria-expanded={open}
                        onClick={() =>
                          setMobileAccordion((prev) => ({
                            ...prev,
                            [group.groupId]: !prev[group.groupId],
                          }))
                        }
                      >
                        <span className="text-sm font-semibold text-neutral-800">{group.groupLabel}</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
                      </button>
                      {open && (
                        <ul className="space-y-1 px-2 pb-2">
                          {group.items.map((item) => (
                            <li key={item.id}>
                              <Link
                                href={item.href}
                                className="flex min-h-11 items-center justify-between rounded-lg px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <span>{item.name}</span>
                                {typeof item.count === "number" && (
                                  <span className="text-[10px] text-neutral-400">{item.count}</span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              {NAV_RESOURCE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="menu-chip flex min-h-11 items-center justify-center rounded-full border border-neutral-200 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <Link
                href="/quote-cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-200 py-3 text-sm font-semibold text-neutral-800"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
                {totalQty > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {Math.min(totalQty, 99)}
                  </span>
                )}
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex flex-1 items-center justify-center rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-[0.12em] text-white"
              >
                Request Quote
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
