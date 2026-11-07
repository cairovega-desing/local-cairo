// Pantallas de cierre: asunción (ganaste) y fin de la partida (perdiste).
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;

  ui.asuncion = function (s, alTerminar) {
    R.son.genial();
    ui.confeti(['#74acdf', '#ffffff', '#f6b40e']);
    const comoGano = s.flags.ganoEn === 'primera' ? 'Ganaste en primera vuelta' : 'Ganaste el ballotage';
    ui.abrirCapa(h('div', { class: 'pila centro' },
      ui.solDeMayo('sol-mayo'),
      h('div', { class: 'etiqueta' }, '10 de diciembre de ' + R.anio(s.mes)),
      h('h2', { style: { fontSize: '30px' } }, '¡' + s.lider.nombre + ' asume la Presidencia!'),
      h('div', { class: 'fila', style: { justifyContent: 'center' } }, R.ui.avatar(s.lider.avatar, { size: 120, humor: 'feliz', banda: true, fondo: '#dbeefb' })),
      h('p', null, '🏆 ' + comoGano + '. Banda y bastón: ahora te toca gobernar.'),
      h('button', { class: 'boton grande ancho', autofocus: true, onclick: () => { ui.cerrarCapa(); alTerminar(); } }, '🏛️ Entrar a la Rosada')));
  };

  // Pantalla de fin (por ahora: perder la elección).
  ui.pantallaFin = function (s) {
    ui.ocultarNav();
    const f = s.fin || {};
    const motivos = {
      paso: { em: '🥲', t: 'Quedaste afuera en las PASO', d: 'No llegaste al 1,5 %. El año que viene, más acto y más tele.' },
      general: { em: '😞', t: 'Perdiste la elección', d: 'No entraste al ballotage. Pero tu partido ya existe.' },
      ballotage: { em: '💔', t: 'Perdiste el ballotage', d: 'Por poco. La próxima es tuya.' },
    };
    const m = motivos[f.motivo] || { em: '🏁', t: 'Fin de la partida', d: '' };
    const g = s.elecciones.general;
    const yoGen = g ? g.lista.find((x) => x.id === 'YO') : null;
    const mejor = Math.max(...s.encuestas.map((e) => e.YO));
    ui.montar(h('main', { class: 'pila', style: { paddingTop: '16px' } },
      h('section', { class: 'tarjeta pila centro' },
        h('div', { style: { fontSize: '60px' } }, m.em),
        h('h2', { style: { fontSize: '30px' } }, m.t),
        h('p', null, m.d),
        h('div', { class: 'mis-numeros' },
          h('div', { class: 'mi-numero' }, h('div', { class: 'em' }, '📈'), h('div', { class: 'val' }, R.fmt(mejor, 1) + '%'), h('div', { class: 'nom' }, 'mejor encuesta')),
          h('div', { class: 'mi-numero' }, h('div', { class: 'em' }, '🗳️'), h('div', { class: 'val' }, yoGen ? R.fmt(yoGen.v, 1) + '%' : '–'), h('div', { class: 'nom' }, 'en las generales')),
          h('div', { class: 'mi-numero' }, h('div', { class: 'em' }, '🏛️'), h('div', { class: 'val' }, g ? (g.bancas.dip.YO || 0) + (g.bancas.sen.YO || 0) : 0), h('div', { class: 'nom' }, 'bancas ganadas')))),
      h('button', { class: 'boton grande ancho', onclick: () => { R.borrarPartida(); ui.s = null; ui.crear(); } }, '🏴 Fundar otro partido'),
      h('button', { class: 'boton sec ancho', onclick: () => { R.borrarPartida(); ui.s = null; ui.irPortada(); } }, '🏠 Portada'),
      h('section', { class: 'tarjeta pila' }, h('div', { class: 'titulo-seccion' }, '📰 Tu camino'), ui.historial(s, 25))));
  };
})(globalThis.R = globalThis.R || {});
