import Link from "next/link";
import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black px-5 py-8 text-white">
      <div className="mx-auto flex max-w-375 flex-col gap-4 text-center text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>© 2026 {siteConfig.name}. Todos los derechos reservados.</p>

        <Link
          href="/panel"
          className="font-semibold text-zinc-500 transition hover:text-white"
        >
          Acceso privado
        </Link>
      </div>
    </footer>
  );
}