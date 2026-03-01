import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Hero } from "@/components/home/Hero";
import { Newsletter } from "@/components/shared/Newsletter";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  Layers,
  HeartHandshake,
} from "lucide-react";

export default function ProductsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <Hero
        variant="small"
        title="Workspace Systems"
        subtitle="Engineered solutions for corporate, government, and institutional environments."
        showButton={false}
        backgroundImage="/images/products/60x30-workstation-1.webp"
      />

      <section className="container-wide py-24">
        <div className="max-w-4xl space-y-8 mb-20">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-neutral-400">
            Our Systems
          </p>
          <h2 className="typ-h2">
            Engineered for{" "}
            <span className="text-primary italic">Performance.</span>
          </h2>
          <p className="text-xl md:text-2xl font-light text-neutral-600 leading-relaxed">
            Every product we offer is part of a wider workspace system —
            designed to scale, adapt, and perform across your entire
            organisation.
          </p>
        </div>
        <CategoryGrid />
      </section>

      <section className="container-wide py-20">
        <div className="max-w-3xl space-y-6 mb-12">
          <p className="typ-eyebrow">What We Offer</p>
          <h2 className="typ-h2">From specification to installation.</h2>
          <p className="text-lg md:text-xl text-neutral-600">
            We engineer complete work environments around your team&apos;s
            needs. Select proven systems, then configure finishes, dimensions,
            and accessories to fit your space and budget.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 border border-neutral-200 rounded-2xl bg-white">
            <div className="flex items-center gap-3 mb-4 text-neutral-900">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="typ-h3">System Consultation</h3>
            </div>
            <p className="text-neutral-600">
              Space planning, system selection, and ergonomic specification with
              a dedicated workspace engineer.
            </p>
          </div>
          <div className="p-8 border border-neutral-200 rounded-2xl bg-white">
            <div className="flex items-center gap-3 mb-4 text-neutral-900">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="typ-h3">Fast Project Turnaround</h3>
            </div>
            <p className="text-neutral-600">
              Modular systems with reliable lead times, coordinated delivery,
              and on-site installation.
            </p>
          </div>
          <div className="p-8 border border-neutral-200 rounded-2xl bg-white">
            <div className="flex items-center gap-3 mb-4 text-neutral-900">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="typ-h3">Warranty &amp; Support</h3>
            </div>
            <p className="text-neutral-600">
              BIFMA-compliant systems backed by 5-year warranties and dedicated
              after-sales engineering support.
            </p>
          </div>
        </div>
      </section>

      {/* ── SIGNATURE SYSTEMS ─────────────────────────────────── */}
      <section className="w-full py-24 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_50%,#ffffff,transparent_60%)]" />
        <div className="container-wide relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-8 mb-16">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/20 rounded-full">
                <Star className="w-3 h-3 text-primary fill-primary" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">
                  Signature Systems
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                Premium workspace bundles,{" "}
                <span className="italic text-primary">
                  engineered to order.
                </span>
              </h2>
              <p className="text-lg text-neutral-400 font-light max-w-2xl">
                Curated system bundles for enterprise deployments — combining
                ergonomic seating, modular desking, storage, and acoustic
                solutions with extended warranties and dedicated project
                support.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(
              [
                {
                  icon: Layers,
                  tier: "Signature Essential",
                  tagline: "20–50 workpoints",
                  desc: "Modular desking + ergonomic seating system with 5-year warranty and installation.",
                  features: [
                    "Curvivo or Adaptable desking",
                    "Ergonomic task seating",
                    "Under-desk storage pods",
                    "5-year system warranty",
                  ],
                  cta: "/contact",
                  highlight: false,
                },
                {
                  icon: ShieldCheck,
                  tier: "Signature Enterprise",
                  tagline: "50–200 workpoints",
                  desc: "Full-floor workspace engineering — desking, seating, collaborative zones, and acoustic management.",
                  features: [
                    "Custom floor plan engineering",
                    "Ergonomic assessment included",
                    "Acoustic pod integration",
                    "Priority 7-year warranty",
                  ],
                  cta: "/contact",
                  highlight: true,
                },
                {
                  icon: HeartHandshake,
                  tier: "Signature Institutional",
                  tagline: "Government & Education",
                  desc: "GeM-aligned procurement bundles purpose-built for government offices, courts, and institutions.",
                  features: [
                    "GeM-compatible specifications",
                    "BIFMA-certified components",
                    "Institutional bulk pricing",
                    "Site inspection included",
                  ],
                  cta: "/contact",
                  highlight: false,
                },
              ] as const
            ).map((bundle) => (
              <div
                key={bundle.tier}
                className={`p-8 rounded-2xl border flex flex-col gap-6 transition-all product-card ${
                  bundle.highlight
                    ? "bg-primary border-primary text-white"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div>
                  <bundle.icon
                    className={`w-8 h-8 mb-4 ${bundle.highlight ? "text-white" : "text-primary"}`}
                    strokeWidth={1.5}
                  />
                  <p
                    className={`text-xs font-bold tracking-[0.2em] uppercase mb-2 ${bundle.highlight ? "text-white/70" : "text-neutral-400"}`}
                  >
                    {bundle.tagline}
                  </p>
                  <h3 className="text-2xl font-light">{bundle.tier}</h3>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${bundle.highlight ? "text-white/80" : "text-neutral-400"}`}
                  >
                    {bundle.desc}
                  </p>
                </div>
                <ul className="space-y-2 flex-1">
                  {bundle.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-center gap-2 text-sm ${bundle.highlight ? "text-white/90" : "text-neutral-300"}`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={bundle.cta}
                  className={`inline-flex items-center justify-center py-3 px-6 text-sm font-bold tracking-widest uppercase transition-colors ${
                    bundle.highlight
                      ? "bg-white text-primary hover:bg-neutral-100"
                      : "border border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  Request Bundle →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-neutral-50 py-20 border-y border-neutral-200">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-white rounded-2xl border border-neutral-200">
              <p className="typ-eyebrow mb-2">Individual Focus</p>
              <h3 className="typ-h3 mb-4">Workstations &amp; Desking</h3>
              <p className="text-neutral-600 mb-6">
                Height-adjustable and modular desking systems engineered for
                productive solo work at scale.
              </p>
              <Link
                href="/products/workstations"
                className="inline-flex items-center gap-2 border-b border-neutral-900 pb-1"
              >
                Explore <span className="text-xl">→</span>
              </Link>
            </div>
            <div className="p-8 bg-white rounded-2xl border border-neutral-200">
              <p className="typ-eyebrow mb-2">Team Collaboration</p>
              <h3 className="typ-h3 mb-4">Soft Seating &amp; Tables</h3>
              <p className="text-neutral-600 mb-6">
                Lounge and meeting systems engineered for acoustic comfort and
                dynamic team interaction.
              </p>
              <Link
                href="/products/soft-seating"
                className="inline-flex items-center gap-2 border-b border-neutral-900 pb-1"
              >
                Explore <span className="text-xl">→</span>
              </Link>
            </div>
            <div className="p-8 bg-white rounded-2xl border border-neutral-200">
              <p className="typ-eyebrow mb-2">Organized Spaces</p>
              <h3 className="typ-h3 mb-4">Storage &amp; Accessories</h3>
              <p className="text-neutral-600 mb-6">
                Engineered storage infrastructure — secure, scalable, and
                integrated with your workspace system.
              </p>
              <Link
                href="/products/storages"
                className="inline-flex items-center gap-2 border-b border-neutral-900 pb-1"
              >
                Explore <span className="text-xl">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-neutral-50 py-24 border-y border-neutral-200">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/catalog/oando-seating--fluid-x/image-1.webp"
                alt="Ergonomic Seating System"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-8">
              <h3 className="typ-h3">
                Engineered for health &amp; productivity.
              </h3>
              <p className="text-lg text-neutral-500 font-light leading-relaxed">
                Ergonomics is an engineering discipline — not a marketing claim.
                Every product in our catalog is specified for measurable impact
                on posture, focus, and long-term wellbeing.
              </p>
              <ul className="space-y-4">
                {[
                  "Performance-graded components, BIFMA-certified structures.",
                  "Acoustic-managed environments for deep focus.",
                  "Stepless height adjustment for active posture variety.",
                  "Low-emission materials with sustainable supply chains.",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-neutral-700 text-lg"
                  >
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-20">
        <div className="container-wide text-center">
          <p className="typ-eyebrow mb-3">Ready to Plan?</p>
          <h3 className="typ-h2 mb-6">Start your workspace system today.</h3>
          <div className="flex items-center justify-center gap-4">
            <Link href="/planning" className="btn-primary typ-cta">
              Planning Service
            </Link>
            <Link href="/contact" className="btn-outline typ-cta">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />
      <ContactTeaser />
    </main>
  );
}

