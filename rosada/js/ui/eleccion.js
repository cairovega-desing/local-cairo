// Noche de elecciones: escrutinio animado, mapa que se pinta y el Congreso que queda.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;

  ui.eleccion = function (s, clave, alTerminar) {
    const res = s.elecciones[clave];
    if (!res) return alTerminar();
    const lista = res.lista.slice(0, clave === 'ballotage' ? 2 : 6);
    const lentos = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const DUR = lentos ? 6500 : 300;

    // Orden en que «terminan» de contar las provincias (las chicas primero, como en la tele).
    const orden = R.PROVINCIAS.slice().sort((a, b) => a.padron - b.padron + (Math.random() - 0.5) * 3);
    const terminadas = new Set();

    const pctEl = h('span', null, '0');
    const barraEsc = h('i', { style: { width: '0%' } });
    const lineas = lista.map((x) => {
      const p = R.partidoInfo(s, x.id);
      const pista = h('i', { style: { width: '0%', background: p.color } });
      const num = h('div', { class: 'pct' }, '0,0');
      const av = x.id === 'YO' ? R.ui.avatar(s.lider.avatar, { size: 40, fondo: ui.aclarar(p.color, 0.6) })
        : R.ui.avatar(R.PARTIDOS[x.id].candidato.avatar, { size: 40, fondo: ui.aclarar(p.color, 0.6) });
      const el = h('div', { class: 'linea' + (x.id === 'YO' ? ' yo' : '') }, av,
        h('div', { class: 'nombre' }, R.elec.nombre(s, x.id), h('small', null, p.simbolo + ' ' + p.sigla), h('div', { class: 'pista' }, pista)), num);
      return { x, el, pista, num };
    });
    const mapaCaja = h('div');
    const pintarMapa = () => mapaCaja.replaceChildren(R.ui.mapa({
      sinMalvinas: true,
      colorDe: (id) => (terminadas.has(id) ? R.elec.color(s, res.ganadores[id]) : '#2a3b5e'),
    }));
    pintarMapa();
    const veredicto = h('div');
    const despues = h('div', { class: 'pila' });
    const saltar = h('button', { class: 'boton mini sec', onclick: () => { t0 = -1e9; } }, '⏩ Ver resultado');
    const cont = h('div', { class: 'noche' },
      h('h2', null, '🗳️ ' + res.titulo),
      h('div', { class: 'escrutinio' }, 'Mesas escrutadas: ', pctEl, '%'),
      h('div', { class: 'barra gorda' }, barraEsc),
      h('div', { class: 'noche-cuerpo' },
        h('div', { class: 'carrera' }, lineas.map((l) => l.el)),
        h('div', { class: 'mapa-noche' }, mapaCaja)),
      h('div', { class: 'centro' }, saltar),
      veredicto, despues);
    ui.abrirCapa(cont, { oscura: true });
    R.son.tambor();

    let t0 = performance.now();
    let ultimoTic = 0;
    const max = Math.max(...lista.map((x) => x.v));
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / DUR);
      const e = 1 - Math.pow(1 - k, 2);
      pctEl.textContent = R.fmt(e * 100, 1);
      barraEsc.style.width = e * 100 + '%';
      // Al principio los números bailan (cuentan primero ciertas mesas) y se acomodan al final.
      lineas.forEach((l, i) => {
        const ruido = Math.sin(t / 380 + i * 1.7) * 3.2 * (1 - e);
        const v = Math.max(0, l.x.v + ruido) * Math.min(1, e * 1.6);
        l.num.textContent = R.fmt(v, 1);
        l.pista.style.width = (Math.max(0, v) / (max * 1.08)) * 100 + '%';
      });
      const nTerm = Math.floor(e * orden.length);
      if (nTerm > terminadas.size) {
        for (let i = terminadas.size; i < nTerm; i++) terminadas.add(orden[i].id);
        pintarMapa();
      }
      if (t - ultimoTic > 160 && k < 1) { R.son.tic(); ultimoTic = t; }
      if (k < 1) requestAnimationFrame(paso);
      else terminar();
    };
    requestAnimationFrame(paso);

    function terminar() {
      orden.forEach((p) => terminadas.add(p.id));
      pintarMapa();
      lineas.forEach((l) => { l.num.textContent = R.fmt(l.x.v, 1); l.pista.style.width = (l.x.v / (max * 1.08)) * 100 + '%'; });
      saltar.remove();
      const yo = res.lista.find((x) => x.id === 'YO');
      const puesto = res.lista.indexOf(yo) + 1;
      let txt;
      let gana = true;
      if (clave === 'paso') {
        gana = res.pasa;
        txt = res.pasa ? (puesto === 1 ? '¡Ganaste las PASO! 🥇' : '¡Pasaste a las generales! Saliste ' + puesto + '.º') : 'Quedaste afuera… no llegaste al 1,5 %';
      } else if (clave === 'general') {
        if (res.ganador === 'YO') txt = '¡GANASTE EN PRIMERA VUELTA! 🏆';
        else if (res.ballotage && res.ballotage.includes('YO')) txt = '¡Vamos al ballotage contra ' + R.elec.nombre(s, res.ballotage.find((x) => x !== 'YO')) + '! ⚔️';
        else { gana = false; txt = 'Perdiste. Saliste ' + puesto + '.º'; }
      } else {
        gana = res.ganador === 'YO';
        txt = gana ? '¡GANASTE EL BALLOTAGE! 🏆' : 'Perdiste el ballotage por ' + R.fmt(res.lista[0].v - res.lista[1].v, 1) + ' puntos';
      }
      veredicto.replaceChildren(h('div', { class: 'veredicto ' + (gana ? 'gana' : 'pierde') }, txt));
      if (gana) {
        R.son.aplausos();
        if ((clave === 'general' && res.ganador === 'YO') || clave === 'ballotage') { ui.confeti(); R.son.genial(); }
      } else R.son.abucheo();

      const extras = [];
      if (res.perdidos > 0.3) extras.push(h('div', { class: 'tarjeta chico' }, '⚠️ Te faltaron fiscales: perdiste ' + R.fmt(res.perdidos, 1) + ' puntos en las mesas.'));
      if (res.bancas) extras.push(congresoNuevo(s, res));
      extras.push(h('button', { class: 'boton grande ancho', autofocus: true, onclick: () => { ui.cerrarCapa(); alTerminar(); } }, 'Seguir ▶'));
      despues.replaceChildren(...extras);
      const btn = despues.querySelector('.boton');
      if (btn) setTimeout(() => btn.focus({ preventScroll: true }), 50);
    }
  };

  function congresoNuevo(s, res) {
    const dip = R.composicion(s, 'diputados');
    const sen = R.composicion(s, 'senado');
    const misDip = res.bancas.dip.YO || 0;
    const misSen = res.bancas.sen.YO || 0;
    const camara = (nombre, comp, mias, total) => h('div', { class: 'tarjeta pila', style: { gap: '4px', padding: '10px' } },
      h('div', { class: 'etiqueta centro' }, nombre),
      R.ui.hemiciclo(R.ui.gruposCamara(s, comp), { centro: comp.YO || 0, sub: 'de ' + total, resaltar: 'YO' }),
      h('div', { class: 'centro chico' }, mias ? '+' + mias + ' bancas nuevas' : 'Sin bancas nuevas'));
    return h('div', { class: 'pila' },
      h('div', { class: 'centro', style: { fontWeight: 900 } }, '🏛️ Así queda el Congreso'),
      h('div', { class: 'bancas-ganadas' },
        camara('Diputados', dip, misDip, 257),
        camara('Senado', sen, misSen, 72)),
      h('div', { class: 'leyenda', style: { color: '#fff' } }, R.ui.gruposCamara(s, dip).map((g) => {
        const p = R.partidoInfo(s, g.id);
        return h('span', { class: 'chip', style: { background: p.color, color: '#fff', borderColor: '#fff' } }, p.sigla);
      })));
  }
})(globalThis.R = globalThis.R || {});
