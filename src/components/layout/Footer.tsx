import { Sparkles } from "lucide-react";
import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-5 py-8 text-center">
      <div className="mb-3 flex items-center justify-center gap-2 text-amber-400">
        <Sparkles className="h-5 w-5" />
        <span className="font-serif text-xl">{siteConfig.name}</span>
      </div>

      <p className="text-sm text-zinc-500">
        © 2026 {siteConfig.name}. Todos los derechos reservados.
      </p>
    </footer>
  );
}