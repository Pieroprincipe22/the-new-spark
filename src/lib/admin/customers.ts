import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const LOYALTY_EVENT_TYPES = [
  "added",
  "removed",
  "redeemed",
  "adjustment",
] as const;

export type LoyaltyEventType = (typeof LOYALTY_EVENT_TYPES)[number];

export type AdminCustomer = {
  id: string;
  fullName: string;
  phone: string;
  loyaltyStamps: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  appointmentsCount: number;
  lastAppointmentDate: string | null;
};

export type AdminCustomerAppointment = {
  id: string;
  serviceName: string;
  servicePrice: number;
  serviceDurationMinutes: number;
  appointmentDate: string;
  appointmentTime: string;
  status: "pending" | "confirmed" | "cancelled";
  notes: string | null;
  createdAt: string;
};

export type AdminLoyaltyEvent = {
  id: string;
  customerId: string;
  appointmentId: string | null;
  type: LoyaltyEventType;
  stamps: number;
  reason: string | null;
  createdAt: string;
};

export type AdminCustomerDetails = AdminCustomer & {
  appointments: AdminCustomerAppointment[];
  loyaltyEvents: AdminLoyaltyEvent[];
};

type CustomerRow = {
  id: string;
  full_name: string;
  phone: string;
  loyalty_stamps: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerAppointmentRow = {
  id: string;
  customer_id: string | null;
  service_name: string;
  service_price: number | string;
  service_duration_minutes: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  created_at: string;
};

type LoyaltyEventRow = {
  id: string;
  customer_id: string;
  appointment_id: string | null;
  type: string;
  stamps: number;
  reason: string | null;
  created_at: string;
};

function normalizeTime(time: string) {
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time.slice(0, 5);
  }

  return time;
}

function normalizePrice(value: number | string) {
  if (typeof value === "number") {
    return value;
  }

  const parsedValue = Number.parseFloat(value);

  if (Number.isNaN(parsedValue)) {
    return 0;
  }

  return parsedValue;
}

function isAppointmentStatus(
  value: string
): value is AdminCustomerAppointment["status"] {
  return value === "pending" || value === "confirmed" || value === "cancelled";
}

function isLoyaltyEventType(value: string): value is LoyaltyEventType {
  return LOYALTY_EVENT_TYPES.includes(value as LoyaltyEventType);
}

function toCustomer(
  row: CustomerRow,
  appointmentsByCustomerId: Map<
    string,
    {
      count: number;
      lastAppointmentDate: string | null;
    }
  >
): AdminCustomer {
  const appointmentSummary = appointmentsByCustomerId.get(row.id);

  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    loyaltyStamps: row.loyalty_stamps,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    appointmentsCount: appointmentSummary?.count ?? 0,
    lastAppointmentDate: appointmentSummary?.lastAppointmentDate ?? null,
  };
}

function toCustomerAppointment(
  row: CustomerAppointmentRow
): AdminCustomerAppointment {
  return {
    id: row.id,
    serviceName: row.service_name,
    servicePrice: normalizePrice(row.service_price),
    serviceDurationMinutes: row.service_duration_minutes,
    appointmentDate: row.appointment_date,
    appointmentTime: normalizeTime(row.appointment_time),
    status: isAppointmentStatus(row.status) ? row.status : "pending",
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function toLoyaltyEvent(row: LoyaltyEventRow): AdminLoyaltyEvent {
  return {
    id: row.id,
    customerId: row.customer_id,
    appointmentId: row.appointment_id,
    type: isLoyaltyEventType(row.type) ? row.type : "adjustment",
    stamps: row.stamps,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

function getAppointmentSummaryByCustomerId(
  appointments: CustomerAppointmentRow[]
) {
  const summary = new Map<
    string,
    {
      count: number;
      lastAppointmentDate: string | null;
    }
  >();

  for (const appointment of appointments) {
    if (!appointment.customer_id) {
      continue;
    }

    const current = summary.get(appointment.customer_id);

    if (!current) {
      summary.set(appointment.customer_id, {
        count: 1,
        lastAppointmentDate: appointment.appointment_date,
      });

      continue;
    }

    const latestDate =
      !current.lastAppointmentDate ||
      appointment.appointment_date > current.lastAppointmentDate
        ? appointment.appointment_date
        : current.lastAppointmentDate;

    summary.set(appointment.customer_id, {
      count: current.count + 1,
      lastAppointmentDate: latestDate,
    });
  }

  return summary;
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const supabase = createSupabaseAdminClient();

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id, full_name, phone, loyalty_stamps, notes, created_at, updated_at")
    .order("created_at", { ascending: false })
    .returns<CustomerRow[]>();

  if (customersError) {
    throw new Error(customersError.message);
  }

  if (!customers.length) {
    return [];
  }

  const customerIds = customers.map((customer) => customer.id);

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select(
      "id, customer_id, service_name, service_price, service_duration_minutes, appointment_date, appointment_time, status, notes, created_at"
    )
    .in("customer_id", customerIds)
    .returns<CustomerAppointmentRow[]>();

  if (appointmentsError) {
    throw new Error(appointmentsError.message);
  }

  const appointmentSummaryByCustomerId =
    getAppointmentSummaryByCustomerId(appointments);

  return customers.map((customer) =>
    toCustomer(customer, appointmentSummaryByCustomerId)
  );
}

export async function getAdminCustomerById(
  customerId: string
): Promise<AdminCustomerDetails> {
  const supabase = createSupabaseAdminClient();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, full_name, phone, loyalty_stamps, notes, created_at, updated_at")
    .eq("id", customerId)
    .single<CustomerRow>();

  if (customerError) {
    throw new Error(customerError.message);
  }

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select(
      "id, customer_id, service_name, service_price, service_duration_minutes, appointment_date, appointment_time, status, notes, created_at"
    )
    .eq("customer_id", customerId)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false })
    .returns<CustomerAppointmentRow[]>();

  if (appointmentsError) {
    throw new Error(appointmentsError.message);
  }

  const { data: loyaltyEvents, error: loyaltyEventsError } = await supabase
    .from("loyalty_events")
    .select("id, customer_id, appointment_id, type, stamps, reason, created_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .returns<LoyaltyEventRow[]>();

  if (loyaltyEventsError) {
    throw new Error(loyaltyEventsError.message);
  }

  const appointmentSummaryByCustomerId =
    getAppointmentSummaryByCustomerId(appointments);

  return {
    ...toCustomer(customer, appointmentSummaryByCustomerId),
    appointments: appointments.map(toCustomerAppointment),
    loyaltyEvents: loyaltyEvents.map(toLoyaltyEvent),
  };
}

export async function updateCustomerNotes(
  customerId: string,
  notes: string
): Promise<AdminCustomer> {
  const supabase = createSupabaseAdminClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .update({
      notes: notes.trim() || null,
    })
    .eq("id", customerId)
    .select("id, full_name, phone, loyalty_stamps, notes, created_at, updated_at")
    .single<CustomerRow>();

  if (error) {
    throw new Error(error.message);
  }

  return toCustomer(customer, new Map());
}

async function adjustCustomerLoyaltyStamps({
  customerId,
  stamps,
  type,
  reason,
  appointmentId = null,
}: {
  customerId: string;
  stamps: number;
  type: LoyaltyEventType;
  reason?: string;
  appointmentId?: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  const cleanStamps = Math.trunc(Math.abs(stamps));

  if (cleanStamps <= 0) {
    throw new Error("El número de sellos debe ser mayor que cero.");
  }

  const { data: currentCustomer, error: currentCustomerError } = await supabase
    .from("customers")
    .select("id, loyalty_stamps")
    .eq("id", customerId)
    .single<Pick<CustomerRow, "id" | "loyalty_stamps">>();

  if (currentCustomerError) {
    throw new Error(currentCustomerError.message);
  }

  const shouldSubtract = type === "removed" || type === "redeemed";

  const nextStamps = shouldSubtract
    ? currentCustomer.loyalty_stamps - cleanStamps
    : currentCustomer.loyalty_stamps + cleanStamps;

  if (nextStamps < 0) {
    throw new Error("El cliente no tiene suficientes sellos.");
  }

  const { data: updatedCustomer, error: updateError } = await supabase
    .from("customers")
    .update({
      loyalty_stamps: nextStamps,
    })
    .eq("id", customerId)
    .select("id, full_name, phone, loyalty_stamps, notes, created_at, updated_at")
    .single<CustomerRow>();

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: eventError } = await supabase.from("loyalty_events").insert({
    customer_id: customerId,
    appointment_id: appointmentId,
    type,
    stamps: shouldSubtract ? -cleanStamps : cleanStamps,
    reason: reason?.trim() || null,
  });

  if (eventError) {
    throw new Error(eventError.message);
  }

  return toCustomer(updatedCustomer, new Map());
}

export async function addCustomerLoyaltyStamps({
  customerId,
  stamps,
  reason,
  appointmentId,
}: {
  customerId: string;
  stamps: number;
  reason?: string;
  appointmentId?: string | null;
}) {
  return adjustCustomerLoyaltyStamps({
    customerId,
    stamps,
    type: "added",
    reason,
    appointmentId,
  });
}

export async function removeCustomerLoyaltyStamps({
  customerId,
  stamps,
  reason,
}: {
  customerId: string;
  stamps: number;
  reason?: string;
}) {
  return adjustCustomerLoyaltyStamps({
    customerId,
    stamps,
    type: "removed",
    reason,
  });
}

export async function redeemCustomerLoyaltyReward({
  customerId,
  stamps = 10,
  reason = "Canje de recompensa de fidelidad",
}: {
  customerId: string;
  stamps?: number;
  reason?: string;
}) {
  return adjustCustomerLoyaltyStamps({
    customerId,
    stamps,
    type: "redeemed",
    reason,
  });
}