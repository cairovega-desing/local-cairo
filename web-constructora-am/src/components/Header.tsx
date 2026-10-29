"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { site, whatsappUrl } from "@/content/site";
import { cn, EASE } from "@/lib/utils";
import { Logo } from "./ui/Logo";
import { buttonClass } from "./ui/Button";
import { ExternalLink } from "./ui/ExternalLink";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: resalta el link de la sección que cruza la franja central de la pantalla.
  useEffect(() => {
    // Se observan todas las secciones (también las que no están en el menú) para que,
    // por ejemplo, al volver al hero no quede resaltado un link viejo.
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border py-2 pr-2 pl-4 transition-[background-color,box-shadow,border-color] duration-500 ease-out-expo",
          solid
            ? "border-accent/25 bg-surface/90 shadow-tinted backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <a href="#inicio" aria-label={`${site.marca.nombre}, ${site.a11y.inicio.toLowerCase()}`} className="rounded-full">
          <Logo uid="header" />
        </a>

        <nav aria-label={site.a11y.navPrincipal} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {site.nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "true" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-300",
                    active === item.id ? "bg-accent/15 text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ExternalLink href={whatsappUrl()} className={buttonClass("accent", "min-h-11 px-5 text-sm")}>
              {site.hero.ctaPrincipal}
            </ExternalLink>
          </div>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full bg-navy text-accent-light lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? site.a11y.cerrarMenu : site.a11y.abrirMenu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.nav
            id="menu-movil"
            aria-label={site.a11y.navPrincipal}
            initial={reduce ? false : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mx-auto mt-2 max-w-6xl origin-top rounded-[2rem] border border-primary/10 bg-surface/95 p-3 shadow-lift backdrop-blur-xl lg:hidden"
          >
            <ul className="grid gap-1">
              {site.nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active === item.id ? "true" : undefined}
                    className={cn(
                      "flex min-h-12 items-center rounded-2xl px-4 font-title text-lg font-bold",
                      active === item.id ? "bg-navy text-accent-light" : "text-ink hover:bg-section",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-2 sm:hidden">
              <ExternalLink href={whatsappUrl()} className={buttonClass("accent", "w-full")} onClick={() => setOpen(false)}>
                {site.hero.ctaPrincipal}
              </ExternalLink>
            </div>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
