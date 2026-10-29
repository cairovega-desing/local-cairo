import { cn } from "@/lib/utils";

/**
 * Cota de plano: línea con marcas a 45° en los extremos y la medida al centro.
 * Es el recurso gráfico propio de la marca (evoca los planos de obra).
 */
export function Cota({
  label,
  className,
  vertical = false,
}: {
  label?: string;
  className?: string;
  vertical?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none flex items-center gap-2 text-[0.7rem] font-semibold tabular-nums",
        vertical ? "h-full flex-col" : "w-full",
        className,
      )}
    >
      <Tick vertical={vertical} />
      <span className={cn("bg-current opacity-60", vertical ? "w-px flex-1" : "h-px flex-1")} />
      {label && <span className={cn("shrink-0", vertical && "[writing-mode:vertical-rl] rotate-180")}>{label}</span>}
      {label && <span className={cn("bg-current opacity-60", vertical ? "w-px flex-1" : "h-px flex-1")} />}
      <Tick vertical={vertical} />
    </div>
  );
}

function Tick({ vertical }: { vertical: boolean }) {
  return (
    <svg viewBox="0 0 12 12" className={cn("size-3 shrink-0", vertical && "rotate-90")}>
      <path d="M1 11 11 1M6 0v12" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
