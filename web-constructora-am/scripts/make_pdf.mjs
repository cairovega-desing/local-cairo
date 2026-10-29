// Genera Constructora-AM.pdf: la web entera como una sola página larga, en formato celular.
// Sirve para mandar por WhatsApp a cualquier teléfono (los PDF se abren siempre, también en iPhone).
// Los botones de WhatsApp, teléfono y Google Maps siguen siendo links que se pueden tocar.
// Uso: npm run pdf   (necesita Constructora-AM.html, que arma `npm run single`, y Playwright)
import { createRequire } from "node:module";

// require (y no import) para que también encuentre una instalación global de Playwright.
const { chromium } = createRequire(import.meta.url)("playwright");

const root = new URL("../", import.meta.url).pathname;
const WIDTH = 420;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: 860 }, reducedMotion: "reduce" });
await page.goto(`file://${root}Constructora-AM.html`);
await page.waitForTimeout(1500);

// Recorrer la página para que todo aparezca (animaciones de entrada y contadores).
const total = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < total; y += 600) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(60);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);

// Ajustes solo para el PDF.
await page.evaluate(() => {
  const hide = (el) => el && (el.style.display = "none");
  // La portada mide «una pantalla» (100svh); en el PDF la pantalla sería toda la página: se fija en px.
  const hero = document.getElementById("inicio");
  hero.style.minHeight = `${window.innerHeight}px`;
  // Elementos que no tienen sentido en papel: botón flotante, barra de progreso, controles de la portada y el mapa.
  hide(document.querySelector('a[href^="https://wa.me"].size-14')?.parentElement);
  hide(document.querySelector('[aria-hidden="true"].fixed.inset-x-0.top-0'));
  hide(document.querySelector("#inicio .absolute.inset-x-0.bottom-0"));
  hide(document.querySelector("#ubicacion iframe")?.closest("[data-reveal]"));
  // Todas las respuestas de preguntas frecuentes abiertas.
  document.querySelectorAll('#preguntas [role="region"]').forEach((r) => {
    r.style.height = "auto";
    r.style.opacity = "1";
    r.removeAttribute("aria-hidden");
  });
  document.querySelectorAll("#preguntas button[aria-expanded] > span").forEach((x) => (x.style.display = "none"));
  // En papel no hay «hoy»: sin resaltar el día. Y el formulario no se puede usar: queda el botón de WhatsApp.
  document.querySelectorAll('#ubicacion tr[aria-current]').forEach((tr) => {
    tr.className = "text-muted";
    tr.querySelector("th span")?.remove();
  });
  hide(document.querySelector("#presupuesto form")?.closest("[data-reveal]"));
  // Reseñas: en vez de la cinta que se mueve, todas una debajo de la otra y sin repetir.
  document.querySelectorAll(".animate-marquee, .animate-marquee-reverse").forEach((row, i) => {
    const wrap = row.parentElement;
    if (i > 0) return hide(wrap);
    const vistos = new Set();
    const cards = [...document.querySelectorAll("#opiniones figure")].filter((f) => {
      const k = f.textContent;
      if (vistos.has(k) || f.closest('[aria-hidden="true"]')) return false;
      vistos.add(k);
      return true;
    });
    const list = document.createElement("div");
    list.style.cssText = "display:grid;gap:16px;padding:0 16px";
    cards.forEach((c) => {
      c.style.width = "auto";
      list.appendChild(c);
    });
    wrap.replaceWith(list);
  });
});
await page.addStyleTag({
  content: "[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}",
});
await page.waitForTimeout(800);

const height = await page.evaluate(() => document.documentElement.scrollHeight);
await page.emulateMedia({ media: "screen" });
await page.pdf({
  path: `${root}Constructora-AM.pdf`,
  width: `${WIDTH}px`,
  height: `${height + 2}px`,
  printBackground: true,
  pageRanges: "1",
});
await browser.close();
console.log(`Listo: Constructora-AM.pdf (${WIDTH}×${height}px)`);
