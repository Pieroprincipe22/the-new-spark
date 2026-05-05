export const siteConfig = {
  name: "The New Spark",
  description: "Cortes modernos, atención profesional y reservas fáciles.",
  instagram: "https://www.instagram.com/nthenewspark?igsh=NzZwdGNrY3c3aXV5",
  instagramHandle: "@nthenewspark",

  // Número actual usado para las pruebas con WhatsApp.
  // Cuando el cliente confirme su número final, se cambia aquí.
  whatsappNumber: "+34662230482",
  displayPhone: "+34 662 230 482",

  address: "Dirección pendiente",
  hours: {
    weekdays: "Lunes a Viernes: 9:00 AM - 7:00 PM",
    saturday: "Sábado: 9:00 AM - 7:00 PM",
    sunday: "Domingo: 10:00 AM - 4:00 PM",
  },
};

export const services = [
  {
    id: "corte",
    name: "Corte",
    description: "Corte moderno adaptado a tu estilo y tipo de cabello.",
    price: "$250",
    durationMinutes: 60,
  },
  {
    id: "barba",
    name: "Barba",
    description: "Arreglo y perfilado de barba con toallas calientes.",
    price: "$180",
    durationMinutes: 60,
  },
  {
    id: "corte-barba",
    name: "Corte + barba",
    description: "El combo perfecto para un look completo y definido.",
    price: "$400",
    durationMinutes: 60,
  },
];

export const availableTimes = [
  {
    time: "9:00 AM",
    available: true,
  },
  {
    time: "10:00 AM",
    available: true,
  },
  {
    time: "11:00 AM",
    available: true,
  },
  {
    time: "12:00 PM",
    available: true,
  },
  {
    time: "1:00 PM",
    available: true,
  },
  {
    time: "2:00 PM",
    available: true,
  },
  {
    time: "3:00 PM",
    available: true,
  },
  {
    time: "4:00 PM",
    available: true,
  },
  {
    time: "5:00 PM",
    available: true,
  },
];