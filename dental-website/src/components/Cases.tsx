import { ArrowUpRight } from "lucide-react";
import { business, cases, ui } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export default function Cases() {
  return (
    <section
      id="casos"
      aria-labelledby="cases-title"
      className="relative overflow-hidden bg-white py-24 md:py-32"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-mint/20 blur-3xl" />
      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            id="cases-title"
            eyebrow={cases.eyebrow}
            title={cases.title}
            description={cases.description}
          />
        </Reveal>

        <ul className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {cases.images.map((image, index) => (
            <li key={image.src}>
              <Reveal delay={(index % 5) * 0.06}>
                <figure className="group overflow-hidden rounded-2xl bg-section shadow-md shadow-primary-deep/10 ring-1 ring-line transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={206}
                    height={206}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>

        {business.instagram.url ? (
          <Reveal className="mt-10 flex justify-center">
            <a
              href={business.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              {cases.more}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{ui.newTab}</span>
            </a>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
