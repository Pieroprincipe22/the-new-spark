"use client";

import { useState } from "react";
import type { Service } from "@/data/catalog";
import { Services } from "@/components/sections/Services";
import { BookingSection } from "@/components/sections/BookingSection";

type BookingExperienceProps = {
  services: Service[];
};

export function BookingExperience({ services }: BookingExperienceProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleSelectService = (service: Service) => {
    // nuevo objeto en cada clic para forzar la sincronización del formulario
    setSelectedService({ ...service });
  };

  return (
    <section className="relative z-10 mx-auto -mt-24 grid max-w-375 gap-5 px-5 pb-4 xl:grid-cols-[0.42fr_0.58fr] lg:px-8">
      <Services
        services={services}
        selectedId={selectedService?.id}
        onSelectService={handleSelectService}
      />
      <BookingSection services={services} selectedService={selectedService} />
    </section>
  );
}