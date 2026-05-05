import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";
import { siteConfig } from "@/data/site";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Reservar cita", href: "/reservar" },
  { label: "Contacto", href: "/contacto" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-amber-400" />

          <span className="font-serif text-xl font-semibold text-amber-400">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zinc-200 transition hover:text-amber-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="rounded-lg border border-amber-400/40 p-2 text-amber-400 md:hidden">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}