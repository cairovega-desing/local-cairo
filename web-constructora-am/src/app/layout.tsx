import type { Metadata, Viewport } from "next";
import { Manrope, Montserrat } from "next/font/google";
import { site } from "@/content/site";
import { buildJsonLd } from "@/lib/schema";
import "./globals.css";

// Montserrat (la del logo) para titulares y Manrope para el texto.
// Con preload la web publicada pinta antes. Al abrir con file:// Chrome avisa en la consola
// que no puede usar el preload, pero la fuente igual carga desde el CSS: no afecta lo visible.
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const { marca, seo } = site;

export const metadata: Metadata = {
  metadataBase: new URL(marca.dominio),
  title: seo.titulo,
  description: seo.descripcion,
  alternates: { canonical: "/" },
  applicationName: marca.nombre,
  openGraph: {
    type: "website",
    locale: "es_UY",
    url: "/",
    siteName: marca.nombre,
    title: seo.titulo,
    description: seo.descripcion,
    images: [{ url: `/${seo.ogImagen}`, width: 1200, height: 630, alt: `${marca.nombre} · ${site.zona}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.titulo,
    description: seo.descripcion,
    images: [`/${seo.ogImagen}`],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1c140c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-UY" className={`${montserrat.variable} ${manrope.variable}`}>
      <head>
        {/* Rutas relativas para que funcione al abrir index.html sin servidor. */}
        <link rel="icon" href="./favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="./images/logo-icon.png" />
        {/* Sin JavaScript (por ejemplo, la vista previa de algunos celulares) todo queda visible. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}"}</style>
        </noscript>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
