import { site } from "@/content/site";
import { asset } from "@/lib/utils";
import { buttonClass } from "../ui/Button";
import { InstagramIcon } from "../ui/BrandIcons";
import { ExternalLink } from "../ui/ExternalLink";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function Portfolio() {
  const { obras, redes } = site;
  return (
    <section id="obras" aria-labelledby="obras-titulo" className="bg-section py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading id="obras-titulo" title={obras.titulo} intro={obras.intro} />
        <Reveal delay={0.1}>
          <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {obras.items.map((o) => (
              <li key={o.alt} className="group relative overflow-hidden rounded-2xl bg-sand shadow-tinted sm:rounded-3xl">
                {o.src ? (
                  <img
                    src={asset(o.src)}
                    alt={o.alt}
                    width={800}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center p-4 text-center text-sm font-semibold text-muted">
                    Imagen pendiente: {o.alt}
                  </div>
                )}
                {/* Descripción al pasar el mouse (el alt ya la anuncia a lectores de pantalla) */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink/85 to-transparent p-3 pt-10 text-xs leading-snug font-semibold text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:text-sm motion-reduce:transition-none"
                >
                  {o.alt}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
        {redes.instagram && (
          <Reveal className="mt-10 flex justify-center">
            <ExternalLink href={redes.instagram} className={buttonClass("dark")}>
              <InstagramIcon className="size-5" />
              {obras.ctaInstagram}
            </ExternalLink>
          </Reveal>
        )}
      </div>
    </section>
  );
}
