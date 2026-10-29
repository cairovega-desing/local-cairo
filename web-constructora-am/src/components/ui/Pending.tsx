import { cn } from "@/lib/utils";

/** Marca visible para datos que el cliente todavía no entregó. */
export function Pending({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-dashed border-current px-2 py-0.5 text-[0.7rem] font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}
