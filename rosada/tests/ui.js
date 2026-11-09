// Recorre el juego con Playwright como si fuera un jugador y saca capturas.
// Uso: node rosada/tests/ui.js [carpeta-capturas] [celu|pc] [meses-de-gobierno]
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const usarFuentes = require('./fuentes.js');

const RAIZ = path.join(__dirname, '..');
const OUT = process.argv[2] || path.join(RAIZ, 'tests', 'capturas');
const MODO = process.argv[3] || 'celu';
const MESES_GOB = +(process.argv[4] || 6);
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(MODO === 'pc' ? { viewport: { width: 1280, height: 820 } } : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text()) && !/ERR_/.test(m.text())) errores.push('console: ' + m.text()); });
  await usarFuentes(page);
  await page.goto('file://' + path.join(RAIZ, 'dist', 'index.html'));
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();
  let n = 0;
  const foto = async (nombre, full) => { await page.waitForTimeout(250); await page.screenshot({ path: path.join(OUT, MODO + '-' + String(++n).padStart(2, '0') + '-' + nombre + '.png'), fullPage: !!full }); };

  await foto('portada', true);
  await page.click('text=Nueva partida');
  await foto('crear-1');
  await page.click('text=Siguiente');
  await foto('crear-2');
  await page.click('text=Siguiente');
  await page.locator('#rg-ideo').fill('1');
  await foto('crear-3', true);
  await page.click('text=Siguiente');
  await foto('crear-4', true);
  await page.click('text=Fundar el partido');
  await foto('intro');
  await page.click('.capa .boton');
  await foto('campana', true);

  const capturados = new Set();
  const capaAbierta = () => page.locator('#capa:not([hidden])').count();
  let pasos = 0;
  let mesesGob = 0;
  while (pasos++ < 1500) {
    if (errores.length > 5) break;
    if (await capaAbierta()) {
      const capa = page.locator('#capa');
      const txt = await capa.innerText();
      const tipo = (await capa.locator('.opcion-noticia').count()) ? 'noticia'
        : (await capa.locator('.estilos').count()) ? 'debate'
        : (await capa.locator('.noche').count()) ? 'eleccion'
        : /asume la Presidencia/.test(txt) ? 'asuncion'
        : /Resumen del mes/.test(txt) ? 'resumen'
        : /maneja la economía/.test(txt) ? 'ministro'
        : /Presupuesto 20/.test(txt) ? 'presupuesto'
        : /Tu gran objetivo/.test(txt) ? 'legado'
        : /Se viene en|Se viene el mes/i.test(txt) ? 'aviso-mundo'
        : /Meta cumplida|No llegaste|Cumpliste tu gran objetivo/.test(txt) ? 'meta'
        : /nos atacó/.test(txt) ? 'atacado'
        : /Poder \d+%/.test(txt) && (await capa.locator('.item-elegir').count()) === 3 ? 'protesta'
        : /Guerra con|Nos atacó/.test(txt) ? 'guerra' : 'otra';
      if (!capturados.has(tipo)) { capturados.add(tipo); await foto(tipo); }
      if (tipo === 'noticia') { await capa.locator('.opcion-noticia:not([disabled])').first().click(); continue; }
      if (tipo === 'debate') { await capa.locator('.estilos .boton').first().click(); continue; }
      if (tipo === 'guerra') {
        // Usa las acciones con ⭐ que pueda (abre el detalle y la hace) y después da la orden de atacar.
        const acc = capa.locator('.acc-g:not(.orden):not(.apagada)');
        if (await acc.count()) {
          await acc.first().click();
          if (!capturados.has('guerra-detalle')) { capturados.add('guerra-detalle'); await foto('guerra-detalle'); }
          await capa.locator('.boton:has-text("Hacerlo")').click();
          await page.waitForTimeout(200);
          continue;
        }
        await capa.locator('.acc-g.orden').first().click();
        continue;
      }
      if (tipo === 'presupuesto' && (await capa.locator('text=Que voten').count())) {
        await capa.locator('text=Que voten').click();
        await capa.locator('.boton:has-text("eguir")').waitFor({ timeout: 20000 });
        await foto('presupuesto-votado');
        await capa.locator('.boton:has-text("eguir")').click();
        continue;
      }
      if (tipo === 'eleccion') {
        const saltar = capa.locator('text=Ver resultado');
        if (await saltar.count()) await saltar.click();
        await page.waitForTimeout(400);
        await foto('eleccion-fin', true);
      }
      const items = capa.locator('.item-elegir:not([disabled])');
      if (await items.count()) { await items.first().click(); continue; }
      const botones = capa.locator('.boton:not(.cerrar):not([disabled])');
      const k = await botones.count();
      if (k) await botones.nth(k - 1).click();
      else await page.keyboard.press('Escape');
      continue;
    }
    const fase = await page.evaluate(() => window.R.ui.s && window.R.ui.s.fase);
    if (fase === 'campana') {
      const acciones = page.locator('.accion:not([disabled])');
      const agenda = await page.evaluate(() => window.R.ui.s.camp.agenda);
      if (agenda > 0 && (await acciones.count())) {
        const i = Math.floor(Math.random() * Math.min(3, await acciones.count()));
        await acciones.nth(i).click();
        if (await capaAbierta()) {
          if (!capturados.has('elegir')) { capturados.add('elegir'); await foto('elegir'); }
          const hex = page.locator('#capa .prov');
          if (await hex.count()) {
            // Como un jugador atento: va a la provincia marcada con ⭐ (la que más votos suma).
            const mejor = await page.evaluate(() => window.R.camp.mejorActo(window.R.ui.s));
            await page.locator('#capa path.prov[data-id="' + mejor + '"]').click({ force: true });
            const b = page.locator('#capa .boton:has-text("Hacer el acto")');
            if (await b.isEnabled()) await b.click(); else await page.locator('#capa .cerrar').click();
          } else {
            const it = page.locator('#capa .item-elegir:not([disabled])');
            if (await it.count()) await it.first().click(); else await page.locator('#capa .cerrar').click();
          }
        }
        continue;
      }
      if (!capturados.has('campana-tarde')) { capturados.add('campana-tarde'); await foto('campana-tarde', true); }
      await page.click('#btn-pasar');
    } else if (fase === 'gobierno') {
      if (mesesGob++ >= MESES_GOB) break;
      if (mesesGob === 2) {
        await foto('gobierno', true);
        await page.click('.pestanas button:has-text("Economía")');
        await foto('economia', true);
        await page.click('.area:nth-child(3) .area-control .boton:last-child');
        await page.click('.area:nth-child(8) .area-control .boton:first-child');
        await foto('economia-cambio');
        await page.click('.pestanas button:has-text("Inicio")');
        await page.click('.persona >> nth=5');
        await foto('grupo');
        await page.click('#capa .cerrar');
        await page.click('.indicador >> nth=0');
        await foto('porque');
        await page.click('#capa .cerrar');
        const acc = page.locator('.accion:not([disabled])');
        if (await acc.count()) { await acc.first().click(); await foto('accion-gob'); }
        // Congreso: abrir una ley, negociar y votar
        await page.click('.pestanas button:has-text("Congreso")');
        await foto('congreso', true);
        const leyes = page.locator('.ley-fila:not([disabled])');
        if (await leyes.count()) {
          await leyes.nth(2).click();
          await foto('ley');
          const neg = page.locator('#capa .item-elegir .boton:not([disabled])');
          if (await neg.count()) await neg.first().click();
          const votar = page.locator('#capa .boton:has-text("Votar"):not([disabled])');
          if (await votar.count()) {
            await votar.click();
            await page.waitForTimeout(2500);
            await foto('votacion');
            const seguir = page.locator('#capa .boton:has-text("eguir")');
            await seguir.waitFor({ timeout: 15000 });
            await seguir.click();
          } else if (await capaAbierta()) await page.locator('#capa .cerrar').click();
        }
        // Provincias: tocar Córdoba y mandarle algo
        await page.click('.pestanas button:has-text("Mapa")');
        await page.click('path[data-id="CBA"]');
        await foto('provincias', true);
        const bp = page.locator('.acciones-prov .boton:not([disabled])');
        if (await bp.count()) await bp.first().click();
        await page.click('.pestanas button:has-text("Inicio")');
      }
      if (mesesGob === 3) {
        await page.evaluate(() => { window.R.ui.s.gob.pc = 20; });
        await page.click('.pestanas button:has-text("Mundo")');
        await foto('mundo', true);
        await page.click('.pais-carta:has-text("Uruguay")');
        await foto('pais');
        await page.click('#capa .item-elegir:has-text("Declarar")');
        await foto('pais-guerra');
        await page.click('#capa .boton:has-text("A la guerra")');
        await page.waitForTimeout(300);
        await foto('mundo-guerra', true);
        await page.click('.pestanas button:has-text("Inicio")');
      }
      await page.click('#btn-pasar');
    } else break;
  }
  await foto('final', true);
  const estado = await page.evaluate(() => ({ fase: window.R.ui.s && window.R.ui.s.fase, mes: window.R.ui.s && window.R.ui.s.mes }));
  console.log('Estado final:', JSON.stringify(estado), '· capturas en', OUT);
  if (errores.length) { console.log('❌ Errores:\n' + errores.join('\n')); process.exitCode = 1; } else console.log('✅ Sin errores de consola');
  await browser.close();
})();
