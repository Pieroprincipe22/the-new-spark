import { BadgeCheck, ClipboardCheck, Gift, ShieldCheck } from "lucide-react";

const loyaltySteps = [
  {
    icon: ClipboardCheck,
    title: "Registro por cliente",
    description:
      "Cada cliente podrá quedar asociado a su número de teléfono para consultar sus visitas y sellos acumulados.",
  },
  {
    icon: BadgeCheck,
    title: "Sellos digitales",
    description:
      "Nick podrá validar los sellos desde el sistema, evitando depender solo de una tarjeta física.",
  },
  {
    icon: Gift,
    title: "Recompensa final",
    description:
      "Cuando el cliente complete la tarjeta, se podrá revisar su recompensa disponible desde el acceso privado.",
  },
];

const stampSlots = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
];

export function LoyaltySection() {
  return (
    <section id="fidelidad" className="mx-auto max-w-7xl px-5 pb-4 lg:px-8">
      <div className="border border-white/70 bg-black/75 p-4 sm:p-5">
        <div className="mb-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/60" />

          <h2 className="text-center text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            Fidelidad digital
          </h2>

          <div className="h-px flex-1 bg-white/60" />
        </div>

        <p className="mx-auto mb-6 max-w-2xl text-center text-sm leading-relaxed text-white/70">
          Un sistema pensado para que los clientes de The New Spark puedan
          conservar sus sellos aunque pierdan u olviden la tarjeta física.
        </p>

        <div className="grid gap-5 xl:grid-cols-[0.55fr_0.45fr]">
          <div className="grid gap-3">
            {loyaltySteps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="rounded-md border border-white/60 p-4 transition hover:bg-white hover:text-black"
                >
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-current">
                      <Icon className="h-6 w-6" strokeWidth={1.7} />
                    </div>

                    <div>
                      <h3 className="text-base font-black uppercase leading-tight tracking-tight sm:text-lg">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-sm leading-tight opacity-80">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <article className="rounded-md border border-white/60 p-4">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-white/55">
                  The New Spark
                </p>

                <h3 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight text-white">
                  Tarjeta
                  <br />
                  de sellos
                </h3>
              </div>

              <div className="rounded-md border border-white/60 px-3 py-2 text-xs font-black uppercase tracking-wide text-white">
                Digital
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {stampSlots.map((stamp, index) => {
                const completed = index < 6;

                return (
                  <div
                    key={stamp}
                    className={
                      completed
                        ? "flex aspect-square items-center justify-center rounded-md bg-white text-sm font-black text-black"
                        : "flex aspect-square items-center justify-center rounded-md border border-white/45 text-sm font-black text-white/55"
                    }
                  >
                    {completed ? "✓" : stamp}
                  </div>
                );
              })}
            </div>

            <div className="my-5 h-px w-full bg-white/45" />

            <div className="flex gap-4">
              <ShieldCheck className="h-6 w-6 shrink-0 text-white" strokeWidth={1.7} />

              <div>
                <p className="text-sm font-black uppercase tracking-wide text-white">
                  Estado de ejemplo
                </p>

                <p className="mt-1 text-sm leading-tight text-white/75">
                  6 de 10 sellos completados. Más adelante esta información se
                  conectará con el acceso privado de la barbería.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}