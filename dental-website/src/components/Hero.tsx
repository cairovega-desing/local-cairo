"use client";

import type { MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  FileText,
  HeartPulse,
  MessageCircle,
  ScanLine,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { hero, testimonials, ui, whatsappUrl } from "@/data/content";
import type { HeroBadgeIcon } from "@/data/content";
import { Sparkle } from "./Tooth";

const badgeIcons: Record<HeroBadgeIcon, LucideIcon> = {
  users: Users,
  scan: ScanLine,
  file: FileText,
};

const ease = [0.16, 1, 0.3, 1] as const;

/** Título que aparece palabra por palabra. */
function AnimatedWords({ text, className }: { text: string; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reduceMotion ? false : { y: "110%", rotate: 4 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function FadeUp({ children, delay, className }: { children: React.ReactNode; delay: number; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const reduceMotion = useReducedMotion();
  // Parallax suave del lado derecho según la posición del mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const photoX = useTransform(sx, (v) => v * -12);
  const photoY = useTransform(sy, (v) => v * -12);
  const cardX = useTransform(sx, (v) => v * -40);
  const cardY = useTransform(sy, (v) => v * -40);
  const rotateY = useTransform(sx, (v) => v * 8);
  const rotateX = useTransform(sy, (v) => v * -8);

  const onMove = (event: MouseEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      onMouseMove={onMove}
      className="relative overflow-hidden pb-24 pt-12 md:pb-32 md:pt-20"
    >
      {/* Fondo: aurora de colores en movimiento + puntitos */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-surface to-surface" />
        <div className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] animate-aurora rounded-full bg-primary/25 blur-3xl" />
        <div
          className="absolute -left-32 top-40 h-[28rem] w-[28rem] animate-aurora rounded-full bg-mint/30 blur-3xl"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="absolute bottom-0 right-1/3 h-72 w-72 animate-aurora rounded-full bg-peach/30 blur-3xl"
          style={{ animationDelay: "-12s" }}
        />
      </div>

      <div className="container-page relative grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <div>
          <FadeUp delay={0}>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 py-1.5 pl-1.5 pr-4 text-sm font-medium text-primary-deep shadow-sm backdrop-blur">
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white">
                <Sparkle className="h-3 w-3" />
              </span>
              {hero.eyebrow}
            </p>
          </FadeUp>

          <h1
            id="hero-title"
            className="font-display mt-7 text-[2.75rem] font-medium leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl"
          >
            <AnimatedWords text={hero.titleStart} />{" "}
            <em className="relative block italic">
              <AnimatedWords text={hero.titleHighlight} className="text-gradient" />
              {/* Subrayado dibujado */}
              <motion.svg
                aria-hidden="true"
                viewBox="0 0 300 20"
                className="absolute -bottom-2 left-0 h-4 w-[min(100%,26rem)] text-mint"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M2 14 C 80 2, 200 2, 298 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.9, ease }}
                />
              </motion.svg>
            </em>
          </h1>

          <FadeUp delay={0.5}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
              {hero.subtitle}
            </p>
          </FadeUp>

          <FadeUp delay={0.65} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp !px-7 text-lg"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              {hero.primaryCta}
            </a>
            <a href={hero.secondaryHref} className="btn btn-outline !px-7 text-lg">
              {hero.secondaryCta}
            </a>
          </FadeUp>

          <FadeUp delay={0.8}>
            <ul className="mt-10 flex flex-wrap gap-2.5">
              {hero.badges.map((badge) => {
                const Icon = badgeIcons[badge.icon];
                return (
                  <li
                    key={badge.label}
                    className="flex items-center gap-2 rounded-full border border-line bg-white/70 py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink/80 backdrop-blur transition-colors hover:border-primary/40"
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary-deep"
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {badge.label}
                  </li>
                );
              })}
            </ul>
          </FadeUp>
        </div>

        {/* Lado derecho: tarjeta ilustrada con diente flotante y tarjetitas */}
        <motion.div
          className="relative mx-auto w-full max-w-md [perspective:1200px]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease }}
        >
          <motion.div
            style={{ rotateX, rotateY }}
            className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-section shadow-2xl shadow-primary-deep/30 ring-4 ring-white [transform-style:preserve-3d]"
          >
            <motion.img
              src={hero.image}
              alt={hero.imageLabel}
              width={400}
              height={406}
              style={{ x: photoX, y: photoY, scale: 1.08 }}
              className="h-full w-full object-cover object-[88%_center]"
            />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/50 to-transparent" />
            {[
              "left-[12%] top-[14%] h-5 w-5",
              "right-[14%] top-[40%] h-4 w-4",
            ].map((pos, i) => (
              <Sparkle
                key={pos}
                className={`absolute animate-twinkle text-white ${pos}`}
                style={{ animationDelay: `${i * 0.9}s` }}
              />
            ))}
          </motion.div>

          {/* Tarjeta: rating */}
          <motion.div style={{ x: cardX, y: cardY }} className="absolute -bottom-6 -left-2 sm:-left-10">
            <div className="glass flex animate-float-slow items-center gap-3 rounded-2xl px-4 py-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md">
                <Star className="h-5 w-5 fill-white" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xl font-bold leading-none text-ink">
                  {hero.ratingCard.value}
                  <span className="sr-only"> {ui.starsLabel}</span>
                </p>
                <p className="mt-1 text-xs font-medium text-muted">{hero.ratingCard.label}</p>
              </div>
            </div>
          </motion.div>

          {/* Tarjeta: pacientes */}
          <motion.div style={{ x: cardX, y: cardY }} className="absolute -left-2 top-10 sm:-left-12">
            <div
              className="glass flex animate-float-slow items-center gap-3 rounded-2xl px-4 py-3"
              style={{ animationDelay: "-3s" }}
            >
              <div className="flex -space-x-2" aria-hidden="true">
                {testimonials.slice(0, 3).map((t, i) => (
                  <span
                    key={t.name}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${
                      ["bg-primary-deep", "bg-accent", "bg-peach"][i]
                    }`}
                  >
                    {t.name.charAt(0)}
                  </span>
                ))}
              </div>
              <div>
                <p className="text-lg font-bold leading-none text-ink">{hero.patientsCard.value}</p>
                <p className="mt-1 text-xs font-medium text-muted">{hero.patientsCard.label}</p>
              </div>
            </div>
          </motion.div>

          {/* Tarjeta: disponibilidad */}
          <motion.div style={{ x: cardX, y: cardY }} className="absolute -right-1 bottom-24 hidden sm:-right-6 sm:block">
            <div
              className="glass flex animate-float-slow items-center gap-2.5 rounded-full px-4 py-2.5"
              style={{ animationDelay: "-5s" }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <HeartPulse className="h-4 w-4 text-primary-deep" aria-hidden="true" />
              <span className="text-xs font-semibold text-ink">{hero.availabilityCard}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#sobre"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted transition-colors hover:text-primary-deep md:flex"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        {hero.scrollHint}
        <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
      </motion.a>
    </section>
  );
}
