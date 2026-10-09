/**
 * Todo el contenido del sitio vive acá. Los componentes no tienen strings hardcodeados.
 * Fuente: CONTENT.md. Para pasar a datos reales (fase 5 del ROADMAP) alcanza con editar este archivo.
 */

// ───────────────────────── Tipos ─────────────────────────

export type TreatmentIcon =
  | "smile"
  | "sparkles"
  | "implant"
  | "activity"
  | "baby"
  | "shield";

export type HeroBadgeIcon = "users" | "scan" | "file";

export interface NavLink {
  label: string;
  href: string;
}

export interface HeroBadge {
  label: string;
  icon: HeroBadgeIcon;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Treatment {
  id: string;
  title: string;
  description: string;
  duration: string;
  includes: string[];
  icon: TreatmentIcon;
}

export interface Testimonial {
  name: string;
  time: string;
  text: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BusinessHours {
  label: string;
  time: string;
  /** Días en formato schema.org; vacío si está cerrado. */
  days: string[];
  opens?: string;
  closes?: string;
}

// ───────────────────────── Negocio ─────────────────────────

export const business = {
  name: "Consultorio Odontológico Dra. Gabriela Fraga",
  shortName: "Dra. Gabriela Fraga",
  slogan: "Tu sonrisa, nuestra prioridad.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dragabrielafraga.com",
  address: {
    street: "Guaycurú 2924",
    postalCode: "11800",
    city: "Montevideo",
    countryCode: "UY",
    full: "Guaycurú 2924, 11800 Montevideo, Departamento de Montevideo",
  },
  phone: "+598 99 123 456",
  phoneHref: "tel:+59899123456",
  whatsappNumber: "59899123456",
  whatsappMessage: "Hola, quisiera agendar una consulta",
  email: "consultas@dragabrielafraga.com",
  instagram: {
    handle: "@dragabrielafraga",
    url: "https://www.instagram.com/dragabrielafraga",
  },
  facebook: {
    handle: "/dragabrielafraga",
    url: "https://www.facebook.com/dragabrielafraga",
  },
  hours: [
    {
      label: "Lunes a Viernes",
      time: "9:00–19:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "19:00",
    },
    {
      label: "Sábados",
      time: "9:00–13:00",
      days: ["Saturday"],
      opens: "09:00",
      closes: "13:00",
    },
    { label: "Domingos", time: "Cerrado", days: [] },
  ] satisfies BusinessHours[],
  // Rating de Google mostrado en el sitio. Actualizar con el número real de reseñas al pasar a producción.
  rating: { value: "5.0", reviewCount: 5 },
};

export const whatsappUrl = `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
  business.whatsappMessage,
)}`;

export const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${business.address.full}, Uruguay`,
)}`;

export const googleMapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  `${business.address.full}, Uruguay`,
)}&z=16&output=embed`;

// ───────────────────────── SEO ─────────────────────────

export const seo = {
  title: `${business.name} | Odontología en Montevideo`,
  description:
    "Odontología integral para toda la familia en el corazón de Montevideo. Ortodoncia, estética dental, implantes, endodoncia y odontopediatría con tecnología actual y trato cercano.",
  keywords: [
    "odontología Montevideo",
    "dentista Montevideo",
    "consultorio odontológico Montevideo",
    "ortodoncia Montevideo",
    "alineadores invisibles Montevideo",
    "blanqueamiento dental Montevideo",
    "implantes dentales Montevideo",
    "endodoncia Montevideo",
    "odontopediatría Montevideo",
    "Dra. Gabriela Fraga",
  ],
  locale: "es_UY",
  ogAlt: "Consultorio Odontológico Dra. Gabriela Fraga, Montevideo",
};

// ───────────────────────── UI (etiquetas de interfaz) ─────────────────────────

export const ui = {
  skipToContent: "Saltar al contenido",
  openMenu: "Abrir menú de navegación",
  closeMenu: "Cerrar menú de navegación",
  menuTitle: "Menú de navegación",
  mainNavLabel: "Navegación principal",
  whatsappTooltip: "Agendar por WhatsApp",
  newTab: "(se abre en una pestaña nueva)",
  imagePlaceholderPrefix: "Imagen pendiente:",
  starsLabel: "5 de 5 estrellas",
  logoHome: "Ir al inicio",
};

// ───────────────────────── Navegación ─────────────────────────

export const navigation = {
  links: [
    { label: "La clínica", href: "#sobre" },
    { label: "Tratamientos", href: "#tratamientos" },
    { label: "Opiniones", href: "#opiniones" },
    { label: "El espacio", href: "#espacio" },
    { label: "Preguntas", href: "#faq" },
  ] satisfies NavLink[],
  cta: "Agendar",
};

// ───────────────────────── Hero ─────────────────────────

export const hero = {
  eyebrow: "Consultorio odontológico · Montevideo",
  titleStart: "Tu sonrisa,",
  titleHighlight: "nuestra prioridad.",
  subtitle:
    "Odontología integral para toda la familia en el corazón de Montevideo. Tecnología actual, trato cercano y un equipo comprometido con tu salud bucal.",
  primaryCta: "Agendar una cita",
  secondaryCta: "Conocer los tratamientos",
  secondaryHref: "#tratamientos",
  badges: [
    { label: "Adultos y niños", icon: "users" },
    { label: "Radiografías digitales", icon: "scan" },
    { label: "Historia clínica digital", icon: "file" },
  ] satisfies HeroBadge[],
  imageLabel: "Foto de la Dra. Gabriela Fraga",
  ratingCard: { value: "5.0", label: "en Google Maps" },
  patientsCard: { value: "+500", label: "sonrisas felices" },
  availabilityCard: "Turnos disponibles esta semana",
  painlessCard: "Atención sin dolor",
  scrollHint: "Deslizá para conocernos",
};

// Cinta animada debajo del hero
export const marquee = [
  "Ortodoncia invisible",
  "Blanqueamiento",
  "Implantes",
  "Diseño de sonrisa",
  "Odontopediatría",
  "Endodoncia",
  "Limpieza profesional",
  "Urgencias",
];

// ───────────────────────── Sobre nosotros ─────────────────────────

export const about = {
  eyebrow: "Sobre la clínica",
  title: "Odontología integral en un solo lugar",
  paragraphs: [
    "El Consultorio Odontológico de la Dra. Gabriela Fraga es un espacio pensado para resolver todas tus necesidades dentales sin derivaciones innecesarias. Con más de 10 años de experiencia, la Dra. Fraga lidera un equipo de especialistas que trabajan de forma coordinada para ofrecerte un tratamiento completo y personalizado.",
    "Nuestro consultorio en Montevideo cuenta con equipamiento digital de última generación — radiografías digitales, historia clínica electrónica y materiales de primera calidad — para que cada decisión clínica esté respaldada por la mejor tecnología disponible.",
  ],
  stats: [
    { value: "5.0", label: "Rating en Google Maps" },
    { value: "+500", label: "Pacientes atendidos" },
    { value: "10+", label: "Años de experiencia" },
  ] satisfies Stat[],
  credentials: [
    "Odontóloga graduada de la Facultad de Odontología (UdelaR)",
    "Especialista en ortodoncia y estética dental",
  ],
  imageLabel: "Foto de la Dra. Gabriela Fraga en el consultorio",
  badgeRing: "Odontología · Montevideo · ",
  badgeCenter: "10+",
  badgeCenterLabel: "años",
  quote: "Cada sonrisa es única. Mi trabajo es cuidarla como si fuera la mía.",
  quoteAuthor: "Dra. Gabriela Fraga",
};

// ───────────────────────── Tratamientos ─────────────────────────

export const treatmentsSection = {
  eyebrow: "Tratamientos",
  title: "Servicios para tu salud dental",
  description: "Un consultorio, todos los tratamientos que tu familia necesita.",
  durationLabel: "Duración",
  includesLabel: "Incluye",
  cta: "Consultar por WhatsApp",
};

export const treatments: Treatment[] = [
  {
    id: "ortodoncia",
    title: "Ortodoncia",
    description:
      "Brackets, alineadores y aparatología funcional para niños, adolescentes y adultos.",
    duration: "12–24 meses",
    icon: "smile",
    includes: [
      "Estudio ortodóntico completo",
      "Brackets metálicos y estéticos",
      "Alineadores invisibles",
      "Control y seguimiento mensual",
    ],
  },
  {
    id: "estetica",
    title: "Estética dental",
    description:
      "Blanqueamiento, carillas y diseño de sonrisa para una imagen impecable.",
    duration: "1–3 sesiones",
    icon: "sparkles",
    includes: [
      "Blanqueamiento dental profesional",
      "Carillas de porcelana y composite",
      "Diseño digital de sonrisa",
      "Recontorneado estético",
    ],
  },
  {
    id: "implantes",
    title: "Implantes dentales",
    description:
      "Recuperá piezas perdidas con implantes de titanio y rehabilitación completa.",
    duration: "3–6 meses",
    icon: "implant",
    includes: [
      "Implantes de titanio",
      "Cirugía guiada por imágenes",
      "Coronas sobre implantes",
      "Rehabilitación completa",
    ],
  },
  {
    id: "endodoncia",
    title: "Endodoncia",
    description:
      "Tratamiento de conducto con técnicas modernas para salvar tus dientes.",
    duration: "1–2 sesiones",
    icon: "activity",
    includes: [
      "Tratamiento de conducto",
      "Retratamiento endodóntico",
      "Restauraciones post-endodoncia",
      "Pernos y coronas",
    ],
  },
  {
    id: "odontopediatria",
    title: "Odontopediatría",
    description:
      "Atención dental especializada para bebés, niños y adolescentes.",
    duration: "30–45 min",
    icon: "baby",
    includes: [
      "Primera consulta de adaptación",
      "Sellantes y fluorización",
      "Control de caries",
      "Ortopedia funcional",
    ],
  },
  {
    id: "prevencion",
    title: "Prevención y limpieza",
    description:
      "Limpieza profesional, control de caries y educación para la salud bucal.",
    duration: "30–45 min",
    icon: "shield",
    includes: [
      "Limpieza y destartarización",
      "Fluorización",
      "Control periódico",
      "Educación en higiene oral",
    ],
  },
];

// ───────────────────────── Testimonios ─────────────────────────

export const testimonialsSection = {
  eyebrow: "Opiniones",
  title: "Lo que dicen quienes ya pasaron por la consulta",
  scrollRegionLabel: "Opiniones de pacientes, desplazá horizontalmente para ver más",
  googleBadge: "5.0 en Google",
  googleLinkLabel: "Dejanos tu opinión en Google Maps",
  ratingCaption: "Calificación promedio de nuestros pacientes",
};

export const testimonials: Testimonial[] = [
  {
    name: "María González",
    time: "Hace 3 meses",
    text: "“Excelente profesional. Muy atenta, cálida y dedicada. Me explicó todo el tratamiento con claridad desde el primer momento. La recomiendo totalmente.”",
  },
  {
    name: "Carlos Rodríguez",
    time: "Hace 5 meses",
    text: "“Fui por una urgencia y me atendieron el mismo día. El trato es impecable y los precios son muy accesibles. Ahora toda mi familia se atiende ahí.”",
  },
  {
    name: "Laura Martínez",
    time: "Hace 2 meses",
    text: "“Mi hijo le tenía miedo al dentista y la Dra. Fraga logró que se sintiera cómodo desde la primera consulta. Increíble el trato con los niños.”",
  },
  {
    name: "Andrés Silva",
    time: "Hace 4 meses",
    text: "“Me hice el blanqueamiento y quedé muy conforme con el resultado. Siempre explica todo antes de hacer cualquier procedimiento. Muy profesional.”",
  },
  {
    name: "Valentina Pérez",
    time: "Hace 1 mes",
    text: "“Llevo más de un año con el tratamiento de ortodoncia y los resultados son increíbles. El seguimiento es constante y siempre está disponible por WhatsApp.”",
  },
];

// ───────────────────────── El espacio ─────────────────────────

export const gallery = {
  eyebrow: "El espacio",
  title: "Nuestro consultorio",
  description:
    "Un espacio moderno y cómodo pensado para que tu visita sea lo más agradable posible. Sala de espera climatizada, equipamiento digital y un rincón especial para los más pequeños.",
  // La primera es la imagen grande del bento; las otras cuatro son chicas.
  images: [
    "Sala de atención principal",
    "Equipamiento digital / radiografías",
    "Sala de espera",
    "Rincón infantil",
    "Fachada / entrada del consultorio",
  ],
};

// ───────────────────────── Experiencia del paciente ─────────────────────────

export const experience = {
  eyebrow: "Qué esperar de tu visita",
  title: "Una consulta sin sorpresas",
  description: "Así es como trabajamos cada vez que venís al consultorio.",
  steps: [
    {
      number: "01",
      title: "Agendá tu cita",
      description:
        "Escribinos por WhatsApp o completá el formulario. Te respondemos en el día para coordinar día y hora.",
    },
    {
      number: "02",
      title: "Diagnóstico completo",
      description:
        "Radiografías digitales en el momento. Vas a ver exactamente lo mismo que ve la odontóloga, en pantalla.",
    },
    {
      number: "03",
      title: "Plan de tratamiento",
      description:
        "Te explicamos opciones, tiempos y costos antes de empezar. Sin sorpresas ni presupuestos ocultos.",
    },
    {
      number: "04",
      title: "Seguimiento continuo",
      description:
        "Historia clínica digital, recordatorios por WhatsApp y respuesta directa si surge alguna duda entre sesiones.",
    },
  ] satisfies Step[],
};

// ───────────────────────── FAQ ─────────────────────────

export const faqSection = {
  eyebrow: "Preguntas frecuentes",
  title: "Antes de venir",
};

export const faq: FAQItem[] = [
  {
    question: "¿Atienden niños pequeños?",
    answer:
      "Sí, atendemos bebés, niños y adolescentes con un enfoque especial en que se sientan cómodos y seguros.",
  },
  {
    question: "¿Cómo agendo una cita?",
    answer:
      "El canal más rápido es WhatsApp al +598 99 123 456. Respondemos en horario de consultorio. También podés usar el formulario de contacto.",
  },
  {
    question: "¿Aceptan pagos en cuotas?",
    answer:
      "Sí. Para tratamientos largos (ortodoncia, implantes) coordinamos planes de pago en cuotas con tarjeta de crédito o transferencia.",
  },
  {
    question: "¿Hay estacionamiento cerca?",
    answer:
      "Sí, sobre la avenida y calles laterales hay estacionamiento libre y tarifado.",
  },
  {
    question: "¿Qué pasa si tengo una urgencia fuera de horario?",
    answer:
      "Escribinos por WhatsApp explicando la situación. En urgencias reales coordinamos atención fuera del horario habitual.",
  },
  {
    question: "¿Trabajan con algún convenio o mutual?",
    answer:
      "Actualmente contamos con convenios institucionales. Consultá por WhatsApp para más información sobre cobertura.",
  },
];

// ───────────────────────── Ubicación ─────────────────────────

export const location = {
  eyebrow: "Ubicación",
  title: "Encontranos en Guaycurú 2924",
  description:
    "Estamos en Guaycurú 2924, Montevideo, bien conectados en transporte público. Si tenés dudas de cómo llegar, escribinos por WhatsApp.",
  addressLabel: "Dirección",
  hoursLabel: "Horarios",
  contactLabel: "Teléfono",
  mapCta: "Ver en Google Maps",
  mapTitle: "Mapa de Google Maps con la ubicación del consultorio en Guaycurú 2924, Montevideo",
  openNow: "Abierto ahora",
  closedNow: "Cerrado ahora",
};

// ───────────────────────── Contacto ─────────────────────────

export const contact = {
  eyebrow: "Contacto",
  title: "¿Tenés alguna consulta?",
  description:
    "Respondemos todos los mensajes desde el consultorio. Si es algo urgente, escribinos por WhatsApp.",
  whatsappCta: "Escribir por WhatsApp",
  divider: "o escribinos",
  perks: [
    "Respuesta en el día",
    "Urgencias coordinadas",
    "Pagos en cuotas",
  ],
  form: {
    name: { label: "Nombre", placeholder: "Tu nombre" },
    phone: { label: "Teléfono", placeholder: "099 123 456" },
    message: { label: "Mensaje", placeholder: "Contanos en qué podemos ayudarte" },
    submit: "Enviar mensaje",
    sending: "Enviando…",
    success: "¡Gracias! Recibimos tu mensaje y te respondemos a la brevedad.",
    errors: {
      name: "Ingresá tu nombre.",
      phone: "Ingresá un teléfono válido.",
      message: "Escribí tu consulta (mínimo 5 caracteres).",
    },
  },
};

// ───────────────────────── Footer ─────────────────────────

export const footer = {
  slogan: business.slogan,
  siteLinksTitle: "Consultorio",
  treatmentsTitle: "Tratamientos",
  contactTitle: "Contacto",
  siteLinks: [
    { label: "La clínica", href: "#sobre" },
    { label: "Tratamientos", href: "#tratamientos" },
    { label: "El espacio", href: "#espacio" },
    { label: "Ubicación", href: "#ubicacion" },
    { label: "Preguntas frecuentes", href: "#faq" },
    { label: "Contacto", href: "#contacto" },
  ] satisfies NavLink[],
  socialLabel: {
    instagram: "Instagram de la Dra. Gabriela Fraga",
    facebook: "Facebook de la Dra. Gabriela Fraga",
  },
  bigLine: "Sonreí con confianza.",
  cta: "Agendá tu consulta",
  copyright: `© 2026 ${business.name} · Montevideo, Uruguay`,
};
