// Arranque y «director de orquesta»: qué pantalla se ve y en qué orden aparecen noticias y elecciones.
(function (R) {
  'use strict';
  const ui = R.ui;
  const h = R.h;

  ui.s = null;
  ui.vista = { tab: 'acciones' };

  ui.irPortada = function () {
    ui.cerrarCapa(true);
    ui.s = null;
    ui.portada();
    window.scrollTo(0, 0);
  };

  ui.continuar = function (s) {
    ui.s = s;
    ui.vista = { tab: s.fase === 'gobierno' ? 'inicio' : 'acciones' };
    ui.render();
    window.scrollTo(0, 0);
    ui.procesarCola();
  };

  ui.render = function () {
    const s = ui.s;
    if (!s) return ui.portada();
    if (s.fase === 'campana') return ui.pantallaCampana(s);
    if (s.fase === 'gobierno' && ui.pantallaGobierno) return ui.pantallaGobierno(s);
    if (s.fase === 'fin') return ui.pantallaFin(s);
    return ui.pantallaElecto(s);
  };

  // Mientras se arma el gobierno: pantalla de presidente electo.
  ui.pantallaElecto = function (s) {
    ui.ocultarNav();
    ui.montar(h('main', { class: 'pila', style: { paddingTop: '16px' } },
      h('section', { class: 'tarjeta pila centro' },
        R.ui.avatar(s.lider.avatar, { size: 110, humor: 'feliz', banda: true }),
        h('h2', null, s.lider.nombre + ', presidente electo'),
        h('p', null, 'El gobierno se arma en la próxima versión del juego.')),
      h('button', { class: 'boton ancho', onclick: () => ui.irPortada() }, '🏠 Portada')));
  };

  // Muestra de a uno los momentos pendientes (noticias, elecciones, debates…).
  ui.procesarCola = function () {
    const s = ui.s;
    if (!s || ui.procesando || ui.hayCapa()) return;
    const m = s.cola[0];
    if (!m) return;
    ui.procesando = true;
    const listo = () => {
      if (s.cola[0] === m) s.cola.shift();
      R.guardar(s);
      ui.procesando = false;
      ui.render();
      ui.procesarCola();
    };
    switch (m.tipo) {
      case 'noticia': return ui.noticia(s, m, listo);
      case 'eleccion': return ui.eleccion(s, m.clave, listo);
      case 'debate': return ui.debate(s, m, listo);
      case 'asuncion': return ui.asuncion(s, () => { if (R.gob && R.gob.iniciar) R.gob.iniciar(s); listo(); });
      default:
        if (ui.momentos && ui.momentos[m.tipo]) return ui.momentos[m.tipo](s, m, listo);
        return listo();
    }
  };

  // Enter = pasar el mes (en la PC).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || ui.hayCapa() || !ui.s) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'BUTTON' || t.tagName === 'TEXTAREA')) return;
    if (ui.s.fase === 'campana' || ui.s.fase === 'gobierno') ui.pasarMes();
  });

  // Al cruzar el ancho de PC/celu se redibuja (cambia el diseño de columnas).
  let eraPC = null;
  window.addEventListener('resize', () => {
    const pc = ui.esPC ? ui.esPC() : false;
    if (eraPC !== null && pc !== eraPC && ui.s) ui.render();
    eraPC = pc;
  });

  function arrancar(data) {
    eraPC = ui.esPC ? ui.esPC() : false;
    if (data && data.s && data.s.v === R.VERSION) {
      ui.continuar(data.s);
      return;
    }
    ui.portada();
  }
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(() => ({ s: ui.s }));
  if (hot && hot.ready) hot.ready(arrancar);
  else arrancar((hot && hot.data) || {});
})(globalThis.R = globalThis.R || {});
