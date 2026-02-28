import { Hero } from "@/components/home/Hero";

export default function NewsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <Hero
        variant="small"
        title="News & Updates"
        subtitle="Latest news and announcements from One and Only Furniture"
        showButton={false}
        backgroundImage="/hero/dmrc-hero.webp"
      />
      
      <section className="container px-6 2xl:px-0 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-purple-50 rounded-2xl p-12 border border-purple-100">
            <div className="text-6xl mb-6">📰</div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Coming Soon</h2>
            <p className="text-xl text-neutral-600 mb-8">
              Our news and updates section is currently in development.
            </p>
            <p className="text-lg text-neutral-500">
              Soon you&apos;ll find the latest news, product launches, company updates, 
              and industry insights from One and Only Furniture.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-100">
              <div className="text-3xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Product Launches</h3>
              <p className="text-neutral-600 text-sm">New furniture collections and innovations</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-100">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Company News</h3>
              <p className="text-neutral-600 text-sm">Business updates and achievements</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-100">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Industry Insights</h3>
              <p className="text-neutral-600 text-sm">Office design trends and tips</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
