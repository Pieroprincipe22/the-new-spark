import { services as defaultServices, type Service } from "@/data/catalog";

type ServicesSectionProps = {
  services?: Service[];
};

export function ServicesSection({
  services = defaultServices,
}: ServicesSectionProps) {
  return (
    <section
      id="servicios"
      className="bg-neutral-950 px-6 py-20 text-white sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
            Servicios
          </p>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Servicios principales
          </h2>

          <p className="mt-4 text-base leading-7 text-neutral-300">
            Elige el servicio que necesitas y reserva tu cita con antelación
            para asegurar tu hueco.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className="rounded-3xl border border-white/10 bg-white/3 p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-white/6"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <h3 className="text-xl font-bold text-white">
                  {service.name}
                </h3>

                <span className="shrink-0 rounded-full border border-amber-400/40 px-3 py-1 text-sm font-semibold text-amber-300">
                  {service.price}
                </span>
              </div>

              <p className="text-sm leading-6 text-neutral-300">
                {service.description}
              </p>

              <div className="mt-6 border-t border-white/10 pt-5">
                <a
                  href="#reservas"
                  className="text-sm font-bold text-amber-400 transition hover:text-amber-300"
                >
                  Reservar este servicio
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;