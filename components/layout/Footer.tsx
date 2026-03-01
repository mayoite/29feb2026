// Cleaned Footer — logo, nav links, address, phone, email only.
// Removed: redundant trust-badge strip (already shown in ClientLogos section above).

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Catalog_CATEGORY_ORDER, buildCatalogCategoryNav } from "@/lib/catalogCategories";

const NAV = [
  {
    heading: "Products",
    links: [
      { href: "/products", label: "All Products" },
      ...buildCatalogCategoryNav(Catalog_CATEGORY_ORDER).map((item) => ({
        href: item.href,
        label: item.label,
      })),
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/projects", label: "Projects" },
      { href: "/sustainability", label: "Sustainability" },
      { href: "/service", label: "Service" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer w-full bg-neutral-900 text-neutral-400 font-sans">
      {/* Main grid */}
      <div className="container px-6 2xl:px-0 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand + contact */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <Link href="/" prefetch={false} className="block">
              <span className="text-xl font-semibold tracking-tight text-white">
                One and Only
              </span>
              <span className="text-xs text-neutral-500 block mt-0.5 tracking-widest uppercase">
                Furniture
              </span>
            </Link>

            <address className="not-italic text-sm leading-7 text-neutral-400">
              One and Only Furniture
              <br />
              Patna, Bihar, India
            </address>

            <div className="text-sm space-y-1">
              <a
                href="tel:+919031022875"
                className="block hover:text-white transition-colors"
              >
                +91 90310 22875
              </a>
              <a
                href="mailto:info@oando.co.in"
                className="block hover:text-white transition-colors"
              >
                info@oando.co.in
              </a>
            </div>

            <a
              href="https://wa.me/919031022875?text=Hi%2C+I%27d+like+to+enquire+about+office+furniture"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-semibold tracking-widest uppercase px-4 py-2.5 hover:bg-[#128C7E] transition-colors w-fit"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>

          {/* Nav columns */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-16">
            {NAV.map((col) => (
              <div key={col.heading}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-5">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-3">
                  {col.links.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        prefetch={false}
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="container px-6 2xl:px-0 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-600">
          <div className="flex gap-6">
            <Link
              href="/imprint"
              prefetch={false}
              className="hover:text-neutral-400 transition-colors"
            >
              Imprint
            </Link>
            <Link
              href="/privacy"
              prefetch={false}
              className="hover:text-neutral-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              prefetch={false}
              className="hover:text-neutral-400 transition-colors"
            >
              Terms
            </Link>
          </div>
          <div suppressHydrationWarning>
            &copy; {new Date().getFullYear()} One and Only Furniture. All rights
            reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
