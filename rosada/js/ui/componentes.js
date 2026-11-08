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
      h('span', { class: 'recurso', id: 'rec-fondos', title: 'Fondos de campaña' }, '💰', h('span', { class: 'numero' }, R.fmt(c.fondos))),
      h('span', { class: 'recurso', id: 'rec-agenda', title: 'Agenda del mes' }, h('span', { class: 'ico' }, '⏱️'), ui.puntosAgenda(c.agendaMax - c.agenda, Math.max(c.agendaMax, c.agenda))),
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

  // Íconos de línea (24×24, trazo) para las pestañas. Si no hay ícono, queda el emoji.
  const ICONOS = {
    inicio: 'M4 11l8-6 8 6M6 10v9h12v-9M10 19v-5h4v5',
    economia: 'M12 4v16M16 7.5c-.8-1.2-2.3-2-4-2-2.2 0-4 1.3-4 3s1.8 2.6 4 3 4 1.3 4 3-1.8 3-4 3c-1.8 0-3.3-.8-4-2',
    congreso: 'M3 9l9-5 9 5M5 10v8M9.7 10v8M14.3 10v8M19 10v8M3 20h18',
    provincias: 'M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    mapa: 'M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    mundo: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 9h17M3.5 15h17M12 3c2.5 2.6 3.6 5.6 3.6 9s-1.1 6.4-3.6 9M12 3C9.5 5.6 8.4 8.6 8.4 12s1.1 6.4 3.6 9',
    diario: 'M5 5h11v14H6a1 1 0 0 1-1-1V5zM16 9h3v9a1 1 0 0 1-1 1h-2M8 9h5M8 12h5M8 15h3',
    acciones: 'M4 10v4h3l6 4V6L7 10H4zM16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11',
    encuesta: 'M5 20V10M10 20V5M15 20v-7M20 20v-4M3 20h18',
  };
  ui.icono = function (id) {
    if (!ICONOS[id]) return null;
    return R.svg('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
      R.svg('path', { d: ICONOS[id] }));
  };

  // Barra inferior: pestañas + botón grande para pasar el mes.
  ui.navInferior = function (pestanas, activa, alElegir, boton) {
    const nav = document.querySelector('.nav-inf') || document.body.appendChild(h('nav', { class: 'nav-inf' }));
    nav.className = 'nav-inf' + (document.getElementById('app').classList.contains('ancha') ? ' ancha' : '');
    nav.replaceChildren(h('div', { class: 'dentro' },
      boton || null,
      pestanas ? h('div', { class: 'pestanas', role: 'tablist' }, pestanas.map((p) =>
        h('button', { class: p.id === activa ? 'activa' : '', role: 'tab', 'aria-selected': p.id === activa ? 'true' : 'false', onclick: () => alElegir(p.id) },
          h('span', { class: 'ic' }, ui.icono(p.id) || p.emoji), p.nombre))) : null));
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
      h('button', { class: 'boton sec ancho', onclick: () => { ui.cerrarCapa(); ui.comoSeJuega(); } }, 'Cómo se juega'),
      h('button', { class: 'boton sec ancho', onclick: () => { ui.cerrarCapa(); ui.verLogros(); } }, 'Logros'),
      s ? h('button', { class: 'boton sec ancho', onclick: () => { R.guardar(s); ui.cerrarCapa(); ui.irPortada(); } }, 'Volver a la portada') : null,
      h('p', { class: 'chico suave centro' }, 'La partida se guarda sola en este dispositivo.')), { cerrable: true });
  };

  // Riesgos a la vista: «🎲 25% Te comen: ❤️▼▼» (y la suerte: «🍀 15% Plaza llena: 📍▲»).
  ui.riesgos = function (s, lista) {
    lista = (lista || []).filter((r) => r && r.p > 0);
    if (!lista.length) return null;
    return h('div', { class: 'riesgos' }, lista.map((r) => {
      const todos = R.describirEfectosFase(s, r.ef || {});
      const efs = todos.filter((e) => (r.bueno ? e.bueno : !e.bueno));
      return h('div', { class: 'riesgo ' + (r.bueno ? 'bueno' : 'malo') },
        h('span', { class: 'pct' }, Math.round(r.p * 100) + '%'),
        h('span', { class: 'txt' }, r.txt + ':'),
        ui.chipsEfectos(efs.length ? efs : todos, { compacto: true }),
        r.nota ? h('span', { class: 'chico suave' }, r.nota) : null);
    }));
  };

  // Guía corta de primeros pasos (se muestra una vez por dispositivo).
  ui.guia = function (clave, titulo, pasos) {
    if (R.pref('guia_' + clave)) return null;
    const caja = h('section', { class: 'tarjeta pila guia' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, titulo),
        h('button', { class: 'boton mini sec', onclick: () => { R.pref('guia_' + clave, true); caja.remove(); } }, '✕')),
      h('div', { class: 'pasos-guia' }, pasos.map(([em, t, d], i) =>
        h('div', { class: 'paso-guia' }, h('span', { class: 'num' }, String(i + 1)), h('div', null, h('b', null, t), h('div', { class: 'chico' }, d))))),
      h('button', { class: 'boton ancho', onclick: () => { R.pref('guia_' + clave, true); R.son.toque(); caja.remove(); } }, '¡Entendido!'));
    return caja;
  };

  ui.comoSeJuega = function () {
    const paso = (em, t, d) => h('div', { class: 'fila tarjeta plana suave', style: { alignItems: 'flex-start' } }, h('div', { style: { fontSize: '32px' } }, em), h('div', null, h('b', null, t), h('p', { class: 'chico' }, d)));
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, 'Cómo se juega'),
      paso('🗓️', 'Cada turno es un mes', 'Hacé tus acciones y tocá «Pasar el mes».'),
      paso('📰', 'Llegan noticias', 'Elegí qué hacer. Cada opción muestra a quién le pega: ▲ sube, ▼ baja.'),
      paso('🗳️', 'Ganá la elección', 'PASO en agosto, generales en octubre y, si hace falta, ballotage.'),
      paso('🏛️', 'Gobernás', 'Cada mes ves cómo le fue a la gente y por qué. Tocá caras y tarjetas para entender.'),
      paso('💰', 'Economía en %', 'Subís o bajás cada área del gasto. La balanza muestra si te alcanza la plata.'),
      paso('📜', 'Congreso y mundo', 'Leyes con conteo de votos, gobernadores, alianzas, guerras y Malvinas.'),
      h('button', { class: 'boton ancho', onclick: () => ui.cerrarCapa() }, '¡Entendido!')), { cerrable: true });
  };
})(globalThis.R = globalThis.R || {});
