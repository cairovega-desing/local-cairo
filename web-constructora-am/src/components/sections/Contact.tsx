"use client";

import { Check, CircleCheck } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useId, useState, type FormEvent } from "react";
import { site, whatsappUrl } from "@/content/site";
import { enviarAlEndpoint, urlWhatsappConsulta, type Consulta } from "@/lib/enviarConsulta";
import { cn, EASE } from "@/lib/utils";
import { WhatsAppIcon } from "../ui/BrandIcons";
import { buttonClass } from "../ui/Button";
import { Reveal } from "../ui/Reveal";

type Errores = Partial<Record<keyof Consulta, string>>;
const VACIO: Consulta = { nombre: "", telefono: "", tipo: "", mensaje: "" };
const TELEFONO = /^\+?[\d\s-]{7,}$/;

function validar(c: Consulta): Errores {
  const { campos } = site.contactoSeccion;
  const e: Errores = {};
  if (c.nombre.trim().length < 2) e.nombre = campos.nombre.error;
  if (!TELEFONO.test(c.telefono.trim())) e.telefono = campos.telefono.error;
  if (c.mensaje.trim().length < 5) e.mensaje = campos.mensaje.error;
  return e;
}

export function Contact() {
  const { contactoSeccion: c } = site;
  const reduce = useReducedMotion();
  const uid = useId();
  const [datos, setDatos] = useState<Consulta>(VACIO);
  const [errores, setErrores] = useState<Errores>({});
  const [enviado, setEnviado] = useState(false);

  const set = (k: keyof Consulta) => (e: { target: { value: string } }) => {
    setDatos((d) => ({ ...d, [k]: e.target.value }));
    if (errores[k]) setErrores((er) => ({ ...er, [k]: undefined }));
    setEnviado(false);
  };

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const er = validar(datos);
    setErrores(er);
    const primero = (Object.keys(er) as (keyof Consulta)[])[0];
    if (primero) {
      document.getElementById(`${uid}-${primero}`)?.focus();
      return;
    }
    // Se abre WhatsApp en el mismo gesto del usuario (si no, el navegador lo bloquea).
    window.open(urlWhatsappConsulta(datos), "_blank", "noopener,noreferrer");
    void enviarAlEndpoint(datos);
    setEnviado(true);
    setDatos(VACIO);
  }

  const field = "mt-2 block w-full rounded-2xl border-2 bg-white/[0.06] px-4 py-3.5 text-base text-surface placeholder:text-fog/70 transition-colors focus:border-accent focus:bg-white/[0.09] focus:outline-none";
  const fieldState = (k: keyof Consulta) => (errores[k] ? "border-[#ff8a80]" : "border-white/15");
  const errorText = "mt-2 text-sm font-semibold text-[#ffb4ab]";

  return (
    <section id="presupuesto" aria-labelledby="presupuesto-titulo" className="bg-surface px-3 py-4 sm:px-5">
      <div className="on-dark relative isolate overflow-hidden rounded-[2.5rem] bg-navy px-5 py-16 text-surface sm:px-10 sm:py-24">
        {/* Fondo sobrio: grilla de plano muy sutil y un brillo dorado suave en una esquina */}
        <div className="bg-plano-dark absolute inset-0 -z-10" aria-hidden="true" />
        <div aria-hidden="true" className="absolute -right-40 -bottom-40 -z-10 size-[30rem] rounded-full bg-accent/10 blur-3xl" />

        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 id="presupuesto-titulo" className="font-title-xl text-[2.4rem] leading-[1] font-extrabold text-balance text-white sm:text-6xl">
              {c.titulo}
            </h2>
            <p className="mt-5 max-w-md text-lg text-fog">{c.texto}</p>
            <ul className="mt-8 grid gap-3">
              {c.beneficios.map((b) => (
                <li key={b} className="flex items-center gap-3 text-lg font-semibold">
                  <span className="flex size-8 items-center justify-center rounded-full bg-accent text-ink">
                    <Check className="size-4" aria-hidden="true" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="relative mt-10 inline-flex">
              <span aria-hidden="true" className="animate-ping-slow absolute inset-0 rounded-full bg-whatsapp-brand/50" />
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("whatsapp", "relative min-h-16 px-8 text-lg")}
              >
                <WhatsAppIcon className="size-6" />
                {c.botonWhatsapp}
                <span className="sr-only"> {site.a11y.nuevaPestana}</span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form
              noValidate
              onSubmit={onSubmit}
              aria-label="Formulario de pedido de presupuesto"
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${uid}-nombre`} className="font-semibold">
                    {c.campos.nombre.label}
                  </label>
                  <input
                    id={`${uid}-nombre`}
                    name="nombre"
                    autoComplete="name"
                    value={datos.nombre}
                    onChange={set("nombre")}
                    placeholder={c.campos.nombre.placeholder}
                    aria-invalid={!!errores.nombre}
                    aria-describedby={errores.nombre ? `${uid}-nombre-error` : undefined}
                    className={cn(field, fieldState("nombre"))}
                  />
                  {errores.nombre && (
                    <p id={`${uid}-nombre-error`} className={errorText}>
                      {errores.nombre}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor={`${uid}-telefono`} className="font-semibold">
                    {c.campos.telefono.label}
                  </label>
                  <input
                    id={`${uid}-telefono`}
                    name="telefono"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={datos.telefono}
                    onChange={set("telefono")}
                    placeholder={c.campos.telefono.placeholder}
                    aria-invalid={!!errores.telefono}
                    aria-describedby={errores.telefono ? `${uid}-telefono-error` : undefined}
                    className={cn(field, fieldState("telefono"))}
                  />
                  {errores.telefono && (
                    <p id={`${uid}-telefono-error`} className={errorText}>
                      {errores.telefono}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor={`${uid}-tipo`} className="font-semibold">
                  {c.campos.tipo.label}
                </label>
                <select
                  id={`${uid}-tipo`}
                  name="tipo"
                  value={datos.tipo}
                  onChange={set("tipo")}
                  className={cn(field, "border-white/15 [&>option]:text-ink")}
                >
                  <option value="">{c.campos.tipo.placeholder}</option>
                  {site.servicios.items.map((s) => (
                    <option key={s.id} value={s.titulo}>
                      {s.titulo}
                    </option>
                  ))}
                  <option value={c.campos.tipo.otro}>{c.campos.tipo.otro}</option>
                </select>
              </div>

              <div className="mt-5">
                <label htmlFor={`${uid}-mensaje`} className="font-semibold">
                  {c.campos.mensaje.label}
                </label>
                <textarea
                  id={`${uid}-mensaje`}
                  name="mensaje"
                  rows={4}
                  value={datos.mensaje}
                  onChange={set("mensaje")}
                  placeholder={c.campos.mensaje.placeholder}
                  aria-invalid={!!errores.mensaje}
                  aria-describedby={errores.mensaje ? `${uid}-mensaje-error` : undefined}
                  className={cn(field, fieldState("mensaje"), "resize-y")}
                />
                {errores.mensaje && (
                  <p id={`${uid}-mensaje-error`} className={errorText}>
                    {errores.mensaje}
                  </p>
                )}
              </div>

              <button type="submit" className={buttonClass("accent", "mt-6 w-full min-h-14 text-base")}>
                {c.enviar}
              </button>

              <div aria-live="polite" role="status">
                <AnimatePresence>
                  {enviado && (
                    <m.p
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="mt-5 flex items-start gap-3 rounded-2xl bg-whatsapp-brand/15 p-4 font-semibold text-surface"
                    >
                      <CircleCheck className="mt-0.5 size-5 shrink-0 text-whatsapp-brand" aria-hidden="true" />
                      {c.exito}
                    </m.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
