// src/lib/validation.ts
import { z } from "zod";
import { ALL_START_TIMES } from "@/lib/schedule";

export const getAvailabilitySchema = z.object({
  date: z
    .string()
    .min(1, "La fecha es obligatoria.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido. Usa YYYY-MM-DD.")
    .refine((date) => !isNaN(new Date(date).getTime()), "La fecha no es válida.")
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    }, "No se pueden consultar fechas pasadas."),
});

export const createAppointmentSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre no puede superar los 80 caracteres.")
    .regex(
      /^[a-záéíóúüñàèìòùA-ZÁÉÍÓÚÜÑÀÈÌÒÙ\s'-]+$/i,
      "El nombre solo puede contener letras, espacios, guiones y apóstrofes."
    ),

  phone: z
    .string()
    .min(9, "El teléfono debe tener al menos 9 dígitos.")
    .max(20, "El teléfono no puede superar los 20 caracteres.")
    .regex(/^[+]?[\d\s\-().]{9,20}$/, "El teléfono no tiene un formato válido."),

  service: z
    .string()
    .min(1, "El servicio es obligatorio.")
    .max(200, "El nombre del servicio es demasiado largo."),

  date: z
    .string()
    .min(1, "La fecha es obligatoria.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido. Usa YYYY-MM-DD.")
    .refine((date) => !isNaN(new Date(date).getTime()), "La fecha no es válida.")
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    }, "No se pueden reservar citas en fechas pasadas."),

  time: z
    .string()
    .min(1, "La hora es obligatoria.")
    .refine(
      (time) => ALL_START_TIMES.includes(time),
      "La hora seleccionada no es válida."
    ),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type GetAvailabilityInput = z.infer<typeof getAvailabilitySchema>;

export function formatZodErrors(errors: z.ZodError): string {
  return errors.issues.map((issue) => issue.message).join(" ");
}