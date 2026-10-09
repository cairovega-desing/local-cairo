import { ExternalLink, Quote, Star } from "lucide-react";
import type { Testimonial } from "@/data/content";
import {
  googleMapsUrl,
  testimonials,
  testimonialsSection,
  ui,
} from "@/data/content";
import { cn } from "@/lib/utils";
import { Counter } from "./Counter";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const avatarColors = [
  "from-primary to-accent",
  "from-accent to-mint",
  "from-peach to-primary",
  "from-primary-deep to-primary",
  "from-mint to-primary-deep",
];

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  return (
    <article className="relative flex w-[20rem] shrink-0 flex-col rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-mint/40 hover:bg-white/10 sm:w-[24rem]">
      <Quote className="absolute right-6 top-6 h-8 w-8 text-white/10" aria-hidden="true" />
      <div role="img" aria-label={ui.starsLabel} className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 leading-relaxed text-white/85">
        {testimonial.text}
      </blockquote>
      <footer className="mt-6 flex items-center gap-3">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-lg font-semibold text-white",
            avatarColors[index % avatarColors.length],
          )}
          aria-hidden="true"
        >
          {testimonial.name.charAt(0)}
        </span>
        <div>
          <p className="font-semibold text-white">{testimonial.name}</p>
          <p className="text-sm text-white/60">{testimonial.time}</p>
        </div>
      </footer>
    </article>
  );
}

/** Fila que se desliza sola; la segunda copia es solo visual para que el loop sea continuo. */
function Row({ items, reverse = false }: { items: Testimonial[]; reverse?: boolean }) {
  return (
    <div className="mask-fade-x group flex overflow-hidden">
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 ? true : undefined}
          className={cn(
            "flex shrink-0 animate-marquee gap-5 pr-5 [--marquee-duration:60s] group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {items.map((testimonial) => (
            <li key={testimonial.name}>
              <TestimonialCard
                testimonial={testimonial}
                index={testimonials.indexOf(testimonial)}
              />
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export default function Testimonials() {
  // Segunda fila con otro orden para que no se vean iguales
  const shifted = [...testimonials.slice(2), ...testimonials.slice(0, 2)];

  return (
    <section
      id="opiniones"
      aria-labelledby="testimonials-title"
      className="on-dark relative overflow-hidden bg-navy py-24 md:py-32"
    >
      <div aria-hidden="true" className="bg-grid-dark pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />

      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            id="testimonials-title"
            eyebrow={testimonialsSection.eyebrow}
            title={testimonialsSection.title}
            dark
          />
          <div className="mt-10 flex flex-col items-center gap-2">
            <p className="flex items-center gap-4">
              <Counter
                value="5.0"
                className="font-display text-6xl font-semibold text-white sm:text-7xl"
              />
              <span className="flex gap-1" role="img" aria-label={ui.starsLabel}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400 sm:h-7 sm:w-7" aria-hidden="true" />
                ))}
              </span>
            </p>
            <p className="text-sm text-white/60">{testimonialsSection.ratingCaption}</p>
          </div>
        </Reveal>
      </div>

      <div
        role="region"
        aria-label={testimonialsSection.scrollRegionLabel}
        className="relative mt-14 space-y-5"
      >
        <Row items={testimonials} />
        <div aria-hidden="true">
          <Row items={shifted} reverse />
        </div>
      </div>

      <Reveal className="relative mt-12 flex justify-center px-4">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-mint/50 hover:bg-white/15"
        >
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="font-semibold">{testimonialsSection.googleBadge}</span>
          <span className="hidden text-sm text-mint sm:inline">
            {testimonialsSection.googleLinkLabel}
          </span>
          <ExternalLink className="h-4 w-4 text-mint" aria-hidden="true" />
          <span className="sr-only">{ui.newTab}</span>
        </a>
      </Reveal>
    </section>
  );
}
