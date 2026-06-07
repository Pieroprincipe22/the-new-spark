import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";

export default async function PanelFidelidadPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-5 border-b border-zinc-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">
              Panel privado
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Clientes de fidelidad
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Gestiona los clientes registrados, sus teléfonos, los sellos
              acumulados y las recompensas de fidelidad digital.
            </p>
          </div>

          <Link
            href="/panel"
            className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-white"
          >
            Volver al panel
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Clientes
            </p>

            <h2 className="mt-4 text-3xl font-black text-white">0</h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Total de clientes registrados en el sistema de fidelidad.
            </p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Sellos
            </p>

            <h2 className="mt-4 text-3xl font-black text-white">0</h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Sellos acumulados entre todos los clientes.
            </p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Recompensas
            </p>

            <h2 className="mt-4 text-3xl font-black text-white">0</h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Recompensas pendientes de entregar.
            </p>
          </article>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase text-white">
                Lista de clientes
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                En el siguiente paso conectaremos esta pantalla con los datos
                reales de clientes para buscar por nombre, teléfono y controlar
                los sellos de fidelidad.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-500"
            >
              Añadir cliente
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 bg-black p-8 text-center">
            <h3 className="text-lg font-semibold text-white">
              Módulo en preparación
            </h3>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Aquí aparecerán los clientes de fidelidad con su teléfono, número
              de sellos, última visita y estado de recompensa.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}