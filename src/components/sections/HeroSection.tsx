export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen overflow-hidden bg-black px-6 pt-40 text-white sm:px-8 lg:px-12"
    >
      <div className="absolute inset-0 bg-[url('/images/hero-barberia.jpg')] bg-cover bg-center opacity-35" />
      <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-neutral-950" />

      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl items-center">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.35em] text-amber-400">
            Barbería · Estilo · Reservas
          </p>

          <h1 className="text-5xl font-black uppercase leading-none tracking-tight sm:text-6xl lg:text-8xl">
            Reserva tu próximo corte
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-300 sm:text-lg">
            En The New Spark cuidamos cada detalle para que salgas con un corte
            limpio, moderno y adaptado a tu estilo.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#reservas"
              className="inline-flex justify-center rounded-full bg-amber-400 px-7 py-4 text-sm font-black uppercase tracking-wide text-neutral-950 transition hover:bg-amber-300"
            >
              Reservar cita
            </a>

            <a
              href="#servicios"
              className="inline-flex justify-center rounded-full border border-white/15 px-7 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:border-amber-400/60 hover:text-amber-300"
            >
              Ver servicios
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;