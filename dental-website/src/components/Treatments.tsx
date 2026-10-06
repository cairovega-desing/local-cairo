import {
  Activity,
  ArrowUpRight,
  Baby,
  Check,
  Clock,
  ShieldCheck,
  Smile,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { treatments, treatmentsSection, whatsappUrl } from "@/data/content";
import type { TreatmentIcon } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { SpotlightCard } from "./SpotlightCard";

const icons: Record<TreatmentIcon, LucideIcon> = {
  smile: Smile,
  sparkles: Sparkles,
  implant: Wrench,
  activity: Activity,
  baby: Baby,
  shield: ShieldCheck,
};

export default function Treatments() {
  return (
    <section
      id="tratamientos"
      aria-labelledby="treatments-title"
      className="relative overflow-hidden bg-surface py-24 md:py-32"
    >
      <div aria-hidden="true" className="bg-dots pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-mint/20 blur-3xl" />

      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            id="treatments-title"
            eyebrow={treatmentsSection.eyebrow}
            title={treatmentsSection.title}
            description={treatmentsSection.description}
          />
        </Reveal>

        <ul className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {treatments.map((treatment, index) => {
            const Icon = icons[treatment.icon];
            return (
              <li key={treatment.id}>
                <Reveal delay={(index % 3) * 0.12} className="h-full">
                  <SpotlightCard className="h-full rounded-3xl border border-line bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary-deep/10">
                    <span
                      aria-hidden="true"
                      className="absolute right-6 top-4 font-display text-6xl font-semibold text-section transition-colors duration-500 group-hover:text-primary/15"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-deep to-accent text-white shadow-lg shadow-primary/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                        aria-hidden="true"
                      >
                        <Icon className="h-7 w-7" />
                      </span>
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-medium text-ink">
                      {treatment.title}
                    </h3>
                    <p className="mt-2 text-muted">{treatment.description}</p>
                    <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary-deep">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">{treatmentsSection.durationLabel}:</span>
                      {treatment.duration}
                    </span>
                    <p className="sr-only">{treatmentsSection.includesLabel}:</p>
                    <ul className="mt-6 flex-1 space-y-2.5 border-t border-dashed border-line pt-6">
                      {treatment.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-ink/80">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-mint/40 text-primary-deep">
                            <Check className="h-3 w-3" aria-hidden="true" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep"
                    >
                      {treatmentsSection.cta}
                      <span className="sr-only">: {treatment.title}</span>
                      <ArrowUpRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </SpotlightCard>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
