"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { experience } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export default function Experience() {
  const listRef = useRef<HTMLOListElement>(null);
  // La línea que une los pasos se "dibuja" a medida que bajás
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 85%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });

  return (
    <section
      id="experiencia"
      aria-labelledby="experience-title"
      className="relative overflow-hidden bg-surface py-24 md:py-32"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            id="experience-title"
            eyebrow={experience.eyebrow}
            title={experience.title}
            description={experience.description}
          />
        </Reveal>

        <ol ref={listRef} className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          {/* Línea base + línea de progreso (vertical en mobile, horizontal en desktop) */}
          <span aria-hidden="true" className="absolute bottom-6 left-7 top-7 w-0.5 bg-line md:hidden" />
          <motion.span
            aria-hidden="true"
            style={{ scaleY: progress }}
            className="absolute bottom-6 left-7 top-7 w-0.5 origin-top bg-gradient-to-b from-primary-deep to-mint md:hidden"
          />
          <span aria-hidden="true" className="absolute left-7 right-[calc(25%-1.75rem)] top-7 hidden h-0.5 bg-line md:block" />
          <motion.span
            aria-hidden="true"
            style={{ scaleX: progress }}
            className="absolute left-7 right-[calc(25%-1.75rem)] top-7 hidden h-0.5 origin-left bg-gradient-to-r from-primary-deep via-accent to-mint md:block"
          />

          {experience.steps.map((step, index) => (
            <li key={step.number} className="relative">
              <Reveal delay={index * 0.15}>
                <div className="group relative flex gap-5 md:flex-col md:gap-5">
                  <span
                    className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white font-display text-xl font-semibold text-primary-deep shadow-lg ring-1 ring-line transition-all duration-500 group-hover:-translate-y-1 group-hover:rotate-6 group-hover:bg-gradient-to-br group-hover:from-primary-deep group-hover:to-accent group-hover:text-white"
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-medium text-ink">
                      <span className="sr-only">{step.number}. </span>
                      {step.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
