import type { NextConfig } from "next";

/**
 * Exportación estática pensada para abrirse con doble clic (file://):
 * - output "export" genera /out con index.html.
 * - assetPrefix "./" hace que /_next se pida con ruta relativa.
 * - scripts/relativize.mjs corrige después del build las rutas absolutas que queden.
 */
const nextConfig: NextConfig = {
  output: "export",
  assetPrefix: "./",
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
