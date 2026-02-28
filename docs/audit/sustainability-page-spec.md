# Sustainability Page Spec (Implementation-Ready)

## Goal
Upgrade `/sustainability` from static narrative to measurable trust + lead conversion page for enterprise buyers in Patna/Bihar.

## Page Structure
1. Hero
- Message: measurable sustainability for office fit-outs.
- CTA primary: `Request Sustainable BOQ`
- CTA secondary: `Download ESG Datasheet`

2. Impact Metrics (proof strip)
- Tiles:
  - `% recycled materials used`
  - `% local sourcing within India`
  - `estimated CO2e avoided per project`
  - `certifications count`

3. Material + Lifecycle Blocks
- Responsible materials
- Repairability / modular replacement
- End-of-life recycling and buyback process

4. Certifications and Compliance
- ISO / FSC / PEFC / local standards
- downloadable certificate links (PDF)

5. Case Snapshot (Patna/Bihar)
- 1-2 short project examples with before/after outcomes.

6. FAQ (SEO + conversion)
- “Do you provide sustainability documentation for tenders?”
- “Can you map products by eco score and budget?”
- “Do you support phased replacement for existing offices?”

7. Conversion Footer
- Form CTA and WhatsApp CTA
- Micro-copy: response SLA and consultation process

## Content Quality Rules
- No unverifiable environmental claims.
- Every metric includes source or methodology note.
- Keep copy concise and procurement-friendly.

## Suggested Component Layout
```tsx
<Hero title="Sustainable Workspaces, Measurable Outcomes" />
<ImpactMetrics />
<LifecycleGrid />
<CertificationsPanel />
<ProjectCaseSnippets />
<SustainabilityFAQ />
<SustainabilityCTA />
```

## Sample CTA Component
```tsx
export function SustainabilityCTA() {
  return (
    <section className="bg-primary text-white py-16">
      <div className="container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-medium">Plan Your Sustainable Office Upgrade</h2>
          <p className="text-white/85 mt-2">Get an eco-scored product mix and budget estimate for Patna/Bihar deployment.</p>
        </div>
        <div className="flex gap-3">
          <a href="/contact" className="bg-accent1 text-neutral-900 px-6 py-3 font-semibold">Request Sustainable BOQ</a>
          <a href="/downloads" className="border border-white/40 px-6 py-3">Download ESG Datasheet</a>
        </div>
      </div>
    </section>
  );
}
```

## Verification
1. Lighthouse SEO + Accessibility >= 90 for page.
2. FAQ schema valid.
3. CTA click events captured in analytics.
4. Mobile layout verified for hero, metrics grid, and CTA buttons.