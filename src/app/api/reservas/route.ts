import { NextRequest, NextResponse } from 'next/server';

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  return true;
}

function sanitizeText(value: string): string {
  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

function isValidSpanishPhone(phone: string): boolean {
  return /^(\+34\s?)?[6-9]\d{8}$/.test(phone);
}

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    const allowed = rateLimit(`reservas:${ip}`, 5, 60 * 1000);

    if (!allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.',
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    const nombre = sanitizeText(String(body.nombre || ''));
    const telefono = sanitizeText(String(body.telefono || ''));
    const servicio = sanitizeText(String(body.servicio || ''));
    const fecha = sanitizeText(String(body.fecha || ''));
    const hora = sanitizeText(String(body.hora || ''));
    const comentario = sanitizeText(String(body.comentario || ''));
    const website = sanitizeText(String(body.website || ''));

    // Campo anti-spam honeypot.
    // Si viene relleno, probablemente es un bot.
    if (website.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Solicitud bloqueada.',
        },
        { status: 400 }
      );
    }

    if (nombre.length < 2 || nombre.length > 80) {
      return NextResponse.json(
        {
          ok: false,
          message: 'El nombre no es válido.',
        },
        { status: 400 }
      );
    }

    if (!isValidSpanishPhone(telefono)) {
      return NextResponse.json(
        {
          ok: false,
          message: 'El teléfono no es válido.',
        },
        { status: 400 }
      );
    }

    if (servicio.length < 2 || servicio.length > 80) {
      return NextResponse.json(
        {
          ok: false,
          message: 'El servicio no es válido.',
        },
        { status: 400 }
      );
    }

    if (!isValidDate(fecha)) {
      return NextResponse.json(
        {
          ok: false,
          message: 'La fecha no es válida.',
        },
        { status: 400 }
      );
    }

    if (!isValidTime(hora)) {
      return NextResponse.json(
        {
          ok: false,
          message: 'La hora no es válida.',
        },
        { status: 400 }
      );
    }

    if (comentario.length > 300) {
      return NextResponse.json(
        {
          ok: false,
          message: 'El comentario es demasiado largo.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'Reserva recibida correctamente.',
        data: {
          nombre,
          telefono,
          servicio,
          fecha,
          hora,
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