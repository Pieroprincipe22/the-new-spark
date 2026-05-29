import { NextResponse } from "next/server";
import {
  createAppointment,
  getBookedTimesByDate,
} from "@/lib/admin/appointments";
import { checkRateLimit, LIMITS } from "@/lib/rateLimit";
import {
  createAppointmentSchema,
  getAvailabilitySchema,
  formatZodErrors,
} from "@/lib/validation";

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

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function GET(request: Request) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, LIMITS.getAvailability);

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera un momento." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }
  // ──────────────────────────────────────────────────────────────────────────

  try {
    const { searchParams } = new URL(request.url);
    const rawDate = searchParams.get("date");

    // ── Validación con Zod ─────────────────────────────────────────────────
    const parsed = getAvailabilitySchema.safeParse({
      date: rawDate ? normalizeDate(rawDate) : rawDate,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }
    // ────────────────────────────────────────────────────────────────────────

    const bookedTimes = await getBookedTimesByDate(parsed.data.date);

    return NextResponse.json({
      date: parsed.data.date,
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
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, LIMITS.createAppointment);

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Has hecho demasiadas reservas seguidas. Espera unos minutos." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }
  // ──────────────────────────────────────────────────────────────────────────

  try {
    const body = await readRequestBody(request);

    // ── Extraer campos (compatible con los keys que envía BookingForm) ───────
    const rawInput = {
      name: getStringValue(body, [
        "name", "nombre", "customerName", "clientName", "fullName",
      ]),
      phone: getStringValue(body, [
        "phone", "telefono", "tel", "customerPhone", "clientPhone",
      ]),
      service: getStringValue(body, [
        "service", "servicio", "serviceName", "selectedService",
      ]),
      date: normalizeDate(
        getStringValue(body, [
          "date", "fecha", "selectedDate", "appointmentDate",
        ])
      ),
      time: getStringValue(body, [
        "time", "hora", "selectedTime", "selectedHour",
        "appointmentTime", "hour",
      ]),
    };

    // ── Validación con Zod ───────────────────────────────────────────────────
    const parsed = createAppointmentSchema.safeParse(rawInput);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }
    // ────────────────────────────────────────────────────────────────────────

    const appointment = await createAppointment(parsed.data);

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