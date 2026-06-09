import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin, requireAdmin } from "@/lib/admin/auth";

async function logoutAction() {
  "use server";
  await logoutAdmin();
  redirect("/login"); // ✅
}

export default async function PanelInicioPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col gap-5 border-b border-white/15 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.4em] text-white/50">
              Panel privado
            </p>

            <h1 className="text-4xl font-black uppercase md:text-5xl">
              Administración
            </h1>

            <p className="mt-4 max-w-2xl text-white/65">
              Gestiona las citas, revisa clientes y administra la fidelidad
              digital de The New Spark.
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/panel/citas"
            className="block rounded-2xl border border-white/15 bg-white/3 p-6 transition hover:border-white/40 hover:bg-white/6"
          >
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/45">
              Reservas
            </p>

            <h2 className="mb-3 text-2xl font-black uppercase">
              Gestión de citas
            </h2>

            <p className="text-sm leading-6 text-white/60">
              Consulta, revisa y organiza las citas recibidas desde la web.
            </p>
          </Link>

          <Link
            href="/panel/fidelidad"
            className="block rounded-2xl border border-white/15 bg-white/3 p-6 transition hover:border-white/40 hover:bg-white/6"
          >
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/45">
              Fidelidad
            </p>

            <h2 className="mb-3 text-2xl font-black uppercase">
              Clientes de fidelidad
            </h2>

            <p className="text-sm leading-6 text-white/60">
              Gestiona clientes, teléfonos, sellos acumulados y recompensas.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}