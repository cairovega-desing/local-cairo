import { cn } from "@/lib/utils";

/** Estilos compartidos de botón (se aplican a <a> o <button>). */
export const btn = {
  base: "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-bold tracking-[-0.01em] transition-[transform,background-color,box-shadow,color,border-color] duration-300 ease-out-expo active:scale-[0.97] motion-reduce:transition-none",
  accent: "bg-gold text-ink shadow-[0_12px_30px_-12px_rgb(169_123_52/0.9)]",
  dark: "bg-navy text-accent-light hover:bg-primary-deep",
  outline: "border border-accent/50 bg-white text-ink hover:border-accent-deep hover:bg-section",
  outlineLight: "border border-white/40 bg-white/5 text-white backdrop-blur-sm hover:border-white hover:bg-white/15",
  whatsapp: "bg-whatsapp text-white hover:bg-[#126a34] shadow-tinted",
};

export function buttonClass(variant: keyof Omit<typeof btn, "base">, className?: string) {
  return cn(btn.base, btn[variant], className);
}
