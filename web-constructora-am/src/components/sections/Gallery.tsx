import { site } from "@/content/site";
import { asset, cn } from "@/lib/utils";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function Gallery() {
  const { galeria } = site;
  return (
    <section id="nuestra-empresa" aria-labelledby="galeria-titulo" className="bg-section py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="galeria-titulo" title={galeria.titulo} intro={galeria.texto} />
        <Reveal delay={0.1}>
          <ul className="mt-12 grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:gap-4 lg:grid-cols-4">
            {galeria.items.map((img, i) => (
              <li
                key={img.etiqueta}
                className={cn(
                  "relative overflow-hidden rounded-[1.75rem] bg-primary-deep",
                  i === 0 && "col-span-2 row-span-2",
                )}
              >
                {img.src ? (
                  <img
                    src={asset(img.src)}
                    alt={img.alt}
                    width={1200}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-plano-dark p-6 text-center font-semibold text-fog">
                    Imagen pendiente: {img.etiqueta}
                  </div>
                )}
                <span className="absolute bottom-3 left-3 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-bold text-ink shadow-tinted sm:text-sm">
                  {img.etiqueta}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
