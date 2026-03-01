"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useInView, useAnimation } from "framer-motion";

const FEATURED_PRODUCTS = [
  {
    id: "fluid-x",
    name: "Fluid X",
    category: "Seating",
    description:
      "The next generation of ergonomic performance. Designed for movement.",
    image: "/images/catalog/oando-seating--fluid-x/image-1.webp",
    link: "/products/seating/oando-seating--fluid-x",
    theme: "light",
  },
  {
    id: "deskpro",
    name: "DeskPro",
    category: "Workstations",
    description:
      "Modular architecture to support any way of working, anywhere.",
    image: "/images/catalog/oando-workstations--deskpro/image-1.webp",
    link: "/products/workstations/oando-workstations--deskpro",
    theme: "dark",
  },
  {
    id: "cocoon",
    name: "Cocoon Pod",
    category: "Collaborative",
    description:
      "Where focus meets comfort. The perfect acoustic pod for deep work.",
    image: "/images/products/imported/cocoon/image-1.webp",
    link: "/products/soft-seating/oando-collaborative--cocoon-pod",
    theme: "light",
  },
];

export function FeaturedCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <section className="w-full bg-neutral-50 py-16 md:py-20">
      <div className="container px-6 2xl:px-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-8">
          <div className="max-w-2xl space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
              Featured Systems
            </p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              variants={{
                visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
              }}
              className="typ-h2 text-neutral-900"
            >
              Signature pieces for everyday performance.
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={controls}
            variants={{
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, delay: 0.2 },
              },
            }}
          >
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 border-b border-neutral-900 pb-1 hover:text-primary hover:border-primary-hover transition-colors"
            >
              Explore All Collections{" "}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12"
          ref={containerRef}
        >
          {/* Main Feature */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={controls}
            variants={{
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, delay: 0.3 },
              },
            }}
            className="our-work md:col-span-8 group relative w-full aspect-4/3 md:aspect-auto md:h-[700px] overflow-hidden bg-stone-100 rounded-lg"
          >
            <Link
              href={FEATURED_PRODUCTS[0].link}
              className="absolute inset-0 z-20"
            >
              <span className="sr-only">View {FEATURED_PRODUCTS[0].name}</span>
            </Link>
            <Image
              src={FEATURED_PRODUCTS[0].image}
              alt={FEATURED_PRODUCTS[0].name}
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-contain p-6 transition-transform duration-1000 group-hover:scale-105"
            />
          </motion.div>

          {/* Side Features */}
          <div className="md:col-span-4 flex flex-col gap-8 md:gap-12 h-full">
            {FEATURED_PRODUCTS.slice(1).map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={controls}
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, delay: 0.4 + idx * 0.2 },
                  },
                }}
                className="our-work group relative flex-1 aspect-4/3 md:aspect-auto overflow-hidden bg-stone-100 rounded-lg"
              >
                <Link href={product.link} className="absolute inset-0 z-20">
                  <span className="sr-only">View {product.name}</span>
                </Link>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-6 transition-transform duration-1000 group-hover:scale-105"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
