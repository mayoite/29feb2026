import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import dynamic from "next/dynamic";
import QueryProvider from "@/app/providers/QueryProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Lazy-load non-critical components — improves LCP / TTI
// Note: ssr:false is NOT allowed in Server Components; use regular dynamic() here
const Footer = dynamic(() =>
  import("@/components/layout/Footer").then((m) => ({ default: m.Footer })),
);
const AdvancedBot = dynamic(() =>
  import("@/components/bot/AdvancedBot").then((m) => ({
    default: m.AdvancedBot,
  })),
);
const AIAdvisor = dynamic(() =>
  import("@/components/ai/Advisor").then((m) => ({
    default: m.AIAdvisor,
  })),
);

import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

const FALLBACK_SITE_URL = "https://ourwebsitecopy2026-02-21.vercel.app";
const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
const SITE_URL = (RAW_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "One and Only Furniture | Premium Office Solutions — Patna, Bihar",
    template: "%s | One and Only Furniture",
  },
  description:
    "One and Only Furniture — premium ergonomic office furniture in Patna, Bihar, India. Workstations, seating, storage, tables & soft seating. Trusted by DMRC, TVS, Titan & more.",
  keywords: [
    "office furniture Patna",
    "premium office furniture Bihar",
    "ergonomic chairs India",
    "modular workstations Patna",
    "office furniture Bihar",
    "One and Only Furniture",
    "oando furniture",
    "office chairs Patna",
    "meeting tables Bihar",
    "storage solutions India",
  ],
  authors: [{ name: "One and Only Furniture", url: SITE_URL }],
  creator: "One and Only Furniture",
  publisher: "One and Only Furniture",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "One and Only Furniture",
    title: "One and Only Furniture | Premium Office Solutions",
    description:
      "Premium ergonomic office furniture in Patna, Bihar. Workstations, seating, storage & more. Trusted by leading corporates.",
    images: [
      {
        url: "/images/products/imported/fluid/image-1.webp",
        width: 1200,
        height: 630,
        alt: "One and Only Furniture – Premium Office Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "One and Only Furniture | Premium Office Solutions",
    description:
      "Premium ergonomic office furniture in Patna, Bihar. Workstations, seating, storage & more.",
    images: ["/images/products/imported/fluid/image-1.webp"],
  },
};

const LOCAL_BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  name: "One and Only Furniture",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Premium ergonomic office furniture in Patna, Bihar, India. Authorized dealer for leading office furniture brands.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Patna",
    addressRegion: "Bihar",
    addressCountry: "IN",
  },
  geo: { "@type": "GeoCoordinates", latitude: 25.5941, longitude: 85.1376 },
  telephone: "+91-XXXXXXXXXX",
  openingHours: "Mo-Sa 09:00-18:00",
  priceRange: "₹₹₹",
  areaServed: ["Bihar", "Jharkhand", "Uttar Pradesh", "Delhi NCR"],
  sameAs: [SITE_URL],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(LOCAL_BUSINESS_JSON_LD),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-white selection:bg-primary selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-9999 focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Skip to main content
        </a>
        <QueryProvider>
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <AdvancedBot />
          <AIAdvisor />
          <Analytics />
          <SpeedInsights />
        </QueryProvider>
      </body>
    </html>
  );
}
