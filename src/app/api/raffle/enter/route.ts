import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getActiveRaffle, enterRaffle } from "@/lib/admin/raffle";
import { checkRateLimit } from "@/lib/rateLimit";

const enterSchema = z.object({
  fullName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre es demasiado largo."),
  email: z
    .string()
    .email("El email no es válido.")
    .max(150, "El email es demasiado largo."),
  phone: z
    .string()
    .min(9, "El teléfono debe tener al menos 9 dígitos.")
    .max(20, "El teléfono es demasiado largo.")
    .regex(/^[+]?[\d\s\-().]{9,20}$/, "El teléfono no es válido."),
  instagramHandle: z
    .string()
    .max(50, "El Instagram es demasiado largo.")
    .optional(),
  consentPrivacy: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar la política de privacidad.",
  }),
  consentNamePublic: z.boolean(),
});

export async function POST(request: NextRequest) {
  // Rate limiting — máx 3 inscripciones por IP cada hora
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const rl = checkRateLimit(ip, { limit: 3, windowMs: 60 * 60 * 1000 });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429 }
    );
  }

  try {
    // Verificar que el sorteo está abierto
    const raffle = await getActiveRaffle();

    if (!raffle) {
      return NextResponse.json(
        { error: "No hay ningún sorteo activo." },
        { status: 400 }
      );
    }

    if (raffle.status !== "open") {
      return NextResponse.json(
        { error: "Las inscripciones para este sorteo están cerradas." },
        { status: 400 }
      );
    }

    // Verificar que el periodo de inscripción no ha terminado
    if (new Date() > new Date(raffle.registrationEndsAt)) {
      return NextResponse.json(
        { error: "El plazo de inscripción ha finalizado." },
        { status: 400 }
      );
    }

    // Validar datos
    const body = await request.json();
    const parsed = enterSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join(" ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Inscribir participante
    const entry = await enterRaffle({
      raffleId: raffle.id,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      instagramHandle: parsed.data.instagramHandle,
      consentPrivacy: parsed.data.consentPrivacy,
      consentNamePublic: parsed.data.consentNamePublic,
    });

    return NextResponse.json(
      { ok: true, message: "¡Inscripción completada!", entry },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al inscribirse.";
    const status = message === "Ya estás inscrito en este sorteo." ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}