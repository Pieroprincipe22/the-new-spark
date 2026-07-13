"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BOOKING_OPENS_ON } from "@/lib/schedule";

// Momento exacto de la apertura: las 00:00 (hora local) del día de inauguración.
function getOpeningTimestamp(): number {
  const [year, month, day] = BOOKING_OPENS_ON.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0).getTime();
}

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft | null {
  const diff = getOpeningTimestamp() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function InaugurationCountdown() {
  // Empieza en null y solo se calcula en el cliente (dentro de callbacks),
  // evitando desajustes de hidratación: el reloj del servidor y el del
  // navegador nunca coinciden.
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft());

    // Primer cálculo inmediato (en un callback, ya en el navegador).
    const frame = requestAnimationFrame(tick);
    const interval = setInterval(tick, 1000);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
    };
  }, []);

  // Antes del primer cálculo no se pinta nada; cuando llegue el día 18,
  // tampoco: el componente desaparece solo, sin tocar código.
  if (!timeLeft) return null;

  const units: Array<{ label: string; value: number }> = [
    { label: "Días", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Seg", value: timeLeft.seconds },
  ];

  return (
    <div className="mt-8 max-w-sm">
      <p className="text-xs font-black uppercase tracking-[0.34em] text-white/55">
        Inauguración · 18 de julio
      </p>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="rounded-lg border border-white/25 bg-black/60 px-2 py-3 text-center backdrop-blur-sm"
          >
            <p className="text-2xl font-black tabular-nums text-white sm:text-3xl">
              {pad(unit.value)}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/55">
              {unit.label}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/#reserva"
        className="mt-4 inline-block border-b border-white pb-1 text-sm font-bold uppercase tracking-wide text-white transition hover:text-zinc-300"
      >
        Reserva ya tu cita para la primera semana →
      </Link>
    </div>
  );
}