import { ContactSection } from "@/components/sections/ContactSection";

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-black pt-10">
      <section className="px-5 py-12 text-center">
        <h1 className="font-serif text-5xl text-white">Contacto</h1>

        <p className="mt-4 text-zinc-400">
          Escríbenos por WhatsApp o síguenos en Instagram.
        </p>
      </section>

      <ContactSection />
    </main>
  );
}