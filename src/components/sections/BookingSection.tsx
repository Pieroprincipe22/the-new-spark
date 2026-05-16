import {
  BookingForm,
  type BookingService,
} from "@/components/booking/BookingForm";

type BookingSectionProps = {
  services: BookingService[];
};

export function BookingSection({ services }: BookingSectionProps) {
  return (
    <BookingForm
      services={services}
      title="Reserva tu cita"
      variant="home"
    />
  );
}