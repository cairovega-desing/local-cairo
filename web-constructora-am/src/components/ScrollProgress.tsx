"use client";

import { m, useReducedMotion, useScroll, useSpring } from "framer-motion";

/** Barra fina arriba que muestra cuánto se leyó de la página. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const spring = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <m.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-primary via-primary to-accent"
      style={{ scaleX: reduce ? scrollYProgress : spring }}
    />
  );
}
