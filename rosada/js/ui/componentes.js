// Piezas de interfaz que se repiten: barra superior, encuesta, botón de pasar el mes, historial.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;

  ui.puntosAgenda = function (usados, total) {
    return h('span', { class: 'agenda-puntos', title: 'Agenda del mes: ' + (total - usados) + ' de ' + total },
      Array.from({ length: total }, (_, i) => h('i', { class: i < total - usados ? '' : 'usado' })));
  };

  // Barra de arriba en campaña: escudo, nombre, mes, plata y agenda.
  ui.barraCampana = function (s) {
    const c = s.camp;
    return h('header', { class: 'barra-sup' },
      h('div', { class: 'quien' }, ui.escudo(s.partido), h('div', { style: { minWidth: 0 } },
        h('b', null, R.cap(R.MESES_CORTOS[R.mesDelAnio(s.mes)]) + ' ' + R.anio(s.mes)), h('small', null, s.partido.nombre))),
      h('span', { class: 'recurso', id: 'rec-fondos', title: 'Fondos de campaña' }, '💰 ', h('span', { class: 'numero' }, R.fmt(c.fondos))),
      h('span', { class: 'recurso', id: 'rec-agenda', title: 'Agenda del mes' }, '⏱️ ', ui.puntosAgenda(c.agendaMax - c.agenda, Math.max(c.agendaMax, c.agenda))),
      h('button', { class: 'boton mini sec', onclick: () => ui.menu(), 'aria-label': 'Menú' }, '☰'));
  };

  // Encuesta: barras horizontales ordenadas.
  ui.encuesta = function (s, enc, opts) {
    opts = opts || {};
    const ids = ['YO'].concat(R.RIVALES).sort((a, b) => enc[b] - enc[a]);
    const max = Math.max(...ids.map((id) => enc[id]), 1);
    return h('div', { class: 'encuesta' }, ids.map((id) => {
      const p = R.partidoInfo(s, id);
      const ant = opts.anterior ? opts.anterior[id] : null;
      const dif = ant !== null && ant !== undefined ? enc[id] - ant : 0;
      return h('div', { class: 'linea' + (id === 'YO' ? ' yo' : '') },
        ui.miniEscudo(p),
        h('div', { style: { minWidth: 0 } },
          h('div', { class: 'nombre' }, R.elec.nombre(s, id), ' ', h('span', { class: 'suave chico' }, p.sigla)),
          h('div', { class: 'barra' }, h('i', { style: { width: (enc[id] / max) * 100 + '%', background: p.color } }))),
        h('div', { class: 'pct' }, R.fmt(enc[id], 1), h('div', { class: 'chico', style: { color: dif > 0.05 ? 'var(--bien)' : dif < -0.05 ? 'var(--mal)' : 'var(--meh)', fontFamily: 'var(--f-texto)', fontSize: '12px' } },
          Math.abs(dif) >= 0.05 ? (dif > 0 ? '▲' : '▼') + R.fmt(Math.abs(dif), 1) : '')));
    }));
  };

  // Historial del diario.
  ui.historial = function (s, max) {
    const items = s.diario.slice(0, max || 40);
    if (!items.length) return h('p', { class: 'suave' }, 'Todavía no pasó nada.');
    return h('div', { class: 'historial' }, items.map((d) =>
      h('div', { class: 'item' }, h('span', { class: 'em' }, d.emoji), h('span', { class: 'f' }, R.fechaCorta(d.mes)), h('span', null, d.txt))));
  };

  // Barra inferior: pestañas + botón grande para pasar el mes.
  ui.navInferior = function (pestanas, activa, alElegir, boton) {
    const nav = document.querySelector('.nav-inf') || document.body.appendChild(h('nav', { class: 'nav-inf' }));
    nav.className = 'nav-inf' + (document.getElementById('app').classList.contains('ancha') ? ' ancha' : '');
    nav.replaceChildren(h('div', { class: 'dentro' },
      boton || null,
      pestanas ? h('div', { class: 'pestanas', role: 'tablist' }, pestanas.map((p) =>
        h('button', { class: p.id === activa ? 'activa' : '', role: 'tab', 'aria-selected': p.id === activa ? 'true' : 'false', onclick: () => alElegir(p.id) },
          h('span', { class: 'ic' }, p.emoji), p.nombre))) : null));
    nav.hidden = false;
  };
  ui.ocultarNav = function () {
    const nav = document.querySelector('.nav-inf');
    if (nav) nav.hidden = true;
  };

  // Menú general (guardar, sonido, salir).
  ui.menu = function () {
    const s = ui.s;
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, 'Menú'),
      h('button', { class: 'boton sec ancho', onclick: () => { R.son.alternar(); ui.cerrarCapa(); ui.aviso(R.son.activo ? '🔊 Sonido activado' : '🔇 Sonido apagado'); } }, R.son.activo ? '🔇 Apagar sonido' : '🔊 Prender sonido'),
      h('button', { class: 'boton sec ancho', onclick: () => { ui.cerrarCapa(); ui.comoSeJuega(); } }, '❓ Cómo se juega'),
      s ? h('button', { class: 'boton sec ancho', onclick: () => { R.guardar(s); ui.cerrarCapa(); ui.irPortada(); } }, '🏠 Volver a la portada') : null,
      h('p', { class: 'chico suave centro' }, 'La partida se guarda sola en este dispositivo.')), { cerrable: true });
  };

  ui.comoSeJuega = function () {
    const paso = (em, t, d) => h('div', { class: 'fila tarjeta plana suave', style: { alignItems: 'flex-start' } }, h('div', { style: { fontSize: '32px' } }, em), h('div', null, h('b', null, t), h('p', { class: 'chico' }, d)));
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, 'Cómo se juega'),
      paso('🗓️', 'Cada turno es un mes', 'Hacé tus acciones y tocá «Pasar el mes».'),
      paso('📰', 'Llegan noticias', 'Elegí qué hacer. Cada opción muestra a quién le pega: ▲ sube, ▼ baja.'),
      paso('🗳️', 'Ganá la elección', 'PASO en agosto, generales en octubre y, si hace falta, ballotage.'),
      paso('🏛️', 'Gobernás', 'Economía, Congreso, provincias y el mundo. Que la gente esté contenta.'),
      h('button', { class: 'boton ancho', onclick: () => ui.cerrarCapa() }, '¡Entendido!')), { cerrable: true });
  };
})(globalThis.R = globalThis.R || {});
