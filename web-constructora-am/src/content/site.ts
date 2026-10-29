/**
 * ÚNICO archivo con los datos del cliente.
 * Para reutilizar la plantilla con otra constructora, cambiá solo este archivo
 * (y las fotos de public/images, manteniendo los nombres).
 *
 * Convención: `null` = dato pendiente. La web muestra un aviso «pendiente»
 * o esconde el elemento hasta que se complete. Buscá «PENDIENTE» en este archivo.
 */

export type Cifra = {
  valor: number;
  prefijo?: string;
  sufijo?: string;
  decimales?: number;
  label: string;
};

export type Servicio = {
  id: string;
  icono: "casa" | "reforma" | "ampliacion" | "bano" | "techo" | "steel" | "fachada" | "instalaciones";
  titulo: string;
  descripcion: string;
  incluye: [string, string, string];
};

export type Resena = {
  nombre: string;
  texto: string;
  /** Tal como lo muestra Google, ej. «Hace un año». */
  antiguedad: string;
};

export type Horario = { dia: string; abre: string | null; cierra: string | null };

export type Imagen = { src: string | null; alt: string; etiqueta?: string };

export type AntesDespues = {
  id: string;
  titulo: string;
  descripcion: string;
  antes: { src: string; alt: string };
  despues: { src: string; alt: string };
  /** Tamaño real de las fotos (las dos iguales), para reservar el espacio sin saltos. */
  ancho: number;
  alto: number;
};

const nombre = "Constructora A&M";
const zona = "La Paloma, Rocha";
const whatsapp = "59895034296";
const lat = -34.65678;
const lng = -54.1619254;

const servicios: Servicio[] = [
  {
    id: "obra-nueva",
    icono: "casa",
    titulo: "Obra nueva llave en mano",
    descripcion: "Tu casa desde el terreno hasta la entrega de llaves.",
    incluye: ["Proyecto y dirección de obra", "Estructura, albañilería y terminaciones", "Entrega lista para habitar"],
  },
  {
    id: "reformas",
    icono: "reforma",
    titulo: "Reformas integrales",
    descripcion: "Renovamos toda la vivienda con un solo responsable.",
    incluye: ["Demoliciones y retiro de escombro", "Redistribución de ambientes", "Pisos, revoques y pintura"],
  },
  {
    id: "ampliaciones",
    icono: "ampliacion",
    titulo: "Ampliaciones",
    descripcion: "Sumá metros a tu casa sin perder estilo ni calidad.",
    incluye: ["Nuevos dormitorios o livings", "Segundo piso y barbacoas", "Integración con lo existente"],
  },
  {
    id: "banos-cocinas",
    icono: "bano",
    titulo: "Baños y cocinas",
    descripcion: "Los ambientes más usados, renovados a nuevo.",
    incluye: ["Revestimientos y griferías", "Muebles y mesadas", "Sanitaria y eléctrica nuevas"],
  },
  {
    id: "techos",
    icono: "techo",
    titulo: "Impermeabilizaciones y techos",
    descripcion: "Chau humedades y filtraciones, también cerca del mar.",
    incluye: ["Diagnóstico de humedades", "Membranas y sellados", "Techos nuevos o reparados"],
  },
  {
    id: "steel-framing",
    icono: "steel",
    titulo: "Steel framing y construcción en seco",
    descripcion: "Obras más rápidas, livianas y bien aisladas.",
    incluye: ["Estructura de perfiles galvanizados", "Aislación térmica y acústica", "Placas y terminaciones"],
  },
  {
    id: "fachadas",
    icono: "fachada",
    titulo: "Fachadas y revestimientos",
    descripcion: "Una cara nueva para tu casa que resiste el clima.",
    incluye: ["Revoques y texturados", "Revestimientos de piedra o madera", "Pintura exterior"],
  },
  {
    id: "instalaciones",
    icono: "instalaciones",
    titulo: "Instalaciones sanitarias y eléctricas",
    descripcion: "Instalaciones seguras y en regla, a la vista o embutidas.",
    incluye: ["Agua, desagües y saneamiento", "Tableros y cableado nuevo", "Revisión según normativa"],
  },
];

export const site = {
  // ───────────────────────── Marca ─────────────────────────
  marca: {
    nombre,
    slogan: "Tu proyecto, nuestra base.",
    dominio: "https://www.constructora.com.uy",
  },

  // PENDIENTE: nombre y cargo del responsable (aparecen firmando la cita).
  responsable: {
    nombre: null as string | null,
    cargo: null as string | null,
  },

  zona,

  cifras: {
    anios: { valor: 10, sufijo: "+", label: "Años de experiencia" },
    obras: { valor: 120, prefijo: "+", label: "Obras terminadas" },
    m2: { valor: 25000, prefijo: "+", sufijo: " m²", label: "m² construidos" },
  } satisfies Record<string, Cifra>,

  direccion: {
    // PENDIENTE: calle y número, y código postal de la oficina / showroom.
    calle: null as string | null,
    codigoPostal: null as string | null,
    localidad: "La Paloma",
    departamento: "Rocha",
    pais: "UY",
    lat,
    lng,
    /** Ficha del negocio en Google Maps (link provisto por el cliente). */
    fichaMaps:
      "https://www.google.com/maps/place/Constructora+A%26M/@-34.65678,-54.1619254,574m/data=!3m2!1e3!4b1!4m6!3m5!1s0x95749d8cf285d9a1:0x927e50b41cee3906!8m2!3d-34.65678!4d-54.1619254!16s%2Fg%2F11sw2wtx35",
  },

  contacto: {
    telefono: "095 034 296",
    telefonoInternacional: "+59895034296",
    whatsapp,
    mensajeWhatsapp: "Hola, quisiera pedir un presupuesto para una obra",
    email: null as string | null,
  },

  redes: {
    // PENDIENTE: URL de Instagram. Mientras sea null, se esconden los botones de Instagram.
    instagram: null as string | null,
  },

  horarios: [
    { dia: "Lunes", abre: "08:00", cierra: "17:00" },
    { dia: "Martes", abre: "08:00", cierra: "17:00" },
    { dia: "Miércoles", abre: "08:00", cierra: "17:00" },
    { dia: "Jueves", abre: "08:00", cierra: "17:00" },
    { dia: "Viernes", abre: "08:00", cierra: "17:00" },
    { dia: "Sábado", abre: "08:00", cierra: "17:00" },
    { dia: "Domingo", abre: null, cierra: null },
  ] satisfies Horario[],

  google: {
    calificacion: 5.0,
    // PENDIENTE: cantidad de reseñas. Sin este dato no se publica aggregateRating en el JSON-LD
    // (Google lo exige para que sea válido).
    cantidadResenas: null as number | null,
    // PENDIENTE: link directo para dejar reseña (Ficha → «Pedir reseñas»). Mientras tanto se usa la ficha.
    linkResena: null as string | null,
  },

  // PENDIENTE: confirmar cada registro. Los que tienen confirmado:false se muestran «a confirmar».
  credenciales: [
    { texto: "Registro Nacional de Empresas de Obras Públicas", confirmado: false },
    { texto: "BPS al día con todo el personal en obra", confirmado: false },
    { texto: "Seguros de obra con el BSE", confirmado: false },
  ],

  /** Punto de integración opcional del formulario (Formspree, EmailJS, etc.). */
  formulario: {
    // Ej.: "https://formspree.io/f/xxxxxxx". Si es null, el formulario solo abre WhatsApp.
    endpoint: null as string | null,
  },

  // ───────────────────────── SEO ─────────────────────────
  seo: {
    titulo: "Constructora en La Paloma, Rocha | Reformas, obra nueva y ampliaciones",
    descripcion:
      "Constructora A&M: obra nueva llave en mano, reformas, ampliaciones, techos y steel framing en La Paloma y Rocha. Presupuesto cerrado y visita sin cargo.",
    ogImagen: "images/og.jpg",
  },

  // ───────────────────────── Navegación ─────────────────────────
  nav: [
    { id: "empresa", label: "La empresa" },
    { id: "servicios", label: "Servicios" },
    { id: "obras", label: "Obras" },
    { id: "opiniones", label: "Opiniones" },
    { id: "preguntas", label: "Preguntas" },
    { id: "presupuesto", label: "Presupuesto" },
  ],

  // ───────────────────────── Secciones ─────────────────────────
  hero: {
    // Fotos de fondo de la portada: cambian solas cada `intervalo` milisegundos.
    // `src` es horizontal (computadora) y `srcMovil` vertical (celular).
    intervalo: 10000,
    slides: [
      { src: "images/portada/slide-1.jpg", srcMovil: "images/portada/slide-1-movil.jpg", titulo: "Cerramiento en madera con postigos" },
      { src: "images/portada/slide-2.jpg", srcMovil: "images/portada/slide-2-movil.jpg", titulo: "Cerramiento terminado y pintado" },
      { src: "images/portada/slide-3.jpg", srcMovil: "images/portada/slide-3-movil.jpg", titulo: "Parrillero nuevo de ladrillo" },
      { src: "images/portada/slide-4.jpg", srcMovil: "images/portada/slide-4-movil.jpg", titulo: "Habitación nueva terminada" },
    ],
    titular: ["Construimos", "tu proyecto."],
    bajada:
      "Obras llave en mano con presupuesto cerrado y plazos que se cumplen. Un solo equipo responsable, de la primera visita a la entrega.",
    ctaPrincipal: "Pedir presupuesto",
    ctaSecundario: "Ver servicios",
    chips: ["Llave en mano", "Presupuesto sin cargo", "Seguimiento de obra con fotos"],
  },

  experiencia: {
    // PENDIENTE: confirmar la frase con el responsable.
    cita: "Cada obra es un compromiso. La construimos como si fuera nuestra casa.",
  },

  empresa: {
    titulo: "Construcción integral en un solo lugar",
    parrafos: [
      "Trabajamos con equipo propio y coordinamos a todos los gremios de la obra: albañilería, sanitaria, eléctrica, herrería y terminaciones. Sin subcontratos innecesarios, vos tenés un solo interlocutor y nosotros respondemos por todo.",
      "Usamos materiales de primera, cumplimos la normativa vigente y dejamos todo por escrito: qué se hace, con qué materiales, cuánto cuesta y cuándo se entrega.",
    ],
  },

  servicios: {
    titulo: "Servicios para tu obra",
    intro: "Elegí lo que necesitás y consultanos por WhatsApp. Te respondemos en el día.",
    items: servicios,
  },

  obras: {
    titulo: "Obras terminadas",
    intro: "Algunos trabajos que entregamos en la zona.",
    // Reemplazá cada foto en public/images/obras/ manteniendo el nombre.
    // Solo las fotos necesarias: 6 obras terminadas. Reemplazá cada una manteniendo el nombre.
    items: [
      { src: "images/obras/obra-01.jpg", alt: "Fachada del cerramiento terminado, vista desde la calle" },
      { src: "images/obras/obra-02.jpg", alt: "Habitación nueva terminada, con puerta y ventana de madera" },
      { src: "images/obras/obra-03.jpg", alt: "Puertas de madera con vidrio repartido instaladas" },
      { src: "images/obras/obra-04.jpg", alt: "Mesada y parrillero nuevos en obra gruesa" },
      { src: "images/obras/obra-05.jpg", alt: "Parrilla revestida con ladrillo refractario" },
      { src: "images/obras/obra-06.jpg", alt: "Piso nuevo colocado en la habitación" },
    ] satisfies Imagen[],
    ctaInstagram: "Ver más obras en Instagram",
  },

  antesDespues: {
    titulo: "Antes y después",
    intro: "Deslizá la barra para ver cómo cambió cada espacio.",
    etiquetaAntes: "Antes",
    etiquetaDespues: "Después",
    ayuda: "Arrastrá o usá las flechas del teclado para comparar",
    items: [
      {
        id: "cerramiento",
        titulo: "De pasillo abierto a habitación",
        descripcion: "Cerramos un pasillo techado con estructura de madera, puerta, ventana con postigos y piso nuevo.",
        antes: { src: "images/antes-despues/cerramiento-antes.jpg", alt: "Antes: pasillo techado con pérgola, abierto a la calle" },
        despues: { src: "images/antes-despues/cerramiento-despues.jpg", alt: "Después: el pasillo convertido en habitación con ventana de madera" },
        ancho: 900,
        alto: 1200,
      },
      {
        id: "parrillero",
        titulo: "Patio con parrillero nuevo",
        descripcion: "Demolimos el parrillero viejo y levantamos uno nuevo de ladrillo, con revoques y contrapiso.",
        antes: { src: "images/antes-despues/parrillero-antes.jpg", alt: "Antes: patio con el parrillero viejo y techito de chapa" },
        despues: { src: "images/antes-despues/parrillero-despues.jpg", alt: "Después: parrillero nuevo de ladrillo y paredes pintadas" },
        ancho: 1280,
        alto: 666,
      },
    ] satisfies AntesDespues[],
  },

  resenas: {
    titulo: "Lo que dicen nuestros clientes",
    bajada: "Puntuación en Google Maps · reseñas reales de clientes",
    // Reseñas reales de Google Maps, copiadas tal cual (incluidos los saltos de línea).
    // Si la lista queda vacía, se muestran tarjetas marcadas como pendientes.
    items: [
      {
        nombre: "Cintya Ramcke",
        antiguedad: "Hace 2 años",
        texto:
          "Excelente trabajo y muy rápido. Dejan todo limpio y organizado, recomiendo esta empresa! Soy brasileña y me ayudaron mucho, y a pesar de la diferencia de idioma, fueron muy educados. Precio justo.",
      },
      {
        nombre: "Lucía Sciaraffia",
        antiguedad: "Hace un año",
        texto:
          "Muy conforme con el trabajo.\nLos chicos muy dispuestos a todas las dudas y siempre a disposición\nLos recomiendo 100%.\nTrabajo con total garantía!",
      },
      {
        nombre: "Gustavo Rosso",
        antiguedad: "Hace 3 años",
        texto:
          "Realizaron un excelente trabajo,  los recomiendo no solo por eso ,sino por el compromiso y el trato personal.",
      },
      {
        nombre: "Agustín Videla",
        antiguedad: "Hace 3 años",
        texto: "Muy buen asesoramiento. Tuve un problema en el techo y lo resolvieron excelentemente!",
      },
      {
        nombre: "Carlos Cáceres",
        antiguedad: "Hace 3 años",
        texto: "Muy buenos profesionales, me resolvieron enseguida. Muy cordiales!",
      },
      {
        nombre: "Mauro Correa Gabino",
        antiguedad: "Hace 2 años",
        texto: "Trabajos garantidos excelente personas.",
      },
    ] as Resena[],
    cta: "Dejanos tu opinión en Google Maps",
  },

  pasos: {
    titulo: "Una obra sin sorpresas",
    intro: "Así trabajamos, desde el primer mensaje hasta la entrega.",
    items: [
      { titulo: "Contactanos", texto: "Por WhatsApp o con el formulario. Te respondemos en el día." },
      { titulo: "Visita y relevamiento", texto: "Vamos a tu terreno o casa, medimos y evaluamos en sitio, sin cargo." },
      { titulo: "Presupuesto cerrado", texto: "Plazos, materiales y costos por escrito antes de empezar." },
      { titulo: "Ejecución y seguimiento", texto: "Reportes con fotos por WhatsApp, entrega y garantía." },
    ],
  },

  // PENDIENTE: revisar las respuestas con el cliente antes de publicar.
  faq: {
    titulo: "Preguntas frecuentes",
    items: [
      {
        pregunta: "¿Hacen presupuestos sin cargo?",
        respuesta:
          "Sí. Visitamos la obra, relevamos lo que hay que hacer y te pasamos un presupuesto cerrado por escrito, sin costo y sin compromiso.",
      },
      {
        pregunta: "¿Trabajan con financiación o pagos por avance de obra?",
        respuesta:
          "Sí. Podemos acordar pagos por etapas según el avance de la obra. Las condiciones quedan escritas en el presupuesto.",
      },
      {
        pregunta: "¿Se encargan de permisos y trámites (Intendencia, BPS)?",
        respuesta:
          "Sí. Te acompañamos con los trámites ante la Intendencia y el registro de la obra en BPS, y te explicamos cada paso antes de empezar.",
      },
      {
        pregunta: "¿Cuánto demora una obra típica?",
        respuesta:
          "Depende del tipo y del tamaño de la obra. Junto con el presupuesto te damos un cronograma por escrito con el plazo de cada etapa.",
      },
      {
        pregunta: "¿Dan garantía?",
        respuesta: "Sí. Al entregar la obra te damos la garantía por escrito, con lo que cubre y por cuánto tiempo.",
      },
      {
        pregunta: "¿En qué zonas trabajan?",
        respuesta: `Trabajamos en ${zona} y alrededores. Si tu obra está en otra zona, escribinos y lo vemos.`,
      },
    ],
  },

  ubicacion: {
    titulo: "Encontranos en",
    botonMaps: "Ver en Google Maps",
    tituloMapa: "Mapa con la ubicación de Constructora A&M",
  },

  contactoSeccion: {
    titulo: "¿Tenés un proyecto en mente?",
    texto: "Contanos qué querés hacer y coordinamos una visita.",
    beneficios: ["Respuesta en el día", "Visita sin cargo", "Financiación"],
    botonWhatsapp: "Escribinos por WhatsApp",
    exito: "¡Gracias! Recibimos tu consulta y te respondemos a la brevedad.",
    enviar: "Enviar consulta",
    campos: {
      nombre: { label: "Nombre", placeholder: "Tu nombre", error: "Escribí tu nombre (mínimo 2 letras)." },
      telefono: { label: "Teléfono", placeholder: "Ej. 099 123 456", error: "Escribí un teléfono válido (mínimo 7 números)." },
      tipo: { label: "Tipo de obra", placeholder: "Elegí una opción", otro: "Otra consulta" },
      mensaje: { label: "Mensaje", placeholder: "Contanos sobre tu obra", error: "Contanos un poco más (mínimo 5 caracteres)." },
    },
  },

  ctaFinal: {
    lineas: ["Construí con", "confianza."],
    boton: "Pedir presupuesto",
  },

  footer: {
    columnas: { empresa: "Empresa", servicios: "Servicios", contacto: "Contacto" },
    derechos: "Todos los derechos reservados.",
  },

  // ───────────────────────── Accesibilidad ─────────────────────────
  a11y: {
    saltar: "Saltar al contenido",
    abrirMenu: "Abrir menú",
    cerrarMenu: "Cerrar menú",
    navPrincipal: "Navegación principal",
    nuevaPestana: "(se abre en una pestaña nueva)",
    inicio: "Ir al inicio",
    pausar: "Pausar las fotos de fondo",
    reanudar: "Reanudar las fotos de fondo",
    verFoto: (n: number, total: number) => `Ver foto ${n} de ${total}`,
    whatsappFlotante: "Pedir presupuesto por WhatsApp",
    estrellas: (n: number) => `${n.toFixed(1)} de 5 estrellas`,
    pendiente: "Pendiente",
    aConfirmar: "A confirmar",
    progreso: "Progreso de lectura",
  },
};

// ───────────────────────── Derivados ─────────────────────────

export function whatsappUrl(mensaje: string = site.contacto.mensajeWhatsapp): string {
  return `https://wa.me/${site.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

export function mensajeServicio(s: Servicio): string {
  return `Hola, quisiera consultar por el servicio de ${s.titulo.toLowerCase()}.`;
}

export const direccionTexto = [site.direccion.calle, site.direccion.localidad, site.direccion.departamento]
  .filter(Boolean)
  .join(", ");

export const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
export const mapsEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&hl=es&output=embed`;
export const resenaUrl = site.google.linkResena ?? site.direccion.fichaMaps;
