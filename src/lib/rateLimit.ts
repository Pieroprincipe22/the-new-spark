// src/lib/rateLimit.ts
// Rate limiting en memoria — funciona en Vercel Edge/Node sin dependencias externas.
// Cada entrada guarda cuántas peticiones ha hecho una IP en la ventana de tiempo.

type RateLimitEntry = {
  count: number;
  resetAt: number; // timestamp en ms cuando se reinicia el contador
};

const store = new Map<string, RateLimitEntry>();

type RateLimitOptions = {
  // Máximo de peticiones permitidas en la ventana
  limit: number;
  // Duración de la ventana en milisegundos
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(
  ip: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  // Si no existe entrada o la ventana ya expiró → resetear
  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    store.set(ip, newEntry);

    return {
      allowed: true,
      remaining: options.limit - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Ventana activa → incrementar contador
  entry.count += 1;

  if (entry.count > options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: options.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// Límites por endpoint
export const LIMITS = {
  // POST /api/appointments → máx 5 reservas por IP cada 10 minutos
  createAppointment: { limit: 5, windowMs: 10 * 60 * 1000 },
  // GET /api/appointments → máx 60 consultas por IP cada minuto
  getAvailability: { limit: 60, windowMs: 60 * 1000 },
} as const;