"use client";

import { type FormEvent, useState } from "react";
import { CalendarDays, Lock } from "lucide-react";
import { availableTimes, services } from "@/data/site";
import { createWhatsappLink } from "@/lib/whatsapp";

type BookedAppointment = {
  date: string;
  time: string;
};

const STORAGE_KEY = "the-new-spark-demo-citas";

function getStoredAppointments(): BookedAppointment[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedAppointments = window.localStorage.getItem(STORAGE_KEY);

  if (!storedAppointments) {
    return [];
  }

  try {
    return JSON.parse(storedAppointments) as BookedAppointment[];
  } catch {
    return [];
  }
}

export function BookingSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedAppointments, setBookedAppointments] = useState<
    BookedAppointment[]
  >(getStoredAppointments);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function isTimeBooked(time: string) {
    return bookedAppointments.some(
      (appointment) => appointment.date === date && appointment.time === time,
    );
  }

  function saveBookedAppointment(newAppointment: BookedAppointment) {
    const updatedAppointments = [...bookedAppointments, newAppointment];

    setBookedAppointments(updatedAppointments);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedAppointments),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Escribe tu nombre para continuar.");
      setSuccessMessage("");
      return;
    }

    if (!phone.trim()) {
      setError("Escribe tu número de teléfono para continuar.");
      setSuccessMessage("");
      return;
    }

    if (!selectedService) {
      setError("Selecciona un servicio.");
      setSuccessMessage("");
      return;
    }

    if (!date) {
      setError("Selecciona una fecha para la cita.");
      setSuccessMessage("");
      return;
    }

    if (!selectedTime) {
      setError("Selecciona un horario disponible.");
      setSuccessMessage("");
      return;
    }

    if (isTimeBooked(selectedTime)) {
      setError("Ese horario ya está ocupado. Selecciona otro horario.");
      setSuccessMessage("");
      return;
    }

    setError("");

    saveBookedAppointment({
      date,
      time: selectedTime,
    });

    const selectedServiceName =
      services.find((service) => service.id === selectedService)?.name ??
      "Servicio no especificado";

    const message = `Hola, quiero confirmar una cita en The New Spark.

Nombre: ${name}
Teléfono: ${phone}
Servicio: ${selectedServiceName}
Fecha: ${date}
Hora: ${selectedTime}`;

    const whatsappLink = createWhatsappLink(message);

    window.open(whatsappLink, "_blank");

    setSuccessMessage(
      `Cita demo registrada. El horario ${selectedTime} quedó ocupado para la fecha ${date}.`,
    );

    setName("");
    setPhone("");
    setSelectedService("");
    setSelectedTime("");
  }

  return (
    <section className="bg-black px-5 py-14">
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-zinc-950 p-6 md:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/40 text-amber-400">
            <CalendarDays className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm font-semibold text-amber-400">
              Reserva tu cita
            </p>

            <h2 className="font-serif text-3xl text-white">
              Rápido, fácil y por WhatsApp.
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-5">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-200">Nombre</span>
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-200">Teléfono</span>
            <input
              type="tel"
              placeholder="Tu teléfono"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-200">Servicio</span>
            <select
              value={selectedService}
              onChange={(event) => setSelectedService(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400"
            >
              <option value="">Selecciona un servicio</option>

              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-200">Fecha</span>
            <input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setSelectedTime("");
              }}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400"
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-zinc-200">Hora</span>

            <div className="flex flex-wrap gap-2">
              {availableTimes.map((slot) => {
                const isBooked = date ? isTimeBooked(slot.time) : false;
                const isSelected = selectedTime === slot.time;
                const isDisabled = !date || isBooked || !slot.available;

                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedTime(slot.time)}
                    className={
                      isBooked
                        ? "cursor-not-allowed rounded-xl border border-white/10 bg-zinc-800 px-4 py-3 text-sm text-zinc-500"
                        : isSelected
                          ? "rounded-xl border border-amber-400 bg-amber-400 px-4 py-3 text-sm font-bold text-black transition"
                          : "rounded-xl border border-amber-400/60 px-4 py-3 text-sm font-semibold text-amber-400 transition hover:bg-amber-400 hover:text-black disabled:cursor-not-allowed disabled:border-white/10 disabled:text-zinc-600 disabled:hover:bg-transparent disabled:hover:text-zinc-600"
                    }
                  >
                    {slot.time}

                    {isBooked && <span className="block text-xs">Ocupado</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="mt-3 rounded-xl bg-amber-400 px-6 py-4 text-sm font-bold text-black transition hover:bg-amber-300 md:col-span-5"
          >
            Confirmar cita
          </button>
        </form>

        {error && (
          <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        {successMessage && (
          <p className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-300">
            {successMessage}
          </p>
        )}

        {selectedTime && !error && (
          <p className="mt-5 text-center text-sm text-amber-400">
            Hora seleccionada: {selectedTime}
          </p>
        )}

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-sm text-zinc-500">
          <Lock className="h-4 w-4" />
          Tu información solo se usará para confirmar tu reserva.
        </p>

        <p className="mt-3 text-center text-xs text-zinc-600">
          Modo demo: las citas ocupadas se guardan solo en este navegador.
        </p>
      </div>
    </section>
  );
}