import { ImageIcon, type LucideIcon } from "lucide-react";
import { ui } from "@/data/content";
import { cn } from "@/lib/utils";
import { Sparkle } from "./Tooth";

interface ImagePlaceholderProps {
  /** Texto descriptivo; hace de alt text accesible. */
  label: string;
  className?: string;
  icon?: LucideIcon;
  /** Variante de color (0–3). */
  tone?: number;
}

const tones = [
  "from-primary-deep via-primary to-mint",
  "from-accent via-primary/80 to-primary-deep",
  "from-navy via-primary-deep to-accent",
  "from-primary via-accent to-peach",
];

/**
 * Ilustración con degradé para fotos que todavía no tenemos.
 * Para pasar a imágenes reales: reemplazar este componente por
 * <Image src="/images/..." alt={label} fill sizes="..." className="object-cover" />
 * dentro del mismo contenedor con aspect-ratio.
 */
export function ImagePlaceholder({
  label,
  className,
  icon: Icon = ImageIcon,
  tone = 0,
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`${ui.imagePlaceholderPrefix} ${label}`}
      className={cn(
        "relative flex h-full w-full items-end overflow-hidden bg-gradient-to-br p-5 text-white",
        tones[tone % tones.length],
        className,
      )}
    >
      {/* Formas decorativas */}
      <span
        aria-hidden="true"
        className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-navy/20 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="absolute right-[12%] top-[14%] h-24 w-24 animate-spin-slow rounded-full border border-dashed border-white/40"
      />
      <Sparkle className="absolute left-[18%] top-[20%] h-4 w-4 animate-twinkle text-white/80" />
      <Sparkle
        className="absolute right-[30%] bottom-[35%] h-3 w-3 animate-twinkle text-white/70"
        style={{ animationDelay: "1.2s" }}
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-white/40 bg-white/15 backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
      >
        <Icon className="h-9 w-9" />
      </span>
      <span className="relative rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md sm:text-sm">
        {label}
      </span>
    </div>
  );
}
