import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type Appointment = {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  createdAt: string;
};

export type CreateAppointmentInput = {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status?: AppointmentStatus;
};

type SupabaseAppointmentRow = {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
};

type SupabaseCustomerRow = {
  id: string;
};

const APPOINTMENT_SELECT = `
  id,
  customer_name,
  customer_phone,
  service_name,
  appointment_date,
  appointment_time,
  status,
  created_at
`;

function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return (
    typeof value === "string" &&
    APPOINTMENT_STATUSES.includes(value as AppointmentStatus)
  );
}

function normalizeTime(time: string) {
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time.slice(0, 5);
  }

  return time;
}

function parseServiceDetails(serviceLabel: string) {
  const priceMatch = serviceLabel.match(/(\d+(?:[,.]\d{1,2})?)\s*€/);
  const durationMatch = serviceLabel.match(/(\d+)\s*min/i);

  const servicePrice = priceMatch
    ? Number(priceMatch[1].replace(",", "."))
    : 0;

  const serviceDurationMinutes = durationMatch
    ? Number(durationMatch[1])
    : 0;

  return {
    servicePrice: Number.isFinite(servicePrice) ? servicePrice : 0,
    serviceDurationMinutes: Number.isFinite(serviceDurationMinutes)
      ? serviceDurationMinutes
      : 0,
  };
}

function toAppointment(row: SupabaseAppointmentRow): Appointment {
  return {
    id: row.id,
    name: row.customer_name,
    phone: row.customer_phone,
    service: row.service_name,
    date: row.appointment_date,
    time: normalizeTime(row.appointment_time),
    status: isAppointmentStatus(row.status) ? row.status : "pending",
    createdAt: row.created_at,
  };
}

function isUniqueSlotError(error: { code?: string; message?: string }) {
  return (
    error.code === "23505" ||
    Boolean(error.message?.toLowerCase().includes("unique"))
  );
}

async function upsertCustomer(input: CreateAppointmentInput) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("customers")
    .upsert(
      {
        full_name: input.name,
        phone: input.phone,
      },
      {
        onConflict: "phone",
      }
    )
    .select("id")
    .single<SupabaseCustomerRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

export async function getAppointments(): Promise<Appointment[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<SupabaseAppointmentRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data.map(toAppointment);
}

export async function getAdminAppointments(): Promise<Appointment[]> {
  return getAppointments();
}

export async function getBookedTimesByDate(date: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_time")
    .eq("appointment_date", date)
    .neq("status", "cancelled")
    .order("appointment_time", { ascending: true })
    .returns<Array<{ appointment_time: string }>>();

  if (error) {
    throw new Error(error.message);
  }

  return data.map((appointment) => normalizeTime(appointment.appointment_time));
}

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<Appointment> {
  const supabase = createSupabaseAdminClient();

  const status = input.status ?? "pending";
  const customerId = await upsertCustomer(input);

  const { servicePrice, serviceDurationMinutes } = parseServiceDetails(
    input.service
  );

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      customer_id: customerId,
      customer_name: input.name,
      customer_phone: input.phone,
      service_name: input.service,
      service_price: servicePrice,
      service_duration_minutes: serviceDurationMinutes,
      appointment_date: input.date,
      appointment_time: input.time,
      status,
    })
    .select(APPOINTMENT_SELECT)
    .single<SupabaseAppointmentRow>();

  if (error) {
    if (isUniqueSlotError(error)) {
      throw new Error("Ese horario ya está reservado.");
    }

    throw new Error(error.message);
  }

  return toAppointment(data);
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<Appointment> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId)
    .select(APPOINTMENT_SELECT)
    .single<SupabaseAppointmentRow>();

  if (error) {
    if (isUniqueSlotError(error)) {
      throw new Error("Ese horario ya está reservado por otra cita activa.");
    }

    throw new Error(error.message);
  }

  return toAppointment(data);
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { error, count } = await supabase
    .from("appointments")
    .delete({ count: "exact" })
    .eq("id", appointmentId);

  if (error) {
    throw new Error(error.message);
  }

  if (count === 0) {
    throw new Error("No se encontró la cita.");
  }
}