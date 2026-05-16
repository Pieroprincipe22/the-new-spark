"use client";

import { useFormStatus } from "react-dom";

type DeleteAppointmentFormProps = {
  appointmentId: string;
  appointmentName: string;
  appointmentDateTime: string;
  deleteAction: (formData: FormData) => Promise<void>;
};

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-red-800 bg-red-950/20 px-4 py-2 text-xs font-semibold text-red-300 transition hover:border-red-500 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-600"
      title="Eliminar esta cita definitivamente"
    >
      {pending ? "Eliminando..." : "Eliminar cita"}
    </button>
  );
}

export function DeleteAppointmentForm({
  appointmentId,
  appointmentName,
  appointmentDateTime,
  deleteAction,
}: DeleteAppointmentFormProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar esta cita?\n\nCliente: ${appointmentName}\nFecha: ${appointmentDateTime}\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) {
      event.preventDefault();
    }
  };

  return (
    <form action={deleteAction} onSubmit={handleSubmit}>
      <input type="hidden" name="appointmentId" value={appointmentId} />

      <DeleteSubmitButton />
    </form>
  );
}