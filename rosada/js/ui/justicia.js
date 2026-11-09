// Interfaz de la Justicia (la Corte frena una ley) y de la oposición que quiere derogar una ley tuya.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;
  ui.momentos = ui.momentos || {};

  // Lo que hace la ley «con el tiempo» (lo que se pierde si cae), en chips.
  function loQuePerdes(s, ley) {
    const ef = R.gob.efectosLey(s, ley, 3);
    const lista = (ef.luego || []).concat(ef.ya || []).slice(0, 3);
    return lista.length ? ui.chipsEfectos(lista, { compacto: true }) : null;
  }
  const sigla = (b) => (R.PARTIDOS[b] ? R.PARTIDOS[b].sigla : b);

  function opcion(s, o, extra, alElegir) {
    const b = o.costo.pc && s.gob.pc < o.costo.pc ? 'Falta ⭐' : null;
    return h('button', { class: 'item-elegir', disabled: b ? true : null, onclick: alElegir },
      h('span', { class: 'ic' }, o.emoji),
      h('div', { class: 'pila', style: { gap: '4px', minWidth: 0 } }, h('b', null, o.txt), extra, b ? h('span', { class: 'chico', style: { color: 'var(--mal)' } }, b) : null),
      o.costo.pc ? h('span', { class: 'chip sol' }, '⭐ ' + o.costo.pc) : null);
  }
  function cerrarYMostrar(s, r, listo) {
    if (r.error) { R.son.mal(); ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); return; }
    R.guardar(s);
    ui.cerrarCapa();
    listo();
    ui.mostrarResultado(s, r);
  }

  // ── La Corte frena una ley ──
  ui.momentos.justicia = function (s, m, listo) {
    const ley = R.LEY[m.ley];
    if (!s.gob.leyes[m.ley]) return listo();
    const pct = Math.round(R.justicia.chanceApelar(s) * 100);
    R.son.mal();
    const extras = {
      acatar: h('div', { class: 'fila envolver', style: { gap: '4px' } }, h('span', { class: 'chip mal' }, '📜 Se cae la ley'), ui.chipsEfectos(R.gob.describirEfectos(s, R.justicia.OPCIONES[0].ef), { compacto: true })),
      apelar: h('div', { class: 'riesgo ' + (pct >= 50 ? 'bueno' : 'malo') }, h('span', { class: 'pct' }, '🎲 ' + pct + '%'), h('span', { class: 'txt' }, 'de ganar y que siga')),
      desobedecer: ui.chipsEfectos(R.gob.describirEfectos(s, R.justicia.OPCIONES[2].ef), { compacto: true }),
    };
    ui.abrirCapa(h('div', { class: 'pila' },
      h('div', { class: 'centro', style: { fontSize: '40px', letterSpacing: '6px' } }, '⚖️ 🏛️ ' + ley.emoji),
      h('h2', { class: 'centro', style: { margin: 0 } }, 'La Corte frena tu ley'),
      h('div', { class: 'centro' }, h('span', { class: 'chip sol' }, ley.emoji + ' ' + ley.nombre)),
      h('div', { class: 'fila envolver', style: { gap: '4px', justifyContent: 'center' } }, h('span', { class: 'chico suave' }, 'Si cae, perdés:'), loQuePerdes(s, ley)),
      h('div', { class: 'lista-elegir' }, R.justicia.OPCIONES.map((o) => opcion(s, o, extras[o.id], () => cerrarYMostrar(s, R.justicia.resolver(s, m, o.id), listo))))));
  };

  // ── La oposición quiere derogar una ley ──
  ui.momentos.derogacion = function (s, m, listo) {
    const ley = R.LEY[m.ley];
    if (!s.gob.leyes[m.ley]) return listo();
    const votos = R.congreso.votosVeto(s);
    const alcanza = votos >= R.congreso.VETO;
    R.son.mal();
    const extras = {
      negociar: h('span', { class: 'chico suave' }, 'La ley sigue'),
      vetar: h('div', { class: 'riesgo ' + (alcanza ? 'bueno' : 'malo') }, h('span', { class: 'txt' }, alcanza ? '✅ Te alcanza para vetar (' + votos + ' de ' + R.congreso.VETO + ')' : '❌ No te alcanza: insisten (' + votos + ' de ' + R.congreso.VETO + ')')),
      dejar: h('span', { class: 'chip mal' }, '📜 Se cae la ley'),
    };
    ui.abrirCapa(h('div', { class: 'pila' },
      h('div', { class: 'centro', style: { fontSize: '40px', letterSpacing: '6px' } }, '🏛️ ✋ ' + ley.emoji),
      h('h2', { class: 'centro', style: { margin: 0 } }, sigla(m.bloque) + ' quiere voltear tu ley'),
      h('div', { class: 'centro' }, h('span', { class: 'chip sol' }, ley.emoji + ' ' + ley.nombre)),
      h('div', { class: 'fila envolver', style: { gap: '4px', justifyContent: 'center' } }, h('span', { class: 'chico suave' }, 'Si cae, perdés:'), loQuePerdes(s, ley)),
      h('div', { class: 'lista-elegir' }, R.congreso.OPCIONES_DEROGACION.map((o) => opcion(s, o, extras[o.id], () => cerrarYMostrar(s, R.congreso.resolverDerogacion(s, m, o.id), listo))))));
  };
})(globalThis.R = globalThis.R || {});
