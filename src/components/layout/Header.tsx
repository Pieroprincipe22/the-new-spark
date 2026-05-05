import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { siteConfig } from "@/data/site";

const navItems = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Reservar cita", href: "/#reserva" },
  { label: "Contacto", href: "/#contacto" },
];

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-transparent">
      <div className="flex w-full items-start justify-between px-6 py-5 sm:px-8 lg:px-10 xl:px-12">
        <Link
          href="/#inicio"
          aria-label={siteConfig.name}
          className="inline-flex items-center"
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
          aria-label={`Abrir menú de ${siteConfig.name}`}
          className="mt-2 rounded-sm border border-white/55 p-2 text-white md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}