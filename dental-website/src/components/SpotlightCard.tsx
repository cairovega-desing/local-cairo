"use client";

import type { ReactNode, MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

/** Card con un halo de luz que sigue al mouse. */
export function SpotlightCard({
  children,
  className,
  color = "14 165 233",
}: {
  children: ReactNode;
  className?: string;
  /** Canales RGB del halo. */
  color?: string;
}) {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const background = useMotionTemplate`radial-gradient(380px circle at ${x}px ${y}px, rgb(${color} / 0.14), transparent 70%)`;

  const onMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  };

  return (
    <article
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(-400);
        y.set(-400);
      }}
      className={cn("group relative overflow-hidden", className)}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background }}
      />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </article>
  );
}
