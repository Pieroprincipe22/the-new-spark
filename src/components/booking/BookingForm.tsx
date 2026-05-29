"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

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

const AVAILABLE_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00",
];

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
          const isSelected = selectedDate === calendarDay.dateValue;

          return (
            <button
              key={calendarDay.key}
              type="button"
              disabled={isPast}
              aria-pressed={isSelected}
              onClick={() => onSelectDate(calendarDay.dateValue)}
              className={[
                "aspect-square rounded-lg border text-sm font-bold transition",
                isPast
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
}: BookingFormProps) {
  const [form, setForm] = useState<BookingFormState>(initialForm);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [gdprError, setGdprError] = useState(false);

  const today = useMemo(() => getTodayValue(), []);

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

    return () => {
      controller.abort();
    };
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

      setMessage("Cita reservada correctamente.");
      setMessageType("success");
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
    <section id="reservar" className={sectionClassName}>
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
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {AVAILABLE_TIMES.map((time) => {
                  const isBooked = bookedTimes.includes(time);
                  const isSelected = form.time === time;

                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={isBooked}
                      onClick={() => handleSelectTime(time)}
                      className={[
                        "rounded-md border px-3 py-3 text-sm font-bold transition",
                        isBooked
                          ? "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-600 line-through"
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
                  onChange={(e) => {
                    setGdprAccepted(e.target.checked);
                    if (e.target.checked) setGdprError(false);
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-white"
                />
                <span className="text-xs leading-5 text-zinc-400">
                  He leído y acepto el uso de mis datos personales (nombre y
                  teléfono) exclusivamente para gestionar mi reserva en The New
                  Spark, conforme al{" "}
                  <a
                   href="/privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline underline-offset-2 hover:text-zinc-300">
                  
                    Aviso de Privacidad
                    </a>             .
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

        <div className="mt-6 text-center text-xs text-zinc-500">
          <p>🔒 Tu información solo se usará para confirmar tu reserva.</p>
          <p className="mt-2">
            La cita se guardará en el sistema interno de The New Spark.
          </p>
        </div>
      </form>
    </section>
  );
}