import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { BookingSection } from "@/components/sections/BookingSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <BookingSection />
      <ContactSection />
    </main>
  );
}