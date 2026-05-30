"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccesoPrivadoPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch("/api/admin/logout", {
      method: "POST",
    }).catch(() => {});
  }, []);

  async function iniciarSesion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setEnviando(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message || "No se pudo iniciar sesión.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Ha ocurrido un error al conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 flex items-center justify-center">
      <section className="w-full max-w-md border border-white/15 rounded-2xl p-8 bg-zinc-950/80">
        <p className="text-xs tracking-[0.45em] text-zinc-500 uppercase mb-4">
          Acceso privado
        </p>

        <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">
          Iniciar sesión
        </h1>

        <p className="text-zinc-400 mb-8">
          Accede al panel interno de The New Spark.
        </p>

        <form onSubmit={iniciarSesion} className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Usuario
            </label>

            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full bg-black border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-white"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-white"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full border border-white/20 rounded-xl py-4 text-sm font-black tracking-[0.25em] uppercase hover:bg-white hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? "Accediendo..." : "Entrar al panel"}
          </button>
        </form>
      </section>
    </main>
  );
}