"use client";

import { m, useReducedMotion } from "framer-motion";
import { site, whatsappUrl } from "@/content/site";
import { WhatsAppIcon } from "./ui/BrandIcons";

/** Botón flotante de WhatsApp: entra al segundo de cargar. */
export function WhatsAppFloat() {
  const reduce = useReducedMotion();
  return (
    <m.div
      className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6"
      initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={reduce ? { duration: 0 } : { delay: 1, type: "spring", stiffness: 260, damping: 18 }}
    >
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${site.a11y.whatsappFlotante} ${site.a11y.nuevaPestana}`}
        className="group relative flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lift transition-transform duration-300 hover:scale-105 focus-visible:scale-105 motion-reduce:transition-none"
      >
        <WhatsAppIcon className="size-7" />
        <span
          role="tooltip"
          className="pointer-events-none absolute right-full mr-3 hidden translate-x-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold whitespace-nowrap text-surface opacity-0 shadow-tinted transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block"
        >
          {site.a11y.whatsappFlotante}
        </span>
      </a>
    </m.div>
  );
}
