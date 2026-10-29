import { BadgeCheck } from "lucide-react";
import { site } from "@/content/site";
import { Counter } from "../ui/Counter";
import { Pending } from "../ui/Pending";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function About() {
  const { empresa, cifras, credenciales } = site;
  const stats = [cifras.obras, cifras.m2, cifras.anios];
  return (
    <section id="empresa" aria-labelledby="empresa-titulo" className="bg-surface py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div>
          <SectionHeading id="empresa-titulo" title={empresa.titulo} />
          <Reveal delay={0.1} className="mt-8 space-y-5 text-lg leading-[1.7] text-muted">
            {empresa.parrafos.map((p) => (
              <p key={p} className="max-w-[62ch]">
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.15}>
            <h3 className="mt-10 font-wide text-lg font-bold text-ink">Registros y seguros</h3>
            <ul className="mt-4 grid gap-3">
              {credenciales.map((c) => (
                <li key={c.texto} className="flex gap-3 text-base text-ink">
                  <BadgeCheck className="size-6 shrink-0 text-primary" aria-hidden="true" />
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold">{c.texto}</span>
                    {!c.confirmado && <Pending className="text-accent-ink">{site.a11y.aConfirmar}</Pending>}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="self-end">
          <dl className="divide-y divide-line overflow-hidden rounded-[2rem] border border-line bg-white shadow-tinted">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-1 px-7 py-7 sm:px-9">
                <dt className="text-base font-semibold text-muted">{s.label}</dt>
                <dd className="font-wide-max text-5xl leading-none font-black tracking-[-0.03em] text-primary-deep sm:text-6xl">
                  <Counter cifra={s} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
