import type { ReactNode } from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DeleteAppointmentForm } from "@/components/admin/DeleteAppointmentForm";
import {
  deleteAppointment,
  getAdminAppointments,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/admin/appointments";
import { logoutAdmin, requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

type PanelCitasPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

const statusLabels: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

const statusClasses: Record<AppointmentStatus, string> = {
  pending: "border-amber-800 bg-amber-950/40 text-amber-300",
  confirmed: "border-emerald-800 bg-emerald-950/40 text-emerald-300",
  cancelled: "border-red-800 bg-red-950/40 text-red-300",
};

async function updateStatusAction(formData: FormData) {
  "use server";

  await requireAdmin();

  const appointmentId = formData.get("appointmentId");
  const status = formData.get("status");

  if (typeof appointmentId !== "string" || !appointmentId.trim()) {
    throw new Error("El ID de la cita es obligatorio.");
  }

  if (
    status !== "pending" &&
    status !== "confirmed" &&
    status !== "cancelled"
  ) {
    throw new Error("El estado de la cita no es válido.");
  }

  await updateAppointmentStatus(appointmentId, status);

  revalidatePath("/panel/citas");
  revalidatePath("/panel/inicio");
  revalidatePath("/reservar");
  revalidatePath("/");
}

async function deleteAppointmentAction(formData: FormData) {
  "use server";

  await requireAdmin();

  const appointmentId = formData.get("appointmentId");

  if (typeof appointmentId !== "string" || !appointmentId.trim()) {
    throw new Error("El ID de la cita es obligatorio.");
  }

  await deleteAppointment(appointmentId);

  revalidatePath("/panel/citas");
  revalidatePath("/panel/inicio");
  revalidatePath("/reservar");
  revalidatePath("/");
}

async function logoutAction() {
  "use server";
  await logoutAdmin();
  redirect("/login");
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function filterAppointments(appointments: Appointment[], query: string) {
  const cleanQuery = normalizeSearchText(query);
  const cleanPhoneQuery = normalizePhone(query);

  if (!cleanQuery) {
    return appointments;
  }

  return appointments.filter((appointment) => {
    const name = normalizeSearchText(appointment.name);
    const phone = normalizePhone(appointment.phone);
    const service = normalizeSearchText(appointment.service);
    const date = normalizeSearchText(appointment.date);
    const status = normalizeSearchText(statusLabels[appointment.status]);

    const matchesText =
      name.includes(cleanQuery) ||
      service.includes(cleanQuery) ||
      date.includes(cleanQuery) ||
      status.includes(cleanQuery);

    const matchesPhone =
      Boolean(cleanPhoneQuery) && phone.includes(cleanPhoneQuery);

    return matchesText || matchesPhone;
  });
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return date;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function StatusButton({
  appointmentId,
  status,
  children,
  variant,
}: {
  appointmentId: string;
  status: AppointmentStatus;
  children: ReactNode;
  variant: "confirm" | "cancel" | "restore";
}) {
  const variantClasses = {
    confirm: "border-emerald-800 bg-emerald-950/30 text-emerald-300 hover:border-emerald-500",
    cancel: "border-red-800 bg-red-950/30 text-red-300 hover:border-red-500",
    restore: "border-amber-800 bg-amber-950/30 text-amber-300 hover:border-amber-500",
  };

  return (
    <form action={updateStatusAction}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={[
          "rounded-full border px-4 py-2 text-xs font-semibold transition",
          variantClasses[variant],
        ].join(" ")}
      >
        {children}
      </button>
    </form>
  );
}

function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-full border border-red-800 bg-red-950/20 px-5 py-3 text-sm font-semibold text-red-300 transition hover:border-red-500"
      >
        Cerrar sesión
      </button>
    </form>
  );
}

function AppointmentActions({ appointment }: { appointment: Appointment }) {
  const appointmentDateTime = `${formatDate(appointment.date)} · ${appointment.time}`;

  return (
    <div className="flex flex-wrap gap-3">
      {appointment.status === "pending" && (
        <>
          <StatusButton appointmentId={appointment.id} status="confirmed" variant="confirm">
            Confirmar
          </StatusButton>
          <StatusButton appointmentId={appointment.id} status="cancelled" variant="cancel">
            Cancelar
          </StatusButton>
        </>
      )}

      {appointment.status === "confirmed" && (
        <StatusButton appointmentId={appointment.id} status="cancelled" variant="cancel">
          Cancelar cita
        </StatusButton>
      )}

      {appointment.status === "cancelled" && (
        <StatusButton appointmentId={appointment.id} status="pending" variant="restore">
          Restaurar a pendiente
        </StatusButton>
      )}

      <DeleteAppointmentForm
        appointmentId={appointment.id}
        appointmentName={appointment.name}
        appointmentDateTime={appointmentDateTime}
        deleteAction={deleteAppointmentAction}
      />
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <article className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              {appointment.name}
            </h2>
            <span className={["rounded-full border px-3 py-1 text-xs font-semibold", statusClasses[appointment.status]].join(" ")}>
              {statusLabels[appointment.status]}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            Creada el {formatCreatedAt(appointment.createdAt)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-left lg:text-right">
          <p className="text-sm text-zinc-500">Fecha y hora</p>
          <p className="mt-1 font-semibold text-white">
            {formatDate(appointment.date)} · {appointment.time}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Servicio</p>
          <p className="mt-2 text-sm font-medium text-white">{appointment.service}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Teléfono</p>
          <p className="mt-2 text-sm font-medium text-white">{appointment.phone}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">ID cita</p>
          <p className="mt-2 break-all text-sm font-medium text-white">{appointment.id}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-zinc-800 pt-5">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500">Acciones</p>
        <AppointmentActions appointment={appointment} />
      </div>
    </article>
  );
}

function SearchBox({
  query,
  totalAppointments,
  filteredAppointments,
}: {
  query: string;
  totalAppointments: number;
  filteredAppointments: number;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
      <form
        action="/panel/citas"
        method="get"
        className="grid gap-4 lg:grid-cols-[1fr_auto_auto]"
      >
        <div>
          <label htmlFor="panel-search" className="mb-2 block text-sm font-semibold text-white">
            Buscar cita
          </label>
          <input
            id="panel-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Buscar por nombre, teléfono, servicio, fecha o estado..."
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
          />
        </div>

        <button
          type="submit"
          className="self-end rounded-xl bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:bg-zinc-200"
        >
          Buscar
        </button>

        {query && (
          <Link
            href="/panel/citas"
            className="self-end rounded-xl border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-white"
          >
            Limpiar
          </Link>
        )}
      </form>

      <p className="mt-4 text-sm text-zinc-400">
        Mostrando{" "}
        <span className="font-semibold text-white">{filteredAppointments}</span>{" "}
        de <span className="font-semibold text-white">{totalAppointments}</span>{" "}
        citas.
      </p>
    </div>
  );
}

export default async function PanelCitasPage({ searchParams }: PanelCitasPageProps) {
  await requireAdmin();

  const params = searchParams ? await searchParams : {};
  const query = typeof params.q === "string" ? params.q.trim() : "";

  const appointments = await getAdminAppointments();
  const filteredAppointments = filterAppointments(appointments, query);

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">
              Panel privado
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Citas reservadas
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Consulta, confirma, cancela, elimina o busca citas recibidas desde
              el formulario de reserva de The New Spark.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/reservar" className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-white">
              Ver formulario de reserva
            </Link>
            <Link href="/panel/inicio" className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-white">
              Volver al panel
            </Link>
            <LogoutButton />
          </div>
        </div>

        <SearchBox
          query={query}
          totalAppointments={appointments.length}
          filteredAppointments={filteredAppointments.length}
        />

        {appointments.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8">
            <h2 className="text-xl font-semibold text-white">Todavía no hay citas</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Cuando un cliente reserve desde la página de reservas, aparecerá aquí automáticamente.
            </p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8">
            <h2 className="text-xl font-semibold text-white">No se encontraron citas</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              No hay resultados para la búsqueda{" "}
              <span className="font-semibold text-white">&quot;{query}&quot;</span>.
              Prueba con otro nombre, teléfono, servicio o estado.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}