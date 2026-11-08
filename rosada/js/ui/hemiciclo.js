// Hemiciclo del Congreso: una banca = un puntito, coloreado por partido (de izquierda a derecha).
(function (R) {
  'use strict';

  // grupos: [{id, n, color, borde?}] ya ordenados; opts: {filas, centro, sub, resaltar}
  R.ui.hemiciclo = function (grupos, opts) {
    opts = opts || {};
    const S = R.svg;
    const N = grupos.reduce((a, g) => a + g.n, 0);
    const filas = opts.filas || (N > 150 ? 9 : N > 60 ? 5 : 4);
    const r0 = 42;
    const r1 = 98;
    const radios = Array.from({ length: filas }, (_, i) => (filas === 1 ? r1 : r0 + ((r1 - r0) * i) / (filas - 1)));
    const sumaR = R.sum(radios);
    const porFila = radios.map((r) => Math.round((N * r) / sumaR));
    let dif = N - R.sum(porFila);
    for (let i = filas - 1; dif !== 0; i = (i - 1 + filas) % filas) {
      porFila[i] += Math.sign(dif);
      dif -= Math.sign(dif);
    }
    const pos = [];
    radios.forEach((r, i) => {
      const n = porFila[i];
      for (let j = 0; j < n; j++) {
        const a = n === 1 ? Math.PI / 2 : Math.PI * (1 - j / (n - 1));
        pos.push({ a, r, x: Math.cos(a) * r, y: -Math.sin(a) * r });
      }
    });
    pos.sort((p, q) => q.a - p.a || p.r - q.r);
    const radioPunto = Math.min(((r1 - r0) / Math.max(1, filas - 1)) * 0.42, (Math.PI * r0) / Math.max(1, porFila[0]) * 0.45, 6);
    const puntos = [];
    let k = 0;
    for (const g of grupos) {
      for (let i = 0; i < g.n; i++, k++) {
        const p = pos[k];
        if (!p) continue;
        puntos.push(S('circle', {
          cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: radioPunto.toFixed(2), fill: g.color,
          stroke: g.borde || '#13284a', 'stroke-width': opts.resaltar && opts.resaltar !== g.id ? 0.4 : 0.9,
          opacity: opts.resaltar && opts.resaltar !== g.id ? 0.55 : 1,
          'data-g': g.id,
        }));
      }
    }
    const textos = [];
    if (opts.centro !== undefined) textos.push(S('text', { x: 0, y: -8, 'text-anchor': 'middle', style: 'font-family: var(--f-titulo); font-size: 26px; fill: currentColor' }, String(opts.centro)));
    if (opts.sub) textos.push(S('text', { x: 0, y: 6, 'text-anchor': 'middle', style: 'font-size: 10px; font-weight: 900; fill: currentColor; opacity: .75' }, opts.sub));
    return S('svg', { class: 'hemiciclo', viewBox: '-104 -104 208 114', role: 'img', 'aria-label': opts.titulo || 'Hemiciclo' }, ...puntos, ...textos);
  };

  // Ordena una composición {partido: bancas} de izquierda a derecha con sus colores.
  R.ui.gruposCamara = function (s, comp) {
    return Object.entries(comp)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => {
        const p = R.partidoInfo(s, id);
        return { id, n, color: p.color, ideo: p.ideo ?? 0 };
      })
      .sort((a, b) => a.ideo - b.ideo);
  };
})(globalThis.R = globalThis.R || {});
