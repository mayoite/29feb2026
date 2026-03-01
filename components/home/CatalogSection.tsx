"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function PartnerSection() {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Logo and Text Group */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
            {/* Partner Logo */}
            <div className="relative w-32 h-12 grayscale-0 opacity-100 transition-opacity hover:opacity-100">
              <Image
                src="/logo-final.webp"
                alt="Logo"
                width={120}
                height={40}
                sizes="120px"
                className="h-8 w-auto grayscale"
              />
            </div>

            {/* Vertical Divider (Desktop only) */}
            <div className="hidden md:block w-px h-12 bg-neutral-200" />

            {/* Text Content */}
            <div className="text-left">
              <h3 className="text-2xl font-medium text-neutral-900 leading-tight">
                Official Strategic Partner
              </h3>
              <p className="text-lg text-neutral-500">
                Exclusive partnership for premium office solutions in India
              </p>
            </div>
          </div>

          {/* CTA Link */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-base text-primary font-medium hover:text-primary-hover transition-colors"
          >
            Read about our partnership
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
