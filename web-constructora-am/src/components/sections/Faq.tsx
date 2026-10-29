"use client";

import { Plus } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { site } from "@/content/site";
import { cn, EASE } from "@/lib/utils";
import { SectionHeading } from "../ui/SectionHeading";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const { faq } = site;
  return (
    <section id="preguntas" aria-labelledby="preguntas-titulo" className="bg-section py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading id="preguntas-titulo" title={faq.titulo} className="lg:sticky lg:top-28 lg:self-start" />
        <ul className="grid gap-3">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            const btnId = `faq-boton-${i}`;
            const panelId = `faq-panel-${i}`;
            return (
              <li key={item.pregunta} className={cn("rounded-[1.5rem] border bg-surface transition-colors", isOpen ? "border-ink/20 shadow-tinted" : "border-transparent")}>
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex min-h-16 w-full items-center justify-between gap-4 rounded-[1.5rem] px-5 py-4 text-left font-wide text-lg font-bold text-ink sm:px-7"
                  >
                    {item.pregunta}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color] duration-300 motion-reduce:transition-none",
                        isOpen ? "rotate-45 bg-accent text-ink" : "bg-ink text-surface",
                      )}
                    >
                      <Plus className="size-5" />
                    </span>
                  </button>
                </h3>
                {/* El panel siempre existe (aria-controls apunta a algo real); se anima la altura. */}
                <m.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                  initial={false}
                  animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[60ch] px-5 pb-6 text-base leading-relaxed text-muted sm:px-7">{item.respuesta}</p>
                </m.div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
