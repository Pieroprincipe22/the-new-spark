'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState('Nick');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMensaje('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, password }),
    });

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      setMensaje(data.message || 'No se pudo iniciar sesión.');
      return;
    }

    router.push('/panel');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/15 bg-white/5 p-8"
      >
        <h1 className="mb-2 text-3xl font-bold">Acceso privado</h1>

        <p className="mb-8 text-sm text-white/60">
          Panel de administración de The New Spark.
        </p>

        <div className="mb-5">
          <label htmlFor="usuario" className="mb-2 block text-sm font-medium">
            Usuario
          </label>

          <input
            id="usuario"
            type="text"
            value={usuario}
            onChange={(event) => setUsuario(event.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none focus:border-white/40"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Contraseña
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none focus:border-white/40"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        {mensaje && (
          <p className="mt-4 text-sm font-medium text-red-400">{mensaje}</p>
        )}
      </form>
    </main>
  );
}