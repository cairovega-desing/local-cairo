import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

/** Título de sección con filete dorado; el id es el que usa aria-labelledby. */
export function SectionHeading({
  id,
  title,
  intro,
  tone = "dark",
  align = "left",
  className,
}: {
  id: string;
  title: string;
  intro?: string;
  tone?: "dark" | "light";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <span aria-hidden="true" className={cn("bg-gold mb-6 block h-1 w-14 rounded-full", align === "center" && "mx-auto")} />
      <h2
        id={id}
        className={cn(
          "font-title text-[2rem] leading-[1.1] font-bold text-balance sm:text-[2.9rem]",
          tone === "dark" ? "text-ink" : "text-white",
        )}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={cn(
            "mt-5 max-w-xl text-lg leading-relaxed",
            align === "center" && "mx-auto",
            tone === "dark" ? "text-muted" : "text-fog",
          )}
        >
          {intro}
        </p>
      )}
    </Reveal>
  );
}
