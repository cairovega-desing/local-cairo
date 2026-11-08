// Congreso: hemiciclos, bloques, leyes, cuántos votos tenés y votación banca por banca.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;
  const con = R.congreso;

  ui.PESTANAS_GOB.splice(2, 0, { id: 'congreso', emoji: '🏛️', nombre: 'Congreso' });
  ui.panelesGob.congreso = (s) => panelCongreso(s);

  const POSTURA = { si: ['✅', 'A favor', 'bien'], duda: ['🤔', 'Dudan', 'sol'], no: ['❌', 'En contra', 'mal'] };

  function panelCongreso(s) {
    const pc = ui.esPC();
    const izq = [tarjetaCamaras(s), tarjetaBloques(s)];
    const der = [tarjetaEnCamino(s), tarjetaLeyes(s)].filter(Boolean);
    if (pc) return h('div', { class: 'columnas' }, h('div', { class: 'col-izq pila' }, izq), h('div', { class: 'pila' }, der));
    return h('div', { class: 'pila' }, izq, der);
  }

  function tarjetaCamaras(s) {
    const dip = R.composicion(s, 'diputados');
    const sen = R.composicion(s, 'senado');
    const camara = (nombre, comp, total, nec) => h('div', { class: 'pila', style: { gap: '2px' } },
      h('div', { class: 'etiqueta centro' }, nombre),
      R.ui.hemiciclo(R.ui.gruposCamara(s, comp), { centro: comp.YO || 0, sub: 'tuyas de ' + total, resaltar: 'YO' }),
      h('div', { class: 'centro chico' }, (comp.YO || 0) >= nec ? '✅ Mayoría propia' : 'Mayoría: ' + nec));
    const mayoria = con.mayoria(s);
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, '🏛️ El Congreso'), mayoria ? h('span', { class: 'chip bien' }, '+1 ⭐ por mes') : null),
      h('div', { class: 'bancas-ganadas' }, camara('Diputados', dip, 257, 129), camara('Senado', sen, 72, 37)),
      h('div', { class: 'leyenda' }, R.ui.gruposCamara(s, dip).map((g) => {
        const p = R.partidoInfo(s, g.id);
        return h('span', { class: 'chip', style: { background: ui.aclarar(p.color, 0.55) } }, p.simbolo + ' ' + p.sigla + ' ' + g.n + '/' + (sen[g.id] || 0));
      })),
      h('p', { class: 'chico suave centro' }, 'Diputados / Senadores de cada bloque'));
  }

  // 🤝 Cómo te llevás con cada bloque: una fila de caritas; tocás y se abre el detalle.
  const relTxt = (r) => (r >= 60 ? ['😊', 'Aliado'] : r >= 35 ? ['😐', 'Neutral'] : ['😠', 'Opositor']);
  function tarjetaBloques(s) {
    const G = s.gob;
    const dip = R.composicion(s, 'diputados');
    const sen = R.composicion(s, 'senado');
    const bloques = con.BLOQUES.filter((b) => (dip[b] || 0) + (sen[b] || 0) > 0);
    return h('button', { class: 'tarjeta toque fila-bloques', onclick: () => verBloques(s) },
      h('span', { class: 'titulo-seccion' }, '🤝 Bloques'),
      h('span', { class: 'caritas' }, bloques.map((b) => {
        const p = R.partidoInfo(s, b);
        return h('span', { class: 'carita', title: p.sigla + ': ' + relTxt(G.rel[b])[1] }, h('b', null, p.sigla), relTxt(G.rel[b])[0]);
      })),
      h('span', { class: 'mas' }, '›'));
  }
  function verBloques(s) {
    R.son.toque();
    const G = s.gob;
    const dip = R.composicion(s, 'diputados');
    const sen = R.composicion(s, 'senado');
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, '🤝 Cómo te llevás con cada bloque'),
      h('div', { class: 'razones' }, con.BLOQUES.filter((b) => (dip[b] || 0) + (sen[b] || 0) > 0).map((b) => {
        const p = R.partidoInfo(s, b);
        const r = G.rel[b];
        const [cara, txt] = relTxt(r);
        return h('div', { class: 'razon', style: { gridTemplateColumns: '30px minmax(0,1fr) 70px 86px' } },
          ui.miniEscudo(p), h('span', null, h('b', null, p.sigla), h('span', { class: 'chico suave' }, ' ' + (dip[b] || 0) + ' + ' + (sen[b] || 0))),
          h('span', { class: 'barrita' }, h('i', { style: { width: r + '%', background: r >= 60 ? 'var(--bien)' : r >= 35 ? 'var(--sol)' : 'var(--mal)' } })),
          h('span', { class: 'chico', style: { fontWeight: 900, textAlign: 'right' } }, cara + ' ' + txt));
      })),
      h('p', { class: 'chico suave' }, 'Diputados + senadores de cada bloque. Mejora si negociás, si les gusta tu ley o si tu aprobación sube. Los gobernadores también mueven a sus legisladores.')), { cerrable: true });
  }

  // 📜 Leyes: dos botones de filtro (tema e ideas) que abren una ventanita, y filas compactas.
  // Al tocar una ley se abre arriba con todo el detalle.
  function tarjetaLeyes(s) {
    const G = s.gob;
    const v = ui.vista || {};
    const mia = R.ideaLey({ ideo: s.partido.ideo });
    const tema = v.temaLey || 'todas';
    const idea = v.ideaLey || mia; // arranca mostrando las de tu ideología
    const leyes = R.LEYES.filter((l) => (tema === 'todas' || l.cat === tema) && (idea === 'todas' || R.ideaLey(l) === idea))
      .sort((a, b) => (G.leyes[a.id] ? 1 : 0) - (G.leyes[b.id] ? 1 : 0));
    const te = R.TEMAS_LEY.find((x) => x.id === tema);
    const ia = R.IDEAS_LEY.find((x) => x.id === idea);
    return h('section', { class: 'pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, '📜 Leyes'), h('span', { class: 'chip sol' }, '⭐ ' + G.pc + ' · cada ley ⭐' + con.COSTO_PRESENTAR)),
      h('div', { class: 'filtros-ley' },
        h('button', { class: 'filtro-btn', onclick: () => elegirFiltro(s, 'temaLey') }, h('small', null, 'Tema'), h('b', null, te ? te.emoji + ' ' + te.nombre : 'Todos'), '▾'),
        h('button', { class: 'filtro-btn', onclick: () => elegirFiltro(s, 'ideaLey') }, h('small', null, 'Ideas'), h('b', null, ia ? ia.emoji + ' ' + ia.nombre : 'Todas'), '▾')),
      leyes.length ? h('div', { class: 'leyes-lista' }, leyes.map((ley) => filaLey(s, ley))) : h('p', { class: 'suave centro' }, 'No hay leyes con esos filtros.'),
      h('p', { class: 'chico suave centro' }, '⏳ = llega con el tiempo · tocá una ley para ver todo'));
  }

  function elegirFiltro(s, clave) {
    R.son.toque();
    const mia = R.ideaLey({ ideo: s.partido.ideo });
    const actual = (ui.vista || {})[clave] || (clave === 'ideaLey' ? mia : 'todas');
    const lista = clave === 'temaLey'
      ? [{ id: 'todas', emoji: '📜', nombre: 'Todos los temas' }].concat(R.TEMAS_LEY)
      : [{ id: 'todas', emoji: '🌐', nombre: 'Todas las ideas' }].concat(R.IDEAS_LEY);
    const cuantas = (id) => R.LEYES.filter((l) => id === 'todas' || (clave === 'temaLey' ? l.cat === id : R.ideaLey(l) === id)).length;
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, clave === 'temaLey' ? '📂 Tema' : '🧭 Ideas'),
      h('div', { class: 'opciones-filtro' }, lista.map((x) => h('button', {
        class: 'opcion-filtro' + (x.id === actual ? ' activa' : ''),
        onclick: () => {
          R.son.toque();
          ui.cerrarCapa();
          ui.vista = Object.assign({}, ui.vista, { [clave]: x.id, mantenerScroll: true });
          ui.render();
          ui.vista.mantenerScroll = false;
        },
      }, h('span', { class: 'em' }, x.emoji), h('b', null, x.nombre + (clave === 'ideaLey' && x.id === mia ? ' (la tuya)' : '')), h('span', { class: 'chico suave' }, cuantas(x.id)))))), { cerrable: true });
  }

  function filaLey(s, ley) {
    const G = s.gob;
    const st = G.leyesEstado[ley.id];
    const b = con.bloqueoLey(s, ley);
    const hecha = G.leyes[ley.id];
    const ef = R.gob.efectosLey(s, ley, 2);
    let estado;
    if (hecha) estado = h('span', { class: 'estado bien' }, st && st.estado === 'dnu' ? '📜' : '✅');
    else if (b) estado = h('span', { class: 'estado' }, '🔒');
    else {
      const p = con.porotos(s, ley);
      const falta = Math.max(p.diputados.necesarios - p.diputados.si, p.senado.necesarios - p.senado.si);
      estado = h('span', { class: 'estado ' + (falta <= 0 ? 'bien' : 'falta'), title: falta <= 0 ? 'Te alcanzan los votos' : 'Te faltan ' + falta + ' votos' }, falta <= 0 ? '🗳️✓' : '🗳️−' + falta);
    }
    const ia = R.IDEAS_LEY.find((x) => x.id === R.ideaLey(ley));
    return h('button', { class: 'ley-fila' + (hecha ? ' hecha' : ''), disabled: b ? true : null, title: b || null, onclick: () => abrirLey(s, ley) },
      h('span', { class: 'ic idea-' + ia.id }, ley.emoji),
      h('span', { class: 'cuerpo' }, h('b', null, ley.nombre),
        h('span', { class: 'mini-efectos' }, ui.chipsEfectos(ef.ya, { compacto: true }), ef.luego.length ? h('span', { class: 'luego' }, '⏳') : null, ef.luego.length ? ui.chipsEfectos(ef.luego, { compacto: true }) : null)),
      estado);
  }

  // Leyes (mejor de la misma ideología) que dejan plata en las cuentas: para tapar el agujero de otra.
  function compensan(s, ley) {
    const G = s.gob;
    return R.LEYES.filter((l) => l.id !== ley.id && !G.leyes[l.id] && !con.bloqueoLey(s, l))
      .map((l) => ({ l, c: R.gob.fiscalLey(s, l), misma: R.ideaLey(l) === R.ideaLey(ley) }))
      .filter((x) => x.c > 0.2)
      .sort((a, b) => (b.misma - a.misma) || (b.c - a.c))
      .slice(0, 2).map((x) => x.l);
  }

  // Qué hace la ley: al firmar y con el tiempo, solo lo que toca directo.
  function queHaceLey(s, ley) {
    const ef = R.gob.efectosLey(s, ley, 4);
    const fiscal = R.gob.fiscalLey(s, ley);
    const comp = fiscal < -0.15 ? compensan(s, ley) : [];
    return h('div', { class: 'pila', style: { gap: '8px' } },
      h('div', { class: 'plazos' },
        ef.ya.length ? h('div', { class: 'plazo' }, h('span', { class: 'cuando' }, '⚡ Al firmar'), ui.chipsEfectos(ef.ya)) : null,
        ef.luego.length ? h('div', { class: 'plazo' }, h('span', { class: 'cuando' }, '⏳ Con el tiempo'), ui.chipsEfectos(ef.luego)) : null),
      fiscal < -0.15 ? h('div', { class: 'chico nota-proy mal' }, '💸 Te deja menos plata en las cuentas: si no recortás otra cosa, se paga emitiendo (inflación) o con deuda.',
        comp.length ? h('div', { style: { marginTop: '4px' } }, '🧩 Combinala con: ', comp.map((x, i) => h('b', null, (i ? ' · ' : '') + x.emoji + ' ' + x.nombre))) : null) : null,
      fiscal > 0.15 ? h('div', { class: 'chico nota-proy bien' }, '💰 Te deja más plata en las cuentas: podés gastarla en otra cosa sin déficit.') : null);
  }

  // ⏳ Leyes que todavía no dieron todo: una línea por ley con su barra.
  function tarjetaEnCamino(s) {
    const G = s.gob;
    const porLey = {};
    for (const m of G.madurando || []) if (R.LEY[m.ley]) porLey[m.ley] = Math.max(porLey[m.ley] || 0, R.eco.madurez(s, m));
    const ids = Object.keys(porLey);
    if (!ids.length) return null;
    return h('section', { class: 'tarjeta pila', style: { gap: '6px' } },
      h('div', { class: 'titulo-seccion' }, '⏳ Tus leyes, llegando'),
      ids.map((id) => h('button', { class: 'en-camino toque', onclick: () => abrirLey(s, R.LEY[id]) },
        h('span', { class: 'nom' }, R.LEY[id].emoji + ' ' + R.LEY[id].nombre),
        h('span', { class: 'barrita' }, h('i', { style: { width: Math.max(4, porLey[id] * 100) + '%', background: 'var(--celeste)' } })),
        h('b', { class: 'chico' }, Math.round(porLey[id] * 100) + '%'))));
  }

  // Hoja de una ley: porotos, negociación y votación.
  function abrirLey(s, ley) {
    R.son.toque();
    const G = s.gob;
    const p = con.porotos(s, ley);
    const camara = (nombre, c) => {
      const falta = c.necesarios - c.si;
      return h('div', { class: 'pila', style: { gap: '6px' } },
        h('div', { class: 'fila entre' }, h('b', null, nombre), h('span', { class: 'chip ' + (falta <= 0 ? 'bien' : 'mal') }, falta <= 0 ? '✅ Te alcanza' : 'Te faltan ' + falta)),
        h('div', { class: 'porotos' },
          h('div', { class: 'barra gorda' }, h('i', { style: { width: (c.si / c.total) * 100 + '%', background: falta <= 0 ? 'var(--bien)' : 'var(--sol)' } })),
          h('b', { class: 'linea-necesaria', style: { left: (c.necesarios / c.total) * 100 + '%' }, title: 'Votos necesarios' })),
        h('div', { class: 'chico suave' }, '~' + c.si + ' a favor de ' + c.total + ' · necesitás ' + c.necesarios));
    };
    const bloques = {};
    for (const cam of ['diputados', 'senado']) for (const b of p[cam].bloques) bloques[b.id] = bloques[b.id] || b;
    const ia = R.IDEAS_LEY.find((x) => x.id === R.ideaLey(ley));
    const te = R.TEMAS_LEY.find((x) => x.id === ley.cat);
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, ley.emoji + ' ' + ley.nombre),
      h('p', null, ley.desc + (ley.nota ? ' · ' + ley.nota : '')),
      h('div', { class: 'fila envolver', style: { gap: '6px' } }, h('span', { class: 'chip idea-' + ia.id }, ia.emoji + ' ' + ia.nombre), te ? h('span', { class: 'chip' }, te.emoji + ' ' + te.nombre) : null),
      queHaceLey(s, ley),
      h('div', { class: 'tarjeta plana suave pila' }, h('div', { class: 'titulo-seccion' }, '🗳️ ¿Te alcanzan los votos?'), camara('Diputados', p.diputados), camara('Senado', p.senado)),
      h('div', { class: 'etiqueta' }, 'Bloques'),
      h('div', { class: 'lista-elegir' }, Object.values(bloques).filter((b) => b.id !== 'YO').map((b) => {
        const info = R.partidoInfo(s, b.id);
        const [em, txt, cls] = POSTURA[b.postura];
        const costo = con.costoNegociar(s, b.id);
        // Por qué vota así (lo que más pesa): «💡 Le gusta la idea · 😠 Está peleado con vos».
        const m = con.motivos(s, ley, b.id);
        const minuscula = (x) => x.replace(/ (\p{Lu})/u, (_, c) => ' ' + c.toLowerCase());
        const pero = m.pro && m.contra ? m.pro + ', pero ' + minuscula(m.contra) : null;
        // A favor: lo que los convence. Dudan: las dos cosas. En contra: lo que los frena
        // (y si la idea les gusta pero igual votan en contra, también se dice).
        const motivo = b.postura === 'si' ? m.pro : b.postura === 'duda' ? pero || m.contra || m.pro : m.proK === 'idea' && pero ? pero : m.contra;
        return h('div', { class: 'item-elegir', style: { cursor: 'default', gridTemplateColumns: '34px minmax(0,1fr) auto' } },
          ui.miniEscudo(info),
          h('div', { style: { minWidth: 0 } }, h('b', null, info.sigla), ' ', h('span', { class: 'chip ' + cls }, em + ' ' + txt),
            motivo ? h('div', { class: 'chico suave motivo-voto' }, motivo) : null),
          b.postura === 'si' ? h('span', { class: 'chico suave' }, Math.round(b.p * 100) + '%')
            : h('button', { class: 'boton mini sec', disabled: G.pc < costo ? true : null, onclick: () => {
              const r = con.negociar(s, ley, b.id);
              if (r.error) { ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); return; }
              R.son.moneda(); R.guardar(s); ui.aviso('🤝 Negociaste con ' + info.sigla + ' (⭐ −' + r.costo + ')', { tipo: 'bien', dur: 1600 }); abrirLey(s, ley);
            } }, '🤝 ⭐' + costo));
      })),
      h('button', { class: 'boton sec ancho', onclick: () => { con.fondosGobernadores(s, ley); R.son.moneda(); R.guardar(s); ui.aviso('💸 Fondos a las provincias: los gobernadores empujan', { tipo: 'bien', dur: 1600 }); abrirLey(s, ley); } }, '💸 Fondos a las provincias · 1,5% del presupuesto'),
      h('div', { class: 'fila' },
        h('button', { class: 'boton grande', style: { flex: '1.3 1 0' }, disabled: G.pc < con.COSTO_PRESENTAR ? true : null, onclick: () => votar(s, ley) }, '🗳️ Votar · ⭐' + con.COSTO_PRESENTAR),
        ley.dnu ? h('button', { class: 'boton sec', style: { flex: '1 1 0' }, disabled: G.pc < con.COSTO_DNU ? true : null, title: 'Sin pasar por el Congreso, pero a la clase media no le gusta', onclick: () => decreto(s, ley) }, '📜 Decreto · ⭐' + con.COSTO_DNU) : null),
      G.pc < con.COSTO_PRESENTAR ? h('p', { class: 'chico', style: { color: 'var(--mal)' } }, 'No tenés ⭐ suficientes: pasá el mes para juntar más.') : null), { cerrable: true });
  }

  function decreto(s, ley) {
    const antes = s.gob.aprob;
    const r = con.dnu(s, ley);
    if (r.error) { ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); return; }
    ui.cerrarCapa();
    ui.mostrarResultado(s, { txt: '📜 Firmaste el decreto: ' + ley.nombre, bueno: true, aplicado: r.aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob });
  }

  // Votación animada: los puntitos se ponen verdes o rojos uno por uno.
  function votar(s, ley) {
    const antes = s.gob.aprob;
    const res = con.votar(s, ley);
    R.guardar(s);
    ui.animarVotacion(s, ley.emoji + ' ' + ley.nombre, res, () => {
      if (res.aprobada) ui.mostrarResultado(s, { txt: '✅ ¡Es ley! ' + ley.nombre, bueno: true, aplicado: res.aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob });
      else ui.mostrarResultado(s, { txt: '❌ Rechazada: ' + ley.nombre, bueno: false, aplicado: res.aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob });
    });
  }

  ui.animarVotacion = function (s, titulo, res, alTerminar, opts) {
    opts = opts || {};
    const cont = h('div', { class: 'pila' });
    const camaras = Object.keys(res.camaras);
    let i = 0;
    const lentos = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const siguiente = () => {
      if (i >= camaras.length) return final();
      const nombre = camaras[i++];
      const c = res.camaras[nombre];
      const comp = R.composicion(s, nombre);
      const grupos = R.ui.gruposCamara(s, comp);
      const svg = R.ui.hemiciclo(grupos, {});
      const siPor = {};
      for (const v of c.votos) if (v.si) siPor[v.id] = (siPor[v.id] || 0) + 1;
      const cuenta = h('div', { class: 'conteo' + (opts.invertir ? ' invertido' : '') }, h('span', { class: 'si' }, '✅ 0'), h('span', { class: 'no' }, '❌ 0'));
      cont.appendChild(h('div', { class: 'tarjeta plana pila', style: { gap: '4px' } }, h('div', { class: 'etiqueta centro' }, nombre === 'diputados' ? 'Diputados' : 'Senado'), svg, cuenta,
        h('div', { class: 'centro chico suave' }, 'Necesita ' + c.necesarios)));
      const puntos = Array.from(svg.querySelectorAll('circle'));
      const usados = {};
      let si = 0;
      let no = 0;
      let k = 0;
      const porPaso = Math.max(1, Math.ceil(puntos.length / (lentos ? 45 : 1)));
      const paso = () => {
        for (let n = 0; n < porPaso && k < puntos.length; n++, k++) {
          const dot = puntos[k];
          const g = dot.getAttribute('data-g');
          usados[g] = (usados[g] || 0) + 1;
          const vota = usados[g] <= (siPor[g] || 0);
          dot.setAttribute('fill', (vota !== !!opts.invertir) ? '#1c9a50' : '#d5383a');
          if (vota) si++; else no++;
        }
        cuenta.children[0].textContent = (opts.invertir ? '🔨 ' : '✅ ') + si;
        cuenta.children[1].textContent = (opts.invertir ? '🛡️ ' : '❌ ') + no;
        R.son.tic();
        if (k < puntos.length) setTimeout(paso, 40);
        else {
          const bien = opts.invertir ? !c.pasa : c.pasa;
          cont.appendChild(h('div', { class: 'veredicto ' + (bien ? 'gana' : 'pierde'), style: { fontSize: '24px', color: bien ? 'var(--bien)' : 'var(--mal)' } },
            (c.pasa ? 'Aprobado en ' : 'Rechazado en ') + (nombre === 'diputados' ? 'Diputados' : 'el Senado')));
          setTimeout(siguiente, lentos ? 700 : 0);
        }
      };
      paso();
    };
    const final = () => {
      const ok = opts.invertir ? !res.aprobada : res.aprobada;
      if (ok) { R.son.aplausos(); ui.confeti(['#1c9a50', '#ffffff', '#f6b40e']); } else R.son.abucheo();
      cont.appendChild(h('button', { class: 'boton grande ancho', autofocus: true, onclick: () => { ui.cerrarCapa(); alTerminar(); } }, ok ? '🎉 ¡Seguir!' : 'Seguir'));
      const b = cont.querySelector('.boton');
      if (b) b.focus({ preventScroll: true });
    };
    ui.abrirCapa(h('div', { class: 'pila' }, h('h2', { class: 'centro' }, '🗳️ ' + titulo), cont), { sinFoco: true });
    siguiente();
  };

  // ── Momentos: presupuesto anual y decreto que se cae ──
  ui.momentos = ui.momentos || {};
  ui.momentos.presupuesto = function (s, m, listo) {
    const ley = con.leyPresupuesto(s);
    const p = con.porotos(s, ley);
    const def = -R.eco.resultado(s);
    const votarYa = (conFondos) => {
      const antes = s.gob.aprob;
      const v = con.votarPresupuesto(s, conFondos);
      R.guardar(s);
      ui.animarVotacion(s, ley.nombre, v.res, () => {
        ui.mostrarResultado(s, { txt: v.ok ? '📒 Presupuesto aprobado: los mercados se calman' : '📒 Presupuesto rechazado: gobernás con el del año pasado', bueno: v.ok, aplicado: v.aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob });
        listo();
      });
    };
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, '📒 ' + ley.nombre),
      h('p', null, 'Cada noviembre el Congreso vota tu presupuesto. ' + (def > 1 ? 'Con mucho déficit cuesta más que lo aprueben.' : 'Con las cuentas ordenadas es más fácil.')),
      h('div', { class: 'tarjeta plana suave pila' },
        h('div', { class: 'fila entre' }, h('b', null, 'Diputados'), h('span', { class: 'chip ' + (p.diputados.si >= p.diputados.necesarios ? 'bien' : 'mal') }, '~' + p.diputados.si + ' de ' + p.diputados.necesarios)),
        h('div', { class: 'fila entre' }, h('b', null, 'Senado'), h('span', { class: 'chip ' + (p.senado.si >= p.senado.necesarios ? 'bien' : 'mal') }, '~' + p.senado.si + ' de ' + p.senado.necesarios))),
      h('div', { class: 'fila envolver chico' }, h('span', null, 'Si se aprueba:'), ui.chipsEfectos(R.gob.describirEfectos(s, con.EF_PRESUPUESTO.si), { compacto: true })),
      h('div', { class: 'fila envolver chico' }, h('span', null, 'Si se rechaza:'), ui.chipsEfectos(R.gob.describirEfectos(s, con.EF_PRESUPUESTO.no), { compacto: true })),
      h('button', { class: 'boton grande ancho', onclick: () => votarYa(false) }, '🗳️ Que voten'),
      h('button', { class: 'boton sec ancho', onclick: () => votarYa(true) }, '💸 Repartir fondos a provincias y votar (1,5%)')));
  };

  ui.momentos.juicio = function (s, m, listo) {
    const pintar = () => {
      const p = con.prediccionJuicio(s);
      const cam = (nombre, c) => h('div', { class: 'fila entre' }, h('b', null, nombre),
        h('span', { class: 'chip ' + (c.si >= c.necesarios ? 'mal' : 'bien') }, '🔨 ~' + c.si + ' de ' + c.necesarios + ' para destituirte'));
      ui.abrirCapa(h('div', { class: 'pila' },
        h('div', { class: 'dibujo-noticia' }, '⚖️ 🏛️ 🔨'),
        h('h2', { class: 'titular' }, '¡La oposición pide tu juicio político!'),
        h('p', { class: 'bajada' }, 'Por los escándalos. Necesitan 2/3 en las dos cámaras.'),
        h('div', { class: 'tarjeta plana suave pila' }, cam('Diputados', p.diputados), cam('Senado', p.senado)),
        h('button', { class: 'boton sec ancho', disabled: s.gob.juicioFondos ? true : null, onclick: () => { s.gob.juicioFondos = 1; R.gob.aplicarEfectos(s, { gastoExtra: 3 }); for (const pr of R.PROVINCIAS) s.gob.gobernadores[pr.id].rel = R.clamp(s.gob.gobernadores[pr.id].rel + 8, 0, 100); R.son.moneda(); pintar(); } }, '💸 Fondos a gobernadores · 3% del presupuesto'),
        h('button', { class: 'boton grande ancho', onclick: () => {
          const res = con.votarJuicio(s);
          R.guardar(s);
          ui.animarVotacion(s, 'Juicio político', res, () => {
            if (res.aprobada) {
              const mom = [];
              R.gob.terminar(s, mom, 'juicio');
              R.guardar(s);
              listo();
            } else {
              ui.mostrarResultado(s, { txt: '🛡️ ¡Sobreviviste al juicio político!', bueno: true, aplicado: res.aplicado, aprobAntes: s.gob.aprob, aprobDespues: s.gob.aprob });
              listo();
            }
          }, { invertir: true });
        } }, '🗳️ Que voten')));
    };
    pintar();
  };

  ui.momentos.dnu_cae = function (s, m, listo) {
    const ley = R.LEY[m.ley];
    const aplicado = R.gob.aplicarEfectos(s, con.efDnuCae);
    R.diario(s, '⚖️', 'La Justicia cuestiona tu decreto: ' + ley.nombre, 'ley');
    ui.abrirCapa(h('div', { class: 'resultado-grande' },
      h('div', { class: 'em' }, '⚖️'),
      h('div', { class: 'txt' }, 'La oposición y los jueces cuestionan tu decreto de ' + ley.nombre.toLowerCase()),
      ui.chipsEfectos(R.describirAplicado(s, aplicado)),
      h('p', { class: 'chico suave' }, 'El decreto sigue vigente, pero te costó caro.'),
      h('button', { class: 'boton grande ancho', onclick: () => { ui.cerrarCapa(); listo(); } }, 'Seguir ▶')));
  };
})(globalThis.R = globalThis.R || {});
