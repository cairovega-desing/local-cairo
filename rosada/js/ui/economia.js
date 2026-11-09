// Panel de economía: la balanza del presupuesto, impuestos, cómo pagás el déficit y el gasto por área en %.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;

  ui.panelEconomia = function (s) {
    const pc = ui.esPC();
    const prod = ui.tarjetaProduccion ? ui.tarjetaProduccion(s) : null;
    const izq = [tarjetaBalanza(s), tarjetaIngresos(s), tarjetaMedidas(s)];
    const der = [prod, tarjetaPresupuesto(s)];
    if (pc) return h('div', { class: 'columnas' }, h('div', { class: 'col-izq pila' }, izq), h('div', { class: 'pila' }, der));
    return h('div', { class: 'pila' }, prod, izq[0], der[1], izq[1], izq[2]);
  };

  // ⚖️ Lo que entra vs lo que sale.
  function tarjetaBalanza(s) {
    const e = s.eco;
    const rec = R.eco.recaudacion(s);
    const gp = R.eco.gastoPrimario(e);
    const int = R.eco.intereses(e);
    const tot = gp + int;
    const res = rec - tot;
    const max = Math.max(rec, tot) * 1.05;
    const extra = e.gastoExtraAnio;
    const inclina = R.clamp(-res * 4, -14, 14);
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, '⚖️ Presupuesto del año'), h('span', { class: 'chip ' + (res >= 0 ? 'bien' : 'mal'), style: { fontSize: '15px' } }, (res >= 0 ? '✅ Superávit ' : '⚠️ Déficit ') + R.fmt(Math.abs(res), 1) + '%')),
      h('div', { class: 'balanza', 'aria-hidden': 'true' },
        h('div', { class: 'brazo', style: { transform: 'rotate(' + inclina + 'deg)' } },
          h('span', { class: 'plato' }, '💰'), h('span', { class: 'plato' }, '💸')),
        h('div', { class: 'pie' })),
      h('div', { class: 'pila', style: { gap: '6px' } },
        h('div', { class: 'linea-balanza' }, h('span', null, '💰 Recaudás'), h('div', { class: 'barra gorda' }, h('i', { style: { width: (rec / max) * 100 + '%', background: 'var(--bien)' } })), h('b', { class: 'numero' }, R.fmt(rec, 1) + '%')),
        h('div', { class: 'linea-balanza' }, h('span', null, '💸 Gastás'), h('div', { class: 'barra gorda' }, h('i', { style: { width: (tot / max) * 100 + '%', background: res >= 0 ? 'var(--celeste)' : 'var(--mal)' } })), h('b', { class: 'numero' }, R.fmt(tot, 1) + '%'))),
      h('p', { class: 'chico suave' }, 'En % del PBI. Incluye ' + R.fmt(int, 1) + '% de intereses.'),
      extra > 0.05 ? h('p', { class: 'chico' }, '🧾 Gastos extra del año: ' + R.fmt(extra, 2) + '% del PBI') : null,
      res < 0 ? tarjetaFinanciamiento(s) : null);
  }

  function tarjetaFinanciamiento(s) {
    const e = s.eco;
    const dolarizado = s.gob.leyes && s.gob.leyes.dolarizacion;
    return h('div', { class: 'pila', style: { gap: '6px' } },
      h('div', { class: 'etiqueta' }, '¿Cómo pagás el déficit?'),
      h('div', { class: 'selector' }, R.eco.FINANCIAMIENTO.map((f, i) =>
        h('button', { class: 'opcion' + (e.financiamiento === i ? ' elegida' : ''), disabled: dolarizado && i < 2 ? true : null, onclick: () => { e.financiamiento = i; R.son.toque(); R.guardar(s); ui.refrescar(); } },
          h('span', { class: 'em' }, f.emoji), h('b', null, f.nombre), h('span', { class: 'chico' }, f.desc)))),
      e.financiamiento < 2 ? h('p', { class: 'chico', style: { color: 'var(--mal)' } }, '🖨️ Emitir sube los precios.') : h('p', { class: 'chico suave' }, '🏦 Pedir prestado sube la deuda.'));
  }

  // 🧾 Impuestos y retenciones.
  function tarjetaIngresos(s) {
    const e = s.eco;
    const perilla = (titulo, emoji, valor, niveles, set, efMas, efMenos, nota) => {
      const n = niveles.length;
      return h('div', { class: 'perilla' },
        h('div', { class: 'fila entre' }, h('b', null, emoji + ' ' + titulo), h('span', { class: 'chip sol' }, niveles[valor].nombre)),
        h('div', { class: 'puntos-nivel' }, niveles.map((_, i) => h('i', { class: i <= valor ? 'lleno' : '' }))),
        h('div', { class: 'fila', style: { gap: '8px' } },
          h('button', { class: 'boton mini sec', disabled: valor <= 0 ? true : null, 'aria-label': 'Bajar ' + titulo, onclick: () => { set(valor - 1); } }, '− Bajar'),
          h('button', { class: 'boton mini sec', disabled: valor >= n - 1 ? true : null, 'aria-label': 'Subir ' + titulo, onclick: () => { set(valor + 1); } }, '+ Subir')),
        h('div', { class: 'fila envolver chico', style: { gap: '6px' } },
          h('span', { class: 'suave' }, 'Si bajás:'), ui.chipsEfectos(efMenos)),
        h('div', { class: 'fila envolver chico', style: { gap: '6px' } },
          h('span', { class: 'suave' }, 'Si subís:'), ui.chipsEfectos(efMas)),
        nota ? h('p', { class: 'chico suave' }, nota) : null);
    };
    const D = (ef) => R.gob.describirEfectos(s, ef);
    const cambio = (k, v) => { e[k] = v; R.son.toque(); R.guardar(s); ui.aviso('🧾 ' + (k === 'impuestos' ? 'Impuestos: ' + R.eco.IMPUESTOS[v].nombre : 'Retenciones: ' + R.eco.RETENCIONES[v].nombre) + ' · la gente reacciona a fin de mes', { dur: 1800 }); ui.refrescar(); };
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'titulo-seccion' }, '🧾 Lo que cobrás'),
      perilla('Impuestos', '🧾', e.impuestos, R.eco.IMPUESTOS, (v) => cambio('impuestos', v),
        D({ empresarios: -7, media: -5, crec: -0.7 }), D({ empresarios: 4, media: 3, crec: 0.7 })),
      perilla('Retenciones al campo', '🌾', e.retenciones, R.eco.RETENCIONES, (v) => cambio('retenciones', v),
        D({ campo: -9, expo: -0.06 }), D({ campo: 6, expo: 0.06 })));
  }

  // 💸 Gasto por área en % del presupuesto.
  function tarjetaPresupuesto(s) {
    const e = s.eco;
    const gp = R.eco.gastoPrimario(e);
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, '💸 ¿En qué gastás?'), h('span', { class: 'chico suave' }, 'Total ' + R.fmt(gp, 1) + '% del PBI')),
      h('div', { class: 'torta-barra', 'aria-hidden': 'true' }, R.AREAS.map((a) => h('i', { style: { width: R.eco.participacion(e, a.id) + '%' }, title: a.nombre }, R.eco.participacion(e, a.id) > 7 ? a.emoji : ''))),
      lineaTorta(s),
      h('div', { class: 'areas' }, R.AREAS.map((a) => filaArea(s, a))));
  }

  // 🍰 El gasto está en % del PBI: si la torta crece, el mismo % es más plata de verdad.
  function lineaTorta(s) {
    const t = R.eco.torta(s);
    const d = (t - 1) * 100;
    const txt = Math.abs(d) < 0.5
      ? 'Si la economía crece, el mismo % es más plata de verdad (y si cae, menos).'
      : 'La torta ' + (d > 0 ? 'creció ' : 'se achicó ') + R.fmt(Math.abs(d), 1) + '% por habitante desde que asumiste: el mismo % alcanza para ' + (d > 0 ? 'más.' : 'menos.');
    return h('div', { class: 'tarjeta plana suave chico fila', style: { gap: '8px', alignItems: 'center', background: d >= 0.5 ? 'var(--bien-claro)' : d <= -0.5 ? 'var(--mal-claro)' : null } },
      h('span', { style: { fontSize: '24px' } }, '🍰'), h('span', { style: { fontWeight: 800 } }, txt));
  }

  // Plata de verdad que recibe un área comparada con cuando asumiste (nivel × torta).
  function plataReal(s, nivel) {
    const t = R.eco.torta(s);
    if (Math.abs(t - 1) < 0.005) return null;
    const d = (nivel * t - 1) * 100;
    return h('div', { class: 'chico', style: { fontWeight: 900, color: d >= 0.5 ? 'var(--bien)' : d <= -0.5 ? 'var(--mal)' : 'var(--tinta-suave)' } },
      '💰 ' + (Math.abs(d) < 0.5 ? 'Misma plata real que al asumir' : (d > 0 ? '+' : '−') + R.fmt(Math.abs(d), 0) + '% de plata real'));
  }

  function filaArea(s, a) {
    const e = s.eco;
    const nivel = e.niveles[a.id];
    const inicio = e.nivelesInicioMes[a.id];
    const part = R.eco.participacion(e, a.id);
    const costoPaso = a.base * 0.1;
    const cambiar = (d) => {
      const nuevo = R.round(R.clamp(nivel + d, R.eco.NIVEL_MIN, R.eco.NIVEL_MAX), 2);
      if (nuevo === nivel) return;
      const resAntes = R.eco.resultado(s);
      e.niveles[a.id] = nuevo;
      const resDespues = R.eco.resultado(s);
      R.son.toque();
      R.guardar(s);
      ui.aviso(a.emoji + ' ' + a.nombre + ': ' + (d > 0 ? 'más plata' : 'menos plata'), {
        tipo: d > 0 ? 'bien' : 'mal', dur: 2000,
        efectos: a.gana.map(([em, nom, f]) => ({ emoji: em, nombre: nom, sube: (f > 0) === (d > 0), bueno: (f > 0) === (d > 0) !== (nom === 'Pobreza'), flechas: Math.min(3, Math.abs(f)) })),
        extra: h('div', { class: 'chico', style: { fontWeight: 900 } }, '⚖️ ' + (resDespues >= 0 ? 'Superávit ' : 'Déficit ') + R.fmt(Math.abs(resAntes), 2) + '% → ',
          h('span', { style: { color: resDespues >= resAntes ? 'var(--bien)' : 'var(--mal)' } }, R.fmt(Math.abs(resDespues), 2) + '%')),
      });
      ui.refrescar();
    };
    const pend = Math.abs(nivel - inicio) >= 0.01;
    const cal = a.calidad ? e.calidad[a.calidad] : null;
    return h('div', { class: 'area' + (pend ? ' cambiada' : '') },
      h('div', { class: 'area-cab' },
        h('span', { class: 'em' }, a.emoji),
        h('div', { style: { minWidth: 0 } }, h('b', null, a.nombre), h('div', { class: 'chico suave' }, R.eco.nivelTxt(nivel) + (cal !== null ? ' · calidad ' + Math.round(cal) + '/100' : '')),
          plataReal(s, nivel)),
        h('div', { class: 'pct numero' }, R.fmt(part, 1) + '%', h('small', null, 'del gasto'))),
      h('div', { class: 'area-control' },
        h('button', { class: 'boton mini sec', disabled: nivel <= R.eco.NIVEL_MIN ? true : null, 'aria-label': 'Menos plata para ' + a.nombre, onclick: () => cambiar(-0.1) }, '−'),
        h('div', { class: 'nivel' },
          h('div', { class: 'barra' }, h('i', { style: { width: ((nivel - R.eco.NIVEL_MIN) / (R.eco.NIVEL_MAX - R.eco.NIVEL_MIN)) * 100 + '%', background: nivel > 1.02 ? 'var(--bien)' : nivel < 0.98 ? 'var(--mal)' : 'var(--celeste)' } }),
            h('b', { class: 'marca-hoy', style: { left: ((1 - R.eco.NIVEL_MIN) / (R.eco.NIVEL_MAX - R.eco.NIVEL_MIN)) * 100 + '%' }, title: 'Como estaba al asumir' }))),
        h('button', { class: 'boton mini sec', disabled: nivel >= R.eco.NIVEL_MAX ? true : null, 'aria-label': 'Más plata para ' + a.nombre, onclick: () => cambiar(0.1) }, '+')),
      h('div', { class: 'fila envolver', style: { gap: '6px' } },
        h('span', { class: 'chico suave' }, '+10 %:'),
        ui.chipsEfectos(a.gana.map(([em, nom, f]) => ({ emoji: em, nombre: nom, sube: f > 0, bueno: (f > 0) !== (nom === 'Pobreza'), flechas: Math.abs(f) }))),
        h('span', { class: 'chip mal' }, '💸 ' + R.fmt(costoPaso, 2) + '% PBI')),
      pend ? h('div', { class: 'chico', style: { color: 'var(--sol-osc)', fontWeight: 900 } }, '⏳ Cambiado este mes') : null);
  }

  // 💥 Medidas fuertes.
  function tarjetaMedidas(s) {
    let confirmar = null;
    const caja = h('section', { class: 'tarjeta pila' });
    const pintar = () => {
      caja.replaceChildren(
        h('div', { class: 'titulo-seccion' }, '💥 Medidas fuertes'),
        h('div', { class: 'lista-elegir' }, R.gob.MEDIDAS.filter((m) => !m.si || m.si(s)).map((m) => {
          const b = R.gob.bloqueoMedida(s, m);
          const ef = R.gob.describirEfectos(s, R.gob.efectoMedida(s, m));
          if (confirmar === m.id) {
            return h('div', { class: 'item-elegir', style: { gridTemplateColumns: '1fr', background: 'var(--sol-claro)' } },
              h('b', null, '¿Seguro? ' + m.emoji + ' ' + m.nombre),
              ui.chipsEfectos(ef, { compacto: true }),
              h('div', { class: 'fila' },
                h('button', { class: 'boton mini rojo', onclick: () => { const res = R.gob.medida(s, m.id); if (res.error) { ui.aviso('🚫 ' + res.error, { tipo: 'mal' }); return; } ui.mostrarResultado(s, res); } }, '¡Sí, hacerlo!'),
                h('button', { class: 'boton mini sec', onclick: () => { confirmar = null; pintar(); } }, 'Mejor no')));
          }
          return h('button', { class: 'item-elegir', disabled: b ? true : null, onclick: () => { confirmar = m.id; R.son.toque(); pintar(); } },
            h('span', { class: 'ic' }, m.emoji),
            h('div', { class: 'pila', style: { gap: '4px', minWidth: 0 } }, h('b', null, m.nombre), ui.chipsEfectos(ef, { compacto: true }), b ? h('span', { class: 'bloq chico', style: { color: 'var(--mal)' } }, b) : null),
            h('span', { class: 'chip' }, 'gratis'));
        })));
    };
    pintar();
    return caja;
  }
})(globalThis.R = globalThis.R || {});
