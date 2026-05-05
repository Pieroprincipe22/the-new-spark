import { Scissors, Smile, Sparkles } from "lucide-react";
import { services } from "@/data/site";

const icons = {
  corte: Scissors,
  barba: Smile,
  "corte-barba": Sparkles,
};

export function Services() {
  return (
    <section
      id="servicios"
      className="border border-white/70 bg-black/75 p-4 sm:p-5"
    >
      <div className="mb-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/60" />
        <h2 className="text-center text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          Nuestros servicios
        </h2>
        <div className="h-px flex-1 bg-white/60" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {services.map((service) => {
          const Icon = icons[service.id as keyof typeof icons] ?? Scissors;

          return (
            <article
              key={service.id}
              className="rounded-md border border-white/60 p-5 text-center transition hover:bg-white hover:text-black"
            >
              <div className="mx-auto flex h-20 items-center justify-center">
                <Icon className="h-14 w-14" strokeWidth={1.4} />
              </div>

              <h3 className="mt-2 text-2xl font-black uppercase tracking-tight">
                {service.name}
              </h3>

              <p className="mt-2 min-h-12 text-sm leading-tight opacity-80">
                {service.description}
              </p>

              <div className="mx-auto my-4 h-px w-24 bg-current opacity-45" />

              <p className="text-3xl font-black tracking-wide">
                {service.price}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}