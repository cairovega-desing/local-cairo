// Revisa que ninguna pantalla se salga por los costados (celu de 360 y 390 px), con letra del teléfono agrandada.
// Uso: ROSADA_FUENTES=carpeta-con-@fontsource node rosada/tests/responsive.js [escala de letra, ej. 1.3]
// Mide desbordes con fuentes reales y letra del teléfono agrandada (como el ajuste de Android).
const { chromium } = require('playwright');
const usarFuentes = require('./fuentes.js');
const F = process.env.ROSADA_FUENTES;
const ESCALA = +(process.argv[2] || 1.3);
(async () => {
  const b = await chromium.launch();
  let problemas = 0;
  for (const w of [360, 390]) {
    const page = await b.newPage({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await usarFuentes(page, F);
    await page.goto('file://' + require('path').join(__dirname, '..', 'dist', 'index.html') + '');
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      try { localStorage.setItem('rosada_pref_guia_campana', 'true'); localStorage.setItem('rosada_pref_guia_gobierno', 'true'); } catch (e) {}
      const R = window.R;
      const s = R.nuevaPartida({ semilla: 9, dificultad: 'normal', partido: { nombre: 'Jujapromax Federal', sigla: 'JPX', color: '#e0569b', simbolo: '🔥', bandera: { patron: 'h3', colores: ['#e0569b', '#d52b1e', '#6aa31a'], emblema: '🔥' }, ideo: 0.5, estilo: 0 }, lider: { nombre: 'Ana', avatar: R.avatarAzar() } });
      s.cola = []; R.ui.s = s;
    });
    const escalar = (k) => page.evaluate((k) => {
      // Agranda toda la letra como lo hace el tamaño de fuente de Android.
      const els = [...document.querySelectorAll('#app *, .nav-inf *')];
      const orig = els.map((el) => el.dataset.fs ? +el.dataset.fs : parseFloat(getComputedStyle(el).fontSize));
      els.forEach((el, i) => { el.dataset.fs = orig[i]; el.style.fontSize = orig[i] * k + 'px'; });
    }, k);
    const medir = (nombre) => page.evaluate((nombre) => {
      const de = document.documentElement;
      const cw = de.clientWidth;
      const fuera = [...document.querySelectorAll('#app *, .nav-inf *')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > cw + 0.5 || r.left < -0.5);
      }).filter((el) => !el.closest('.emblemas') && !el.closest('svg')).slice(0, 3)
        .map((el) => (typeof el.className === 'string' ? el.className : 'svg') + '(' + Math.round(el.getBoundingClientRect().right) + ')');
      return nombre.padEnd(22) + ' ancho ' + de.scrollWidth + '/' + cw + ' alto ' + de.scrollHeight + '/' + de.clientHeight + (fuera.length ? '  ❌ SE SALEN: ' + fuera.join(' | ') : '  ✅');
    }, nombre);
    const pantallas = [['campana', 'acciones'], ['campana', 'mapa'], ['campana', 'encuesta'], ['campana', 'diario']];
    for (const [fase, tab] of pantallas) {
      await page.evaluate((t) => { R.ui.vista = { tab: t }; R.ui.render(); window.scrollTo(0, 0); }, tab);
      await escalar(ESCALA);
      const r = await medir(w + ' ' + fase + '/' + tab);
      if (r.includes('❌')) problemas++;
      console.log(r);
    }
    // Gobierno
    await page.evaluate(() => {
      const s = R.ui.s;
      s.congreso.dip[2027] = { YO: 48, MNP: 40, PL: 22, AR: 12, UCF: 6, FT: 2 };
      s.congreso.sen[2027] = { YO: 10, MNP: 8, PL: 4, UCF: 2 };
      R.gob.iniciar(s); s.cola = []; R.gob.elegirMinistro(s, 'pragmatico');
    });
    for (const tab of ['inicio', 'economia', 'congreso', 'provincias', 'mundo', 'diario']) {
      await page.evaluate((t) => { R.ui.vista = { tab: t }; R.ui.render(); window.scrollTo(0, 0); }, tab);
      await escalar(ESCALA);
      const r = await medir(w + ' gobierno/' + tab);
      if (r.includes('❌')) problemas++;
      console.log(r);
    }

    await page.close();
  }
  console.log(problemas ? '❌ ' + problemas + ' pantallas con desborde' : '✅ Nada se sale de la pantalla');
  process.exitCode = problemas ? 1 : 0;
  await b.close();
})();
