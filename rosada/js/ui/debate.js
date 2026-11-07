// Debate presidencial: 3 temas, elegís cómo responder. Piedra, papel o tijera con estilo.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;

  ui.debate = function (s, m, alTerminar) {
    const d = R.debate.nuevo(s, m.rival, m.etapa);
    const rival = R.PARTIDOS[m.rival];
    let humorYo = 'normal';
    let humorEl = 'normal';
    let ultimo = null;

    function pintar() {
      const E = R.debate.ESTILOS;
      const aplausos = R.clamp(50 + d.puntos * 13, 4, 96);
      const escenario = h('div', { class: 'debate-escenario' },
        h('div', { class: 'atril' }, R.ui.avatar(s.lider.avatar, { size: 84, humor: humorYo, fondo: ui.aclarar(s.partido.color, 0.6) }), s.lider.nombre),
        h('div', { class: 'vs' }, 'VS'),
        h('div', { class: 'atril' }, R.ui.avatar(rival.candidato.avatar, { size: 84, humor: humorEl, fondo: ui.aclarar(rival.color, 0.6) }), rival.candidato.nombre));
      const medidor = h('div', { class: 'aplausometro' }, h('span', null, '👏'), h('div', { class: 'barra' }, h('i', { style: { width: aplausos + '%' } })), h('span', null, '🙌'));
      const partes = [
        h('h2', { class: 'centro' }, m.etapa === 'ballotage' ? '🎙️ Debate del ballotage' : '🎙️ Debate presidencial'),
        escenario, medidor,
      ];
      if (ultimo) {
        const r = ultimo;
        const txt = r.r === 'gana' ? '¡Ganaste la ronda! 👏' : r.r === 'pierde' ? 'Te ganó la ronda 😓' : 'Empate';
        partes.push(h('div', { class: 'burbuja centro' },
          'Vos: ' + E[d.historia[d.historia.length - 1].yo].emoji + ' · ' + rival.candidato.nombre.split(' ')[0] + ': ' + E[r.el].emoji + ' ' + E[r.el].nombre,
          h('div', { style: { fontFamily: 'var(--f-titulo)', fontSize: '22px', marginTop: '4px', color: r.r === 'gana' ? 'var(--bien)' : r.r === 'pierde' ? 'var(--mal)' : 'inherit' } }, txt),
          r.tema.fuerte === d.historia[d.historia.length - 1].yo ? h('div', { class: 'chico' }, '⭐ Bonus: era el estilo justo para ' + r.tema.nombre.toLowerCase()) : null));
        partes.push(h('button', { class: 'boton grande ancho', autofocus: true, onclick: () => { ultimo = null; if (d.ronda >= 3) fin(); else pintar(); } }, d.ronda >= 3 ? 'Ver cómo te fue ▶' : 'Siguiente tema ▶'));
      } else {
        const tema = d.temas[d.ronda];
        partes.push(h('div', { class: 'tarjeta plana suave centro pila', style: { gap: '4px' } },
          h('div', { class: 'etiqueta' }, 'Tema ' + (d.ronda + 1) + ' de 3'),
          h('div', { class: 'titulo-seccion', style: { justifyContent: 'center' } }, tema.emoji + ' ' + tema.nombre),
          h('div', { class: 'chico' }, '💡 Acá rinde: ' + E[tema.fuerte].emoji + ' ' + E[tema.fuerte].nombre + ' · ' + rival.candidato.nombre.split(' ')[0] + ' suele ' + E[rival.debate].emoji + ' ' + E[rival.debate].nombre.toLowerCase())));
        partes.push(h('div', { class: 'estilos' }, Object.entries(E).map(([id, e]) =>
          h('button', { class: 'boton sec' + (tema.fuerte === id ? ' recomendado' : ''), onclick: () => jugar(id) }, h('span', { class: 'em' }, e.emoji), e.nombre))));
        partes.push(h('div', { class: 'regla' }, 'Quién le gana a quién', h('br'), h('b', null, '📊 › 🔥 › ❤️ › 😂 › 📊')));
      }
      ui.abrirCapa(h('div', { class: 'pila' }, partes), { sinFoco: !ultimo });
    }

    function jugar(estilo) {
      const r = R.debate.jugar(s, d, estilo);
      ultimo = r;
      humorYo = r.r === 'gana' ? 'feliz' : r.r === 'pierde' ? 'triste' : 'normal';
      humorEl = r.r === 'pierde' ? 'feliz' : r.r === 'gana' ? 'enojado' : 'normal';
      if (r.r === 'gana') { R.son.bien(); R.son.aplausos(0.8); } else if (r.r === 'pierde') R.son.mal(); else R.son.toque();
      pintar();
    }

    function fin() {
      const res = R.debate.terminar(s, d);
      R.guardar(s);
      if (res.bueno) R.son.genial(); else R.son.abucheo();
      if (d.puntos >= 2) ui.confeti();
      ui.abrirCapa(h('div', { class: 'resultado-grande' },
        R.ui.avatar(s.lider.avatar, { size: 96, humor: res.bueno ? 'feliz' : 'triste', fondo: ui.aclarar(s.partido.color, 0.6) }),
        h('div', { class: 'txt' }, res.veredicto),
        ui.chipsEfectos(R.describirAplicado(s, res.aplicado)),
        h('button', { class: 'boton grande ancho', autofocus: true, onclick: () => { ui.cerrarCapa(); alTerminar(); } }, 'Seguir ▶')));
    }
    pintar();
  };

})(globalThis.R = globalThis.R || {});
