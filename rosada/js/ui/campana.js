// Pantalla de campaña: tu número, acciones del mes, mapa, encuesta y diario.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;

  const PESTANAS = [
    { id: 'acciones', emoji: '🎯', nombre: 'Acciones' },
    { id: 'mapa', emoji: '🗺️', nombre: 'Mapa' },
    { id: 'encuesta', emoji: '📊', nombre: 'Encuesta', soloCelu: true },
    { id: 'diario', emoji: '📰', nombre: 'Diario' },
  ];

  ui.esPC = () => window.matchMedia && window.matchMedia('(min-width: 900px)').matches;

  ui.pantallaCampana = function (s) {
    const pc = ui.esPC();
    let tab = (ui.vista && ui.vista.tab) || 'acciones';
    if (pc && tab === 'encuesta') tab = 'acciones';
    const contenido = {
      acciones: () => [pc ? null : resumen(s), tarjetaAcciones(s)],
      mapa: () => tarjetaMapa(s),
      encuesta: () => tarjetaEncuesta(s),
      diario: () => h('section', { class: 'tarjeta pila' }, h('div', { class: 'titulo-seccion' }, '📰 Lo que pasó'), ui.historial(s)),
    }[tab]();
    const cuerpo = pc
      ? h('div', { class: 'columnas' }, h('div', { class: 'col-izq pila' }, resumen(s), tarjetaEncuesta(s)), h('div', { class: 'pila' }, contenido))
      : h('div', { class: 'pila' }, contenido);
    const guia = tab === 'acciones' && s.mes <= 2 && !s.gobRival ? ui.guia('campana', 'Cómo hacer campaña', [
      ['🎯', 'Usá tus acciones del mes', 'Cada una muestra qué te da.'],
      ['🗺️', 'Hacé actos donde te quieren', 'Buenos Aires vale casi 4 de cada 10 votos.'],
      ['▶', 'Pasá el mes', 'Las PASO son en agosto.'],
    ]) : null;
    const scroll = ui.montar(h('div', null, ui.barraCampana(s), guia, cuerpo), pc);
    if (ui.vista && ui.vista.mantenerScroll) window.scrollTo(0, scroll);
    const b = R.turno.botonPasar(s);
    ui.navInferior(PESTANAS.filter((p) => !(pc && p.soloCelu)), tab, (id) => { R.son.toque(); ui.vista = { tab: id }; ui.render(); window.scrollTo(0, 0); },
      h('button', { class: 'boton grande ancho', id: 'btn-pasar', onclick: () => ui.pasarMes() },
        b.emoji + ' ' + b.txt, s.camp.agenda > 0 ? h('span', { class: 'chip', style: { fontFamily: 'var(--f-texto)', fontSize: '12px' } }, 'te quedan ' + s.camp.agenda) : null));
  };

  // ── Resumen: cuenta regresiva y tus números ──
  function resumen(s) {
    const c = s.camp;
    const prox = R.turno.proximaEleccion(s);
    const enc = R.camp.encuesta(s);
    const ant = s.encuestas.length >= 2 ? s.encuestas[s.encuestas.length - 2] : null;
    const dif = ant ? enc.YO - ant.YO : 0;
    const puesto = ['YO'].concat(R.RIVALES).sort((a, b) => enc[b] - enc[a]).indexOf('YO') + 1;
    return h('section', { class: 'tarjeta pila' },
      prox ? h('div', { class: 'cuenta-regresiva' },
        h('div', { class: 'num' }, prox.faltan ? prox.faltan : prox.emoji),
        h('div', null, h('div', { class: 'etiqueta' }, prox.faltan ? (prox.faltan === 1 ? 'mes para ' : 'meses para ') + (prox.art || 'las') : '¡Este mes se vota!'), h('div', { class: 'titulo-seccion' }, prox.emoji + ' ' + prox.nombre))) : null,
      h('div', { class: 'fila entre', style: { alignItems: 'flex-end' } },
        h('div', null, h('div', { class: 'etiqueta' }, 'Te votaría'),
          h('div', { style: { fontFamily: 'var(--f-titulo)', fontSize: '46px', lineHeight: 1 }, class: 'numero' }, R.fmt(enc.YO, 1), h('span', { style: { fontSize: '24px' } }, ' %'))),
        h('div', { class: 'pila', style: { alignItems: 'flex-end', gap: '6px' } },
          h('span', { class: 'chip ' + (puesto <= 2 ? 'sol' : '') }, puesto === 1 ? '🥇 Primero' : puesto === 2 ? '🥈 Segundo' : '#' + puesto + ' en la encuesta'),
          Math.abs(dif) >= 0.05 ? h('span', { class: 'chip ' + (dif > 0 ? 'bien' : 'mal') }, (dif > 0 ? '▲ ' : '▼ ') + R.fmt(Math.abs(dif), 1) + ' este mes') : null)),
      graficoImagen(s),
      h('div', { class: 'fila-militancia' }, h('span', null, '🏴 Militancia y fiscales'),
        h('div', { class: 'barra', style: { height: '10px' } }, h('i', { style: { width: c.militancia + '%', background: s.partido.color } })),
        h('b', { class: 'numero' }, R.fmt(c.militancia) + '%')),
      c.militancia < 30 && s.mes >= 4 ? h('p', { class: 'chico', style: { color: 'var(--mal)' } }, '⚠️ Con poca militancia no tenés fiscales: te pueden robar votos.') : null,
      s.gobRival ? h('div', { class: 'fila envolver', style: { gap: '6px' } },
        h('span', { class: 'chip' }, '🏛️ Gobierna ' + R.elec.nombre(s, s.gobRival.partido) + ' (' + R.PARTIDOS[s.gobRival.partido].sigla + ')'),
        h('span', { class: 'chip ' + (s.gobRival.aprob < 40 ? 'bien' : s.gobRival.aprob > 55 ? 'mal' : '') }, '👍 ' + Math.round(s.gobRival.aprob) + '% de aprobación'),
        h('span', { class: 'chip' }, '🏛️ ' + (R.composicion(s, 'diputados').YO || 0) + ' diputados tuyos')) : null);
  }

  // La historia de tu imagen: una línea por dato, mes a mes. El último punto («hoy») se mueve en vivo con cada acción.
  const SERIES = [
    { k: 'conocimiento', em: '👁️', nom: 'Conocimiento', color: '#3a8bd3' },
    { k: 'positiva', em: '👍', nom: 'Positiva', color: '#1c9a50' },
    { k: 'negativa', em: '👎', nom: 'Negativa', color: '#d5383a', malo: true },
    { k: 'relevancia', em: '📣', nom: 'Relevancia', color: '#d99a00' },
  ];

  function graficoImagen(s) {
    const S = R.svg;
    R.camp.completarHistoria(s);
    const hoy = Object.assign({ mes: s.mes }, R.camp.imagen(s));
    const hist = s.encuestas.filter((e) => e.img && e.mes < s.mes).map((e) => Object.assign({ mes: e.mes }, e.img));
    const pts = hist.concat([hoy]).slice(-24);
    const ant = pts.length >= 2 ? pts[pts.length - 2] : null;
    const W = 330;
    const H = 200;
    const L = 26;
    const DER = 40;
    const T = 16;
    const B = 22;
    const maxV = Math.max(...pts.flatMap((p) => SERIES.map((x) => p[x.k])));
    const tope = R.clamp(Math.ceil((maxV + 6) / 20) * 20, 40, 100);
    const x = (i) => L + (pts.length === 1 ? (W - L - DER) / 2 : (i * (W - L - DER)) / (pts.length - 1));
    const y = (v) => T + ((tope - R.clamp(v, 0, tope)) / tope) * (H - T - B);
    const partes = [];
    // Cuadrícula y escala
    for (let v = 0; v <= tope; v += tope / 4) {
      partes.push(S('line', { x1: L, x2: W - DER + 4, y1: y(v), y2: y(v), stroke: v === 0 ? '#9fb0c7' : '#dde5ef', 'stroke-width': v === 0 ? 1.4 : 1 }));
      partes.push(S('text', { x: L - 5, y: y(v) + 3.5, 'text-anchor': 'end', class: 'eje' }, Math.round(v) + '%'));
    }
    // Meses (y el año cuando cambia)
    const salto = Math.max(1, Math.ceil(pts.length / 7));
    pts.forEach((p, i) => {
      if (i % salto && i !== pts.length - 1) return;
      const m = R.mesDelAnio(p.mes);
      const txt = i === pts.length - 1 ? 'hoy' : m === 0 || i === 0 ? R.MESES_CORTOS[m] + " '" + String(R.anio(p.mes)).slice(2) : R.MESES_CORTOS[m];
      partes.push(S('text', { x: x(i), y: H - 6, 'text-anchor': 'middle', class: 'eje' + (i === pts.length - 1 ? ' hoy' : '') }, txt));
    });
    // Elecciones en la historia
    const c = R.turno.cal(s);
    const marcas = [[c.medio, 'Medio término'], [c.paso, 'PASO'], [c.general, 'Generales']].filter(([m]) => m !== undefined);
    pts.forEach((p, i) => {
      const mk = marcas.find(([m]) => m === p.mes);
      if (!mk) return;
      partes.push(S('line', { x1: x(i), x2: x(i), y1: T - 6, y2: H - B, stroke: '#13284a', 'stroke-dasharray': '3 3', 'stroke-width': 1, opacity: 0.45 }));
      partes.push(S('text', { x: x(i), y: T - 8 + 6, 'text-anchor': 'middle', class: 'eje marca' }, '🗳️ ' + mk[1]));
    });
    // Líneas
    const finales = [];
    for (const se of SERIES) {
      const d = pts.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p[se.k]).toFixed(1)).join(' ');
      if (pts.length > 1) partes.push(S('path', { d, fill: 'none', stroke: se.color, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      pts.forEach((p, i) => partes.push(S('circle', { cx: x(i), cy: y(p[se.k]), r: i === pts.length - 1 ? 4.5 : 2.2, fill: i === pts.length - 1 ? '#ffffff' : se.color, stroke: se.color, 'stroke-width': i === pts.length - 1 ? 2.5 : 0 })));
      finales.push({ y: y(hoy[se.k]), txt: R.fmt(hoy[se.k]) + '%', color: se.color });
    }
    // Etiquetas al final de cada línea, sin pisarse
    finales.sort((a, b) => a.y - b.y);
    for (let i = 1; i < finales.length; i++) if (finales[i].y - finales[i - 1].y < 11) finales[i].y = finales[i - 1].y + 11;
    const exceso = finales.length ? finales[finales.length - 1].y - (H - B + 2) : 0;
    if (exceso > 0) finales.forEach((f) => (f.y -= exceso));
    finales.forEach((f) => partes.push(S('text', { x: x(pts.length - 1) + 8, y: f.y + 3.5, class: 'fin-linea', fill: f.color }, f.txt)));

    const dif = hoy.diferencial;
    return h('div', { class: 'grafico-imagen' },
      h('div', { class: 'fila entre' }, h('div', { class: 'etiqueta' }, '📈 Tu imagen, mes a mes'),
        h('span', { class: 'chip ' + (dif >= 0 ? 'bien' : 'mal'), title: 'Imagen positiva menos negativa' }, 'Diferencial ' + R.signo(dif, 0))),
      S('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'linea-imagen', role: 'img',
        'aria-label': 'Imagen hoy: ' + SERIES.map((se) => se.nom + ' ' + Math.round(hoy[se.k]) + '%').join(', ') }, ...partes),
      h('div', { class: 'leyenda-imagen' }, SERIES.map((se) => {
        const d = ant ? hoy[se.k] - ant[se.k] : 0;
        return h('div', { class: 'item' },
          h('i', { style: { background: se.color } }),
          h('span', { class: 'nom' }, se.nom),
          Math.abs(d) >= 0.5 ? h('span', { class: 'delta ' + ((d > 0) !== !!se.malo ? 'sube' : 'baja') }, (d > 0 ? '▲' : '▼') + R.fmt(Math.abs(d))) : null);
      })),
      s.encuestas.some((e) => e.imgEstimada) ? h('p', { class: 'chico suave' }, 'Los primeros meses son estimados.') : null);
  }

  // ── Acciones ──
  function tarjetaAcciones(s) {
    const c = s.camp;
    return h('section', { class: 'pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, '🎯 Acciones del mes'), ui.puntosAgenda(c.agendaMax - c.agenda, Math.max(c.agendaMax, c.agenda))),
      c.agenda <= 0 ? h('div', { class: 'tarjeta plana centro', style: { background: 'var(--sol-claro)' } }, '✅ Agenda completa') : null,
      h('div', { class: 'acciones' }, R.camp.ACCIONES.map((a) => cartaAccion(s, a))));
  }

  function cartaAccion(s, a) {
    const bloq = R.camp.bloqueo(s, a, undefined);
    const prev = !a.elegir ? R.describirEfectos(s, a.calc(s)) : null;
    const costoTxt = a.elegir === 'figura' ? '💰 20-35' : a.costo ? '💰 ' + a.costo : 'gratis';
    const chipCosto = h('span', { class: 'chip ' + (a.costo || a.elegir === 'figura' ? 'sol' : '') }, costoTxt);
    return h('button', { class: 'accion', disabled: bloq ? true : null, onclick: () => elegirAccion(s, a), 'aria-label': a.nombre + '. ' + a.desc },
      h('div', { class: 'cab' }, h('span', { class: 'ic' }, a.emoji), h('span', { class: 'nom' }, a.nombre)),
      prev ? ui.chipsEfectos(prev, { compacto: true, antes: chipCosto })
        : h('div', { class: 'efectos' }, chipCosto, h('span', { class: 'chip' }, a.elegir === 'provincia' ? '📍 Elegís dónde' : '👆 Elegís')),
      a.riesgos && (!a.elegir || a.elegir === 'rival') ? ui.riesgos(s, a.riesgos(s)) : null,
      bloq && bloq !== 'Sin agenda este mes' ? h('div', { class: 'bloq' }, bloq) : null);
  }

  function elegirAccion(s, a) {
    R.son.toque();
    if (!a.elegir) return hacer(s, a.id);
    if (a.elegir === 'provincia') return elegirProvincia(s, a);
    const items = {
      plata: () => a.opciones.map((o) => ({ id: o.id, emoji: o.emoji, nombre: o.nombre, ef: o.ef, costo: 0, riesgos: o.riesgos })),
      figura: () => R.FIGURAS.filter((f) => !s.camp.figuras.includes(f.id)).map((f) => ({ id: f.id, emoji: f.emoji, nombre: f.nombre, ef: a.calc(s, f.id), costo: f.costo, riesgos: a.riesgos(s, f.id) })),
      rival: () => R.RIVALES.map((id) => ({ id, emoji: R.PARTIDOS[id].simbolo, nombre: R.elec.nombre(s, id) + ' · ' + R.PARTIDOS[id].sigla, ef: a.calc(s, id), costo: a.costo, riesgos: a.riesgos(s, id) })),
      aliado: () => R.ALIADOS.map((x) => ({ id: x.id, emoji: x.emoji, nombre: x.nombre, ef: a.calc(s, x.id), costo: 0, nota: R.REGIONES[x.region].emoji + ' fuerte en ' + R.REGIONES[x.region].nombre })),
    }[a.elegir]();
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, a.emoji + ' ' + a.nombre),
      a.elegir === 'aliado' ? h('p', { class: 'chico suave' }, 'Una alianza por elección.') : null,
      h('div', { class: 'lista-elegir' }, items.map((it) => h('button', {
        class: 'item-elegir', disabled: it.costo > s.camp.fondos ? true : null,
        onclick: () => { ui.cerrarCapa(); hacer(s, a.id, it.id); },
      },
      h('span', { class: 'ic' }, it.emoji),
      h('div', { class: 'pila', style: { gap: '4px', minWidth: 0 } }, h('b', null, it.nombre), ui.chipsEfectos(R.describirEfectos(s, it.ef), { compacto: true }), ui.riesgos(s, it.riesgos), it.nota ? h('span', { class: 'chico suave' }, it.nota) : null),
      h('span', { class: 'chip ' + (it.costo ? 'sol' : '') }, it.costo ? '💰 ' + it.costo : 'gratis'))))), { cerrable: true });
  }

  // ¿Dónde hacés el acto? Entra entero en la pantalla: mapa arriba (se achica solo) y,
  // al tocar una provincia, salta el panel con lo que le pasa a esa provincia y al país.
  function elegirProvincia(s, a) {
    const c = s.camp;
    const mejor = R.camp.mejorActo(s);
    const panel = h('div', { class: 'acto-panel', hidden: true });
    const pista = h('p', { class: 'chico suave acto-pista' }, '💚 Más verde = más afín a vos, rinde más · ⭐ suma más votos');
    const pintar = (id) => {
      const p = R.PROV[id];
      const pr = R.camp.previaActo(s, id);
      const af = R.camp.afinidad(s, p);
      const vis = c.visitas[id] || 0;
      const [clAf, txAf] = af >= 1.15 ? ['bien', '💚 Afín a vos'] : af <= 0.85 ? ['mal', '💔 Poco afín'] : ['', '🤝 Medio afín'];
      const pesa = p.padron / 100;
      // Tablita: qué sube en la provincia y qué le llega al país (según lo que pesa en el padrón).
      const flechas = (v, paso) => (v < 0.25 ? '≈' : '▲'.repeat(Math.min(3, Math.max(1, Math.ceil(v / paso - 0.15)))));
      const num = (v) => R.fmt(v, v < 10 ? 1 : 0);
      const celda = (txt) => h('span', { class: 'fl' + (txt === '≈' ? ' nada' : '') }, txt);
      const fila = (nombre, dK, dS, antes, despues) => [
        h('span', { class: 'quien' }, nombre), celda(flechas(dK, 7)), celda(flechas(dS, 2)),
        h('span', { class: 'voto' }, num(antes) + ' → ', h('b', { class: despues - antes >= 0.05 ? 'sube' : '' }, num(despues) + '%')),
      ];
      const dK = pr.despues.conocen - pr.antes.conocen;
      const dS = pr.despues.simpatia - pr.antes.simpatia;
      const bloq = R.camp.bloqueo(s, a, id);
      pista.hidden = true;
      panel.replaceChildren(
        h('div', { class: 'acto-cab' },
          h('div', { class: 'acto-nombre' }, h('b', null, p.nombre),
            vis || pr.sube <= 0 ? h('small', null, pr.sube <= 0 ? '📍 Ya está a full' : '🎤 ' + (vis + 1) + '.ª vez: rinde menos') : null),
          h('span', { class: 'chip ' + clAf }, txAf)),
        h('div', { class: 'acto-tabla' },
          h('span'), h('span', { class: 'col', title: 'Conocimiento' }, '👁️'), h('span', { class: 'col', title: 'Imagen' }, '❤️'), h('span', { class: 'col' }, '🗳️ Te votan'),
          ...fila('📍 ' + p.corto, dK, dS, pr.antes.prov, pr.despues.prov),
          ...fila('🇦🇷 País', dK * pesa, dS * pesa, pr.antes.nac, pr.despues.nac)),
        ui.riesgos(s, a.riesgos(s, id)),
        h('button', { class: 'boton ancho', disabled: bloq ? true : null, title: bloq || null, onclick: () => { ui.cerrarCapa(); hacer(s, a.id, id); } },
          '🎤 Hacer el acto · ' + (bloq === 'No te alcanza la plata' ? '💸 Te falta plata' : '💰 ' + a.costo)));
      panel.hidden = false;
      panel.classList.remove('salta');
      void panel.offsetWidth; // reinicia la animación
      panel.classList.add('salta');
    };
    const mapa = R.ui.mapa({
      sinMalvinas: true,
      sinVecinos: true,
      recorte: true,
      // Más verde = piensan como vos (y no fuiste tanto): el acto rinde más.
      colorDe: (id) => R.ui.colorEscala('#1c9a50', R.clamp((R.camp.rindeActo(s, id) / 1.8) * 85, 5, 85)),
      valorDe: (id) => (id === mejor ? '⭐' : null),
      alTocar: (id) => {
        if (!R.PROV[id]) return;
        R.son.toque();
        R.ui.marcarMapa(mapa, id);
        pintar(id);
      },
    });
    ui.abrirCapa(h('div', { class: 'acto-elegir' },
      h('h2', null, '🎤 ¿Dónde es el acto?'),
      pista,
      h('div', { class: 'acto-cuerpo' }, h('div', { class: 'acto-mapa' }, mapa), panel)),
    { cerrable: true, sinFoco: true, clase: 'hoja-acto' });
  }

  function hacer(s, id, arg) {
    const res = R.camp.hacer(s, id, arg);
    if (res.error) {
      R.son.mal();
      ui.aviso('🚫 ' + res.error, { tipo: 'mal' });
      return;
    }
    R.guardar(s);
    const efectos = R.describirAplicado(s, res.aplicado);
    if (res.costo) efectos.unshift({ k: 'fondos', emoji: '💰', nombre: 'Fondos', v: -res.costo, sube: false, bueno: false, flechas: 1, numero: true });
    const linea = (txt, a0, a1) => {
      const dv = a1 - a0;
      return h('div', { class: 'chico', style: { fontWeight: 900 } }, txt + R.fmt(a0, 1) + '% → ',
        h('span', { style: { color: dv >= 0 ? 'var(--bien)' : 'var(--mal)' } }, R.fmt(a1, 1) + '% ' + (dv >= 0.05 ? '▲' : dv <= -0.05 ? '▼' : '')));
    };
    const extra = res.prov
      ? h('div', null, linea('🗳️ En ' + R.PROV[res.prov].corto + ': ', res.provAntes, res.provDespues), linea('🇦🇷 En el país: ', res.votosAntes, res.votosDespues))
      : linea('🗳️ Te votaría: ', res.votosAntes, res.votosDespues);
    ui.aviso(res.txt, { tipo: res.especial ? 'especial' : res.bueno ? 'bien' : 'mal', efectos, extra });
    if (res.especial) R.son.genial();
    else if (res.bueno) R.son.bien();
    else R.son.mal();
    ui.vista = Object.assign({}, ui.vista, { mantenerScroll: true });
    ui.render();
    ui.vista.mantenerScroll = false;
    const f = document.getElementById('rec-fondos');
    if (f) f.classList.add('pulso');
  }

  // ── Mapa ──
  function tarjetaMapa(s) {
    const votos = R.camp.votos(s).prov;
    const info = h('div', { class: 'pila' }, h('p', { class: 'centro suave chico' }, '👆 Tocá una provincia para ver quién gana ahí'));
    const mostrar = (id) => {
      if (!R.PROV[id]) {
        info.replaceChildren(h('div', { class: 'tarjeta plana suave centro' }, h('b', null, '🇦🇷 Islas Malvinas'), h('p', { class: 'chico' }, 'Fueron, son y serán argentinas.')));
        return;
      }
      const v = votos[id];
      const orden = Object.keys(v).sort((a, b) => v[b] - v[a]);
      info.replaceChildren(h('div', { class: 'tarjeta plana suave pila', style: { gap: '8px' } },
        h('div', { class: 'fila entre' }, h('b', { style: { fontFamily: 'var(--f-titulo)', fontWeight: 400, fontSize: '20px' } }, R.PROV[id].nombre),
          h('span', { class: 'chip' }, '📍 Apoyo local ' + R.fmt(s.camp.presencia[id]) + '%')),
        h('div', { class: 'encuesta' }, orden.slice(0, 3).map((k) => {
          const p = R.partidoInfo(s, k);
          return h('div', { class: 'linea' + (k === 'YO' ? ' yo' : '') }, ui.miniEscudo(p),
            h('div', null, h('div', { class: 'nombre' }, p.sigla), h('div', { class: 'barra' }, h('i', { style: { width: v[k] + '%', background: p.color } }))),
            h('div', { class: 'pct' }, R.fmt(v[k], 1)));
        }))));
    };
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'titulo-seccion' }, '🗺️ Dónde te votan'),
      R.ui.mapa({
        colorDe: (id) => (R.PROV[id] ? R.ui.colorEscala(s.partido.color, Math.min(100, votos[id].YO * 2.2)) : null),
        valorDe: (id) => (R.PROV[id] ? R.fmt(votos[id].YO, 0) + '%' : null),
        alTocar: (id) => { R.son.toque(); mostrar(id); },
      }),
      info);
  }

  // ── Encuesta ──
  function tarjetaEncuesta(s) {
    const enc = R.camp.encuesta(s);
    const ant = s.encuestas.length >= 2 ? s.encuestas[s.encuestas.length - 2] : null;
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, '📊 Encuesta'), h('span', { class: 'chip' }, R.fechaCorta(s.mes))),
      ui.encuesta(s, enc, { anterior: ant }),
      s.encuestas.length > 1 ? tendencia(s) : null,
      null);
  }

  // Línea de tu evolución mes a mes.
  function tendencia(s) {
    const S = R.svg;
    const pts = s.encuestas.map((e) => e.YO);
    const max = Math.max(10, ...pts) * 1.15;
    const W = 300;
    const H = 70;
    const x = (i) => 10 + (i * (W - 20)) / Math.max(1, pts.length - 1);
    const y = (v) => H - 8 - (v / max) * (H - 18);
    const linea = pts.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    return h('div', null, h('div', { class: 'etiqueta' }, 'Tu evolución'),
      S('svg', { viewBox: '0 0 ' + W + ' ' + H, style: 'width:100%;height:auto;display:block', role: 'img', 'aria-label': 'Evolución de tu intención de voto' },
        S('line', { x1: 10, x2: W - 10, y1: y(0), y2: y(0), stroke: '#c9d6e6', 'stroke-width': 1 }),
        S('path', { d: linea + ' L' + x(pts.length - 1) + ' ' + y(0) + ' L' + x(0) + ' ' + y(0) + ' Z', fill: ui.aclarar(s.partido.color, 0.75) }),
        S('path', { d: linea, fill: 'none', stroke: s.partido.color, 'stroke-width': 3, 'stroke-linejoin': 'round' }),
        S('circle', { cx: x(pts.length - 1), cy: y(pts[pts.length - 1]), r: 5, fill: s.partido.color, stroke: '#13284a', 'stroke-width': 2 }),
        S('text', { x: x(pts.length - 1) - 4, y: y(pts[pts.length - 1]) - 9, 'text-anchor': 'end', style: 'font-size:12px;font-weight:900;fill:#13284a' }, R.fmt(pts[pts.length - 1], 1) + '%')));
  }

  // ── Pasar el mes ──
  ui.pasarMes = function () {
    const s = ui.s;
    if (ui.hayCapa()) return;
    if (s.fase === 'campana' && s.camp.agenda > 0 && !ui.confirmoPasar) {
      ui.abrirCapa(h('div', { class: 'pila centro' },
        h('div', { style: { fontSize: '44px' } }, '⏱️'),
        h('h2', null, 'Te quedan ' + s.camp.agenda + (s.camp.agenda === 1 ? ' acción' : ' acciones')),
        h('p', null, 'Si pasás el mes, se pierden.'),
        h('button', { class: 'boton ancho', onclick: () => { ui.cerrarCapa(); } }, '🎯 Usarlas'),
        h('button', { class: 'boton sec ancho', onclick: () => { ui.confirmoPasar = true; ui.cerrarCapa(); ui.pasarMes(); } }, 'Pasar igual ▶')), { cerrable: true });
      return;
    }
    ui.confirmoPasar = false;
    const antes = s.fase === 'campana' ? R.camp.encuesta(s).YO : 0;
    R.son.tambor();
    R.turno.pasar(s);
    R.guardar(s);
    ui.vista = { tab: (ui.vista && ui.vista.tab) || (s.fase === 'gobierno' ? 'inicio' : 'acciones') };
    ui.render();
    window.scrollTo(0, 0);
    if (s.fase === 'campana') {
      const ahora = R.camp.encuesta(s).YO;
      const d = ahora - antes;
      ui.aviso('📅 ' + R.fechaTxt(s.mes) + ' · Encuesta: ' + R.fmt(ahora, 1) + '% ' + (d >= 0.05 ? '▲' : d <= -0.05 ? '▼' : '='), { tipo: d >= 0 ? 'bien' : 'mal', dur: 2200 });
    }
    ui.procesarCola();
  };
})(globalThis.R = globalThis.R || {});
