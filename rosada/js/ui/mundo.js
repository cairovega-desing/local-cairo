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
    const izq = [tarjetaPoder(s), s.mundo.guerra ? tarjetaGuerra(s) : null, s.mundo.crisis && !s.mundo.guerra ? tarjetaCrisis(s) : null, tarjetaNoticiasMundo(s), tarjetaMalvinas(s)];
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
      ui.filaRanking ? ui.filaRanking(s) : null,
      h('div', { class: 'fila', style: { gap: '10px' } },
        h('span', { style: { fontSize: '30px' } }, '⚔️'),
        h('div', { style: { flex: 1 } }, h('div', { class: 'fila entre' }, h('b', null, 'Poder militar'), h('b', { class: 'numero' }, String(poder))),
          h('div', { class: 'barra' }, h('i', { style: { width: Math.min(100, poder) + '%', background: 'var(--celeste)' } })))),
      h('div', { class: 'fila envolver', style: { gap: '6px' } },
        h('span', { class: 'chip' }, '🛡️ Aliados: ', aliados.length ? aliados.map((p) => R.ui.bandera(p.id, 20)) : 'ninguno'),
        h('span', { class: 'chip' }, '📦 Tratados: ' + tratados.length),
        anexados.length ? h('span', { class: 'chip sol' }, '🏴 Anexaste: ' + anexados.map((p) => p.nombre).join(', ')) : null),
      (s.mundo.panico || 0) >= 1 ? h('div', { class: 'pila', style: { gap: '4px' } },
        h('div', { class: 'fila entre' }, h('b', null, '😱 Pánico mundial'), h('b', { class: 'numero' }, Math.round(s.mundo.panico) + '%')),
        h('div', { class: 'barra' }, h('i', { style: { width: s.mundo.panico + '%', background: 'var(--mal)' } })),
        h('span', { class: 'chico suave' }, 'Te sube el riesgo país y te compran menos. Baja con el tiempo.')) : null,
      h('p', { class: 'chico suave' }, '🪖 Sube con Defensa y aviones.'),
      h('button', { class: 'boton sec ancho', onclick: () => elegirProveedor(s) }, '🛩️ Comprar aviones · ⭐1 · 💸4%'));
  }

  // 📰 Lo que pasa en el mundo (alianzas entre países, pedidos de protección, ofertas).
  function tarjetaNoticiasMundo(s) {
    const lista = (s.mundo.noticias || []).slice(0, 4);
    if (!lista.length) return null;
    return h('section', { class: 'tarjeta pila', style: { gap: '6px' } },
      h('div', { class: 'titulo-seccion' }, '📰 En el mundo'),
      lista.map((n) => h('div', { class: 'fila', style: { gap: '8px', alignItems: 'flex-start' } }, h('span', null, n.emoji), h('span', { class: 'chico', style: { flex: 1 } }, n.txt), h('span', { class: 'chico suave' }, R.fechaCorta(n.mes)))));
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
      W.meses === 0 ? h('div', { class: 'chico suave' }, 'Empujá el frente hasta su bandera.') : null);
  };

  // Chances de ganar desde donde está el frente ahora.
  function chipChances(s, W) {
    const ch = mun.chances(s, W.pais, W.frente);
    const pct = Math.round(ch.gana * 100);
    if (ch.gana < 0.05 && ch.pierde < 0.05) return h('span', { class: 'chip sol' }, '🤝 Parejos: se traba');
    return h('span', { class: 'chip ' + (pct >= 60 ? 'bien' : pct >= 30 ? 'sol' : 'mal') }, '🎲 Chances de ganar: ' + pct + '%');
  }

  // ── Inclinar la guerra con ⭐: una grilla de 6 botones; el detalle se abre arriba ──
  ui.accionesGuerra = function (s, volver, opts) {
    return h('div', { class: 'pila', style: { gap: '6px' } },
      h('b', null, '⭐ Inclinar la guerra'),
      h('div', { class: 'acc-guerra' }, mun.ACC_GUERRA.map((a) => {
        const b = mun.bloqueoGuerra(s, a.id);
        const pais = a.pais && a.pais(s, s.mundo.guerra);
        const espera = b && b.startsWith('De nuevo') ? '⏳ ' + b.replace(/\D+/g, '') + ' m' : null;
        const etiqueta = b === 'Ya lo hiciste' ? '✔️ Hecho' : espera || (b && b !== 'Falta ⭐' ? '—' : '⭐ ' + mun.costoAccGuerra(s, a));
        return h('button', { class: 'acc-g' + (b ? ' apagada' : ''), onclick: () => detalleAccGuerra(s, a.id, volver, opts) },
          h('span', { class: 'ic' }, a.emoji, pais ? R.ui.bandera(pais, 18) : null),
          h('b', null, a.corto),
          h('span', { class: 'chip precio ' + (b === 'Falta ⭐' ? 'mal' : b ? '' : 'sol') }, etiqueta));
      })));
  };

  function detalleAccGuerra(s, id, volver, opts) {
    R.son.toque();
    const W = s.mundo.guerra;
    const a = mun.ACC_GUERRA.find((x) => x.id === id);
    const b = mun.bloqueoGuerra(s, id);
    const pc = mun.costoAccGuerra(s, a);
    const pais = a.pais && a.pais(s, W);
    const sePuede = !b || b === 'Falta ⭐';
    const pv = sePuede ? mun.previaGuerra(s, id) : null;
    const efectos = sePuede ? R.gob.describirEfectos(s, mun.efAccGuerra(s, a)) : [];
    const pct = (x) => Math.round(x * 100) + '%';
    ui.abrirCapa(h('div', { class: 'pila' },
      h('div', { class: 'fila' }, h('span', { style: { fontSize: '36px', lineHeight: 1 } }, a.emoji), pais ? R.ui.bandera(pais, 36) : null),
      h('h2', { style: { fontSize: '22px' } }, mun.nombreAccGuerra(s, a)),
      pv ? h('div', { class: 'fila envolver', style: { gap: '6px' } },
        pv.yo[0] !== pv.yo[1] ? h('span', { class: 'chip bien' }, '💪 Vos: ' + pv.yo[0] + ' → ' + pv.yo[1]) : null,
        pv.el[0] !== pv.el[1] ? h('span', { class: 'chip bien' }, '⚔️ ' + R.PAIS[W.pais].nombre + ': ' + pv.el[0] + ' → ' + pv.el[1]) : null,
        Math.round(pv.antes * 100) !== Math.round(pv.despues * 100) ? h('span', { class: 'chip ' + (pv.despues > pv.antes ? 'bien' : '') }, '🎲 Ganar: ' + pct(pv.antes) + ' → ' + pct(pv.despues)) : null) : null,
      efectos.length ? ui.chipsEfectos(efectos) : null,
      a.cada ? h('div', { class: 'chico suave' }, '🔁 Se repite cada ' + a.cada + ' meses') : null,
      b ? h('div', { class: 'chico', style: { color: 'var(--mal)', fontWeight: 800 } }, '🚫 ' + b) : null,
      h('div', { class: 'fila' },
        h('button', { class: 'boton', disabled: b ? true : null, onclick: () => {
          const r = mun.accionGuerra(s, id);
          if (r.error) { R.son.mal(); ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); return; }
          R.guardar(s);
          R.son.bien();
          volver();
          ui.aviso(r.txt, { tipo: 'bien', efectos: R.describirAplicado(s, r.aplicado) });
        } }, 'Hacerlo ⭐' + pc),
        h('button', { class: 'boton sec', onclick: () => volver() }, 'Volver'))), opts);
  }

  // ── Reclamo abierto ──
  function infoCrisis(s, C) {
    const P = R.PAIS[C.pais];
    const F = mun.fuerzas(s, C.pais);
    const premio = mun.premioCrisis(P);
    return h('div', { class: 'pila', style: { gap: '6px' } },
      h('div', { class: 'fila', style: { gap: '8px', justifyContent: 'center' } }, R.ui.bandera('ARG', 44), h('b', { style: { fontSize: '22px' } }, '😤'), R.ui.bandera(C.pais, 44)),
      h('div', { class: 'fila entre chico' }, h('span', null, '💪 Vos: ' + F.yo), h('span', null, P.nombre + ': ' + F.el + (F.susAliados.length ? ' (+' + F.susAliados.map((x) => R.PAIS[x].nombre).join(', ') + ')' : ''))),
      h('span', { class: 'barra' }, h('i', { style: { width: (C.meses / mun.CRISIS_MESES) * 100 + '%', background: 'var(--mal)' } })),
      h('div', { class: 'fila envolver', style: { gap: '4px' } }, h('span', { class: 'chico suave' }, 'Si cede:'),
        ui.chipsEfectos(R.gob.describirEfectos(s, premio), { compacto: true }), h('span', { class: 'chip bien' }, '📦 Mercado ▲')));
  }
  function tarjetaCrisis(s) {
    const C = s.mundo.crisis;
    return h('section', { class: 'tarjeta pila', style: { background: '#fff8ee' } },
      h('div', { class: 'titulo-seccion' }, '😤 Reclamo a ' + R.PAIS[C.pais].nombre),
      infoCrisis(s, C),
      h('div', { class: 'chico' }, 'Le quedan ' + (mun.CRISIS_MESES - C.meses) + ' meses para responder.'));
  }
  ui.momentos = ui.momentos || {};
  ui.momentos.crisis = function (s, m, listo) {
    const C = s.mundo.crisis;
    if (!C || s.mundo.guerra) return listo();
    const P = R.PAIS[C.pais];
    const esperar = Math.round(mun.chanceCeder(s, C.pais, false) * 100);
    const presionar = Math.round(mun.chanceCeder(s, C.pais, true) * 100);
    const extra = {
      presionar: h('div', { class: 'riesgo ' + (presionar >= 25 ? 'bueno' : 'malo') }, h('span', { class: 'pct' }, '🎲 ' + presionar + '%'), h('span', { class: 'txt' }, 'de que ceda'), h('span', { class: 'ef mal' }, '😱 ▲')),
      esperar: h('div', { class: 'riesgo ' + (esperar >= 25 ? 'bueno' : 'malo') }, h('span', { class: 'pct' }, '🎲 ' + esperar + '%'), h('span', { class: 'txt' }, 'de que ceda')),
      guerra: (() => { const ch = mun.chances(s, C.pais); return h('span', { class: 'chico suave' }, '🎲 Chances de ganar: ' + Math.round(ch.gana * 100) + '%'); })(),
      retroceder: ui.chipsEfectos(R.gob.describirEfectos(s, { prestigio: -5, todos: -2 }), { compacto: true }),
    };
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', { class: 'centro', style: { margin: 0 } }, '😤 Reclamo a ' + P.nombre),
      h('div', { class: 'centro chico suave' }, 'Mes ' + (C.meses + 1) + ' de ' + mun.CRISIS_MESES),
      infoCrisis(s, C),
      h('div', { class: 'lista-elegir' }, mun.OPC_CRISIS.map((o) => {
        const b = mun.bloqueoCrisis(s, o.id);
        if (b === 'Se acabó el plazo') return null;
        return h('button', { class: 'item-elegir', disabled: b ? true : null, onclick: () => {
          const r = mun.crisisOrden(s, o.id);
          if (r.error) { R.son.mal(); ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); return; }
          R.guardar(s);
          ui.cerrarCapa();
          if (r.fin === 'cedio') { ui.confeti(['#74acdf', '#ffffff', '#f6b40e']); }
          if (r.fin === 'guerra') { R.son.tambor(); ui.temblor(); }
          listo();
          ui.mostrarResultado(s, r);
        } }, h('span', { class: 'ic' }, o.emoji),
          h('div', { class: 'pila', style: { gap: '4px', minWidth: 0 } }, h('b', null, o.nombre), extra[o.id], b ? h('span', { class: 'chico', style: { color: 'var(--mal)' } }, b) : null),
          o.costo.pc ? h('span', { class: 'chip sol' }, '⭐ ' + o.costo.pc) : null);
      }))));
  };

  function tarjetaGuerra(s) {
    const W = s.mundo.guerra;
    return h('section', { class: 'tarjeta pila', style: { background: '#fff5f4' } },
      h('div', { class: 'titulo-seccion' }, '⚔️ Guerra con ' + R.PAIS[W.pais].nombre + ' · mes ' + (W.meses + 1)),
      ui.frente(s, W),
      h('div', null, chipChances(s, W)),
      ui.accionesGuerra(s, () => { ui.cerrarCapa(); ui.refrescar(); }, { cerrable: true }));
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
            R.COMPRA && R.COMPRA[p.id] ? h('span', { class: 'chip', style: { fontSize: '11px' }, title: 'Te compra' }, '🛒' + R.COMPRA[p.id].map((k) => R.PRODUCTOS[k].emoji).join('')) : null,
            st.tratado ? h('span', { class: 'chip bien', style: { fontSize: '11px' } }, '📦') : null,
            st.alianza ? h('span', { class: 'chip bien', style: { fontSize: '11px' } }, '🛡️') : null,
            st.sancion ? h('span', { class: 'chip mal', style: { fontSize: '11px' } }, '🚫') : null,
            mun.enGuerraCon(s, p.id) ? h('span', { class: 'chip mal', style: { fontSize: '11px' } }, '⚔️ guerra') : null,
            !st.anexado && mun.ofreceAlianza(s, p.id) ? h('span', { class: 'chip sol', style: { fontSize: '11px' } }, '🤝 te ofrece alianza') : null));
      })));
  }

  function verPais(s, id, confirmarGuerra) {
    R.son.toque();
    const p = R.PAIS[id];
    const st = s.mundo.paises[id];
    const F = mun.fuerzas(s, id);
    const bloque = p.bloque ? R.BLOQUES_MUNDO[p.bloque] : null;
    const susAmigos = st.anexado ? [] : mun.amigosDe(s, id);
    const efAcc = {
      visita: { rel: { [id]: 10 } },
      tratado: { expo: R.round(p.expo * mun.mezcla(s, id), 3), campo: 3, empresarios: 3, trabajadores: -2 },
      prestamo: p.prestamo ? { reservas: p.prestamo, deuda: p.prestamo * 0.25 } : {},
      alianza: { rel: { [id]: 5 } },
      sancion: { rel: { [id]: -30 } },
      guerra: { todos: 6, riesgo: 300, crec: -1.5 },
      reclamo: { todos: 2, rel: { [id]: -20 } },
    };
    ui.abrirCapa(h('div', { class: 'pila' },
      h('div', { class: 'fila' }, R.ui.bandera(id, 72), h('div', null, h('h2', null, p.nombre), bloque ? h('span', { class: 'chip' }, bloque.emoji + ' ' + bloque.nombre) : null)),
      st.anexado ? h('p', null, '🏴 Ahora es parte de la Argentina.') : h('div', { class: 'pila', style: { gap: '6px' } },
        h('div', { class: 'fila entre' }, h('b', null, relCara(st.rel) + ' Relación'), h('b', { class: 'numero' }, Math.round(st.rel) + '/100')),
        h('div', { class: 'barra' }, h('i', { style: { width: st.rel + '%', background: relColor(st.rel) } })),
        h('div', { class: 'chico' }, '⚔️ Su poder: ' + p.poder + ' · el tuyo: ' + mun.poder(s)),
        R.COMPRA && R.COMPRA[id] ? h('div', { class: 'fila envolver', style: { gap: '4px' } }, h('span', { class: 'chico suave' }, '🛒 Te compra:'),
          R.COMPRA[id].map((k) => ui.chipPrecio ? ui.chipPrecio(s, k, true) : h('span', { class: 'chip' }, R.PRODUCTOS[k].emoji)),
          st.tratado ? h('span', { class: 'chip ' + (mun.mezcla(s, id) >= 1.05 ? 'bien' : mun.mezcla(s, id) <= 0.95 ? 'mal' : '') }, '📦 Tu tratado rinde ' + (mun.mezcla(s, id) >= 1 ? '+' : '−') + Math.round(Math.abs(mun.mezcla(s, id) - 1) * 100) + '%') : null) : null,
        susAmigos.length ? h('div', { class: 'fila envolver', style: { gap: '4px' } }, h('span', { class: 'chico suave' }, 'Sus amigos:'), susAmigos.map((x) => R.ui.bandera(x, 24))) : null),
      st.anexado ? null : h('div', { class: 'lista-elegir' }, mun.ACCIONES.filter((a) => !a.si || a.si(s, p, st) || a.id === 'guerra').map((a) => {
        const b = mun.bloqueo(s, id, a.id);
        if (a.id === 'guerra' && confirmarGuerra && !b) {
          const ch = mun.chances(s, id);
          const pct = Math.round(ch.gana * 100);
          return h('div', { class: 'tarjeta plana pila', style: { background: 'var(--mal-claro)' } },
            h('b', null, '⚔️ ¿Seguro? Guerra contra ' + p.nombre),
            h('div', { class: 'chico' }, '💪 Vos ' + F.yo + (F.misAliados.length ? ' (con ' + F.misAliados.map((x) => R.PAIS[x].nombre).join(', ') + ')' : '') + ' contra ' + F.el + (F.susAliados.length ? ' (con ' + F.susAliados.map((x) => R.PAIS[x].nombre).join(', ') + ')' : '')),
            h('div', { class: 'fila envolver', style: { gap: '6px' } },
              ch.gana < 0.05 && ch.pierde < 0.05 ? h('span', { class: 'chip sol' }, '🤝 Parejos: se traba, nadie gana')
                : h('span', { class: 'chip ' + (pct >= 60 ? 'bien' : pct >= 30 ? 'sol' : 'mal') }, '🎲 Chances de ganar: ' + pct + '%'),
              ch.meses && ch.gana >= 0.05 ? h('span', { class: 'chip' }, '⏳ ~' + ch.meses + ' meses') : null),
            h('div', { class: 'fila envolver', style: { gap: '4px' } }, h('span', { class: 'chico' }, '😠 Se enojan mucho:'), susAmigos.length ? susAmigos.map((x) => R.ui.bandera(x, 22)) : h('span', { class: 'chico' }, 'nadie en especial'), h('span', { class: 'chico' }, '· 😱 pánico mundial ▲')),
            h('div', { class: 'chico' }, 'Si ganás, ' + p.nombre + ' pasa a ser parte del país.'),
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
        h('div', { class: 'pila', style: { gap: '4px', minWidth: 0 } }, h('b', null, a.nombre), ui.chipsEfectos(R.gob.describirEfectos(s, efAcc[a.id] || {}), { compacto: true }),
          a.id === 'reclamo' && !b ? h('div', { class: 'riesgo ' + (mun.chanceCeder(s, id) >= 0.18 ? 'bueno' : 'malo') }, h('span', { class: 'pct' }, '🎲 ' + Math.round(mun.chanceCeder(s, id) * 100) + '%'), h('span', { class: 'txt' }, 'por mes de que ceda y te pague')) : null,
          b ? h('span', { class: 'chico', style: { color: 'var(--mal)' } }, b) : null),
        h('span', { class: 'chip sol' }, '⭐ ' + mun.costoPC(s, id, a.id)));
      }))), { cerrable: true });
  }

  // ── Momento: orden de guerra del mes ──
  ui.momentos = ui.momentos || {};
  ui.momentos.guerra = function (s, m, listo) {
    const W = s.mundo.guerra;
    if (!W) return listo();
    const P = R.PAIS[W.pais];
    const volver = () => ui.momentos.guerra(s, m, listo);
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', { class: 'centro' }, W.objetivo === 'malvinas' ? '⚔️ Guerra por Malvinas' : W.objetivo === 'defensa' ? '🛡️ Nos atacó ' + P.nombre : '⚔️ Guerra con ' + P.nombre),
      ui.frente(s, W),
      h('div', { class: 'fila envolver', style: { gap: '6px', justifyContent: 'center' } }, h('span', { class: 'chip' }, 'Mes ' + (W.meses + 1)), chipChances(s, W)),
      ui.accionesGuerra(s, volver),
      h('div', { class: 'fila entre' }, h('b', null, '🎖️ Orden del mes'), h('span', { class: 'chico suave' }, '🎲 = retroceder')),
      h('div', { class: 'acc-guerra' }, mun.ORDENES.map((o) => h('button', { class: 'acc-g orden', onclick: () => {
        const antesFrente = W.frente;
        const antes = s.gob.aprob;
        const r = mun.orden(s, o.id);
        R.guardar(s);
        mostrarParte(s, W, antesFrente, r, antes, listo);
      } }, h('span', { class: 'ic' }, o.emoji),
        h('b', null, o.nombre),
        o.id !== 'paz' ? h('span', { class: 'chip mal' }, '🎲 ' + Math.round(mun.probRetroceso(s, o.id) * 100) + '%')
          : h('span', { class: 'chip ' + (W.frente >= 55 ? 'bien' : 'mal') }, W.frente >= 55 ? 'Te pagan' : 'Pagás'),
        o.costo.gasto ? h('span', { class: 'chip precio' }, '💸' + o.costo.gasto + '%') : null)))), { sinFoco: true });
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
