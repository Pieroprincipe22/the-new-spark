import Link from "next/link";
import { siteConfig } from "@/data/site";

const footerLinks = [
  {
    label: "Inicio",
    href: "/",
  },
  {
    label: "Promoción",
    href: "/promociones",
  },
  {
    label: "Privacidad",
    href: "/privacidad",
  },
  {
    label: "Acceso privado",
    href: "/panel",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-900 bg-black px-5 py-8 text-white">
      <div className="mx-auto flex max-w-375 flex-col gap-5 text-center text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>
          © {currentYear} {siteConfig.name}. Todos los derechos reservados.
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-end">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-semibold text-zinc-500 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}