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
    s.mundo = { paises, guerra: null, malvinas: { soberania: 0, recuperadas: false }, poderExtra: 0, resistencia: 0 };
  };

  // ⚔️ Poder militar propio (sale de la calidad de Defensa, leyes y compras).
  mun.poder = (s) => Math.round(15 + s.eco.calidad.defensa * 0.7 + (s.mundo.poderExtra || 0));

  mun.aliados = (s) => R.PAISES.filter((p) => s.mundo.paises[p.id].alianza && !s.mundo.paises[p.id].anexado);

  // Fuerza total en una guerra contra «enemigo»: tu poder + aliados que se suman; el enemigo + su bloque.
  mun.fuerzas = function (s, enemigo) {
    const E = R.PAIS[enemigo];
    let yo = mun.poder(s);
    const misAliados = [];
    for (const a of mun.aliados(s)) {
      if (a.id === enemigo || (E.bloque && a.bloque === E.bloque) || s.mundo.paises[a.id].rel < 50) continue;
      yo += a.poder * 0.35;
      misAliados.push(a.id);
    }
    let el = E.poder;
    const susAliados = [];
    if (E.bloque) {
      for (const p of R.PAISES) {
        if (p.id === enemigo || p.bloque !== E.bloque || s.mundo.paises[p.id].anexado || misAliados.includes(p.id)) continue;
        el += p.poder * 0.35;
        susAliados.push(p.id);
      }
    }
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
        return { txt: '¡Tratado con ' + p.nombre + '! Más exportaciones 🚢', ef: { campo: 3, empresarios: 3, trabajadores: -2 } };
      } },
    { id: 'prestamo', emoji: '💵', nombre: 'Pedir un préstamo', costo: { pc: 1 }, req: 35, enfr: 18, si: (s, p, st) => !!p.prestamo && !st.anexado,
      hacer: (s, p, st) => {
        if (p.id === 'CHN') s.mundo.paises.USA.rel = R.clamp(s.mundo.paises.USA.rel - 5, 0, 100);
        return { txt: p.nombre + ' te presta US$ ' + p.prestamo + ' mil M 💵', ef: { reservas: p.prestamo, deuda: p.prestamo * 0.25, riesgo: -40 } };
      } },
    { id: 'alianza', emoji: '🛡️', nombre: 'Alianza militar', costo: { pc: 3 }, req: 55, si: (s, p, st) => !st.alianza && !st.anexado,
      hacer: (s, p, st) => {
        st.alianza = true;
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
    { id: 'guerra', emoji: '⚔️', nombre: 'Declarar la guerra', costo: { pc: 5 }, si: (s, p, st) => p.conquistable && !st.anexado && !s.mundo.guerra,
      hacer: (s, p) => mun.empezarGuerra(s, p.id, 'anexar') },
  ];
  mun.ACC = Object.fromEntries(mun.ACCIONES.map((a) => [a.id, a]));
  mun.enGuerraCon = (s, id) => !!(s.mundo.guerra && s.mundo.guerra.pais === id);

  mun.bloqueo = function (s, paisId, accId) {
    const a = mun.ACC[accId];
    const p = R.PAIS[paisId];
    const st = s.mundo.paises[paisId];
    if (a.si && !a.si(s, p, st)) return 'No aplica';
    if (a.req && st.rel < a.req) return 'Necesitás mejor relación (' + a.req + ')';
    if (a.enfr && st.enfr[accId] !== undefined && s.mes - st.enfr[accId] < a.enfr) return 'De nuevo en ' + (a.enfr - (s.mes - st.enfr[accId])) + ' meses';
    if (a.costo.pc && s.gob.pc < a.costo.pc) return 'Falta ⭐';
    return null;
  };

  mun.hacer = function (s, paisId, accId) {
    const b = mun.bloqueo(s, paisId, accId);
    if (b) return { error: b };
    const a = mun.ACC[accId];
    const p = R.PAIS[paisId];
    const st = s.mundo.paises[paisId];
    s.gob.pc -= a.costo.pc || 0;
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
    for (const p of R.PAISES) {
      const st = s.mundo.paises[p.id];
      if (p.id === paisId) { st.rel = 0; st.alianza = false; if (st.tratado) { st.tratado = false; s.gob.bonusExpo = (s.gob.bonusExpo || 0) - p.expo; } continue; }
      if (!st.alianza) st.rel = R.clamp(st.rel - 12, 0, 100);
    }
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
    const media = id === 'ofensiva' ? 15 * (F.ratio - 0.85) : 6 * (F.ratio - 1.05);
    const desvio = id === 'ofensiva' ? 7 : 4;
    return R.clamp(fi(-media / desvio), 0.01, 0.99);
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
    if (id === 'ofensiva') { delta = 15 * (F.ratio - 0.85) + R.gauss(s) * 7; ef = { gastoExtra: 3 }; }
    else { delta = 6 * (F.ratio - 1.05) + R.gauss(s) * 4; ef = { gastoExtra: 1 }; }
    W.frente = R.clamp(W.frente + delta, 0, 100);
    ef.crec = -1;
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
    if (como === 'victoria') {
      if (W.objetivo === 'malvinas') {
        s.mundo.malvinas.recuperadas = true;
        s.mundo.malvinas.soberania = 100;
        ef = { todos: 18, riesgo: 200 };
        txt = '🇦🇷 ¡RECUPERAMOS LAS MALVINAS!';
      } else {
        st.anexado = true;
        s.eco.pbi *= 1 + P.tam;
        s.mundo.resistencia = (s.mundo.resistencia || 0) + 12;
        for (const q of R.PAISES) if (q.id !== P.id && !s.mundo.paises[q.id].alianza) s.mundo.paises[q.id].rel = R.clamp(s.mundo.paises[q.id].rel - 15, 0, 100);
        ef = { todos: 10, reservas: 4 + P.tam * 10, riesgo: 250 };
        txt = '🏴 ¡Ganaste la guerra! ' + P.nombre + ' ahora es parte de la Argentina';
      }
    } else if (como === 'derrota') {
      ef = { todos: -22, reservas: -8, deuda: 5, riesgo: 500, escandalo: 3 };
      txt = '💀 Perdiste la guerra contra ' + P.nombre;
      st.rel = 10;
    } else if (como === 'paz_buena') {
      ef = { todos: 4, reservas: 3 };
      txt = '🕊️ Paz con ventaja: ' + P.nombre + ' paga una indemnización';
      st.rel = 20;
    } else {
      ef = { todos: -6, reservas: -4 };
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
    if (s.mundo.resistencia > 0) {
      s.mundo.resistencia--;
      R.gob.aplicarEfectos(s, { todos: -0.4 });
    }
    for (const p of R.PAISES) {
      const st = s.mundo.paises[p.id];
      if (st.anexado) continue;
      const meta = st.alianza ? 70 : R.clamp(p.rel + 18 * (0.5 - Math.abs(p.ideo - s.partido.ideo)), 0, 100);
      st.rel = R.clamp(st.rel + (meta - st.rel) * 0.02, 0, 100);
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
