import { ArrowDown, Check, Star } from "lucide-react";
import type { CSSProperties } from "react";
import { site, whatsappUrl } from "@/content/site";
import { asset, iniciales } from "@/lib/utils";
import { buttonClass } from "../ui/Button";
import { ExternalLink } from "../ui/ExternalLink";
import { LogoMark } from "../ui/Logo";
import { TiltFrame } from "../ui/TiltFrame";

const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

/**
 * Inicio limpio sobre crema: titular, una sola foto y el monograma del logo como marca de agua.
 * Las entradas son animaciones CSS: el texto se pinta antes de que React termine de cargar.
 */
export function Hero() {
  const { hero, google, cifras, resenas } = site;
  const avatares = resenas.items.slice(0, 3).map((r) => iniciales(r.nombre));

  // Cada palabra entra desde abajo, una detrás de otra.
  let wordIndex = 0;

  return (
    <section
      id="inicio"
      aria-labelledby="hero-titulo"
      className="relative isolate overflow-hidden bg-gradient-to-b from-section to-surface pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-28"
    >
      {/* Monograma gigante, muy suave, como marca de agua */}
      <LogoMark uid="hero-agua" className="pointer-events-none absolute -right-24 -bottom-10 -z-10 w-[56rem] max-w-none opacity-[0.07]" />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
        <div>
          <p
            style={delay(0)}
            className="anim-rise inline-flex items-center gap-2 rounded-full border border-accent/40 bg-white/70 py-1.5 pr-4 pl-2 text-sm font-semibold text-ink"
          >
            <span className="bg-gold size-2.5 rounded-full" aria-hidden="true" />
            {hero.badge}
          </p>

          <h1
            id="hero-titulo"
            className="mt-7 font-title-xl text-[clamp(2.7rem,11.5vw,4.4rem)] leading-[1] font-bold text-ink lg:text-[4.9rem]"
          >
            {hero.titular.map((line, li) => (
              <span key={line} className="block overflow-hidden pb-[0.1em]">
                {line.split(" ").map((word) => {
                  const i = wordIndex++;
                  return (
                    <span
                      key={word + i}
                      className={"anim-word inline-block" + (li === hero.titular.length - 1 ? " text-gold" : "")}
                      style={delay(0.1 + i * 0.12)}
                    >
                      {word}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <p style={delay(0.35)} className="anim-rise mt-7 max-w-[33rem] text-lg leading-relaxed text-muted sm:text-xl">
            {hero.bajada}
          </p>

          <div style={delay(0.45)} className="anim-rise mt-9 flex flex-col gap-3 sm:flex-row">
            <ExternalLink href={whatsappUrl()} className={buttonClass("accent", "min-h-14 px-8 text-base")}>
              {hero.ctaPrincipal}
            </ExternalLink>
            <a href="#servicios" className={buttonClass("outline", "min-h-14 px-8 text-base")}>
              {hero.ctaSecundario}
            </a>
          </div>

          <ul style={delay(0.55)} className="anim-rise mt-9 flex flex-wrap gap-x-6 gap-y-3" aria-label="Lo que incluye trabajar con nosotros">
            {hero.chips.map((chip) => (
              <li key={chip} className="inline-flex items-center gap-2 text-[0.95rem] font-semibold text-ink">
                <Check className="size-4 text-accent-deep" aria-hidden="true" strokeWidth={3} />
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div style={delay(0.2)} className="anim-pop relative mx-auto w-full max-w-[22rem] lg:max-w-[24rem]">
          {/* Marco dorado desplazado detrás de la foto */}
          <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2.5rem] border-2 border-accent/60" />
          <TiltFrame src={asset(hero.foto)} alt={hero.fotoAlt} width={720} height={900} />

          <div className="anim-float absolute top-6 -right-2 sm:-right-8">
            <p className="flex items-center gap-2 rounded-full bg-navy py-2 pr-4 pl-3 text-xs font-bold text-white shadow-lift sm:text-sm">
              <span className="relative flex size-2.5" aria-hidden="true">
                <span className="absolute inset-0 animate-ping-slow rounded-full bg-whatsapp-brand" />
                <span className="relative size-2.5 rounded-full bg-whatsapp-brand" />
              </span>
              {hero.badgeFlotante}
            </p>
          </div>

          <div className="absolute -bottom-8 -left-3 w-[min(18.5rem,92%)] rounded-3xl bg-white p-4 shadow-lift ring-1 ring-accent/20 sm:-left-10">
            <div className="flex items-center gap-2">
              <div className="flex" role="img" aria-label={site.a11y.estrellas(google.calificacion)}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-4 fill-accent text-accent" aria-hidden="true" />
                ))}
              </div>
              <p className="text-sm font-bold text-ink">{google.calificacion.toFixed(1)} en Google Maps</p>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex -space-x-2" aria-hidden="true">
                {avatares.map((ini, i) => (
                  <span
                    key={i}
                    className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-navy text-xs font-bold text-accent-light even:bg-accent-ink even:text-white"
                  >
                    {ini}
                  </span>
                ))}
              </div>
              <p className="text-sm leading-tight text-muted">
                <strong className="font-title text-base font-bold text-ink">
                  {cifras.obras.prefijo}
                  {cifras.obras.valor}
                </strong>{" "}
                obras entregadas
              </p>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#experiencia"
        className="mx-auto mt-24 flex w-fit flex-col items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
      >
        {hero.scroll}
        <span aria-hidden="true" className="anim-bounce flex size-9 items-center justify-center rounded-full border border-accent/50">
          <ArrowDown className="size-4" />
        </span>
      </a>
    </section>
  );
}
