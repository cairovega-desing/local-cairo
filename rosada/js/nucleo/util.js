// Utilidades comunes: azar con semilla (guardado en el estado), formato y fechas.
// Todos los archivos del juego cuelgan del objeto global R (funciona en navegador y en Node).
(function (R) {
  'use strict';

  R.VERSION = 1;

  R.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  R.lerp = (a, b, t) => a + (b - a) * t;
  R.round = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
  R.sum = (arr) => arr.reduce((a, b) => a + b, 0);

  // Azar Mulberry32: el estado de la semilla vive en s.rng, así guardar/cargar es reproducible.
  R.rand = function (s) {
    let t = (s.rng = (s.rng + 0x6d2b79f5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  R.randRange = (s, a, b) => a + R.rand(s) * (b - a);
  R.randInt = (s, a, b) => a + Math.floor(R.rand(s) * (b - a + 1));
  R.chance = (s, p) => R.rand(s) < p;
  R.pick = (s, arr) => arr[Math.floor(R.rand(s) * arr.length)];
  // Ruido aproximadamente normal (media 0, desvío ~1).
  R.gauss = (s) => (R.rand(s) + R.rand(s) + R.rand(s) + R.rand(s) - 2) * 1.73;
  R.weighted = function (s, items, wfn) {
    const ws = items.map(wfn);
    const total = R.sum(ws);
    if (total <= 0) return null;
    let r = R.rand(s) * total;
    for (let i = 0; i < items.length; i++) {
      r -= ws[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  };
  R.shuffle = function (s, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(R.rand(s) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Fechas: el mes 0 es enero de 2027.
  R.MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  R.MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  R.mesDelAnio = (mes) => ((mes % 12) + 12) % 12;
  R.anio = (mes) => 2027 + Math.floor(mes / 12);
  R.fechaTxt = (mes) => R.cap(R.MESES[R.mesDelAnio(mes)]) + ' ' + R.anio(mes);
  R.fechaCorta = (mes) => R.MESES_CORTOS[R.mesDelAnio(mes)] + ' ' + String(R.anio(mes)).slice(2);
  R.mesNum = (anio, mesDelAnio) => (anio - 2027) * 12 + mesDelAnio;

  R.cap = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);

  // Números con coma decimal, a la argentina.
  R.fmt = function (x, dec = 0) {
    if (!isFinite(x)) return '–';
    const s = Math.abs(x).toFixed(dec).split('.');
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (x < 0 ? '−' : '') + s.join(',');
  };
  R.pct = (x, dec = 1) => R.fmt(x, dec) + ' %';
  R.signo = (x, dec = 1) => (x > 0 ? '+' : x < 0 ? '−' : '') + R.fmt(Math.abs(x), dec);
})(globalThis.R = globalThis.R || {});
