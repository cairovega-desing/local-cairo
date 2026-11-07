// Pantalla de campaña: tu número, acciones del mes, mapa, encuesta y diario.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;

  const PESTANAS = [
    { id: 'acciones', emoji: '🎯', nombre: 'Acciones' },
    { id: 'mapa', emoji: '🗺️', nombre: 'Mapa' },
    { id: 'encuesta', emoji: '📊', nombre: 'Encuesta', soloCelu: true },
    { id: 'diario', emoji: '📰', nombre: 'Diario' },
  ];

  ui.esPC = () => window.matchMedia && window.matchMedia('(min-width: 900px)').matches;

  ui.pantallaCampana = function (s) {
    const pc = ui.esPC();
    let tab = (ui.vista && ui.vista.tab) || 'acciones';
    if (pc && tab === 'encuesta') tab = 'acciones';
    const contenido = {
      acciones: () => [pc ? null : resumen(s), tarjetaAcciones(s)],
      mapa: () => tarjetaMapa(s),
      encuesta: () => tarjetaEncuesta(s),
      diario: () => h('section', { class: 'tarjeta pila' }, h('div', { class: 'titulo-seccion' }, '📰 Lo que pasó'), ui.historial(s)),
    }[tab]();
    const cuerpo = pc
      ? h('div', { class: 'columnas' }, h('div', { class: 'col-izq pila' }, resumen(s), tarjetaEncuesta(s)), h('div', { class: 'pila' }, contenido))
      : h('div', { class: 'pila' }, contenido);
    const guia = tab === 'acciones' && s.mes <= 2 && !s.gobRival ? ui.guia('campana', 'Cómo hacer campaña', [
      ['🎯', 'Usá tus acciones del mes', 'Cada carta muestra qué te da: 👁️ que te conozcan, ❤️ caer bien, 🏴 militancia.'],
      ['🗺️', 'Hacé actos donde te quieren', 'Las provincias grandes pesan más: Buenos Aires es casi 4 de cada 10 votos.'],
      ['▶', 'Pasá el mes', 'Llegan noticias, se mueve la encuesta y se acercan las PASO de agosto.'],
    ]) : null;
    const scroll = ui.montar(h('div', null, ui.barraCampana(s), guia, cuerpo), pc);
    if (ui.vista && ui.vista.mantenerScroll) window.scrollTo(0, scroll);
    const b = R.turno.botonPasar(s);
    ui.navInferior(PESTANAS.filter((p) => !(pc && p.soloCelu)), tab, (id) => { R.son.toque(); ui.vista = { tab: id }; ui.render(); window.scrollTo(0, 0); },
      h('button', { class: 'boton grande ancho', id: 'btn-pasar', onclick: () => ui.pasarMes() },
        b.emoji + ' ' + b.txt, s.camp.agenda > 0 ? h('span', { class: 'chip', style: { fontFamily: 'var(--f-texto)', fontSize: '12px' } }, 'te quedan ' + s.camp.agenda) : null));
  };

  // ── Resumen: cuenta regresiva y tus números ──
  function resumen(s) {
    const c = s.camp;
    const prox = R.turno.proximaEleccion(s);
    const enc = R.camp.encuesta(s);
    const ant = s.encuestas.length >= 2 ? s.encuestas[s.encuestas.length - 2] : null;
    const dif = ant ? enc.YO - ant.YO : 0;
    const puesto = ['YO'].concat(R.RIVALES).sort((a, b) => enc[b] - enc[a]).indexOf('YO') + 1;
    const numero = (em, nom, val, color) => h('div', { class: 'mi-numero' },
      h('div', { class: 'em' }, em), h('div', { class: 'val numero' }, R.fmt(val) + '%'),
      h('div', { class: 'barra', style: { height: '8px', margin: '3px 6px' } }, h('i', { style: { width: val + '%', background: color } })),
      h('div', { class: 'nom' }, nom));
    return h('section', { class: 'tarjeta pila' },
      prox ? h('div', { class: 'cuenta-regresiva' },
        h('div', { class: 'num' }, prox.faltan ? prox.faltan : prox.emoji),
        h('div', null, h('div', { class: 'etiqueta' }, prox.faltan ? (prox.faltan === 1 ? 'mes para ' : 'meses para ') + (prox.art || 'las') : '¡Este mes se vota!'), h('div', { class: 'titulo-seccion' }, prox.emoji + ' ' + prox.nombre))) : null,
      h('div', { class: 'fila entre', style: { alignItems: 'flex-end' } },
        h('div', null, h('div', { class: 'etiqueta' }, 'Te votaría'),
          h('div', { style: { fontFamily: 'var(--f-titulo)', fontSize: '46px', lineHeight: 1 }, class: 'numero' }, R.fmt(enc.YO, 1), h('span', { style: { fontSize: '24px' } }, ' %'))),
        h('div', { class: 'pila', style: { alignItems: 'flex-end', gap: '6px' } },
          h('span', { class: 'chip ' + (puesto <= 2 ? 'sol' : '') }, puesto === 1 ? '🥇 Primero' : puesto === 2 ? '🥈 Segundo' : '#' + puesto + ' en la encuesta'),
          Math.abs(dif) >= 0.05 ? h('span', { class: 'chip ' + (dif > 0 ? 'bien' : 'mal') }, (dif > 0 ? '▲ ' : '▼ ') + R.fmt(Math.abs(dif), 1) + ' este mes') : null)),
      h('div', { class: 'mis-numeros' },
        numero('👁️', 'Te conocen', c.conocen, 'var(--celeste)'),
        numero('❤️', 'Les caés bien', c.simpatia, '#ff7b8a'),
        numero('🏴', 'Militancia', c.militancia, s.partido.color)),
      c.militancia < 30 && s.mes >= 4 ? h('p', { class: 'chico', style: { color: 'var(--mal)' } }, '⚠️ Con poca militancia no tenés fiscales: te pueden robar votos.') : null,
      s.gobRival ? h('div', { class: 'fila envolver', style: { gap: '6px' } },
        h('span', { class: 'chip' }, '🏛️ Gobierna ' + R.elec.nombre(s, s.gobRival.partido) + ' (' + R.PARTIDOS[s.gobRival.partido].sigla + ')'),
        h('span', { class: 'chip ' + (s.gobRival.aprob < 40 ? 'bien' : s.gobRival.aprob > 55 ? 'mal' : '') }, '👍 ' + Math.round(s.gobRival.aprob) + '% de aprobación'),
        h('span', { class: 'chip' }, '🏛️ ' + (R.composicion(s, 'diputados').YO || 0) + ' diputados tuyos')) : null);
  }

  // ── Acciones ──
  function tarjetaAcciones(s) {
    const c = s.camp;
    return h('section', { class: 'pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, '🎯 Acciones del mes'), ui.puntosAgenda(c.agendaMax - c.agenda, Math.max(c.agendaMax, c.agenda))),
      c.agenda <= 0 ? h('div', { class: 'tarjeta plana centro', style: { background: 'var(--sol-claro)' } }, '✅ Agenda completa. Tocá ', h('b', null, R.turno.botonPasar(s).txt), ' para seguir.') : null,
      h('div', { class: 'acciones' }, R.camp.ACCIONES.map((a) => cartaAccion(s, a))));
  }

  function cartaAccion(s, a) {
    const bloq = R.camp.bloqueo(s, a, undefined);
    const prev = !a.elegir ? R.describirEfectos(s, a.calc(s)) : null;
    const costoTxt = a.elegir === 'figura' ? '💰 20-35' : a.costo ? '💰 ' + a.costo : 'gratis';
    const chipCosto = h('span', { class: 'chip ' + (a.costo || a.elegir === 'figura' ? 'sol' : '') }, costoTxt);
    return h('button', { class: 'accion', disabled: bloq ? true : null, onclick: () => elegirAccion(s, a), 'aria-label': a.nombre + '. ' + a.desc },
      h('div', { class: 'cab' }, h('span', { class: 'ic' }, a.emoji), h('span', { class: 'nom' }, a.nombre)),
      h('div', { class: 'desc' }, a.desc),
      prev ? ui.chipsEfectos(prev, { compacto: true, antes: chipCosto })
        : h('div', { class: 'efectos' }, chipCosto, h('span', { class: 'chip' }, a.elegir === 'provincia' ? '📍 Elegís dónde' : '👆 Elegís')),
      a.azar ? h('span', { class: 'chip', style: { alignSelf: 'flex-start', fontSize: '12px' } }, '🎲 tiene riesgo') : null,
      bloq && bloq !== 'Sin agenda este mes' ? h('div', { class: 'bloq' }, bloq) : null);
  }

  function elegirAccion(s, a) {
    R.son.toque();
    if (!a.elegir) return hacer(s, a.id);
    if (a.elegir === 'provincia') return elegirProvincia(s, a);
    const items = {
      plata: () => a.opciones.map((o) => ({ id: o.id, emoji: o.emoji, nombre: o.nombre, ef: o.ef, costo: 0, nota: o.riesgo ? '⚠️ riesgo de escándalo' : null })),
      figura: () => R.FIGURAS.filter((f) => !s.camp.figuras.includes(f.id)).map((f) => ({ id: f.id, emoji: f.emoji, nombre: f.nombre, ef: a.calc(s, f.id), costo: f.costo, nota: f.riesgo ? '🎲 puede armar polémica' : null })),
      rival: () => R.RIVALES.map((id) => ({ id, emoji: R.PARTIDOS[id].simbolo, nombre: R.elec.nombre(s, id) + ' · ' + R.PARTIDOS[id].sigla, ef: a.calc(s, id), costo: a.costo, nota: '🎲 25% de que te salga mal' })),
      aliado: () => R.ALIADOS.map((x) => ({ id: x.id, emoji: x.emoji, nombre: x.nombre, ef: a.calc(s, x.id), costo: 0, nota: R.REGIONES[x.region].emoji + ' fuerte en ' + R.REGIONES[x.region].nombre })),
    }[a.elegir]();
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, a.emoji + ' ' + a.nombre),
      a.elegir === 'aliado' ? h('p', { class: 'chico suave' }, 'Solo una alianza por elección. Si piensa distinto a vos, tu gente se enoja un poco.') : null,
      h('div', { class: 'lista-elegir' }, items.map((it) => h('button', {
        class: 'item-elegir', disabled: it.costo > s.camp.fondos ? true : null,
        onclick: () => { ui.cerrarCapa(); hacer(s, a.id, it.id); },
      },
      h('span', { class: 'ic' }, it.emoji),
      h('div', { class: 'pila', style: { gap: '4px', minWidth: 0 } }, h('b', null, it.nombre), ui.chipsEfectos(R.describirEfectos(s, it.ef), { compacto: true }), it.nota ? h('span', { class: 'chico suave' }, it.nota) : null),
      h('span', { class: 'chip ' + (it.costo ? 'sol' : '') }, it.costo ? '💰 ' + it.costo : 'gratis'))))), { cerrable: true });
  }

  function elegirProvincia(s, a, sel) {
    const votos = R.camp.votos(s).prov;
    const detalle = h('div', { class: 'pila' });
    const pintarDetalle = (id) => {
      if (!id || !R.PROV[id]) {
        detalle.replaceChildren(h('p', { class: 'centro suave' }, '👆 Tocá una provincia'));
        return;
      }
      const p = R.PROV[id];
      const vis = s.camp.visitas[id] || 0;
      const af = R.camp.afinidad(s, p);
      detalle.replaceChildren(h('div', { class: 'tarjeta plana suave pila', style: { gap: '8px' } },
        h('div', { class: 'fila entre' }, h('b', { style: { fontFamily: 'var(--f-titulo)', fontSize: '20px', fontWeight: 400 } }, p.nombre),
          h('span', { class: 'chip' }, '👥 ' + R.fmt(p.padron, 1) + '% del país')),
        h('div', { class: 'fila envolver' },
          h('span', { class: 'chip ' + (af > 1.1 ? 'bien' : af < 0.85 ? 'mal' : '') }, af > 1.1 ? '💚 Les gustan tus ideas' : af < 0.85 ? '💔 Piensan distinto' : '🤝 Afinidad media'),
          vis ? h('span', { class: 'chip' }, '🎤 ' + vis + (vis === 1 ? ' visita' : ' visitas') + ' · rinde menos') : null),
        ui.chipsEfectos(R.describirEfectos(s, a.calc(s, id))),
        h('button', { class: 'boton ancho', onclick: () => { ui.cerrarCapa(); hacer(s, a.id, id); }, disabled: R.camp.bloqueo(s, a, id) ? true : null }, '🎤 Hacer el acto · 💰 ' + a.costo)));
    };
    const mapa = R.ui.mapa({
      sinMalvinas: true,
      sel,
      colorDe: (id) => R.ui.colorEscala(s.partido.color, Math.min(100, votos[id].YO * 2.2)),
      valorDe: (id) => R.fmt(votos[id].YO, 0) + '%',
      alTocar: (id) => { R.son.toque(); elegirProvincia(s, a, id); },
    });
    pintarDetalle(sel);
    ui.abrirCapa(h('div', { class: 'pila' }, h('h2', null, '🎤 ¿Dónde hacés el acto?'), h('p', { class: 'chico suave' }, 'Más color = más te votan. Las grandes pesan más.'), mapa, detalle), { cerrable: true, sinFoco: true });
  }

  function hacer(s, id, arg) {
    const res = R.camp.hacer(s, id, arg);
    if (res.error) {
      R.son.mal();
      ui.aviso('🚫 ' + res.error, { tipo: 'mal' });
      return;
    }
    R.guardar(s);
    const efectos = R.describirAplicado(s, res.aplicado);
    if (res.costo) efectos.unshift({ k: 'fondos', emoji: '💰', nombre: 'Fondos', v: -res.costo, sube: false, bueno: false, flechas: 1, numero: true });
    const dv = res.votosDespues - res.votosAntes;
    const extra = h('div', { class: 'chico', style: { fontWeight: 900 } }, '🗳️ Te votaría: ' + R.fmt(res.votosAntes, 1) + '% → ',
      h('span', { style: { color: dv >= 0 ? 'var(--bien)' : 'var(--mal)' } }, R.fmt(res.votosDespues, 1) + '% ' + (dv >= 0.05 ? '▲' : dv <= -0.05 ? '▼' : '')));
    ui.aviso(res.txt, { tipo: res.especial ? 'especial' : res.bueno ? 'bien' : 'mal', efectos, extra });
    if (res.especial) R.son.genial();
    else if (res.bueno) R.son.bien();
    else R.son.mal();
    ui.vista = Object.assign({}, ui.vista, { mantenerScroll: true });
    ui.render();
    ui.vista.mantenerScroll = false;
    const f = document.getElementById('rec-fondos');
    if (f) f.classList.add('pulso');
  }

  // ── Mapa ──
  function tarjetaMapa(s) {
    const votos = R.camp.votos(s).prov;
    const info = h('div', { class: 'pila' }, h('p', { class: 'centro suave chico' }, '👆 Tocá una provincia para ver quién gana ahí'));
    const mostrar = (id) => {
      if (!R.PROV[id]) {
        info.replaceChildren(h('div', { class: 'tarjeta plana suave centro' }, h('b', null, '🇦🇷 Islas Malvinas'), h('p', { class: 'chico' }, 'Fueron, son y serán argentinas.')));
        return;
      }
      const v = votos[id];
      const orden = Object.keys(v).sort((a, b) => v[b] - v[a]);
      info.replaceChildren(h('div', { class: 'tarjeta plana suave pila', style: { gap: '8px' } },
        h('div', { class: 'fila entre' }, h('b', { style: { fontFamily: 'var(--f-titulo)', fontWeight: 400, fontSize: '20px' } }, R.PROV[id].nombre),
          h('span', { class: 'chip' }, '📍 Apoyo local ' + R.fmt(s.camp.presencia[id]) + '%')),
        h('div', { class: 'encuesta' }, orden.slice(0, 3).map((k) => {
          const p = R.partidoInfo(s, k);
          return h('div', { class: 'linea' + (k === 'YO' ? ' yo' : '') }, ui.miniEscudo(p),
            h('div', null, h('div', { class: 'nombre' }, p.sigla), h('div', { class: 'barra' }, h('i', { style: { width: v[k] + '%', background: p.color } }))),
            h('div', { class: 'pct' }, R.fmt(v[k], 1)));
        }))));
    };
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'titulo-seccion' }, '🗺️ Dónde te votan'),
      R.ui.mapa({
        colorDe: (id) => (R.PROV[id] ? R.ui.colorEscala(s.partido.color, Math.min(100, votos[id].YO * 2.2)) : null),
        valorDe: (id) => (R.PROV[id] ? R.fmt(votos[id].YO, 0) + '%' : null),
        alTocar: (id) => { R.son.toque(); mostrar(id); },
      }),
      info);
  }

  // ── Encuesta ──
  function tarjetaEncuesta(s) {
    const enc = R.camp.encuesta(s);
    const ant = s.encuestas.length >= 2 ? s.encuestas[s.encuestas.length - 2] : null;
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, '📊 Encuesta'), h('span', { class: 'chip' }, R.fechaCorta(s.mes))),
      ui.encuesta(s, enc, { anterior: ant }),
      s.encuestas.length > 1 ? tendencia(s) : null,
      h('p', { class: 'chico suave' }, 'Las encuestas tienen ± 2 puntos de error.'));
  }

  // Línea de tu evolución mes a mes.
  function tendencia(s) {
    const S = R.svg;
    const pts = s.encuestas.map((e) => e.YO);
    const max = Math.max(10, ...pts) * 1.15;
    const W = 300;
    const H = 70;
    const x = (i) => 10 + (i * (W - 20)) / Math.max(1, pts.length - 1);
    const y = (v) => H - 8 - (v / max) * (H - 18);
    const linea = pts.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    return h('div', null, h('div', { class: 'etiqueta' }, 'Tu evolución'),
      S('svg', { viewBox: '0 0 ' + W + ' ' + H, style: 'width:100%;height:auto;display:block', role: 'img', 'aria-label': 'Evolución de tu intención de voto' },
        S('line', { x1: 10, x2: W - 10, y1: y(0), y2: y(0), stroke: '#c9d6e6', 'stroke-width': 1 }),
        S('path', { d: linea + ' L' + x(pts.length - 1) + ' ' + y(0) + ' L' + x(0) + ' ' + y(0) + ' Z', fill: ui.aclarar(s.partido.color, 0.75) }),
        S('path', { d: linea, fill: 'none', stroke: s.partido.color, 'stroke-width': 3, 'stroke-linejoin': 'round' }),
        S('circle', { cx: x(pts.length - 1), cy: y(pts[pts.length - 1]), r: 5, fill: s.partido.color, stroke: '#13284a', 'stroke-width': 2 }),
        S('text', { x: x(pts.length - 1) - 4, y: y(pts[pts.length - 1]) - 9, 'text-anchor': 'end', style: 'font-size:12px;font-weight:900;fill:#13284a' }, R.fmt(pts[pts.length - 1], 1) + '%')));
  }

  // ── Pasar el mes ──
  ui.pasarMes = function () {
    const s = ui.s;
    if (ui.hayCapa()) return;
    if (s.fase === 'campana' && s.camp.agenda > 0 && !ui.confirmoPasar) {
      ui.abrirCapa(h('div', { class: 'pila centro' },
        h('div', { style: { fontSize: '44px' } }, '⏱️'),
        h('h2', null, 'Te quedan ' + s.camp.agenda + (s.camp.agenda === 1 ? ' acción' : ' acciones')),
        h('p', null, 'Si pasás el mes, se pierden.'),
        h('button', { class: 'boton ancho', onclick: () => { ui.cerrarCapa(); } }, '🎯 Usarlas'),
        h('button', { class: 'boton sec ancho', onclick: () => { ui.confirmoPasar = true; ui.cerrarCapa(); ui.pasarMes(); } }, 'Pasar igual ▶')), { cerrable: true });
      return;
    }
    ui.confirmoPasar = false;
    const antes = s.fase === 'campana' ? R.camp.encuesta(s).YO : 0;
    R.son.tambor();
    R.turno.pasar(s);
    R.guardar(s);
    ui.vista = { tab: (ui.vista && ui.vista.tab) || (s.fase === 'gobierno' ? 'inicio' : 'acciones') };
    ui.render();
    window.scrollTo(0, 0);
    if (s.fase === 'campana') {
      const ahora = R.camp.encuesta(s).YO;
      const d = ahora - antes;
      ui.aviso('📅 ' + R.fechaTxt(s.mes) + ' · Encuesta: ' + R.fmt(ahora, 1) + '% ' + (d >= 0.05 ? '▲' : d <= -0.05 ? '▼' : '='), { tipo: d >= 0 ? 'bien' : 'mal', dur: 2200 });
    }
    ui.procesarCola();
  };
})(globalThis.R = globalThis.R || {});
