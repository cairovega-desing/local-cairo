import { site, whatsappUrl } from "@/content/site";
import { buttonClass } from "../ui/Button";
import { Cota } from "../ui/Cota";
import { ExternalLink } from "../ui/ExternalLink";
import { Reveal } from "../ui/Reveal";

export function FinalCta() {
  const { ctaFinal } = site;
  return (
    <section aria-labelledby="cta-final-titulo" className="bg-surface bg-plano py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <Cota label={site.zona} className="mb-8 text-primary/70" />
          <h2
            id="cta-final-titulo"
            className="font-title-xl text-[clamp(3rem,13vw,9rem)] leading-[0.88] font-black tracking-[-0.045em] text-ink"
          >
            {ctaFinal.lineas.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h2>
          <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-lg text-muted">{site.marca.slogan}</p>
            <ExternalLink href={whatsappUrl()} className={buttonClass("accent", "min-h-16 px-9 text-lg")}>
              {ctaFinal.boton}
            </ExternalLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
