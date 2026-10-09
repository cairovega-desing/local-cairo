import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { business, seo } from "@/data/content";
import "./globals.css";

// Sans moderna para el texto + serif con personalidad para los títulos
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  applicationName: business.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: seo.locale,
    url: "/",
    siteName: business.name,
    title: seo.title,
    description: seo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0EA5E9",
  width: "device-width",
  initialScale: 1,
};

// Schema.org Dentist (JSON-LD) para SEO local
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  name: business.name,
  description: seo.description,
  url: business.siteUrl,
  telephone: business.phoneIntl,
  email: business.email || undefined,
  image: `${business.siteUrl}/opengraph-image`,
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address.street,
    addressLocality: business.address.city,
    postalCode: business.address.postalCode,
    addressRegion: business.address.city,
    addressCountry: business.address.countryCode,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: business.geo.lat,
    longitude: business.geo.lng,
  },
  openingHoursSpecification: business.hours
    .filter((row) => row.days.length > 0)
    .map((row) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: row.days,
      opens: row.opens,
      closes: row.closes,
    })),
  sameAs: [business.instagram.url, business.facebook.url].filter(Boolean),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
