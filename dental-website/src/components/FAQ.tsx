"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { faq, faqSection } from "@/data/content";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export default function FAQ() {
  // Solo una pregunta abierta a la vez
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-white py-24 md:py-32"
    >
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="faq-title"
            eyebrow={faqSection.eyebrow}
            title={faqSection.title}
          />
        </Reveal>

        <Reveal className="mx-auto mt-12 max-w-3xl">
          <div className="space-y-3">
            {faq.map((item, index) => {
              const isOpen = openIndex === index;
              const buttonId = `faq-button-${index}`;
              const panelId = `faq-panel-${index}`;
              return (
                <div
                  key={item.question}
                  className={cn(
                    "rounded-2xl border transition-all duration-500",
                    isOpen
                      ? "border-primary/30 bg-gradient-to-br from-primary/[0.06] to-mint/10 shadow-lg shadow-primary-deep/5"
                      : "border-line bg-white hover:border-primary/30",
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-semibold text-ink transition-colors duration-300 hover:text-primary-deep sm:px-6 sm:text-lg"
                    >
                      {item.question}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-500",
                          isOpen
                            ? "rotate-45 bg-primary-deep text-white"
                            : "bg-primary/10 text-primary-deep",
                        )}
                      >
                        <Plus className="h-5 w-5" />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="panel"
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 leading-relaxed text-muted sm:px-6">
                          {item.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
