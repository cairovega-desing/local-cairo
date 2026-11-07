// Avatar dibujado con SVG: piel, pelo, anteojos, barba, ropa, humor y banda presidencial.
(function (R) {
  'use strict';

  R.AV = {
    piel: ['#f6d2b8', '#e9b590', '#c98d64', '#a06944', '#6e4529'],
    colorPelo: ['#1e1a19', '#4a2e1c', '#8b5a2b', '#dba54a', '#b9b9b9', '#a6432a'],
    ropa: ['#1f3b6e', '#3a3a42', '#7a1f2b', '#2b6e4a', '#5a4a8a'],
    pelo: ['Corto', 'Al costado', 'Largo', 'Melena', 'Jopo', 'Pelado'],
    anteojos: ['Sin', 'Redondos', 'Cuadrados'],
    barba: ['Sin', 'Bigote', 'Barba'],
  };

  const oscurecer = (hex, k) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (x) => Math.round(x * (1 - k));
    return 'rgb(' + f((n >> 16) & 255) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
  };

  R.ui = R.ui || {};
  R.ui.avatar = function (av, opts) {
    opts = opts || {};
    const S = R.svg;
    av = av || {};
    const piel = R.AV.piel[av.piel || 0];
    const pelo = R.AV.colorPelo[av.colorPelo || 0];
    const ropa = R.AV.ropa[av.ropa || 0];
    const size = opts.size || 56;
    const humor = opts.humor || 'normal';
    const partes = [];

    partes.push(S('circle', { cx: 50, cy: 50, r: 50, fill: opts.fondo || '#dbeefb' }));
    // Pelo de atrás (largo y melena)
    if (av.pelo === 2) partes.push(S('path', { d: 'M29 40 C28 20 40 14 50 14 C60 14 72 20 71 40 L73 70 C66 74 60 67 62 52 L38 52 C40 67 34 74 27 70 Z', fill: pelo }));
    if (av.pelo === 3) partes.push(S('path', { d: 'M28 42 C27 21 39 15 50 15 C61 15 73 21 72 42 L72 59 C66 61 63 57 64 50 L36 50 C37 57 34 61 28 59 Z', fill: pelo }));
    // Cuerpo
    partes.push(S('path', { d: 'M12 100 C14 79 31 70 50 70 C69 70 86 79 88 100 Z', fill: ropa }));
    partes.push(S('path', { d: 'M42 71 L50 85 L58 71 Z', fill: '#ffffff' }));
    if (!opts.banda) partes.push(S('path', { d: 'M48.5 76 L51.5 76 L53 93 L50 97 L47 93 Z', fill: opts.corbata || '#c43b3b' }));
    // Cuello y cabeza
    partes.push(S('rect', { x: 43, y: 57, width: 14, height: 15, rx: 4, fill: oscurecer(piel, 0.1) }));
    partes.push(S('circle', { cx: 31, cy: 45, r: 4.5, fill: oscurecer(piel, 0.05) }));
    partes.push(S('circle', { cx: 69, cy: 45, r: 4.5, fill: oscurecer(piel, 0.05) }));
    partes.push(S('ellipse', { cx: 50, cy: 43, rx: 19, ry: 22, fill: piel }));
    // Cachetes
    partes.push(S('circle', { cx: 39, cy: 51, r: 3.2, fill: '#ff7b7b', opacity: 0.22 }));
    partes.push(S('circle', { cx: 61, cy: 51, r: 3.2, fill: '#ff7b7b', opacity: 0.22 }));
    // Barba (debajo de la boca)
    if (av.barba === 2) partes.push(S('path', { d: 'M31 44 C31 61 40 67 50 67 C60 67 69 61 69 44 C67 55 60 59 50 59 C40 59 33 55 31 44 Z', fill: pelo }));
    // Ojos y cejas
    const cejaY = humor === 'enojado' ? [36, 39] : humor === 'triste' ? [39, 36.5] : [37.5, 37];
    partes.push(S('line', { x1: 38.5, y1: cejaY[0], x2: 46, y2: cejaY[1], stroke: av.pelo === 5 && av.colorPelo === 4 ? '#777' : pelo, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    partes.push(S('line', { x1: 54, y1: cejaY[1], x2: 61.5, y2: cejaY[0], stroke: av.pelo === 5 && av.colorPelo === 4 ? '#777' : pelo, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    if (humor === 'feliz') {
      partes.push(S('path', { d: 'M40 45 Q43 41.5 46 45', stroke: '#1d1d1d', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }));
      partes.push(S('path', { d: 'M54 45 Q57 41.5 60 45', stroke: '#1d1d1d', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }));
    } else {
      partes.push(S('ellipse', { cx: 43, cy: 44, rx: 2.2, ry: 2.8, fill: '#1d1d1d' }));
      partes.push(S('ellipse', { cx: 57, cy: 44, rx: 2.2, ry: 2.8, fill: '#1d1d1d' }));
    }
    // Boca
    const bocas = {
      feliz: 'M42 52 Q50 61 58 52 Z',
      normal: 'M44 54 Q50 57.5 56 54',
      triste: 'M44 57 Q50 51.5 56 57',
      enojado: 'M44 56 Q50 53.5 56 56',
    };
    partes.push(S('path', { d: bocas[humor] || bocas.normal, stroke: '#7a2a2a', 'stroke-width': 2.2, fill: humor === 'feliz' ? '#7a2a2a' : 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    // Bigote
    if (av.barba === 1 || av.barba === 2) partes.push(S('path', { d: 'M41.5 51.5 Q46 47.5 50 50 Q54 47.5 58.5 51.5 Q54 50.5 50 51.8 Q46 50.5 41.5 51.5 Z', fill: pelo }));
    // Pelo de adelante
    const frente = {
      0: 'M31 41 C30 24 40 17 50 17 C61 17 70 24 69 41 C66 32 58 27 50 27 C42 27 34 32 31 41 Z',
      1: 'M31 42 C29 23 41 16 52 17 C63 18 71 26 69 42 C67 31 61 26 44 29 C39 30 34 34 31 42 Z',
      2: 'M31 39 C32 24 42 19 50 19 C60 19 68 25 69 39 C60 30 44 31 31 39 Z',
      3: 'M31 39 C32 23 42 18 50 18 C60 18 68 24 69 39 C64 31 56 27 50 33 C44 27 36 31 31 39 Z',
      4: 'M31 41 C28 20 37 9 53 10 C66 11 73 22 69 41 C66 30 60 25 50 25 C42 25 35 31 31 41 Z',
      5: null,
    };
    if (av.pelo === 5) {
      partes.push(S('path', { d: 'M30.5 47 C29 37 31 31 35 29 L36.5 45 Z', fill: pelo }));
      partes.push(S('path', { d: 'M69.5 47 C71 37 69 31 65 29 L63.5 45 Z', fill: pelo }));
    } else if (frente[av.pelo || 0]) partes.push(S('path', { d: frente[av.pelo || 0], fill: pelo }));
    // Anteojos
    if (av.anteojos === 1) {
      partes.push(S('circle', { cx: 43, cy: 44, r: 5.6, stroke: '#1d1d1d', 'stroke-width': 2, fill: 'rgba(255,255,255,0.25)' }));
      partes.push(S('circle', { cx: 57, cy: 44, r: 5.6, stroke: '#1d1d1d', 'stroke-width': 2, fill: 'rgba(255,255,255,0.25)' }));
      partes.push(S('line', { x1: 48.6, y1: 44, x2: 51.4, y2: 44, stroke: '#1d1d1d', 'stroke-width': 2 }));
    } else if (av.anteojos === 2) {
      partes.push(S('rect', { x: 37, y: 40, width: 11.5, height: 8, rx: 2, stroke: '#1d1d1d', 'stroke-width': 2, fill: 'rgba(255,255,255,0.25)' }));
      partes.push(S('rect', { x: 51.5, y: 40, width: 11.5, height: 8, rx: 2, stroke: '#1d1d1d', 'stroke-width': 2, fill: 'rgba(255,255,255,0.25)' }));
      partes.push(S('line', { x1: 48.5, y1: 43, x2: 51.5, y2: 43, stroke: '#1d1d1d', 'stroke-width': 2 }));
    }
    // Banda presidencial
    if (opts.banda) {
      partes.push(S('path', { d: 'M22 80 L31 73 L86 100 L68 100 Z', fill: '#74acdf' }));
      partes.push(S('path', { d: 'M25.5 77.4 L28.5 75 L80 100 L74 100 Z', fill: '#ffffff' }));
      partes.push(S('circle', { cx: 52, cy: 88, r: 3.4, fill: '#f6b40e', stroke: '#a87800', 'stroke-width': 0.8 }));
    }
    const el = S('svg', { viewBox: '0 0 100 100', width: size, height: size, class: 'avatar', role: 'img', 'aria-label': opts.titulo || 'Avatar' }, ...partes);
    return el;
  };
})(globalThis.R = globalThis.R || {});
