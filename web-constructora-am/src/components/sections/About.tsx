import { BadgeCheck } from "lucide-react";
import { site } from "@/content/site";
import { asset } from "@/lib/utils";
import { Counter } from "../ui/Counter";
import { Pending } from "../ui/Pending";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function About() {
  const { empresa, cifras, credenciales } = site;
  const stats = [cifras.obras, cifras.m2, cifras.anios];
  const [principal, secundaria] = empresa.fotos;
  return (
    <section id="empresa" aria-labelledby="empresa-titulo" className="bg-surface py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">
        {/* Collage de fotos con marco dorado */}
        <Reveal className="relative mx-auto w-full max-w-md pr-10 pb-16 lg:max-w-none">
          <div aria-hidden="true" className="absolute top-8 left-8 h-[70%] w-[75%] rounded-[2.5rem] border border-accent/70" />
          <img
            src={asset(principal.src)}
            alt={principal.alt}
            width={900}
            height={900}
            loading="lazy"
            decoding="async"
            className="relative aspect-[4/5] w-[82%] rounded-[2.5rem] object-cover shadow-lift"
          />
          <img
            src={asset(secundaria.src)}
            alt={secundaria.alt}
            width={900}
            height={900}
            loading="lazy"
            decoding="async"
            className="absolute right-0 bottom-0 aspect-square w-[52%] rounded-[2rem] border-[6px] border-surface object-cover shadow-lift"
          />
        </Reveal>

        <div>
          <SectionHeading id="empresa-titulo" title={empresa.titulo} />
          <Reveal delay={0.1} className="mt-7 space-y-5 text-lg leading-[1.7] text-muted">
            {empresa.parrafos.map((p) => (
              <p key={p} className="max-w-[60ch]">
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.15}>
            <ul className="mt-8 grid gap-3">
              {credenciales.map((c) => (
                <li key={c.texto} className="flex gap-3 text-base text-ink">
                  <BadgeCheck className="size-6 shrink-0 text-accent-deep" aria-hidden="true" />
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold">{c.texto}</span>
                    {!c.confirmado && <Pending className="text-accent-ink">{site.a11y.aConfirmar}</Pending>}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      {/* Cifras */}
      <Reveal delay={0.1} className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <dl className="grid overflow-hidden rounded-[2rem] bg-primary-deep text-white shadow-lift sm:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={
                "flex flex-col-reverse gap-2 px-8 py-9 text-center " +
                (i > 0 ? "border-t border-white/10 sm:border-t-0 sm:border-l" : "")
              }
            >
              <dt className="text-base font-semibold text-fog">{s.label}</dt>
              <dd className="font-title-xl text-5xl leading-none font-extrabold text-accent-light sm:text-[3.4rem]">
                <Counter cifra={s} />
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
