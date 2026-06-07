"use client";

import { useRouter } from "next/navigation";

export default function CerrarSesionButton() {
  const router = useRouter();

  function volverAlPanel() {
    router.push("/panel");
  }

  return (
    <button
      type="button"
      onClick={volverAlPanel}
      className="border border-white/20 rounded-xl px-8 py-4 text-xs font-black tracking-[0.35em] uppercase hover:bg-white hover:text-black transition"
    >
      Ir al acceso privado
    </button>
  );
}