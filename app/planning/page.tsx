import { Hero } from "@/components/home/Hero";

export default function PlanningPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <Hero
        variant="small"
        title="Planning Service"
        subtitle="Professional space planning and design consultation"
        showButton={false}
        backgroundImage="/hero/titan-hero.webp"
      />
      
      <section className="container px-6 2xl:px-0 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-orange-50 rounded-2xl p-12 border border-orange-100">
            <div className="text-6xl mb-6">📐</div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Coming Soon</h2>
            <p className="text-xl text-neutral-600 mb-8">
              Our professional planning service section is currently under development.
            </p>
            <p className="text-lg text-neutral-500">
              We&apos;re creating comprehensive tools and services to help you plan 
              and design your perfect office space with our expert consultants.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center p-8 bg-white rounded-xl border border-neutral-100">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Space Planning</h3>
              <p className="text-neutral-600 mb-4">
                Professional layout design and optimization
              </p>
              <div className="text-sm text-neutral-500 space-y-1">
                <p>• Office layout design</p>
                <p>• Furniture placement</p>
                <p>• Traffic flow optimization</p>
              </div>
            </div>
            
            <div className="text-center p-8 bg-white rounded-xl border border-neutral-100">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Consultation</h3>
              <p className="text-neutral-600 mb-4">
                Expert guidance for your office design
              </p>
              <div className="text-sm text-neutral-500 space-y-1">
                <p>• Design consultation</p>
                <p>• Product selection</p>
                <p>• Custom solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
