import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
      <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-white/40">
        Error 404
      </p>

      <h1 className="text-6xl font-black uppercase leading-none tracking-tight sm:text-8xl">
        Página no encontrada
      </h1>

      <div className="mt-6 h-px w-14 bg-white" />

      <p className="mt-6 max-w-md text-center text-base leading-7 text-white/60">
        La página que buscas no existe o ha sido movida.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-sm bg-white px-8 py-3 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-white/85"
        >
          Volver al inicio
        </Link>

        <Link
          href="/reservar"
          className="inline-flex items-center justify-center rounded-sm border border-white/55 px-8 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
        >
          Reservar cita
        </Link>
      </div>
    </main>
  );
}