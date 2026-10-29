// Post-build: deja todas las rutas de /out relativas para que index.html funcione
// con doble clic (file://), sin servidor.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

let changed = 0;
for (const file of walk(OUT)) {
  if (!/\.(html|css|js|txt)$/.test(file)) continue;
  const original = readFileSync(file, "utf8");
  let s = original;
  if (file.endsWith(".html") || file.endsWith(".txt")) {
    // "/_next/..." → "./_next/..." (atributos, flight data y preloads).
    s = s.replace(/(["'(])\/_next\//g, "$1./_next/");
    s = s.replace(/(["'(])\.\/\.\/_next\//g, "$1./_next/");
  } else if (file.endsWith(".css")) {
    // En el CSS las URLs se resuelven desde la carpeta del propio CSS.
    const depth = relative(OUT, file).split(sep).length - 1;
    const up = "../".repeat(depth);
    s = s.replace(/url\((["']?)(?:\.)?\/_next\//g, `url($1${up}_next/`);
  }
  if (s !== original) {
    writeFileSync(file, s);
    changed++;
  }
}
console.log(`relativize: ${changed} archivos ajustados en out/`);
