// Pantalla de gobierno: aprobación, la gente con cara, el país en 6 tarjetas tangibles y acciones.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;
  ui.momentos = ui.momentos || {};

  ui.PESTANAS_GOB = [
    { id: 'inicio', emoji: '🏠', nombre: 'Inicio' },
    { id: 'economia', emoji: '💰', nombre: 'Economía' },
    { id: 'diario', emoji: '📰', nombre: 'Diario' },
  ];
  ui.panelesGob = {};

  ui.pantallaGobierno = function (s) {
    const pc = ui.esPC();
    let tab = (ui.vista && ui.vista.tab) || 'inicio';
    if (!ui.PESTANAS_GOB.find((p) => p.id === tab)) tab = 'inicio';
    const paneles = {
      inicio: () => panelInicio(s, pc),
      economia: () => ui.panelEconomia(s),
      diario: () => h('section', { class: 'tarjeta pila' }, h('div', { class: 'titulo-seccion' }, '📰 Lo que pasó'), ui.historial(s, 60)),
    };
    Object.assign(paneles, ui.panelesGob);
    const guia = tab === 'inicio' ? ui.guia('gobierno', 'Cómo gobernar', [
      ['👥', 'Mirá a la gente', 'Tocá cada cara para ver qué le importa y por qué está contenta o enojada.'],
      ['💰', 'La economía va en %', 'Más plata a un área contenta a alguien, pero sube el déficit. Déficit pagado con emisión = inflación.'],
      ['⭐', 'Gastá capital político', 'En acciones, leyes, gobernadores y el mundo. Se recarga cada mes según tu aprobación.'],
      ['🔥', 'Cuidado con la crisis', 'Cada problema grave suma una llamita. Con 6 o más puede haber un estallido.'],
    ]) : null;
    const scroll = ui.montar(h('div', null, barraGobierno(s), guia, paneles[tab](s)), pc);
    if (ui.vista && ui.vista.mantenerScroll) window.scrollTo(0, scroll);
    ui.navInferior(ui.PESTANAS_GOB, tab, (id) => { R.son.toque(); ui.vista = { tab: id }; ui.render(); window.scrollTo(0, 0); },
      h('button', { class: 'boton grande ancho', id: 'btn-pasar', onclick: () => ui.pasarMes() }, '▶ Pasar el mes',
        h('span', { class: 'chip', style: { fontFamily: 'var(--f-texto)', fontSize: '12px' } }, '⭐ ' + s.gob.pc)));
  };

  // Redibuja sin mover el scroll (después de tocar algo).
  ui.refrescar = function () {
    ui.vista = Object.assign({}, ui.vista, { mantenerScroll: true });
    ui.render();
    ui.vista.mantenerScroll = false;
  };

  function barraGobierno(s) {
    const G = s.gob;
    const ant = G.historia.length >= 2 ? G.historia[G.historia.length - 2].aprob : G.aprob;
    const d = G.aprob - ant;
    return h('header', { class: 'barra-sup' },
      h('div', { class: 'quien' }, R.ui.avatar(s.lider.avatar, { size: 42, banda: true, humor: R.humorAvatar(G.aprob) }),
        h('div', { style: { minWidth: 0 } }, h('b', null, R.cap(R.MESES_CORTOS[R.mesDelAnio(s.mes)]) + ' ' + R.anio(s.mes)), h('small', null, 'Presidencia de ' + s.lider.nombre))),
      h('span', { class: 'recurso', title: 'Capital político: lo gastás en acciones y leyes' }, '⭐ ', h('span', { class: 'numero' }, String(G.pc))),
      h('span', { class: 'recurso', title: 'Aprobación', style: { background: G.aprob >= 50 ? 'var(--bien-claro)' : G.aprob < 30 ? 'var(--mal-claro)' : 'var(--papel-2)' } },
        '👍 ', h('span', { class: 'numero' }, R.fmt(G.aprob) + '%'), Math.abs(d) >= 0.5 ? h('span', { style: { color: d > 0 ? 'var(--bien)' : 'var(--mal)', fontSize: '11px' } }, d > 0 ? '▲' : '▼') : null),
      h('button', { class: 'boton mini sec', onclick: () => ui.menu(), 'aria-label': 'Menú' }, '☰'));
  }

  // ── Inicio ──
  function panelInicio(s, pc) {
    const izq = [tarjetaAprobacion(s), tarjetaGente(s)];
    const der = [tarjetaPais(s), tarjetaAcciones(s)];
    if (pc) return h('div', { class: 'columnas' }, h('div', { class: 'col-izq pila' }, izq), h('div', { class: 'pila' }, der));
    return h('div', { class: 'pila' }, izq[0], izq[1], der[0], der[1]);
  }

  function tarjetaAprobacion(s) {
    const G = s.gob;
    const llamas = R.gob.llamas(s);
    const prox = proximaEleccionGob(s);
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'fila entre', style: { alignItems: 'flex-end' } },
        h('div', null, h('div', { class: 'etiqueta' }, 'Aprobación'),
          h('div', { style: { fontFamily: 'var(--f-titulo)', fontSize: '48px', lineHeight: 1, color: G.aprob >= 50 ? 'var(--bien)' : G.aprob < 30 ? 'var(--mal)' : 'var(--tinta)' }, class: 'numero' },
            R.fmt(G.aprob), h('span', { style: { fontSize: '24px' } }, ' %'))),
        h('button', { class: 'chip toque', style: { cursor: 'pointer', background: llamas.length >= 4 ? 'var(--mal-claro)' : llamas.length ? 'var(--sol-claro)' : 'var(--bien-claro)' }, onclick: () => verLlamas(s) },
          llamas.length ? '🔥'.repeat(Math.min(5, llamas.length)) + (llamas.length > 5 ? ' ×' + llamas.length : '') + ' Crisis' : '🧯 Sin crisis')),
      ui.sparkline(G.historia.map((x) => x.aprob), { color: 'var(--celeste)', max: 100, alto: 54, etiqueta: '%' }),
      prox ? h('div', { class: 'fila', style: { gap: '8px' } }, h('span', { style: { fontSize: '22px' } }, prox.emoji),
        h('div', null, h('b', null, prox.nombre), h('div', { class: 'chico suave' }, prox.faltan === 0 ? '¡Este mes!' : 'Faltan ' + prox.faltan + (prox.faltan === 1 ? ' mes' : ' meses')))) : null);
  }

  function proximaEleccionGob(s) {
    const y0 = R.anio(s.mes);
    for (let y = y0; y <= y0 + 4; y++) {
      const m = R.mesNum(y, 9);
      if (m < s.mes) continue;
      if (y % 4 === 1) return { faltan: m - s.mes, nombre: 'Elecciones de medio término', emoji: '🗳️' };
      if (y % 4 === 3) {
        const fin = s.gob.mandato >= 2 && !s.gob.leyes.re_reeleccion;
        return { faltan: m - s.mes, nombre: fin ? 'Fin de tu mandato' : 'Elecciones presidenciales', emoji: fin ? '🏁' : '🏆' };
      }
    }
    return null;
  }

  function verLlamas(s) {
    const llamas = R.gob.llamas(s);
    const vistos = new Set();
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, '🔥 Termómetro de crisis'),
      h('p', { class: 'chico suave' }, 'Cada llamita es un problema grave. Con 6 o más, puede haber un estallido.'),
      h('div', { class: 'barra gorda' }, h('i', { style: { width: Math.min(100, llamas.length * 10) + '%', background: llamas.length >= 6 ? 'var(--mal)' : 'var(--sol)' } })),
      llamas.length ? h('div', { class: 'lista-elegir' }, llamas.filter((l) => !vistos.has(l.id) && vistos.add(l.id)).map((l) =>
        h('div', { class: 'item-elegir', style: { cursor: 'default' } }, h('span', { class: 'ic' }, l.emoji),
          h('div', null, h('b', null, l.txt), h('div', { class: 'chico suave' }, '🧯 ' + l.arreglo)), h('span', null, '🔥'))))
        : h('p', { class: 'centro' }, '🧯 Todo bajo control. ¡Seguí así!')), { cerrable: true });
  }

  // La gente: 6 personajes con su cara.
  function tarjetaGente(s) {
    const G = s.gob;
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, '👥 La gente'), h('span', { class: 'chico suave' }, 'Tocá a cada uno · ', h('span', { class: 'critico-mini' }, '🛒'), ' = lo que más lo enoja')),
      h('div', { class: 'gente' }, R.GRUPOS.map((g) => {
        const st = G.grupos[g.id];
        const d = st.humor - (st.antes ?? st.humor);
        const peor = puntoCritico(s, g.id);
        return h('button', { class: 'persona toque', onclick: () => verGrupo(s, g.id), 'aria-label': g.nombre + ': ' + Math.round(st.humor) + ' de 100' + (peor ? '. Lo que más lo enoja: ' + RAZON(peor.k)[1] : '') },
          peor ? h('span', { class: 'critico', title: 'Lo que más lo enoja: ' + RAZON(peor.k)[1] }, RAZON(peor.k)[0]) : null,
          R.ui.avatar(g.avatar, { size: 56, humor: R.humorAvatar(st.humor), fondo: colorHumor(st.humor) }),
          h('span', { class: 'nom' }, g.emoji + ' ' + g.nombre),
          h('span', { class: 'barra', style: { height: '8px', width: '100%' } }, h('i', { style: { width: st.humor + '%', background: colorHumorFuerte(st.humor) } })),
          Math.abs(d) >= 1 ? h('span', { class: 'delta ' + (d > 0 ? 'sube' : 'baja') }, d > 0 ? '▲' : '▼') : null);
      })));
  }
  const colorHumor = (v) => (v >= 62 ? '#d5f5e1' : v >= 42 ? '#eef3f9' : v >= 28 ? '#fde9c9' : '#fde0df');
  const colorHumorFuerte = (v) => (v >= 62 ? 'var(--bien)' : v >= 42 ? 'var(--celeste)' : v >= 28 ? 'var(--sol)' : 'var(--mal)');
  ui.colorHumor = colorHumor;

  R.RAZONES = {
    inflacion: ['🛒', 'Precios'], empleo: ['🚪', 'Trabajo'], salario: ['💰', 'Sueldo'], obras: ['🏗️', 'Obra pública'], retenciones: ['🌾', 'Retenciones'],
    cepo: ['🔒', 'Cepo'], crecimiento: ['📈', 'Economía'], rutas: ['🛣️', 'Rutas'], impuestos: ['🧾', 'Impuestos'], riesgo: ['📊', 'Confianza'],
    seguridad: ['👮', 'Seguridad'], educacion: ['🎓', 'Escuelas'], salud: ['🏥', 'Salud'], social: ['🤲', 'Ayuda social'], subsidios: ['💡', 'Tarifas'],
    pobreza: ['🏚️', 'Pobreza'], jubilaciones: ['👵', 'Lo que cobra'], ideas: ['💭', 'Tus ideas'], leyes: ['📜', 'Tus leyes'],
  };
  const RAZON = (k) => R.RAZONES[k] || ['•', k];
  // Lo que más lo enoja (si de verdad lo enoja). «Tus ideas» no cuenta: es fijo, no es algo que pase.
  function puntoCritico(s, id) {
    const { partes } = R.gob.objetivoGrupo(s, id);
    const peor = partes.filter((p) => p.k !== 'ideas').sort((a, b) => a.v - b.v)[0];
    return peor && peor.v <= -4 ? peor : null;
  }
  const humorTxt = (v) => (v >= 70 ? 'Contento' : v >= 56 ? 'Conforme' : v >= 42 ? 'Ni fu ni fa' : v >= 28 ? 'Enojado' : 'Furioso');

  // El dato concreto detrás de cada motivo («34 % al año», «8 de cada 100 sin trabajo»…).
  function datoRazon(s, id, k) {
    const e = s.eco;
    const q = e.calidad;
    const m = e.niveles;
    const nivel = (a) => R.eco.nivelTxt(m[a]);
    const calidad = (x) => 'calidad ' + Math.round(x) + '/100';
    const real = (a) => {
      const d = (m[a] * R.eco.torta(s) - 1) * 100;
      return Math.abs(d) < 0.5 ? 'igual que al asumir' : R.fmt(Math.abs(d), 0) + '% ' + (d > 0 ? 'más' : 'menos') + ' que al asumir';
    };
    switch (k) {
      case 'inflacion': return R.fmt(e.inflAnual) + '% al año';
      case 'empleo': return R.fmt(e.desempleo, 1) + '% sin trabajo';
      case 'salario': { const d = e.salarioReal - 100; return Math.abs(d) < 0.5 ? 'rinde igual que al asumir' : 'rinde ' + R.fmt(Math.abs(d), 0) + '% ' + (d > 0 ? 'más' : 'menos') + ' que al asumir'; }
      case 'obras': return nivel('obras');
      case 'retenciones': return R.eco.RETENCIONES[e.retenciones].nombre;
      case 'cepo': return e.cepo ? 'hay cepo al dólar' : 'sin cepo';
      case 'crecimiento': return (e.crec >= 0 ? 'crece ' : 'cae ') + R.fmt(Math.abs(e.crec), 1) + '% por año';
      case 'rutas': return calidad(q.infra);
      case 'impuestos': return 'impuestos ' + R.eco.IMPUESTOS[e.impuestos].nombre.toLowerCase();
      case 'riesgo': return 'riesgo país ' + R.fmt(e.riesgo);
      case 'seguridad': return calidad(q.seguridad);
      case 'educacion': return calidad(q.educacion);
      case 'salud': return calidad(q.salud);
      case 'social': return id === 'humildes' ? 'plata real: ' + real('social') : nivel('social');
      case 'subsidios': return nivel('subsidios');
      case 'jubilaciones': return 'plata real: ' + real('jubilaciones');
      case 'pobreza': return R.fmt(e.pobreza) + '% de pobres';
      case 'ideas': { const d = Math.abs(R.GRUPO[id].ideo - s.partido.ideo); return d < 0.3 ? 'piensa parecido a vos' : d < 0.7 ? 'piensa algo distinto a vos' : 'piensa muy distinto a vos'; }
      case 'leyes': return 'por leyes que pasaste';
      default: return '';
    }
  }

  // Ficha de un grupo: cómo está, a dónde va, lo que más lo enoja y, motivo por motivo, cuánto le suma o le resta
  // (barra que sale del centro: a la izquierda en rojo le resta, a la derecha en verde le suma), con el dato real.
  function verGrupo(s, id) {
    const g = R.GRUPO[id];
    const st = s.gob.grupos[id];
    const { obj, partes } = R.gob.objetivoGrupo(s, id);
    const ESCALA = 16; // puntos de humor que llenan media barra (raíz: las chicas también se ven)
    const ideas = partes.find((p) => p.k === 'ideas');
    const resta = partes.filter((p) => p.v <= -1).sort((a, b) => a.v - b.v);
    const suma = partes.filter((p) => p.v >= 1).sort((a, b) => b.v - a.v);
    const igual = partes.filter((p) => Math.abs(p.v) < 1 && p.k !== 'ideas');
    const fila = (p) => {
      const r = RAZON(p.k);
      const ancho = Math.min(50, Math.sqrt(Math.abs(p.v) / ESCALA) * 50);
      return h('div', { class: 'motivo' },
        h('span', { class: 'em' }, r[0]),
        h('span', { class: 'txt' }, h('b', null, r[1], p.k === 'ideas' ? h('span', { class: 'fijo' }, 'no cambia') : null), h('small', null, datoRazon(s, id, p.k))),
        h('span', { class: 'balanza-motivo', title: (p.v > 0 ? 'Le suma ' : 'Le resta ') + Math.round(Math.abs(p.v)) },
          h('i', { class: p.v > 0 ? 'suma' : 'resta', style: p.v > 0 ? { left: '50%', width: ancho + '%' } : { right: '50%', width: ancho + '%' } })));
    };
    const va = obj - st.humor;
    const peores = resta.filter((p) => p.v <= -3 && p.k !== 'ideas').slice(0, 2);
    const porIdeas = !peores.length && ideas && ideas.v <= -3;
    ui.abrirCapa(h('div', { class: 'pila' },
      h('div', { class: 'fila', style: { alignItems: 'center' } }, R.ui.avatar(g.avatar, { size: 76, humor: R.humorAvatar(st.humor), fondo: colorHumor(st.humor) }),
        h('div', { style: { minWidth: 0, flex: 1 } }, h('h2', { style: { margin: 0 } }, g.personaje), h('div', { class: 'chico suave' }, g.emoji + ' ' + g.oficio + ' · ' + g.nombre),
          h('div', { class: 'humor-medidor' },
            h('span', { class: 'barra' }, h('i', { style: { width: st.humor + '%', background: colorHumorFuerte(st.humor) } }), h('b', { class: 'marca-va', style: { left: R.clamp(obj, 0, 100) + '%' }, title: 'Hacia dónde va' })),
            h('span', { class: 'chico', style: { fontWeight: 900 } }, R.cara(st.humor) + ' ' + humorTxt(st.humor))),
          h('div', { class: 'chico', style: { fontWeight: 800, color: va > 2 ? 'var(--bien)' : va < -2 ? 'var(--mal)' : 'var(--tinta-suave)' } },
            va > 2 ? '📈 Va a mejorar' : va < -2 ? '📉 Va a empeorar' : '➡️ Se mantiene'))),
      peores.length ? h('div', { class: 'critico-caja' }, h('b', null, '😠 Lo que más lo enoja'),
        h('div', null, peores.map((p) => h('span', { class: 'chip mal' }, RAZON(p.k)[0] + ' ' + RAZON(p.k)[1] + ': ' + datoRazon(s, id, p.k)))))
        : porIdeas ? h('div', { class: 'critico-caja' }, h('b', null, '💭 Lo que más le resta: no le gustan tus ideas'), h('span', { class: 'chico' }, 'Eso no cambia; lo podés compensar con lo que sí le importa.'))
          : h('div', { class: 'critico-caja bien' }, h('b', null, '🙂 No tiene quejas grandes')),
      resta.length ? h('div', { class: 'etiqueta' }, '😠 Le resta') : null,
      resta.length ? h('div', { class: 'motivos' }, resta.map(fila)) : null,
      suma.length ? h('div', { class: 'etiqueta' }, '🙂 Le suma') : null,
      suma.length ? h('div', { class: 'motivos' }, suma.map(fila)) : null,
      igual.length ? h('p', { class: 'chico suave' }, '😐 Por ahora no le pesan: ' + igual.map((p) => RAZON(p.k).join(' ')).join(' · ')) : null,
      h('p', { class: 'chico suave' }, '🗳️ ' + g.nombre + ': pesa ' + g.peso + ' de cada 100 votos. La rayita negra de arriba es hacia dónde va su humor.')), { cerrable: true });
  }



  // ── El país en 6 tarjetas tangibles ──
  ui.indicadores = function (s) {
    const e = s.eco;
    const hist = s.gob.historia;
    const ant = hist.length >= 2 ? hist[hist.length - 2] : null;
    const dif = (k) => (ant ? e[k] - ant[k] : 0);
    const pobres = Math.round(e.pobreza / 10);
    return [
      { id: 'inflacion', emoji: '🛒', nombre: 'Changuito', valor: '$ ' + R.fmt(e.changuito), sub: '+' + R.fmt(e.inflMes, 1) + '% este mes · ' + R.fmt(e.inflAnual) + '% al año', d: e.inflMes - (ant ? (s.gob.historia[hist.length - 2].inflMes) : e.inflMes), malo: true, umbral: 0.05 },
      { id: 'crecimiento', emoji: e.crec >= 0 ? '📈' : '📉', nombre: 'Economía', valor: (e.crec >= 0 ? 'Crece ' : 'Cae ') + R.fmt(Math.abs(e.crec), 1) + '%', sub: 'por año', d: dif('crec'), umbral: 0.1 },
      { id: 'desempleo', emoji: '🚪', nombre: 'Trabajo', valor: Math.round(e.desempleo) + ' de cada 100', sub: 'no consiguen trabajo', d: dif('desempleo'), malo: true, umbral: 0.1 },
      { id: 'pobreza', emoji: '🏚️', nombre: 'Pobreza', valor: pobres + ' de cada 10', sub: 'son pobres (' + R.fmt(e.pobreza) + '%)', d: dif('pobreza'), malo: true, umbral: 0.2,
        extra: h('div', { class: 'munecos', 'aria-hidden': 'true' }, Array.from({ length: 10 }, (_, i) => h('span', { class: i < pobres ? 'pobre' : '' }, '🧍'))) },
      { id: 'dolar', emoji: '💵', nombre: 'Dólar', valor: '$ ' + R.fmt(e.dolar), sub: e.cepo ? '🔒 Blue: $ ' + R.fmt(e.dolar * (1 + e.brecha / 100)) : 'libre', d: ant ? ((e.dolar / ant.dolar - 1) * 100) - e.inflMes : 0, malo: true, umbral: 1 },
      { id: 'reservas', emoji: '🏦', nombre: 'Reservas', valor: 'US$ ' + R.fmt(Math.max(0, e.reservas), 0) + ' mil M', sub: e.reservas < 10 ? '⚠️ ¡casi vacías!' : 'en el Banco Central', d: dif('reservas'), umbral: 0.3,
        extra: h('div', { class: 'barra', style: { height: '8px' } }, h('i', { style: { width: R.clamp(e.reservas / 60 * 100, 0, 100) + '%', background: e.reservas < 10 ? 'var(--mal)' : 'var(--bien)' } })) },
    ];
  };

  function tarjetaPais(s) {
    const e = s.eco;
    return h('section', { class: 'tarjeta pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, '🇦🇷 El país'), h('span', { class: 'chico suave' }, 'Tocá para ver por qué')),
      h('div', { class: 'pais' }, ui.indicadores(s).map((x) => {
        const mejora = x.malo ? x.d < -x.umbral : x.d > x.umbral;
        const empeora = x.malo ? x.d > x.umbral : x.d < -x.umbral;
        return h('button', { class: 'indicador toque', onclick: () => ui.porQue(s, x.id) },
          h('div', { class: 'fila entre' }, h('span', { class: 'em' }, x.emoji), mejora ? h('span', { class: 'chip bien' }, '▲ mejora') : empeora ? h('span', { class: 'chip mal' }, '▼ empeora') : null),
          h('div', { class: 'nom' }, x.nombre),
          h('div', { class: 'val' }, x.valor),
          h('div', { class: 'sub' }, x.sub),
          x.extra || null);
      })),
      h('div', { class: 'fila envolver chico', style: { gap: '6px' } },
        h('span', { class: 'chip' }, '💳 Deuda ' + R.fmt(e.deuda) + '% del PBI'),
        h('span', { class: 'chip' }, '📊 Riesgo país ' + R.fmt(e.riesgo)),
        h('span', { class: 'chip ' + (R.eco.resultado(s) >= 0 ? 'bien' : 'mal') }, '⚖️ ' + (R.eco.resultado(s) >= 0 ? 'Superávit ' : 'Déficit ') + R.fmt(Math.abs(R.eco.resultado(s)), 1) + '%')));
  }

  // «¿Por qué?»: las causas de cada indicador, con barras.
  ui.porQue = function (s, id) {
    const e = s.eco;
    const C = e.causas || {};
    const bloques = {
      inflacion: { t: '🛒 ¿Por qué suben los precios?', lista: C.inflacion, dic: R.CAUSAS.inflacion, malo: true, nota: 'Lo que más baja la inflación: no tener déficit, no emitir y tener reservas.' },
      crecimiento: { t: '📈 ¿Por qué crece (o no) la economía?', lista: C.crecimiento, dic: R.CAUSAS.crecimiento, nota: 'Obra pública, impuestos bajos, confianza y exportaciones la empujan.' },
      desempleo: { t: '🚪 ¿Por qué hay (o no) trabajo?', lista: C.crecimiento, dic: R.CAUSAS.crecimiento, nota: 'El empleo sigue a la economía: si crece, se contrata gente.' },
      pobreza: { t: '🏚️ ¿Por qué hay pobreza?', lista: C.pobreza, dic: R.CAUSAS.pobreza, malo: true, nota: 'Trabajo, sueldos que le ganen a los precios y ayuda social la bajan.' },
      reservas: { t: '🏦 ¿Por qué entran o salen dólares?', lista: C.reservas, dic: R.CAUSAS.reservas, nota: 'Exportar más (retenciones bajas, campo contento) y no tener fuga.' },
      dolar: { t: '💵 ¿Por qué se mueve el dólar?', lista: [{ k: 'inercia', v: e.inflMes }, { k: 'dolar', v: (C.inflacion || []).find((x) => x.k === 'dolar')?.v || 0 }], dic: { inercia: ['🛒', 'Acompaña a la inflación'], dolar: ['🏦', 'Faltan reservas o hay desconfianza'] }, malo: true, nota: e.cepo ? 'Con cepo aparece el dólar blue: la brecha crece si hay inflación y faltan reservas.' : 'Sin cepo, si falta confianza la gente compra dólares y se van las reservas.' },
    };
    const b = bloques[id];
    if (!b) return;
    const lista = (b.lista || []).filter((x) => Math.abs(x.v) >= 0.02).sort((a, c) => Math.abs(c.v) - Math.abs(a.v));
    const max = Math.max(0.1, ...lista.map((x) => Math.abs(x.v)));
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', null, b.t),
      lista.length ? h('div', { class: 'razones' }, lista.map((x) => {
        const [em, txt] = b.dic[x.k] || ['•', x.k];
        const bueno = b.malo ? x.v < 0 : x.v > 0;
        return h('div', { class: 'razon' }, h('span', { class: 'em' }, em), h('span', null, txt),
          h('span', { class: 'barrita' }, h('i', { style: { width: (Math.abs(x.v) / max) * 100 + '%', background: bueno ? 'var(--bien)' : 'var(--mal)' } })),
          h('span', { style: { fontWeight: 900, color: bueno ? 'var(--bien)' : 'var(--mal)' } }, x.v > 0 ? '▲' : '▼'));
      })) : h('p', { class: 'suave' }, 'Pasá un mes para ver las causas.'),
      h('p', { class: 'chico tarjeta plana suave' }, '💡 ' + b.nota),
      h('div', { class: 'etiqueta' }, 'Últimos meses'),
      ui.sparkline(s.gob.historia.map((x) => ({ inflacion: x.inflMes, crecimiento: x.crec, desempleo: x.desempleo, pobreza: x.pobreza, reservas: x.reservas, dolar: x.dolar }[id])), { color: 'var(--tinta)', alto: 60 })), { cerrable: true });
  };

  // ── Acciones de gobierno (⭐) ──
  function tarjetaAcciones(s) {
    return h('section', { class: 'pila' },
      h('div', { class: 'fila entre' }, h('div', { class: 'titulo-seccion' }, '⭐ Acciones de gobierno'), h('span', { class: 'chip sol' }, '⭐ ' + s.gob.pc + ' disponibles')),
      h('div', { class: 'acciones' }, R.gob.ACCIONES.map((a) => {
        const b = R.gob.bloqueoAccion(s, a);
        const ef = Object.assign({}, a.ef, a.gasto ? { gastoExtra: a.gasto } : {});
        return h('button', { class: 'accion', disabled: b ? true : null, onclick: () => hacerAccion(s, a.id) },
          h('div', { class: 'cab' }, h('span', { class: 'ic' }, a.emoji), h('span', { class: 'nom' }, a.nombre)),
          h('div', { class: 'desc' }, a.desc),
          ui.chipsEfectos(R.gob.describirEfectos(s, ef), { compacto: true, antes: h('span', { class: 'chip sol' }, '⭐ ' + a.pc) }),
          a.azar ? ui.riesgos(s, [{ p: a.azar.p, bueno: false, txt: 'Puede salir mal', ef: a.azar.ef }]) : null,
          b ? h('div', { class: 'bloq' }, b) : null);
      })));
  }

  function hacerAccion(s, id) {
    const res = R.gob.hacer(s, id);
    if (res.error) { R.son.mal(); ui.aviso('🚫 ' + res.error, { tipo: 'mal' }); return; }
    ui.mostrarResultado(s, res);
  }

  // Aviso de resultado con efectos y cambio de aprobación.
  ui.mostrarResultado = function (s, res) {
    R.guardar(s);
    const efectos = R.describirAplicado(s, res.aplicado);
    const d = res.aprobDespues - res.aprobAntes;
    const extra = h('div', { class: 'chico', style: { fontWeight: 900 } }, '👍 Aprobación: ' + R.fmt(res.aprobAntes, 1) + '% → ',
      h('span', { style: { color: d >= 0 ? 'var(--bien)' : 'var(--mal)' } }, R.fmt(res.aprobDespues, 1) + '% ' + (d >= 0.05 ? '▲' : d <= -0.05 ? '▼' : '')));
    ui.aviso(res.txt, { tipo: res.bueno ? 'bien' : 'mal', efectos, extra });
    if (res.bueno) R.son.bien(); else R.son.mal();
    ui.refrescar();
    setTimeout(() => ui.procesarCola(), 1900);
  };

  // Mini gráfico de línea.
  ui.sparkline = function (vals, opts) {
    opts = opts || {};
    const S = R.svg;
    vals = vals.filter((v) => typeof v === 'number' && isFinite(v));
    if (vals.length < 2) return h('p', { class: 'chico suave' }, 'Todavía no hay historia.');
    const W = 300;
    const H = opts.alto || 60;
    const min = opts.min ?? Math.min(0, ...vals);
    const max = opts.max ?? Math.max(...vals) * 1.1 + 0.01;
    const x = (i) => 8 + (i * (W - 16)) / (vals.length - 1);
    const y = (v) => H - 6 - ((v - min) / (max - min || 1)) * (H - 14);
    const d = vals.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    const ult = vals[vals.length - 1];
    return S('svg', { viewBox: '0 0 ' + W + ' ' + H, style: 'width:100%;height:auto;display:block', role: 'img', 'aria-label': 'Evolución' },
      opts.max === 100 ? S('line', { x1: 8, x2: W - 8, y1: y(50), y2: y(50), stroke: '#c9d6e6', 'stroke-dasharray': '4 4' }) : null,
      S('path', { d: d + ' L' + x(vals.length - 1) + ' ' + (H - 6) + ' L' + x(0) + ' ' + (H - 6) + ' Z', fill: 'rgba(108,180,234,0.18)' }),
      S('path', { d, fill: 'none', stroke: opts.color || 'var(--tinta)', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
      S('circle', { cx: x(vals.length - 1), cy: y(ult), r: 4.5, fill: opts.color || 'var(--tinta)', stroke: '#13284a', 'stroke-width': 2 }));
  };

  // ── Momentos del gobierno ──
  ui.momentos.ministro = function (s, m, listo) {
    ui.abrirCapa(h('div', { class: 'pila' },
      h('h2', { class: 'centro' }, '🧑‍💼 ¿Quién maneja la economía?'),
      h('p', { class: 'centro chico suave' }, 'Tu primera gran decisión. Se puede cambiar después (cuesta ⭐ 4).'),
      h('div', { class: 'lista-elegir' }, Object.entries(R.MINISTROS).map(([id, mi]) =>
        h('button', { class: 'item-elegir', style: { gridTemplateColumns: '64px minmax(0,1fr)' }, onclick: () => {
          const aplicado = R.gob.elegirMinistro(s, id);
          R.guardar(s);
          ui.cerrarCapa();
          R.son.bien();
          ui.aviso(mi.emoji + ' ' + mi.nombre + ' asume en Economía', { tipo: 'bien', efectos: R.describirAplicado(s, aplicado) });
          listo();
        } },
        R.ui.avatar(mi.avatar, { size: 60 }),
        h('div', { class: 'pila', style: { gap: '4px' } }, h('b', null, mi.emoji + ' ' + mi.tipo + ' · ' + mi.nombre), h('span', { class: 'chico' }, mi.desc),
          ui.chipsEfectos(R.gob.describirEfectos(s, Object.assign({}, mi.impacto, mi.ancla ? { inflacion: -mi.ancla } : {}, mi.crec ? { crec: mi.crec } : {})), { compacto: true })))))));
  };

  ui.momentos.resumen = function (s, m, listo) {
    const a = m.antes;
    const d = m.despues;
    const fila = (em, nom, va, vd, fmt, malo, umbral) => {
      const dif = vd - va;
      const sube = dif > (umbral || 0.05);
      const baja = dif < -(umbral || 0.05);
      const bueno = malo ? baja : sube;
      return h('div', { class: 'fila-resumen' }, h('span', { class: 'em' }, em), h('span', { class: 'nom' }, nom), h('span', { class: 'val numero' }, fmt(vd)),
        h('span', { class: 'chip ' + (sube || baja ? (bueno ? 'bien' : 'mal') : '') }, sube ? '▲' : baja ? '▼' : '='));
    };
    const causaInfl = (s.eco.causas.inflacion || []).filter((x) => x.k !== 'inercia').sort((x, y) => Math.abs(y.v) - Math.abs(x.v))[0];
    const causaCrec = (s.eco.causas.crecimiento || []).sort((x, y) => Math.abs(y.v) - Math.abs(x.v))[0];
    const porque = [];
    if (causaInfl && Math.abs(causaInfl.v) > 0.1) {
      const c = R.CAUSAS.inflacion[causaInfl.k];
      porque.push(h('div', { class: 'porque' }, '🛒 Precios ', h('b', { style: { color: causaInfl.v > 0 ? 'var(--mal)' : 'var(--bien)' } }, causaInfl.v > 0 ? '▲' : '▼'), ' por ', c[0] + ' ' + c[1].toLowerCase()));
    }
    if (causaCrec && Math.abs(causaCrec.v) > 0.2) {
      const c = R.CAUSAS.crecimiento[causaCrec.k];
      porque.push(h('div', { class: 'porque' }, '📈 Economía ', h('b', { style: { color: causaCrec.v > 0 ? 'var(--bien)' : 'var(--mal)' } }, causaCrec.v > 0 ? '▲' : '▼'), ' por ', c[0] + ' ' + c[1].toLowerCase()));
    }
    const da = m.aprobDespues - m.aprobAntes;
    const reaccion = m.reaccion && Object.keys(m.reaccion).length ? R.gob.describirEfectos(s, m.reaccion) : null;
    const contenido = h('div', { class: 'pila' },
      h('div', { class: 'diario-cab' }, h('span', { class: 'marca' }, '📅 ' + R.fechaTxt(s.mes)), h('span', { class: 'chico suave' }, 'Resumen del mes')),
      h('div', { class: 'fila entre' },
        h('div', null, h('div', { class: 'etiqueta' }, 'Aprobación'), h('div', { style: { fontFamily: 'var(--f-titulo)', fontSize: '40px', lineHeight: 1 }, class: 'numero' }, R.fmt(m.aprobDespues), h('span', { style: { fontSize: '20px' } }, ' %'))),
        h('span', { class: 'chip ' + (da >= 0 ? 'bien' : 'mal'), style: { fontSize: '16px' } }, (da >= 0 ? '▲ ' : '▼ ') + R.fmt(Math.abs(da), 1))),
      reaccion ? h('div', { class: 'pila', style: { gap: '4px' } }, h('div', { class: 'etiqueta' }, 'Reacción a tus cambios'), ui.chipsEfectos(reaccion)) : null,
      h('div', { class: 'resumen-filas' },
        fila('🛒', 'Changuito $ ' + R.fmt(d.changuito), a.inflMes, d.inflMes, (v) => '+' + R.fmt(v, 1) + '%', true, 0.1),
        fila(d.crec >= 0 ? '📈' : '📉', 'Economía', a.crec, d.crec, (v) => R.signo(v, 1) + '%', false, 0.1),
        fila('🚪', 'Desempleo', a.desempleo, d.desempleo, (v) => R.fmt(v, 1) + '%', true, 0.05),
        fila('🏚️', 'Pobreza', a.pobreza, d.pobreza, (v) => R.fmt(v, 1) + '%', true, 0.1),
        fila('🏦', 'Reservas', a.reservas, d.reservas, (v) => 'US$ ' + R.fmt(v, 0) + ' mil M', false, 0.3)),
      porque.length ? h('div', { class: 'pila', style: { gap: '4px' } }, h('div', { class: 'etiqueta' }, '¿Por qué?'), porque) : null,
      m.frases && m.frases.length ? h('div', { class: 'pila', style: { gap: '8px' } }, h('div', { class: 'etiqueta' }, '🗣️ La gente dice'),
        m.frases.map((f) => {
          const g = R.GRUPO[f.grupo];
          const st = s.gob.grupos[f.grupo];
          return h('div', { class: 'dicho' }, R.ui.avatar(g.avatar, { size: 44, humor: R.humorAvatar(st.humor), fondo: colorHumor(st.humor) }),
            h('div', { class: 'globo ' + (f.bueno ? 'bien' : 'mal') }, h('b', null, g.personaje + ': '), f.txt));
        })) : null,
      h('button', { class: 'boton grande ancho', autofocus: true, onclick: () => { ui.cerrarCapa(); listo(); } }, 'Seguir ▶'));
    ui.abrirCapa(contenido, { clase: 'diario-hoja' });
    if (da <= -3) ui.temblor(document.querySelector('.hoja'));
  };
})(globalThis.R = globalThis.R || {});
