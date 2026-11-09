// Interfaz de la producción: tarjeta «🏭 Producción» (4 sectores), hoja de cada sector (construir, inversión privada),
// precios del mundo, aviso de crisis o bonanza y las novedades del mes.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;
  ui.momentos = ui.momentos || {};

  const pct = (v) => (v >= 0 ? '+' : '−') + Math.round(Math.abs(v) * 100) + '%';
  // Chip de precio del mundo de un producto (vs. lo normal) con flechita de cómo se movió este mes.
  function chipPrecio(s, k, conNombre) {
    const P = R.PRODUCTOS[k];
    const p = R.prod.precio(s, k);
    const antes = s.mundo && s.mundo.preciosAntes ? s.mundo.preciosAntes[k] : p;
    const flecha = p - antes > 0.01 ? ' ▲' : p - antes < -0.01 ? ' ▼' : '';
    const clase = p >= 1.05 ? 'bien' : p <= 0.95 ? 'mal' : '';
    return h('span', { class: 'chip ' + clase }, P.emoji + (conNombre ? ' ' + P.nombre : '') + ' ' + (Math.abs(p - 1) < 0.02 ? 'normal' : pct(p - 1)) + flecha);
  }
  ui.chipPrecio = chipPrecio;

  function chipEnergia(s) {
    const en = R.prod.energia(s);
    if (en.saldo < -0.15) return h('span', { class: 'chip mal' }, '⚡ Falta energía');
    if (en.saldo > 0.15) return h('span', { class: 'chip bien' }, '⚡ Sobra energía');
    return h('span', { class: 'chip' }, '⚡ Energía justa');
  }

  // ── Tarjeta de la pestaña Economía ──
  ui.tarjetaProduccion = function (s) {
    R.prod.asegurar(s);
    const P = s.prod;
    const C = s.mundo && s.mundo.ciclos;
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, '🏭 Producción'), chipEnergia(s)),
      h('div', { class: 'sectores' }, R.SECTORES.map((x) => {
        const st = P.sec[x.id];
        const obra = P.obras.find((o) => o.id === x.id);
        const a = R.prod.atractivo(s, x.id);
        return h('button', { class: 'sector-carta toque', onclick: () => verSector(s, x.id) },
          h('div', { class: 'fila', style: { gap: '6px' } }, h('span', { class: 'em' }, x.emoji), h('b', { class: 'nom' }, x.nombre)),
          h('div', { class: 'fila', style: { gap: '6px' } },
            h('span', { class: 'barra', style: { height: '8px', flex: 1 } }, h('i', { style: { width: (st.nivel / R.NIVEL_MAX_SECTOR) * 100 + '%', background: 'var(--celeste-fuerte, #3d8fd6)' } })),
            h('span', { class: 'nivel numero' }, st.nivel)),
          h('div', { class: 'fila envolver', style: { gap: '4px' } },
            chipPrecio(s, x.producto),
            obra ? h('span', { class: 'chip sol' }, '🔨 ' + obra.meses + ' m') : h('span', { class: 'chip ' + (a.chance >= 0.05 ? 'bien' : a.chance < 0.02 ? 'mal' : ''), title: 'Chance de inversión privada por mes' }, '🏦 ' + Math.round(a.chance * 100) + '%/mes')));
      })),
      h('div', { class: 'fila envolver', style: { gap: '6px' } },
        h('button', { class: 'chip toque ' + (P.obras.length >= R.prod.cuadrillas(s) ? 'sol' : ''), onclick: () => verCuadrillas(s) }, '🏗️ Cuadrillas ' + P.obras.length + '/' + R.prod.cuadrillas(s) + ' ›'),
        s.mundo ? h('button', { class: 'chip toque', onclick: () => verPrecios(s) }, '🌍 Precios del mundo ›') : null),
      C && C.proximo ? bannerProximo(s) : null);
  };

  function bannerProximo(s) {
    const C = s.mundo.ciclos;
    const X = R.prod.CICLO[C.proximo.id];
    return h('button', { class: 'banner-aviso ' + (X.bueno ? 'bueno' : 'malo'), onclick: () => verPrecios(s) },
      h('span', { class: 'em' }, '📡'), h('span', null, h('b', null, 'Se viene: ' + X.emoji + ' ' + X.nombre), h('small', null, C.proximo.en <= 1 ? 'el mes que viene' : 'en ' + C.proximo.en + ' meses')),
      C.proximo.prep ? h('span', { class: 'chip bien' }, '✅ Preparado') : null);
  }
  // Para Inicio: solo si se viene algo.
  ui.bannerMundo = (s) => (s.mundo && s.mundo.ciclos && s.mundo.ciclos.proximo ? bannerProximo(s) : null);

  // ── Hoja de un sector ──
  function verSector(s, id) {
    R.son.toque();
    const x = R.SECTOR[id];
    const P = s.prod;
    const st = P.sec[id];
    const a = R.prod.atractivo(s, id);
    const b = R.prod.bloqueoConstruir(s, id);
    const obras = P.obras.filter((o) => o.id === id);
    const razones = a.partes.filter((p) => Math.abs(p.v) >= 0.05).sort((p, q) => Math.abs(q.v) - Math.abs(p.v)).slice(0, 4);
    const en = id === 'energia' || id === 'industria' ? R.prod.energia(s) : null;
    const meta = R.metas && R.metas.deSector(s, id);
    const camino = meta ? R.metas.camino(s, meta) : null;
    const suma = [h('span', { class: 'chip bien' }, '📈 PBI +' + R.fmt(R.prod.pbiNivel(s, id), 1) + '%'), h('span', { class: 'chip bien' }, '🚪 Desempleo ▼')];
    if (id !== 'energia') suma.push(h('span', { class: 'chip bien' }, '🚢 Exportaciones ▲'));
    else suma.push(h('span', { class: 'chip bien' }, '⚡ Energía ▲'));
    suma.push(h('span', { class: 'chip bien' }, R.GRUPO[x.grupo].emoji + ' ▲'));
    ui.abrirCapa(h('div', { class: 'pila' },
      h('div', { class: 'fila', style: { paddingRight: '44px' } }, h('span', { style: { fontSize: '44px', lineHeight: 1 } }, x.emoji),
        h('div', { style: { flex: 1, minWidth: 0 } }, h('h2', { style: { margin: 0 } }, x.nombre), h('div', { class: 'chico suave' }, x.obra))),
      h('div', { class: 'fila', style: { gap: '8px' } },
        h('span', { class: 'barra', style: { flex: 1 } }, h('i', { style: { width: (st.nivel / R.NIVEL_MAX_SECTOR) * 100 + '%', background: 'var(--celeste-fuerte, #3d8fd6)' } })),
        h('b', { class: 'numero' }, 'Nivel ' + st.nivel + ' de ' + R.NIVEL_MAX_SECTOR)),
      camino ? h('div', { class: 'meta-sector' }, h('span', null, '🎯'), h('span', null, h('b', null, R.META[meta.id].nombre),
        h('small', null, camino.faltan ? 'Faltan ' + camino.faltan + (camino.faltan === 1 ? ' nivel' : ' niveles') + ' · ⏳ ~' + camino.meses + ' meses con ' + camino.cuadrillas + ' cuadrillas' : '¡Ya casi! Las obras en marcha alcanzan'))) : null,
      h('div', { class: 'etiqueta' }, 'Cada nivel suma'),
      h('div', { class: 'fila envolver', style: { gap: '4px' } }, suma),
      h('div', { class: 'fila envolver', style: { gap: '6px' } }, h('span', { class: 'chico' }, '🌍 Precio en el mundo:'), chipPrecio(s, x.producto, true)),
      en ? h('div', { class: 'chico' }, '⚡ Producís ' + R.fmt(en.oferta, 1) + ' · el país usa ' + R.fmt(en.demanda, 1) + ' → ',
        h('b', { style: { color: en.saldo < 0 ? 'var(--mal)' : 'var(--bien)' } }, en.saldo < 0 ? 'se compra afuera (🏦 ▼)' : 'sobra y se exporta')) : null,
      h('div', { class: 'etiqueta' }, '🏦 Inversión privada: ' + Math.round(a.chance * 100) + '% por mes'),
      razones.length ? h('div', { class: 'fila envolver', style: { gap: '4px' } }, razones.map((p) => {
        const r = R.CAUSAS_INVERSION[p.k] || ['•', p.k];
        return h('span', { class: 'chip ' + (p.v > 0 ? 'bien' : 'mal') }, r[0] + ' ' + r[1] + (p.v > 0 ? ' ▲' : ' ▼'));
      })) : null,
      a.cierre ? h('div', { class: 'chico', style: { color: 'var(--mal)', fontWeight: 800 } }, '🏚️ Con este clima pueden cerrar empresas (' + Math.round(a.cierre * 100) + '% por mes)') : null,
      obras.length ? h('div', { class: 'pila', style: { gap: '4px' } }, obras.map((o) => h('div', { class: 'fila', style: { gap: '8px' } }, h('span', null, '🔨'),
        h('span', { class: 'barra', style: { flex: 1, height: '10px' } }, h('i', { style: { width: ((o.total - o.meses) / o.total) * 100 + '%', background: 'var(--sol)' } })),
        h('b', { class: 'chico' }, 'faltan ' + o.meses + ' m')))) : null,
      h('button', { class: 'boton ancho', disabled: b ? true : null, onclick: () => {
        const r = R.prod.construir(s, id);
        if (r.error) { R.son.mal(); ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); return; }
        R.guardar(s);
        R.son.bien();
        ui.cerrarCapa();
        ui.aviso(r.txt, { tipo: 'bien' });
        ui.refrescar();
      } }, '🔨 Construir ⭐' + R.prod.COSTO_PC),
      h('div', { class: 'fila envolver', style: { gap: '4px', justifyContent: 'center' } },
        h('span', { class: 'chip mal' }, '💸 ' + R.fmt(R.prod.gastoObra(s, id), 1) + '%/mes del presupuesto'), h('span', { class: 'chip' }, '⏳ ' + R.prod.mesesObra(s, id) + ' meses')),
      b ? h('div', { class: 'chico centro', style: { color: 'var(--mal)', fontWeight: 800 } }, '🚫 ' + b) : null,
      b === 'No hay cuadrillas libres' ? h('button', { class: 'boton sec ancho', onclick: () => verCuadrillas(s, () => verSector(s, id)) }, '🏗️ Conseguir más cuadrillas') : null), { cerrable: true });
  }
  ui.verSector = verSector;

  // ── 🏗️ Cuadrillas: dónde poner plata para construir más a la vez ──
  function verCuadrillas(s, volver) {
    R.son.toque();
    const P = s.prod;
    const e = s.eco;
    const total = R.prod.cuadrillas(s);
    const prox = R.prod.proximaPorRutas(s);
    const infra = e.calidad.infra;
    const bC = R.prod.bloqueoContratar(s);
    const contratadas = R.prod.cuadrillasContratadas(s);
    const reabrir = () => verCuadrillas(s, volver);
    // Subir la obra pública desde acá (lo mismo que el «+» del presupuesto).
    const subirObras = () => {
      const nuevo = R.round(R.clamp(e.niveles.obras + 0.1, R.eco.NIVEL_MIN, R.eco.NIVEL_MAX), 2);
      if (nuevo === e.niveles.obras) return;
      const antes = R.eco.resultado(s);
      e.niveles.obras = nuevo;
      R.son.toque();
      R.guardar(s);
      reabrir();
      ui.aviso('🏗️ Obra pública: más plata', { tipo: 'bien', dur: 2200, extra: h('div', { class: 'chico', style: { fontWeight: 900 } }, '⚖️ Resultado ' + R.fmt(antes, 2) + '% → ', h('span', { style: { color: 'var(--mal)' } }, R.fmt(R.eco.resultado(s), 2) + '%')) });
      ui.refrescar();
    };
    const marcas = R.prod.UMBRALES_RUTAS.map((u) => h('b', { class: 'marca-umbral' + (infra >= u ? ' ok' : ''), style: { left: u + '%' } }, '👷'));
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, '🏗️ Cuadrillas de obra'),
      h('div', { class: 'cuadrillas-fila' }, Array.from({ length: Math.max(total, 1) }, (_, i) => {
        const o = P.obras[i];
        return h('div', { class: 'cuadrilla' + (o ? ' ocupada' : '') }, h('span', { class: 'em' }, o ? R.SECTOR[o.id].emoji : '👷'), h('small', null, o ? o.meses + ' m' : 'libre'));
      })),
      h('div', { class: 'chico suave' }, 'Cada cuadrilla hace una obra a la vez. Tenés ' + total + ': 1 fija + ' + R.prod.cuadrillasRutas(s) + ' por las rutas + ' + contratadas + ' contratadas.'),
      // 1) Rutas
      h('div', { class: 'tarjeta plana pila', style: { gap: '6px' } },
        h('b', null, '🛣️ Rutas: ' + Math.round(infra) + '/100 · 👷 a 40, 55 y 70'),
        h('div', { class: 'barra rutas' }, h('i', { style: { width: infra + '%', background: 'var(--celeste-fuerte, #3d8fd6)' } }), h('b', { class: 'marca-va', style: { left: R.clamp(prox ? prox.obj : infra, 0, 100) + '%' }, title: 'Hacia dónde van' }), marcas),
        prox ? h('div', { class: 'chico', style: { fontWeight: 800 } }, 'Próxima cuadrilla con rutas ' + prox.umbral + ' (faltan ' + Math.ceil(prox.falta) + ') → ',
          prox.meses ? h('span', { style: { color: 'var(--bien)' } }, '⏳ ~' + prox.meses + ' meses') : h('span', { style: { color: 'var(--mal)' } }, 'con esta plata no llega')) : h('div', { class: 'chico', style: { fontWeight: 800, color: 'var(--bien)' } }, '✅ Ya tenés todas las cuadrillas de las rutas'),
        h('div', { class: 'chico suave' }, 'Las rutas mejoran con 🏗️ Obra pública: ' + R.eco.nivelTxt(e.niveles.obras).toLowerCase() + '.'),
        h('button', { class: 'boton sec ancho', disabled: e.niveles.obras >= R.eco.NIVEL_MAX ? true : null, onclick: subirObras }, '🏗️ +10 % obra pública'),
        h('div', { class: 'fila envolver', style: { gap: '4px', justifyContent: 'center' } }, h('span', { class: 'chip mal' }, '💸 ' + R.fmt(R.AREA.obras.base * 0.1, 2) + '% PBI/año'), h('span', { class: 'chip bien' }, '📈 ▲▲'), h('span', { class: 'chip bien' }, '👷 ▲▲'))),
      // 2) Contratar
      h('div', { class: 'tarjeta plana pila', style: { gap: '6px' } },
        h('b', null, '👷 Contratar una cuadrilla (' + contratadas + ' de ' + R.prod.CUADRILLA.max + ')'),
        h('div', { class: 'fila envolver', style: { gap: '4px' } }, h('span', { class: 'chip sol' }, '⭐ ' + R.prod.CUADRILLA.pc + ' una vez'), h('span', { class: 'chip mal' }, '💸 ' + R.fmt(R.prod.CUADRILLA.gastoMes, 1) + '%/mes siempre'), h('span', { class: 'chip bien' }, '👷 ▲')),
        h('button', { class: 'boton ancho', disabled: bC ? true : null, onclick: () => {
          const r = R.prod.contratarCuadrilla(s);
          if (r.error) { R.son.mal(); ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); return; }
          R.guardar(s);
          R.son.bien();
          reabrir();
          ui.aviso(r.txt, { tipo: 'bien', efectos: R.describirAplicado(s, r.aplicado) });
          ui.refrescar();
        } }, '👷 Contratar · ⭐' + R.prod.CUADRILLA.pc),
        bC ? h('div', { class: 'chico centro', style: { color: 'var(--mal)', fontWeight: 800 } }, '🚫 ' + bC) : null,
        contratadas ? h('button', { class: 'boton mini sec', onclick: () => {
          const r = R.prod.despedirCuadrilla(s);
          if (r.error) return;
          R.guardar(s);
          reabrir();
          ui.aviso(r.txt, { tipo: 'mal', efectos: R.describirAplicado(s, r.aplicado) });
          ui.refrescar();
        } }, 'Despedir una (ahorrás plata)') : null),
      volver ? h('button', { class: 'boton sec ancho', onclick: volver }, '◀ Volver') : null), { cerrable: true });
  }
  ui.verCuadrillas = verCuadrillas;

  // ── Precios del mundo y lo que pasa (y lo que se viene) ──
  function verPrecios(s) {
    R.son.toque();
    const C = s.mundo.ciclos;
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, '🌍 Precios del mundo'),
      h('div', { class: 'pila', style: { gap: '6px' } }, Object.keys(R.PRODUCTOS).map((k) => {
        const p = R.prod.precio(s, k);
        const ancho = Math.min(50, Math.abs(p - 1) * 100);
        return h('div', { class: 'precio-fila' }, h('span', { class: 'em' }, R.PRODUCTOS[k].emoji), h('b', null, R.PRODUCTOS[k].nombre),
          h('span', { class: 'balanza-motivo' }, h('i', { class: p >= 1 ? 'suma' : 'resta', style: p >= 1 ? { left: '50%', width: ancho + '%' } : { right: '50%', width: ancho + '%' } })),
          h('span', { class: 'chico numero', style: { fontWeight: 900, color: p >= 1.02 ? 'var(--bien)' : p <= 0.98 ? 'var(--mal)' : 'inherit' } }, Math.abs(p - 1) < 0.02 ? '=' : pct(p - 1)));
      })),
      C.activos.length ? h('div', { class: 'etiqueta' }, 'Pasando ahora') : null,
      C.activos.length ? h('div', { class: 'fila envolver', style: { gap: '6px' } }, C.activos.map((c) => {
        const X = R.prod.CICLO[c.id];
        return h('span', { class: 'chip ' + (X.bueno ? 'bien' : 'mal') }, X.emoji + ' ' + X.nombre + ' · ' + c.quedan + ' m');
      })) : null,
      C.proximo ? bannerProximo(s) : null,
      !C.activos.length && !C.proximo ? h('p', { class: 'chico suave' }, '🌤️ El mundo está tranquilo. Por ahora.') : null), { cerrable: true });
  }
  ui.verPrecios = verPrecios;

  // ── Momento: se viene una crisis o una bonanza ──
  ui.momentos.aviso_mundo = function (s, m, listo) {
    const C = s.mundo.ciclos;
    if (!C.proximo || C.proximo.id !== m.id) return listo();
    const X = R.prod.CICLO[m.id];
    const { precios, ef } = R.prod.efectosCiclo(X);
    const b = R.prod.bloqueoPreparar(s);
    const costo = [];
    if (X.prep.costo.pc) costo.push('⭐ ' + X.prep.costo.pc);
    if (X.prep.costo.gasto) costo.push('💸 ' + X.prep.costo.gasto + '%');
    const queHace = X.prep.mitiga && !X.bueno ? 'Te pega ' + Math.round(X.prep.mitiga * 100) + '% menos'
      : X.prep.atrae ? 'Más inversión en ' + Object.keys(X.prep.atrae).map((k) => R.SECTOR[k].emoji).join(' ') : '';
    if (X.bueno) R.son.bien(); else R.son.mal();
    ui.abrirCapa(h('div', { class: 'pila' },
      h('div', { class: 'centro', style: { fontSize: '54px', lineHeight: 1 } }, X.emoji),
      h('div', { class: 'centro etiqueta' }, '📡 Se viene ' + (C.proximo.en <= 1 ? 'el mes que viene' : 'en ' + C.proximo.en + ' meses')),
      h('h2', { class: 'centro', style: { margin: 0 } }, X.nombre),
      h('div', { class: 'fila envolver', style: { gap: '4px', justifyContent: 'center' } },
        precios.map((p) => h('span', { class: 'chip ' + (p.v > 0 ? 'bien' : 'mal') }, R.PRODUCTOS[p.k].emoji + ' precio ' + (p.v > 0 ? '▲' : '▼'))),
        ui.chipsEfectos(R.gob.describirEfectos(s, ef), { compacto: true })),
      h('div', { class: 'lista-elegir' },
        h('button', { class: 'item-elegir', disabled: b ? true : null, onclick: () => {
          const r = R.prod.preparar(s);
          if (r.error) { R.son.mal(); ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); return; }
          R.guardar(s);
          ui.cerrarCapa();
          R.son.bien();
          listo();
          ui.aviso(r.txt, { tipo: 'bien', efectos: R.describirAplicado(s, r.aplicado) });
        } }, h('span', { class: 'ic' }, X.bueno ? '🚀' : '🛡️'),
          h('div', { class: 'pila', style: { gap: '3px', minWidth: 0 } }, h('b', null, X.prep.txt), queHace ? h('span', { class: 'chico suave' }, queHace) : null,
            b && b !== 'Falta ⭐' ? null : b ? h('span', { class: 'chico', style: { color: 'var(--mal)' } }, b) : null),
          h('span', { class: 'chip sol' }, costo.join(' · '))),
        h('button', { class: 'item-elegir', onclick: () => { ui.cerrarCapa(); listo(); } },
          h('span', { class: 'ic' }, '➡️'), h('div', null, h('b', null, 'Seguir igual')), h('span', { class: 'chip' }, 'gratis')))));
  };

  // ── Novedades de la producción para el resumen del mes ──
  ui.novedades = function (s, lista) {
    if (!lista || !lista.length) return null;
    const filas = lista.map((n) => {
      if (n.ciclo) {
        const X = R.prod.CICLO[n.ciclo];
        return h('div', { class: 'novedad' }, h('span', null, n.fin ? '✅' : X.emoji), h('span', null, (n.fin ? 'Terminó: ' : 'Empezó: ') + X.nombre));
      }
      const x = R.SECTOR[n.id];
      const quien = n.quien === 'estado' ? '🔨 obra terminada' : n.quien === 'privado' ? '🏦 inversión privada' : n.quien ? '🌎 inversión extranjera' : '🏚️ cierran empresas';
      return h('div', { class: 'novedad ' + (n.sube ? 'bien' : 'mal') }, h('span', null, x.emoji), h('span', null, x.nombre + (n.sube ? ' ▲ nivel ' : ' ▼ nivel ') + s.prod.sec[x.id].nivel), h('small', null, quien));
    });
    return h('div', { class: 'pila', style: { gap: '4px' } }, h('div', { class: 'etiqueta' }, '🏗️ Novedades'), filas);
  };
})(globalThis.R = globalThis.R || {});
