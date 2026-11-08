// El mundo: tu poder, aliados, Malvinas, países y la guerra (frente tira y afloja).
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;
  const mun = R.mundo;

  const idx = ui.PESTANAS_GOB.findIndex((p) => p.id === 'diario');
  ui.PESTANAS_GOB.splice(idx, 0, { id: 'mundo', emoji: '🌎', nombre: 'Mundo' });
  ui.panelesGob.mundo = (s) => panelMundo(s);

  const relCara = (r) => (r >= 70 ? '😊' : r >= 40 ? '😐' : r >= 20 ? '😠' : '🤬');
  const relColor = (r) => (r >= 70 ? 'var(--bien)' : r >= 40 ? 'var(--sol)' : 'var(--mal)');

  function panelMundo(s) {
    const pc = ui.esPC();
    const izq = [tarjetaPoder(s), s.mundo.guerra ? tarjetaGuerra(s) : null, tarjetaMalvinas(s)];
    const der = [tarjetaPaises(s)];
    if (pc) return h('div', { class: 'columnas' }, h('div', { class: 'col-izq pila' }, izq), h('div', { class: 'pila' }, der));
    return h('div', { class: 'pila' }, izq, der);
  }

  function tarjetaPoder(s) {
    const poder = mun.poder(s);
    const aliados = mun.aliados(s);
    const tratados = R.PAISES.filter((p) => s.mundo.paises[p.id].tratado);
    const anexados = R.PAISES.filter((p) => s.mundo.paises[p.id].anexado);
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, R.ui.bandera('ARG', 34), ' Argentina en el mundo')),
      h('div', { class: 'fila', style: { gap: '10px' } },
        h('span', { style: { fontSize: '30px' } }, '⚔️'),
        h('div', { style: { flex: 1 } }, h('div', { class: 'fila entre' }, h('b', null, 'Poder militar'), h('b', { class: 'numero' }, String(poder))),
          h('div', { class: 'barra' }, h('i', { style: { width: Math.min(100, poder) + '%', background: 'var(--celeste)' } })))),
      h('div', { class: 'fila envolver', style: { gap: '6px' } },
        h('span', { class: 'chip' }, '🛡️ Aliados: ', aliados.length ? aliados.map((p) => R.ui.bandera(p.id, 20)) : 'ninguno'),
        h('span', { class: 'chip' }, '📦 Tratados: ' + tratados.length),
        anexados.length ? h('span', { class: 'chip sol' }, '🏴 Anexaste: ' + anexados.map((p) => p.nombre).join(', ')) : null),
      h('p', { class: 'chico suave' }, '🪖 Sube con Defensa y aviones.'),
      h('button', { class: 'boton sec ancho', onclick: () => elegirProveedor(s) }, '🛩️ Comprar aviones · ⭐1 · 💸4%'));
  }

  function elegirProveedor(s) {
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, '🛩️ ¿A quién le comprás?'),
      h('p', { class: 'chico suave' }, 'Poder militar +' + mun.COMPRA.poder + ' · cuesta 4% del presupuesto · mejora la relación con el que te vende.'),
      h('div', { class: 'lista-elegir' }, ['USA', 'CHN', 'RUS', 'UE'].map((id) => h('button', { class: 'item-elegir', onclick: () => {
        const res = mun.comprarArmas(s, id);
        ui.cerrarCapa();
        if (res.error) { ui.aviso('🚫 ' + res.error, { tipo: 'mal' }); return; }
        ui.mostrarResultado(s, res);
      } }, R.ui.bandera(id, 36), h('b', null, R.PAIS[id].nombre), h('span', { class: 'chip' }, relCara(s.mundo.paises[id].rel)))))), { cerrable: true });
  }

  // Frente de batalla: barra tira y afloja entre las dos banderas.
  ui.frente = function (s, W) {
    const F = mun.fuerzas(s, W.pais);
    return h('div', { class: 'pila', style: { gap: '6px' } },
      h('div', { class: 'frente' },
        R.ui.bandera('ARG', 40),
        h('div', { class: 'cuerda' }, h('i', { style: { width: W.frente + '%' } }), h('b', { class: 'marcador', style: { left: W.frente + '%' } }, '⚔️')),
        R.ui.bandera(W.pais, 40)),
      h('div', { class: 'fila entre chico' },
        h('span', null, '💪 Vos: ' + F.yo + (F.misAliados.length ? ' (con ' + F.misAliados.map((x) => R.PAIS[x].nombre).join(', ') + ')' : '')),
        h('span', null, R.PAIS[W.pais].nombre + ': ' + F.el + (F.susAliados.length ? ' (+' + F.susAliados.map((x) => R.PAIS[x].nombre).join(', ') + ')' : ''))),
      h('div', { class: 'chico suave' }, 'Empujá el frente hasta su bandera.'));
  };

  function tarjetaGuerra(s) {
    const W = s.mundo.guerra;
    return h('section', { class: 'tarjeta pila', style: { background: '#fff5f4' } },
      h('div', { class: 'titulo-seccion' }, '⚔️ Guerra con ' + R.PAIS[W.pais].nombre + ' · mes ' + (W.meses + 1)),
      ui.frente(s, W),
      h('p', { class: 'chico' }, 'Cada mes das una orden.'));
  }

  function tarjetaMalvinas(s) {
    const M = s.mundo.malvinas;
    const confirmar = ui.vista && ui.vista.confirmarMalvinas;
    const F = mun.fuerzas(s, 'GBR');
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'titulo-seccion' }, '🏝️ Islas Malvinas'),
      M.recuperadas ? h('div', { class: 'centro pila' }, R.ui.bandera('ARG', 90), h('b', { style: { fontFamily: 'var(--f-titulo)', fontSize: '24px', fontWeight: 400 } }, '¡Son argentinas!'))
        : h('div', { class: 'pila', style: { gap: '8px' } },
          h('div', { class: 'fila entre' }, h('b', null, 'Camino a la soberanía'), h('b', { class: 'numero' }, M.soberania + '%')),
          h('div', { class: 'barra gorda' }, h('i', { style: { width: M.soberania + '%', background: 'repeating-linear-gradient(90deg, #74acdf 0 14px, #ffffff 14px 28px)' } })),
          h('div', { class: 'lista-elegir' }, mun.MALVINAS.map((a) => {
            const b = mun.bloqueoMalvinas(s, a.id);
            return h('button', { class: 'item-elegir', disabled: b ? true : null, onclick: () => {
              const res = mun.malvinas(s, a.id);
              if (res.error) { ui.aviso('🚫 ' + res.error, { tipo: 'mal' }); return; }
              if (res.especial) { ui.confeti(['#74acdf', '#ffffff', '#f6b40e']); R.son.genial(); }
              ui.mostrarResultado(s, res);
            } }, h('span', { class: 'ic' }, a.emoji), h('div', null, h('b', null, a.nombre), h('div', { class: 'chico suave' }, b || ('+' + Math.round(R.clamp(a.avance(s), 2, 25)) + '% de soberanía'))), h('span', { class: 'chip sol' }, '⭐ ' + a.costo.pc));
          })),
          !s.mundo.guerra ? (confirmar
            ? h('div', { class: 'tarjeta plana pila', style: { background: 'var(--mal-claro)' } },
              h('b', null, '⚓ ¿Recuperarlas por la fuerza?'),
              h('div', { class: 'chico' }, '💪 Vos ' + F.yo + ' contra 🇬🇧 ' + F.el + ' (con ' + (F.susAliados.map((x) => R.PAIS[x].nombre).join(', ') || 'nadie') + '). ' + (F.ratio >= 1.1 ? 'Tenés chances.' : F.ratio >= 0.8 ? 'Muy parejo y arriesgado.' : 'Es casi imposible: conseguí aliados fuertes.')),
              h('div', { class: 'fila' },
                h('button', { class: 'boton mini rojo', onclick: () => { ui.vista.confirmarMalvinas = false; const r = mun.recuperarMalvinas(s); if (r.error) { ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); ui.refrescar(); return; } R.son.tambor(); ui.mostrarResultado(s, r); } }, '⚔️ ¡A la guerra! · ⭐5'),
                h('button', { class: 'boton mini sec', onclick: () => { ui.vista.confirmarMalvinas = false; ui.refrescar(); } }, 'Mejor no')))
            : h('button', { class: 'boton sec ancho', onclick: () => { ui.vista = Object.assign({}, ui.vista, { confirmarMalvinas: true }); ui.refrescar(); } }, '⚓ Recuperarlas por la fuerza…')) : null));
  }

  function tarjetaPaises(s) {
    return h('section', { class: 'pila' },
      h('div', { class: 'titulo-seccion' }, '🌎 Países'),
      h('div', { class: 'paises' }, R.PAISES.map((p) => {
        const st = s.mundo.paises[p.id];
        return h('button', { class: 'pais-carta toque' + (st.anexado ? ' anexado' : ''), onclick: () => verPais(s, p.id) },
          h('div', { class: 'fila', style: { gap: '8px' } }, R.ui.bandera(p.id, 40), h('b', { class: 'nombre-pais' }, p.nombre)),
          st.anexado ? h('span', { class: 'chip sol' }, '🏴 Anexado')
            : h('div', { class: 'fila', style: { gap: '6px' } }, h('span', null, relCara(st.rel)), h('div', { class: 'barra', style: { flex: 1, height: '8px' } }, h('i', { style: { width: st.rel + '%', background: relColor(st.rel) } }))),
          h('div', { class: 'fila envolver', style: { gap: '4px' } },
            h('span', { class: 'chip', style: { fontSize: '11px' } }, '⚔️ ' + p.poder),
            st.tratado ? h('span', { class: 'chip bien', style: { fontSize: '11px' } }, '📦') : null,
            st.alianza ? h('span', { class: 'chip bien', style: { fontSize: '11px' } }, '🛡️') : null,
            st.sancion ? h('span', { class: 'chip mal', style: { fontSize: '11px' } }, '🚫') : null,
            mun.enGuerraCon(s, p.id) ? h('span', { class: 'chip mal', style: { fontSize: '11px' } }, '⚔️ guerra') : null));
      })));
  }

  function verPais(s, id, confirmarGuerra) {
    R.son.toque();
    const p = R.PAIS[id];
    const st = s.mundo.paises[id];
    const F = mun.fuerzas(s, id);
    const bloque = p.bloque ? R.BLOQUES_MUNDO[p.bloque] : null;
    const efAcc = {
      visita: { rel: { [id]: 10 } },
      tratado: { expo: p.expo, campo: 3, empresarios: 3, trabajadores: -2 },
      prestamo: p.prestamo ? { reservas: p.prestamo, deuda: p.prestamo * 0.25 } : {},
      alianza: { rel: { [id]: 5 } },
      sancion: { rel: { [id]: -30 } },
      guerra: { todos: 6, riesgo: 300, crec: -1.5 },
    };
    ui.abrirCapa(h('div', { class: 'pila' },
      h('div', { class: 'fila' }, R.ui.bandera(id, 72), h('div', null, h('h2', null, p.nombre), bloque ? h('span', { class: 'chip' }, bloque.emoji + ' ' + bloque.nombre) : null)),
      st.anexado ? h('p', null, '🏴 Ahora es parte de la Argentina.') : h('div', { class: 'pila', style: { gap: '6px' } },
        h('div', { class: 'fila entre' }, h('b', null, relCara(st.rel) + ' Relación'), h('b', { class: 'numero' }, Math.round(st.rel) + '/100')),
        h('div', { class: 'barra' }, h('i', { style: { width: st.rel + '%', background: relColor(st.rel) } })),
        h('div', { class: 'chico' }, '⚔️ Su poder: ' + p.poder + ' · el tuyo: ' + mun.poder(s))),
      st.anexado ? null : h('div', { class: 'lista-elegir' }, mun.ACCIONES.filter((a) => !a.si || a.si(s, p, st) || a.id === 'guerra' && p.conquistable && !st.anexado).map((a) => {
        const b = mun.bloqueo(s, id, a.id);
        if (a.id === 'guerra' && confirmarGuerra && !b) {
          return h('div', { class: 'tarjeta plana pila', style: { background: 'var(--mal-claro)' } },
            h('b', null, '⚔️ ¿Seguro? Guerra contra ' + p.nombre),
            h('div', { class: 'chico' }, '💪 Vos ' + F.yo + (F.misAliados.length ? ' (con ' + F.misAliados.map((x) => R.PAIS[x].nombre).join(', ') + ')' : '') + ' contra ' + F.el + (F.susAliados.length ? ' (con ' + F.susAliados.map((x) => R.PAIS[x].nombre).join(', ') + ')' : '') + '. ' +
              (F.ratio >= 1.3 ? 'Tenés todas las de ganar.' : F.ratio >= 1 ? 'Ventaja chica: puede salir mal.' : 'Te superan: es muy arriesgado.')),
            h('div', { class: 'chico' }, 'Todo el mundo se va a enojar con vos. Si ganás, ' + p.nombre + ' pasa a ser parte del país.'),
            h('div', { class: 'fila' },
              h('button', { class: 'boton mini rojo', onclick: () => { const r = mun.hacer(s, id, 'guerra'); ui.cerrarCapa(); if (r.error) { ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); return; } R.son.tambor(); ui.temblor(); ui.mostrarResultado(s, r); } }, '⚔️ ¡A la guerra!'),
              h('button', { class: 'boton mini sec', onclick: () => verPais(s, id, false) }, 'Mejor no')));
        }
        return h('button', { class: 'item-elegir', disabled: b ? true : null, onclick: () => {
          if (a.id === 'guerra') return verPais(s, id, true);
          const r = mun.hacer(s, id, a.id);
          ui.cerrarCapa();
          if (r.error) { ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); return; }
          ui.mostrarResultado(s, r);
        } },
        h('span', { class: 'ic' }, a.emoji),
        h('div', { class: 'pila', style: { gap: '4px', minWidth: 0 } }, h('b', null, a.nombre), ui.chipsEfectos(R.gob.describirEfectos(s, efAcc[a.id] || {}), { compacto: true }), b ? h('span', { class: 'chico', style: { color: 'var(--mal)' } }, b) : null),
        h('span', { class: 'chip sol' }, '⭐ ' + (a.costo.pc || 0)));
      }))), { cerrable: true });
  }

  // ── Momento: orden de guerra del mes ──
  ui.momentos = ui.momentos || {};
  ui.momentos.guerra = function (s, m, listo) {
    const W = s.mundo.guerra;
    if (!W) return listo();
    const P = R.PAIS[W.pais];
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', { class: 'centro' }, '⚔️ Guerra con ' + P.nombre),
      h('div', { class: 'centro chico suave' }, 'Mes ' + (W.meses + 1) + ' · ' + (W.objetivo === 'malvinas' ? 'Objetivo: recuperar Malvinas' : 'Objetivo: anexar ' + P.nombre)),
      ui.frente(s, W),
      h('div', { class: 'lista-elegir' }, mun.ORDENES.map((o) => h('button', { class: 'item-elegir', onclick: () => {
        const antesFrente = W.frente;
        const antes = s.gob.aprob;
        const r = mun.orden(s, o.id);
        R.guardar(s);
        mostrarParte(s, W, antesFrente, r, antes, listo);
      } }, h('span', { class: 'ic' }, o.emoji),
        h('div', { class: 'pila', style: { gap: '4px' } }, h('b', null, o.nombre), h('div', { class: 'chico suave' }, o.desc),
          o.id !== 'paz' ? h('div', { class: 'riesgo malo' }, h('span', { class: 'pct' }, '🎲 ' + Math.round(mun.probRetroceso(s, o.id) * 100) + '%'), h('span', { class: 'txt' }, 'de retroceder:'), h('span', { class: 'ef mal' }, '⚔️ frente ◀'), h('span', { class: 'ef mal' }, '👥 ▼'))
            : h('div', { class: 'riesgo ' + (W.frente >= 55 ? 'bueno' : 'malo') }, h('span', { class: 'txt' }, W.frente >= 55 ? 'Ganás una indemnización' : 'Pagás una indemnización'))),
        h('span', { class: 'chip ' + (o.costo.gasto ? 'mal' : '') }, o.costo.gasto ? '💸 ' + o.costo.gasto + '%' : 'gratis'))))));
  };

  function mostrarParte(s, W, antesFrente, r, aprobAntes, listo) {
    const fin = r.fin;
    if (fin === 'victoria' || fin === 'paz_buena') { R.son.genial(); if (fin === 'victoria') ui.confeti(['#74acdf', '#ffffff', '#f6b40e']); }
    else if (fin) { R.son.abucheo(); ui.temblor(); }
    else if (r.delta >= 0) R.son.bien(); else R.son.mal();
    const efectos = R.describirAplicado(s, r.aplicado || []);
    const W2 = Object.assign({}, W, { frente: fin === 'victoria' ? 100 : fin === 'derrota' ? 0 : W.frente });
    const cont = h('div', { class: 'resultado-grande' },
      h('div', { class: 'em' }, fin === 'victoria' ? '🎖️' : fin === 'derrota' ? '💀' : fin ? '🕊️' : r.delta >= 0 ? '💪' : '😰'),
      h('div', { class: 'txt' }, r.txt),
      !fin || fin === 'victoria' || fin === 'derrota' ? ui.frente(s, Object.assign({}, W2, { frente: antesFrente })) : null,
      efectos.length ? ui.chipsEfectos(efectos) : null,
      h('div', { class: 'chico', style: { fontWeight: 900 } }, '👍 Aprobación: ' + R.fmt(aprobAntes, 1) + '% → ' + R.fmt(s.gob.aprob, 1) + '%'),
      h('button', { class: 'boton grande ancho', autofocus: true, onclick: () => { ui.cerrarCapa(); listo(); } }, 'Seguir ▶'));
    ui.abrirCapa(cont);
    // Animar el marcador desde donde estaba hasta donde quedó.
    const marc = cont.querySelector('.marcador');
    const barra = cont.querySelector('.cuerda > i');
    if (marc && barra) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        marc.style.left = W2.frente + '%';
        barra.style.width = W2.frente + '%';
      }));
    }
  }

})(globalThis.R = globalThis.R || {});
