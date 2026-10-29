import { site, whatsappUrl } from "@/content/site";
import { buttonClass } from "../ui/Button";
import { ExternalLink } from "../ui/ExternalLink";
import { LogoMark } from "../ui/Logo";
import { Reveal } from "../ui/Reveal";

export function FinalCta() {
  const { ctaFinal } = site;
  return (
    <section aria-labelledby="cta-final-titulo" className="on-dark relative isolate mt-4 overflow-hidden bg-navy py-28 text-white sm:py-36">
      <LogoMark uid="cta-agua" className="pointer-events-none absolute -right-20 -bottom-16 -z-10 w-[44rem] max-w-none opacity-[0.12]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <span aria-hidden="true" className="bg-gold mb-8 block h-1 w-20 rounded-full" />
          <h2 id="cta-final-titulo" className="font-title-xl text-[clamp(2.8rem,11vw,7rem)] leading-[0.98] font-bold text-white">
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
