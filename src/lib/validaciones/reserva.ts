import { z } from 'zod';

export const reservaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(80, 'El nombre no puede superar los 80 caracteres.'),

  telefono: z
    .string()
    .trim()
    .regex(
      /^(\+34\s?)?[6-9]\d{8}$/,
      'Introduce un teléfono español válido.'
    ),

  servicio: z
    .string()
    .trim()
    .min(2, 'Selecciona un servicio válido.')
    .max(80, 'El servicio no puede superar los 80 caracteres.'),

  fecha: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha no tiene un formato válido.'),

  hora: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora no tiene un formato válido.'),

  comentario: z
    .string()
    .trim()
    .max(300, 'El comentario no puede superar los 300 caracteres.')
    .optional()
    .or(z.literal('')),

  // Campo oculto anti-spam. Los usuarios reales no lo rellenan.
  website: z.string().max(0, 'Solicitud bloqueada.').optional(),
});

export type ReservaInput = z.infer<typeof reservaSchema>;