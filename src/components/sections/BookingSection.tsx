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
  const [bookedAppointments, setBookedAppointments] =
    useState<BookedAppointment[]>(getStoredAppointments);
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
      `Cita registrada. El horario ${selectedTime} quedó ocupado para la fecha ${date}.`,
    );

    setName("");
    setPhone("");
    setSelectedService("");
    setSelectedTime("");
  }

  return (
    <section
      id="reserva"
      className="border border-white/70 bg-black/75 p-4 sm:p-5"
    >
      <div className="mb-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/60" />
        <h2 className="text-center text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          Reserva tu cita
        </h2>
        <div className="h-px flex-1 bg-white/60" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[0.47fr_1px_0.53fr]"
      >
        <div className="grid gap-3">
          <label className="grid gap-2 text-sm font-semibold text-white sm:grid-cols-[82px_1fr] sm:items-center">
            Nombre
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-sm border border-white/35 bg-black px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-white"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-white sm:grid-cols-[82px_1fr] sm:items-center">
            Teléfono
            <input
              type="tel"
              placeholder="Tu teléfono"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="rounded-sm border border-white/35 bg-black px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-white"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-white sm:grid-cols-[82px_1fr] sm:items-center">
            Servicio
            <select
              value={selectedService}
              onChange={(event) => setSelectedService(event.target.value)}
              className="rounded-sm border border-white/35 bg-black px-4 py-3 text-white outline-none focus:border-white"
            >
              <option value="">Selecciona un servicio</option>

              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-white sm:grid-cols-[82px_1fr] sm:items-center">
            Fecha
            <input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setSelectedTime("");
              }}
              className="rounded-sm border border-white/35 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </label>
        </div>

        <div className="hidden bg-white/70 lg:block" />

        <div>
          <p className="mb-3 text-sm font-semibold text-white">
            Selecciona una hora
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                      ? "cursor-not-allowed rounded-md border border-white/15 bg-zinc-900 px-3 py-3 text-sm font-semibold text-white/35"
                      : isSelected
                        ? "rounded-md border border-white bg-white px-3 py-3 text-sm font-black text-black"
                        : "rounded-md border border-white/45 px-3 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/15 disabled:text-white/30 disabled:hover:bg-transparent disabled:hover:text-white/30"
                  }
                >
                  {slot.time}

                  {isBooked && <span className="block text-xs">Ocupado</span>}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-6 py-3 font-black text-black transition hover:bg-white/85"
          >
            <CalendarDays className="h-5 w-5" />
            Confirmar cita
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-5 rounded-md border border-red-400/50 bg-red-950/35 px-4 py-3 text-center text-sm text-red-200">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="mt-5 rounded-md border border-emerald-400/50 bg-emerald-950/35 px-4 py-3 text-center text-sm text-emerald-200">
          {successMessage}
        </p>
      )}

      {selectedTime && !error && (
        <p className="mt-5 text-center text-sm font-semibold text-white">
          Hora seleccionada: {selectedTime}
        </p>
      )}

      <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-white/45">
        <Lock className="h-4 w-4" />
        Tu información solo se usará para confirmar tu reserva.
      </p>

      <p className="mt-2 text-center text-xs text-white/35">
        Modo demo: las citas ocupadas se guardan solo en este navegador.
      </p>
    </section>
  );
}