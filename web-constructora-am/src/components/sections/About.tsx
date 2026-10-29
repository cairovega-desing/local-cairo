import { BadgeCheck } from "lucide-react";
import { site } from "@/content/site";
import { Counter } from "../ui/Counter";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function About() {
  const { empresa, cifras } = site;
  // Solo se publican los registros confirmados (los demás quedan ocultos hasta confirmarlos en site.ts).
  const credenciales = site.credenciales.filter((c) => c.confirmado);
  const stats = [cifras.obras, cifras.m2, cifras.anios];
  return (
    <section id="empresa" aria-labelledby="empresa-titulo" className="bg-surface py-24 sm:py-32">
      <div
        className={
          "mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:gap-20 " + (credenciales.length ? "lg:grid-cols-[1.2fr_0.8fr]" : "")
        }
      >
        <div>
          <SectionHeading id="empresa-titulo" title={empresa.titulo} />
          <Reveal delay={0.1} className="mt-7 space-y-5 text-lg leading-[1.7] text-muted">
            {empresa.parrafos.map((p) => (
              <p key={p} className="max-w-[60ch]">
                {p}
              </p>
            ))}
          </Reveal>
        </div>

        {credenciales.length > 0 && (
        <Reveal delay={0.15} className="self-end">
          <div className="rounded-[2rem] border border-accent/30 bg-section p-7 sm:p-8">
            <h3 className="font-title text-lg font-bold text-ink">Registros y seguros</h3>
            <ul className="mt-5 grid gap-4">
              {credenciales.map((c) => (
                <li key={c.texto} className="flex gap-3 text-base text-ink">
                  <BadgeCheck className="size-6 shrink-0 text-accent-deep" aria-hidden="true" />
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold">{c.texto}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        )}
      </div>

      {/* Cifras */}
      <Reveal delay={0.1} className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <dl className="on-dark grid overflow-hidden rounded-[2rem] bg-navy text-white shadow-lift sm:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={
                "flex flex-col-reverse gap-2 px-8 py-10 text-center " +
                (i > 0 ? "border-t border-accent/20 sm:border-t-0 sm:border-l" : "")
              }
            >
              <dt className="text-base font-semibold text-fog">{s.label}</dt>
              <dd className="font-title-xl text-[2.6rem] leading-none font-bold whitespace-nowrap text-accent-light lg:text-[3.2rem]">
                <Counter cifra={s} />
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
