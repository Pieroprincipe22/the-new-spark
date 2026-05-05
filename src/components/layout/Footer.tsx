import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-5 py-6 text-center">
      <p className="text-xs uppercase tracking-[0.24em] text-white/45">
        © 2026 {siteConfig.name}. Todos los derechos reservados.
      </p>
    </footer>
  );
}