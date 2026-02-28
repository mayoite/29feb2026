import { Hero } from "@/components/home/Hero";

export default function CatalogPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <Hero
        variant="small"
        title="Product Catalog"
        subtitle="Complete catalog of our office furniture collections"
        showButton={false}
        backgroundImage="/hero/usha-hero.webp"
      />
      
      <section className="container px-6 2xl:px-0 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 rounded-2xl p-12 border border-red-100">
            <div className="text-6xl mb-6">📚</div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Coming Soon</h2>
            <p className="text-xl text-neutral-600 mb-8">
              Our comprehensive product catalog is currently being developed.
            </p>
            <p className="text-lg text-neutral-500">
              Soon you&apos;ll be able to browse and download our complete product catalog 
              with detailed specifications, pricing, and ordering information.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-100">
              <div className="text-3xl mb-4">🪑</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Office Chairs</h3>
              <p className="text-neutral-600 text-sm">Ergonomic and executive chairs</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-100">
              <div className="text-3xl mb-4">🛋️</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Soft Seating</h3>
              <p className="text-neutral-600 text-sm">Sofas, lounge chairs, and benches</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-100">
              <div className="text-3xl mb-4">🧩</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Workstations</h3>
              <p className="text-neutral-600 text-sm">Modular desk systems and panels</p>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-100">
              <div className="text-3xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Storage</h3>
              <p className="text-neutral-600 text-sm">Cabinets, shelves, and lockers</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-100">
              <div className="text-3xl mb-4">🪟</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Tables</h3>
              <p className="text-neutral-600 text-sm">Conference and meeting tables</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-100">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Accessories</h3>
              <p className="text-neutral-600 text-sm">Lighting, screens, and accessories</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
