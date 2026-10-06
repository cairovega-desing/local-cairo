import { marquee } from "@/data/content";
import { Sparkle } from "./Tooth";

/** Cinta infinita con los tratamientos. Puramente decorativa (el contenido real está en la sección Tratamientos). */
export default function Marquee() {
  const items = [...marquee, ...marquee];
  return (
    <div aria-hidden="true" className="relative z-10 -rotate-1 bg-navy py-5 shadow-2xl shadow-navy/20">
      <div className="mask-fade-x flex overflow-hidden">
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10 [--marquee-duration:35s]">
          {items.map((item, i) => (
            <span key={`${item}-${i}`} className="flex items-center gap-10 whitespace-nowrap">
              <span className="font-display text-2xl italic text-white sm:text-3xl">{item}</span>
              <Sparkle className="h-5 w-5 text-mint" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
