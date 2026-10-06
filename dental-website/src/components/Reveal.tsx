"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso en segundos; sirve para escalonar (stagger) listas de cards. */
  delay?: number;
  /** Desplazamiento vertical inicial en px. */
  y?: number;
}

/** Fade-in + slide-up + desenfoque al entrar en viewport. Respeta prefers-reduced-motion. */
export function Reveal({ children, className, delay = 0, y = 32 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
