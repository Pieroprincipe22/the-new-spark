import {
  BookingForm,
  type BookingService,
} from "@/components/booking/BookingForm";

type BookingSectionProps = {
  services: BookingService[];
  selectedService?: BookingService | null;
};

export function BookingSection({ services, selectedService }: BookingSectionProps) {
  return (
    <BookingForm
      services={services}
      selectedService={selectedService}
      title="Reserva tu cita"
      variant="home"
    />
  );
}