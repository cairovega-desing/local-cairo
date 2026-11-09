// El mundo: relaciones, tratados, préstamos, alianzas, guerra (frente tira y afloja), anexiones y Malvinas.
(function (R) {
  'use strict';

  const mun = (R.mundo = {});

  mun.iniciar = function (s) {
    const paises = {};
    for (const p of R.PAISES) {
      const afin = 18 * (0.5 - Math.abs(p.ideo - s.partido.ideo));
      paises[p.id] = { rel: R.clamp(Math.round(p.rel + afin), 0, 100), tratado: false, alianza: false, sancion: false, anexado: false, enfr: {} };
    }
    s.mundo = { paises, guerra: null, malvinas: { soberania: 0, recuperadas: false }, poderExtra: 0, resistencia: 0, panico: 0, pactos: [], noticias: [] };
  };

  // ── Comercio por país ──
  // Cuánto de lo que un país compra producís vos (1 = como al asumir). Si importás energía, no tenés para venderle.
  const SECTOR_DE = { granos: 'campo', energia: 'energia', manufacturas: 'industria', software: 'tecno' };
  mun.mezcla = function (s, id) {
    const compra = R.COMPRA[id] || [];
    if (!compra.length || !s.prod || !R.prod) return 1;
    const v = compra.map((k) => {
      const sec = SECTOR_DE[k];
      let f = (R.prod.nivel(s, sec) / R.SECTOR[sec].nivel0) * R.prod.precio(s, k);
      const saldo = R.prod.energia(s).saldo;
      if (k === 'energia' && saldo < 0) f *= R.clamp(1 + saldo * 0.25, 0.5, 1);
      return f;
    });
    return R.sum(v) / v.length;
  };
  // Lo que suman (o restan) tus tratados según cuánto les vendés de lo que compran (se suma a eco.factorExpo).
  mun.extraComercio = function (s) {
    if (!s.mundo) return 0;
    let f = 0;
    for (const p of R.PAISES) {
      const st = s.mundo.paises[p.id];
      if (!st.tratado || st.anexado) continue;
      f += p.expo * R.clamp(mun.mezcla(s, p.id) - 1, -0.5, 1.5);
    }
    return f;
  };

  // ── Ranking de potencias ──
  // Puntos = economía (raíz del PBI en dólares) + poder militar + prestigio. Los anexados ya no cuentan.
  mun.puntos = function (s, id) {
    if (id === 'ARG') return Math.round(Math.sqrt(R.eco.pbiUSD(s)) * 2 + mun.poder(s) + (s.mundo.prestigio || 0));
    return Math.round(Math.sqrt(R.PBI_PAIS[id] || 50) * 2 + R.PAIS[id].poder);
  };
  mun.ranking = function (s, soloSudamerica) {
    const ids = ['ARG'].concat(R.PAISES.filter((p) => !s.mundo.paises[p.id].anexado && (!soloSudamerica || R.SUDAMERICA.includes(p.id))).map((p) => p.id));
    return ids.map((id) => ({ id, puntos: mun.puntos(s, id) })).sort((a, b) => b.puntos - a.puntos);
  };
  mun.puesto = (s, soloSudamerica) => mun.ranking(s, soloSudamerica).findIndex((x) => x.id === 'ARG') + 1;
  // Tus puntos contra el más fuerte de Sudamérica (1 = sos el primero).
  mun.ventajaRegional = function (s) {
    const otros = mun.ranking(s, true).filter((x) => x.id !== 'ARG');
    return otros.length ? mun.puntos(s, 'ARG') / otros[0].puntos : 2;
  };

  // ── Relaciones entre los otros países ──
  // Pactos de defensa entre países (además de los bloques fijos). Se arman y se rompen solos.
  mun.tienePacto = (s, a, b) => (s.mundo.pactos || []).some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  // Amigos de un país: su bloque, sus pactos y los que piensan parecido.
  mun.amistad = function (s, a, b) {
    const A = R.PAIS[a];
    const B = R.PAIS[b];
    return (A.bloque && A.bloque === B.bloque ? 40 : 0) + (mun.tienePacto(s, a, b) ? 40 : 0) + 25 * (1 - Math.abs(A.ideo - B.ideo)) - 10;
  };
  mun.amigosDe = (s, id) => R.PAISES.filter((q) => q.id !== id && !s.mundo.paises[q.id].anexado && mun.amistad(s, id, q.id) >= 30).map((q) => q.id);
  mun.noticia = function (s, emoji, txt) {
    s.mundo.noticias = s.mundo.noticias || [];
    s.mundo.noticias.unshift({ mes: s.mes, emoji, txt });
    if (s.mundo.noticias.length > 8) s.mundo.noticias.pop();
  };
  // Pánico mundial (0-100): sube si declarás guerras o anexás países y baja solo con el tiempo.
  mun.sumarPanico = (s, v) => { s.mundo.panico = R.clamp((s.mundo.panico || 0) + v, 0, 100); };

  // ⚔️ Poder militar propio (sale de la calidad de Defensa, leyes y compras).
  mun.poder = (s) => Math.round(15 + s.eco.calidad.defensa * 0.7 + (s.mundo.poderExtra || 0));

  mun.aliados = (s) => R.PAISES.filter((p) => s.mundo.paises[p.id].alianza && !s.mundo.paises[p.id].anexado);

  // Fuerza total en una guerra contra «enemigo»: tu poder + aliados que se suman; el enemigo + su bloque.
  mun.fuerzas = function (s, enemigo) {
    const E = R.PAIS[enemigo];
    // Lo que hiciste en esta guerra para inclinarla (armas, movilización, sabotaje, apoyos, aislar).
    const W = s.mundo.guerra && s.mundo.guerra.pais === enemigo ? s.mundo.guerra : {};
    let yo = mun.poder(s);
    const misAliados = [];
    for (const a of mun.aliados(s)) {
      if (a.id === enemigo || (E.bloque && a.bloque === E.bloque) || s.mundo.paises[a.id].rel < 50) continue;
      yo += a.poder * 0.35;
      misAliados.push(a.id);
    }
    for (const id of W.apoyos || []) {
      if (misAliados.includes(id) || s.mundo.paises[id].anexado) continue;
      yo += R.PAIS[id].poder * 0.2; // manda armas y asesores, no entra de lleno
      misAliados.push(id);
    }
    yo = yo * (W.multYo || 1) + (W.extraYo || 0);
    let el = E.poder;
    const susAliados = [];
    for (const p of R.PAISES) {
      if (p.id === enemigo || s.mundo.paises[p.id].anexado || misAliados.includes(p.id) || s.mundo.paises[p.id].alianza || (W.neutrales || []).includes(p.id)) continue;
      if (!((E.bloque && p.bloque === E.bloque) || mun.tienePacto(s, enemigo, p.id))) continue;
      el += p.poder * 0.35;
      susAliados.push(p.id);
    }
    el *= 1 - (W.sabotaje || 0);
    return { yo: Math.round(yo), el: Math.round(el), misAliados, susAliados, ratio: yo / Math.max(1, el) };
  };

  // ── Acciones con países ──
  mun.ACCIONES = [
    { id: 'visita', emoji: '✈️', nombre: 'Visita oficial', costo: { pc: 1 }, enfr: 4, si: (s, p, st) => !st.anexado && !mun.enGuerraCon(s, p.id),
      hacer: (s, p, st) => { st.rel = R.clamp(st.rel + 10, 0, 100); return { txt: 'Foto con el gobierno de ' + p.nombre + ' 🤝', ef: {} }; } },
    { id: 'tratado', emoji: '📦', nombre: 'Tratado comercial', costo: { pc: 2 }, req: 25, si: (s, p, st) => !st.tratado && !st.anexado && !st.sancion,
      hacer: (s, p, st) => {
        st.tratado = true;
        s.gob.bonusExpo = (s.gob.bonusExpo || 0) + p.expo;
        st.rel = R.clamp(st.rel + 5, 0, 100);
        const compra = (R.COMPRA[p.id] || []).map((k) => R.PRODUCTOS[k].emoji).join(' ');
        return { txt: '¡Tratado con ' + p.nombre + '! Te compra ' + compra + ' 🚢', ef: { campo: 3, empresarios: 3, trabajadores: -2 } };
      } },
    { id: 'prestamo', emoji: '💵', nombre: 'Pedir un préstamo', costo: { pc: 1 }, req: 35, enfr: 18, si: (s, p, st) => !!p.prestamo && !st.anexado,
      hacer: (s, p, st) => {
        if (p.id === 'CHN') s.mundo.paises.USA.rel = R.clamp(s.mundo.paises.USA.rel - 5, 0, 100);
        return { txt: p.nombre + ' te presta US$ ' + p.prestamo + ' mil M 💵', ef: { reservas: p.prestamo, deuda: p.prestamo * 0.25, riesgo: -40 } };
      } },
    { id: 'alianza', emoji: '🛡️', nombre: 'Alianza militar', costo: { pc: 3 }, req: 55, si: (s, p, st) => !st.alianza && !st.anexado,
      hacer: (s, p, st) => {
        st.alianza = true;
        st.oferta = null;
        // Los rivales de su bloque se enojan.
        for (const q of R.PAISES) {
          if (q.id === p.id || !q.bloque || !p.bloque) continue;
          const rivales = (p.bloque === 'otan' && q.bloque === 'oriental') || (p.bloque === 'oriental' && q.bloque === 'otan');
          if (rivales) s.mundo.paises[q.id].rel = R.clamp(s.mundo.paises[q.id].rel - 12, 0, 100);
        }
        return { txt: '🛡️ Alianza militar con ' + p.nombre, ef: { media: 1 } };
      } },
    { id: 'sancion', emoji: '🚫', nombre: 'Sanciones', costo: { pc: 1 }, si: (s, p, st) => !st.sancion && !st.anexado,
      hacer: (s, p, st) => {
        st.sancion = true;
        st.rel = R.clamp(st.rel - 30, 0, 100);
        if (st.tratado) { st.tratado = false; s.gob.bonusExpo = (s.gob.bonusExpo || 0) - p.expo; }
        return { txt: 'Sanciones a ' + p.nombre + ' 🚫', ef: p.id === 'GBR' ? { todos: 2 } : { empresarios: -2 } };
      } },
    { id: 'reclamo', emoji: '😤', nombre: 'Exigirle que pague', costo: { pc: 2 }, si: (s, p, st) => !p.noConquistable && !st.anexado && !s.mundo.guerra && !s.mundo.crisis,
      hacer: (s, p) => mun.empezarCrisis(s, p.id) },
    { id: 'guerra', emoji: '⚔️', nombre: 'Declarar la guerra', costo: { pc: 5 }, si: (s, p, st) => !p.noConquistable && !st.anexado && !s.mundo.guerra,
      hacer: (s, p) => mun.empezarGuerra(s, p.id, 'anexar') },
  ];
  mun.ACC = Object.fromEntries(mun.ACCIONES.map((a) => [a.id, a]));
  mun.enGuerraCon = (s, id) => !!(s.mundo.guerra && s.mundo.guerra.pais === id);

  mun.bloqueo = function (s, paisId, accId) {
    const a = mun.ACC[accId];
    const p = R.PAIS[paisId];
    const st = s.mundo.paises[paisId];
    if (accId === 'guerra' && p.noConquistable) return p.noConquistable;
    if (accId === 'guerra' && s.mundo.guerra) return 'Ya estás en una guerra';
    if (accId === 'reclamo' && p.noConquistable) return p.noConquistable;
    if (accId === 'reclamo' && (s.mundo.guerra || s.mundo.crisis)) return s.mundo.guerra ? 'Ya estás en una guerra' : 'Ya tenés un reclamo abierto';
    if (a.si && !a.si(s, p, st)) return 'No aplica';
    const ofrece = accId === 'alianza' && mun.ofreceAlianza(s, paisId);
    if (a.req && st.rel < a.req && !ofrece) return 'Necesitás mejor relación (' + a.req + ')';
    if (a.enfr && st.enfr[accId] !== undefined && s.mes - st.enfr[accId] < a.enfr) return 'De nuevo en ' + (a.enfr - (s.mes - st.enfr[accId])) + ' meses';
    if (mun.costoPC(s, paisId, accId) > s.gob.pc) return 'Falta ⭐';
    return null;
  };
  // Si un país te ofreció una alianza (hace menos de 6 meses), sale 1 ⭐ y sin pedir relación.
  mun.ofreceAlianza = (s, id) => { const o = s.mundo.paises[id].oferta; return o !== undefined && o !== null && s.mes - o < 6; };
  mun.costoPC = (s, id, accId) => (accId === 'alianza' && mun.ofreceAlianza(s, id) ? 1 : mun.ACC[accId].costo.pc || 0);

  mun.hacer = function (s, paisId, accId) {
    const b = mun.bloqueo(s, paisId, accId);
    if (b) return { error: b };
    const a = mun.ACC[accId];
    const p = R.PAIS[paisId];
    const st = s.mundo.paises[paisId];
    s.gob.pc -= mun.costoPC(s, paisId, accId);
    st.enfr[accId] = s.mes;
    const antes = s.gob.aprob;
    const r = a.hacer(s, p, st);
    const aplicado = R.gob.aplicarEfectos(s, r.ef || {});
    R.diario(s, a.emoji, a.nombre + ': ' + p.nombre, 'mundo');
    return { txt: r.txt, bueno: true, aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob };
  };

  // Comprar armamento.
  mun.COMPRA = { costo: { pc: 1, gasto: 4 }, poder: 10, enfr: 12 };
  mun.comprarArmas = function (s, proveedor) {
    const k = 'armas';
    if (s.gob.enfr[k] !== undefined && s.mes - s.gob.enfr[k] < mun.COMPRA.enfr) return { error: 'De nuevo en ' + (mun.COMPRA.enfr - (s.mes - s.gob.enfr[k])) + ' meses' };
    if (s.gob.pc < 1) return { error: 'Falta ⭐' };
    s.gob.pc -= 1;
    s.gob.enfr[k] = s.mes;
    s.mundo.poderExtra = (s.mundo.poderExtra || 0) + mun.COMPRA.poder;
    s.mundo.paises[proveedor].rel = R.clamp(s.mundo.paises[proveedor].rel + 8, 0, 100);
    const antes = s.gob.aprob;
    const aplicado = R.gob.aplicarEfectos(s, { gastoExtra: mun.COMPRA.costo.gasto, defensa: 3 });
    R.diario(s, '🛩️', 'Compraste aviones a ' + R.PAIS[proveedor].nombre, 'mundo');
    return { txt: '🛩️ Llegan aviones de ' + R.PAIS[proveedor].nombre + ': poder militar ▲', bueno: true, aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob };
  };

  // ── Malvinas ──
  mun.MALVINAS = [
    { id: 'onu', emoji: '🇺🇳', nombre: 'Reclamo en la ONU', costo: { pc: 2 }, enfr: 6,
      avance: (s) => 6 + Math.max(0, (s.mundo.paises.USA.rel - 50) / 10) + Math.max(0, (s.mundo.paises.CHN.rel - 50) / 10) },
    { id: 'negociar', emoji: '🤝', nombre: 'Negociar con el Reino Unido', costo: { pc: 4 }, enfr: 6, req: 50,
      avance: (s) => 10 + (s.mundo.paises.GBR.rel - 50) / 4 },
  ];
  mun.bloqueoMalvinas = function (s, id) {
    const a = mun.MALVINAS.find((x) => x.id === id);
    const M = s.mundo.malvinas;
    if (M.recuperadas) return 'Ya son argentinas 🇦🇷';
    if (a.req && s.mundo.paises.GBR.rel < a.req) return 'El Reino Unido no quiere hablar (relación ' + a.req + ')';
    const k = 'mlv_' + id;
    if (s.gob.enfr[k] !== undefined && s.mes - s.gob.enfr[k] < a.enfr) return 'De nuevo en ' + (a.enfr - (s.mes - s.gob.enfr[k])) + ' meses';
    if (s.gob.pc < a.costo.pc) return 'Falta ⭐';
    return null;
  };
  mun.malvinas = function (s, id) {
    const b = mun.bloqueoMalvinas(s, id);
    if (b) return { error: b };
    const a = mun.MALVINAS.find((x) => x.id === id);
    s.gob.pc -= a.costo.pc;
    s.gob.enfr['mlv_' + id] = s.mes;
    const M = s.mundo.malvinas;
    const av = Math.round(R.clamp(a.avance(s), 2, 25));
    M.soberania = Math.min(100, M.soberania + av);
    if (id === 'negociar') s.mundo.paises.GBR.rel = R.clamp(s.mundo.paises.GBR.rel - 3, 0, 100);
    const antes = s.gob.aprob;
    let ef = { todos: 1 };
    let txt = a.emoji + ' La soberanía avanza: ' + M.soberania + '%';
    if (M.soberania >= 100) {
      M.recuperadas = true;
      ef = { todos: 15 };
      txt = '🇦🇷 ¡LAS MALVINAS SON ARGENTINAS! Acuerdo histórico';
      R.diario(s, '🇦🇷', '¡Recuperaste las Malvinas por la vía diplomática!', 'mundo');
    }
    const aplicado = R.gob.aplicarEfectos(s, ef);
    return { txt, bueno: true, aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob, especial: M.recuperadas };
  };

  // ── Guerra ──
  mun.empezarGuerra = function (s, paisId, objetivo) {
    const W = { pais: paisId, objetivo, frente: 50, meses: 0 };
    s.mundo.guerra = W;
    const amigos = mun.amigosDe(s, paisId);
    for (const p of R.PAISES) {
      const st = s.mundo.paises[p.id];
      if (st.anexado) continue;
      if (p.id === paisId) { st.rel = 0; st.alianza = false; if (st.tratado) { st.tratado = false; s.gob.bonusExpo = (s.gob.bonusExpo || 0) - p.expo; } continue; }
      if (amigos.includes(p.id)) {
        st.rel = R.clamp(st.rel - 25, 0, 100);
        if (st.alianza) { st.alianza = false; mun.noticia(s, '💔', p.nombre + ' rompe la alianza con vos por atacar a ' + R.PAIS[paisId].nombre); }
      } else st.rel = R.clamp(st.rel - (st.alianza ? 4 : 8), 0, 100);
    }
    mun.sumarPanico(s, 15 + (R.PAIS[paisId].potencia ? 10 : 0));
    mun.noticia(s, '⚔️', 'Argentina le declaró la guerra a ' + R.PAIS[paisId].nombre);
    R.diario(s, '⚔️', '¡Guerra contra ' + R.PAIS[paisId].nombre + '!', 'mundo');
    return { txt: '⚔️ ¡Empezó la guerra contra ' + R.PAIS[paisId].nombre + '!', ef: { todos: 6, riesgo: 300, crec: -1.5 } };
  };
  mun.recuperarMalvinas = function (s) {
    if (s.mundo.guerra || s.mundo.malvinas.recuperadas) return { error: 'No se puede ahora' };
    if (s.gob.pc < 5) return { error: 'Falta ⭐' };
    s.gob.pc -= 5;
    const antes = s.gob.aprob;
    const r = mun.empezarGuerra(s, 'GBR', 'malvinas');
    const aplicado = R.gob.aplicarEfectos(s, r.ef);
    return { txt: '⚓ La flota zarpa hacia Malvinas', bueno: true, aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob };
  };

  // ── Inclinar la guerra (cuestan ⭐) ──
  // Cada una se usa una vez por guerra, salvo las que tienen «cada»: se repiten cada tantos meses.
  const mejorApoyo = (s, W) => R.PAISES.filter((p) => p.id !== W.pais && !s.mundo.paises[p.id].anexado && !s.mundo.paises[p.id].alianza
    && !(W.apoyos || []).includes(p.id) && s.mundo.paises[p.id].rel >= 60 && !mun.amigosDe(s, W.pais).includes(p.id)).sort((a, b) => b.poder - a.poder)[0];
  const apoyoDelEnemigo = (s, W) => mun.fuerzas(s, W.pais).susAliados.filter((id) => s.mundo.paises[id].rel >= 40).sort((a, b) => R.PAIS[b].poder - R.PAIS[a].poder)[0];
  mun.ACC_GUERRA = [
    { id: 'armas', emoji: '🛩️', corto: 'Armas', nombre: 'Armas de urgencia', pc: 2, gasto: 3, cada: 3,
      hacer: (s, W) => { W.extraYo = (W.extraYo || 0) + 8; } },
    { id: 'movilizar', emoji: '🪖', corto: 'Movilizar', nombre: 'Movilización general', pc: 3, ef: { trabajadores: -4, media: -3, crec: -0.5 },
      hacer: (s, W) => { W.multYo = 1.15; } },
    { id: 'sabotaje', emoji: '🕵️', corto: 'Sabotaje', nombre: 'Sabotaje e inteligencia', pc: 2,
      hacer: (s, W) => { W.sabotaje = 0.1; } },
    { id: 'apoyo', emoji: '🤝', corto: 'Pedir ayuda', nombre: (s, W) => { const p = mejorApoyo(s, W); return p ? 'Pedirle ayuda a ' + p.nombre : 'Pedir ayuda'; }, pc: 3,
      pais: (s, W) => (mejorApoyo(s, W) || {}).id,
      si: (s, W) => !!mejorApoyo(s, W), siTxt: 'Ningún país te quiere tanto (🤝 60+)',
      ef: (s, W) => ({ rel: { [mejorApoyo(s, W).id]: -5 } }), // le cuesta un poco
      hacer: (s, W) => {
        const p = mejorApoyo(s, W);
        W.apoyos = (W.apoyos || []).concat(p.id);
        return p.nombre + ' te manda armas 🤝';
      } },
    { id: 'aislar', emoji: '🚫', corto: 'Aislarlo', nombre: (s, W) => { const id = apoyoDelEnemigo(s, W); return id ? 'Que ' + R.PAIS[id].nombre + ' no se meta' : 'Dejarlo solo'; },
      pc: (s, W) => { const id = apoyoDelEnemigo(s, W); return 2 + Math.round((id ? R.PAIS[id].poder : 0) / 30); }, // más caro cuanto más fuerte es
      pais: (s, W) => apoyoDelEnemigo(s, W),
      si: (s, W) => !!apoyoDelEnemigo(s, W), siTxt: 'Nadie lo ayuda o no te escuchan (🤝 40+)',
      hacer: (s, W) => { const id = apoyoDelEnemigo(s, W); W.neutrales = (W.neutrales || []).concat(id); return R.PAIS[id].nombre + ' no se mete 🚫'; } },
    { id: 'cadena', emoji: '📢', corto: 'Cadena', nombre: 'Cadena patriótica', pc: 1, cada: 2, ef: { todos: 3 },
      hacer: () => {} },
  ];
  mun.nombreAccGuerra = (s, a) => (typeof a.nombre === 'function' ? a.nombre(s, s.mundo.guerra) : a.nombre);
  // Efectos en la gente y la economía (se calculan antes de hacerla: el apoyo cambia de país después).
  mun.efAccGuerra = (s, a) => Object.assign({}, typeof a.ef === 'function' ? a.ef(s, s.mundo.guerra) : a.ef || {}, a.gasto ? { gastoExtra: a.gasto } : {});
  mun.costoAccGuerra = (s, a) => (typeof a.pc === 'function' ? a.pc(s, s.mundo.guerra) : a.pc);
  mun.bloqueoGuerra = function (s, id) {
    const W = s.mundo.guerra;
    const a = mun.ACC_GUERRA.find((x) => x.id === id);
    if (!W) return 'No hay guerra';
    const usada = (W.usadas || {})[id];
    if (usada !== undefined && !a.cada) return 'Ya lo hiciste';
    if (usada !== undefined && a.cada && W.meses - usada < a.cada) return 'De nuevo en ' + (a.cada - (W.meses - usada)) + (a.cada - (W.meses - usada) === 1 ? ' mes' : ' meses');
    if (a.si && !a.si(s, W)) return a.siTxt;
    if (s.gob.pc < mun.costoAccGuerra(s, a)) return 'Falta ⭐';
    return null;
  };
  // Chances de ganar ahora y si hacés la acción (sin tocar la partida).
  mun.previaGuerra = function (s, id) {
    const W = s.mundo.guerra;
    const a = mun.ACC_GUERRA.find((x) => x.id === id);
    const F0 = mun.fuerzas(s, W.pais);
    const antes = mun.chances(s, W.pais, W.frente).gana;
    const copia = JSON.parse(JSON.stringify(W));
    a.hacer(s, copia);
    s.mundo.guerra = copia;
    try {
      const F1 = mun.fuerzas(s, W.pais);
      return { antes, despues: mun.chances(s, W.pais, W.frente).gana, yo: [F0.yo, F1.yo], el: [F0.el, F1.el] };
    } finally { s.mundo.guerra = W; }
  };
  mun.accionGuerra = function (s, id) {
    const b = mun.bloqueoGuerra(s, id);
    if (b) return { error: b };
    const W = s.mundo.guerra;
    const a = mun.ACC_GUERRA.find((x) => x.id === id);
    const nombre = mun.nombreAccGuerra(s, a);
    const ef = mun.efAccGuerra(s, a);
    s.gob.pc -= mun.costoAccGuerra(s, a);
    W.usadas = W.usadas || {};
    W.usadas[id] = W.meses;
    const txt = a.hacer(s, W) || nombre + ' ' + a.emoji;
    const antes = s.gob.aprob;
    const aplicado = R.gob.aplicarEfectos(s, ef);
    R.diario(s, a.emoji, nombre, 'mundo');
    return { txt, bueno: true, aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob };
  };

  mun.ORDENES = [
    { id: 'ofensiva', emoji: '⚔️', nombre: 'Ofensiva', desc: 'Avanzás fuerte', costo: { gasto: 3 } },
    { id: 'defender', emoji: '🛡️', nombre: 'Defender', desc: 'Aguantás y gastás poco', costo: { gasto: 1 } },
    { id: 'paz', emoji: '🕊️', nombre: 'Pedir la paz', desc: 'Termina la guerra', costo: {} },
  ];

  // Probabilidad de retroceder con cada orden (la misma cuenta que mun.orden).
  const fi = (z) => 1 / (1 + Math.exp(-1.702 * z)); // aproximación de la normal acumulada
  mun.probRetroceso = function (s, id) {
    const W = s.mundo.guerra;
    if (!W || id === 'paz') return 0;
    const F = mun.fuerzas(s, W.pais);
    const { media, desvio } = mun.avance(F.ratio, id);
    return R.clamp(fi(-media / desvio), 0.01, 0.99);
  };

  // Cuánto se mueve el frente por mes: manda la relación de fuerzas. Con el doble de poder avanzás ~12 por mes
  // (≈ 4-5 meses para ganar); con 20 % más, ~1 año y casi siempre ganás; parejos es largo y parejo;
  // con menos poder casi no tenés chances.
  mun.avance = (ratio, orden) => {
    const lr = Math.log2(Math.max(0.05, ratio));
    return orden === 'ofensiva' ? { media: 12 * lr, desvio: 2.5 } : { media: 5 * lr - 1, desvio: 1.5 };
  };
  // Chances de ganar atacando todos los meses (simulación rápida con su propio azar: no toca la partida).
  mun.chances = function (s, paisId, desde) {
    const F = mun.fuerzas(s, paisId);
    const { media, desvio } = mun.avance(F.ratio, 'ofensiva');
    let semilla = 12345;
    const azar = () => {
      semilla = (semilla + 0x6d2b79f5) | 0;
      let x = Math.imul(semilla ^ (semilla >>> 15), semilla | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
    const gauss = () => (azar() + azar() + azar() + azar() - 2) * 1.73;
    let ganadas = 0;
    let perdidas = 0;
    let meses = 0;
    const N = 300;
    for (let i = 0; i < N; i++) {
      let f = desde ?? 50;
      let m = 0;
      while (f > 0 && f < 100 && m < 36) { f += media + gauss() * desvio; m++; }
      if (f >= 100) { ganadas++; meses += m; } else if (f <= 0) perdidas++;
    }
    return { gana: ganadas / N, pierde: perdidas / N, meses: ganadas ? Math.round(meses / ganadas) : null, F };
  };

  // Una orden de guerra (se da cada mes). Devuelve { txt, delta, fin?, aplicado }.
  mun.orden = function (s, id) {
    const W = s.mundo.guerra;
    const F = mun.fuerzas(s, W.pais);
    const P = R.PAIS[W.pais];
    let delta = 0;
    let ef = {};
    W.meses++;
    if (id === 'paz') return mun.terminarGuerra(s, W.frente >= 55 ? 'paz_buena' : 'paz_mala');
    const av = mun.avance(F.ratio, id);
    delta = av.media + R.gauss(s) * av.desvio;
    ef = { gastoExtra: id === 'ofensiva' ? 3 : 1 };
    W.frente = R.clamp(W.frente + delta, 0, 100);
    ef.crec = -0.6;
    ef.todos = W.meses <= 2 ? 2 : -2; // al principio patriotismo, después cansancio
    if (delta < -6) ef.todos -= 2;
    const aplicado = R.gob.aplicarEfectos(s, ef);
    let txt = delta > 4 ? '¡Avanzamos en el frente! 🎖️' : delta < -4 ? 'Retrocedemos… ' + P.nombre + ' contraataca 😰' : 'El frente casi no se mueve';
    if (W.frente >= 100) return Object.assign(mun.terminarGuerra(s, 'victoria'), { delta });
    if (W.frente <= 0) return Object.assign(mun.terminarGuerra(s, 'derrota'), { delta });
    return { txt, delta, aplicado, bueno: delta >= 0 };
  };

  mun.terminarGuerra = function (s, como) {
    const W = s.mundo.guerra;
    const P = R.PAIS[W.pais];
    const st = s.mundo.paises[W.pais];
    s.mundo.guerra = null;
    let ef = {};
    let txt = '';
    if (como === 'victoria' && W.objetivo === 'defensa') {
      ef = { todos: 12, reservas: 4, prestigio: 12 };
      txt = '🛡️ ¡Rechazamos el ataque de ' + P.nombre + '!';
      st.rel = 25;
    } else if (como === 'derrota' && W.objetivo === 'defensa') {
      ef = { todos: -20, reservas: -10, deuda: 6, riesgo: 400, prestigio: -15 };
      txt = '💀 ' + P.nombre + ' nos ganó: hay que pagarle';
      st.rel = 15;
    } else if (como === 'victoria') {
      if (W.objetivo === 'malvinas') {
        s.mundo.malvinas.recuperadas = true;
        s.mundo.malvinas.soberania = 100;
        ef = { todos: 18, riesgo: 200, prestigio: 25 };
        txt = '🇦🇷 ¡RECUPERAMOS LAS MALVINAS!';
      } else {
        const amigos = mun.amigosDe(s, P.id);
        st.anexado = true;
        s.eco.pbi *= 1 + (P.tam || 0.1);
        s.mundo.resistencia = (s.mundo.resistencia || 0) + Math.round(12 + 8 * Math.min(3, P.tam || 0.1));
        for (const q of R.PAISES) {
          const sq = s.mundo.paises[q.id];
          if (q.id === P.id || sq.anexado) continue;
          sq.rel = R.clamp(sq.rel - (amigos.includes(q.id) ? 20 : sq.alianza ? 4 : 10), 0, 100);
        }
        mun.sumarPanico(s, 25 + 10 * Math.min(3, P.tam || 0.1));
        mun.noticia(s, '🏴', 'Argentina anexó a ' + P.nombre + ': pánico en el mundo');
        ef = { todos: 10, reservas: 4 + (P.tam || 0.1) * 10, riesgo: 250, prestigio: 15 };
        txt = '🏴 ¡Ganaste la guerra! ' + P.nombre + ' ahora es parte de la Argentina';
      }
    } else if (como === 'derrota') {
      ef = { todos: -22, reservas: -8, deuda: 5, riesgo: 500, escandalo: 3, prestigio: -20 };
      txt = '💀 Perdiste la guerra contra ' + P.nombre;
      st.rel = 10;
    } else if (como === 'paz_buena') {
      ef = { todos: 4, reservas: 3, prestigio: 5 };
      txt = '🕊️ Paz con ventaja: ' + P.nombre + ' paga una indemnización';
      st.rel = 20;
    } else {
      ef = { todos: -6, reservas: -4, prestigio: -8 };
      txt = '🕊️ Paz con derrota: pagás una indemnización a ' + P.nombre;
      st.rel = 25;
    }
    R.diario(s, como === 'victoria' ? '🎖️' : '🕊️', txt, 'mundo');
    const aplicado = R.gob.aplicarEfectos(s, ef);
    return { txt, aplicado, fin: como, bueno: como === 'victoria' || como === 'paz_buena' };
  };

  // Cada mes: la guerra pide una orden, la resistencia de lo anexado y las relaciones se acomodan.
  mun.mes = function (s, momentos) {
    if (!s.mundo) return;
    if (s.mundo.guerra) momentos.push({ tipo: 'guerra' });
    if (s.mundo.crisis && !s.mundo.guerra) momentos.push({ tipo: 'crisis' });
    if (s.mundo.resistencia > 0) {
      s.mundo.resistencia--;
      R.gob.aplicarEfectos(s, { todos: -0.4 });
    }
    const panico = s.mundo.panico || 0;
    for (const p of R.PAISES) {
      const st = s.mundo.paises[p.id];
      if (st.anexado) continue;
      const base = st.alianza ? 70 : R.clamp(p.rel + 18 * (0.5 - Math.abs(p.ideo - s.partido.ideo)), 0, 100);
      const meta = base - panico * (st.alianza ? 0.15 : 0.4) + Math.min(10, (s.mundo.prestigio || 0) * 0.08);
      st.rel = R.clamp(st.rel + (meta - st.rel) * 0.03, 0, 100);
    }
    mun.mundoSeMueve(s);
    // El pánico baja solo (a la mitad en ~10 meses).
    s.mundo.panico = Math.max(0, panico * 0.93 - 0.3);
    // Un vecino que te odia y es bastante más fuerte te puede atacar (más si hay pánico por tus guerras).
    if (!s.mundo.guerra && s.gob && s.gob.meses >= 6) {
      for (const id of R.VECINOS) {
        const st = s.mundo.paises[id];
        if (st.anexado || st.alianza || st.rel >= 15) continue;
        if (mun.fuerzas(s, id).ratio > 0.8) continue;
        if (R.chance(s, 0.015 + (s.mundo.panico || 0) / 2000)) {
          mun.serAtacado(s, id, momentos);
          break;
        }
      }
    }
  };

  // ── Reclamo (jugada diplomática antes de la guerra) ──
  // Le exigís a un país que pague y te abra su mercado. Dura hasta 3 meses: cada mes puede ceder (más si sos mucho
  // más fuerte), sus amigos se enojan y sube el pánico. Al final: guerra o retroceder (perdés prestigio).
  mun.CRISIS_MESES = 3;
  mun.chanceCeder = function (s, paisId, presion) {
    const r = mun.fuerzas(s, paisId).ratio;
    const base = r >= 2 ? 0.55 : r >= 1.5 ? 0.35 : r >= 1.2 ? 0.18 : r >= 1 ? 0.08 : 0.02;
    return R.clamp(base * (presion ? 1.6 : 1), 0, 0.85);
  };
  mun.premioCrisis = (p) => ({ reservas: R.round(2 + Math.min(8, (p.tam || 0.1) * 20), 1), prestigio: 8 });
  mun.empezarCrisis = function (s, paisId) {
    const P = R.PAIS[paisId];
    s.mundo.crisis = { pais: paisId, meses: 0, presiones: 0 };
    const st = s.mundo.paises[paisId];
    st.rel = R.clamp(st.rel - 20, 0, 100);
    for (const id of mun.amigosDe(s, paisId)) s.mundo.paises[id].rel = R.clamp(s.mundo.paises[id].rel - 6, 0, 100);
    mun.sumarPanico(s, 5);
    mun.noticia(s, '😤', 'Argentina le exige a ' + P.nombre + ' que pague');
    return { txt: '😤 Le exigiste a ' + P.nombre + ' que pague. Tiene ' + mun.CRISIS_MESES + ' meses para responder', ef: { todos: 2 } };
  };
  // Cada mes del reclamo: presionar (⭐1, más chance), esperar, ir a la guerra o retroceder.
  mun.OPC_CRISIS = [
    { id: 'presionar', emoji: '😤', nombre: 'Presionar más', costo: { pc: 1 } },
    { id: 'esperar', emoji: '⏳', nombre: 'Esperar su respuesta', costo: {} },
    { id: 'guerra', emoji: '⚔️', nombre: 'Ir a la guerra', costo: {} },
    { id: 'retroceder', emoji: '🕊️', nombre: 'Retroceder', costo: {} },
  ];
  mun.bloqueoCrisis = function (s, id) {
    const C = s.mundo.crisis;
    if (!C) return 'No hay reclamo';
    const ultimo = C.meses >= mun.CRISIS_MESES - 1;
    if ((id === 'presionar' || id === 'esperar') && ultimo) return 'Se acabó el plazo';
    if (id === 'presionar' && s.gob.pc < 1) return 'Falta ⭐';
    return null;
  };
  mun.crisisOrden = function (s, id) {
    const b = mun.bloqueoCrisis(s, id);
    if (b) return { error: b };
    const C = s.mundo.crisis;
    const P = R.PAIS[C.pais];
    const st = s.mundo.paises[C.pais];
    const antes = s.gob.aprob;
    C.meses++;
    if (id === 'guerra') {
      s.mundo.crisis = null;
      const r = mun.empezarGuerra(s, C.pais, 'anexar');
      const aplicado = R.gob.aplicarEfectos(s, r.ef);
      return { txt: r.txt, bueno: true, aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob, fin: 'guerra' };
    }
    if (id === 'retroceder') {
      s.mundo.crisis = null;
      st.rel = R.clamp(st.rel + 5, 0, 100);
      const aplicado = R.gob.aplicarEfectos(s, { prestigio: -5, todos: -2 });
      R.diario(s, '🕊️', 'Retrocediste en el reclamo a ' + P.nombre, 'mundo');
      return { txt: '🕊️ Retrocediste: ' + P.nombre + ' no paga nada', bueno: false, aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob, fin: 'retroceder' };
    }
    const presion = id === 'presionar';
    if (presion) {
      s.gob.pc -= 1;
      C.presiones++;
      mun.sumarPanico(s, 3);
      for (const a of mun.amigosDe(s, C.pais)) s.mundo.paises[a].rel = R.clamp(s.mundo.paises[a].rel - 3, 0, 100);
    }
    if (R.chance(s, mun.chanceCeder(s, C.pais, presion))) {
      s.mundo.crisis = null;
      const ef = mun.premioCrisis(P);
      if (!st.tratado) { st.tratado = true; s.gob.bonusExpo = (s.gob.bonusExpo || 0) + P.expo; }
      st.rel = R.clamp(st.rel - 10, 0, 100);
      mun.sumarPanico(s, 5);
      mun.noticia(s, '💰', P.nombre + ' cede ante la Argentina');
      R.diario(s, '💰', '¡' + P.nombre + ' cedió! Paga y abre su mercado', 'mundo');
      const aplicado = R.gob.aplicarEfectos(s, Object.assign({ todos: 3 }, ef));
      return { txt: '💰 ¡' + P.nombre + ' cedió! Paga y te abre su mercado', bueno: true, aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob, fin: 'cedio' };
    }
    return { txt: P.nombre + ' no cede… por ahora', bueno: false, aplicado: [], aprobAntes: antes, aprobDespues: s.gob.aprob };
  };

  // Te atacan: guerra para defenderte (si ganás, cobrás; si perdés, pagás).
  mun.serAtacado = function (s, paisId, momentos) {
    const P = R.PAIS[paisId];
    s.mundo.guerra = { pais: paisId, objetivo: 'defensa', frente: 50, meses: 0 };
    s.mundo.paises[paisId].rel = 0;
    mun.sumarPanico(s, 10);
    mun.noticia(s, '🚨', P.nombre + ' atacó a la Argentina');
    R.diario(s, '🚨', '¡' + P.nombre + ' nos atacó!', 'mundo');
    const aplicado = R.gob.aplicarEfectos(s, { todos: 8, riesgo: 250, crec: -1 });
    if (momentos) momentos.push({ tipo: 'atacado', pais: paisId, aplicado });
  };

  // Los otros países también juegan: firman y rompen pactos, piden protección si hay pánico y te ofrecen alianzas.
  mun.mundoSeMueve = function (s) {
    const M = s.mundo;
    M.pactos = M.pactos || [];
    const vivos = R.PAISES.filter((p) => !M.paises[p.id].anexado);
    const nombre = (id) => R.PAIS[id].nombre;
    // 1) Pactos nuevos entre países que piensan parecido (y no están ya juntos).
    if (R.chance(s, 0.06) && vivos.length > 2) {
      const a = R.pick(s, vivos);
      const cand = vivos.filter((b) => b.id !== a.id && !mun.tienePacto(s, a.id, b.id) && !(a.bloque && a.bloque === b.bloque) && Math.abs(a.ideo - b.ideo) <= 0.5);
      if (cand.length) {
        const b = R.pick(s, cand);
        M.pactos.push([a.id, b.id]);
        mun.noticia(s, '🤝', nombre(a.id) + ' y ' + nombre(b.id) + ' firman una alianza');
      }
    }
    // 2) A veces un pacto se rompe.
    if (M.pactos.length && R.chance(s, 0.03)) {
      const i = Math.floor(R.rand(s) * M.pactos.length);
      const [a, b] = M.pactos.splice(i, 1)[0];
      mun.noticia(s, '💢', nombre(a) + ' y ' + nombre(b) + ' rompen su alianza');
    }
    // 3) Con pánico, los vecinos chicos piden protección a una potencia amiga.
    if ((M.panico || 0) >= 20) {
      for (const p of vivos) {
        if (p.potencia || M.paises[p.id].alianza || M.paises[p.id].rel >= 55) continue;
        if (!R.chance(s, M.panico / 250)) continue;
        const protector = vivos.filter((q) => q.id !== p.id && q.poder >= 55 && !M.paises[q.id].alianza && !mun.tienePacto(s, p.id, q.id))
          .sort((x, y) => Math.abs(x.ideo - p.ideo) - Math.abs(y.ideo - p.ideo))[0];
        if (!protector) continue;
        M.pactos.push([p.id, protector.id]);
        mun.noticia(s, '🛡️', nombre(p.id) + ' pide protección a ' + nombre(protector.id));
      }
    }
    // 4) Los que te quieren mucho te ofrecen una alianza.
    for (const p of vivos) {
      const st = M.paises[p.id];
      if (st.alianza || st.rel < 72 || mun.ofreceAlianza(s, p.id) || mun.enGuerraCon(s, p.id) || !R.chance(s, 0.05)) continue;
      st.oferta = s.mes;
      mun.noticia(s, '🤝', nombre(p.id) + ' te ofrece una alianza');
    }
  };

  // Fichas extra para el mapa (países anexados).
  mun.fichasMapa = function (s) {
    if (!s.mundo) return [];
    const out = [];
    for (const p of R.PAISES) if (s.mundo.paises[p.id].anexado && p.fichas) for (const f of p.fichas) out.push({ id: f.id, hex: f.hex, abrev: f.abrev, nombre: p.nombre + ' (anexado)', pais: p.id });
    return out;
  };
})(globalThis.R = globalThis.R || {});
