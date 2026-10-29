"use client";

import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { asset, cn } from "@/lib/utils";

type Slide = { src: string; srcMovil: string; titulo: string };

/**
 * Fondo de la portada: fotos que se alternan con un fundido (y un acercamiento muy lento).
 * - La primera foto viene en el HTML (carga rápida); las demás se montan cuando la página terminó de cargar.
 * - Botón de pausa e indicadores, para cumplir con accesibilidad (contenido que se mueve solo).
 * - Con «reducir movimiento» no cambian solas ni hacen zoom.
 */
export function HeroSlideshow({ slides, intervalo }: { slides: Slide[]; intervalo: number }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onLoad = () => setReady(true);
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (!ready || paused || reduce || slides.length < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), intervalo);
    return () => clearTimeout(t);
  }, [index, ready, paused, reduce, slides.length, intervalo]);

  const current = slides[index]!;

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden bg-navy">
        {slides.map((s, i) => {
          if (i > 0 && !ready) return null;
          const active = i === index;
          return (
            <picture key={s.src}>
              <source media="(max-width: 640px)" srcSet={asset(s.srcMovil)} width={720} height={1280} />
              <img
                src={asset(s.src)}
                alt=""
                width={1600}
                height={900}
                decoding="async"
                fetchPriority={i === 0 ? "high" : "low"}
                className="absolute inset-0 size-full object-cover"
                style={{
                  opacity: active ? 1 : 0,
                  transform: reduce ? undefined : active ? "scale(1)" : "scale(1.07)",
                  transition: reduce
                    ? "opacity 0.6s ease"
                    : active
                      ? `opacity 1.6s ease, transform ${intervalo + 2000}ms linear`
                      : "opacity 1.6s ease, transform 0s linear 1.6s",
                }}
              />
            </picture>
          );
        })}
      </div>

      {/* Pie de foto + controles */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 pr-20 pb-7 pl-4 sm:px-6 sm:pb-8">
          <p className="min-w-0 truncate text-sm text-white/80" aria-live="off">
            <span className="mr-2 font-title font-semibold text-accent-light tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            {current.titulo}
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-1">
              {slides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={site.a11y.verFoto(i + 1, slides.length)}
                  aria-current={i === index ? "true" : undefined}
                  className="group flex h-8 items-center px-1"
                >
                  <span
                    className={cn(
                      "block h-0.5 rounded-full transition-all duration-500",
                      i === index ? "w-8 bg-accent-light" : "w-4 bg-white/50 group-hover:bg-white",
                    )}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? site.a11y.reanudar : site.a11y.pausar}
              className="flex size-9 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:border-white hover:bg-white/10"
            >
              {paused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
