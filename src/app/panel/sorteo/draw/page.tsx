"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Winner = {
  fullName: string;
  email: string;
  instagramHandle: string | null;
};

function DrawContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const raffleId = searchParams.get("id");

  const [drawing, setDrawing] = useState(false);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!raffleId) {
      router.replace("/panel/sorteo");
    }
  }, [raffleId, router]);

  async function handleDraw() {
    if (!raffleId) return;
    setDrawing(true);
    setError("");
    try {
      const response = await fetch("/api/raffle/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raffleId }),
        credentials: "same-origin",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo realizar el sorteo.");
      setWinner(data.winner);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setDrawing(false);
    }
  }

  if (!raffleId) return null;

  return (
    <section className="w-full max-w-lg">
      <div className="mb-8 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">Panel privado · Sorteo</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">Realizar sorteo</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Esta acción es irreversible. El sistema elegirá un ganador al azar y le enviará un email automáticamente.
        </p>
      </div>

      {!winner ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8">
          {!confirmed ? (
            <>
              <p className="mb-6 text-center text-sm text-zinc-400">
                ¿Estás seguro de que quieres realizar el sorteo ahora? Una vez iniciado no se puede deshacer.
              </p>
              <div className="flex flex-col gap-3">
                <button type="button" onClick={() => setConfirmed(true)} className="w-full rounded-xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200">
                  Sí, realizar el sorteo
                </button>
                <Link href="/panel/sorteo" className="w-full rounded-xl border border-zinc-700 px-5 py-4 text-center text-sm font-semibold text-white transition hover:border-white">
                  Cancelar
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 rounded-xl border border-amber-800 bg-amber-950/30 px-4 py-4 text-center">
                <p className="text-sm font-semibold text-amber-300">⚠️ Última confirmación — esta acción no se puede deshacer</p>
              </div>
              {error && (
                <div className="mb-4 rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-300">{error}</div>
              )}
              <div className="flex flex-col gap-3">
                <button type="button" disabled={drawing} onClick={handleDraw} className="w-full rounded-xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400">
                  {drawing ? "Sorteando..." : "🎲 Confirmar y sortear"}
                </button>
                <button type="button" onClick={() => setConfirmed(false)} disabled={drawing} className="w-full rounded-xl border border-zinc-700 px-5 py-4 text-sm font-semibold text-white transition hover:border-white disabled:opacity-40">
                  Volver atrás
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-800 bg-emerald-950/20 p-8 text-center">
          <p className="text-5xl">🎉</p>
          <h2 className="mt-4 text-2xl font-black text-white">¡Sorteo realizado!</h2>
          <p className="mt-2 text-sm text-zinc-400">El ganador ha sido seleccionado y se le ha enviado un email automáticamente.</p>
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5 text-left">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Ganador</p>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Nombre</span>
                <span className="text-sm font-semibold text-white">{winner.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Email</span>
                <span className="text-sm font-semibold text-white">{winner.email}</span>
              </div>
              {winner.instagramHandle && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Instagram</span>
                  <span className="text-sm font-semibold text-white">@{winner.instagramHandle.replace("@", "")}</span>
                </div>
              )}
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">Recuerda anunciarlo también en Instagram @nthenewspark.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/sorteo" target="_blank" className="w-full rounded-xl border border-emerald-700 px-5 py-3 text-center text-sm font-semibold text-emerald-300 transition hover:border-emerald-500">
              Ver página pública del sorteo
            </Link>
            <Link href="/panel/sorteo" className="w-full rounded-xl border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-white">
              Volver al panel del sorteo
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

export default function DrawPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
      <Suspense fallback={<p className="text-sm text-white/40">Cargando...</p>}>
        <DrawContent />
      </Suspense>
    </main>
  );
}