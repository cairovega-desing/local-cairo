import { cn } from "@/lib/utils";

/**
 * Monograma «AM» del logo, redibujado en vector: una línea en zigzag (A + M como techos)
 * con la barra de la A, en dorado metálico. `uid` evita ids repetidos si hay varios en la página.
 */
export function LogoMark({ className, uid = "logo" }: { className?: string; uid?: string }) {
  const grad = `${uid}-oro`;
  const clip = `${uid}-base`;
  return (
    <svg viewBox="0 0 640 356" aria-hidden="true" className={cn("shrink-0", className)}>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="640" y2="356" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7a5522" />
          <stop offset=".35" stopColor="#b8893f" />
          <stop offset=".5" stopColor="#e3c27e" />
          <stop offset=".65" stopColor="#a97b34" />
          <stop offset="1" stopColor="#6e4e1e" />
        </linearGradient>
        <clipPath id={clip}>
          <rect width="640" height="356" />
        </clipPath>
      </defs>
      <polyline
        points="6,392 245,40 395,322 475,170 623.6,392"
        fill="none"
        stroke={`url(#${grad})`}
        strokeWidth="32"
        strokeLinejoin="miter"
        strokeMiterlimit="12"
        clipPath={`url(#${clip})`}
      />
      <polygon points="175,223 325,223 325,259 150,259" fill={`url(#${grad})`} />
    </svg>
  );
}

/** Monograma + «CONSTRUCTORA / A&M», como en el logo. */
export function Logo({ className, tone = "dark", uid }: { className?: string; tone?: "dark" | "light"; uid?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark className="h-9 w-auto" uid={uid} />
      <span className="flex flex-col items-start leading-none">
        <span
          className={cn(
            "font-title text-[0.66rem] font-medium tracking-[0.3em]",
            tone === "dark" ? "text-ink" : "text-fog",
          )}
        >
          CONSTRUCTORA
        </span>{" "}
        <span className={cn("mt-1 font-title text-xl font-bold tracking-[0.04em]", tone === "dark" ? "text-accent-ink" : "text-accent-light")}>
          A&amp;M
        </span>
      </span>
    </span>
  );
}
