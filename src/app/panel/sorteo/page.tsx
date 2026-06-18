import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getAllRaffles,
  getRaffleEntries,
  updateRaffleStatus,
  createRaffle,
  type RaffleConfig,
} from "@/lib/admin/raffle";

export const dynamic = "force-dynamic";

async function createRaffleAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const prizeName = String(formData.get("prizeName") || "").trim();
  const prizeDescription = String(formData.get("prizeDescription") || "").trim();
  const registrationEndsAt = String(formData.get("registrationEndsAt") || "").trim();
  const winnerAnnouncedAt = String(formData.get("winnerAnnouncedAt") || "").trim();
  const requireInstagram = formData.get("requireInstagram") === "on";

  if (!title || !prizeName || !registrationEndsAt || !winnerAnnouncedAt) {
    redirect("/panel/sorteo?error=campos");
  }

  await createRaffle({
    title,
    prizeName,
    prizeDescription,
    registrationEndsAt: new Date(registrationEndsAt).toISOString(),
    winnerAnnouncedAt: new Date(winnerAnnouncedAt).toISOString(),
    requireInstagram,
  });

  revalidatePath("/panel/sorteo");
  redirect("/panel/sorteo");
}

async function changeStatusAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const raffleId = String(formData.get("raffleId") || "").trim();
  const status = String(formData.get("status") || "").trim();

  if (!raffleId || !status) return;

  await updateRaffleStatus(raffleId, status as RaffleConfig["status"]);

  revalidatePath("/panel/sorteo");
  revalidatePath("/sorteo");
  redirect("/panel/sorteo");
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

const statusLabels: Record<RaffleConfig["status"], string> = {
  draft: "Borrador",
  open: "Abierto",
  closed: "Cerrado",
  finished: "Finalizado",
};

const statusColors: Record<RaffleConfig["status"], string> = {
  draft: "border-zinc-700 bg-zinc-900 text-zinc-400",
  open: "border-emerald-700 bg-emerald-950/40 text-emerald-300",
  closed: "border-amber-700 bg-amber-950/40 text-amber-300",
  finished: "border-blue-700 bg-blue-950/40 text-blue-300",
};

function StatusButton({
  raffleId,
  status,
  label,
  variant,
}: {
  raffleId: string;
  status: RaffleConfig["status"];
  label: string;
  variant: "emerald" | "amber" | "blue" | "zinc";
}) {
  const colors = {
    emerald: "border-emerald-800 bg-emerald-950/30 text-emerald-300 hover:border-emerald-500",
    amber: "border-amber-800 bg-amber-950/30 text-amber-300 hover:border-amber-500",
    blue: "border-blue-800 bg-blue-950/30 text-blue-300 hover:border-blue-500",
    zinc: "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500",
  };

  return (
    <form action={changeStatusAction}>
      <input type="hidden" name="raffleId" value={raffleId} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${colors[variant]}`}>
        {label}
      </button>
    </form>
  );
}

export default async function PanelSorteoPage() {
  await requireAdmin();

  const raffles = await getAllRaffles();
  const activeRaffle = raffles.find((r) => ["open", "closed"].includes(r.status));
  const entries = activeRaffle ? await getRaffleEntries(activeRaffle.id) : [];

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">

        {/* Cabecera */}
        <div className="flex flex-col gap-5 border-b border-zinc-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">Panel privado</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Sorteo</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Crea y gestiona el sorteo. Activa las inscripciones, ciérralas y realiza el sorteo cuando estés listo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/sorteo" target="_blank" className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-white">
              Ver página pública
            </Link>
            <Link href="/panel/inicio" className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-white">
              Volver al panel
            </Link>
          </div>
        </div>

        {/* Sorteo activo */}
        {activeRaffle && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">{activeRaffle.title}</h2>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[activeRaffle.status]}`}>
                    {statusLabels[activeRaffle.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-400">{activeRaffle.prizeName}</p>
              </div>
              <div className="shrink-0 rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-center">
                <p className="text-xs text-zinc-500">Participantes</p>
                <p className="mt-1 text-3xl font-black text-white">{entries.length}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <p className="text-xs uppercase tracking-widest text-zinc-500">Cierre inscripciones</p>
                <p className="mt-1 text-sm font-semibold text-white">{formatDate(activeRaffle.registrationEndsAt)}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <p className="text-xs uppercase tracking-widest text-zinc-500">Anuncio del ganador</p>
                <p className="mt-1 text-sm font-semibold text-white">{formatDate(activeRaffle.winnerAnnouncedAt)}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 border-t border-zinc-800 pt-5">
              {activeRaffle.status === "open" && (
                <StatusButton raffleId={activeRaffle.id} status="closed" label="Cerrar inscripciones" variant="amber" />
              )}
              {activeRaffle.status === "closed" && (
                <>
                  <Link
                    href={`/panel/sorteo/draw?id=${activeRaffle.id}`}
                    className="rounded-full border border-blue-800 bg-blue-950/30 px-4 py-2 text-xs font-semibold text-blue-300 transition hover:border-blue-500"
                  >
                    🎲 Realizar sorteo
                  </Link>
                  <StatusButton raffleId={activeRaffle.id} status="open" label="Reabrir inscripciones" variant="emerald" />
                </>
              )}
            </div>

            {/* Lista de participantes */}
            {entries.length > 0 && (
              <div className="mt-6 border-t border-zinc-800 pt-6">
                <p className="mb-4 text-sm font-semibold text-white">Participantes ({entries.length})</p>
                <div className="grid gap-2 max-h-96 overflow-y-auto">
                  {entries.map((entry, index) => (
                    <div key={entry.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-black px-4 py-3">
                      <span className="text-xs text-zinc-600">#{index + 1}</span>
                      <span className="text-sm font-semibold text-white">{entry.fullName}</span>
                      <span className="text-xs text-zinc-400">{entry.email}</span>
                      <span className="text-xs text-zinc-400">{entry.phone}</span>
                      {entry.instagramHandle && (
                        <span className="text-xs text-zinc-500">@{entry.instagramHandle.replace("@", "")}</span>
                      )}
                      {entry.consentNamePublic && (
                        <span className="rounded-full border border-emerald-800 bg-emerald-950/30 px-2 py-0.5 text-xs text-emerald-400">Acepta publicar nombre</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Crear nuevo sorteo */}
        {!activeRaffle && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="mb-6 text-lg font-bold text-white">Crear nuevo sorteo</h2>
            <form action={createRaffleAction} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Título del sorteo</label>
                  <input name="title" type="text" required className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-white" placeholder="Sorteo de zapatillas" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Premio</label>
                  <input name="prizeName" type="text" required className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-white" placeholder="Nike Air Max 90" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Descripción del premio (opcional)</label>
                <input name="prizeDescription" type="text" className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-white" placeholder="Talla 42, color negro" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Cierre de inscripciones</label>
                  <input name="registrationEndsAt" type="datetime-local" required className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-white" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Anuncio del ganador</label>
                  <input name="winnerAnnouncedAt" type="datetime-local" required className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-white" />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input name="requireInstagram" type="checkbox" defaultChecked className="h-4 w-4 accent-white" />
                <span className="text-sm text-zinc-400">Requerir seguir @nthenewspark en Instagram</span>
              </label>

              <button type="submit" className="w-full rounded-xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200">
                Crear sorteo
              </button>
            </form>
          </div>
        )}

        {/* Historial de sorteos */}
        {raffles.filter((r) => r.status === "finished").length > 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Historial de sorteos</h2>
            <div className="grid gap-3">
              {raffles
                .filter((r) => r.status === "finished")
                .map((raffle) => (
                  <div key={raffle.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-black px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{raffle.title}</p>
                      <p className="text-xs text-zinc-500">{raffle.prizeName}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[raffle.status]}`}>
                      {statusLabels[raffle.status]}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

      </section>
    </main>
  );
}