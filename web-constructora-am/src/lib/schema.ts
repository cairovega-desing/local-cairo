import { site } from "@/content/site";

const DIAS_SCHEMA: Record<string, string> = {
  Lunes: "Monday",
  Martes: "Tuesday",
  Miércoles: "Wednesday",
  Jueves: "Thursday",
  Viernes: "Friday",
  Sábado: "Saturday",
  Domingo: "Sunday",
};

/** JSON-LD GeneralContractor armado solo con datos de site.ts. */
export function buildJsonLd() {
  const { marca, direccion, contacto, google, redes, horarios } = site;
  const abiertos = horarios.filter((h) => h.abre && h.cierra);

  // Agrupa los días con el mismo horario en una sola especificación.
  const grupos = new Map<string, string[]>();
  for (const h of abiertos) {
    const key = `${h.abre}-${h.cierra}`;
    grupos.set(key, [...(grupos.get(key) ?? []), `https://schema.org/${DIAS_SCHEMA[h.dia]}`]);
  }

  const sameAs = [redes.instagram, direccion.fichaMaps].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": `${marca.dominio}/#empresa`,
    name: marca.nombre,
    slogan: marca.slogan,
    description: site.seo.descripcion,
    url: marca.dominio,
    logo: `${marca.dominio}/images/logo-icon.png`,
    image: `${marca.dominio}/${site.seo.ogImagen}`,
    telephone: contacto.telefonoInternacional,
    ...(contacto.email ? { email: contacto.email } : {}),
    address: {
      "@type": "PostalAddress",
      ...(direccion.calle ? { streetAddress: direccion.calle } : {}),
      ...(direccion.codigoPostal ? { postalCode: direccion.codigoPostal } : {}),
      addressLocality: direccion.localidad,
      addressRegion: direccion.departamento,
      addressCountry: direccion.pais,
    },
    geo: { "@type": "GeoCoordinates", latitude: direccion.lat, longitude: direccion.lng },
    hasMap: direccion.fichaMaps,
    areaServed: [
      { "@type": "City", name: direccion.localidad },
      { "@type": "AdministrativeArea", name: `Departamento de ${direccion.departamento}` },
    ],
    openingHoursSpecification: [...grupos.entries()].map(([rango, dias]) => {
      const [opens, closes] = rango.split("-");
      return { "@type": "OpeningHoursSpecification", dayOfWeek: dias, opens, closes };
    }),
    // aggregateRating solo es válido con la cantidad de reseñas.
    ...(google.cantidadResenas
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: google.calificacion.toFixed(1),
            bestRating: "5",
            reviewCount: google.cantidadResenas,
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    makesOffer: site.servicios.items.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.titulo, description: s.descripcion },
    })),
  };
}
