import { ArrowDown, Check, Star, UserRound } from "lucide-react";
import type { CSSProperties } from "react";
import { site, whatsappUrl } from "@/content/site";
import { asset, iniciales } from "@/lib/utils";
import { buttonClass } from "../ui/Button";
import { ExternalLink } from "../ui/ExternalLink";
import { TiltFrame } from "../ui/TiltFrame";

const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

/**
 * Hero a pantalla completa con foto de obra de fondo.
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
      className="on-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-primary-deep pt-28 pb-10 text-white sm:pt-32 lg:pt-36"
    >
      {/* Foto de fondo + velos para que el texto se lea siempre */}
      <picture>
        <source media="(max-width: 640px)" srcSet={asset(hero.fondoMovil)} width={720} height={960} />
        <img
          src={asset(hero.fondo)}
          alt=""
          width={1600}
          height={900}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 size-full object-cover"
        />
      </picture>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/95 via-ink/75 to-ink/35" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-ink/80 to-transparent" />

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
        <div>
          <p
            style={delay(0)}
            className="anim-rise inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1.5 pr-4 pl-2 text-sm font-semibold text-white backdrop-blur-md"
          >
            <span className="size-2.5 rounded-full bg-accent ring-4 ring-accent/30" aria-hidden="true" />
            {hero.badge}
          </p>

          <h1
            id="hero-titulo"
            className="mt-7 font-title-xl text-[clamp(2.9rem,12.5vw,4.6rem)] leading-[0.95] font-extrabold text-white lg:text-[5.4rem]"
          >
            {hero.titular.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                {line.split(" ").map((word) => {
                  const i = wordIndex++;
                  return (
                    <span key={word + i} className="anim-word inline-block" style={delay(0.1 + i * 0.12)}>
                      {word}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <span aria-hidden="true" style={delay(0.45)} className="anim-rise mt-7 block h-0.5 w-20 rounded-full bg-accent" />

          <p style={delay(0.35)} className="anim-rise mt-7 max-w-[33rem] text-lg leading-relaxed text-fog sm:text-xl">
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

          <ul style={delay(0.55)} className="anim-rise mt-9 flex flex-wrap gap-x-6 gap-y-3" aria-label="Lo que incluye trabajar con nosotros">
            {hero.chips.map((chip) => (
              <li key={chip} className="inline-flex items-center gap-2 text-[0.95rem] font-semibold text-white/90">
                <span className="flex size-5 items-center justify-center rounded-full bg-accent text-ink">
                  <Check className="size-3" aria-hidden="true" strokeWidth={3.5} />
                </span>
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div style={delay(0.2)} className="anim-pop relative mx-auto w-full max-w-[23rem] lg:max-w-[25rem]">
          {/* Marco dorado desplazado detrás de la foto */}
          <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2.5rem] border border-accent/70" />
          <TiltFrame src={asset(hero.foto)} alt={hero.fotoAlt} width={720} height={900} />

          <div className="anim-float absolute top-6 -right-2 sm:-right-6">
            <p className="flex items-center gap-2 rounded-full bg-surface py-2 pr-4 pl-3 text-xs font-bold text-ink shadow-lift sm:text-sm">
              <span className="relative flex size-2.5" aria-hidden="true">
                <span className="absolute inset-0 animate-ping-slow rounded-full bg-whatsapp-brand" />
                <span className="relative size-2.5 rounded-full bg-whatsapp-brand" />
              </span>
              {hero.badgeFlotante}
            </p>
          </div>

          <div className="absolute -bottom-8 -left-3 w-[min(18.5rem,92%)] rounded-3xl bg-surface p-4 text-ink shadow-lift sm:-left-10">
            <div className="flex items-center gap-2">
              <div className="flex" role="img" aria-label={site.a11y.estrellas(google.calificacion)}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-4 fill-accent text-accent" aria-hidden="true" />
                ))}
              </div>
              <p className="text-sm font-bold">{google.calificacion.toFixed(1)} en Google Maps</p>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex -space-x-2" aria-hidden="true">
                {(avatares.length ? avatares : [null, null, null]).map((ini, i) => (
                  <span
                    key={i}
                    className="flex size-9 items-center justify-center rounded-full border-2 border-surface bg-primary text-xs font-bold text-white even:bg-accent-deep"
                  >
                    {ini ?? <UserRound className="size-4" />}
                  </span>
                ))}
              </div>
              <p className="text-sm leading-tight text-muted">
                <strong className="font-title text-base font-extrabold text-ink">
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
        className="mx-auto mt-16 flex w-fit flex-col items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/75 hover:text-white"
      >
        {hero.scroll}
        <span aria-hidden="true" className="anim-bounce flex size-9 items-center justify-center rounded-full border border-white/30">
          <ArrowDown className="size-4" />
        </span>
      </a>
    </section>
  );
}
