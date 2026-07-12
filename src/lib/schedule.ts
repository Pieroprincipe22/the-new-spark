// Horario comercial y lógica de huecos de reserva (slots de 30 min).
// Centraliza el horario para no repetirlo en el formulario, la validación y el backend.

export const SLOT_MINUTES = 30;

// ── Apertura de reservas (inauguración) ─────────────────────────────────────
// Primer día que se puede reservar. Las fechas anteriores quedan bloqueadas
// en el calendario y rechazadas por la API. A partir de este día (incluido),
// esta regla deja de bloquear nada por sí sola: no hay que tocar el código.
// Para futuros cierres temporales, basta con cambiar esta fecha.
export const BOOKING_OPENS_ON = "2026-07-18";

// ¿Es una fecha reservable según la apertura? (comparación segura en formato YYYY-MM-DD)
export function isDateBookable(date: string): boolean {
  return date >= BOOKING_OPENS_ON;
}
// ────────────────────────────────────────────────────────────────────────────

// Duración a partir de la cual un servicio ocupa 2 huecos.
// Solo el servicio de 40 min supera este valor; los de 35 y menos ocupan 1.
const TWO_SLOT_THRESHOLD = 35;

// Ventanas horarias por día (0 = domingo … 6 = sábado, según getDay()).
// Cada ventana es [apertura, cierre]; el cierre es la hora a la que ya NO se atiende.
const WEEKDAY_WINDOWS: Record<number, Array<[string, string]>> = {
  0: [], // Domingo: cerrado
  1: [["09:00", "14:00"], ["17:00", "21:00"]], // Lunes
  2: [["09:00", "14:00"], ["17:00", "21:00"]], // Martes
  3: [["09:00", "14:00"], ["17:00", "21:00"]], // Miércoles
  4: [["09:00", "14:00"], ["17:00", "21:00"]], // Jueves
  5: [["09:00", "14:00"], ["17:00", "21:00"]], // Viernes
  6: [["09:00", "14:00"]], // Sábado: solo mañana
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Día de la semana desde "YYYY-MM-DD" usando fecha local (evita saltos de zona horaria).
function getWeekday(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

function getWindows(date: string): Array<[string, string]> {
  return WEEKDAY_WINDOWS[getWeekday(date)] ?? [];
}

// ¿Cuántos huecos de 30 min ocupa un servicio según su duración?
export function getSlotsNeeded(durationMinutes: number): number {
  return durationMinutes > TWO_SLOT_THRESHOLD ? 2 : 1;
}

// ¿Está abierto ese día?
export function isOpenDay(date: string): boolean {
  return getWindows(date).length > 0;
}

// Hueco siguiente (suma 30 min). Útil para expandir reservas existentes.
export function getNextSlot(time: string): string {
  return minutesToTime(timeToMinutes(time) + SLOT_MINUTES);
}

// Todas las horas de inicio del día (válidas para un servicio de 1 hueco), en orden.
// Sirve para pintar la rejilla; el encaje de 2 huecos se filtra con getOccupiedSlots.
export function getDayStartSlots(date: string): string[] {
  const slots: string[] = [];

  for (const [open, close] of getWindows(date)) {
    const start = timeToMinutes(open);
    const end = timeToMinutes(close);

    for (let minute = start; minute + SLOT_MINUTES <= end; minute += SLOT_MINUTES) {
      slots.push(minutesToTime(minute));
    }
  }

  return slots;
}

// Huecos que ocuparía una cita que empieza en `time` y necesita `slotsNeeded` huecos.
// Devuelve null si el día está cerrado o si no cabe dentro de una sola ventana.
export function getOccupiedSlots(
  date: string,
  time: string,
  slotsNeeded: number
): string[] | null {
  const startMinutes = timeToMinutes(time);

  for (const [open, close] of getWindows(date)) {
    const windowStart = timeToMinutes(open);
    const windowEnd = timeToMinutes(close);
    const endMinutes = startMinutes + slotsNeeded * SLOT_MINUTES;

    if (startMinutes >= windowStart && startMinutes < windowEnd && endMinutes <= windowEnd) {
      const slots: string[] = [];
      for (let i = 0; i < slotsNeeded; i += 1) {
        slots.push(minutesToTime(startMinutes + i * SLOT_MINUTES));
      }
      return slots;
    }
  }

  return null;
}

// Superset de todas las horas posibles en cualquier día (para la validación de formato con Zod).
export const ALL_START_TIMES: string[] = (() => {
  const set = new Set<string>();

  for (const windows of Object.values(WEEKDAY_WINDOWS)) {
    for (const [open, close] of windows) {
      const start = timeToMinutes(open);
      const end = timeToMinutes(close);

      for (let minute = start; minute + SLOT_MINUTES <= end; minute += SLOT_MINUTES) {
        set.add(minutesToTime(minute));
      }
    }
  }

  return Array.from(set).sort();
})();