import { BookingForm } from "@/components/booking/BookingForm";
import { getServices } from "@/lib/catalog";

export const revalidate = 60;

export default async function ReservarPage() {
  const services = await getServices();

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
      <BookingForm
        services={services}
        title="Reserva tu cita"
        subtitle="Elige el servicio, la fecha y la hora disponible. Los horarios ya reservados aparecerán bloqueados automáticamente."
        variant="page"
      />
    </main>
  );
}