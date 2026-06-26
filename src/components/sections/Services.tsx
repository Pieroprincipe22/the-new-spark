"use client";

import { Clock, Scissors } from "lucide-react";
import type { Service } from "@/data/catalog";

type ServicesProps = {
  services: Service[];
  selectedId?: string;
  onSelectService?: (service: Service) => void;
};

export function Services({ services, selectedId, onSelectService }: ServicesProps) {
  return (
    <section
      id="servicios"
      className="border border-white/70 bg-black/75 p-4 sm:p-5"
    >
      <div className="mb-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/60" />
        <h2 className="text-center text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          Nuestros servicios
        </h2>
        <div className="h-px flex-1 bg-white/60" />
      </div>

      <div className="grid gap-3">
        {services.map((service) => {
          const isSelected = selectedId === service.id;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelectService?.(service)}
              aria-pressed={isSelected}
              className={[
                "w-full rounded-md border p-4 text-left transition",
                isSelected
                  ? "border-white bg-white text-black"
                  : "border-white/60 text-white hover:bg-white hover:text-black",
              ].join(" ")}
            >
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <Scissors className="h-5 w-5 shrink-0" strokeWidth={1.6} />

                    <h3 className="text-base font-black uppercase leading-tight tracking-tight sm:text-lg">
                      {service.name}
                    </h3>
                  </div>

                  <p className="mt-2 text-sm leading-tight opacity-80">
                    {service.description}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-2xl font-black tracking-wide">
                    {service.price}
                  </p>

                  <p className="mt-1 inline-flex items-center justify-end gap-1 rounded-full border border-current px-2 py-1 text-[11px] font-black uppercase tracking-wide opacity-80">
                    <Clock className="h-3 w-3" />
                    {service.durationMinutes} min
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}