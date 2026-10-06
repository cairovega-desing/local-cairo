"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { ui, whatsappUrl } from "@/data/content";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);

  // Aparece con animación 1 segundo después de cargar
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ui.whatsappTooltip}
          className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-shadow duration-300 hover:shadow-xl sm:bottom-6 sm:right-6"
          initial={{ scale: 0, opacity: 0, rotate: -90 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <span aria-hidden="true" className="absolute inset-0 animate-pulse-ring rounded-full bg-whatsapp" />
          <MessageCircle className="relative h-7 w-7 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true" />
          <span
            role="tooltip"
            className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block"
          >
            {ui.whatsappTooltip}
          </span>
        </motion.a>
      ) : null}
    </AnimatePresence>
  );
}
