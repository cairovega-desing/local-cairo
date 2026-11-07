// Mapa de fichas hexagonales con la forma de la Argentina (fácil de tocar en el celu).
(function (R) {
  'use strict';

  R.ABREV = {
    JUJ: 'JUJ', SAL: 'SAL', FOR: 'FOR', CAT: 'CAT', TUC: 'TUC', CHA: 'CHA', MIS: 'MIS', LRJ: 'LR', SGO: 'SDE', SFE: 'SF',
    COR: 'CTES', SJU: 'SJ', SLU: 'SL', CBA: 'CBA', ERI: 'ER', MZA: 'MZA', LPA: 'LP', BUE: 'BA', CABA: 'CABA', NQN: 'NQN',
    RNE: 'RN', CHU: 'CHU', SCR: 'SC', TDF: 'TDF', MLV: 'MLV',
  };

  const RAD = 27;
  const W = Math.sqrt(3) * RAD;
  const M = 6;

  function centro(col, fila) {
    return [M + W / 2 + col * W + (fila % 2 ? W / 2 : 0), M + RAD + fila * 1.5 * RAD];
  }
  function puntos(cx, cy, r) {
    const p = [];
    for (let i = 0; i < 6; i++) {
      const a = ((60 * i - 30) * Math.PI) / 180;
      p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return p.join(' ');
  }

  // opts: { colorDe(id), valorDe(id), alTocar(id), sel, sinMalvinas, extra: [{id, hex, nombre, color}] }
  R.ui.mapa = function (opts) {
    opts = opts || {};
    const S = R.svg;
    const fichas = R.PROVINCIAS.map((p) => ({ id: p.id, hex: p.hex, nombre: p.nombre }));
    if (!opts.sinMalvinas) fichas.push({ id: 'MLV', hex: R.MALVINAS.hex, nombre: R.MALVINAS.nombre, especial: true });
    (opts.extra || []).forEach((e) => fichas.push(e));
    let maxX = 0;
    let maxY = 0;
    let minX = 1e9;
    fichas.forEach((f) => {
      const [x, y] = centro(f.hex[0], f.hex[1]);
      maxX = Math.max(maxX, x + W / 2 + M);
      minX = Math.min(minX, x - W / 2 - M);
      maxY = Math.max(maxY, y + RAD + M);
    });
    minX = Math.min(minX, 0);
    const defs = S('defs', null,
      S('pattern', { id: 'rayas-mlv', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
        S('rect', { width: 8, height: 8, fill: '#ffffff' }), S('rect', { width: 4, height: 8, fill: '#9ccbf0' })));
    const g = [];
    // Línea de mar hasta Malvinas
    if (!opts.sinMalvinas) {
      const [x1, y1] = centro(1, 8);
      const [x2, y2] = centro(R.MALVINAS.hex[0], R.MALVINAS.hex[1]);
      g.push(S('path', { class: 'mar', d: 'M' + (x1 + 18) + ' ' + (y1 - 6) + ' Q' + (x1 + 40) + ' ' + (y2 + 10) + ' ' + (x2 - 22) + ' ' + y2 }));
    }
    for (const f of fichas) {
      const [cx, cy] = centro(f.hex[0], f.hex[1]);
      const color = f.especial && !(opts.colorDe && opts.colorDe(f.id, true)) ? 'url(#rayas-mlv)' : (opts.colorDe ? opts.colorDe(f.id) : '#ffffff') || '#ffffff';
      const val = opts.valorDe ? opts.valorDe(f.id) : null;
      const pol = S('polygon', {
        class: 'hex' + (opts.sel === f.id ? ' sel' : ''), points: puntos(cx, cy, RAD - 1.5), fill: color,
        'data-id': f.id, tabindex: opts.alTocar ? 0 : null, role: opts.alTocar ? 'button' : null, 'aria-label': f.nombre,
      });
      if (opts.alTocar) {
        pol.addEventListener('click', () => opts.alTocar(f.id));
        pol.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.alTocar(f.id); } });
      }
      pol.appendChild(S('title', null, f.nombre));
      g.push(pol);
      g.push(S('text', { class: 'nom', x: cx, y: val ? cy - 2 : cy + 4, 'text-anchor': 'middle' }, f.abrev || R.ABREV[f.id] || f.id));
      if (val) g.push(S('text', { class: 'val', x: cx, y: cy + 11, 'text-anchor': 'middle' }, val));
    }
    return S('svg', { class: 'mapa', viewBox: minX.toFixed(0) + ' 0 ' + (maxX - minX).toFixed(0) + ' ' + maxY.toFixed(0), role: 'group', 'aria-label': 'Mapa de provincias' }, defs, ...g);
  };

  // Escala de color de 0 a 100: blanco → color del partido.
  R.ui.colorEscala = function (hex, v) {
    return R.ui.aclarar(hex, R.clamp(1 - v / 100, 0.04, 0.96));
  };
})(globalThis.R = globalThis.R || {});
