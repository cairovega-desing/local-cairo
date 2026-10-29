import type { NextConfig } from "next";

/**
 * Exportación estática pensada para abrirse con doble clic (file://):
 * - output "export" genera /out con index.html.
 * - assetPrefix "./" hace que /_next se pida con ruta relativa.
 * - scripts/relativize.mjs corrige después del build las rutas absolutas que queden.
 */
// SINGLE_FILE=1 genera una compilación aparte (con webpack y sin assetPrefix) que scripts/make_single.py
// convierte en un único .html para compartir por WhatsApp.
const single = process.env.SINGLE_FILE === "1";

const nextConfig: NextConfig = {
  output: "export",
  ...(single ? { distDir: ".next-single" } : { assetPrefix: "./" }),
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
