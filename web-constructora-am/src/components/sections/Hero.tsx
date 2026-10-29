import { Check, Star } from "lucide-react";
import type { CSSProperties } from "react";
import { site, whatsappUrl } from "@/content/site";
import { buttonClass } from "../ui/Button";
import { ExternalLink } from "../ui/ExternalLink";
import { HeroSlideshow } from "../ui/HeroSlideshow";

const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

/**
 * Portada a pantalla completa con fotos de obras reales de fondo que se alternan.
 * Las entradas del texto son animaciones CSS: se pintan antes de que React termine de cargar.
 */
export function Hero() {
  const { hero, google } = site;

  // Cada palabra entra desde abajo, una detrás de otra.
  let wordIndex = 0;

  return (
    <section
      id="inicio"
      aria-labelledby="hero-titulo"
      className="on-dark relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 pb-28 text-white"
    >
      <HeroSlideshow slides={hero.slides} intervalo={hero.intervalo} />
      {/* Velos para que el texto se lea siempre, sea cual sea la foto */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/90 via-navy/65 to-navy/20" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/80 via-transparent to-navy/40" />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h1 id="hero-titulo" className="font-title-xl text-[clamp(2.8rem,11vw,4.4rem)] leading-[1.02] font-bold lg:text-[5.2rem]">
            {hero.titular.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                {line.split(" ").map((word) => {
                  const i = wordIndex++;
                  return (
                    <span key={word + i} className="anim-word mr-[0.25em] inline-block last:mr-0" style={delay(0.1 + i * 0.12)}>
                      {word}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <span aria-hidden="true" style={delay(0.4)} className="anim-rise bg-gold mt-8 block h-1 w-16 rounded-full" />

          <p style={delay(0.35)} className="anim-rise mt-7 max-w-[34rem] text-lg leading-relaxed text-white/85 sm:text-xl">
            {hero.bajada}
          </p>

          <div style={delay(0.45)} className="anim-rise mt-9 flex flex-col gap-3 sm:flex-row">
            <ExternalLink href={whatsappUrl()} className={buttonClass("accent", "min-h-14 px-8 text-base")}>
              {hero.ctaPrincipal}
            </ExternalLink>
            <a href="#servicios" className={buttonClass("outlineLight", "min-h-14 px-8 text-base")}>
              {hero.ctaSecundario}
            </a>
          </div>

          <ul style={delay(0.55)} className="anim-rise mt-9 flex flex-wrap gap-x-6 gap-y-2" aria-label="Lo que incluye trabajar con nosotros">
            {hero.chips.map((chip) => (
              <li key={chip} className="inline-flex items-center gap-2 text-[0.95rem] text-white/85">
                <Check className="size-4 text-accent-light" aria-hidden="true" strokeWidth={3} />
                {chip}
              </li>
            ))}
          </ul>

          <a
            href="#opiniones"
            style={delay(0.65)}
            className="anim-rise mt-8 inline-flex items-center gap-3 rounded-lg text-sm text-white/85 hover:text-white"
          >
            <span className="flex" role="img" aria-label={site.a11y.estrellas(google.calificacion)}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-4 fill-accent-light text-accent-light" aria-hidden="true" />
              ))}
            </span>
            <span>
              <strong className="font-semibold text-white">{google.calificacion.toFixed(1)}</strong> en Google Maps · ver opiniones
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
