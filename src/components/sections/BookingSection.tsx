"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type CatalogService = {
  id?: string;
  name?: string;
  title?: string;
  price?: string | number;
  duration?: string | number;
  durationMinutes?: number;
  minutes?: number;
};

type BookingSectionProps = {
  services: CatalogService[];
};

type BookingForm = {
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

const AVAILABLE_TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

const initialForm: BookingForm = {
  name: "",
  phone: "",
  service: "",
  date: "",
  time: "",
};

function formatPrice(price: CatalogService["price"]) {
  if (typeof price === "number") {
    return `${price.toFixed(2).replace(".", ",")} €`;
  }

  if (typeof price === "string" && price.trim()) {
    return price;
  }

  return "";
}

function formatDuration(service: CatalogService) {
  if (typeof service.duration === "number") {
    return `${service.duration} min`;
  }

  if (typeof service.duration === "string" && service.duration.trim()) {
    return service.duration;
  }

  if (typeof service.durationMinutes === "number") {
    return `${service.durationMinutes} min`;
  }

  if (typeof service.minutes === "number") {
    return `${service.minutes} min`;
  }

  return "";
}

function getServiceName(service: CatalogService) {
  return service.name || service.title || "Servicio";
}

function getServiceLabel(service: CatalogService) {
  const name = getServiceName(service);
  const price = formatPrice(service.price);
  const duration = formatDuration(service);

  return [name, price, duration].filter(Boolean).join(" - ");
}

export function BookingSection({ services }: BookingSectionProps) {
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const today = useMemo(() => {
    const date = new Date();
    return date.toLocaleDateString("en-CA");
  }, []);

  useEffect(() => {
    if (!form.date) {
      return;
    }

    const controller = new AbortController();

    void fetch(`/api/appointments?date=${encodeURIComponent(form.date)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as BookedTimesResponse;

        if (!response.ok) {
          throw new Error(
            data.error || "No se pudieron cargar los horarios ocupados."
          );
        }

        return data;
      })
      .then((data) => {
        setBookedTimes(Array.isArray(data.bookedTimes) ? data.bookedTimes : []);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

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

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    if (name === "date") {
      setBookedTimes([]);
      setLoadingTimes(Boolean(value));
      setMessage("");
      setMessageType("");

      setForm((current) => ({
        ...current,
        date: value,
        time: "",
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSelectTime = (time: string) => {
    setMessage("");
    setMessageType("");

    setForm((current) => ({
      ...current,
      time,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const cleanForm: BookingForm = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      service: form.service.trim(),
      date: form.date.trim(),
      time: form.time.trim(),
    };

    if (
      !cleanForm.name ||
      !cleanForm.phone ||
      !cleanForm.service ||
      !cleanForm.date ||
      !cleanForm.time
    ) {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanForm.name,
          phone: cleanForm.phone,
          service: cleanForm.service,
          date: cleanForm.date,
          time: cleanForm.time,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "No se pudo guardar la cita.");
      }

      setBookedTimes((current) =>
        current.includes(cleanForm.time)
          ? current
          : [...current, cleanForm.time]
      );

      setMessage("Cita reservada correctamente.");
      setMessageType("success");

      setForm({
        ...initialForm,
        date: cleanForm.date,
      });
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la cita."
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="reservar"
      className="border border-zinc-700 bg-black px-5 py-8 text-white"
    >
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-500" />

        <h2 className="text-center text-3xl font-black uppercase tracking-tight">
          Reserva tu cita
        </h2>

        <div className="h-px flex-1 bg-zinc-500" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
          <div className="grid gap-8">
            <div className="grid gap-3 sm:grid-cols-[100px_1fr] sm:items-center">
              <label htmlFor="home-booking-name" className="text-sm font-bold">
                Nombre
              </label>

              <input
                id="home-booking-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded border border-zinc-600 bg-black px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-white"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-[100px_1fr] sm:items-center">
              <label htmlFor="home-booking-phone" className="text-sm font-bold">
                Teléfono
              </label>

              <input
                id="home-booking-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded border border-zinc-600 bg-black px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-white"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-[100px_1fr] sm:items-center">
              <label
                htmlFor="home-booking-service"
                className="text-sm font-bold"
              >
                Servicio
              </label>

              <select
                id="home-booking-service"
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

            <div className="grid gap-3 sm:grid-cols-[100px_1fr] sm:items-center">
              <label htmlFor="home-booking-date" className="text-sm font-bold">
                Fecha
              </label>

              <input
                id="home-booking-date"
                name="date"
                type="date"
                min={today}
                value={form.date}
                onChange={handleChange}
                className="w-full rounded border border-zinc-600 bg-black px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-white"
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

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-md bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
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