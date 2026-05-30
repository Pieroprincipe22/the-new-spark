import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  verificarSesionAdmin,
} from "@/lib/admin-auth";
import CerrarSesionButton from "./CerrarSesionButton";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sesion = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verificarSesionAdmin(sesion)) {
    redirect("/acceso-privado");
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <section className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 border-b border-white/10 pb-8">
          <div>
            <p className="text-xs tracking-[0.45em] text-zinc-500 uppercase mb-4">
              Panel privado
            </p>

            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight">
              Administración
            </h1>

            <p className="text-zinc-400 mt-4 max-w-3xl">
              Gestiona las citas, revisa reservas y administra el contenido
              interno de The New Spark.
            </p>
          </div>

          <CerrarSesionButton />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <Link
            href="/admin/citas"
            className="border border-white/15 rounded-2xl p-8 bg-zinc-950/60 hover:border-white/40 transition"
          >
            <p className="text-xs tracking-[0.45em] text-zinc-500 uppercase mb-5">
              Reservas
            </p>

            <h2 className="text-2xl md:text-3xl font-black uppercase">
              Gestión de citas
            </h2>

            <p className="text-zinc-400 mt-4">
              Consulta, revisa y organiza las citas recibidas desde la web.
            </p>
          </Link>

          <Link
            href="/admin/fidelidad"
            className="border border-white/15 rounded-2xl p-8 bg-zinc-950/60 hover:border-white/40 transition"
          >
            <p className="text-xs tracking-[0.45em] text-zinc-500 uppercase mb-5">
              Fidelidad
            </p>

            <h2 className="text-2xl md:text-3xl font-black uppercase">
              Clientes de fidelidad
            </h2>

            <p className="text-zinc-400 mt-4">
              Gestiona clientes, teléfonos, sellos acumulados y recompensas.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}