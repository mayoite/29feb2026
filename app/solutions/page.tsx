import { Hero } from "@/components/home/Hero";
import { Newsletter } from "@/components/shared/Newsletter";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { ContentBlock } from "@/components/shared/ContentBlock";
import { Reveal } from "@/components/shared/Reveal";
import Image from "next/image";

export default function SolutionsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <Hero
        variant="cinema"
        title={
          <>
            Workspace <br />
            <span className="text-primary italic">Solutions</span> that fit.
          </>
        }
        subtitle="From planning to installation, we design practical office environments tailored to your teams, workflows, and growth."
        showButton={false}
        backgroundImage="/images/hero/hero-3.webp"
      />

      <section className="container px-6 2xl:px-0 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <Reveal>
              <h2 className="text-5xl md:text-7xl font-slogan text-neutral-900 leading-[0.9] tracking-tight">
                Built around <br />
                your <span className="text-primary italic">workflow.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.4}>
              <p className="text-xl md:text-2xl font-light text-neutral-500 leading-relaxed">
                Whether you are setting up focus zones, collaboration areas, or
                client-facing meeting rooms, we combine ergonomics, acoustics,
                and modular systems to deliver spaces that work every day.
              </p>
            </Reveal>
          </div>
          <div className="relative group">
            <Image
              src="/images/hero/hero-2.webp"
              alt="Modern workspace planning"
              width={1400}
              height={1000}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl"
            />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 -z-10 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700" />
          </div>
        </div>
      </section>

      <section className="w-full bg-neutral-900 py-32">
        <div className="container px-6 2xl:px-0">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-slogan text-white mb-20">
              How we <span className="text-primary italic">Deliver.</span>
            </h2>
          </Reveal>
        </div>

        <ContentBlock
          title="Analysis & Strategy."
          subtitle="Step 01"
          description="We audit your current layout, team patterns, and usage needs to define the right space plan before procurement begins."
          imageSrc="/images/catalog/oando-workstations--deskpro/image-1.webp"
          align="left"
          linkText="Book Consultation"
          linkHref="/contact"
        />

        <ContentBlock
          title="Holistic Planning."
          subtitle="Step 02"
          description="We convert your requirements into practical plans with product mixes, zoning, and finish options aligned to budget and timelines."
          imageSrc="/images/catalog/oando-tables--curvivo-meet/image-1.webp"
          align="right"
          linkText="View Projects"
          linkHref="/projects"
        />

        <ContentBlock
          title="Realization & Service."
          subtitle="Step 03"
          description="Our team executes installation, handover, and after-sales support so your workspace remains reliable as your business evolves."
          imageSrc="/images/catalog/oando-soft-seating--accent/image-1.webp"
          align="left"
          linkText="Contact Service"
          linkHref="/service"
        />
      </section>

      <section className="w-full py-32 bg-white">
        <div className="container px-6 2xl:px-0 text-center space-y-12">
          <Reveal>
            <h2 className="text-5xl md:text-7xl font-slogan text-neutral-900 leading-none">
              Plan your next <span className="text-primary italic">workspace.</span>
            </h2>
          </Reveal>
          <p className="text-xl md:text-2xl text-neutral-500 font-light max-w-2xl mx-auto">
            Tell us your scope, seat count, and timeline. We will share a
            practical proposal built for your use case.
          </p>
          <div className="pt-8">
            <a
              href="/contact"
              className="px-12 py-6 bg-neutral-900 text-white hover:bg-primary transition-all uppercase tracking-widest font-bold inline-block"
            >
              Request Proposal
            </a>
          </div>
        </div>
      </section>

      <Newsletter />
      <ContactTeaser />
    </main>
  );
}
