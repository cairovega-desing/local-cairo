/** Une clases condicionales sin dependencias extra. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Ruta relativa a /public, válida tanto con servidor como abriendo index.html (file://).
 * Las URL completas y las imágenes incrustadas (data:, en el .html único) pasan tal cual.
 */
export function asset(path: string): string {
  if (/^(data:|https?:)/.test(path)) return path;
  return `./${path.replace(/^\.?\//, "")}`;
}

export const EASE = [0.16, 1, 0.3, 1] as const;

export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
