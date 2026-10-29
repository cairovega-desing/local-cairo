"use client";

import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Marco con inclinación 3D que sigue al mouse. La imagen interior se mueve un poco
 * en sentido contrario (parallax). Apagado con prefers-reduced-motion o en pantallas táctiles.
 */
export function TiltFrame({
  src,
  alt,
  width,
  height,
  className,
  children,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const cfg = { stiffness: 150, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), cfg);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), cfg);
  const imgX = useSpring(useTransform(px, [-0.5, 0.5], [14, -14]), cfg);
  const imgY = useSpring(useTransform(py, [-0.5, 0.5], [14, -14]), cfg);

  useEffect(() => {
    setFinePointer(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  const enabled = finePointer && !reduce;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!enabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div className={cn("[perspective:1200px]", className)} onPointerMove={onMove} onPointerLeave={onLeave}>
      <m.div
        style={enabled ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
        className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-primary-deep shadow-lift ring-1 ring-ink/10"
      >
        <m.img
          src={src}
          alt={alt}
          width={width}
          height={height}
          fetchPriority="high"
          decoding="async"
          style={enabled ? { x: imgX, y: imgY, scale: 1.05 } : undefined}
          className="size-full object-cover"
        />
      </m.div>
      {children}
    </div>
  );
}
