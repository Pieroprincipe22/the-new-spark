import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Aviso de Privacidad | The New Spark",
  description:
    "Aviso de privacidad de The New Spark para la gestión de reservas, citas y datos de contacto.",
};

const privacySections = [
  {
    title: "Responsable del tratamiento",
    content:
      "The New Spark es responsable del tratamiento de los datos personales facilitados a través de esta web para la gestión de reservas, citas y comunicaciones relacionadas con los servicios de barbería.",
  },
  {
    title: "Datos personales tratados",
    content:
      "Los datos que se pueden tratar son el nombre, número de teléfono, servicio seleccionado, fecha y hora de la cita, así como cualquier información necesaria para gestionar correctamente la reserva.",
  },
  {
    title: "Finalidad del tratamiento",
    content:
      "Los datos personales se utilizan para gestionar solicitudes de reserva, confirmar citas, contactar con el cliente en relación con su cita, organizar la agenda interna y mantener un historial operativo de reservas.",
  },
  {
    title: "Legitimación",
    content:
      "El tratamiento de los datos se basa en la solicitud realizada por el cliente al reservar una cita y en la aceptación del aviso de privacidad antes de enviar el formulario.",
  },
  {
    title: "Conservación de los datos",
    content:
      "Los datos se conservarán durante el tiempo necesario para gestionar la cita, atender posibles consultas relacionadas con el servicio y mantener la organización interna de reservas.",
  },
  {
    title: "Comunicación de datos",
    content:
      "The New Spark no vende ni cede los datos personales de sus clientes a terceros. Los datos solo podrán comunicarse cuando exista una obligación legal o cuando sea necesario para el correcto funcionamiento técnico del servicio.",
  },
  {
    title: "Derechos del cliente",
    content:
      "El cliente puede solicitar el acceso, rectificación, actualización o eliminación de sus datos personales contactando directamente con The New Spark a través de los medios oficiales de contacto.",
  },
  {
    title: "Seguridad",
    content:
      "The New Spark aplica medidas de seguridad orientadas a proteger la información de reservas y evitar accesos no autorizados al sistema interno de gestión.",
  },
];

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-black px-6 pb-16 pt-32 text-white">
      <section className="mx-auto max-w-4xl">
        <div className="border-b border-white/15 pb-10">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-white/45">
            The New Spark
          </p>

          <h1 className="text-4xl font-black uppercase tracking-tight md:text-6xl">
            Aviso de Privacidad
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-white/65">
            Este aviso explica cómo The New Spark trata los datos personales
            enviados a través del formulario de reserva y de los canales de
            contacto oficiales.
          </p>
        </div>

        <div className="mt-10 grid gap-5">
          {privacySections.map((section) => (
            <article
              key={section.title}
              className="rounded-3xl border border-white/10 bg-white/3 p-6"
            >
              <h2 className="text-xl font-black uppercase tracking-tight">
                {section.title}
              </h2>

              <p className="mt-4 leading-7 text-white/65">
                {section.content}
              </p>
            </article>
          ))}
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/3 p-6">
          <h2 className="text-xl font-black uppercase tracking-tight">
            Contacto
          </h2>

          <p className="mt-4 leading-7 text-white/65">
            Para cualquier consulta relacionada con la privacidad o el
            tratamiento de datos personales, el cliente puede contactar con The
            New Spark por WhatsApp en el número{" "}
            <span className="font-bold text-white">
              {siteConfig.displayPhone}
            </span>
            .
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-white/80"
            >
              Contactar por WhatsApp
            </a>

            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              Instagram
            </a>
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/#reserva"
            className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-white/80"
          >
            Volver a reservas
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white hover:text-black"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}