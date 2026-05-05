import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { BookingSection } from "@/components/sections/BookingSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      <Hero />

      <section className="relative z-10 mx-auto -mt-24 grid max-w-7xl gap-4 px-5 pb-4 lg:grid-cols-[0.49fr_0.51fr] lg:px-8">
        <Services />
        <BookingSection />
      </section>

      <ContactSection />
    </main>
  );
}