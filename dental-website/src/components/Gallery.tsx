import {
  Armchair,
  Building2,
  MonitorSmartphone,
  Sofa,
  ToyBrick,
  type LucideIcon,
} from "lucide-react";
import { gallery } from "@/data/content";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

// Un ícono por foto, en el mismo orden que gallery.images
const icons: LucideIcon[] = [Armchair, MonitorSmartphone, Sofa, ToyBrick, Building2];

export default function Gallery() {
  return (
    <section
      id="espacio"
      aria-labelledby="gallery-title"
      className="bg-white py-24 md:py-32"
    >
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="gallery-title"
            eyebrow={gallery.eyebrow}
            title={gallery.title}
            description={gallery.description}
          />
        </Reveal>

        {/* Bento: 1 imagen grande + 4 chicas */}
        <ul className="mt-16 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {gallery.images.map((label, index) => {
            const isFeatured = index === 0;
            return (
              <li
                key={label}
                className={cn(
                  isFeatured
                    ? "col-span-2 aspect-[16/10] md:row-span-2 md:aspect-auto"
                    : "aspect-square",
                )}
              >
                <Reveal delay={index * 0.08} className="h-full">
                  <div className="group h-full overflow-hidden rounded-3xl shadow-lg shadow-primary-deep/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
                    {/* Para fotos reales: reemplazar por <Image fill className="object-cover ..." /> */}
                    <ImagePlaceholder
                      label={label}
                      icon={icons[index % icons.length]}
                      tone={index}
                      className="transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
