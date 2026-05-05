import { Scissors, Smile, Sparkles } from "lucide-react";
import { services } from "@/data/site";

const icons = {
  corte: Scissors,
  barba: Smile,
  "corte-barba": Sparkles,
};

export function Services() {
  return (
    <section id="servicios" className="bg-black px-5 py-14">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-center font-serif text-3xl font-semibold text-amber-400">
          Nuestros servicios
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          {services.map((service) => {
            const Icon = icons[service.id as keyof typeof icons];

            return (
              <article
                key={service.id}
                className="rounded-2xl border border-amber-400/20 bg-zinc-950 p-6 shadow-lg"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 text-amber-400">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="font-serif text-2xl text-white">
                  {service.name}
                </h3>

                <p className="mt-2 text-sm text-zinc-400">
                  {service.description}
                </p>

                <p className="mt-4 text-2xl font-bold text-amber-400">
                  {service.price}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}