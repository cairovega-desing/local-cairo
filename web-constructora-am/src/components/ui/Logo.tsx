import { cn } from "@/lib/utils";

/** Monograma A&M: techo amarillo sobre las iniciales. Mismo dibujo que public/favicon.svg. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("shrink-0", className)}>
      <rect width="64" height="64" rx="14" className="fill-primary-deep" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 28 32 12l20 16" className="stroke-accent" strokeWidth="5" />
        <path d="m14 52 8-20 8 20M17.5 45h9M34 52V32l8 12 8-12v20" className="stroke-surface" strokeWidth="4" />
      </g>
    </svg>
  );
}

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-9" />
      <span
        className={cn(
          "font-title text-[1.05rem] leading-none font-extrabold transition-colors duration-300",
          tone === "dark" ? "text-ink" : "text-white",
        )}
      >
        Constructora <span className="whitespace-nowrap">A&amp;M</span>
      </span>
    </span>
  );
}
