import { Hero } from "@/components/sections/Hero";
import { BookingExperience } from "@/components/sections/BookingExperience";
import { ProductsSection } from "@/components/sections/ProductsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { getProducts, getServices } from "@/lib/catalog";

export const revalidate = 60;

export default async function HomePage() {
  const [services, products] = await Promise.all([
    getServices(),
    getProducts(),
  ]);

  return (
    <main className="bg-black text-white">
      <Hero />

      <BookingExperience services={services} />

      <ProductsSection products={products} />

      <ContactSection />
    </main>
  );
}