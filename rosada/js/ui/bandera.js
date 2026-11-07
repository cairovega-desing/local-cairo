// Banderas de partido de verdad (rectangulares): diseño, colores, emblema y sigla. Sirve para tu partido y los rivales.
(function (R) {
  'use strict';

  R.BANDERA = {
    PATRONES: [
      { id: 'liso', nombre: 'Lisa', n: 1 },
      { id: 'h2', nombre: '2 franjas', n: 2 },
      { id: 'h3', nombre: '3 franjas', n: 3 },
      { id: 'v3', nombre: 'Vertical', n: 3 },
      { id: 'diagonal', nombre: 'Diagonal', n: 2 },
      { id: 'triangulo', nombre: 'Triángulo', n: 3 },
      { id: 'disco', nombre: 'Disco', n: 2 },
    ],
    COLORES: [
      { c: '#74acdf', n: 'Celeste' }, { c: '#ffffff', n: 'Blanco' }, { c: '#1f4e9c', n: 'Azul' }, { c: '#13284a', n: 'Azul marino' },
      { c: '#d52b1e', n: 'Rojo' }, { c: '#7a1f2b', n: 'Bordó' }, { c: '#f28c28', n: 'Naranja' }, { c: '#f6b40e', n: 'Amarillo' },
      { c: '#1f8f4e', n: 'Verde' }, { c: '#6aa31a', n: 'Verde claro' }, { c: '#13a89e', n: 'Turquesa' }, { c: '#6c3fb5', n: 'Violeta' },
      { c: '#e0569b', n: 'Rosa' }, { c: '#222222', n: 'Negro' },
    ],
    EMBLEMAS: ['sol', 'estrella', 'estrellas', 'ninguno', '🧉', '🐎', '🌾', '🔥', '🦅', '🐆', '🌻', '🕊️', '🌳', '🏔️', '⚓', '💡', '✊', '🤝', '🐄', '⚙️'],
  };
  const P = Object.fromEntries(R.BANDERA.PATRONES.map((p) => [p.id, p]));

  const lum = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  R.BANDERA.claro = (hex) => lum(hex) > 0.62;
  // Color «de marca»: el primero que no sea blanco.
  R.BANDERA.principal = (b) => (b.colores || []).slice(0, P[b.patron] ? P[b.patron].n : 1).find((c) => lum(c) < 0.9) || b.colores[0];
  R.BANDERA.simbolo = (b) => ({ sol: '☀️', estrella: '⭐', estrellas: '✨', ninguno: '🏳️' })[b.emblema] || b.emblema;
  R.BANDERA.azar = function () {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const patron = pick(R.BANDERA.PATRONES).id;
    const cols = R.BANDERA.COLORES.map((x) => x.c);
    const c0 = pick(cols);
    let c1 = pick(cols.filter((c) => c !== c0));
    if (Math.random() < 0.5) c1 = '#ffffff' === c0 ? pick(cols) : '#ffffff';
    return { patron, colores: [c0, c1, patron === 'h3' || patron === 'v3' ? c0 : pick(cols)], emblema: pick(R.BANDERA.EMBLEMAS), sigla: Math.random() < 0.5 };
  };
  // Bandera por defecto para partidos viejos (antes de existir el editor).
  R.BANDERA.de = (p) => p.bandera || { patron: 'liso', colores: [p.color || '#5d6b82'], emblema: p.simbolo || 'ninguno', sigla: true };

  function estrella(S, cx, cy, r, color) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.42 : r;
      pts.push((cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1));
    }
    return S('polygon', { points: pts.join(' '), fill: color });
  }
  function sol(S, cx, cy, r) {
    const out = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const largo = i % 2 ? r * 1.55 : r * 1.35;
      const p = (ang, rr) => (cx + Math.cos(ang) * rr).toFixed(1) + ',' + (cy + Math.sin(ang) * rr).toFixed(1);
      out.push(S('polygon', { points: p(a - 0.14, r * 0.8) + ' ' + p(a, largo) + ' ' + p(a + 0.14, r * 0.8), fill: '#f6b40e', stroke: '#a87800', 'stroke-width': 0.6 }));
    }
    out.push(S('circle', { cx, cy, r: r * 0.85, fill: '#f6b40e', stroke: '#a87800', 'stroke-width': 0.8 }));
    out.push(S('path', { d: `M${cx - r * 0.38} ${cy + r * 0.18} Q${cx} ${cy + r * 0.52} ${cx + r * 0.38} ${cy + r * 0.18}`, stroke: '#7a5200', 'stroke-width': 1, fill: 'none' }));
    out.push(S('circle', { cx: cx - r * 0.3, cy: cy - r * 0.15, r: r * 0.09, fill: '#7a5200' }));
    out.push(S('circle', { cx: cx + r * 0.3, cy: cy - r * 0.15, r: r * 0.09, fill: '#7a5200' }));
    return out;
  }

  // b: { patron, colores, emblema, sigla }, opts: { ancho, sigla (texto), sinBorde }
  R.ui = R.ui || {};
  R.ui.banderaPartido = function (b, opts) {
    opts = opts || {};
    const S = R.svg;
    b = b || { patron: 'liso', colores: ['#5d6b82'], emblema: 'ninguno' };
    const W = 90;
    const H = 60;
    const c = (i) => (b.colores && b.colores[i]) || (b.colores && b.colores[0]) || '#5d6b82';
    const fondo = [];
    let centro = [45, 30];
    let colorCentro = c(0);
    switch (b.patron) {
      case 'h2': fondo.push(S('rect', { width: W, height: 30, fill: c(0) }), S('rect', { y: 30, width: W, height: 30, fill: c(1) })); colorCentro = c(0); centro = [45, 16]; break;
      case 'h3': fondo.push(S('rect', { width: W, height: 20.5, fill: c(0) }), S('rect', { y: 20, width: W, height: 20.5, fill: c(1) }), S('rect', { y: 40, width: W, height: 20, fill: c(2) })); colorCentro = c(1); break;
      case 'v3': fondo.push(S('rect', { width: 30.5, height: H, fill: c(0) }), S('rect', { x: 30, width: 30.5, height: H, fill: c(1) }), S('rect', { x: 60, width: 30, height: H, fill: c(2) })); colorCentro = c(1); break;
      case 'diagonal': fondo.push(S('rect', { width: W, height: H, fill: c(1) }), S('polygon', { points: '0,0 90,0 0,60', fill: c(0) })); colorCentro = c(0); centro = [28, 19]; break;
      case 'triangulo': fondo.push(S('rect', { width: W, height: 30, fill: c(0) }), S('rect', { y: 30, width: W, height: 30, fill: c(1) }), S('polygon', { points: '0,0 40,30 0,60', fill: c(2) })); colorCentro = c(2); centro = [14, 30]; break;
      case 'disco': fondo.push(S('rect', { width: W, height: H, fill: c(0) }), S('circle', { cx: 45, cy: 30, r: 19, fill: c(1) })); colorCentro = c(1); break;
      default: fondo.push(S('rect', { width: W, height: H, fill: c(0) }));
    }
    const contraste = R.BANDERA.claro(colorCentro) ? '#13284a' : '#ffffff';
    const sigla = b.sigla && opts.sigla ? String(opts.sigla).slice(0, 5) : '';
    const emb = [];
    const [cx, cy0] = centro;
    const conSigla = sigla && b.emblema !== 'ninguno';
    const cy = conSigla && b.patron !== 'h2' ? cy0 - 5 : cy0;
    const tam = b.patron === 'triangulo' || b.patron === 'diagonal' ? 10 : 12;
    if (b.emblema === 'sol') emb.push(...sol(S, cx, cy, tam * 0.8));
    else if (b.emblema === 'estrella') emb.push(estrella(S, cx, cy, tam, contraste === '#ffffff' ? '#ffffff' : '#f6b40e'));
    else if (b.emblema === 'estrellas') [-14, 0, 14].forEach((dx) => emb.push(estrella(S, cx + dx * (tam / 12), cy, tam * 0.55, contraste === '#ffffff' ? '#ffffff' : '#f6b40e')));
    else if (b.emblema && b.emblema !== 'ninguno') emb.push(S('text', { x: cx, y: cy + tam * 0.62, 'text-anchor': 'middle', style: `font-size:${tam * 1.75}px` }, b.emblema));
    if (sigla) {
      const soloSigla = b.emblema === 'ninguno';
      const y = soloSigla ? cy0 + 8 : b.patron === 'h2' ? 51 : cy0 + 20;
      const colorSigla = b.patron === 'h2' && !soloSigla ? (R.BANDERA.claro(c(1)) ? '#13284a' : '#ffffff') : contraste;
      emb.push(S('text', {
        x: soloSigla ? 45 : b.patron === 'h2' ? 45 : cx, y, 'text-anchor': 'middle',
        style: `font-family: var(--f-titulo); font-size:${soloSigla ? Math.min(24, 120 / Math.max(2, sigla.length)) : 11}px; letter-spacing: 0.5px`,
        fill: colorSigla, stroke: colorSigla === '#ffffff' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)', 'stroke-width': 0.6,
      }, sigla));
    }
    const ancho = opts.ancho || 60;
    return S('svg', { viewBox: '0 0 90 60', width: ancho, height: (ancho * 2) / 3, class: 'bandera-partido' + (opts.sinBorde ? ' sin-borde' : ''), role: 'img', 'aria-label': 'Bandera' + (sigla ? ' de ' + sigla : '') },
      S('defs', null, S('clipPath', { id: 'cb' }, S('rect', { width: 90, height: 60, rx: 4 }))),
      S('g', { 'clip-path': 'url(#cb)' }, ...fondo, ...emb));
  };
})(globalThis.R = globalThis.R || {});
