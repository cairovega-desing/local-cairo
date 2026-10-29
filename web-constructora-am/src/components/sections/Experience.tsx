"use client";

import { m, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { site } from "@/content/site";
import { Pending } from "../ui/Pending";

/** Años de experiencia + cita del responsable, animados con el scroll. */
export function Experience() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const numberX = useTransform(progress, [0, 1], ["-4%", "4%"]);
  const quoteY = useTransform(progress, [0.1, 0.45], [60, 0]);
  const lineScale = useTransform(progress, [0.2, 0.55], [0, 1]);
  const { anios } = site.cifras;
  const { responsable } = site;

  return (
    <section
      id="experiencia"
      ref={ref}
      aria-labelledby="experiencia-titulo"
      className="relative overflow-hidden bg-section py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <m.p
          aria-hidden="true"
          style={reduce ? undefined : { x: numberX }}
          className="font-title-xl text-[clamp(7rem,34vw,20rem)] leading-[0.8] font-black tracking-[-0.06em] text-primary-deep/90"
        >
          {anios.valor}
          <span className="text-accent">{anios.sufijo}</span>
        </m.p>
        <h2 id="experiencia-titulo" className="mt-2 font-title text-2xl font-extrabold text-ink sm:text-3xl">
          <span className="sr-only">
            {anios.valor}
            {anios.sufijo}{" "}
          </span>
          años construyendo en {site.zona}
        </h2>

        <m.figure style={reduce ? undefined : { y: quoteY }} className="mt-12 max-w-3xl sm:ml-auto">
          <m.div
            aria-hidden="true"
            style={reduce ? undefined : { scaleX: lineScale }}
            className="mb-8 h-1 w-24 origin-left rounded-full bg-accent"
          />
          <blockquote className="font-display text-[1.75rem] leading-[1.2] font-medium tracking-[-0.01em] text-balance text-ink sm:text-[2.4rem]">
            “{site.experiencia.cita}”
          </blockquote>
          <figcaption className="mt-6 flex flex-wrap items-center gap-2 text-base text-muted">
            <span className="font-bold text-ink">
              {responsable.nombre ?? <Pending className="text-accent-ink">Nombre del responsable pendiente</Pending>}
            </span>
            <span aria-hidden="true">·</span>
            <span>{responsable.cargo ?? <Pending className="text-accent-ink">Cargo pendiente</Pending>}</span>
          </figcaption>
        </m.figure>
      </div>
    </section>
  );
}
