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
    id: "polvo-peinar",
    name: "Nish Man Powder Styling P1",
    description:
      "Polvo de peinado ideal para dar volumen, textura y un acabado mate natural sin apelmazar el cabello.",
    price: "Consultar",
    available: true,
    imageUrl: "/productos/nish-man-powder-styling-p1.webp", // ✅ corregido
    imageAlt: "Nish Man Powder Styling P1",
  },
  {
    id: "cera-pelo",
    name: "Nish Man 03 Hair Styling Wax Flaming",
    description:
      "Cera de peinado para definir, moldear y mantener el estilo durante el día con un acabado marcado.",
    price: "Consultar",
    available: true,
    imageUrl: "/productos/nish-man-03-wax-flaming.webp", // ✅ corregido
    imageAlt: "Nish Man 03 Hair Styling Wax Flaming",
  },
  {
    id: "nish-man-08-wax-matte",
    name: "Nish Man 08 Hair Styling Wax Matte",
    description:
      "Cera mate para conseguir un peinado natural, definido y sin brillo excesivo.",
    price: "Consultar",
    available: true,
    imageUrl: "/productos/nish-man-08-wax-matte.webp", // ✅ corregido
    imageAlt: "Nish Man 08 Hair Styling Wax Matte",
  },
];