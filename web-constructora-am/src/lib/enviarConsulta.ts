import { site, whatsappUrl } from "@/content/site";

export type Consulta = { nombre: string; telefono: string; tipo: string; mensaje: string };

export function mensajeConsulta(c: Consulta): string {
  return [
    `Hola, soy ${c.nombre}.`,
    c.tipo ? `Tipo de obra: ${c.tipo}.` : null,
    `Teléfono: ${c.telefono}.`,
    "",
    c.mensaje,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/**
 * Punto de integración opcional: si site.formulario.endpoint tiene una URL
 * (Formspree, EmailJS vía proxy, etc.), la consulta también se manda por POST.
 * Si falla, no bloquea: igual se abre WhatsApp.
 */
export async function enviarAlEndpoint(c: Consulta): Promise<void> {
  const endpoint = site.formulario.endpoint;
  if (!endpoint) return;
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(c),
    });
  } catch {
    // Sin conexión o endpoint caído: WhatsApp sigue siendo el canal principal.
  }
}

export function urlWhatsappConsulta(c: Consulta): string {
  return whatsappUrl(mensajeConsulta(c));
}
