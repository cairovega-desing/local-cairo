"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import type { AntesDespues } from "@/content/site";
import { asset } from "@/lib/utils";

type Labels = { antes: string; despues: string; ayuda: string };

/**
 * Comparador antes/después: la foto «antes» se recorta sobre la «después».
 * Se arrastra con el mouse o el dedo (el scroll vertical sigue funcionando) y,
 * para teclado y lectores de pantalla, hay un control deslizante nativo.
 */
export function BeforeAfter({ item, labels }: { item: AntesDespues; labels: Labels }) {
  const [pos, setPosState] = useState(50);
  const posRef = useRef(50);
  const setPos = (v: number) => {
    posRef.current = v;
    setPosState(v);
  };
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const touched = useRef(false);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const inputId = useId();

  // Pista al aparecer: la barra se mueve sola un poco para mostrar que se puede arrastrar.
  useEffect(() => {
    if (!inView || reduce) return;
    let cancelled = false;
    const run = async () => {
      for (const to of [68, 34, 50]) {
        if (cancelled || touched.current) return;
        await animate(posRef.current, to, { duration: 0.7, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => !touched.current && setPos(v) });
      }
    };
    const t = setTimeout(run, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // Solo una vez, al entrar en pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  function moveTo(clientX: number) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }

  function onDown(e: PointerEvent<HTMLDivElement>) {
    touched.current = true;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveTo(e.clientX);
  }

  return (
    <div
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      style={{ aspectRatio: `${item.ancho} / ${item.alto}` }}
      className="group relative cursor-ew-resize touch-pan-y overflow-hidden rounded-[2rem] bg-sand shadow-lift select-none"
    >
      <img
        src={asset(item.despues.src)}
        alt={item.despues.alt}
        width={item.ancho}
        height={item.alto}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 size-full object-cover"
      />
      <img
        src={asset(item.antes.src)}
        alt={item.antes.alt}
        width={item.ancho}
        height={item.alto}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        className="absolute inset-0 size-full object-cover"
      />

      <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-ink/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
        {labels.antes}
      </span>
      <span className="bg-gold pointer-events-none absolute top-4 right-4 rounded-full px-3 py-1.5 text-xs font-bold text-ink">
        {labels.despues}
      </span>

      {/* Control accesible (teclado / lector de pantalla) */}
      <label htmlFor={inputId} className="sr-only">
        {labels.ayuda}: {item.titulo}
      </label>
      <input
        id={inputId}
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(pos)}
        onChange={(e) => {
          touched.current = true;
          setPos(Number(e.target.value));
        }}
        aria-valuetext={`${Math.round(pos)}% ${labels.antes.toLowerCase()}`}
        className="peer sr-only"
      />

      {/* Línea y manija */}
      <div
        aria-hidden="true"
        style={{ left: `${pos}%` }}
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgb(0_0_0/0.35)]"
      />
      <div
        aria-hidden="true"
        style={{ left: `${pos}%` }}
        className="pointer-events-none absolute top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-gold rounded-full border-2 border-white text-ink shadow-lift transition-transform duration-200 group-active:scale-110 peer-focus-visible:ring-4 peer-focus-visible:ring-white"
      >
        <ChevronLeft className="-mr-1 size-4" strokeWidth={3} />
        <ChevronRight className="-ml-1 size-4" strokeWidth={3} />
      </div>
    </div>
  );
}
