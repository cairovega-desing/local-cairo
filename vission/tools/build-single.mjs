// Arma dist/VISSION.html: el sitio entero en un solo archivo (código, librerías, fuentes e imágenes).
// Se abre con doble clic, sin servidor y sin internet.
//
//   npm install esbuild        (una vez, en cualquier carpeta)
//   ESBUILD=/ruta/a/node_modules/esbuild/lib/main.js node tools/build-single.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const root = fileURLToPath(new URL('..', import.meta.url));
const r = (p) => join(root, p);
const require = createRequire(import.meta.url);
const esbuild = require(process.env.ESBUILD || 'esbuild');

const dataUri = async (path, type) => `data:${type};base64,${(await readFile(r(path))).toString('base64')}`;
// que ningún texto incrustado cierre la etiqueta <script> antes de tiempo
const safe = (js) => js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

// 1 · JavaScript propio + Three.js en un único script
const bundle = await esbuild.build({
  entryPoints: [r('js/main.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  write: false,
  target: 'es2020',
  alias: { three: r('vendor/three.module.min.js') },
  logLevel: 'warning',
});
const appJs = bundle.outputFiles[0].text;

// 2 · imágenes y geometría del ojo
const img = {};
for (const name of ['open.webp', 'closed.webp', 'half.webp', 'iris.webp']) img[name] = await dataUri(`assets/eye/${name}`, 'image/webp');
const full = await dataUri('assets/eye/full.webp', 'image/webp');
const wide = await dataUri('assets/eye/wide.webp', 'image/webp');
const geometry = JSON.parse(await readFile(r('assets/eye/geometry.json'), 'utf8'));

// 3 · CSS con fuentes e imágenes adentro
let css = await readFile(r('css/styles.css'), 'utf8');
for (const m of [...css.matchAll(/url\(\.\.\/fonts\/([^)]+)\)/g)]) css = css.replace(m[0], `url(${await dataUri('fonts/' + m[1], 'font/woff2')})`);
css = css.replaceAll('url(../assets/eye/wide.webp)', `url(${wide})`);

// 4 · HTML
let html = await readFile(r('index.html'), 'utf8');
html = html
  .replace(/\s*<meta property="og:image"[^>]*>/, '')
  .replace(/\s*<link rel="preload"[^>]*>/g, '')
  .replace(/\s*<script type="importmap">[\s\S]*?<\/script>/, '')
  .replace('<link rel="stylesheet" href="css/styles.css">', () => `<style>\n${css}\n</style>`)
  .replaceAll('src="assets/eye/full.webp"', `src="${full}"`)
  .replaceAll('src="assets/eye/wide.webp"', `src="${wide}"`);
for (const lib of ['gsap.min.js', 'ScrollTrigger.min.js', 'lenis.min.js']) {
  const code = await readFile(r('vendor/' + lib), 'utf8');
  html = html.replace(`<script src="vendor/${lib}"></script>`, () => `<script>${safe(code.replace(/\/\/# sourceMappingURL=.*$/m, ''))}</script>`);
}
const assets = `window.__VISSION_ASSETS = ${JSON.stringify({ geometry, images: img })};`;
html = html.replace('<script type="module" src="js/main.js"></script>', () => `<script>${assets}</script>\n  <script>${safe(appJs)}</script>`);

for (const leftover of ['src="vendor/', 'src="js/', 'href="css/', 'url(../', 'src="assets/eye/']) {
  if (html.includes(leftover)) throw new Error('Quedó una referencia externa: ' + leftover);
}
await mkdir(r('dist'), { recursive: true });
await writeFile(r('dist/VISSION.html'), html);
console.log(`dist/VISSION.html · ${(Buffer.byteLength(html) / 1048576).toFixed(1)} MB`);
