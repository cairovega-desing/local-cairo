import { ArrowDown, Check, Star, UserRound } from "lucide-react";
import { site, whatsappUrl } from "@/content/site";
import type { CSSProperties } from "react";
import { asset, iniciales } from "@/lib/utils";
import { buttonClass } from "../ui/Button";
import { Cota } from "../ui/Cota";
import { ExternalLink } from "../ui/ExternalLink";
import { TiltFrame } from "../ui/TiltFrame";

const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

/**
 * Hero sin JavaScript para las entradas: son animaciones CSS, así el texto (LCP)
 * se pinta antes de que React termine de cargar.
 */
export function Hero() {
  const { hero, google, cifras, responsable, resenas } = site;
  const avatares = resenas.items.slice(0, 3).map((r) => iniciales(r.nombre));

  // Cada palabra entra desde abajo, una detrás de otra.
  let wordIndex = 0;

  return (
    <section
      id="inicio"
      aria-labelledby="hero-titulo"
      className="relative isolate overflow-hidden bg-surface bg-plano pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-section/80 to-transparent"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
        <div>
          <p
            style={delay(0)}
            className="anim-rise inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 py-1.5 pr-4 pl-2 text-sm font-semibold text-ink shadow-tinted"
          >
            <span className="size-2.5 rounded-full bg-accent ring-4 ring-accent/25" aria-hidden="true" />
            {hero.badge}
          </p>

          <h1
            id="hero-titulo"
            className="mt-6 font-wide-max text-[clamp(2.6rem,11.5vw,4.4rem)] lg:text-[4.5rem] leading-[0.92] font-black tracking-[-0.035em] text-ink"
          >
            {hero.titular.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
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

          <p style={delay(0.35)} className="anim-rise mt-6 max-w-[34rem] text-lg leading-relaxed text-muted sm:text-xl">
            {hero.bajada}
          </p>

          <div style={delay(0.45)} className="anim-rise mt-8 flex flex-col gap-3 sm:flex-row">
            <ExternalLink href={whatsappUrl()} className={buttonClass("accent", "min-h-14 px-7 text-base")}>
              {hero.ctaPrincipal}
            </ExternalLink>
            <a href="#servicios" className={buttonClass("outline", "min-h-14 px-7 text-base")}>
              {hero.ctaSecundario}
            </a>
          </div>

          <ul style={delay(0.55)} className="anim-rise mt-8 flex flex-wrap gap-2" aria-label="Lo que incluye trabajar con nosotros">
            {hero.chips.map((chip) => (
              <li
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-3.5 py-2 text-sm font-semibold text-ink"
              >
                <Check className="size-4 text-primary" aria-hidden="true" strokeWidth={3} />
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div style={delay(0.2)} className="anim-pop relative mx-auto w-full max-w-[26rem] pl-6 lg:max-w-none"
        >
          <Cota label="4,00" className="mb-3 text-primary/70" />
          <div className="relative">
            <div className="absolute top-0 bottom-0 -left-6 w-3 text-primary/70">
              <Cota vertical label="5,00" />
            </div>
            <TiltFrame src={asset(responsable.foto)} alt={responsable.fotoAlt} width={960} height={1200} />

            {/* Badge flotante */}
            <div className="anim-float absolute top-5 right-3 sm:-right-5">
              <p className="flex items-center gap-2 rounded-full bg-ink py-2 pr-4 pl-3 text-xs font-bold text-surface shadow-lift sm:text-sm">
                <span className="relative flex size-2.5" aria-hidden="true">
                  <span className="absolute inset-0 animate-ping-slow rounded-full bg-accent" />
                  <span className="relative size-2.5 rounded-full bg-accent" />
                </span>
                {hero.badgeFlotante}
              </p>
            </div>

            {/* Tarjeta de calificación */}
            <div className="absolute -bottom-8 -left-4 w-[min(19rem,90%)] rounded-3xl border border-ink/10 bg-surface/95 p-4 shadow-lift backdrop-blur sm:-left-10">
              <div className="flex items-center gap-2">
                <div className="flex" role="img" aria-label={site.a11y.estrellas(google.calificacion)}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-4 fill-accent text-accent" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm font-bold text-ink">
                  {google.calificacion.toFixed(1)} en Google Maps
                </p>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex -space-x-2" aria-hidden="true">
                  {(avatares.length ? avatares : [null, null, null]).map((ini, i) => (
                    <span
                      key={i}
                      className="flex size-9 items-center justify-center rounded-full border-2 border-surface bg-primary text-xs font-bold text-white odd:bg-primary-deep"
                    >
                      {ini ?? <UserRound className="size-4" />}
                    </span>
                  ))}
                </div>
                <p className="text-sm leading-tight text-muted">
                  <strong className="font-wide text-base text-ink">
                    {cifras.obras.prefijo}
                    {cifras.obras.valor}
                  </strong>{" "}
                  obras entregadas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#experiencia"
        className="mx-auto mt-20 flex w-fit flex-col items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-ink lg:mt-16"
      >
        {hero.scroll}
        <span
          aria-hidden="true"
          className="anim-bounce flex size-9 items-center justify-center rounded-full border border-ink/15"
        >
          <ArrowDown className="size-4" />
        </span>
      </a>
    </section>
  );
}
