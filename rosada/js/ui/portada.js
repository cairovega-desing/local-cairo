// Portada: logo, Sol de Mayo, jugar / continuar.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;

  ui.solDeMayo = function (cls) {
    const S = R.svg;
    const rayos = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      const largo = i % 2 ? 46 : 40;
      const ancho = i % 2 ? 0.06 : 0.1;
      const p = (ang, r) => (50 + Math.cos(ang) * r).toFixed(1) + ',' + (50 + Math.sin(ang) * r).toFixed(1);
      rayos.push(S('polygon', { points: p(a - ancho, 22) + ' ' + p(a, largo) + ' ' + p(a + ancho, 22), fill: '#f6b40e', stroke: '#a87800', 'stroke-width': 0.8 }));
    }
    return S('svg', { viewBox: '0 0 100 100', class: cls || 'sol-mayo', 'aria-hidden': 'true' },
      ...rayos,
      S('circle', { cx: 50, cy: 50, r: 22, fill: '#f6b40e', stroke: '#a87800', 'stroke-width': 1.5 }),
      S('path', { d: 'M41 46 Q43.5 43.5 46 46 M54 46 Q56.5 43.5 59 46', stroke: '#7a5200', 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }),
      S('path', { d: 'M42 56 Q50 63 58 56', stroke: '#7a5200', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }),
      S('path', { d: 'M50 47 L48.5 53 L51 53.5', stroke: '#7a5200', 'stroke-width': 1.3, fill: 'none', 'stroke-linecap': 'round' }));
  };

  ui.portada = function () {
    ui.ocultarNav();
    const guardada = R.cargar();
    const nodo = h('main', { class: 'portada' },
      ui.solDeMayo(),
      h('h1', { class: 'logo' }, 'Camino a', h('span', null, 'la Rosada')),
      h('p', { class: 'lema' }, 'Fundá tu partido, ganá la elección y sacá el país adelante.'),
      h('div', { class: 'botones' },
        guardada ? h('button', { class: 'boton grande', onclick: () => { R.son.toque(); ui.continuar(guardada); } },
          '▶ Continuar', h('span', { class: 'chico', style: { fontFamily: 'var(--f-texto)' } }, ' · ' + guardada.partido.sigla + ' · ' + R.fechaCorta(guardada.mes))) : null,
        h('button', { class: 'boton grande' + (guardada ? ' sec' : ''), onclick: () => { R.son.toque(); ui.nuevaPartida(guardada); } }, '🏴 Nueva partida'),
        h('div', { class: 'fila', style: { justifyContent: 'center' } },
          h('button', { class: 'boton mini sec', onclick: () => ui.comoSeJuega() }, '❓ Cómo se juega'),
          h('button', { class: 'boton mini sec', id: 'btn-sonido', onclick: (e) => { R.son.alternar(); e.currentTarget.textContent = R.son.activo ? '🔊 Sonido' : '🔇 Sonido'; } }, R.son.activo ? '🔊 Sonido' : '🔇 Sonido'))),
      h('div', { class: 'pasos-portada' },
        h('div', { class: 'tarjeta' }, h('div', null, '🏴'), 'Fundá tu partido'),
        h('div', { class: 'tarjeta' }, h('div', null, '🗳️'), 'Ganá la elección'),
        h('div', { class: 'tarjeta' }, h('div', null, '🏛️'), 'Gobernás el país')),
      h('p', { class: 'chico suave' }, 'Partidos y personajes ficticios. La partida se guarda en este dispositivo.'));
    ui.montar(nodo);
  };

  ui.nuevaPartida = function (guardada) {
    if (!guardada) return ui.crear();
    ui.abrirCapa(h('div', { class: 'pila centro' },
      h('div', { style: { fontSize: '44px' } }, '⚠️'),
      h('h2', null, '¿Empezar de cero?'),
      h('p', null, 'Se borra la partida de ' + guardada.partido.sigla + '.'),
      h('button', { class: 'boton rojo ancho', onclick: () => { R.borrarPartida(); ui.cerrarCapa(); ui.crear(); } }, 'Sí, empezar de nuevo'),
      h('button', { class: 'boton sec ancho', onclick: () => ui.cerrarCapa() }, 'No, volver')), { cerrable: true });
  };
})(globalThis.R = globalThis.R || {});
