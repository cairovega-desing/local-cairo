import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

/** Título de sección con el id que usa aria-labelledby. */
export function SectionHeading({
  id,
  title,
  intro,
  tone = "dark",
  className,
}: {
  id: string;
  title: string;
  intro?: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-2xl", className)}>
      <h2
        id={id}
        className={cn(
          "font-wide text-[2rem] leading-[1.02] font-extrabold tracking-[-0.02em] text-balance sm:text-5xl",
          tone === "dark" ? "text-ink" : "text-surface",
        )}
      >
        {title}
      </h2>
      {intro && (
        <p className={cn("mt-4 max-w-xl text-lg leading-relaxed", tone === "dark" ? "text-muted" : "text-fog")}>
          {intro}
        </p>
      )}
    </Reveal>
  );
}
