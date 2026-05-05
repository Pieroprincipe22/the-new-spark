import { CalendarDays, MessageCircle, Scissors } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createWhatsappLink } from "@/lib/whatsapp";

export function Hero() {
  const whatsappMessage = "Hola, quiero reservar una cita en The New Spark.";

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-black via-zinc-950 to-black">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
            Barbería & estilo
          </p>

          <h1 className="font-serif text-5xl font-bold leading-tight text-white md:text-7xl">
            Reserva <span className="block text-amber-400">tu estilo</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
            Cortes modernos, atención profesional y citas rápidas por WhatsApp.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button href="/reservar">
              <CalendarDays className="mr-2 h-5 w-5" />
              Reservar cita
            </Button>

            <Button
              href={createWhatsappLink(whatsappMessage)}
              variant="secondary"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              WhatsApp
            </Button>
          </div>
        </div>

        <div className="relative min-h-90 overflow-hidden rounded-3xl border border-amber-400/20 bg-zinc-950 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.25),transparent_35%),linear-gradient(135deg,#111827,#000000)]" />

          <div className="relative flex min-h-90 flex-col justify-between p-8">
            <div className="flex justify-end">
              <div className="rounded-full border border-amber-400/40 p-5 text-amber-400">
                <Scissors className="h-16 w-16" />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.25em] text-amber-400">
                The New Spark
              </p>

              <h2 className="font-serif text-4xl text-white">
                Imagen moderna, atención profesional.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-zinc-400">
                Aquí irá la foto principal del negocio o del barbero trabajando.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}