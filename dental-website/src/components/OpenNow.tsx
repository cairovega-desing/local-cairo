"use client";

import { useEffect, useState } from "react";
import { business, location } from "@/data/content";
import type { BusinessHours } from "@/data/content";
import { cn } from "@/lib/utils";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** ¿Está abierto ahora? Calculado con la hora de Montevideo. */
function isOpen(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Montevideo",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = get("weekday");
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  const toMin = (t?: string) => (t ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) : -1);
  const hours: BusinessHours[] = business.hours;
  return hours.some(
    (row) =>
      dayNames.includes(day) &&
      row.days.includes(day) &&
      minutes >= toMin(row.opens) &&
      minutes < toMin(row.closes),
  );
}

export function OpenNow() {
  // null hasta montar en el cliente (evita diferencias con el HTML generado)
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const tick = () => setOpen(isOpen(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  if (open === null) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        open ? "bg-emerald-100 text-emerald-800" : "bg-section text-muted",
      )}
    >
      <span className="relative flex h-2 w-2">
        {open ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        ) : null}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            open ? "bg-emerald-600" : "bg-muted",
          )}
        />
      </span>
      {open ? location.openNow : location.closedNow}
    </span>
  );
}
