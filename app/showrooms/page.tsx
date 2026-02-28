import { Hero } from "@/components/home/Hero";

export default function ShowroomsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <Hero
        variant="small"
        title="Our Showrooms"
        subtitle="Experience our furniture in person at our exclusive showrooms"
        showButton={false}
        backgroundImage="/hero/franklin-hero.webp"
      />
      
      <section className="container px-6 2xl:px-0 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-green-50 rounded-2xl p-12 border border-green-100">
            <div className="text-6xl mb-6">🏢</div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Coming Soon</h2>
            <p className="text-xl text-neutral-600 mb-8">
              Our showrooms section is currently being developed.
            </p>
            <p className="text-lg text-neutral-500">
              Soon you&apos;ll be able to explore our showroom locations, book appointments, 
              and experience our furniture collections in person.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center p-8 bg-white rounded-xl border border-neutral-100">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Showroom Locations</h3>
              <p className="text-neutral-600 mb-4">
                Visit our exclusive showrooms across major cities
              </p>
              <div className="text-sm text-neutral-500 space-y-1">
                <p>• Gurugram, Haryana</p>
                <p>• New Delhi</p>
                <p>• Mumbai</p>
                <p>• Bangalore</p>
              </div>
            </div>
            
            <div className="text-center p-8 bg-white rounded-xl border border-neutral-100">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Book Appointment</h3>
              <p className="text-neutral-600 mb-4">
                Schedule a personalized showroom visit
              </p>
              <p className="text-sm text-neutral-500">
                Expert consultants available to guide you through our collections
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
