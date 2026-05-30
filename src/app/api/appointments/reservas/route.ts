import { NextRequest, NextResponse } from 'next/server';
import { reservaSchema } from '@/lib/validaciones/reserva';
import { sanitizeReservaInput } from '@/lib/seguridad/sanitize';
import { rateLimit } from '@/lib/seguridad/rate-limit';

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    const limit = rateLimit({
      key: `reservas:${ip}`,
      limit: 5,
      windowMs: 60 * 1000,
    });

    if (!limit.success) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.',
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const sanitizedBody = sanitizeReservaInput(body);

    const parsed = reservaSchema.safeParse(sanitizedBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Los datos enviados no son válidos.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const reserva = parsed.data;

    // Aquí más adelante guardaremos en base de datos.
    // De momento, respondemos correctamente.
    return NextResponse.json(
      {
        ok: true,
        message: 'Reserva recibida correctamente.',
        data: {
          nombre: reserva.nombre,
          telefono: reserva.telefono,
          servicio: reserva.servicio,
          fecha: reserva.fecha,
          hora: reserva.hora,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: 'No se pudo procesar la reserva.',
      },
      { status: 500 }
    );
  }
}