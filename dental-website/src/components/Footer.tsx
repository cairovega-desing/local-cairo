import { ArrowUpRight, Mail, MapPin, Phone, Smile } from "lucide-react";
import { business, footer, treatments, whatsappUrl } from "@/data/content";

// lucide-react v1 ya no incluye íconos de marcas: SVG propios.
function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const linkClass =
  "inline-block py-1 text-white/70 transition-colors duration-300 hover:text-white";

export default function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-navy text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[50rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="container-page relative flex flex-col items-start justify-between gap-8 border-b border-white/10 py-16 md:flex-row md:items-end">
        <p className="font-display text-5xl font-medium leading-none tracking-tight sm:text-7xl">
          {footer.bigLine.split(" ").slice(0, -1).join(" ")}{" "}
          <em className="italic text-mint">{footer.bigLine.split(" ").slice(-1)}</em>
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 font-semibold text-navy transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-mint/20"
        >
          {footer.cta}
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-deep to-accent text-white transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </span>
        </a>
      </div>
      <div className="container-page relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <a href="#inicio" className="flex items-center gap-2 text-lg font-bold">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-deep to-accent text-white"
              aria-hidden="true"
            >
              <Smile className="h-5 w-5" />
            </span>
            {business.shortName}
          </a>
          <p className="mt-4 max-w-xs text-white/70">{footer.slogan}</p>
          <div className="mt-6 flex items-center gap-3">
            {business.instagram.url ? (
              <a
                href={business.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={footer.socialLabel.instagram}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 hover:-translate-y-0.5 hover:bg-mint hover:text-navy"
              >
                <InstagramIcon />
              </a>
            ) : null}
            <a
              href={business.facebook.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={footer.socialLabel.facebook}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 hover:-translate-y-0.5 hover:bg-mint hover:text-navy"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>

        <nav aria-label={footer.siteLinksTitle}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">
            {footer.siteLinksTitle}
          </h2>
          <ul className="mt-4 space-y-1">
            {footer.siteLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={footer.treatmentsTitle}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">
            {footer.treatmentsTitle}
          </h2>
          <ul className="mt-4 space-y-1">
            {treatments.map((treatment) => (
              <li key={treatment.id}>
                <a href="#tratamientos" className={linkClass}>
                  {treatment.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">
            {footer.contactTitle}
          </h2>
          <ul className="mt-4 space-y-3 text-white/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{business.address.full}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <a href={business.phoneHref} className="transition-colors hover:text-white">
                {business.phone}
              </a>
            </li>
            {business.email ? (
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${business.email}`}
                  className="break-all transition-colors hover:text-white"
                >
                  {business.email}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <p className="container-page py-6 text-sm text-white/60">
          {footer.copyright}
        </p>
      </div>
    </footer>
  );
}
