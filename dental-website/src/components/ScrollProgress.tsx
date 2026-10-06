"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Barrita de progreso de lectura arriba de todo. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-1 origin-left bg-gradient-to-r from-primary-deep via-accent to-mint"
    />
  );
}
