import { Hero } from "@/components/home/Hero";

export default function ServicePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <Hero
        variant="small"
        title="Service & Support"
        subtitle="Comprehensive service solutions for your office furniture"
        showButton={false}
        backgroundImage="/hero/usha-hero.webp"
      />
      
      <section className="container px-6 2xl:px-0 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-blue-50 rounded-2xl p-12 border border-blue-100">
            <div className="text-6xl mb-6">🚧</div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Coming Soon</h2>
            <p className="text-xl text-neutral-600 mb-8">
              Our comprehensive service and support section is currently under development.
            </p>
            <p className="text-lg text-neutral-500">
              We&apos;re working hard to bring you detailed information about our installation, 
              maintenance, and customer support services.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-100">
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Installation</h3>
              <p className="text-neutral-600">Professional installation services</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-100">
              <div className="text-3xl mb-4">🛠️</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Maintenance</h3>
              <p className="text-neutral-600">Regular maintenance and repairs</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-100">
              <div className="text-3xl mb-4">📞</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Support</h3>
              <p className="text-neutral-600">24/7 customer support</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
