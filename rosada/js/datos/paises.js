// Países del mundo (versión simple): poder militar, cuánto comercian, bloque y si son conquistables.
// ideo: cómo piensa su gobierno (−1 … +1). expo: cuánto suben tus exportaciones con un tratado.
// fichas: dónde aparecen en tu mapa si los anexás. tam: cuánto crece tu economía si los anexás.
// Todos se pueden conquistar salvo los que dicen noConquistable (con el motivo).
(function (R) {
  'use strict';

  R.PAISES = [
    { id: 'BRA', nombre: 'Brasil', poder: 60, ideo: -0.2, rel: 50, bloque: 'mercosur', expo: 0.07, prestamo: 6, conquistable: true, tam: 1.0,
      fichas: [{ id: 'BRA1', hex: [5, 0], abrev: 'BRA' }, { id: 'BRA2', hex: [5, 1], abrev: 'BRA' }, { id: 'BRA3', hex: [5, 2], abrev: 'BRA' }] },
    { id: 'CHL', nombre: 'Chile', poder: 45, ideo: 0.2, rel: 45, bloque: 'pacifico', expo: 0.04, conquistable: true, tam: 0.4,
      fichas: [{ id: 'CHL1', hex: [0, 1], abrev: 'CHI' }, { id: 'CHL2', hex: [0, 2], abrev: 'CHI' }, { id: 'CHL3', hex: [0, 4], abrev: 'CHI' }, { id: 'CHL4', hex: [0, 6], abrev: 'CHI' }] },
    { id: 'URY', nombre: 'Uruguay', poder: 12, ideo: -0.1, rel: 65, bloque: 'mercosur', expo: 0.02, conquistable: true, tam: 0.08,
      fichas: [{ id: 'URY1', hex: [4, 3], abrev: 'URU' }] },
    { id: 'PRY', nombre: 'Paraguay', poder: 15, ideo: 0.5, rel: 55, bloque: 'mercosur', expo: 0.02, conquistable: true, tam: 0.07,
      fichas: [{ id: 'PRY1', hex: [4, 0], abrev: 'PAR' }] },
    { id: 'BOL', nombre: 'Bolivia', poder: 18, ideo: -0.5, rel: 50, bloque: null, expo: 0.02, conquistable: true, tam: 0.07,
      fichas: [{ id: 'BOL1', hex: [1, -1], abrev: 'BOL' }, { id: 'BOL2', hex: [2, -1], abrev: 'BOL' }] },
    { id: 'PER', nombre: 'Perú', poder: 30, ideo: 0.2, rel: 50, bloque: 'pacifico', expo: 0.02, tam: 0.4 },
    { id: 'VEN', nombre: 'Venezuela', poder: 28, ideo: -0.9, rel: 35, bloque: 'oriental', expo: 0.01, tam: 0.15 },
    { id: 'USA', nombre: 'Estados Unidos', poder: 100, ideo: 0.6, rel: 50, bloque: 'otan', expo: 0.05, prestamo: 12, potencia: true, tam: 3.5 },
    { id: 'CHN', nombre: 'China', poder: 90, ideo: -0.6, rel: 50, bloque: 'oriental', expo: 0.08, prestamo: 10, potencia: true, tam: 3.5 },
    { id: 'RUS', nombre: 'Rusia', poder: 80, ideo: -0.3, rel: 35, bloque: 'oriental', expo: 0.01, potencia: true, tam: 0.8 },
    { id: 'GBR', nombre: 'Reino Unido', poder: 75, ideo: 0.4, rel: 15, bloque: 'otan', expo: 0.02, potencia: true, tam: 1.0 },
    { id: 'UE', nombre: 'Unión Europea', poder: 70, ideo: 0.0, rel: 50, bloque: 'otan', expo: 0.05, prestamo: 8, potencia: true, noConquistable: 'Es un bloque de 27 países' },
  ];
  R.PAIS = Object.fromEntries(R.PAISES.map((p) => [p.id, p]));
  // PBI de cada país en miles de millones de dólares (aproximado) para el ranking de potencias.
  R.PBI_PAIS = { BRA: 2200, CHL: 330, URY: 80, PRY: 45, BOL: 48, PER: 270, VEN: 100, USA: 28000, CHN: 18500, RUS: 2000, GBR: 3300, UE: 19000 };
  R.SUDAMERICA = ['BRA', 'CHL', 'URY', 'PRY', 'BOL', 'PER', 'VEN'];
  R.VECINOS = ['BRA', 'CHL', 'URY', 'PRY', 'BOL'];
  R.BLOQUES_MUNDO = {
    mercosur: { nombre: 'Mercosur', emoji: '🤝' },
    pacifico: { nombre: 'Pacífico', emoji: '🌊' },
    otan: { nombre: 'OTAN', emoji: '🛡️' },
    oriental: { nombre: 'Eje China-Rusia', emoji: '🐉' },
  };

  // Banderas simples dibujadas con SVG (las banderas emoji no se ven en Windows).
  R.ui = R.ui || {};
  R.ui.bandera = function (id, ancho) {
    const S = R.svg;
    const W = 60;
    const H = 40;
    const franjas = (cols, vertical) => cols.map((c, i) => vertical
      ? S('rect', { x: (i * W) / cols.length, y: 0, width: W / cols.length + 0.5, height: H, fill: c })
      : S('rect', { x: 0, y: (i * H) / cols.length, width: W, height: H / cols.length + 0.5, fill: c }));
    const estrella = (cx, cy, r, color) => {
      const p = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r * 0.45 : r;
        p.push((cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1));
      }
      return S('polygon', { points: p.join(' '), fill: color });
    };
    let partes = [];
    switch (id) {
      case 'ARG': partes = franjas(['#74acdf', '#ffffff', '#74acdf']).concat([S('circle', { cx: 30, cy: 20, r: 4.5, fill: '#f6b40e', stroke: '#a87800', 'stroke-width': 0.8 })]); break;
      case 'BRA': partes = [S('rect', { width: W, height: H, fill: '#169b45' }), S('polygon', { points: '30,4 56,20 30,36 4,20', fill: '#fedd00' }), S('circle', { cx: 30, cy: 20, r: 8.5, fill: '#012169' })]; break;
      case 'CHL': partes = [S('rect', { width: W, height: H, fill: '#d52b1e' }), S('rect', { width: W, height: 20, fill: '#ffffff' }), S('rect', { width: 20, height: 20, fill: '#0039a6' }), estrella(10, 10, 5, '#ffffff')]; break;
      case 'URY': partes = franjas(['#ffffff', '#0038a8', '#ffffff', '#0038a8', '#ffffff', '#0038a8', '#ffffff', '#0038a8', '#ffffff']).concat([S('rect', { width: 24, height: 22, fill: '#ffffff' }), S('circle', { cx: 12, cy: 11, r: 6, fill: '#fcd116', stroke: '#7b3f00', 'stroke-width': 0.6 })]); break;
      case 'PRY': partes = franjas(['#d52b1e', '#ffffff', '#0038a8']).concat([S('circle', { cx: 30, cy: 20, r: 4, fill: 'none', stroke: '#00843d', 'stroke-width': 1.2 })]); break;
      case 'BOL': partes = franjas(['#d52b1e', '#f9e300', '#007934']); break;
      case 'PER': partes = franjas(['#d91023', '#ffffff', '#d91023'], true); break;
      case 'VEN': partes = franjas(['#ffcc00', '#00247d', '#cf142b']).concat([0, 1, 2, 3, 4, 5, 6, 7].map((i) => S('circle', { cx: 30 + Math.cos(Math.PI * (1 - i / 7)) * 9, cy: 22 - Math.sin(Math.PI * (1 - i / 7)) * 6, r: 1.2, fill: '#ffffff' }))); break;
      case 'USA': partes = franjas(['#b22234', '#ffffff', '#b22234', '#ffffff', '#b22234', '#ffffff', '#b22234']).concat([S('rect', { width: 26, height: 21.5, fill: '#3c3b6e' })]).concat([0, 1, 2].flatMap((f) => [0, 1, 2, 3].map((c) => S('circle', { cx: 4 + c * 6, cy: 4 + f * 6.5, r: 1.1, fill: '#ffffff' })))); break;
      case 'CHN': partes = [S('rect', { width: W, height: H, fill: '#de2910' }), estrella(12, 12, 7, '#ffde00'), estrella(23, 5, 2, '#ffde00'), estrella(26, 10, 2, '#ffde00'), estrella(26, 16, 2, '#ffde00'), estrella(23, 21, 2, '#ffde00')]; break;
      case 'RUS': partes = franjas(['#ffffff', '#0039a6', '#d52b1e']); break;
      case 'GBR': partes = [S('rect', { width: W, height: H, fill: '#012169' }), S('path', { d: 'M0 0 L60 40 M60 0 L0 40', stroke: '#ffffff', 'stroke-width': 8 }), S('path', { d: 'M0 0 L60 40 M60 0 L0 40', stroke: '#c8102e', 'stroke-width': 2.6 }),
        S('path', { d: 'M30 0 V40 M0 20 H60', stroke: '#ffffff', 'stroke-width': 12 }), S('path', { d: 'M30 0 V40 M0 20 H60', stroke: '#c8102e', 'stroke-width': 7 })]; break;
      case 'UE': partes = [S('rect', { width: W, height: H, fill: '#003399' })].concat(Array.from({ length: 12 }, (_, i) => estrella(30 + Math.cos((i * Math.PI) / 6) * 11, 20 + Math.sin((i * Math.PI) / 6) * 11, 2.2, '#ffcc00'))); break;
      default: partes = [S('rect', { width: W, height: H, fill: '#ccc' })];
    }
    return S('svg', { viewBox: '0 0 60 40', width: ancho || 42, height: ((ancho || 42) * 2) / 3, class: 'bandera', role: 'img', 'aria-label': 'Bandera de ' + ((R.PAIS[id] && R.PAIS[id].nombre) || 'Argentina') }, ...partes);
  };
})(globalThis.R = globalThis.R || {});
