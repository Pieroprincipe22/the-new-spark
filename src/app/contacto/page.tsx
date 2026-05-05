import { ContactSection } from "@/components/sections/ContactSection";

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-black pt-10 text-white">
      <section className="px-5 py-12 text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.34em] text-white/45">
          The New Spark
        </p>

        <h1 className="text-5xl font-black uppercase tracking-tight text-white">
          Contacto
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-white/65">
          Escríbenos por WhatsApp, revisa nuestros horarios o síguenos en
          Instagram para ver más estilos.
        </p>
      </section>

      <ContactSection />
    </main>
  );
}