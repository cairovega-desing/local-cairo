import { Asterisk } from "lucide-react";
import { site } from "@/content/site";

/** Banda inclinada con los servicios en loop infinito. Solo CSS (se frena con reduced-motion). */
export function ServiceMarquee() {
  const items = site.servicios.items.map((s) => s.titulo);
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t} className="flex items-center">
          <span className="px-7 font-title text-2xl font-semibold whitespace-nowrap text-white italic sm:text-3xl">
            {t}
          </span>
          <Asterisk className="size-5 text-accent" aria-hidden="true" strokeWidth={3} />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="relative z-10 -my-8 overflow-hidden py-6" role="region" aria-label="Nuestros servicios">
      <div className="-mx-4 -rotate-1 border-y border-accent/70 bg-navy py-5 shadow-lift">
        <div className="mask-fade-x flex overflow-hidden">
          <div className="animate-marquee flex w-max" style={{ ["--marquee-duration" as string]: "35s" }}>
            {row(false)}
            {row(true)}
          </div>
        </div>
      </div>
    </div>
  );
}
