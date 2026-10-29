"use client";

import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "article";
  y?: number;
};

/** Aparición al entrar en pantalla: fade + blur + subida. Una sola vez. */
export function Reveal({ children, className, delay = 0, as = "div", y = 28 }: Props) {
  const reduce = useReducedMotion();
  const Comp = m[as];
  return (
    <Comp
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduce ? { duration: 0 } : { duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}
