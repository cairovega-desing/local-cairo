// La noticia del mes: tarjeta tipo diario con 2-3 opciones que muestran a quién le pegan.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;

  ui.costoChips = function (costo) {
    const out = [];
    if (costo.fondos) out.push(h('span', { class: 'chip sol' }, '💰 ' + costo.fondos));
    if (costo.agenda) out.push(h('span', { class: 'chip sol' }, '⏱️ ' + costo.agenda));
    if (costo.pc) out.push(h('span', { class: 'chip sol' }, '⭐ ' + costo.pc));
    if (costo.gasto) out.push(h('span', { class: 'chip sol' }, '💸 ' + R.fmt(costo.gasto, 1) + '% presup.'));
    return out;
  };

  ui.noticia = function (s, inst, alTerminar) {
    const d = R.ev.datos(s, inst);
    if (!d) return alTerminar();
    R.son.diario();
    let listo = false;
    const elegir = (o) => {
      if (listo || o.bloqueo) return;
      listo = true;
      document.removeEventListener('keydown', teclas);
      const res = R.ev.resolver(s, inst, o.i);
      R.guardar(s);
      const efectos = R.describirAplicado(s, res.aplicado);
      if (res.bueno) R.son.bien(); else R.son.mal();
      if (!res.bueno) ui.temblor(document.querySelector('.hoja'));
      ui.abrirCapa(h('div', { class: 'resultado-grande' },
        h('div', { class: 'em' }, res.bueno ? '👍' : '😬'),
        h('div', { class: 'txt' }, res.txt || o.txt),
        efectos.length ? ui.chipsEfectos(efectos) : h('p', { class: 'suave' }, 'No cambió nada importante.'),
        h('button', { class: 'boton grande ancho', autofocus: true, onclick: () => { ui.cerrarCapa(); alTerminar(); } }, 'Seguir')), { clase: 'diario-hoja' });
    };
    const teclas = (e) => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= d.opciones.length) elegir(d.opciones[n - 1]);
    };
    document.addEventListener('keydown', teclas);
    ui.abrirCapa(h('article', { class: 'pila', style: { gap: '4px' } },
      h('div', { class: 'diario-cab' }, h('span', { class: 'marca' }, 'El Camino'), h('span', { class: 'chico suave' }, R.fechaTxt(s.mes))),
      h('div', { class: 'dibujo-noticia', 'aria-hidden': 'true' }, d.dibujo),
      h('h2', { class: 'titular' }, d.titular),
      d.bajada ? h('p', { class: 'bajada' }, d.bajada) : null,
      h('div', { class: 'opciones-noticia' }, d.opciones.map((o, idx) => {
        const efectos = R.describirEfectosFase(s, o.ef);
        return h('button', { class: 'opcion-noticia', disabled: o.bloqueo ? true : null, onclick: () => elegir(o) },
          h('div', { class: 'cab' }, h('span', { class: 'txt' }, o.txt), h('span', { class: 'fila', style: { gap: '4px' } }, ui.costoChips(o.costo), h('span', { class: 'tecla solo-pc' }, String(idx + 1)))),
          efectos.length ? ui.chipsEfectos(efectos) : h('span', { class: 'chico suave' }, 'Sin efectos grandes'),
          o.azar ? ui.riesgos(s, [{ p: o.azar.p, bueno: o.azar.bueno, txt: o.azar.bueno ? 'Puede salir mejor' : 'Puede salir mal', ef: o.azar.ef }]) : null,
          o.bloqueo ? h('span', { class: 'chico', style: { color: 'var(--mal)' } }, '🚫 ' + o.bloqueo) : null);
      }))), { clase: 'diario-hoja' });
  };
})(globalThis.R = globalThis.R || {});
