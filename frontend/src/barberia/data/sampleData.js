export const businessInfo = {
  name: "Barbería Clásica",
  phone: "+54 11 1234-5678",
  email: "contacto@barberiaclasica.com",
  address: "Av. Corrientes 1234, Buenos Aires",
  description: "Barbería tradicional con más de 20 años de experiencia, ofreciendo cortes de pelo y barba de la más alta calidad.",
  rating: 4.8,
  reviewCount: 127,
  images: [
    "/assets/img/establecimientos/barberia_ejemplo/portada/portada1.jpg",
    "/assets/img/establecimientos/barberia_ejemplo/portada/portada2.jpg",
    "/assets/img/establecimientos/barberia_ejemplo/portada/portada3.jpg",
    "/assets/img/establecimientos/barberia_ejemplo/portada/portada4.webp"
  ],
  hours: {
    monday: "9:00 - 20:00",
    tuesday: "9:00 - 20:00",
    saturday: "9:00 - 18:00",
    sunday: "Cerrado"
  }
};

export const services = [
  {
    id: 1,
    name: "Corte de Pelo Clásico",
    category: "Cortes",
    duration: "30 min",
    price: "$2500",
    description: "Corte tradicional con tijera y máquina, incluye peinado y acabado profesional."
  },
  {
    id: 2,
    name: "Corte de Pelo Moderno",
    category: "Cortes",
    duration: "45 min",
    price: "$3000",
    description: "Corte con técnicas modernas, degradado y diseño personalizado según tu estilo."
  },
  {
    id: 3,
    name: "Corte de Barba",
    category: "Barba",
    duration: "25 min",
    price: "$2000",
    description: "Arreglo completo de barba con tijera, navaja y acabado con productos premium."
  },
  {
    id: 4,
    name: "Corte + Barba",
    category: "Paquetes",
    duration: "60 min",
    price: "$4500",
    description: "Paquete completo: corte de pelo y arreglo de barba con todos los servicios incluidos."
  },
  {
    id: 5,
    name: "Afeitado Clásico",
    category: "Barba",
    duration: "30 min",
    price: "$2500",
    description: "Afeitado tradicional con navaja caliente, toalla caliente y productos de primera calidad."
  },
  {
    id: 6,
    name: "Tratamiento Capilar",
    category: "Tratamientos",
    duration: "40 min",
    price: "$3500",
    description: "Tratamiento hidratante y reparador para el cabello con productos profesionales."
  },
  {
    id: 7,
    name: "Coloración",
    category: "Color",
    duration: "90 min",
    price: "$6000",
    description: "Coloración profesional con productos de alta calidad y acabado perfecto."
  },
  {
    id: 8,
    name: "Lavado y Peinado",
    category: "Servicios",
    duration: "20 min",
    price: "$1500",
    description: "Lavado profesional con productos premium y peinado según tu preferencia."
  }
];

export const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00"
];

export const team = [
  {
    id: 1,
    name: "Carlos Mendoza",
    role: "Barbero Principal",
    avatar: "/assets/img/establecimientos/barberia_ejemplo/personal/personal1.jpg",
    rating: 4.9,
    reviewCount: 45,
    specialties: ["Cortes Clásicos", "Afeitado Tradicional", "Diseño de Barba"]
  },
  {
    id: 2,
    name: "Miguel Rodríguez",
    role: "Barbero Senior",
    avatar: "/assets/img/establecimientos/barberia_ejemplo/personal/personal2.jpg",
    rating: 4.8,
    reviewCount: 38,
    specialties: ["Cortes Modernos", "Degradados", "Coloración"]
  },
  {
    id: 3,
    name: "Juan Pérez",
    role: "Barbero",
    avatar: "/assets/img/establecimientos/barberia_ejemplo/personal/personal3.jpg",
    rating: 4.7,
    reviewCount: 32,
    specialties: ["Cortes de Pelo", "Tratamientos", "Peinados"]
  },
  {
    id: 4,
    name: "Diego Sánchez",
    role: "Barbero",
    avatar: "/assets/img/establecimientos/barberia_ejemplo/personal/personal4.jpg",
    rating: 4.8,
    reviewCount: 28,
    specialties: ["Barba", "Afeitado", "Cortes Clásicos"]
  }
];

export const reviews = [
  {
    id: 1,
    name: "Roberto Martínez",
    rating: 5,
    comment: "Excelente servicio, muy profesional. El corte quedó perfecto y la atención fue impecable. Definitivamente volveré.",
    date: "15 de Noviembre",
    time: "14:30"
  },
  {
    id: 2,
    name: "Luis Fernández",
    rating: 5,
    comment: "La mejor barbería de la zona. Carlos es un maestro con la navaja. El afeitado fue increíble, muy relajante.",
    date: "12 de Noviembre",
    time: "10:15"
  },
  {
    id: 3,
    name: "Andrés García",
    rating: 4,
    comment: "Muy buen servicio, cortes modernos y profesionales. El ambiente es agradable y los precios justos.",
    date: "10 de Noviembre",
    time: "16:45"
  },
  {
    id: 4,
    name: "Fernando López",
    rating: 5,
    comment: "Increíble experiencia. Miguel hizo un trabajo excepcional con mi barba. Muy recomendable.",
    date: "8 de Noviembre",
    time: "11:20"
  },
  {
    id: 5,
    name: "Sergio Torres",
    rating: 4,
    comment: "Buen servicio en general. El corte quedó bien, aunque esperé un poco más de lo esperado.",
    date: "5 de Noviembre",
    time: "15:00"
  },
  {
    id: 6,
    name: "Martín Díaz",
    rating: 5,
    comment: "Profesionales de primera. El paquete completo (corte + barba) valió cada peso. Volveré pronto.",
    date: "3 de Noviembre",
    time: "13:30"
  },
  {
    id: 7,
    name: "Pablo Ruiz",
    rating: 5,
    comment: "Excelente atención y resultados. Juan es muy hábil y tiene buen ojo para los detalles. Muy satisfecho.",
    date: "1 de Noviembre",
    time: "17:00"
  },
  {
    id: 8,
    name: "Ricardo Morales",
    rating: 4,
    comment: "Buen servicio, cortes de calidad. El ambiente es cómodo y los barberos son amables.",
    date: "28 de Octubre",
    time: "12:00"
  },
  {
    id: 9,
    name: "Javier Herrera",
    rating: 5,
    comment: "La mejor barbería que he visitado. Diego hizo un trabajo increíble con mi barba. Altamente recomendado.",
    date: "25 de Octubre",
    time: "14:15"
  }
];
