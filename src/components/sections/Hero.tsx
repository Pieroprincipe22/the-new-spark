export function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate min-h-screen overflow-hidden bg-black"
    >
      <div
        className="absolute inset-0 -z-30 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-barber-bg.png')",
        }}
      />

      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,.84)_18%,rgba(0,0,0,.30)_46%,rgba(0,0,0,.08)_100%)]" />

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,.04),#000_96%)]" />

      <div className="relative flex min-h-screen w-full items-start px-6 pb-10 pt-36 sm:px-8 sm:pt-40 lg:px-10 xl:px-12">
        <div className="w-full max-w-130 pt-4 sm:pt-6 lg:pt-10">
          <p className="mb-5 text-xs font-black uppercase tracking-[0.34em] text-white/55">
            Barbería · estilo · reservas
          </p>

          <h1 className="text-6xl font-black uppercase leading-[0.88] tracking-tight text-white drop-shadow-2xl sm:text-7xl lg:text-8xl">
            Reserva
            <br />
            tu estilo
          </h1>

          <div className="mt-6 h-px w-14 bg-white" />

          <p className="mt-4 max-w-sm text-lg leading-tight text-white/82">
            Cortes modernos, atención profesional y reservas fáciles.
          </p>
        </div>
      </div>
    </section>
  );
}