"use client";

import { useEffect, useState, } from "react";

type RaffleStatus = "draft" | "open" | "closed" | "finished";

type Raffle = {
  id: string;
  title: string;
  prizeName: string;
  prizeDescription: string;
  registrationEndsAt: string;
  winnerAnnouncedAt: string;
  status: RaffleStatus;
  requireInstagram: boolean;
};

type Winner = {
  fullName: string;
  instagramHandle: string | null;
  consentNamePublic: boolean;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/20 bg-white/5 sm:h-20 sm:w-20">
        <span className="text-2xl font-black text-white sm:text-3xl">{pad(value)}</span>
      </div>
      <span className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/40">{label}</span>
    </div>
  );
}

function Countdown({ targetDate, label }: { targetDate: string; label: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
  if (isExpired) return null;

  return (
    <div className="text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">{label}</p>
      <div className="flex items-start justify-center gap-3 sm:gap-4">
        <CountdownUnit value={timeLeft.days} label="días" />
        <span className="mt-4 text-2xl font-black text-white/30 sm:mt-5">:</span>
        <CountdownUnit value={timeLeft.hours} label="horas" />
        <span className="mt-4 text-2xl font-black text-white/30 sm:mt-5">:</span>
        <CountdownUnit value={timeLeft.minutes} label="min" />
        <span className="mt-4 text-2xl font-black text-white/30 sm:mt-5">:</span>
        <CountdownUnit value={timeLeft.seconds} label="seg" />
      </div>
    </div>
  );
}

const STEPS = [
  "Sigue nuestra cuenta de Instagram @nthenewspark",
  "Visita esta página cuando anunciemos el sorteo",
  "Rellena el formulario con tu nombre, email y teléfono",
  "¡Espera al anuncio del ganador y mucha suerte!",
];

function HowToParticipate() {
  return (
    <div className="mt-8 w-full max-w-md rounded-2xl border border-white/10 bg-white/3 p-6">
      <p className="mb-4 text-sm font-bold text-white">¿Cómo participar en el próximo sorteo?</p>
      <ol className="grid gap-3">
        {STEPS.map((step, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs font-black text-white/50">
              {index + 1}
            </span>
            <span className="text-sm leading-6 text-white/50">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RaffleForm({ raffleId }: { raffleId: string }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    instagramHandle: "",
    consentPrivacy: false,
    consentNamePublic: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/raffle/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, raffleId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo completar la inscripción.");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-8 text-center">
        <p className="text-4xl">🎉</p>
        <h3 className="mt-4 text-xl font-black text-white">¡Inscripción completada!</h3>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Ya estás participando en el sorteo. ¡Mucha suerte!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">Nombre completo</label>
          <input type="text" required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40" placeholder="Tu nombre" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40" placeholder="tu@email.com" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">Teléfono</label>
          <input type="tel" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40" placeholder="+34 600 000 000" />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">Instagram <span className="text-white/30">(recomendado)</span></label>
          <input type="text" value={form.instagramHandle} onChange={(e) => setForm((f) => ({ ...f, instagramHandle: e.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40" placeholder="@tuusuario" />
        </div>
      </div>

      <div className="grid gap-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" required checked={form.consentPrivacy} onChange={(e) => setForm((f) => ({ ...f, consentPrivacy: e.target.checked }))} className="mt-0.5 h-4 w-4 shrink-0 accent-white" />
          <span className="text-xs leading-5 text-white/50">
            He leído y acepto la{" "}
            <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2">Política de Privacidad</a>.
            Mis datos se usarán únicamente para gestionar este sorteo.{" "}
            <span className="text-white/30">(Obligatorio)</span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={form.consentNamePublic} onChange={(e) => setForm((f) => ({ ...f, consentNamePublic: e.target.checked }))} className="mt-0.5 h-4 w-4 shrink-0 accent-white" />
          <span className="text-xs leading-5 text-white/50">
            Acepto que mi nombre o usuario de Instagram sea publicado si resulto ganador.{" "}
            <span className="text-white/30">(Opcional)</span>
          </span>
        </label>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-300">{error}</div>
      )}

      <button type="submit" disabled={submitting} className="w-full rounded-xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40">
        {submitting ? "Inscribiendo..." : "Participar en el sorteo"}
      </button>

      <p className="text-center text-xs text-white/30">Solo se permite una inscripción por persona.</p>
    </form>
  );
}

export default function SorteoPage() {
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/raffle/status")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setRaffle(data.raffle ?? null);
        setWinner(data.winner ?? null);
      })
      .catch(() => {
        // silencioso
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-sm text-white/40">Cargando...</p>
      </main>
    );
  }

  if (!raffle) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.4em] text-white/30">The New Spark</p>
        <h1 className="mb-6 text-center text-4xl font-black uppercase tracking-tight sm:text-5xl">Atentos al próximo sorteo</h1>
        <HowToParticipate />
      </main>
    );
  }

  if (raffle.status === "finished") {
    const showName = winner?.consentNamePublic
      ? winner.instagramHandle
        ? `@${winner.instagramHandle.replace("@", "")}`
        : winner.fullName
      : null;

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.4em] text-white/30">The New Spark · Sorteo</p>
        <h1 className="mb-2 text-center text-4xl font-black uppercase tracking-tight sm:text-5xl">¡Tenemos ganador!</h1>
        <p className="mb-8 text-center text-sm text-white/50">{raffle.prizeName}</p>
        <div className="w-full max-w-md rounded-2xl border border-emerald-800 bg-emerald-950/20 p-8 text-center">
          <p className="text-5xl">🎉</p>
          {showName ? (
            <>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-500">Ganador</p>
              <p className="mt-2 text-3xl font-black text-white">{showName}</p>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm font-semibold text-white">El ganador ha sido contactado directamente.</p>
              <p className="mt-2 text-xs text-white/40">El ganador prefirió no mostrar su nombre públicamente.</p>
            </>
          )}
        </div>
        <HowToParticipate />
      </main>
    );
  }

  if (raffle.status === "closed") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.4em] text-white/30">The New Spark · Sorteo</p>
        <h1 className="mb-2 text-center text-4xl font-black uppercase tracking-tight sm:text-5xl">¡Pronto anunciamos al ganador!</h1>
        <p className="mb-10 text-center text-sm text-white/50">Las inscripciones han cerrado. El ganador se anunciará en:</p>
        <Countdown targetDate={raffle.winnerAnnouncedAt} label="Tiempo para el anuncio del ganador" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <section className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.4em] text-white/30">The New Spark · Sorteo</p>
          <h1 className="mb-3 text-4xl font-black uppercase tracking-tight sm:text-5xl">{raffle.title}</h1>
          <p className="text-base text-white/50">{raffle.prizeName}</p>
          {raffle.prizeDescription && <p className="mt-2 text-sm text-white/30">{raffle.prizeDescription}</p>}
        </div>

        <div className="mb-10">
          <Countdown targetDate={raffle.registrationEndsAt} label="Tiempo restante para inscribirse" />
        </div>

        {raffle.requireInstagram && (
          <div className="mb-8 rounded-xl border border-white/10 bg-white/3 px-5 py-4 text-center">
            <p className="text-sm text-white/50">
              Para participar debes seguir{" "}
              <a href="https://www.instagram.com/nthenewspark" target="_blank" rel="noopener noreferrer" className="font-bold text-white underline underline-offset-2">@nthenewspark</a>
              {" "}en Instagram.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/3 p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-black uppercase tracking-tight text-white">Inscríbete al sorteo</h2>
          <RaffleForm raffleId={raffle.id} />
        </div>
      </section>
    </main>
  );
}