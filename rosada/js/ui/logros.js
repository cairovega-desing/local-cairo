// Logros: aviso con medalla cuando desbloqueás uno y la vitrina con todos.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;

  // Si hay logros nuevos, muestra la medalla. Devuelve true si abrió algo.
  ui.mostrarLogros = function (s) {
    if (!s || ui.hayCapa()) return false;
    const nuevos = R.revisarLogros(s);
    if (!nuevos.length) return false;
    R.guardar(s);
    const malos = nuevos.every((l) => l.malo);
    if (malos) R.son.mal(); else R.son.genial();
    ui.abrirCapa(h('div', { class: 'pila centro' },
      h('div', { class: 'etiqueta' }, nuevos.length > 1 ? '¡Logros desbloqueados!' : '¡Logro desbloqueado!'),
      h('div', { class: 'medallas' }, nuevos.map((l) => h('div', { class: 'medalla' + (l.malo ? ' mala' : '') }, h('span', { class: 'em' }, l.emoji), h('b', null, l.nombre)))),
      h('p', { class: 'chico suave' }, R.LOGROS.filter((l) => R.logrosGuardados()[l.id]).length + ' de ' + R.LOGROS.length + ' logros'),
      h('button', { class: 'boton grande ancho', autofocus: true, onclick: () => { ui.cerrarCapa(); ui.procesarCola(); } }, 'Seguir')));
    return true;
  };

  ui.verLogros = function () {
    const g = R.logrosGuardados();
    const n = R.LOGROS.filter((l) => g[l.id]).length;
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, 'Logros · ' + n + '/' + R.LOGROS.length),
      h('div', { class: 'barra' }, h('i', { style: { width: (n / R.LOGROS.length) * 100 + '%', background: 'var(--sol)' } })),
      h('div', { class: 'vitrina' }, R.LOGROS.map((l) => h('div', { class: 'medalla chica' + (g[l.id] ? '' : ' bloqueada') + (l.malo ? ' mala' : '') },
        h('span', { class: 'em' }, g[l.id] ? l.emoji : '🔒'), h('span', null, l.nombre))))), { cerrable: true });
  };
})(globalThis.R = globalThis.R || {});
