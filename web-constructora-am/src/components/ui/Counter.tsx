"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Cifra } from "@/content/site";

const formatter = (decimales: number) =>
  new Intl.NumberFormat("es-UY", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

/** Cuenta desde 0 hasta el valor al entrar en pantalla (1.8 s, una sola vez). */
export function Counter({ cifra, className }: { cifra: Cifra; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const decimales = cifra.decimales ?? 0;
  const fmt = formatter(decimales);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(cifra.valor);
      return;
    }
    const controls = animate(0, cifra.valor, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, reduce, cifra.valor]);

  const final = `${cifra.prefijo ?? ""}${fmt.format(cifra.valor)}${cifra.sufijo ?? ""}`;
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true" className="tabular-nums">
        {cifra.prefijo}
        {fmt.format(Number(value.toFixed(decimales)))}
        {cifra.sufijo}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
