import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Promoción | The New Spark",
  description:
    "Promoción de fidelidad de The New Spark para clientes habituales de barbería.",
};

const benefits = [
  {
    title: "Acumula sellos",
    description:
      "Cada visita registrada suma en tu tarjeta de fidelidad de The New Spark.",
  },
  {
    title: "Control digital",
    description:
      "Tus sellos quedan asociados a tus datos de cliente para poder consultarlos desde el sistema interno.",
  },
  {
    title: "Recompensa",
    description:
      "Al completar la tarjeta de fidelidad podrás disfrutar de la recompensa activa en barbería.",
  },
];

const steps = [
  "Reserva tu cita o acude a la barbería.",
  "Realiza tu servicio en The New Spark.",
  "Se registra tu visita en la tarjeta de fidelidad.",
  "Completa tu tarjeta y solicita tu recompensa.",
];

export default function PromocionesPage() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(
    "Hola, quiero información sobre la promoción de fidelidad de The New Spark."
  )}`;

  return (
    <main className="min-h-screen bg-black px-6 pb-16 pt-32 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-10 border border-white/20 bg-black p-6 md:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-white/45">
              Promoción de fidelidad
            </p>

            <h1 className="text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">
              Tus visitas tienen recompensa
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/65">
              En The New Spark premiamos a los clientes habituales con una
              tarjeta de fidelidad vinculada a sus visitas. Acumula sellos con
              tus servicios y disfruta de la recompensa activa al completar tu
              tarjeta.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/#reserva"
                className="inline-flex items-center justify-center rounded-sm bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-white/80"
              >
                Reservar cita
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-sm border border-white/35 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
              >
                Consultar promoción
              </a>
            </div>
          </div>

          <div className="border border-white/20 bg-white/3 p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/45">
              Tarjeta de fidelidad
            </p>

            <h2 className="mt-4 text-3xl font-black uppercase leading-tight">
              Control de sellos digital
            </h2>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="flex aspect-square items-center justify-center rounded-full border border-white/25 bg-black text-sm font-black text-white"
                >
                  {index + 1}
                </div>
              ))}
            </div>

            <div className="mt-8 border border-white bg-white p-5 text-black">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-black/60">
                Recompensa activa
              </p>

              <p className="mt-2 text-2xl font-black uppercase">
                Completa tu tarjeta
              </p>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="border border-white/20 bg-black p-6"
            >
              <h2 className="text-xl font-black uppercase">
                {benefit.title}
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/65">
                {benefit.description}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 border border-white/20 bg-black p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-white/45">
                Funcionamiento
              </p>

              <h2 className="text-3xl font-black uppercase leading-tight md:text-4xl">
                Cómo acumular tus sellos
              </h2>

              <p className="mt-5 text-sm leading-7 text-white/60">
                La tarjeta de fidelidad permite mantener un control claro de las
                visitas realizadas y de los sellos acumulados por cada cliente.
              </p>
            </div>

            <div className="grid gap-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="grid gap-4 border border-white/15 bg-white/3 p-5 sm:grid-cols-[auto_1fr] sm:items-center"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                    {index + 1}
                  </span>

                  <p className="text-sm font-semibold leading-7 text-white/75">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 border border-white bg-white p-8 text-black md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-black/50">
            The New Spark
          </p>

          <h2 className="mt-4 text-3xl font-black uppercase leading-tight md:text-5xl">
            Reserva tu próxima visita
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-black/65">
            Reserva tu cita y sigue acumulando visitas dentro del sistema de
            fidelidad de The New Spark.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/#reserva"
              className="inline-flex items-center justify-center rounded-sm bg-black px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-black/80"
            >
              Ir a reservas
            </Link>

            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-sm border border-black/30 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white"
            >
              Ver Instagram
            </a>
          </div>
        </section>
      </section>
    </main>
  );
}