"use client";

import { useState, useEffect } from "react";
import type {
  CompatProduct as Product,
  ProductVariant,
} from "@/lib/getProducts";
import {
  ArrowLeft,
  ChevronRight,
  Twitter,
  Facebook,
  ShieldCheck,
  Award,
  ThumbsUp,
  Share2,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import ThreeViewer from "@/components/ThreeViewer";
import { Reviews } from "@/components/Reviews";
import { ProductGallery } from "@/components/ProductGallery";
import { useQuoteCart } from "@/lib/store/quoteCart";

interface ProductViewerProps {
  product: Product;
  seriesName: string;
  categoryRoute: string;
  categoryId?: string;
}

export function ProductViewer({
  product,
  seriesName,
  categoryRoute,
}: ProductViewerProps) {
  const addItem = useQuoteCart((state) => state.addItem);
  const cleanName = (raw: string) => {
    if (!raw) return raw;
    const m = raw.match(/^([A-Z][a-z]+(?:[- ][A-Z][a-z0-9]*)?)\1/);
    if (m && m[1]) return m[1];
    if (raw.length > 30 && !raw.includes(" ")) {
      const cap = raw.match(/^[A-Z][a-z]+/);
      if (cap) return cap[0];
    }
    return raw;
  };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null,
  );

  const modelPath =
    selectedVariant?.threeDModelUrl ||
    product["3d_model"] ||
    product.threeDModelUrl ||
    "";
  const hasModelPath = modelPath.length > 0;

  const allImages = [
    ...(product.images || []),
    product.flagshipImage,
    ...(selectedVariant?.galleryImages || []),
    ...(product.sceneImages || []),
  ].filter(Boolean) as string[];

  const uniqueImages = Array.from(new Set(allImages));
  const fallbackImg = "/images/products/imported/fluid/image-1.webp";
  if (uniqueImages.length === 0) uniqueImages.push(fallbackImg);
  const productImageAlt =
    (product as unknown as { altText?: string }).altText ||
    (product.metadata as Record<string, unknown> | undefined)?.ai_alt_text?.toString() ||
    (product.metadata as Record<string, unknown> | undefined)?.aiAltText?.toString() ||
    `${cleanName(product.name)} product image`;

  useEffect(() => {
    // Basic anonymous tracking for recommendations
    let userId = localStorage.getItem("oando_user_id");
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("oando_user_id", userId);
    }

    fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId: product.id }),
    }).catch(console.error);
  }, [product.id]);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    // When variants change, uniqueImages will update which resets the ProductGallery index implicitly
  };

  const [is3DMode, setIs3DMode] = useState(false);
  const [isModelAvailable, setIsModelAvailable] = useState(false);
  const [isCheckingModel, setIsCheckingModel] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!hasModelPath) {
      setIsModelAvailable(false);
      setIsCheckingModel(false);
      setIs3DMode(false);
      return;
    }

    const validateModel = async () => {
      setIsCheckingModel(true);
      try {
        const response = await fetch(modelPath, { method: "HEAD" });
        if (!cancelled) {
          const ok = response.ok;
          setIsModelAvailable(ok);
          if (!ok) setIs3DMode(false);
        }
      } catch {
        if (!cancelled) {
          setIsModelAvailable(false);
          setIs3DMode(false);
        }
      } finally {
        if (!cancelled) setIsCheckingModel(false);
      }
    };

    validateModel();
    return () => {
      cancelled = true;
    };
  }, [hasModelPath, modelPath]);

  const overview = product.detailedInfo?.overview || product.description;
  const dimensions =
    product.detailedInfo?.dimensions || "Dimensions available on request";
  const materials =
    product.detailedInfo?.materials?.filter(Boolean) ||
    product.metadata?.material ||
    [];
  const features =
    product.detailedInfo?.features?.filter(
      (f: string) => f && f !== "MANUFACTURING" && f !== "Sustainability",
    ) || [];
  const useCases = product.metadata?.useCase || [];
  const warrantyYears = product.metadata?.warrantyYears;
  const warrantyText = warrantyYears
    ? `${warrantyYears}-Year Warranty`
    : "Warranty on request";
  const certificationText = product.metadata?.bifmaCertified
    ? "BIFMA Certified"
    : "Certification on request";
  const sustainabilityText =
    typeof product.metadata?.sustainabilityScore === "number"
      ? `Eco Score ${product.metadata.sustainabilityScore}/10`
      : "Sustainability details on request";
  const shortOverview = (() => {
    if (!overview) return "";
    const clean = overview.replace(/\s+/g, " ").trim();
    const sentenceMatch = clean.match(/^[^.!?]+[.!?]\s*[^.!?]*[.!?]?/);
    if (sentenceMatch?.[0]) return sentenceMatch[0].trim();
    return clean.length > 180 ? `${clean.slice(0, 180).trim()}...` : clean;
  })();
  const specRows = [
    { label: "Dimensions", value: dimensions },
    {
      label: "Materials",
      value:
        materials.length > 0
          ? materials.slice(0, 3).join(", ")
          : "Material options available",
    },
    { label: "Warranty", value: warrantyText },
    { label: "Certification", value: certificationText },
    {
      label: "Use Case",
      value:
        useCases.length > 0
          ? useCases.slice(0, 3).join(", ")
          : "Corporate and institutional",
    },
    { label: "Sustainability", value: sustainabilityText },
  ];

  const seriesShort = seriesName.replace(/ Series$/i, "");

  return (
    <main className="bg-white min-h-screen">
      {/* ── BREADCRUMB BAR ── */}
      <div className="border-b border-neutral-100 bg-white/90 backdrop-blur-sm sticky top-16 z-10">
        <div className="container px-6 2xl:px-0 h-10 flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
          <Link
            href="/products"
            className="hover:text-neutral-900 transition-colors"
          >
            Products
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href={categoryRoute}
            className="hover:text-neutral-900 transition-colors"
          >
            {seriesShort}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-900 font-semibold">
            {cleanName(product.name)}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-112px)]">
        {/* ── LEFT: IMAGE GALLERY ── */}
        <div className="w-full lg:w-[58%] xl:w-[62%] flex flex-col pt-0 lg:pt-8 bg-neutral-100">
          <div className="flex-1 w-full max-w-[800px] mx-auto p-4 lg:p-8">
            <ProductGallery
              images={uniqueImages}
              productName={cleanName(product.name)}
            />
          </div>

          {/* 3D viewer toggle wrapper */}
          {hasModelPath && (
            <div className="w-full aspect-video bg-neutral-50 border-t border-neutral-200 relative group">
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isModelAvailable) return;
                    setIs3DMode((prev) => !prev);
                  }}
                  disabled={!isModelAvailable}
                  className={clsx(
                    "bg-white/90 backdrop-blur text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm border border-neutral-200",
                    isModelAvailable
                      ? "text-neutral-800 hover:bg-neutral-900 hover:text-white transition-colors"
                      : "text-neutral-400 cursor-not-allowed",
                  )}
                >
                  {is3DMode ? "View Image" : "View in 3D/AR"}
                </button>
              </div>
              {!isModelAvailable && !isCheckingModel && (
                <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
                  <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                    3D model currently unavailable for this product.
                  </p>
                </div>
              )}
              {isCheckingModel && (
                <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
                  <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                    Checking 3D model availability...
                  </p>
                </div>
              )}

              {is3DMode && isModelAvailable ? (
                <div className="w-full h-full absolute inset-0 z-10 flex items-center justify-center bg-transparent">
                  <div className="hidden md:block w-full h-full">
                    <ThreeViewer
                      modelUrl={modelPath}
                      fallback={
                        <Image
                          src={uniqueImages[0]}
                          alt={productImageAlt}
                          width={1200}
                          height={900}
                          className="w-full h-full object-contain"
                        />
                      }
                    />
                  </div>
                  <div className="block md:hidden w-full h-full">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `
                      <model-viewer
                        src="${modelPath}"
                        ar
                        ios-src="${modelPath.replace(".glb", ".usdz")}"
                        camera-controls
                        shadow-intensity="1"
                        alt="3D model of ${product.name}"
                        style="width: 100%; height: 100%;"
                      ></model-viewer>
                    `,
                      }}
                    ></div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* ── RIGHT: DETAILS PANEL ── */}
        <div className="w-full lg:w-[42%] xl:w-[38%] lg:sticky lg:top-[112px] lg:h-[calc(100vh-112px)] overflow-y-auto px-6 sm:px-10 lg:px-12 py-10 border-l border-neutral-100 scrollbar-hide">
          <div className="max-w-sm mx-auto lg:max-w-none">
            {/* Title block */}
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-3">
                {seriesShort}
              </p>
              <h1 className="text-4xl sm:text-5xl font-light text-neutral-900 tracking-tight leading-[1.05] mb-5">
                {cleanName(product.name)}
              </h1>
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-light mb-6 max-w-prose line-clamp-3 lg:line-clamp-none">
                {shortOverview}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] bg-neutral-100 text-neutral-700">
                  {warrantyText}
                </span>
                {product.metadata?.bifmaCertified && (
                  <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] bg-neutral-900 text-white">
                    BIFMA
                  </span>
                )}
                {typeof product.metadata?.sustainabilityScore === "number" && (
                  <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] bg-green-50 text-green-700 border border-green-200">
                    Eco {product.metadata.sustainabilityScore}/10
                  </span>
                )}
              </div>

              <div className="flex gap-4 items-center mb-6">
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(
                      `Check out ${product.name} at One & Only Furniture!`,
                    );
                    const url = encodeURIComponent(window.location.href);
                    window.open(
                      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
                      "_blank",
                    );
                  }}
                  className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
                      "_blank",
                    );
                  }}
                  className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // could add a toast here
                  }}
                  aria-label="Copy product link"
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Copy Link
                </button>
              </div>
            </div>

            {/* Variant swatches */}
            {product.variants && product.variants.length > 0 && (
              <div className="pt-7 border-t border-neutral-100 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                    Configuration
                  </p>
                  <span className="text-xs text-neutral-400">
                    {product.variants.length} options
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5 mb-4">
                  {product.variants.map((variant: ProductVariant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    return (
                      <button
                        type="button"
                        key={variant.id}
                        onClick={() => handleVariantChange(variant)}
                        title={variant.variantName}
                        className={clsx(
                          "w-11 h-11 rounded-full overflow-hidden border-2 transition-all duration-200",
                          isSelected
                            ? "border-neutral-900 ring-2 ring-neutral-900 ring-offset-2 scale-110"
                            : "border-neutral-200 hover:border-neutral-500 hover:scale-105",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            variant.galleryImages?.[0] || product.flagshipImage
                          }
                          alt={variant.variantName}
                          className="w-full h-full object-cover scale-150"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement;
                            if (!el.dataset.fallback) {
                              el.dataset.fallback = "1";
                              el.src = fallbackImg;
                            }
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
                {selectedVariant && (
                  <p className="text-xs text-neutral-500">
                    <span className="font-semibold text-neutral-800">
                      Selected:
                    </span>{" "}
                    {selectedVariant.variantName}
                  </p>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() =>
                  addItem({
                    id: `quote-${product.slug || product.id}`,
                    name: cleanName(product.name),
                    image: uniqueImages[0],
                    href: `${categoryRoute}/${product.slug || product.id}`,
                    qty: 1,
                  })
                }
                className="group mb-2 flex w-full items-center justify-between border border-primary text-primary px-6 py-3.5 hover:bg-primary hover:text-white transition-colors"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                  Add to Quote Cart
                </span>
                <ShoppingCart className="w-4 h-4" />
              </button>
              <Link
                href="/contact"
                className="group flex w-full items-center justify-between bg-neutral-900 text-white px-6 py-4 hover:bg-neutral-800 transition-colors"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                  Request Quote
                </span>
                <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="group flex w-full items-center justify-between border border-neutral-200 text-neutral-900 px-6 py-3.5 hover:border-neutral-400 transition-colors mt-2"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                  Book a Consultation
                </span>
                <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 pt-6 border-t border-neutral-100">
              <div className="flex flex-col gap-2">
                <ShieldCheck className="w-5 h-5 text-neutral-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-900">
                  {warrantyText}
                </span>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Guaranteed durability and performance.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Award className="w-5 h-5 text-neutral-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-900">
                  Made in India
                </span>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Engineered locally to global standards.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <ThumbsUp className="w-5 h-5 text-neutral-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-900">
                  {certificationText}
                </span>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Certified for extended use.
                </p>
              </div>
            </div>

            {/* Specifications */}
            <div className="pt-7 border-t border-neutral-100">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Specifications
              </h2>
              <div className="rounded-lg border border-neutral-200 overflow-hidden mb-7">
                {specRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3 border-b border-neutral-100 last:border-b-0"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                      {row.label}
                    </span>
                    <span className="text-sm text-neutral-700 leading-relaxed">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {features.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-3">
                    Key Features
                  </p>
                  <ul className="space-y-2">
                    {features.slice(0, 8).map((f: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-neutral-700 leading-relaxed"
                      >
                        <span className="text-neutral-400 mt-0.5 shrink-0">-</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {materials.length > 0 && (
                <div className="pt-7 border-t border-neutral-100 mt-7">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-3">
                    Material Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {materials.map((material) => (
                      <span
                        key={material}
                        className="px-2.5 py-1 text-xs text-neutral-700 border border-neutral-200 bg-neutral-50"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide px-6 2xl:px-0 pb-24">
        <Reviews productId={product.id} />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`,
        }}
      />
    </main>
  );
}

