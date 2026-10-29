import { cn } from "@/lib/utils";

/** Estilos compartidos de botón (se aplican a <a> o <button>). */
export const btn = {
  base: "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-bold transition-[transform,background-color,box-shadow,color] duration-300 ease-out-expo active:scale-[0.97] motion-reduce:transition-none",
  accent: "bg-accent text-ink shadow-tinted hover:bg-accent-deep hover:shadow-lift",
  dark: "bg-ink text-surface hover:bg-primary-deep",
  outline: "border-2 border-ink/15 bg-white/60 text-ink hover:border-ink hover:bg-white",
  outlineLight: "border-2 border-white/25 text-surface hover:border-white hover:bg-white/10",
  whatsapp: "bg-whatsapp text-white hover:bg-[#126a34] shadow-tinted",
};

export function buttonClass(variant: keyof Omit<typeof btn, "base">, className?: string) {
  return cn(btn.base, btn[variant], className);
}
