import { MapPin, Phone } from "lucide-react";
import { direccionTexto, site, whatsappUrl } from "@/content/site";
import { InstagramIcon, WhatsAppIcon } from "./ui/BrandIcons";
import { ExternalLink } from "./ui/ExternalLink";
import { Logo } from "./ui/Logo";

export function Footer() {
  const { footer, contacto, redes, marca } = site;
  const year = new Date().getFullYear();
  const link = "text-fog transition-colors hover:text-surface";
  return (
    <footer className="bg-ink text-surface">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-fog">{marca.slogan}</p>
          <div className="mt-6 flex gap-2">
            <ExternalLink href={whatsappUrl()} className="flex size-11 items-center justify-center rounded-full bg-white/10 hover:bg-whatsapp" aria-label={`WhatsApp ${site.a11y.nuevaPestana}`}>
              <WhatsAppIcon className="size-5" />
            </ExternalLink>
            {redes.instagram && (
              <ExternalLink href={redes.instagram} className="flex size-11 items-center justify-center rounded-full bg-white/10 hover:bg-primary" aria-label={`Instagram ${site.a11y.nuevaPestana}`}>
                <InstagramIcon className="size-5" />
              </ExternalLink>
            )}
          </div>
        </div>

        <nav aria-labelledby="footer-empresa">
          <h2 id="footer-empresa" className="font-title font-bold">
            {footer.columnas.empresa}
          </h2>
          <ul className="mt-4 grid gap-2.5">
            {site.nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className={link}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-title font-bold">{footer.columnas.servicios}</h2>
          <ul className="mt-4 grid gap-2.5">
            {site.servicios.items.map((s) => (
              <li key={s.id}>
                <a href="#servicios" className={link}>
                  {s.titulo}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-title font-bold">{footer.columnas.contacto}</h2>
          <ul className="mt-4 grid gap-3">
            <li className="flex gap-2 text-fog">
              <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              {direccionTexto}
            </li>
            <li>
              <a href={`tel:${contacto.telefonoInternacional}`} className={`${link} flex gap-2`}>
                <Phone className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                {contacto.telefono}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-fog sm:px-6">
          © <span suppressHydrationWarning>{year}</span> {marca.nombre}. {footer.derechos}
        </p>
      </div>
    </footer>
  );
}
