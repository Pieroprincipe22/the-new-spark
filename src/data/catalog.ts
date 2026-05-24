export type Service = {
  id: string;
  name: string;
  description: string;
  price: string;
  priceNumber: number;
  durationMinutes: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  available: boolean;
  imageUrl?: string;
  imageAlt?: string;
};

export const services: Service[] = [
  {
    id: "corte-clasico",
    name: "Corte clásico",
    description: "Corte tradicional limpio, rápido y adaptado al estilo del cliente.",
    price: "8,00 €",
    priceNumber: 8,
    durationMinutes: 30,
  },
  {
    id: "corte-jubilado",
    name: "Corte jubilado",
    description: "Servicio especial para jubilados con acabado cuidado y profesional.",
    price: "8,00 €",
    priceNumber: 8,
    durationMinutes: 30,
  },
  {
    id: "degradado-moderno",
    name: "Degradado moderno",
    description: "Degradado actual con acabado definido y estilo moderno.",
    price: "12,00 €",
    priceNumber: 12,
    durationMinutes: 30,
  },
  {
    id: "degradado-diseno-elaborado",
    name: "Degradado + diseño elaborado",
    description: "Degradado con diseño personalizado y detalle trabajado.",
    price: "14,00 €",
    priceNumber: 14,
    durationMinutes: 35,
  },
  {
    id: "degradado-arreglo-barba",
    name: "Degradado + arreglo de barba",
    description: "Corte degradado acompañado de arreglo completo de barba.",
    price: "16,00 €",
    priceNumber: 16,
    durationMinutes: 40,
  },
  {
    id: "degradado-perfilado-barba",
    name: "Degradado + perfilado de barba",
    description: "Degradado con perfilado de barba para definir contornos y líneas.",
    price: "13,50 €",
    priceNumber: 13.5,
    durationMinutes: 35,
  },
  {
    id: "cejas-navaja",
    name: "Cejas con navaja",
    description: "Limpieza y definición de cejas con acabado preciso.",
    price: "3,00 €",
    priceNumber: 3,
    durationMinutes: 10,
  },
  {
    id: "barba-completa",
    name: "Barba completa",
    description: "Arreglo completo de barba con perfilado y acabado limpio.",
    price: "7,00 €",
    priceNumber: 7,
    durationMinutes: 20,
  },
];

export const products: Product[] = [
  {
    id: "cera-pelo",
    name: "Cera para el pelo",
    description: "Fijación y textura para mantener el peinado durante el día.",
    price: "Consultar",
    available: true,
  },
  {
    id: "polvo-peinar",
    name: "Polvo de peinar",
    description: "Volumen, textura y acabado natural para peinados modernos.",
    price: "Consultar",
    available: true,
  },
  {
    id: "gel-fijador",
    name: "Gel fijador",
    description: "Fijación fuerte para estilos definidos y duraderos.",
    price: "Consultar",
    available: true,
  },
  {
    id: "espuma-barba",
    name: "Espuma para barba",
    description: "Producto para preparar el afeitado y cuidar la piel.",
    price: "Consultar",
    available: true,
  },
  {
    id: "aceite-barba",
    name: "Aceite para barba",
    description: "Hidratación, brillo y suavidad para barba y piel.",
    price: "Consultar",
    available: true,
  },
  {
    id: "after-shave",
    name: "After shave",
    description: "Cuidado posterior al afeitado para calmar y refrescar la piel.",
    price: "Consultar",
    available: true,
  },
];