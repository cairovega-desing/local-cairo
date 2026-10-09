import { CheckCircle2, Quote } from "lucide-react";
import { about } from "@/data/content";
import { Counter } from "./Counter";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/** Sello circular con texto que gira. */
function RotatingBadge() {
  return (
    <div className="relative h-32 w-32" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-spin-slow">
        <defs>
          <path id="badge-circle" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
        </defs>
        <text className="fill-primary-deep text-[9.5px] font-semibold uppercase tracking-[0.2em]">
          <textPath href="#badge-circle">{about.badgeRing}</textPath>
        </text>
      </svg>
      <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-primary-deep to-accent text-white shadow-lg">
        <span className="font-display text-2xl font-semibold leading-none">{about.badgeCenter}</span>
        <span className="text-[10px] font-medium uppercase tracking-widest">{about.badgeCenterLabel}</span>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section
      id="sobre"
      aria-labelledby="about-title"
      className="relative overflow-hidden bg-white py-24 md:py-32"
    >
      <div className="container-page grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <div className="relative mx-auto max-w-md">
            <div className="aspect-[5/6] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-primary-deep/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={about.image}
                alt={about.imageLabel}
                width={250}
                height={406}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -right-4 -top-8 rounded-full bg-white p-1 shadow-xl sm:-right-10">
              <RotatingBadge />
            </div>
            <figure className="glass absolute -bottom-10 left-4 right-4 rounded-2xl p-5 sm:-left-8 sm:right-12">
              <Quote className="h-6 w-6 text-accent" aria-hidden="true" />
              <blockquote className="mt-2 font-display text-lg italic leading-snug text-ink">
                {about.quote}
              </blockquote>
              <figcaption className="mt-2 text-sm font-semibold text-primary-deep">
                — {about.quoteAuthor}
              </figcaption>
            </figure>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="order-1 lg:order-2">
          <SectionHeading
            id="about-title"
            align="left"
            eyebrow={about.eyebrow}
            title={about.title}
          />
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-3">
            {about.stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col-reverse rounded-2xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white hover:shadow-lg sm:p-5"
              >
                <dt className="mt-1 text-xs font-medium text-muted sm:text-sm">{stat.label}</dt>
                <dd className="font-display text-3xl font-semibold text-primary-deep sm:text-4xl">
                  <Counter value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>

          <ul className="mt-8 space-y-3">
            {about.credentials.map((credential) => (
              <li key={credential} className="flex items-start gap-3 text-ink">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                {credential}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
