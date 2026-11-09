// Producción: sectores con nivel, obras del Estado, inversión privada, energía, precios del mundo y ciclos
// (crisis y bonanzas que se avisan antes). Motor sin DOM.
(function (R) {
  'use strict';

  const prod = (R.prod = {});

  // Crea lo que falta (partidas nuevas y guardadas antes de que existiera la producción).
  prod.asegurar = function (s) {
    if (!s.prod) {
      s.prod = { sec: {}, obras: [], novedades: [], invertido: 0 };
      for (const x of R.SECTORES) s.prod.sec[x.id] = { nivel: x.nivel0 };
    }
    if (s.mundo) {
      if (!s.mundo.precios) {
        s.mundo.precios = {};
        s.mundo.preciosAntes = {};
        for (const k of Object.keys(R.PRODUCTOS)) { s.mundo.precios[k] = 1; s.mundo.preciosAntes[k] = 1; }
      }
      if (!s.mundo.ciclos) s.mundo.ciclos = { proximo: null, activos: [], ultimo: s.mes };
    }
    return s.prod;
  };

  prod.nivel = (s, id) => (s.prod ? s.prod.sec[id].nivel : R.SECTOR[id].nivel0);
  prod.precio = (s, producto) => (s.mundo && s.mundo.precios ? s.mundo.precios[producto] : 1);

  // ── Ciclos del mundo ──
  // precios: cuánto se mueve el precio de cada producto. shocks: golpes mientras dura (crec en puntos por año,
  // riesgo en puntos, reservas por mes). sector: cuánto produce un sector (−0,45 = 45 % menos).
  // prep: lo que podés hacer cuando te avisan (mitiga = parte del golpe que te ahorrás; atrae = más inversión privada).
  prod.CICLOS = [
    { id: 'recesion', emoji: '📉', nombre: 'Recesión mundial', peso: 3, aviso: 2, dura: [8, 12],
      precios: { granos: -0.18, energia: -0.3, manufacturas: -0.25, software: -0.12 }, shocks: { crec: -1.4, riesgo: 120 },
      prep: { txt: 'Ahorrar para el golpe', costo: { pc: 2 }, mitiga: 0.5 } },
    { id: 'boom', emoji: '🚀', nombre: 'Boom de materias primas', peso: 2, bueno: true, aviso: 2, dura: [8, 14],
      precios: { granos: 0.3, energia: 0.35 }, shocks: { crec: 0.6 },
      prep: { txt: 'Atraer inversiones', costo: { pc: 2 }, atrae: { campo: 0.6, energia: 0.6 } } },
    { id: 'sequia', emoji: '🌵', nombre: 'Sequía', peso: 2, aviso: 1, dura: [5, 8],
      sector: { campo: -0.45 }, shocks: { crec: -0.8 }, grupos: { campo: -6 },
      prep: { txt: 'Seguro agrícola', costo: { pc: 1, gasto: 2 }, mitiga: 0.5 } },
    { id: 'fed', emoji: '🏦', nombre: 'Suben las tasas en EE.UU.', peso: 2, aviso: 2, dura: [8, 10],
      shocks: { riesgo: 220, reservas: -0.5 },
      prep: { txt: 'Pedir prestado antes', costo: { pc: 1 }, ef: { reservas: 5, deuda: 1.5 }, mitiga: 0.35 } },
    { id: 'brasil', emoji: '🦜', nombre: 'Crisis en Brasil', peso: 2, aviso: 1, dura: [6, 9],
      precios: { manufacturas: -0.35 }, shocks: { crec: -0.7 }, grupos: { trabajadores: -3 },
      prep: { txt: 'Proteger la industria', costo: { pc: 1 }, ef: { rel: { BRA: -5 } }, mitiga: 0.5 } },
    { id: 'petroleo', emoji: '🛢️', nombre: 'El petróleo se dispara', peso: 2, aviso: 1, dura: [6, 10],
      precios: { energia: 0.55 }, shocks: { infl: 0.15 },
      prep: { txt: 'Más pozos ya', costo: { pc: 2 }, atrae: { energia: 0.9 }, mitiga: 0.5 } },
    { id: 'chips', emoji: '🤖', nombre: 'Fiebre tecnológica', peso: 1, bueno: true, aviso: 2, dura: [8, 12],
      precios: { software: 0.45 }, shocks: { crec: 0.3 },
      prep: { txt: 'Atraer empresas', costo: { pc: 2 }, atrae: { tecno: 0.9 } } },
  ];
  prod.CICLO = Object.fromEntries(prod.CICLOS.map((c) => [c.id, c]));

  const activos = (s) => (s.mundo && s.mundo.ciclos ? s.mundo.ciclos.activos : []);
  // Cuánto produce un sector ahora (1 = normal; una sequía lo baja).
  prod.mult = function (s, id) {
    let m = 1;
    for (const c of activos(s)) {
      const X = prod.CICLO[c.id];
      if (X.sector && X.sector[id]) m *= 1 + X.sector[id] * (1 - (c.mitiga || 0));
    }
    return m;
  };
  // Inversión extra por haberte preparado para una bonanza.
  prod.bonusCiclo = (s, id) => R.sum(activos(s).map((c) => (c.atrae && c.atrae[id]) || 0));

  // ── ⚡ Energía ──
  // La producen los pozos y las represas; la consumen la industria, la tecnología y un país que crece.
  // Si falta se importa (se van dólares y la industria frena); si sobra se exporta.
  prod.energia = function (s) {
    const P = s.prod.sec;
    const oferta = P.energia.nivel;
    const demanda = 2 + P.industria.nivel * 0.35 + P.tecno.nivel * 0.1 + Math.max(0, (s.eco.pbi - 100) / 40);
    return { oferta, demanda, saldo: oferta - demanda };
  };
  prod.costoEnergia = function (s) {
    if (!s.prod) return 0;
    const en = prod.energia(s);
    return en.saldo < 0 ? en.saldo * 0.3 * prod.precio(s, 'energia') : 0; // miles de millones de dólares por mes
  };

  // Lo que los sectores suman a las exportaciones (se suma a eco.factorExpo). Al asumir da 0.
  prod.expoExtra = function (s) {
    if (!s.prod) return 0;
    let f = 0;
    for (const x of R.SECTORES) {
      if (x.id === 'energia') continue;
      const nivel = s.prod.sec[x.id].nivel * prod.mult(s, x.id);
      f += x.expo * (nivel * prod.precio(s, x.producto) - x.nivel0);
    }
    const en = prod.energia(s);
    if (en.saldo > 0) f += R.SECTOR.energia.expo * en.saldo * prod.precio(s, 'energia');
    return R.clamp(f, -0.35, 0.6);
  };
  // Lo que suman al crecimiento: la tecnología empuja la productividad; la falta de energía frena.
  prod.crecExtra = function (s) {
    if (!s.prod) return 0;
    const en = prod.energia(s);
    return (s.prod.sec.tecno.nivel - R.SECTOR.tecno.nivel0) * 0.12 + (en.saldo < 0 ? Math.max(-1.5, en.saldo * 0.35) : 0);
  };

  // ── Inversión privada ──
  // El clima general (riesgo país, impuestos, cepo, inflación, estabilidad) y lo propio de cada sector
  // (precio del mundo, tus leyes, retenciones, energía, talento). Da la chance por mes de que un privado suba un nivel.
  prod.clima = function (s) {
    const e = s.eco;
    return [
      { k: 'riesgo', v: -(e.riesgo - 600) / 1200 },
      { k: 'impuestos', v: -0.12 * ((e.impEf ?? e.impuestos) - 2) },
      { k: 'cepo', v: e.cepo ? -0.25 : 0 },
      { k: 'inflacion', v: -Math.max(0, e.inflAnual - 40) / 150 },
      { k: 'estabilidad', v: s.gob ? (s.gob.aprob - 50) / 250 : 0 },
    ];
  };
  prod.atractivo = function (s, id) {
    const x = R.SECTOR[id];
    const e = s.eco;
    const partes = prod.clima(s);
    partes.push({ k: 'precio', v: (prod.precio(s, x.producto) - 1) * 1.2 });
    let leyes = 0;
    for (const [ley, v] of Object.entries(x.leyes)) if (s.gob && s.gob.leyes[ley]) leyes += v;
    partes.push({ k: 'leyes', v: leyes });
    if (id === 'campo') partes.push({ k: 'retenciones', v: -0.15 * ((e.retEf ?? e.retenciones) - 1.5) });
    if (id === 'industria') { const en = prod.energia(s); partes.push({ k: 'energia', v: en.saldo < 0 ? Math.max(-0.5, en.saldo * 0.25) : 0.1 }); }
    if (id === 'tecno') partes.push({ k: 'talento', v: (e.calidad.educacion - 50) / 110 + (e.calidad.ciencia - 50) / 160 });
    partes.push({ k: 'mundo', v: prod.bonusCiclo(s, id) });
    // Cuanto más grande es el sector, más le cuesta crecer (ya se hicieron las inversiones fáciles).
    partes.push({ k: 'tamano', v: -Math.max(0, s.prod.sec[id].nivel - x.nivel0) * 0.09 });
    const total = R.sum(partes.map((p) => p.v));
    const chance = R.clamp(0.035 * (1 + total), 0, 0.12);
    const cierre = total < -0.5 ? R.clamp((-0.5 - total) * 0.04, 0, 0.06) : 0;
    return { partes, total, chance, cierre };
  };
  R.CAUSAS_INVERSION = {
    riesgo: ['📊', 'Riesgo país'], impuestos: ['🧾', 'Impuestos'], cepo: ['🔒', 'Cepo'], inflacion: ['🛒', 'Inflación'],
    estabilidad: ['👍', 'Aprobación'], precio: ['🌍', 'Precio en el mundo'], leyes: ['📜', 'Tus leyes'], retenciones: ['🌾', 'Retenciones'],
    energia: ['⚡', 'Energía'], talento: ['🎓', 'Gente preparada'], mundo: ['🚀', 'Bonanza'], tamano: ['📏', 'Ya es grande'],
  };

  // ── Obras del Estado ──
  // Cada nivel nuevo cuesta un poco más y tarda un poco más que el anterior (lo fácil ya se hizo).
  prod.COSTO_PC = 2;
  prod.extra = (s, id) => Math.max(0, s.prod.sec[id].nivel - R.SECTOR[id].nivel0);
  prod.cuadrillas = (s) => 1 + Math.floor(s.eco.calidad.infra / 40);
  prod.mesesObra = (s, id) => Math.max(2, Math.round(R.SECTOR[id].meses * (1.25 - s.eco.calidad.infra / 200) * (1 + 0.08 * prod.extra(s, id))));
  prod.gastoObra = (s, id) => R.round(R.SECTOR[id].gasto * (1 + 0.12 * prod.extra(s, id)), 2); // % del presupuesto por mes
  // Lo que suma cada nivel al PBI baja a medida que el sector crece.
  prod.pbiNivel = (s, id) => R.SECTOR[id].pbi * Math.sqrt(R.SECTOR[id].nivel0 / Math.max(R.SECTOR[id].nivel0, s.prod.sec[id].nivel));
  prod.bloqueoConstruir = function (s, id) {
    const P = s.prod;
    if (P.sec[id].nivel + P.obras.filter((o) => o.id === id).length >= R.NIVEL_MAX_SECTOR) return 'Ya está al máximo';
    if (P.obras.length >= prod.cuadrillas(s)) return 'No hay cuadrillas libres (mejorá las rutas)';
    if (s.gob.pc < prod.COSTO_PC) return 'Falta ⭐';
    return null;
  };
  prod.construir = function (s, id) {
    prod.asegurar(s);
    const b = prod.bloqueoConstruir(s, id);
    if (b) return { error: b };
    const x = R.SECTOR[id];
    s.gob.pc -= prod.COSTO_PC;
    const meses = prod.mesesObra(s, id);
    s.prod.obras.push({ id, meses, total: meses, gasto: prod.gastoObra(s, id) });
    R.diario(s, '🔨', 'Arrancó una obra: ' + x.obra.toLowerCase(), 'gobierno');
    return { txt: '🔨 Arrancó la obra: ' + x.emoji + ' ' + x.nombre + ' en ' + meses + ' meses', bueno: true, aplicado: [], aprobAntes: s.gob.aprob, aprobDespues: s.gob.aprob };
  };

  // Un sector sube o baja un nivel.
  prod.subir = function (s, id, quien) {
    const x = R.SECTOR[id];
    const st = s.prod.sec[id];
    if (st.nivel >= R.NIVEL_MAX_SECTOR) return false;
    const pbi = prod.pbiNivel(s, id);
    st.nivel++;
    st.pbiSumado = (st.pbiSumado || []).concat(pbi);
    s.eco.pbi *= 1 + pbi / 100;
    s.eco.shocks.push({ k: 'crec', v: 0.4, meses: 3 });
    if (s.gob) {
      s.gob.bonusEmpleo = (s.gob.bonusEmpleo || 0) + x.empleo;
      const g = s.gob.grupos[x.grupo];
      if (g) g.humor = R.clamp(g.humor + 2, 0, 100);
    }
    const txt = quien === 'estado' ? 'Terminó la obra' : quien === 'privado' ? 'Inversión privada' : 'Inversión extranjera';
    R.diario(s, x.emoji, txt + ': ' + x.nombre + ' sube a nivel ' + st.nivel, 'gobierno');
    s.prod.novedades.push({ id, sube: true, quien });
    return true;
  };
  prod.bajar = function (s, id) {
    const x = R.SECTOR[id];
    const st = s.prod.sec[id];
    if (st.nivel <= 1) return false;
    st.nivel--;
    const pbi = (st.pbiSumado && st.pbiSumado.length ? st.pbiSumado.pop() : x.pbi);
    s.eco.pbi /= 1 + pbi / 100;
    if (s.gob) {
      s.gob.bonusEmpleo = (s.gob.bonusEmpleo || 0) - x.empleo;
      const g = s.gob.grupos[x.grupo];
      if (g) g.humor = R.clamp(g.humor - 3, 0, 100);
    }
    R.diario(s, '🏚️', x.nombre + ': cierran empresas, baja a nivel ' + st.nivel, 'gobierno');
    s.prod.novedades.push({ id, sube: false });
    return true;
  };

  // ── Precios del mundo ──
  prod.precios = function (s) {
    const M = s.mundo;
    for (const k of Object.keys(R.PRODUCTOS)) {
      M.preciosAntes[k] = M.precios[k];
      let meta = 1;
      for (const c of M.ciclos.activos) {
        const X = prod.CICLO[c.id];
        if (X.precios && X.precios[k]) meta += X.precios[k];
      }
      M.precios[k] = R.clamp(M.precios[k] + (meta - M.precios[k]) * 0.18 + R.gauss(s) * 0.025, 0.45, 1.9);
    }
  };

  // ── Ciclos: se avisan, se preparan, pegan y terminan ──
  prod.ciclos = function (s, momentos) {
    const C = s.mundo.ciclos;
    for (const c of C.activos) c.quedan--;
    for (const c of C.activos.filter((x) => x.quedan <= 0)) {
      R.diario(s, '✅', prod.CICLO[c.id].nombre + ': ya pasó', 'mundo');
      s.prod.novedades.push({ ciclo: c.id, fin: true });
    }
    C.activos = C.activos.filter((c) => c.quedan > 0);
    if (C.proximo) {
      C.proximo.en--;
      if (C.proximo.en <= 0) {
        prod.activarCiclo(s, C.proximo);
        C.proximo = null;
      }
    } else if (s.mes - C.ultimo >= 7 && R.chance(s, 0.14)) {
      const op = prod.CICLOS.filter((x) => !C.activos.some((a) => a.id === x.id));
      let r = R.rand(s) * R.sum(op.map((x) => x.peso));
      let elegido = op[0];
      for (const x of op) { r -= x.peso; if (r <= 0) { elegido = x; break; } }
      C.proximo = { id: elegido.id, en: elegido.aviso, prep: false };
      C.ultimo = s.mes;
      R.diario(s, '📡', 'Se viene: ' + elegido.nombre, 'mundo');
      if (momentos) momentos.push({ tipo: 'aviso_mundo', id: elegido.id });
    }
  };
  prod.bloqueoPreparar = function (s) {
    const C = s.mundo && s.mundo.ciclos;
    if (!C || !C.proximo) return 'No hay nada que preparar';
    if (C.proximo.prep) return 'Ya te preparaste';
    const X = prod.CICLO[C.proximo.id];
    if (s.gob.pc < (X.prep.costo.pc || 0)) return 'Falta ⭐';
    return null;
  };
  prod.preparar = function (s) {
    const b = prod.bloqueoPreparar(s);
    if (b) return { error: b };
    const C = s.mundo.ciclos;
    const X = prod.CICLO[C.proximo.id];
    C.proximo.prep = true;
    s.gob.pc -= X.prep.costo.pc || 0;
    const ef = Object.assign({}, X.prep.ef || {}, X.prep.costo.gasto ? { gastoExtra: X.prep.costo.gasto } : {});
    const antes = s.gob.aprob;
    const aplicado = R.gob.aplicarEfectos(s, ef);
    R.diario(s, X.emoji, 'Te preparaste: ' + X.prep.txt.toLowerCase(), 'mundo');
    return { txt: X.prep.txt + ' ✅', bueno: true, aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob };
  };
  prod.activarCiclo = function (s, prox) {
    const X = prod.CICLO[prox.id];
    const mitiga = prox.prep ? X.prep.mitiga || 0 : 0;
    const dura = X.dura[0] + Math.floor(R.rand(s) * (X.dura[1] - X.dura[0] + 1));
    s.mundo.ciclos.activos.push({ id: X.id, quedan: dura, mitiga, atrae: prox.prep ? X.prep.atrae || null : null });
    for (const [k, v] of Object.entries(X.shocks || {})) s.eco.shocks.push({ k, v: v * (X.bueno ? 1 : 1 - mitiga), meses: dura });
    if (X.grupos) {
      const ef = {};
      for (const [g, v] of Object.entries(X.grupos)) ef[g] = v * (1 - mitiga);
      R.gob.aplicarEfectos(s, ef);
    }
    R.diario(s, X.emoji, X.nombre + (mitiga ? ' (te preparaste: pega menos)' : ''), 'mundo');
    s.prod.novedades.push({ ciclo: X.id, empieza: true });
  };
  // Para mostrar: qué hace un ciclo (precios y golpes), en chips de efectos.
  prod.efectosCiclo = function (X) {
    const precios = Object.entries(X.precios || {}).map(([k, v]) => ({ k, v }));
    const ef = {};
    if (X.shocks) {
      if (X.shocks.crec) ef.crec = X.shocks.crec;
      if (X.shocks.riesgo) ef.riesgo = X.shocks.riesgo;
      if (X.shocks.reservas) ef.reservas = X.shocks.reservas * 6;
      if (X.shocks.infl) ef.inflacion = X.shocks.infl * 4;
    }
    Object.assign(ef, X.grupos || {});
    if (X.sector && X.sector.campo) ef.expo = -0.1;
    return { precios, ef };
  };

  // ── El mes de la producción ──
  prod.mes = function (s, momentos) {
    prod.asegurar(s);
    const P = s.prod;
    const e = s.eco;
    P.novedades = [];
    // 1) Obras: cuestan plata cada mes; al terminar, el sector sube.
    for (const o of P.obras) {
      const pct = o.gasto ?? R.SECTOR[o.id].gasto;
      const g = R.eco.gastoComoPBI(s, pct);
      e.gastoExtraMes += g;
      e.gastoExtraAnio += g;
      P.invertido = (P.invertido || 0) + pct;
      o.meses--;
      if (o.meses <= 0) prod.subir(s, o.id, 'estado');
    }
    P.obras = P.obras.filter((o) => o.meses > 0);
    // 2) Inversión privada (y cierres si el clima es muy malo).
    for (const x of R.SECTORES) {
      const a = prod.atractivo(s, x.id);
      if (R.chance(s, a.chance)) prod.subir(s, x.id, 'privado');
      else if (a.cierre && R.chance(s, a.cierre)) prod.bajar(s, x.id);
    }
    // 3) El mundo: precios y ciclos.
    if (s.mundo) {
      prod.precios(s);
      prod.ciclos(s, momentos);
    }
  };
})(globalThis.R = globalThis.R || {});
