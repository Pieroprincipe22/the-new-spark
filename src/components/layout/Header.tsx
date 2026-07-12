"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/data/site";

const navItems = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Productos", href: "/#productos" },
  { label: "Promoción", href: "/promociones" },
  { label: "Sorteo", href: "/sorteo" },
  { label: "Reservas", href: "/#reserva" },
  { label: "Contacto", href: "/#contacto" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Bloquear el scroll del body mientras el menú está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-transparent">
      <div className="flex w-full items-start justify-between px-6 py-5 sm:px-8 lg:px-10 xl:px-12">
        <Link
          href="/#inicio"
          aria-label={siteConfig.name}
          className="inline-flex items-center"
          onClick={() => setIsOpen(false)}
        >
          <Image
            src="/images/logo-the-new-spark.png"
            alt="Logo The New Spark"
            width={320}
            height={140}
            priority
            className="h-20 w-auto object-contain sm:h-24 lg:h-28"
          />
        </Link>

        <nav className="mt-3 hidden items-center gap-9 md:flex">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                index === 0
                  ? "border-b border-white pb-2 text-sm font-semibold text-white"
                  : "border-b border-transparent pb-2 text-sm font-semibold text-white/85 transition hover:border-white hover:text-white"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={
            isOpen
              ? `Cerrar menú de ${siteConfig.name}`
              : `Abrir menú de ${siteConfig.name}`
          }
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          className="relative z-50 mt-2 rounded-sm border border-white/55 p-2 text-white transition hover:border-white md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menú móvil */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-2xl font-semibold uppercase tracking-wide text-white/90 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;