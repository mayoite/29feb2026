export const revalidate = 3600;

import { Suspense } from "react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PartnershipSection } from "@/components/home/PartnershipSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { VideoSection } from "@/components/home/VideoSection";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { Teaser } from "@/components/home/Teaser";
import { ServiceSection } from "@/components/home/ServiceSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { Recommendations } from "@/components/home/Recommendations";
import { StatsBlock } from "@/components/home/StatsBlock";
import { ClientMarquee } from "@/components/home/ClientMarquee";
import { OurWork } from "@/components/home/OurWork";
import { GsapAnimations } from "@/components/shared/GsapAnimations";

export default async function Home() {
  return (
    <main className="min-h-screen bg-white">
      <GsapAnimations />
      <div className="mx-auto w-full max-w-[1900px] px-3 md:px-5 lg:px-7">
        <HeroCarousel />
        <div className="section"><StatsBlock /></div>
        <div className="section"><PartnershipSection /></div>
        <div className="section"><FeaturedCarousel /></div>
        <div className="section"><Recommendations /></div>
        <div className="section">
          <Suspense fallback={<div className="h-96" />}>
            <CategoryGrid />
          </Suspense>
        </div>
        <div className="section">
          <VideoSection
            title={
              <>
                Space for <span className="italic">collaboration.</span>
              </>
            }
            description="The office is the central home base for personal exchanges and meetings with colleagues. With our modular furniture systems, versatile communication spaces can be created to foster innovation."
            buttonText="Explore Workspace Solutions"
            buttonLink="/products/workstations"
            posterSrc="/images/hero/workstations.webp"
            lightMode={true}
          />
        </div>
        <div className="section"><ProcessSection /></div>
        <div className="section">
          <Teaser
            title="Sustainability at the core."
            subtitle="Future Proof Workspace"
            description="Our commitment to the environment goes beyond the surface. We engineer premium office systems using 100% recycled waste wood and low-emission materials, ensuring your workspace supports both your team and the planet."
            imageSrc="/images/catalog/oando-seating--fluid-x/image-1.webp"
            imageAlt="Sustainable Premium Chair Design"
            reversed={true}
            lightMode={true}
            className="bg-neutral-50"
            linkUrl="/sustainability"
          />
        </div>
        <div className="section"><ServiceSection /></div>
        <div className="section"><OurWork /></div>
        <div className="section"><ContactTeaser /></div>
        <div className="section"><ClientMarquee /></div>
      </div>
    </main>
  );
}

