import { cn } from "@/lib/utils";

/** Diente ilustrado (SVG) con brillo. Decorativo. */
export function Tooth({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 170 190"
      className={cn("drop-shadow-2xl", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tooth-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#F1F7FD" />
          <stop offset="100%" stopColor="#CFE6F7" />
        </linearGradient>
        <linearGradient id="tooth-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M60 18C38 18 22 34 22 60c0 25 11 40 16 70 3 20 9 42 20 42 12 0 12-30 19-46 5-10 11-12 16-12s11 2 16 12c7 16 7 46 19 46 11 0 17-22 20-42 5-30 16-45 16-70 0-26-16-42-38-42-13 0-18 8-29 8s-16-8-29-8Z"
        fill="url(#tooth-body)"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      <path
        d="M44 44c6-12 18-16 28-14-12 6-18 16-20 30-1 8-10 4-8-16Z"
        fill="url(#tooth-shine)"
      />
      <circle cx="122" cy="46" r="5" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

/** Destellito de cuatro puntas. Decorativo. */
export function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        d="M12 0c.8 6.4 5.6 11.2 12 12-6.4.8-11.2 5.6-12 12-.8-6.4-5.6-11.2-12-12C6.4 11.2 11.2 6.4 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
