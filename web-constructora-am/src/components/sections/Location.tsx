"use client";

import { Clock, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { direccionTexto, mapsEmbedUrl, mapsSearchUrl, site } from "@/content/site";
import { cn } from "@/lib/utils";
import { buttonClass } from "../ui/Button";
import { ExternalLink } from "../ui/ExternalLink";
import { Pending } from "../ui/Pending";
import { Reveal } from "../ui/Reveal";

/** Índice del día de hoy en Uruguay, con lunes = 0 (mismo orden que site.horarios). */
function hoyEnUruguay(): number {
  const dia = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/Montevideo" }).format(new Date());
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(dia);
}

export function Location() {
  // Se calcula en el cliente para no fijar el día en el HTML exportado.
  const [hoy, setHoy] = useState<number>(-1);
  useEffect(() => setHoy(hoyEnUruguay()), []);
  const { contacto, horarios, direccion, ubicacion } = site;

  return (
    <section id="ubicacion" aria-labelledby="ubicacion-titulo" className="bg-section py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <span aria-hidden="true" className="mb-6 block h-0.5 w-14 rounded-full bg-accent" />
          <h2 id="ubicacion-titulo" className="max-w-3xl font-title text-[2.1rem] leading-[1.05] font-extrabold text-balance text-ink sm:text-5xl">
            {ubicacion.titulo} {direccionTexto}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="rounded-[2rem] bg-white p-6 shadow-tinted sm:p-8">
            <dl className="grid gap-6">
              <div className="flex gap-4">
                <dt>
                  <MapPin className="size-6 text-accent-deep" aria-hidden="true" />
                  <span className="sr-only">Dirección</span>
                </dt>
                <dd className="text-base text-ink">
                  {direccion.calle ? (
                    <span className="font-semibold">{direccion.calle}</span>
                  ) : (
                    <Pending className="text-accent-ink">Calle y número pendientes</Pending>
                  )}
                  <span className="block text-muted">
                    {direccion.localidad}, {direccion.departamento}
                    {direccion.codigoPostal ? ` · CP ${direccion.codigoPostal}` : ""}
                  </span>
                </dd>
              </div>
              <div className="flex gap-4">
                <dt>
                  <Phone className="size-6 text-accent-deep" aria-hidden="true" />
                  <span className="sr-only">Teléfono</span>
                </dt>
                <dd>
                  <a href={`tel:${contacto.telefonoInternacional}`} className="font-title text-xl font-bold text-ink underline decoration-accent decoration-2 underline-offset-4 hover:decoration-ink">
                    {contacto.telefono}
                  </a>
                </dd>
              </div>
              <div className="flex gap-4">
                <dt>
                  <Clock className="size-6 text-accent-deep" aria-hidden="true" />
                  <span className="sr-only">Horarios</span>
                </dt>
                <dd className="flex-1">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Horarios de atención</caption>
                    <tbody>
                      {horarios.map((h, i) => (
                        <tr
                          key={h.dia}
                          aria-current={i === hoy ? "date" : undefined}
                          className={cn(i === hoy ? "bg-accent/30 font-bold text-ink" : "text-muted")}
                        >
                          <th scope="row" className="rounded-l-lg py-1.5 pl-2 text-left font-semibold">
                            {h.dia}
                            {i === hoy && <span className="ml-2 text-xs font-bold text-accent-ink">Hoy</span>}
                          </th>
                          <td className="rounded-r-lg py-1.5 pr-2 text-right tabular-nums">
                            {h.abre && h.cierra ? `${h.abre} – ${h.cierra}` : "Cerrado"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </dd>
              </div>
            </dl>
            <ExternalLink href={mapsSearchUrl} className={buttonClass("dark", "mt-8 w-full")}>
              <MapPin className="size-5" aria-hidden="true" />
              {ubicacion.botonMaps}
            </ExternalLink>
          </Reveal>

          <Reveal delay={0.1} className="min-h-[22rem] overflow-hidden rounded-[2rem] bg-sand shadow-tinted">
            <iframe
              src={mapsEmbedUrl}
              title={ubicacion.tituloMapa}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full min-h-[22rem] border-0"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
