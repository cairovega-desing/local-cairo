import { site } from "@/content/site";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function Process() {
  const { pasos } = site;
  return (
    <section id="como-trabajamos" aria-labelledby="pasos-titulo" className="bg-surface bg-plano py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="pasos-titulo" title={pasos.titulo} intro={pasos.intro} />
        <ol className="relative mt-14 grid gap-10 lg:grid-cols-4 lg:gap-6">
          {/* Línea conectora: vertical en mobile, horizontal en escritorio. */}
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-7 w-0.5 bg-line lg:top-7 lg:right-[12%] lg:bottom-auto lg:left-[12%] lg:h-0.5 lg:w-auto" />
          {pasos.items.map((p, i) => (
            <Reveal as="li" key={p.titulo} delay={i * 0.1} className="relative flex gap-5 lg:flex-col lg:items-center lg:text-center">
              <span className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-surface bg-ink font-title text-lg font-black text-accent shadow-tinted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-title text-xl font-extrabold text-ink lg:mt-5">{p.titulo}</h3>
                <p className="mt-2 max-w-[28ch] text-base leading-relaxed text-muted lg:mx-auto">{p.texto}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
