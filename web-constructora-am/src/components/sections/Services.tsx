"use client";

import { Bath, BrickWall, Building2, Check, Droplets, Frame, Home, PaintRoller, Zap, type LucideIcon } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { mensajeServicio, site, whatsappUrl, type Servicio } from "@/content/site";
import { EASE } from "@/lib/utils";
import { WhatsAppIcon } from "../ui/BrandIcons";
import { SectionHeading } from "../ui/SectionHeading";

const ICONOS: Record<Servicio["icono"], LucideIcon> = {
  casa: Home,
  reforma: PaintRoller,
  ampliacion: Building2,
  bano: Bath,
  techo: Droplets,
  steel: Frame,
  fachada: BrickWall,
  instalaciones: Zap,
};

export function Services() {
  const reduce = useReducedMotion();
  const { servicios } = site;
  return (
    <section id="servicios" aria-labelledby="servicios-titulo" className="bg-section bg-plano py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="servicios-titulo" title={servicios.titulo} intro={servicios.intro} />

        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {servicios.items.map((s, i) => {
            const Icon = ICONOS[s.icono];
            return (
              <m.li
                key={s.id}
                initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.15 }}
                transition={reduce ? { duration: 0 } : { duration: 0.8, ease: EASE, delay: (i % 4) * 0.08 }}
                className="group flex flex-col rounded-[1.75rem] border border-ink/[0.08] bg-surface p-6 shadow-tinted transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-ink text-accent transition-colors duration-300 group-hover:bg-primary-deep">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="font-wide text-sm font-bold text-muted tabular-nums" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl leading-tight font-extrabold tracking-[-0.01em] text-balance text-ink">{s.titulo}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{s.descripcion}</p>
                <p className="mt-5 text-xs font-bold text-ink">Incluye</p>
                <ul className="mt-2 grid gap-1.5 text-sm text-ink">
                  {s.incluye.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                <a
                  href={whatsappUrl(mensajeServicio(s))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-ink/10 px-3 text-sm whitespace-nowrap font-bold text-ink transition-colors hover:border-whatsapp hover:bg-whatsapp hover:text-white"
                >
                  <WhatsAppIcon className="size-4" />
                  Consultar por WhatsApp
                  <span className="sr-only">
                    sobre {s.titulo} {site.a11y.nuevaPestana}
                  </span>
                </a>
                </div>
              </m.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
