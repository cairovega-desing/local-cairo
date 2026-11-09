// Interfaz de metas (tarjeta en Inicio, elegir el gran objetivo, meta cumplida o vencida), protestas de los grupos,
// ataque de un vecino y ranking de potencias.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;
  ui.momentos = ui.momentos || {};

  // Chips cortos de un premio (⭐ +5, 👥 ▲, ✨ +15).
  const chipsPremio = (s, ef) => ui.chipsEfectos(R.gob.describirEfectos(s, ef || {}), { compacto: true });

  // ── 🎯 Metas (Inicio) ──
  ui.tarjetaMetas = function (s) {
    R.metas.asegurar(s);
    const A = s.metas.activas;
    if (!A.length) return null;
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'titulo-seccion' }, '🎯 Metas'),
      h('div', { class: 'pila', style: { gap: '8px' } }, A.map((a) => {
        const M = R.META[a.id];
        const p = R.metas.progreso(s, a);
        const q = R.metas.quedan(s, a);
        return h('button', { class: 'meta-fila toque' + (M.grande ? ' grande' : ''), onclick: () => verMeta(s, a) },
          h('span', { class: 'em' }, M.emoji),
          h('div', { class: 'pila', style: { gap: '3px', minWidth: 0 } },
            h('b', null, (M.grande ? '👑 ' : '') + M.nombre),
            h('span', { class: 'barra', style: { height: '8px' } }, h('i', { style: { width: p * 100 + '%', background: p >= 0.75 ? 'var(--bien)' : M.grande ? 'var(--sol)' : 'var(--celeste-fuerte, #3d8fd6)' } }))),
          h('span', { class: 'chip ' + (q <= 3 ? 'mal' : '') }, '⏳ ' + q + ' m'));
      })));
  };

  function verMeta(s, a) {
    R.son.toque();
    const M = R.META[a.id];
    const p = R.metas.progreso(s, a);
    ui.abrirCapa(h('div', { class: 'pila' },
      h('div', { class: 'fila' }, h('span', { style: { fontSize: '44px', lineHeight: 1 } }, M.emoji), h('div', null, M.grande ? h('div', { class: 'etiqueta' }, '👑 Tu gran objetivo') : null, h('h2', { style: { margin: 0 } }, M.nombre))),
      h('div', { class: 'fila entre chico' }, h('span', null, 'Hoy: ', h('b', null, M.fmt(M.dato(s)))), h('span', null, 'Meta: ', h('b', null, M.fmt(M.objetivo)))),
      h('span', { class: 'barra gorda' }, h('i', { style: { width: p * 100 + '%', background: 'var(--bien)' } })),
      h('div', { class: 'chico' }, '⏳ Quedan ' + R.metas.quedan(s, a) + ' meses'),
      h('div', { class: 'etiqueta' }, '🏆 Si llegás'), chipsPremio(s, M.premio),
      M.castigo && Object.keys(M.castigo).length ? h('div', { class: 'etiqueta' }, '⌛ Si no llegás') : null,
      M.castigo && Object.keys(M.castigo).length ? chipsPremio(s, M.castigo) : null), { cerrable: true });
  }

  // ── Momento: elegir el gran objetivo del mandato ──
  ui.momentos.legado = function (s, m, listo) {
    R.metas.asegurar(s);
    if (s.metas.grande) return listo();
    const ops = R.metas.opcionesGrandes(s);
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', { class: 'centro' }, '👑 Tu gran objetivo'),
      h('div', { class: 'fila envolver', style: { gap: '4px', justifyContent: 'center' } }, h('span', { class: 'chico' }, 'Si lo cumplís antes de la elección:'), chipsPremio(s, R.METAS_GRANDES[0].premio)),
      h('div', { class: 'lista-elegir' }, ops.map((M) => h('button', { class: 'item-elegir', onclick: () => {
        R.metas.elegirGrande(s, M.id);
        R.guardar(s);
        ui.cerrarCapa();
        R.son.genial();
        listo();
        ui.aviso('👑 Tu gran objetivo: ' + M.nombre, { tipo: 'bien' });
      } }, h('span', { class: 'ic' }, M.emoji), h('div', { class: 'pila', style: { gap: '3px', minWidth: 0 } }, h('b', null, M.nombre), h('span', { class: 'chico suave' }, 'Hoy: ' + M.fmt(M.dato(s)))))))));
  };

  // ── Momento: meta cumplida o vencida ──
  ui.momentos.meta = function (s, m, listo) {
    const M = R.META[m.id];
    if (m.ok) { R.son.genial(); ui.confeti(['#f6b40e', '#74acdf', '#ffffff']); } else R.son.mal();
    const efectos = R.describirAplicado(s, m.aplicado || []);
    ui.abrirCapa(h('div', { class: 'resultado-grande' },
      h('div', { class: 'em' }, m.ok ? '🎯' : '⌛'),
      h('div', { class: 'etiqueta' }, m.ok ? (M.grande ? '👑 ¡Cumpliste tu gran objetivo!' : '¡Meta cumplida!') : 'No llegaste'),
      h('div', { class: 'txt' }, M.emoji + ' ' + M.nombre),
      efectos.length ? ui.chipsEfectos(efectos) : null,
      h('button', { class: 'boton grande ancho', autofocus: true, onclick: () => { ui.cerrarCapa(); listo(); } }, 'Seguir ▶')));
  };

  // ── Momento: un grupo sale a la calle ──
  ui.momentos.protesta = function (s, m, listo) {
    const T = R.protestas.TIPOS[m.grupo];
    const g = R.GRUPO[m.grupo];
    const st = s.gob.grupos[m.grupo];
    const poder = R.protestas.poder(s)[m.grupo];
    R.son.abucheo();
    ui.abrirCapa(h('div', { class: 'pila' },
      h('div', { class: 'centro', style: { fontSize: '40px', letterSpacing: '6px' } }, T.dibujo),
      h('h2', { class: 'centro', style: { margin: 0 } }, T.emoji + ' ' + T.titulo),
      h('div', { class: 'fila', style: { gap: '10px', alignItems: 'center' } },
        R.ui.avatar(g.avatar, { size: 56, humor: R.humorAvatar(st.humor), fondo: ui.colorHumor(st.humor) }),
        h('div', { class: 'pila', style: { gap: '4px', minWidth: 0 } },
          h('b', null, g.emoji + ' ' + g.nombre + ': «' + T.pide + '»'),
          h('div', { class: 'fila envolver', style: { gap: '4px' } }, h('span', { class: 'chip' }, '💪 Poder ' + Math.round(poder) + '%'), h('span', { class: 'chip mal' }, '😡 ' + R.cara(st.humor) + ' ' + Math.round(st.humor))))),
      h('div', { class: 'lista-elegir' }, R.protestas.opciones(s, m.grupo).map((o) => {
        const b = R.protestas.bloqueo(s, o);
        return h('button', { class: 'item-elegir', disabled: b ? true : null, onclick: () => {
          const r = R.protestas.resolver(s, m.grupo, o.id);
          if (r.error) { R.son.mal(); ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); return; }
          R.guardar(s);
          ui.cerrarCapa();
          listo(); // primero sigue la cola y después el aviso, así no lo tapa la próxima hoja
          if (o.id === 'aguantar') ui.temblor();
          ui.mostrarResultado(s, r);
        } }, h('span', { class: 'ic' }, o.emoji),
          h('div', { class: 'pila', style: { gap: '4px', minWidth: 0 } }, h('b', null, o.txt), ui.chipsEfectos(R.gob.describirEfectos(s, o.ef), { compacto: true }), b ? h('span', { class: 'chico', style: { color: 'var(--mal)' } }, b) : null),
          o.costo.pc ? h('span', { class: 'chip sol' }, '⭐ ' + o.costo.pc) : null);
      }))));
  };

  // ── Momento: un vecino nos atacó ──
  ui.momentos.atacado = function (s, m, listo) {
    const P = R.PAIS[m.pais];
    R.son.tambor();
    ui.temblor();
    ui.abrirCapa(h('div', { class: 'resultado-grande' },
      h('div', { class: 'em' }, '🚨'),
      h('div', { class: 'txt' }, '¡' + P.nombre + ' nos atacó!'),
      h('div', { class: 'fila', style: { gap: '10px', justifyContent: 'center' } }, R.ui.bandera(m.pais, 56), h('span', { style: { fontSize: '30px' } }, '⚔️'), R.ui.bandera('ARG', 56)),
      ui.chipsEfectos(R.describirAplicado(s, m.aplicado || [])),
      h('div', { class: 'chico' }, '🛡️ Si ganás, cobrás. Si perdés, pagás.'),
      h('button', { class: 'boton grande ancho rojo', autofocus: true, onclick: () => { ui.cerrarCapa(); listo(); } }, '⚔️ A defendernos')));
  };

  // ── 🏆 Ranking de potencias ──
  ui.filaRanking = function (s) {
    const mun = R.mundo;
    return h('button', { class: 'ranking-btn toque', onclick: () => verRanking(s) },
      h('span', { class: 'em' }, '🏆'),
      h('span', null, h('b', null, mun.puesto(s, true) + '° en Sudamérica'), h('small', null, mun.puesto(s) + '° del mundo · ✨ Prestigio ' + Math.round(s.mundo.prestigio || 0))),
      h('span', { class: 'chico suave' }, '›'));
  };
  function verRanking(s) {
    R.son.toque();
    const mun = R.mundo;
    const fila = (x, i) => h('div', { class: 'ranking-fila' + (x.id === 'ARG' ? ' yo' : '') },
      h('b', { class: 'numero' }, (i + 1) + '°'), R.ui.bandera(x.id, 30), h('span', null, x.id === 'ARG' ? 'Argentina' : R.PAIS[x.id].nombre), h('b', { class: 'numero' }, x.puntos));
    const mundo = mun.ranking(s);
    const yo = mundo.findIndex((x) => x.id === 'ARG');
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, '🏆 Potencias'),
      h('div', { class: 'fila envolver', style: { gap: '4px' } }, h('span', { class: 'chip' }, '💵 Economía'), h('span', { class: 'chip' }, '⚔️ Poder militar'), h('span', { class: 'chip' }, '✨ Prestigio')),
      h('div', { class: 'etiqueta' }, '🌎 Sudamérica'),
      h('div', { class: 'pila', style: { gap: '4px' } }, mun.ranking(s, true).map(fila)),
      h('div', { class: 'etiqueta' }, '🌍 El mundo'),
      h('div', { class: 'pila', style: { gap: '4px' } }, mundo.slice(0, Math.max(6, yo + 1)).map(fila)),
      h('p', { class: 'chico suave' }, '✨ El prestigio sube con metas cumplidas, guerras ganadas y Malvinas.')), { cerrable: true });
  }
  ui.verRanking = verRanking;
})(globalThis.R = globalThis.R || {});
