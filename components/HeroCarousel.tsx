"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";

const slides = [
  {
    src: "/images/hero/hero-1.webp",
    headline: "Spaces That\nWork Harder",
    sub: "Trusted by Titan, TVS, Usha & DMRC across 20 locations.",
    cta: { label: "Explore Products", href: "/products" },
  },
  {
    src: "/images/hero/hero-2.webp",
    headline: "Where Work\nBecomes Culture",
    sub: "15 years of engineering premium corporate environments.",
    cta: { label: "View Projects", href: "/projects" },
  },
  {
    src: "/images/hero/hero-3.webp",
    headline: "Inspire Every\nConversation",
    sub: "Conference and meeting solutions that command attention.",
    cta: { label: "Explore Seating Solutions", href: "/products/seating" },
  },
  {
    src: "/images/hero/hero-4.webp",
    headline: "Built for\nFocused Work",
    sub: "Modular workstations for heads-down, high-performance teams.",
    cta: { label: "See Workstations", href: "/products/workstations" },
  },
  {
    src: "/images/hero/hero-5.webp",
    headline: "Comfort Meets\nDesign",
    sub: "Soft seating collections that redefine collaborative spaces.",
    cta: {
      label: "Explore Soft Seating",
      href: "/products/soft-seating",
    },
  },
];

export function HeroCarousel() {
  const autoplay = useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: false }),
    [],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplay,
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const toggleAutoplay = useCallback(() => {
    if (!emblaApi) return;
    if (isPlaying) {
      autoplay.stop();
      setIsPlaying(false);
      return;
    }
    autoplay.play();
    setIsPlaying(true);
  }, [autoplay, emblaApi, isPlaying]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="hero-section relative w-full h-dvh min-h-[560px] overflow-hidden">
      {/* Carousel viewport */}
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div key={i} className="relative flex-[0_0_100%] h-full">
              <Image
                src={slide.src}
                alt={slide.headline.replace("\n", " ")}
                fill
                className="object-cover animate-hero-pan"
                priority={i === 0}
                sizes="100vw"
              />
              {/* Strong gradient overlay — darker at bottom for text readability */}
              <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/30 to-black/65" />

              {/* Slide content — bottom-aligned, left-aligned, max-width constrained */}
              <div className="absolute inset-0 flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-16 lg:px-24">
                <div className="max-w-[1400px] w-full mx-auto">
                  {i === 0 ? (
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.05] whitespace-pre-line mb-4 md:mb-6 max-w-2xl text-balance">
                      {slide.headline}
                    </h1>
                  ) : (
                    <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.05] whitespace-pre-line mb-4 md:mb-6 max-w-2xl text-balance">
                      {slide.headline}
                    </h2>
                  )}
                  <p className="text-sm md:text-base text-white/85 font-light mb-8 md:mb-10 max-w-md leading-relaxed">
                    {slide.sub}
                  </p>
                  <Link
                    href={slide.cta.href}
                    className="inline-flex items-center gap-2.5 bg-white text-neutral-900 text-xs md:text-sm font-semibold tracking-[0.12em] uppercase px-6 py-3.5 hover:bg-primary hover:text-white transition-colors duration-300 group"
                  >
                    {slide.cta.label}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next arrows — desktop only */}
      <button
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center border border-white/30 text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Next slide"
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center border border-white/30 text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
      >
        <ArrowRight className="w-4 h-4" />
      </button>
      <button
        onClick={toggleAutoplay}
        aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
        className="hidden md:flex absolute right-6 top-[58%] -translate-y-1/2 w-12 h-12 items-center justify-center border border-white/30 text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      {/* Slide counter bottom-right */}
      <div
        aria-live="polite"
        className="absolute bottom-6 right-6 md:right-16 lg:right-24 text-white/40 text-xs tracking-widest font-light"
      >
        {(selectedIndex + 1).toString().padStart(2, "0")} /{" "}
        {slides.length.toString().padStart(2, "0")}
      </div>

      {/* Dot navigation for touch devices */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => emblaApi?.scrollTo(i)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === selectedIndex ? "true" : undefined}
          >
            <span
              className={
                i === selectedIndex
                  ? "h-2.5 w-2.5 rounded-full bg-white"
                  : "h-2.5 w-2.5 rounded-full bg-white/40"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}
