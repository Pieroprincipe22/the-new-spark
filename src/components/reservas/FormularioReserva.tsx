'use client';

import { useState } from 'react';

type EstadoFormulario = 'idle' | 'loading' | 'success' | 'error';

export default function FormularioReserva() {
  const [estado, setEstado] = useState<EstadoFormulario>('idle');
  const [mensaje, setMensaje] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setEstado('loading');
    setMensaje('');

    const formData = new FormData(event.currentTarget);

    const reserva = {
      nombre: String(formData.get('nombre') || ''),
      telefono: String(formData.get('telefono') || ''),
      servicio: String(formData.get('servicio') || ''),
      fecha: String(formData.get('fecha') || ''),
      hora: String(formData.get('hora') || ''),
      comentario: String(formData.get('comentario') || ''),
      website: String(formData.get('website') || ''), // Campo anti-spam
    };

    try {
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reserva),
      });

      const data = await response.json();

      if (!response.ok) {
        setEstado('error');
        setMensaje(data.message || 'No se pudo enviar la reserva.');
        return;
      }

      setEstado('success');
      setMensaje(data.message || 'Reserva enviada correctamente.');

      event.currentTarget.reset();
    } catch {
      setEstado('error');
      setMensaje('Ha ocurrido un error. Inténtalo de nuevo.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="nombre"
          className="mb-2 block text-sm font-medium text-white"
        >
          Nombre
        </label>

        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          minLength={2}
          maxLength={80}
          placeholder="Tu nombre"
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none transition focus:border-white/40"
        />
      </div>

      <div>
        <label
          htmlFor="telefono"
          className="mb-2 block text-sm font-medium text-white"
        >
          Teléfono
        </label>

        <input
          id="telefono"
          name="telefono"
          type="tel"
          required
          placeholder="612345678"
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none transition focus:border-white/40"
        />
      </div>

      <div>
        <label
          htmlFor="servicio"
          className="mb-2 block text-sm font-medium text-white"
        >
          Servicio
        </label>

        <select
          id="servicio"
          name="servicio"
          required
          defaultValue=""
          className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/40"
        >
          <option value="" disabled>
            Selecciona un servicio
          </option>
          <option value="Corte clásico">Corte clásico</option>
          <option value="Corte + barba">Corte + barba</option>
          <option value="Arreglo de barba">Arreglo de barba</option>
          <option value="Degradado">Degradado</option>
        </select>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="fecha"
            className="mb-2 block text-sm font-medium text-white"
          >
            Fecha
          </label>

          <input
            id="fecha"
            name="fecha"
            type="date"
            required
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-white/40"
          />
        </div>

        <div>
          <label
            htmlFor="hora"
            className="mb-2 block text-sm font-medium text-white"
          >
            Hora
          </label>

          <input
            id="hora"
            name="hora"
            type="time"
            required
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-white/40"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="comentario"
          className="mb-2 block text-sm font-medium text-white"
        >
          Comentario opcional
        </label>

        <textarea
          id="comentario"
          name="comentario"
          maxLength={300}
          placeholder="Ejemplo: quiero un degradado bajo..."
          className="min-h-28 w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none transition focus:border-white/40"
        />
      </div>

      {/* 
        Campo anti-spam tipo honeypot.

        Los usuarios reales no ven este campo.
        Muchos bots sí lo rellenan automáticamente.
        Si llega con contenido, el backend bloquea la reserva.
      */}
      <div
  aria-hidden="true"
  style={{
    position: 'absolute',
    left: '-9999px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  }}
>
  <label htmlFor="website">Tu sitio web</label>

  <input
    id="website"
    name="website"
    type="text"
    tabIndex={-1}
    autoComplete="off"
  />
</div>

      <button
        type="submit"
        disabled={estado === 'loading'}
        className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {estado === 'loading' ? 'Enviando...' : 'Reservar cita'}
      </button>

      {mensaje && (
        <p
          className={
            estado === 'success'
              ? 'text-sm font-medium text-green-400'
              : 'text-sm font-medium text-red-400'
          }
        >
          {mensaje}
        </p>
      )}
    </form>
  );
}