import Image from "next/image";
import { MessageCircle, PackageCheck } from "lucide-react";
import type { Product } from "@/data/catalog";
import { createWhatsappLink } from "@/lib/whatsapp";

type ProductsSectionProps = {
  products: Product[];
};

export function ProductsSection({ products }: ProductsSectionProps) {
  return (
    <section id="productos" className="mx-auto max-w-7xl px-5 pb-4 lg:px-8">
      <div className="border border-white/70 bg-black/75 p-4 sm:p-5">
        <div className="mb-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/60" />
          <h2 className="text-center text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            Productos
          </h2>
          <div className="h-px flex-1 bg-white/60" />
        </div>

        <p className="mx-auto mb-6 max-w-2xl text-center text-sm leading-relaxed text-white/70">
          Productos profesionales para el cuidado masculino, peinado, barba y acabado diario.
            Consulta en tienda cuál se adapta mejor a tu estilo y tipo de cabello.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const whatsappMessage = `Hola, quiero consultar este producto de The New Spark.

Producto: ${product.name}`;

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-md border border-white/60 transition hover:bg-white hover:text-black"
              >
                <div className="relative flex aspect-4/3 items-center justify-center border-b border-white/30 bg-white/5">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.imageAlt ?? product.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center opacity-70">
                      <PackageCheck className="h-14 w-14" strokeWidth={1.4} />
                      <span className="text-xs font-black uppercase tracking-[0.22em]">
                        Foto pendiente
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-black uppercase tracking-tight">
                      {product.name}
                    </h3>

                    <span className="shrink-0 rounded-full border border-current px-3 py-1 text-xs font-black uppercase tracking-wide">
                      {product.available ? "Disponible" : "Agotado"}
                    </span>
                  </div>

                  <p className="min-h-12 text-sm leading-tight opacity-80">
                    {product.description}
                  </p>

                  <div className="my-4 h-px w-24 bg-current opacity-45" />

                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-black tracking-wide">
                      {product.price}
                    </p>

                    <a
                      href={createWhatsappLink(whatsappMessage)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-current px-4 py-2 text-sm font-black transition hover:opacity-75"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Consultar
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}