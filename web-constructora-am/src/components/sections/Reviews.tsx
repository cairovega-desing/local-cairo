import { Quote, Star } from "lucide-react";
import { resenaUrl, site, type Resena } from "@/content/site";
import { buttonClass } from "../ui/Button";
import { ExternalLink } from "../ui/ExternalLink";
import { Reveal } from "../ui/Reveal";

type Card = Resena & { pendiente?: boolean };

const PLACEHOLDERS: Card[] = Array.from({ length: 4 }, (_, i) => ({
  nombre: `Cliente ${i + 1}`,
  texto: "Acá va una reseña real de Google Maps. Copiá el texto, el nombre y la antigüedad en src/content/site.ts.",
  antiguedad: "—",
  pendiente: true,
}));

function ReviewCard({ r }: { r: Card }) {
  return (
    <figure
      className={
        "flex w-[19rem] shrink-0 flex-col rounded-[1.75rem] p-6 sm:w-[23rem] " +
        (r.pendiente ? "border-2 border-dashed border-white/20 bg-white/[0.03]" : "border border-white/10 bg-white/[0.06]")
      }
    >
      <div className="flex items-center justify-between">
        <Quote className="size-7 text-accent" aria-hidden="true" />
        {r.pendiente && (
          <span className="rounded-full border border-dashed border-accent/60 px-2 py-0.5 text-xs font-semibold text-accent">
            {site.a11y.pendiente}
          </span>
        )}
      </div>
      <blockquote className="mt-4 flex-1 text-[0.98rem] leading-relaxed text-surface/90">{r.texto}</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-full bg-primary font-title font-bold text-white"
        >
          {r.pendiente ? "?" : r.nombre.trim()[0]?.toUpperCase()}
        </span>
        <span>
          <span className="block font-bold text-surface">{r.nombre}</span>
          <span className="block text-sm text-fog">{r.antiguedad}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function MarqueeRow({ items, reverse }: { items: Card[]; reverse?: boolean }) {
  // Se repite el contenido para que el loop no tenga cortes; la copia queda oculta a lectores de pantalla.
  const base = items.length < 4 ? [...items, ...items, ...items] : items;
  return (
    <div className="pause-on-hover mask-fade-x overflow-hidden motion-reduce:overflow-x-auto">
      <div
        className={(reverse ? "animate-marquee-reverse" : "animate-marquee") + " flex w-max"}
        style={{ ["--marquee-duration" as string]: `${Math.max(40, base.length * 10)}s` }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-4 pr-4" aria-hidden={copy === 1 || undefined}>
            {base.map((r, i) => (
              <ReviewCard key={`${copy}-${i}`} r={r} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Reviews() {
  const { resenas, google } = site;
  const cards: Card[] = resenas.items.length ? resenas.items : PLACEHOLDERS;
  const mitad = Math.ceil(cards.length / 2);
  const fila1 = cards.length > 3 ? cards.slice(0, mitad) : cards;
  const fila2 = cards.length > 3 ? cards.slice(mitad) : [...cards].reverse();

  return (
    <section id="opiniones" aria-labelledby="opiniones-titulo" className="relative overflow-hidden bg-ink py-24 text-surface sm:py-32">
      <div className="bg-plano-dark absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="opiniones-titulo" className="font-title text-[2rem] leading-[1.02] font-extrabold tracking-[-0.02em] sm:text-5xl">
              {resenas.titulo}
            </h2>
            <p className="mt-4 text-lg text-fog">{resenas.bajada}</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="font-title-xl text-7xl leading-none font-black text-accent sm:text-8xl">
              {google.calificacion.toFixed(1)}
            </p>
            <div className="flex" role="img" aria-label={site.a11y.estrellas(google.calificacion)}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-6 fill-accent text-accent" aria-hidden="true" />
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="relative mt-14 grid gap-4">
        <MarqueeRow items={fila1} />
        <MarqueeRow items={fila2} reverse />
      </div>

      <div className="relative mt-12 flex justify-center px-4">
        <ExternalLink href={resenaUrl} className={buttonClass("accent")}>
          {resenas.cta}
        </ExternalLink>
      </div>
    </section>
  );
}
