// Provincias: mapa con los gobernadores, cómo te llevás con cada uno y qué te piden.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;
  const con = R.congreso;

  const idx = ui.PESTANAS_GOB.findIndex((p) => p.id === 'diario');
  ui.PESTANAS_GOB.splice(idx, 0, { id: 'provincias', emoji: '🗺️', nombre: 'Mapa' });
  ui.panelesGob.provincias = (s) => panelProvincias(s, ui.vista && ui.vista.provSel);

  const relTxt = (r) => (r >= 70 ? '😊 Aliado' : r >= 40 ? '😐 Ni fu ni fa' : '😠 Enojado');

  function panelProvincias(s, sel) {
    const G = s.gob;
    const info = h('div', { class: 'pila' });
    const pintarInfo = (id) => {
      if (!id || !R.PROV[id]) {
        info.replaceChildren(h('p', { class: 'centro suave chico' }, '👆 Tocá una provincia para hablar con su gobernador'));
        return;
      }
      info.replaceChildren(fichaProvincia(s, id, () => ui.refrescar()));
    };
    const mapa = R.ui.mapa({
      sinMalvinas: false,
      sel,
      colorDe: (id) => {
        if (!R.PROV[id]) return null;
        const g = G.gobernadores[id];
        const p = R.partidoInfo(s, g.partido);
        return ui.aclarar(p.color, g.partido === 'YO' ? 0.1 : 0.45);
      },
      valorDe: (id) => (R.PROV[id] ? (G.gobernadores[id].rel >= 70 ? '😊' : G.gobernadores[id].rel >= 40 ? '😐' : '😠') : null),
      alTocar: (id) => { R.son.toque(); ui.vista = Object.assign({}, ui.vista, { provSel: id }); ui.refrescar(); },
    });
    pintarInfo(sel);
    const cuenta = {};
    for (const p of R.PROVINCIAS) cuenta[G.gobernadores[p.id].partido] = (cuenta[G.gobernadores[p.id].partido] || 0) + 1;
    const aliados = R.PROVINCIAS.filter((p) => G.gobernadores[p.id].rel >= 70).length;
    const pedidos = R.PROVINCIAS.filter((p) => G.gobernadores[p.id].rel < 40).length;
    const pc = ui.esPC();
    const izq = h('section', { class: 'tarjeta pila' },
      h('div', { class: 'titulo-seccion' }, '🗺️ Gobernadores'),
      h('div', { class: 'fila envolver', style: { gap: '6px' } },
        h('span', { class: 'chip bien' }, '😊 ' + aliados + ' aliados'),
        h('span', { class: 'chip mal' }, '😠 ' + pedidos + ' enojados')),
      mapa,
      h('div', { class: 'leyenda' }, Object.entries(cuenta).sort((a, b) => b[1] - a[1]).map(([id, n]) => {
        const p = R.partidoInfo(s, id);
        return h('span', { class: 'chip', style: { background: ui.aclarar(p.color, id === 'YO' ? 0.1 : 0.45) } }, p.simbolo + ' ' + p.sigla + ' ' + n);
      })));
    const der = h('section', { class: 'tarjeta pila' }, h('div', { class: 'titulo-seccion' }, '🤝 Hablá con un gobernador'), info,
      h('p', { class: 'chico suave' }, 'Un gobernador contento hace que sus diputados y senadores te voten las leyes. Si le das justo lo que pide, rinde más.'));
    if (pc) return h('div', { class: 'columnas' }, h('div', { class: 'col-izq pila' }, izq), h('div', { class: 'pila' }, der));
    return h('div', { class: 'pila' }, izq, der);
  }

  function fichaProvincia(s, id, alHacer) {
    const G = s.gob;
    const g = G.gobernadores[id];
    const p = R.partidoInfo(s, g.partido);
    const pide = R.PEDIDOS[g.pide];
    const voto = s.elecciones.general && s.elecciones.general.prov[id] ? s.elecciones.general.prov[id].YO : null;
    return h('div', { class: 'tarjeta plana suave pila', style: { gap: '8px' } },
      h('div', { class: 'fila' },
        R.ui.avatar(g.avatar, { size: 64, humor: g.rel >= 70 ? 'feliz' : g.rel >= 40 ? 'normal' : 'enojado', fondo: ui.aclarar(p.color, 0.6) }),
        h('div', { style: { minWidth: 0 } },
          h('b', { style: { fontFamily: 'var(--f-titulo)', fontWeight: 400, fontSize: '20px' } }, R.PROV[id].nombre),
          h('div', { class: 'chico' }, 'Gobernador/a ' + g.nombre),
          h('span', { class: 'chip', style: { background: ui.aclarar(p.color, 0.5) } }, p.simbolo + ' ' + p.sigla))),
      h('div', { class: 'fila entre' }, h('span', { class: 'chico', style: { fontWeight: 900 } }, relTxt(g.rel)),
        h('div', { class: 'barra', style: { flex: 1, maxWidth: '60%' } }, h('i', { style: { width: g.rel + '%', background: g.rel >= 70 ? 'var(--bien)' : g.rel >= 40 ? 'var(--sol)' : 'var(--mal)' } }))),
      h('div', { class: 'fila envolver', style: { gap: '6px' } },
        h('span', { class: 'chip sol' }, '🙏 Pide: ' + pide.emoji + ' ' + pide.txt),
        voto !== null ? h('span', { class: 'chip' }, '🗳️ Te votó el ' + R.fmt(voto) + '%') : null,
        h('span', { class: 'chip' }, '🏛️ ' + R.PROV[id].dip + ' diputados')),
      h('div', { class: 'acciones-prov' }, con.ACC_PROV.map((a) => {
        const b = con.bloqueoProv(s, id, a);
        const justo = g.pide === a.id;
        return h('button', { class: 'boton mini ' + (justo ? '' : 'sec'), disabled: b ? true : null, onclick: () => {
          const r = con.accionProvincia(s, id, a.id);
          if (r.error) { ui.aviso('🚫 ' + r.error, { tipo: 'mal' }); return; }
          R.son.bien();
          R.guardar(s);
          const ef = R.describirAplicado(s, r.aplicado);
          ef.unshift({ emoji: '❤️', nombre: g.nombre, sube: true, bueno: true, flechas: Math.min(3, Math.ceil(r.subir / 8)) });
          ui.aviso(a.emoji + ' ' + r.txt, { tipo: 'bien', efectos: ef });
          alHacer();
        } }, (justo ? '🙏 ' : '') + a.emoji + ' ' + a.nombre + ' · ' + (a.costo.pc ? '⭐' + a.costo.pc : '💸' + R.fmt(a.costo.gasto, 1) + '%'));
      })),
      con.bloqueoProv(s, id, con.ACC_PROV[2]) && s.mes - g.enfr < 3 ? h('p', { class: 'chico suave' }, '⏳ Ya hablaste hace poco con este gobernador.') : null);
  }
})(globalThis.R = globalThis.R || {});
