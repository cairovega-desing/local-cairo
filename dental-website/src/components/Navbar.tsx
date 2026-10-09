"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, MessageCircle, X } from "lucide-react";
import { business, navigation, ui, whatsappUrl } from "@/data/content";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  // Fondo con blur al hacer scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Resaltar la sección activa según el scroll
  useEffect(() => {
    const ids = navigation.links.map((link) => link.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Cerrar el drawer con Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 transition-all duration-500">
      {/* Al bajar, la barra se convierte en una "píldora" flotante de vidrio */}
      <div
        className={cn(
          "mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 rounded-full px-3 transition-all duration-500 sm:px-5",
          scrolled
            ? "glass max-w-5xl"
            : "border border-transparent bg-transparent",
        )}
      >
        <a
          href="#inicio"
          aria-label={ui.logoHome}
          className="flex items-center gap-2 rounded-lg text-lg font-bold tracking-tight text-ink"
        >
          <span
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md shadow-primary/20 ring-1 ring-line transition-transform duration-500 hover:rotate-6"
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-icon.png" alt="" width={44} height={44} className="h-full w-full object-contain p-0.5" />
          </span>
          <span className="whitespace-nowrap font-display text-lg font-medium sm:text-xl">{business.shortName}</span>
        </a>

        <nav aria-label={ui.mainNavLabel} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navigation.links.map((link) => {
              const isActive = active === link.href.slice(1);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                      isActive ? "text-primary-deep" : "text-ink/75 hover:text-ink",
                    )}
                  >
                    {/* Indicador que se desliza entre secciones */}
                    {isActive ? (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-full bg-primary/10"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp !hidden !min-h-[44px] !px-5 !py-2 text-sm sm:!inline-flex"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {navigation.cta}
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={ui.openMenu}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-section lg:hidden"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={ui.menuTitle}
              className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85%] flex-col rounded-l-[2rem] bg-white p-6 shadow-2xl lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-ink">
                  {business.shortName}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={ui.closeMenu}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-section"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <nav aria-label={ui.mainNavLabel} className="mt-8">
                <ul className="flex flex-col gap-1">
                  {navigation.links.map((link, index) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <a
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-2xl px-4 py-3 font-display text-2xl text-ink transition-colors hover:bg-section hover:text-primary-deep"
                      >
                        {link.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp mt-auto w-full"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                {navigation.cta}
              </a>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
