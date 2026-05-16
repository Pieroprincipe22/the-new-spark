import { NextResponse } from "next/server";
import {
  createAppointment,
  getBookedTimesByDate,
} from "@/lib/admin/appointments";

type AppointmentRequestBody = Record<string, unknown>;

function getStringValue(body: AppointmentRequestBody, keys: string[]) {
  for (const key of keys) {
    const value = body[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function normalizeDate(value: string) {
  const cleanValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) {
    return cleanValue;
  }

  const spanishDateMatch = cleanValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (spanishDateMatch) {
    const [, day, month, year] = spanishDateMatch;
    return `${year}-${month}-${day}`;
  }

  return cleanValue;
}

async function readRequestBody(
  request: Request
): Promise<AppointmentRequestBody> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as AppointmentRequestBody;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  try {
    return (await request.json()) as AppointmentRequestBody;
  } catch {
    return {};
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawDate = searchParams.get("date");

    if (!rawDate) {
      return NextResponse.json(
        { error: "La fecha es obligatoria." },
        { status: 400 }
      );
    }

    const date = normalizeDate(rawDate);
    const bookedTimes = await getBookedTimesByDate(date);

    return NextResponse.json({
      date,
      bookedTimes,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los horarios ocupados." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await readRequestBody(request);

    const name = getStringValue(body, [
      "name",
      "nombre",
      "customerName",
      "clientName",
      "fullName",
    ]);

    const phone = getStringValue(body, [
      "phone",
      "telefono",
      "tel",
      "customerPhone",
      "clientPhone",
    ]);

    const service = getStringValue(body, [
      "service",
      "servicio",
      "serviceName",
      "selectedService",
    ]);

    const rawDate = getStringValue(body, [
      "date",
      "fecha",
      "selectedDate",
      "appointmentDate",
    ]);

    const time = getStringValue(body, [
      "time",
      "hora",
      "selectedTime",
      "selectedHour",
      "appointmentTime",
      "hour",
    ]);

    const date = normalizeDate(rawDate);

    const missingFields = [
      !name ? "nombre" : "",
      !phone ? "teléfono" : "",
      !service ? "servicio" : "",
      !date ? "fecha" : "",
      !time ? "hora" : "",
    ].filter(Boolean);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Faltan campos: ${missingFields.join(", ")}.`,
          receivedKeys: Object.keys(body),
        },
        { status: 400 }
      );
    }

    const appointment = await createAppointment({
      name,
      phone,
      service,
      date,
      time,
    });

    return NextResponse.json(
      {
        message: "Cita guardada correctamente.",
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo guardar la cita.";

    const status = message === "Ese horario ya está reservado." ? 409 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}