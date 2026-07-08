// Datos de la empresa Maucci
export const maxturnosInfo = {
  name: "Maucci",
  tagline: "Sistemas de Turnos Profesionales",
  description: "Creamos sistemas de reservas web personalizados para barberías, manicurerías, estudios de piercing y cualquier negocio que necesite gestión de turnos. Transformamos tu negocio con tecnología moderna.",
  email: "maucci81@gmail.com",
  phone: "+54 11 1234-5678",
  instagram: "paulucci.dev",
  address: "Buenos Aires",
  services: [
    {
      id: 1,
      title: "Sistemas de Reservas",
      description: "Plataforma web completa para gestionar turnos de tus clientes",
      icon: "📅"
    },
    {
      id: 2,
      title: "Diseño Personalizado",
      description: "Cada sistema se adapta a la identidad visual de tu negocio",
      icon: "🎨"
    },
    {
      id: 3,
      title: "Gestión de Clientes",
      description: "Base de datos de clientes con historial de servicios",
      icon: "👥"
    },
    {
      id: 4,
      title: "Notificaciones",
      description: "Recordatorios automáticos por email",
      icon: "✉️"
    },
    {
      id: 5,
      title: "Reportes y Estadísticas",
      description: "Análisis de tu negocio con gráficos y métricas",
      icon: "📊"
    },
    {
      id: 6,
      title: "Soporte Técnico",
      description: "Asistencia completa para que tu sistema funcione perfecto",
      icon: "🛠️"
    }
  ],
  benefits: [
    {
      title: "Aumenta tus Ventas",
      description: "Reduce las cancelaciones y optimiza tu agenda"
    },
    {
      title: "Mejora la Experiencia",
      description: "Tus clientes pueden reservar 24/7 desde cualquier dispositivo"
    },
    {
      title: "Ahorra Tiempo",
      description: "Automatiza la gestión de turnos y reduce llamadas telefónicas"
    },
    {
      title: "Profesionaliza tu Negocio",
      description: "Imagen moderna y profesional que inspira confianza"
    }
  ],
  testimonials: [
    {
      id: 1,
      name: "María González",
      business: "Barbería El Estilo",
      comment: "Desde que implementamos el sistema de Maucci, nuestras reservas aumentaron un 40%. Los clientes están encantados con la facilidad de uso.",
      rating: 5
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      business: "Manicurería Bella",
      comment: "El sistema es súper intuitivo y el soporte técnico es excelente. Recomiendo Maucci 100%.",
      rating: 5
    },
    {
      id: 3,
      name: "Ana Martínez",
      business: "Estudio de Piercing",
      comment: "La personalización del diseño quedó perfecta con nuestra marca. Los clientes pueden reservar a cualquier hora.",
      rating: 5
    }
  ],
  pricing: {
    basic: {
      name: "Básico",
      price: "$50.000",
      period: "por mes",
      features: [
        "Sistema de reservas web",
        "Hasta 2 empleados",
        "Gestión de servicios",
        "Notificaciones por email",
        "Soporte por email"
      ]
    },
    professional: {
      name: "Profesional",
      price: "$80.000",
      period: "por mes",
      popular: true,
      features: [
        "Todo lo del plan Básico",
        "Hasta 5 empleados",
        "Recordatorios automáticos por email",
        "Reportes básicos",
        "Soporte prioritario",
        "Personalización avanzada"
      ]
    },
    enterprise: {
      name: "Empresarial",
      price: "$120.000",
      period: "por mes",
      features: [
        "Todo lo del plan Profesional",
        "Empleados ilimitados",
        "Reportes avanzados",
        "Integración con redes sociales",
        "Soporte 24/7",
        "Personalización completa"
      ]
    }
  }
};

