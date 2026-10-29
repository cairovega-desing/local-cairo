import type { AnchorHTMLAttributes, ReactNode } from "react";
import { site } from "@/content/site";

/** Link externo: nueva pestaña, rel seguro y aviso para lectores de pantalla. */
export function ExternalLink({
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> {site.a11y.nuevaPestana}</span>
    </a>
  );
}
