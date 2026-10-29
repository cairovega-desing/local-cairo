import { site, whatsappUrl } from "@/content/site";
import { asset } from "@/lib/utils";
import { buttonClass } from "../ui/Button";
import { ExternalLink } from "../ui/ExternalLink";
import { Reveal } from "../ui/Reveal";

export function FinalCta() {
  const { ctaFinal } = site;
  return (
    <section aria-labelledby="cta-final-titulo" className="on-dark relative isolate mt-4 overflow-hidden bg-primary-deep py-28 text-white sm:py-40">
      <img
        src={asset(ctaFinal.fondo)}
        alt={ctaFinal.fondoAlt}
        width={1600}
        height={900}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-ink/95 via-primary-deep/85 to-ink/70" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <span aria-hidden="true" className="mb-8 block h-0.5 w-20 rounded-full bg-accent" />
          <h2 id="cta-final-titulo" className="font-title-xl text-[clamp(3rem,12vw,8rem)] leading-[0.92] font-extrabold text-white">
            {ctaFinal.lineas.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h2>
          <div className="mt-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-lg text-fog">{site.marca.slogan}</p>
            <ExternalLink href={whatsappUrl()} className={buttonClass("accent", "min-h-16 px-9 text-lg")}>
              {ctaFinal.boton}
            </ExternalLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
