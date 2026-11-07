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

  // Pantalla de fin: perder una elección, caer o terminar el mandato.
  ui.pantallaFin = function (s) {
    ui.ocultarNav();
    const f = s.fin || {};
    const motivos = {
      paso: { em: '🥲', t: 'Quedaste afuera en las PASO', d: 'No llegaste al 1,5 %. La próxima, más actos y más tele.' },
      general: { em: '😞', t: 'Perdiste la elección', d: 'No entraste al ballotage. Pero tu partido ya existe.' },
      ballotage: { em: '💔', t: 'Perdiste el ballotage', d: 'Por poco. La próxima es tuya.' },
      helicoptero: { em: '🚁', t: 'Te fuiste en helicóptero', d: 'Tres meses con la aprobación por el piso. Renunciaste.' },
      estallido: { em: '🔥', t: 'Estallido social', d: 'El país explotó y tuviste que renunciar.' },
      reeleccion: { em: '😔', t: 'Perdiste la reelección', d: 'El pueblo eligió otro camino.' },
      mandato: { em: '🏁', t: 'Terminaste tu mandato', d: 'Entregás la banda. La historia te juzgará.' },
      juicio: { em: '⚖️', t: 'Te destituyó el Congreso', d: 'El juicio político salió. Demasiados escándalos.' },
    };
    const m = motivos[f.motivo] || { em: '🏁', t: 'Fin de la partida', d: '' };
    const filas = [];
    if (s.gob) {
      const e = s.eco;
      const ini = s.gob.historia[0] || {};
      const dato = (em, nom, a, b, fmt, malo) => {
        const mejor = malo ? b < a : b > a;
        return h('div', { class: 'fila-resumen' }, h('span', { class: 'em' }, em), h('span', { class: 'nom' }, nom),
          h('span', { class: 'val numero' }, fmt(a) + ' → ' + fmt(b)), h('span', { class: 'chip ' + (mejor ? 'bien' : 'mal') }, mejor ? '▲' : '▼'));
      };
      filas.push(h('section', { class: 'tarjeta pila' },
        h('div', { class: 'titulo-seccion' }, '📊 Cómo dejaste el país'),
        h('p', { class: 'chico suave' }, 'Gobernaste ' + s.gob.meses + ' meses.'),
        h('div', { class: 'resumen-filas' },
          dato('👍', 'Aprobación', ini.aprob ?? 55, s.gob.aprob, (v) => R.fmt(v) + '%'),
          dato('🛒', 'Inflación anual', ini.inflAnual ?? 27, e.inflAnual, (v) => R.fmt(v) + '%', true),
          dato('🏚️', 'Pobreza', ini.pobreza ?? 34, e.pobreza, (v) => R.fmt(v) + '%', true),
          dato('🚪', 'Desempleo', ini.desempleo ?? 7.8, e.desempleo, (v) => R.fmt(v, 1) + '%', true),
          dato('🏦', 'Reservas', ini.reservas ?? 28, e.reservas, (v) => R.fmt(v)),
          dato('💳', 'Deuda', ini.deuda ?? 78, e.deuda, (v) => R.fmt(v) + '%', true))));
    } else {
      const g = s.elecciones.general;
      const yoGen = g ? g.lista.find((x) => x.id === 'YO') : null;
      const mejor = Math.max(...s.encuestas.map((e) => e.YO));
      filas.push(h('div', { class: 'mis-numeros' },
        h('div', { class: 'mi-numero' }, h('div', { class: 'em' }, '📈'), h('div', { class: 'val' }, R.fmt(mejor, 1) + '%'), h('div', { class: 'nom' }, 'mejor encuesta')),
        h('div', { class: 'mi-numero' }, h('div', { class: 'em' }, '🗳️'), h('div', { class: 'val' }, yoGen ? R.fmt(yoGen.v, 1) + '%' : '–'), h('div', { class: 'nom' }, 'en las generales')),
        h('div', { class: 'mi-numero' }, h('div', { class: 'em' }, '🏛️'), h('div', { class: 'val' }, g ? (g.bancas.dip.YO || 0) + (g.bancas.sen.YO || 0) : 0), h('div', { class: 'nom' }, 'bancas ganadas'))));
    }
    const leg = R.legado(s);
    const logrosPartida = R.LOGROS.filter((l) => s.logros && s.logros[l.id]);
    ui.montar(h('main', { class: 'pila', style: { paddingTop: '16px' } },
      h('section', { class: 'tarjeta pila centro' },
        h('div', { style: { fontSize: '60px' } }, m.em),
        s.gob ? h('div', { class: 'fila', style: { justifyContent: 'center' } }, R.ui.avatar(s.lider.avatar, { size: 90, humor: f.motivo === 'mandato' ? 'feliz' : 'triste', banda: f.motivo === 'mandato' })) : null,
        h('h2', { style: { fontSize: '30px' } }, m.t),
        h('p', null, m.d),
        leg ? h('div', { class: 'legado' }, h('div', { class: 'estrellas', 'aria-label': leg.estrellas + ' de 5 estrellas' }, '★'.repeat(leg.estrellas) + '☆'.repeat(5 - leg.estrellas)),
          h('div', { class: 'titulo-legado' }, '«' + leg.titulo + '»'), h('div', { class: 'chico suave' }, 'Legado: ' + leg.puntos + '/100')) : null),
      R.oposicion && R.oposicion.puede(s) ? h('section', { class: 'tarjeta pila centro', style: { background: 'var(--sol-claro)' } },
        h('b', null, '🔄 ¿Seguís en la oposición?'),
        h('p', { class: 'chico' }, 'Tu partido ya existe y tiene ' + ((R.composicion(s, 'diputados').YO || 0)) + ' diputados. Medio término en 2029 y presidenciales en 2031.'),
        h('button', { class: 'boton grande ancho', onclick: () => { R.oposicion.iniciar(s); R.guardar(s); ui.vista = { tab: 'acciones' }; R.son.genial(); ui.render(); window.scrollTo(0, 0); } }, '🗳️ Seguir en la oposición')) : null,
      filas,
      logrosPartida.length ? h('section', { class: 'tarjeta pila' }, h('div', { class: 'titulo-seccion' }, '🏅 Logros de esta partida'),
        h('div', { class: 'vitrina' }, logrosPartida.map((l) => h('div', { class: 'medalla chica' + (l.malo ? ' mala' : '') }, h('span', { class: 'em' }, l.emoji), h('span', null, l.nombre))))) : null,
      h('button', { class: 'boton grande ancho', onclick: () => { R.borrarPartida(); ui.s = null; ui.crear(); } }, '🏴 Fundar otro partido'),
      h('button', { class: 'boton sec ancho', onclick: () => { R.borrarPartida(); ui.s = null; ui.irPortada(); } }, '🏠 Portada'),
      h('section', { class: 'tarjeta pila' }, h('div', { class: 'titulo-seccion' }, '📰 Tu camino'), ui.historial(s, 25))));
  };
})(globalThis.R = globalThis.R || {});
