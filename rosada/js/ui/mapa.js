// Mapa real de la Argentina (formas de Natural Earth en js/datos/mapa_geo.js): provincias, Malvinas y vecinos.
// opts: { colorDe(id), valorDe(id), alTocar(id), sel, sinMalvinas, sinVecinos, recorte (solo la Argentina, más grande) }
(function (R) {
  'use strict';

  R.ABREV = {
    JUJ: 'JUJ', SAL: 'SAL', FOR: 'FOR', CAT: 'CAT', TUC: 'TUC', CHA: 'CHA', MIS: 'MIS', LRJ: 'LR', SGO: 'SDE', SFE: 'SF',
    COR: 'CTES', SJU: 'SJ', SLU: 'SL', CBA: 'CBA', ERI: 'ER', MZA: 'MZA', LPA: 'LP', BUE: 'BA', CABA: 'CABA', NQN: 'NQN',
    RNE: 'RN', CHU: 'CHU', SCR: 'SC', TDF: 'TDF', MLV: 'Malvinas',
  };
  // Ajustes a mano de dónde va el nombre (en px del mapa).
  const AJUSTE = { SAL: [16, -12], CAT: [-5, 8], JUJ: [-2, 0], BUE: [4, 6], SFE: [0, 4], ERI: [1, 3], COR: [2, 0], MIS: [1, 2], TUC: [-1, 2], LRJ: [-2, 0], SCR: [4, 0], TDF: [8, -2], CHU: [0, -2] };
  const NOMBRE_PAIS = { CHL: 'Chile', BOL: 'Bolivia', PRY: 'Paraguay', BRA: 'Brasil', URY: 'Uruguay', PER: 'Perú' };

  R.ui = R.ui || {};
  R.ui.mapa = function (opts) {
    opts = opts || {};
    const S = R.svg;
    const G = R.GEO;
    const s = R.ui.s;
    const anexados = s && s.mundo ? R.PAISES.filter((p) => s.mundo.paises[p.id].anexado).map((p) => p.id) : [];
    const malvinasNuestras = !!(s && s.mundo && s.mundo.malvinas.recuperadas);
    const partes = [];
    const textos = [];
    const tocable = (el, id, nombre) => {
      if (!opts.alTocar) return el;
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', nombre);
      el.addEventListener('click', () => opts.alTocar(id));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.alTocar(id); } });
      return el;
    };
    const defs = S('defs', null,
      S('pattern', { id: 'rayas-mlv', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
        S('rect', { width: 6, height: 6, fill: '#ffffff' }), S('rect', { width: 3, height: 6, fill: '#9ccbf0' })));

    // Países vecinos (de fondo; si los anexaste, se pintan).
    if (!opts.sinVecinos) {
      for (const [id, p] of Object.entries(G.paises)) {
        const anexado = anexados.includes(id);
        const el = S('path', { class: 'vecino' + (anexado ? ' anexado' : ''), d: p.d, fill: anexado ? (opts.colorDe && opts.colorDe(id)) || '#e6d3a3' : '#e9eef5' });
        el.appendChild(S('title', null, NOMBRE_PAIS[id] + (anexado ? ' (anexado)' : '')));
        partes.push(anexado ? tocable(el, id, NOMBRE_PAIS[id]) : el);
        textos.push(S('text', { class: 'pais' + (anexado ? ' anexado' : ''), x: p.c[0], y: p.c[1], 'text-anchor': 'middle' }, anexado ? '🏴 ' + NOMBRE_PAIS[id] : NOMBRE_PAIS[id]));
      }
    }

    // Provincias.
    for (const prov of R.PROVINCIAS) {
      const g = G.prov[prov.id];
      if (!g) continue;
      const color = (opts.colorDe && opts.colorDe(prov.id)) || '#ffffff';
      const el = S('path', { class: 'prov' + (opts.sel === prov.id ? ' sel' : ''), d: g.d, fill: color, 'data-id': prov.id });
      el.appendChild(S('title', null, prov.nombre));
      partes.push(tocable(el, prov.id, prov.nombre));
      const val = opts.valorDe ? opts.valorDe(prov.id) : null;
      if (prov.id === 'CABA') {
        // Muy chiquita: un círculo para tocar y el nombre afuera.
        const [cx, cy] = g.c;
        const circ = S('circle', { class: 'prov caba' + (opts.sel === 'CABA' ? ' sel' : ''), cx, cy, r: 4.5, fill: color, 'data-id': 'CABA' });
        circ.appendChild(S('title', null, prov.nombre));
        partes.push(tocable(circ, 'CABA', prov.nombre));
        // Zona de toque más grande (invisible): con el dedo, el círculo solo es muy chico.
        if (opts.alTocar) {
          const zona = S('circle', { class: 'toque', cx, cy, r: 9, fill: 'rgba(0,0,0,0)', 'aria-hidden': 'true' });
          zona.addEventListener('click', () => opts.alTocar('CABA'));
          partes.push(zona);
        }
        textos.push(S('line', { x1: cx + 4, y1: cy - 2, x2: cx + 13, y2: cy - 9, class: 'guia-txt' }));
        textos.push(S('text', { class: 'nom', x: cx + 14, y: cy - 10, 'text-anchor': 'start' }, 'CABA' + (val ? ' ' + val : '')));
        continue;
      }
      const [ax, ay] = AJUSTE[prov.id] || [0, 0];
      const x = g.c[0] + ax;
      const y = g.c[1] + ay;
      const chica = g.w < 24 || g.h < 20;
      textos.push(S('text', { class: 'nom' + (chica ? ' chica' : ''), x, y: val ? y - 1 : y + 3, 'text-anchor': 'middle' }, R.ABREV[prov.id]));
      if (val) textos.push(S('text', { class: 'val' + (chica ? ' chica' : ''), x, y: y + 8, 'text-anchor': 'middle' }, val));
    }

    // Malvinas.
    if (!opts.sinMalvinas && G.malvinas) {
      const c = opts.colorDe && opts.colorDe('MLV', true);
      const el = S('path', { class: 'prov mlv', d: G.malvinas.d, fill: c || (malvinasNuestras ? '#9fd0f5' : 'url(#rayas-mlv)'), 'data-id': 'MLV' });
      el.appendChild(S('title', null, 'Islas Malvinas'));
      partes.push(tocable(el, 'MLV', 'Islas Malvinas'));
      textos.push(S('text', { class: 'nom chica', x: G.malvinas.c[0], y: G.malvinas.c[1] + 13, 'text-anchor': 'middle' }, 'Malvinas'));
    }

    const vb = opts.recorte ? cajaProvincias() : [0, 0, G.w, G.h];
    return S('svg', { class: 'mapa', viewBox: vb.join(' '), role: 'group', 'aria-label': 'Mapa de la Argentina' },
      defs, S('g', { class: 'formas' }, ...partes), S('g', { class: 'textos' }, ...textos));
  };

  // Recuadro de las 24 provincias (sin vecinos ni mar de más), con un margen.
  let caja = null;
  function cajaProvincias() {
    if (caja) return caja;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const g of Object.values(R.GEO.prov)) {
      const n = g.d.match(/-?[\d.]+/g) || [];
      for (let i = 0; i + 1 < n.length; i += 2) {
        x0 = Math.min(x0, +n[i]); x1 = Math.max(x1, +n[i]);
        y0 = Math.min(y0, +n[i + 1]); y1 = Math.max(y1, +n[i + 1]);
      }
    }
    const m = 4;
    caja = [x0 - m, y0 - m, x1 - x0 + 2 * m, y1 - y0 + 2 * m].map((v) => Math.round(v * 10) / 10);
    return caja;
  }

  // Marca una provincia elegida (borde dorado) y la trae adelante para que el borde no quede tapado.
  R.ui.marcarMapa = function (svg, id) {
    svg.querySelectorAll('.prov.sel').forEach((e) => e.classList.remove('sel'));
    const formas = svg.querySelector('.formas');
    svg.querySelectorAll('.prov[data-id="' + id + '"]').forEach((e) => { e.classList.add('sel'); formas.appendChild(e); });
    const zona = formas.querySelector('.toque');
    if (zona) formas.appendChild(zona);
  };

  // Escala de color de 0 a 100: blanco → color del partido.
  R.ui.colorEscala = function (hex, v) {
    return R.ui.aclarar(hex, R.clamp(1 - v / 100, 0.04, 0.96));
  };
})(globalThis.R = globalThis.R || {});
