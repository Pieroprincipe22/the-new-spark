"use client";

import { useRouter } from "next/navigation";

export default function CerrarSesionButton() {
  const router = useRouter();

  async function cerrarSesion() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.replace("/acceso-privado");
    router.refresh();
  }

  return (
    <button
      onClick={cerrarSesion}
      className="border border-white/20 rounded-xl px-8 py-4 text-xs font-black tracking-[0.35em] uppercase hover:bg-white hover:text-black transition"
    >
      Cerrar sesión
    </button>
  );
}