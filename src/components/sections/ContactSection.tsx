import { Camera, Clock, MessageCircle } from "lucide-react";
import { siteConfig } from "@/data/site";
import { createWhatsappLink } from "@/lib/whatsapp";

export function ContactSection() {
  return (
    <section className="bg-black px-5 pb-16">
      <div className="mx-auto grid max-w-7xl gap-4 rounded-3xl border border-white/10 bg-zinc-950 p-6 md:grid-cols-3">
        <a
          href={createWhatsappLink("Hola, quiero reservar una cita.")}
          className="flex items-center gap-4 rounded-2xl p-4 transition hover:bg-white/5"
        >
          <MessageCircle className="h-9 w-9 text-amber-400" />

          <div>
            <h3 className="font-semibold text-white">WhatsApp</h3>
            <p className="text-sm text-zinc-400">{siteConfig.displayPhone}</p>
          </div>
        </a>

        <a
          href={siteConfig.instagram}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 rounded-2xl p-4 transition hover:bg-white/5"
        >
          <Camera className="h-9 w-9 text-amber-400" />

          <div>
            <h3 className="font-semibold text-white">Instagram</h3>
            <p className="text-sm text-amber-400">
              {siteConfig.instagramHandle}
            </p>
          </div>
        </a>

        <div className="flex items-center gap-4 rounded-2xl p-4">
          <Clock className="h-9 w-9 text-amber-400" />

          <div>
            <h3 className="font-semibold text-white">Horario</h3>
            <p className="text-sm text-zinc-400">
              {siteConfig.hours.weekdays}
            </p>
            <p className="text-sm text-zinc-400">
              {siteConfig.hours.saturday}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}