import { Clock, ExternalLink, MapPin, Phone } from "lucide-react";
import {
  business,
  googleMapsEmbedUrl,
  googleMapsUrl,
  location,
  ui,
} from "@/data/content";
import { OpenNow } from "./OpenNow";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export default function Location() {
  return (
    <section
      id="ubicacion"
      aria-labelledby="location-title"
      className="bg-section py-24 md:py-32"
    >
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="location-title"
            eyebrow={location.eyebrow}
            title={location.title}
            description={location.description}
          />
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-10">
          {/* En mobile el mapa va arriba, la info abajo */}
          <Reveal className="h-full">
            <div className="h-80 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl shadow-primary-deep/10 lg:h-full lg:min-h-[28rem]">
              <iframe
                title={location.mapTitle}
                src={googleMapsEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>

          <Reveal delay={0.15} className="h-full">
            <div className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-xl shadow-primary-deep/5 sm:p-8">
              <div className="flex gap-4">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-deep to-accent text-white shadow-md shadow-primary/30"
                  aria-hidden="true"
                >
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{location.addressLabel}</h3>
                  <p className="mt-1 text-muted">{business.address.full}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-deep to-accent text-white shadow-md shadow-primary/30"
                  aria-hidden="true"
                >
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{location.contactLabel}</h3>
                  <a
                    href={business.phoneHref}
                    className="mt-1 inline-block text-muted transition-colors hover:text-primary-deep"
                  >
                    {business.phone}
                  </a>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-deep to-accent text-white shadow-md shadow-primary/30"
                  aria-hidden="true"
                >
                  <Clock className="h-5 w-5" />
                </span>
                <div className="w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-ink">{location.hoursLabel}</h3>
                    <OpenNow />
                  </div>
                  <table className="mt-2 w-full text-left">
                    <caption className="sr-only">{location.hoursLabel}</caption>
                    <tbody className="divide-y divide-line">
                      {business.hours.map((row) => (
                        <tr key={row.label}>
                          <th
                            scope="row"
                            className="py-2 pr-4 text-sm font-medium text-ink"
                          >
                            {row.label}
                          </th>
                          <td className="py-2 text-right text-sm text-muted">
                            {row.time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-8 w-full sm:w-auto sm:self-start"
              >
                {location.mapCta}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{ui.newTab}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
