import { cn } from "@/lib/utils";
import { Sparkle } from "./Tooth";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
  align?: "left" | "center";
  className?: string;
  /** Para secciones con fondo oscuro. */
  dark?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = "center",
  className,
  dark = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p
        className={cn(
          "inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em]",
          dark ? "text-mint" : "text-primary-deep",
        )}
      >
        <Sparkle className="h-3.5 w-3.5 text-accent" />
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "font-display mt-4 text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed",
            dark ? "text-white/70" : "text-muted",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
