import { site, whatsappUrl } from "@/content/site";
import { buttonClass } from "../ui/Button";
import { BeforeAfter } from "../ui/BeforeAfter";
import { ExternalLink } from "../ui/ExternalLink";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function BeforeAfterSection() {
  const { antesDespues: ad } = site;
  const labels = { antes: ad.etiquetaAntes, despues: ad.etiquetaDespues, ayuda: ad.ayuda };
  const [vertical, horizontal] = ad.items;
  return (
    <section id="antes-despues" aria-labelledby="antes-despues-titulo" className="bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="antes-despues-titulo" title={ad.titulo} intro={ad.intro} />

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-12">
          <Reveal as="article" className="mx-auto w-full max-w-md lg:max-w-none">
            <BeforeAfter item={vertical} labels={labels} />
            <h3 className="mt-6 font-title text-2xl font-extrabold text-ink">{vertical.titulo}</h3>
            <p className="mt-2 max-w-[48ch] text-base leading-relaxed text-muted">{vertical.descripcion}</p>
          </Reveal>

          <Reveal as="article" delay={0.1} className="lg:pt-24">
            <BeforeAfter item={horizontal} labels={labels} />
            <h3 className="mt-6 font-title text-2xl font-extrabold text-ink">{horizontal.titulo}</h3>
            <p className="mt-2 max-w-[52ch] text-base leading-relaxed text-muted">{horizontal.descripcion}</p>

            <div className="mt-10 rounded-[2rem] bg-section p-7 sm:p-8">
              <p className="font-title text-xl font-extrabold text-ink sm:text-2xl">¿Querés transformar un espacio de tu casa?</p>
              <p className="mt-2 text-base text-muted">Mandanos fotos por WhatsApp y te decimos qué se puede hacer.</p>
              <ExternalLink
                href={whatsappUrl("Hola, quiero transformar un espacio de mi casa. Les mando fotos.")}
                className={buttonClass("accent", "mt-6")}
              >
                Enviar fotos por WhatsApp
              </ExternalLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
