import { Camera, Clock, MessageCircle } from "lucide-react";
import { siteConfig } from "@/data/site";
import { createWhatsappLink } from "@/lib/whatsapp";

export function ContactSection() {
  return (
    <section id="contacto" className="mx-auto max-w-7xl px-5 pb-8 lg:px-8">
      <div className="grid gap-6 border border-white/70 px-6 py-5 md:grid-cols-3 md:divide-x md:divide-white/60">
        <a
          href={createWhatsappLink("Hola, quiero reservar una cita.")}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-5 transition hover:opacity-75 md:pr-8"
        >
          <MessageCircle
            className="h-14 w-14 shrink-0 text-white"
            strokeWidth={1.8}
          />

          <div>
            <h3 className="text-lg font-black uppercase tracking-widest text-white">
              WhatsApp
            </h3>
            <p className="text-white/85">{siteConfig.displayPhone}</p>
            <p className="text-white/75">Escríbenos y agenda tu cita</p>
          </div>
        </a>

        <a
          href={siteConfig.instagram}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-5 transition hover:opacity-75 md:px-8"
        >
          <Camera
            className="h-14 w-14 shrink-0 text-white"
            strokeWidth={1.8}
          />

          <div>
            <h3 className="text-lg font-black uppercase tracking-widest text-white">
              Instagram
            </h3>
            <p className="text-white/85">{siteConfig.instagramHandle}</p>
            <p className="text-white/75">Síguenos para ver más estilos</p>
          </div>
        </a>

        <div className="flex items-center gap-5 md:pl-8">
          <Clock
            className="h-14 w-14 shrink-0 text-white"
            strokeWidth={1.8}
          />

          <div>
            <h3 className="text-lg font-black uppercase tracking-widest text-white">
              Horario
            </h3>
            <p className="text-white/85">{siteConfig.hours.weekdays}</p>
            <p className="text-white/85">{siteConfig.hours.saturday}</p>
            <p className="text-white/85">{siteConfig.hours.sunday}</p>
          </div>
        </div>
      </div>
    </section>
  );
}