"use client";

import Image from "next/image";

import { ArrowRight } from "lucide-react";

export function PartnershipSection() {
  return (
    <section className="relative w-full py-16 md:py-20 overflow-hidden bg-white flex items-center justify-center border-y border-neutral-100">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20 max-w-5xl mx-auto">
          {/* Partnership Logo */}
          <div className="shrink-0">
            <div className="relative w-80 h-32 md:w-96 md:h-48 flex items-center justify-center md:justify-start">
              <Image
                src="/catalog-logo.webp"
                alt="Catalog Furniture Solutions"
                width={480}
                height={160}
                sizes="(max-width: 768px) 320px, 480px"
                className="h-20 w-auto opacity-80 hover:opacity-100 transition-all"
              />
            </div>
          </div>

          {/* Partnership Content */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-1">
                Official Strategic Partnership
              </p>
              <h3 className="text-xl md:text-2xl font-serif text-neutral-900 leading-tight">
                Authorized Franchise
                <br className="hidden md:block" />
                Partner
              </h3>
            </div>

            <p className="text-sm text-neutral-500 italic leading-relaxed max-w-md">
              Bringing world-class manufacturing excellence and sustainable
              furniture solutions to your workspace.
            </p>

            <a
              href="https://catalogindia.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-neutral-900 hover:text-neutral-600 transition-colors border-b border-neutral-200 pb-0.5"
            >
              Visit catalogindia.in <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
