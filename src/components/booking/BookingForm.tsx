"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  BOOKING_OPENS_ON,
  getDayStartSlots,
  getOccupiedSlots,
  getSlotsNeeded,
  isDateBookable,
  isOpenDay,
} from "@/lib/schedule";

export type BookingService = {
  id?: string;
  name?: string;
  title?: string;
  price?: string | number;
  duration?: string | number;
  durationMinutes?: number;
  minutes?: number;
};

type BookingFormProps = {
  services: BookingService[];
  title?: string;
  subtitle?: string;
  variant?: "home" | "page";
  selectedService?: BookingService | null;
};

type BookingFormState = {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
};

type BookedTimesResponse = {
  date?: string;
  bookedTimes?: string[];
  error?: string;
};

type VisibleMonth = {
  year: number;
  monthIndex: number;
};

// ── Datos de la cita confirmada para el botón de WhatsApp ──────────────────
type ConfirmedBooking = {
  name: string;
  service: string;
  date: string;
  time: string;
};
// ──────────────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = "34624541595";

const WEEK_DAYS = ["L", "M", "X", "J", "V", "S", "D"];

const initialForm: BookingFormState = {
  name: "",
  phone: "",
  service: "",
  date: "",
  time: "",
};

function padNumber(value: number) {
  return value.toString().padStart(2, "0");
}

function createDateValue(year: number, monthIndex: number, day: number) {
  return `${year}-${padNumber(monthIndex + 1)}-${padNumber(day)}`;
}

function getTodayValue() {
  const date = new Date();
  return createDateValue(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatPrice(price: BookingService["price"]) {
  if (typeof price === "number") {
    return `${price.toFixed(2).replace(".", ",")} €`;
  }
  if (typeof price === "string" && price.trim()) {
    return price;
  }
  return "";
}

function formatDuration(service: BookingService) {
  if (typeof service.duration === "number") return `${service.duration} min`;
  if (typeof service.duration === "string" && service.duration.trim()) return service.duration;
  if (typeof service.durationMinutes === "number") return `${service.durationMinutes} min`;
  if (typeof service.minutes === "number") return `${service.minutes} min`;
  return "";
}

// Minutos de duración de un servicio (para saber cuántos huecos ocupa).
function getServiceDurationMinutes(service: BookingService): number {
  if (typeof service.durationMinutes === "number") return service.durationMinutes;
  if (typeof service.minutes === "number") return service.minutes;
  if (typeof service.duration === "number") return service.duration;
  if (typeof service.duration === "string") {
    const match = service.duration.match(/(\d+)/);
    if (match) return Number(match[1]);
  }
  return 30;
}

function getServiceName(service: BookingService) {
  return service.name || service.title || "Servicio";
}

function getServiceLabel(service: BookingService) {
  const name = getServiceName(service);
  const price = formatPrice(service.price);
  const duration = formatDuration(service);
  return [name, price, duration].filter(Boolean).join(" - ");
}

function getMonthLabel(year: number, monthIndex: number) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}

function getReadableDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function getCalendarDays(year: number, monthIndex: number) {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const mondayBasedFirstDay = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const blankDays = Array.from({ length: mondayBasedFirstDay }, (_, index) => ({
    type: "blank" as const,
    key: `blank-${index}`,
  }));

  const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return {
      type: "day" as const,
      key: createDateValue(year, monthIndex, day),
      day,
      dateValue: createDateValue(year, monthIndex, day),
    };
  });

  return [...blankDays, ...monthDays];
}

function getPreviousMonth(month: VisibleMonth): VisibleMonth {
  const date = new Date(month.year, month.monthIndex - 1, 1);
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}

function getNextMonth(month: VisibleMonth): VisibleMonth {
  const date = new Date(month.year, month.monthIndex + 1, 1);
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}

function getMonthKey(month: VisibleMonth) {
  return month.year * 12 + month.monthIndex;
}

function buildWhatsAppUrl(booking: ConfirmedBooking): string {
  const readableDate = getReadableDate(booking.date);
  const message = [
    `Hola, acabo de reservar una cita en The New Spark.`,
    ``,
    `Nombre: ${booking.name}`,
    `Servicio: ${booking.service}`,
    `Fecha: ${readableDate}`,
    `Hora: ${booking.time}`,
    ``,
    `Por favor, confírmame la cita. ¡Gracias!`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function BookingCalendar({
  selectedDate,
  today,
  onSelectDate,
}: {
  selectedDate: string;
  today: string;
  onSelectDate: (date: string) => void;
}) {
  const [visibleMonth, setVisibleMonth] = useState<VisibleMonth>(() => {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  });

  const todayDate = useMemo(() => {
    const [year, month, day] = today.split("-").map(Number);
    return { year, monthIndex: month - 1, day };
  }, [today]);

  const todayMonthKey = getMonthKey({
    year: todayDate.year,
    monthIndex: todayDate.monthIndex,
  });

  const visibleMonthKey = getMonthKey(visibleMonth);
  const canGoToPreviousMonth = visibleMonthKey > todayMonthKey;
  const calendarDays = getCalendarDays(visibleMonth.year, visibleMonth.monthIndex);

  return (
    <div className="rounded-xl border border-zinc-700 bg-black p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={!canGoToPreviousMonth}
          onClick={() => setVisibleMonth((current) => getPreviousMonth(current))}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-bold text-white transition hover:border-white disabled:cursor-not-allowed disabled:border-zinc-900 disabled:text-zinc-700"
          aria-label="Mes anterior"
        >
          ‹
        </button>

        <p className="text-center text-sm font-black uppercase tracking-[0.15em] text-white">
          {getMonthLabel(visibleMonth.year, visibleMonth.monthIndex)}
        </p>

        <button
          type="button"
          onClick={() => setVisibleMonth((current) => getNextMonth(current))}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-bold text-white transition hover:border-white"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-black text-zinc-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((calendarDay) => {
          if (calendarDay.type === "blank") {
            return <div key={calendarDay.key} />;
          }

          const isPast = calendarDay.dateValue < today;
          const isClosed = !isOpenDay(calendarDay.dateValue);
          const isBeforeOpening = !isDateBookable(calendarDay.dateValue);
          const isDisabled = isPast || isClosed || isBeforeOpening;
          const isSelected = selectedDate === calendarDay.dateValue;

          return (
            <button
              key={calendarDay.key}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              onClick={() => onSelectDate(calendarDay.dateValue)}
              className={[
                "aspect-square rounded-lg border text-sm font-bold transition",
                isDisabled
                  ? "cursor-not-allowed border-zinc-900 bg-zinc-950 text-zinc-700"
                  : isSelected
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 bg-black text-white hover:border-white",
              ].join(" ")}
            >
              {calendarDay.day}
            </button>
          );
        })}
      </div>

      {today < BOOKING_OPENS_ON && (
        <p className="mt-4 rounded-lg border border-white/25 bg-zinc-950 px-3 py-2 text-center text-xs font-semibold text-white">
          Reservas disponibles a partir del{" "}
          <span className="font-black">18 de julio</span>. ¡Te esperamos en la
          inauguración!
        </p>
      )}

      {selectedDate && (
        <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-center text-xs font-semibold text-zinc-300">
          Fecha seleccionada:{" "}
          <span className="text-white">{getReadableDate(selectedDate)}</span>
        </p>
      )}
    </div>
  );
}

export function BookingForm({
  services,
  title = "Reserva tu cita",
  subtitle,
  variant = "home",
  selectedService,
}: BookingFormProps) {
  const [form, setForm] = useState<BookingFormState>(initialForm);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [gdprError, setGdprError] = useState(false);
  // ── Cita confirmada para WhatsApp ────────────────────────────────────────
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);
  // ────────────────────────────────────────────────────────────────────────

  const today = useMemo(() => getTodayValue(), []);

  // Duración del servicio elegido → cuántos huecos necesita (1 o 2).
  const slotsNeeded = useMemo(() => {
    const match = services.find((service) => getServiceLabel(service) === form.service);
    const duration = match ? getServiceDurationMinutes(match) : 30;
    return getSlotsNeeded(duration);
  }, [services, form.service]);

  // Horas de inicio del día seleccionado (según el horario comercial).
  const daySlots = useMemo(
    () => (form.date ? getDayStartSlots(form.date) : []),
    [form.date]
  );

  // ── Preselección de servicio desde las tarjetas de la izquierda ──────────
// ── Preselección de servicio desde las tarjetas de la izquierda ──────────
  // Patrón "ajustar estado cuando cambia una prop" (sin useEffect):
  // https://react.dev/learn/you-might-not-need-an-effect
  const [prevSelectedService, setPrevSelectedService] = useState(selectedService);
  if (selectedService !== prevSelectedService) {
    setPrevSelectedService(selectedService);
    if (selectedService) {
      setForm((current) => ({ ...current, service: getServiceLabel(selectedService) }));
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Si la hora elegida deja de ser válida (cambia el servicio, se ocupa, etc.), se limpia.
  const timeIsStillValid = useMemo(() => {
    if (!form.time || !form.date) return true;
    const occupied = getOccupiedSlots(form.date, form.time, slotsNeeded);
    return occupied !== null && !occupied.some((slot) => bookedTimes.includes(slot));
  }, [form.time, form.date, slotsNeeded, bookedTimes]);

  if (!timeIsStillValid) {
    setForm((current) => (current.time ? { ...current, time: "" } : current));
  }

  useEffect(() => {
    if (!form.date) return;

    const controller = new AbortController();

    void fetch(`/api/appointments?date=${encodeURIComponent(form.date)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as BookedTimesResponse;
        if (!response.ok) {
          throw new Error(data.error || "No se pudieron cargar los horarios ocupados.");
        }
        return data;
      })
      .then((data) => {
        setBookedTimes(Array.isArray(data.bookedTimes) ? data.bookedTimes : []);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error(error);
        setBookedTimes([]);
        setMessage("No se pudieron cargar los horarios ocupados.");
        setMessageType("error");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingTimes(false);
        }
      });

    return () => { controller.abort(); };
  }, [form.date]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSelectDate = (date: string) => {
    setBookedTimes([]);
    setLoadingTimes(true);
    setMessage("");
    setMessageType("");
    setConfirmedBooking(null);
    setForm((current) => ({ ...current, date, time: "" }));
  };

  const handleSelectTime = (time: string) => {
    setMessage("");
    setMessageType("");
    setForm((current) => ({ ...current, time }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");
    setGdprError(false);
    setConfirmedBooking(null);

    if (!gdprAccepted) {
      setGdprError(true);
      return;
    }

    const cleanForm: BookingFormState = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      service: form.service.trim(),
      date: form.date.trim(),
      time: form.time.trim(),
    };

    if (!cleanForm.name || !cleanForm.phone || !cleanForm.service || !cleanForm.date || !cleanForm.time) {
      setMessage("Todos los campos son obligatorios.");
      setMessageType("error");
      return;
    }

    if (bookedTimes.includes(cleanForm.time)) {
      setMessage("Ese horario ya está reservado. Elige otro.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanForm.name,
          phone: cleanForm.phone,
          service: cleanForm.service,
          date: cleanForm.date,
          time: cleanForm.time,
        }),
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "No se pudo guardar la cita.");
      }

      setBookedTimes((current) =>
        current.includes(cleanForm.time) ? current : [...current, cleanForm.time]
      );

      setMessage(data.message || "Cita reservada correctamente.");
      setMessageType("success");

      // ── Guardar datos para el botón de WhatsApp ──────────────────────────
      setConfirmedBooking({
        name: cleanForm.name,
        service: cleanForm.service,
        date: cleanForm.date,
        time: cleanForm.time,
      });
      // ────────────────────────────────────────────────────────────────────

      setForm({ ...initialForm, date: cleanForm.date });
      setGdprAccepted(false);
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error ? error.message : "No se pudo guardar la cita."
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const sectionClassName =
    variant === "page"
      ? "mx-auto max-w-5xl border border-zinc-700 px-4 py-6 sm:px-6"
      : "border border-zinc-700 bg-black px-5 py-8 text-white";

  const gridClassName =
    variant === "page"
      ? "grid gap-8 lg:grid-cols-[1fr_280px]"
      : "grid gap-8 lg:grid-cols-[1fr_260px]";

  const labelColumnClassName =
    variant === "page"
      ? "grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center"
      : "grid gap-3 sm:grid-cols-[100px_1fr] sm:items-center";

  return (
    <section id="reserva" className={sectionClassName}>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-zinc-500" />
          <h1 className="text-center text-3xl font-black uppercase tracking-tight sm:text-4xl">
            {title}
          </h1>
          <div className="h-px flex-1 bg-zinc-500" />
        </div>

        {subtitle && (
          <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-6 text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className={gridClassName}>
          <div className="grid gap-8">
            <div className={labelColumnClassName}>
              <label htmlFor="booking-name" className="text-sm font-bold">
                Nombre
              </label>
              <input
                id="booking-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                className="w-full rounded border border-zinc-600 bg-black px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-white"
              />
            </div>

            <div className={labelColumnClassName}>
              <label htmlFor="booking-phone" className="text-sm font-bold">
                Teléfono
              </label>
              <input
                id="booking-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                className="w-full rounded border border-zinc-600 bg-black px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-white"
              />
            </div>

            <div className={labelColumnClassName}>
              <label htmlFor="booking-service" className="text-sm font-bold">
                Servicio
              </label>
              <select
                id="booking-service"
                name="service"
                value={form.service}
                onChange={handleChange}
                className="w-full rounded border border-zinc-600 bg-black px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-white"
              >
                <option value="">Selecciona un servicio</option>
                {services.map((service, index) => {
                  const label = getServiceLabel(service);
                  const key = service.id || `${label}-${index}`;
                  return (
                    <option key={key} value={label}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <p className="mb-3 text-sm font-bold">Fecha</p>
              <BookingCalendar
                selectedDate={form.date}
                today={today}
                onSelectDate={handleSelectDate}
              />
            </div>
          </div>

          <div className="border-zinc-600 lg:border-l lg:pl-7">
            <p className="mb-4 text-sm font-bold">Selecciona una hora</p>

            {!form.date ? (
              <p className="rounded border border-zinc-700 px-4 py-3 text-sm text-zinc-400">
                Primero selecciona una fecha.
              </p>
            ) : loadingTimes ? (
              <p className="rounded border border-zinc-700 px-4 py-3 text-sm text-zinc-400">
                Cargando horarios...
              </p>
            ) : daySlots.length === 0 ? (
              <p className="rounded border border-zinc-700 px-4 py-3 text-sm text-zinc-400">
                Este día está cerrado. Elige otra fecha.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {daySlots.map((time) => {
                  const occupied = getOccupiedSlots(form.date, time, slotsNeeded);
                  const fits = occupied !== null;
                  const isBooked = fits && occupied.some((slot) => bookedTimes.includes(slot));
                  const isUnavailable = !fits || isBooked;
                  const isSelected = form.time === time;

                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => handleSelectTime(time)}
                      className={[
                        "rounded-md border px-3 py-3 text-sm font-bold transition",
                        isBooked
                          ? "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-600 line-through"
                          : !fits
                            ? "cursor-not-allowed border-zinc-800 bg-zinc-900/50 text-zinc-700"
                            : isSelected
                              ? "border-white bg-white text-black"
                              : "border-zinc-500 bg-black text-white hover:border-white",
                      ].join(" ")}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}

            {form.date && bookedTimes.length > 0 && (
              <p className="mt-3 text-xs text-zinc-500">
                Los horarios tachados ya están reservados.
              </p>
            )}

            <div className="mt-6">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={gdprAccepted}
                  onChange={(event) => {
                    setGdprAccepted(event.target.checked);
                    if (event.target.checked) setGdprError(false);
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-white"
                />
                <span className="text-xs leading-5 text-zinc-400">
                  He leído y acepto el uso de mis datos personales, nombre y
                  teléfono, exclusivamente para gestionar mi reserva en The New
                  Spark, conforme al{" "}
                  <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 hover:text-zinc-300">Aviso de Privacidad</a>.
                </span>
              </label>

              {gdprError && (
                <p className="mt-2 text-xs font-semibold text-red-400">
                  Debes aceptar el aviso de privacidad para continuar.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-md bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              <span aria-hidden="true">▣</span>
              {submitting ? "Reservando..." : "Confirmar cita"}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={[
              "mt-8 rounded border px-4 py-4 text-center text-sm font-semibold",
              messageType === "success"
                ? "border-emerald-700 bg-emerald-950/40 text-emerald-300"
                : "border-red-700 bg-red-950/40 text-red-200",
            ].join(" ")}
          >
            {message}
          </div>
        )}

        {/* ── Botón WhatsApp tras reserva exitosa ──────────────────────────── */}
        {messageType === "success" && confirmedBooking && (
  <a href={buildWhatsAppUrl(confirmedBooking)} target="_blank" rel="noopener noreferrer" className="mt-4 flex w-full items-center justify-center gap-3 rounded-md bg-[#25D366] px-5 py-4 text-sm font-black text-white transition hover:bg-[#1ebe5d]">
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    Confirmar cita por WhatsApp
  </a>
)}
        {/* ──────────────────────────────────────────────────────────────────── */}

        <div className="mt-6 text-center text-xs text-zinc-500">
          <p>Tu información solo se usará para confirmar tu reserva.</p>
          <p className="mt-2">
            La cita se guardará en el sistema interno de The New Spark.
          </p>
        </div>
      </form>
    </section>
  );
}