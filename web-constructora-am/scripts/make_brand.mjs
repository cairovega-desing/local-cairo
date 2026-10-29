// Genera public/images/logo-icon.png (512×512) y public/images/og.jpg (1200×630)
// a partir del logo en vector, usando el Chromium de Playwright.
// Uso: node scripts/make_brand.mjs   (requiere `playwright` instalado)
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

// require (y no import) para que también encuentre una instalación global de Playwright.
const { chromium } = createRequire(import.meta.url)("playwright");

const root = new URL("../", import.meta.url).pathname;
const favicon = readFileSync(`${root}public/favicon.svg`, "utf8");

const mark = `<svg viewBox="0 0 640 356" width="440"><defs><linearGradient id="o" x1="0" y1="0" x2="640" y2="356" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7a5522"/><stop offset=".35" stop-color="#b8893f"/><stop offset=".5" stop-color="#e3c27e"/><stop offset=".65" stop-color="#a97b34"/><stop offset="1" stop-color="#6e4e1e"/></linearGradient><clipPath id="b"><rect width="640" height="356"/></clipPath></defs><polyline points="6,392 245,40 395,322 475,170 623.6,392" fill="none" stroke="url(#o)" stroke-width="32" stroke-linejoin="miter" stroke-miterlimit="12" clip-path="url(#b)"/><polygon points="175,223 325,223 325,259 150,259" fill="url(#o)"/></svg>`;

const og = `<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap" rel="stylesheet">
<style>body{margin:0;width:1200px;height:630px;display:flex;align-items:center;justify-content:center;font-family:Montserrat,sans-serif;
background:radial-gradient(ellipse at 20% 0%,#fbf5ea 0%,#efe4d3 55%,#e6d6bf 100%);color:#3a2814;text-align:center}
.c{margin-top:34px;font-size:34px;font-weight:500;letter-spacing:.42em;padding-left:.42em}
.am{display:flex;align-items:center;justify-content:center;gap:34px;margin-top:6px;font-size:58px;font-weight:700;color:#7a5520}
.l{width:150px;height:3px;background:linear-gradient(90deg,#a97b34,#e3c27e)}
.s{margin-top:18px;font-size:19px;letter-spacing:.22em}</style></head>
<body><div>${mark}<div class="c">CONSTRUCTORA</div><div class="am"><span class="l"></span>A&amp;M<span class="l"></span></div><div class="s">TU PROYECTO, NUESTRA BASE</div></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
await page.setContent(`<html><body style="margin:0;background:transparent">${favicon.replace("<svg ", '<svg width="512" height="512" ')}</body></html>`);
await page.screenshot({ path: `${root}public/images/logo-icon.png`, omitBackground: true });
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(og, { waitUntil: "networkidle" });
await page.screenshot({ path: `${root}public/images/og.jpg`, type: "jpeg", quality: 88 });
await browser.close();
console.log("logo-icon.png y og.jpg generados");
