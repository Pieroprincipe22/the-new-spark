import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

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

type RawAppointment = Partial<Omit<Appointment, "status">> & {
  status?: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const APPOINTMENTS_FILE = path.join(DATA_DIR, "appointments.json");

function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return (
    typeof value === "string" &&
    APPOINTMENT_STATUSES.includes(value as AppointmentStatus)
  );
}

function normalizeAppointment(
  appointment: RawAppointment,
  index: number
): Appointment {
  const fallbackId = `${appointment.date ?? "fecha"}-${
    appointment.time ?? "hora"
  }-${index}`;

  return {
    id:
      typeof appointment.id === "string" && appointment.id.trim()
        ? appointment.id
        : fallbackId,
    name: typeof appointment.name === "string" ? appointment.name : "",
    phone: typeof appointment.phone === "string" ? appointment.phone : "",
    service: typeof appointment.service === "string" ? appointment.service : "",
    date: typeof appointment.date === "string" ? appointment.date : "",
    time: typeof appointment.time === "string" ? appointment.time : "",
    status: isAppointmentStatus(appointment.status)
      ? appointment.status
      : "pending",
    createdAt:
      typeof appointment.createdAt === "string"
        ? appointment.createdAt
        : new Date().toISOString(),
  };
}

async function ensureAppointmentsFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(APPOINTMENTS_FILE);
  } catch {
    await fs.writeFile(APPOINTMENTS_FILE, "[]", "utf8");
  }
}

async function writeAppointments(appointments: Appointment[]) {
  await ensureAppointmentsFile();

  await fs.writeFile(
    APPOINTMENTS_FILE,
    JSON.stringify(appointments, null, 2),
    "utf8"
  );
}

export async function getAppointments(): Promise<Appointment[]> {
  await ensureAppointmentsFile();

  const fileContent = await fs.readFile(APPOINTMENTS_FILE, "utf8");

  if (!fileContent.trim()) {
    return [];
  }

  const parsed = JSON.parse(fileContent) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map((appointment, index) =>
    normalizeAppointment(appointment as RawAppointment, index)
  );
}

export async function getAdminAppointments(): Promise<Appointment[]> {
  const appointments = await getAppointments();

  return appointments.sort((a, b) => {
    const firstDate = `${a.date} ${a.time}`;
    const secondDate = `${b.date} ${b.time}`;

    return secondDate.localeCompare(firstDate);
  });
}

export async function getBookedTimesByDate(date: string): Promise<string[]> {
  const appointments = await getAppointments();

  return appointments
    .filter(
      (appointment) =>
        appointment.date === date && appointment.status !== "cancelled"
    )
    .map((appointment) => appointment.time);
}

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<Appointment> {
  const appointments = await getAppointments();

  const alreadyBooked = appointments.some(
    (appointment) =>
      appointment.date === input.date &&
      appointment.time === input.time &&
      appointment.status !== "cancelled"
  );

  if (alreadyBooked) {
    throw new Error("Ese horario ya está reservado.");
  }

  const appointment: Appointment = {
    id: randomUUID(),
    name: input.name,
    phone: input.phone,
    service: input.service,
    date: input.date,
    time: input.time,
    status: input.status ?? "pending",
    createdAt: new Date().toISOString(),
  };

  appointments.push(appointment);

  await writeAppointments(appointments);

  return appointment;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<Appointment> {
  const appointments = await getAppointments();

  const appointmentIndex = appointments.findIndex(
    (appointment) => appointment.id === appointmentId
  );

  if (appointmentIndex === -1) {
    throw new Error("No se encontró la cita.");
  }

  const updatedAppointment: Appointment = {
    ...appointments[appointmentIndex],
    status,
  };

  appointments[appointmentIndex] = updatedAppointment;

  await writeAppointments(appointments);

  return updatedAppointment;
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  const appointments = await getAppointments();

  const appointmentExists = appointments.some(
    (appointment) => appointment.id === appointmentId
  );

  if (!appointmentExists) {
    throw new Error("No se encontró la cita.");
  }

  const remainingAppointments = appointments.filter(
    (appointment) => appointment.id !== appointmentId
  );

  await writeAppointments(remainingAppointments);
}