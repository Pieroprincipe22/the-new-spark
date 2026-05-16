import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { BookingSection } from "@/components/sections/BookingSection";
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

      <section className="relative z-10 mx-auto -mt-24 grid max-w-375 gap-5 px-5 pb-4 xl:grid-cols-[0.42fr_0.58fr] lg:px-8">
        <Services services={services} />
        <BookingSection services={services} />
      </section>

      <ProductsSection products={products} />

      <ContactSection />
    </main>
  );
}