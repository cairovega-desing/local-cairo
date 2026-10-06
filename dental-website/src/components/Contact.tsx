"use client";

import { useState, type FormEvent } from "react";
import { Check, CheckCircle2, MessageCircle, Send } from "lucide-react";
import { contact, whatsappUrl } from "@/data/content";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { Sparkle } from "./Tooth";

type Field = "name" | "phone" | "message";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const emptyValues: Values = { name: "", phone: "", message: "" };

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = contact.form.errors.name;
  if (!/^\+?[\d\s-]{7,}$/.test(values.phone.trim()))
    errors.phone = contact.form.errors.phone;
  if (values.message.trim().length < 5)
    errors.message = contact.form.errors.message;
  return errors;
}

const fieldClass =
  "w-full rounded-2xl border bg-surface px-4 py-3.5 text-ink placeholder:text-muted/70 transition-all duration-300 hover:border-primary/40 focus:border-primary-deep focus:bg-white focus:shadow-[0_0_0_4px_rgb(14_165_233/0.15)] focus:outline-none";

export default function Contact() {
  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const update = (field: Field, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (sent) setSent(false);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Sin backend por ahora (fase 6 del ROADMAP: Formspree / Resend / solo WhatsApp)
    console.log("Formulario de contacto:", values);
    setSent(true);
    setValues(emptyValues);
  };

  const fields: {
    name: Field;
    type: string;
    autoComplete?: string;
    multiline?: boolean;
  }[] = [
    { name: "name", type: "text", autoComplete: "name" },
    { name: "phone", type: "tel", autoComplete: "tel" },
    { name: "message", type: "text", multiline: true },
  ];

  return (
    <section
      id="contacto"
      aria-labelledby="contact-title"
      className="relative overflow-hidden bg-white py-24 md:py-32"
    >
      <div className="container-page">
        <div className="on-dark relative overflow-hidden rounded-[2.5rem] bg-navy p-6 shadow-2xl shadow-navy/30 sm:p-10 lg:p-14">
          {/* Fondo animado */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="bg-grid-dark absolute inset-0" />
            <div className="absolute -left-20 -top-20 h-96 w-96 animate-aurora rounded-full bg-primary/40 blur-3xl" />
            <div
              className="absolute -bottom-32 right-0 h-96 w-96 animate-aurora rounded-full bg-mint/25 blur-3xl"
              style={{ animationDelay: "-8s" }}
            />
            <Sparkle className="absolute right-[45%] top-10 h-5 w-5 animate-twinkle text-mint" />
            <Sparkle
              className="absolute bottom-14 left-[38%] h-3 w-3 animate-twinkle text-white"
              style={{ animationDelay: "1.4s" }}
            />
          </div>

          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionHeading
                id="contact-title"
                align="left"
                eyebrow={contact.eyebrow}
                title={contact.title}
                description={contact.description}
                dark
              />
              <ul className="mt-8 space-y-3">
                {contact.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-3 text-white/85">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint/20 text-mint">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp mt-10 !px-8 !py-4 text-lg"
              >
                <span aria-hidden="true" className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-whatsapp" />
                <MessageCircle className="h-6 w-6" aria-hidden="true" />
                {contact.whatsappCta}
              </a>
            </Reveal>

            <Reveal delay={0.15}>
              <form
                onSubmit={onSubmit}
                noValidate
                className="space-y-5 rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
              >
                <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted" aria-hidden="true">
                  <span className="h-px flex-1 bg-line" />
                  {contact.divider}
                  <span className="h-px flex-1 bg-line" />
                </p>
                {fields.map((field) => {
                  const config = contact.form[field.name];
                  const id = `contact-${field.name}`;
                  const error = errors[field.name];
                  const common = {
                    id,
                    name: field.name,
                    required: true,
                    value: values[field.name],
                    placeholder: config.placeholder,
                    "aria-invalid": error ? true : undefined,
                    "aria-describedby": error ? `${id}-error` : undefined,
                    className: cn(
                      fieldClass,
                      error ? "border-red-700" : "border-line",
                    ),
                  };
                  return (
                    <div key={field.name}>
                      <label
                        htmlFor={id}
                        className="mb-1.5 block text-sm font-semibold text-ink"
                      >
                        {config.label}
                      </label>
                      {field.multiline ? (
                        <textarea
                          {...common}
                          rows={4}
                          onChange={(e) => update(field.name, e.target.value)}
                        />
                      ) : (
                        <input
                          {...common}
                          type={field.type}
                          autoComplete={field.autoComplete}
                          onChange={(e) => update(field.name, e.target.value)}
                        />
                      )}
                      {error ? (
                        <p
                          id={`${id}-error`}
                          role="alert"
                          className="mt-1.5 text-sm font-medium text-red-700"
                        >
                          {error}
                        </p>
                      ) : null}
                    </div>
                  );
                })}

                <button type="submit" className="btn btn-primary group w-full">
                  {contact.form.submit}
                  <Send
                    className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </button>

                <div aria-live="polite">
                  {sent ? (
                    <p className="flex items-start gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                        aria-hidden="true"
                      />
                      {contact.form.success}
                    </p>
                  ) : null}
                </div>
              </form>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
