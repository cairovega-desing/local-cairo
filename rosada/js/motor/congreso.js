// Congreso (leyes, porotos, negociación, decretos), gobernadores y elecciones durante el gobierno.
(function (R) {
  'use strict';

  const con = (R.congreso = {});
  const BLOQUES = ['MNP', 'PL', 'AR', 'UCF', 'FT', 'PROV'];
  con.BLOQUES = BLOQUES;
  const ideoDe = (s, id) => (id === 'YO' ? s.partido.ideo : R.PARTIDOS[id].ideo);

  con.iniciar = function (s) {
    const G = s.gob;
    G.rel = {};
    for (const b of BLOQUES) G.rel[b] = R.clamp(Math.round(68 - 45 * Math.abs(ideoDe(s, b) - s.partido.ideo) - 8 * s.partido.estilo), 10, 85);
    G.negocia = {}; // ley → { bloque: puntos }
    G.leyesEstado = {}; // ley → { estado: 'aprobada'|'rechazada'|'dnu', mes }
    G.gobernadores = {};
    const v = s.elecciones.general ? s.elecciones.general.prov : null;
    for (const p of R.PROVINCIAS) {
      let partido = R.GOBERNADORES_INICIALES[p.id];
      if (v && v[p.id] && v[p.id].YO >= 36 && Object.keys(v[p.id]).every((k) => k === 'YO' || v[p.id][k] <= v[p.id].YO)) partido = 'YO';
      G.gobernadores[p.id] = con.nuevoGobernador(s, p.id, partido);
    }
  };

  const NOMBRES = ['Héctor', 'Miriam', 'Oscar', 'Gladys', 'Raúl', 'Silvia', 'Walter', 'Norma', 'Daniel', 'Liliana', 'Jorge', 'Beatriz', 'Ricardo', 'Graciela', 'Sergio', 'Adriana'];
  const APELLIDOS = ['Zamora', 'Insaurralde', 'Bustos', 'Saá', 'Herrera', 'Lescano', 'Bordón', 'Cáceres', 'Funes', 'Gómez', 'Orellana', 'Vera', 'Ponce', 'Albornoz', 'Lucero', 'Arce'];
  con.nuevoGobernador = function (s, prov, partido) {
    const nombre = R.pick(s, NOMBRES) + ' ' + R.pick(s, APELLIDOS);
    const rel = partido === 'YO' ? 90 : R.clamp(Math.round(70 - 35 * Math.abs(ideoDe(s, partido) - s.partido.ideo)), 25, 80);
    return {
      partido, nombre, rel, pide: R.pick(s, Object.keys(R.PEDIDOS)), enfr: -99,
      avatar: { piel: R.randInt(s, 0, 4), pelo: R.randInt(s, 0, 5), colorPelo: R.randInt(s, 0, 5), anteojos: R.randInt(s, 0, 2), barba: R.randInt(s, 0, 2), ropa: R.randInt(s, 0, 4) },
    };
  };

  // Cuánto te bancan los gobernadores de cada partido (promedio ponderado por población).
  con.relGobernadores = function (s, partido) {
    let tot = 0;
    let w = 0;
    for (const p of R.PROVINCIAS) {
      const g = s.gob.gobernadores[p.id];
      if (g.partido !== partido) continue;
      tot += g.rel * p.dip;
      w += p.dip;
    }
    return w ? tot / w : 50;
  };

  con.mayoria = function (s) {
    if (!s.gob || !s.gob.rel) return false;
    const d = R.composicion(s, 'diputados');
    const se = R.composicion(s, 'senado');
    return (d.YO || 0) >= 129 && (se.YO || 0) >= 37;
  };

  con.necesarios = (ley, camara) => {
    const total = R.TOTAL_BANCAS[camara];
    return ley && ley.mayoria === 'dos_tercios' ? Math.ceil((total * 2) / 3) : Math.floor(total / 2) + 1;
  };

  // Qué tan lejos queda una ley de lo que piensa un bloque. Si la ley va para su lado pero no tan lejos,
  // la ven como un paso en la dirección correcta («no es todo lo que queremos, pero va»): cuenta mucho menos.
  // Así la LLA vota leyes de mercado aunque sean tibias, y la izquierda vota las del Estado presente.
  con.distancia = (leyIdeo, ideo) => {
    const d = Math.abs(leyIdeo - ideo);
    const suLado = leyIdeo * ideo > 0 && Math.abs(leyIdeo) >= 0.15 && Math.abs(leyIdeo) <= Math.abs(ideo);
    return suLado ? d * 0.3 : d;
  };

  // Por qué vota cada bloque como vota: cada factor suma (a favor) o resta (en contra).
  con.factores = function (s, ley, bloque) {
    const G = s.gob;
    const dist = con.distancia(ley.ideo, ideoDe(s, bloque));
    // Si la idea es suya («es nuestra bandera»), la empujan aunque estén peleados con vos: votar en contra
    // de lo que siempre pidieron les cuesta caro. Y la polémica tampoco los asusta tanto.
    const suya = Math.abs(ley.ideo) >= 0.15 ? R.clamp(1 - dist / 0.5, 0, 1) : 0; // las leyes neutras no son bandera de nadie
    let relacion = (G.rel[bloque] - 50) / 35;
    if (relacion < 0) relacion *= 1 - 0.55 * suya;
    return {
      idea: 1.7 * (0.5 - dist) + 0.5 * suya,
      relacion,
      aprob: (G.aprob - 45) / 45,
      polemica: -ley.polemica * 0.7 * (1 - 0.7 * suya),
      negocia: (G.negocia[ley.id] && G.negocia[ley.id][bloque]) || 0,
      gobernadores: (con.relGobernadores(s, bloque) - 50) / (bloque === 'PROV' ? 30 : 70),
      dosTercios: ley.mayoria === 'dos_tercios' ? -0.5 : 0,
    };
  };

  // Probabilidad de que un bloque vote a favor (0 … 1).
  con.apoyo = function (s, ley, bloque) {
    if (bloque === 'YO') return 0.98;
    const x = R.sum(Object.values(con.factores(s, ley, bloque)));
    return 1 / (1 + Math.exp(-x * 2.2));
  };

  // El motivo principal, en palabras: { pro: '💡 Le gusta la idea', contra: '😠 Está peleado con vos', proK, contraK }.
  const MOTIVOS = {
    idea: ['💡 Le gusta la idea', '🙅 No le gusta la idea'],
    relacion: ['🤝 Se lleva bien con vos', '😠 Está peleado con vos'],
    aprob: ['👍 Te va bien en encuestas', '👎 Te va mal en encuestas'],
    polemica: [null, '🔥 Es muy polémica'],
    negocia: ['🤝 Ya negociaron', null],
    gobernadores: ['🗺️ Sus gobernadores te bancan', '🗺️ Sus gobernadores, enojados'],
    dosTercios: [null, '⚠️ Necesita 2/3'],
  };
  con.motivos = function (s, ley, bloque) {
    const f = Object.entries(con.factores(s, ley, bloque)).filter(([, v]) => Math.abs(v) >= 0.15);
    const pro = f.filter(([k, v]) => v > 0 && MOTIVOS[k][0]).sort((a, b) => b[1] - a[1])[0];
    const contra = f.filter(([k, v]) => v < 0 && MOTIVOS[k][1]).sort((a, b) => a[1] - b[1])[0];
    return { pro: pro ? MOTIVOS[pro[0]][0] : null, contra: contra ? MOTIVOS[contra[0]][1] : null, proK: pro && pro[0], contraK: contra && contra[0] };
  };

  // Porotos esperados por cámara: { camara: { si, no, necesarios, bloques: [{id, n, p, postura}] } }
  con.porotos = function (s, ley) {
    const out = {};
    for (const camara of ['diputados', 'senado']) {
      const comp = R.composicion(s, camara);
      let si = 0;
      const bloques = [];
      for (const [id, n] of Object.entries(comp)) {
        if (!n) continue;
        const p = con.apoyo(s, ley, id);
        si += n * p;
        bloques.push({ id, n, p, postura: p > 0.7 ? 'si' : p < 0.3 ? 'no' : 'duda' });
      }
      bloques.sort((a, b) => b.n - a.n);
      out[camara] = { si: Math.round(si), total: R.TOTAL_BANCAS[camara], necesarios: con.necesarios(ley, camara), bloques };
    }
    return out;
  };

  con.bloqueoLey = function (s, ley) {
    const st = s.gob.leyesEstado[ley.id];
    if (st && (st.estado === 'aprobada' || st.estado === 'dnu')) return 'Ya es ley';
    if (st && st.estado === 'rechazada' && s.mes - st.mes < 6) return 'Rechazada: de nuevo en ' + (6 - (s.mes - st.mes)) + ' meses';
    if (ley.requiere && !ley.requiere(s)) return ley.requiereTxt || 'No se puede todavía';
    return null;
  };
  con.COSTO_PRESENTAR = 2;

  // Negociar con un bloque: cuesta ⭐ según su tamaño.
  con.costoNegociar = (s, bloque) => {
    const n = (R.composicion(s, 'diputados')[bloque] || 0) + (R.composicion(s, 'senado')[bloque] || 0) * 2;
    return R.clamp(1 + Math.round(n / 35), 1, 4);
  };
  con.negociar = function (s, ley, bloque) {
    const G = s.gob;
    const c = con.costoNegociar(s, bloque);
    if (G.pc < c) return { error: 'Falta capital político ⭐' };
    G.pc -= c;
    G.negocia[ley.id] = G.negocia[ley.id] || {};
    G.negocia[ley.id][bloque] = (G.negocia[ley.id][bloque] || 0) + 0.9;
    G.rel[bloque] = R.clamp(G.rel[bloque] + 3, 0, 100);
    return { ok: true, costo: c };
  };
  // Fondos a las provincias: sube la relación con todos los gobernadores.
  con.fondosGobernadores = function (s, ley) {
    const G = s.gob;
    R.gob.aplicarEfectos(s, { gastoExtra: 1.5 });
    G.negocia[ley.id] = G.negocia[ley.id] || {};
    for (const b of BLOQUES) G.negocia[ley.id][b] = (G.negocia[ley.id][b] || 0) + (b === 'PROV' ? 1.0 : 0.3);
    for (const p of R.PROVINCIAS) G.gobernadores[p.id].rel = R.clamp(G.gobernadores[p.id].rel + 5, 0, 100);
    return { ok: true };
  };

  // Conteo real: cada banca vota según la probabilidad de su bloque (sin consecuencias).
  con.contarVotos = function (s, ley) {
    const res = { camaras: {}, aprobada: true };
    for (const camara of ['diputados', 'senado']) {
      const comp = R.composicion(s, camara);
      const votos = [];
      let si = 0;
      for (const [id, n] of Object.entries(comp)) {
        const p = con.apoyo(s, ley, id);
        for (let i = 0; i < n; i++) {
          const v = R.rand(s) < p;
          if (v) si++;
          votos.push({ id, si: v });
        }
      }
      const nec = con.necesarios(ley, camara);
      const pasa = si >= nec;
      res.camaras[camara] = { si, no: R.TOTAL_BANCAS[camara] - si, necesarios: nec, pasa, votos };
      if (!pasa) { res.aprobada = false; break; } // si no pasa Diputados, el Senado no la trata
    }
    return res;
  };

  // Votar una ley: cuesta ⭐ y, si sale, se promulga.
  con.votar = function (s, ley) {
    const G = s.gob;
    G.pc = Math.max(0, G.pc - con.COSTO_PRESENTAR);
    const res = con.contarVotos(s, ley);
    if (res.aprobada) res.aplicado = con.promulgar(s, ley, 'aprobada');
    else {
      G.leyesEstado[ley.id] = { estado: 'rechazada', mes: s.mes };
      res.aplicado = R.gob.aplicarEfectos(s, { pc: -1 });
      R.diario(s, '❌', 'El Congreso rechazó: ' + ley.nombre, 'ley');
    }
    delete G.negocia[ley.id];
    return res;
  };

  con.promulgar = function (s, ley, como) {
    const G = s.gob;
    G.leyesEstado[ley.id] = { estado: como, mes: s.mes };
    G.leyes[ley.id] = true;
    const ef = Object.assign({}, ley.ef || {});
    if (ley.costo && ley.costo.gasto) ef.gastoExtra = ley.costo.gasto;
    if (ley.perm) {
      // Lo económico madura de a poco (ley.madura meses); lo que siente cada grupo (bonusGrupo) es desde ya.
      const p = ley.perm;
      const meses = ley.madura || 18;
      G.madurando = G.madurando || [];
      const madura = (k, v, sub) => G.madurando.push({ ley: ley.id, k, v, sub, desde: s.mes, meses });
      for (const k of ['bonusEmpleo', 'bonusCrec', 'bonusExpo', 'bonusRecauda']) {
        if (p[k]) { G[k] = (G[k] || 0) + p[k]; madura(k, p[k]); }
      }
      if (p.bonusCalidad) { G.bonusCalidad = G.bonusCalidad || {}; for (const [k, v] of Object.entries(p.bonusCalidad)) { G.bonusCalidad[k] = (G.bonusCalidad[k] || 0) + v; madura('bonusCalidad', v, k); } }
      if (p.bonusGrupo) { G.bonusGrupo = G.bonusGrupo || {}; for (const [k, v] of Object.entries(p.bonusGrupo)) G.bonusGrupo[k] = (G.bonusGrupo[k] || 0) + v; }
    }
    if (ley.hacer) ley.hacer(s);
    // Los bloques que piensan parecido se acercan; los otros se alejan un poco.
    for (const b of BLOQUES) G.rel[b] = R.clamp(G.rel[b] + (con.distancia(ley.ideo, ideoDe(s, b)) < 0.5 ? 2 : -2), 0, 100);
    R.diario(s, ley.emoji, (como === 'dnu' ? 'Decreto: ' : 'Nueva ley: ') + ley.nombre, 'ley');
    return R.gob.aplicarEfectos(s, ef);
  };

  // Decreto (DNU): sin Congreso, pero cuesta y puede caerse.
  con.COSTO_DNU = 4;
  con.dnu = function (s, ley) {
    const G = s.gob;
    if (!ley.dnu) return { error: 'Esta ley no se puede sacar por decreto' };
    if (G.pc < con.COSTO_DNU) return { error: 'Falta capital político ⭐' };
    G.pc -= con.COSTO_DNU;
    const aplicado = con.promulgar(s, ley, 'dnu').concat(R.gob.aplicarEfectos(s, { media: -4, escandalo: 1 }));
    G.dnuPendientes = (G.dnuPendientes || []).concat([{ ley: ley.id, mes: s.mes }]);
    return { ok: true, aplicado };
  };

  // ── Gobernadores ──
  con.ACC_PROV = [
    { id: 'obras', emoji: '🏗️', nombre: 'Obra pública', costo: { gasto: 1 }, rel: 15, ef: { infra: 1, trabajadores: 1 } },
    { id: 'fondos', emoji: '💸', nombre: 'Mandar fondos', costo: { gasto: 0.8 }, rel: 20, ef: {} },
    { id: 'visita', emoji: '🤝', nombre: 'Visitarlo', costo: { pc: 1 }, rel: 8, ef: {} },
  ];
  con.bloqueoProv = function (s, provId, acc) {
    const g = s.gob.gobernadores[provId];
    if (s.mes - g.enfr < 3) return 'De nuevo en ' + (3 - (s.mes - g.enfr)) + (3 - (s.mes - g.enfr) === 1 ? ' mes' : ' meses');
    if (acc.costo.pc && s.gob.pc < acc.costo.pc) return 'Falta ⭐';
    return null;
  };
  con.accionProvincia = function (s, provId, accId) {
    const acc = con.ACC_PROV.find((a) => a.id === accId);
    const g = s.gob.gobernadores[provId];
    const b = con.bloqueoProv(s, provId, acc);
    if (b) return { error: b };
    const pedido = g.pide === accId;
    const subir = acc.rel * (pedido ? 1.6 : 1);
    g.rel = R.clamp(g.rel + subir, 0, 100);
    g.enfr = s.mes;
    if (pedido) g.pide = R.pick(s, Object.keys(R.PEDIDOS).filter((k) => k !== accId));
    s.camp.presencia[provId] = R.clamp((s.camp.presencia[provId] || 0) + (accId === 'visita' ? 12 : 6), 0, 100);
    const ef = Object.assign({}, acc.ef);
    if (acc.costo.gasto) ef.gastoExtra = acc.costo.gasto;
    if (acc.costo.pc) ef.pc = -acc.costo.pc;
    const aplicado = R.gob.aplicarEfectos(s, ef);
    R.diario(s, acc.emoji, acc.nombre + ' en ' + R.PROV[provId].corto, 'provincia');
    return { ok: true, txt: (pedido ? '¡Justo lo que pedía! ' : '') + g.nombre + ' te agradece', subir: Math.round(subir), aplicado, bueno: true };
  };

  // Cada mes los gobernadores se olvidan un poco de los favores.
  con.mes = function (s) {
    const G = s.gob;
    if (!G.gobernadores) return;
    for (const p of R.PROVINCIAS) {
      const g = G.gobernadores[p.id];
      const meta = g.partido === 'YO' ? 85 : 45 + G.aprob * 0.2;
      g.rel = R.clamp(g.rel + (meta - g.rel) * 0.03, 0, 100);
    }
    for (const b of BLOQUES) G.rel[b] = R.clamp(G.rel[b] + ((40 + G.aprob * 0.25) - G.rel[b]) * 0.02, 0, 100);
  };

  // ── Votos durante el gobierno: tu aprobación manda ──
  R.elec.votosGobierno = function (s, opts) {
    opts = opts || {};
    const G = s.gob;
    const nac = { YO: 0 };
    R.RIVALES.forEach((id) => (nac[id] = 0));
    const prov = {};
    // El opositor más fuerte junta el voto enojado.
    const opositor = R.RIVALES.slice().sort((a, b) => R.PARTIDOS[b].base - R.PARTIDOS[a].base)[0];
    for (const p of R.PROVINCIAS) {
      const af = R.camp.afinidad(s, p);
      const gob = G.gobernadores ? G.gobernadores[p.id] : null;
      let yo = (6 + 0.62 * G.aprob) * Math.sqrt(af);
      if (gob && gob.partido === 'YO') yo *= 1.12;
      else if (gob && gob.rel > 70) yo *= 1.04;
      yo += (s.camp.presencia[p.id] || 0) * 0.06 + (opts.extraYo || 0);
      yo = R.clamp(yo, 3, 80);
      const ws = {};
      let tot = 0;
      for (const id of R.RIVALES) {
        const r = R.PARTIDOS[id];
        let w = Math.max(0.3, r.base + s.rivales[id]);
        w *= 1 + (r.fuerte[p.id] || 0);
        w *= R.clamp(1 + 0.7 * (0.5 - Math.abs(p.lean - r.ideo)), 0.45, 1.4);
        if (id === opositor) w *= 1 + Math.max(0, 50 - G.aprob) / 60;
        if (opts.ruido) w *= Math.max(0.2, 1 + opts.ruido[p.id + id] * 0.06);
        ws[id] = w;
        tot += w;
      }
      const res = { YO: yo };
      for (const id of R.RIVALES) res[id] = ((100 - yo) * ws[id]) / tot;
      prov[p.id] = res;
      for (const k in res) nac[k] += (res[k] * p.padron) / 100;
    }
    return { nac, prov };
  };

  // Gobernadores nuevos según quién ganó en cada provincia.
  con.renovarGobernadores = function (s, prov) {
    const G = s.gob;
    const cambios = [];
    for (const p of R.PROVINCIAS) {
      const v = prov[p.id];
      const gana = Object.keys(v).reduce((a, b) => (v[a] > v[b] ? a : b));
      if (gana !== G.gobernadores[p.id].partido) {
        G.gobernadores[p.id] = con.nuevoGobernador(s, p.id, gana);
        cambios.push(p.id);
      }
    }
    return cambios;
  };

  // Gancho que llama gobierno.pasarMes después de avanzar el mes. Devuelve true si cortó el mes.
  R.gob.elecciones = function (s, momentos) {
    const G = s.gob;
    con.mes(s);
    const anio = R.anio(s.mes);
    const m = R.mesDelAnio(s.mes);
    // Presupuesto anual: lo vota el Congreso cada noviembre.
    if (m === 10) momentos.push({ tipo: 'presupuesto' });
    // Decretos que el Congreso puede voltear (a los 3 meses).
    if (G.dnuPendientes && G.dnuPendientes.length) {
      const vence = G.dnuPendientes.filter((d) => s.mes - d.mes >= 3);
      G.dnuPendientes = G.dnuPendientes.filter((d) => s.mes - d.mes < 3);
      for (const d of vence) {
        const ley = R.LEY[d.ley];
        const p = con.porotos(s, ley);
        if (p.diputados.si < p.diputados.total / 2 - 30 && R.chance(s, 0.5)) momentos.push({ tipo: 'dnu_cae', ley: d.ley });
      }
    }
    if (m !== 10 && m !== 11) return false;
    const esMedio = anio % 4 === 1; // 2029, 2033
    const esPresi = anio % 4 === 3; // 2031, 2035
    if (m === 10 && esMedio) {
      R.elec.legislativa(s);
      momentos.push({ tipo: 'eleccion', clave: 'legislativa' });
      return false;
    }
    if (m === 10 && esPresi) {
      if (G.mandato >= 2 && !G.leyes.re_reeleccion) {
        R.gob.terminar(s, momentos, 'mandato');
        return true;
      }
      const res = R.elec.general(s);
      con.renovarGobernadores(s, res.prov);
      momentos.push({ tipo: 'eleccion', clave: 'general' });
      if (res.ganador === 'YO') { G.mandato++; G.lunaMiel = 8; R.diario(s, '🏆', '¡Reelecto/a!', 'eleccion'); }
      else if (res.ballotage && res.ballotage.includes('YO')) { G.ballotage = res.ballotage; }
      else { R.gob.terminar(s, momentos, 'reeleccion'); return true; }
      return false;
    }
    if (m === 11 && G.ballotage) {
      const res = R.elec.ballotage(s, G.ballotage);
      G.ballotage = null;
      momentos.push({ tipo: 'eleccion', clave: 'ballotage' });
      if (res.ganador === 'YO') { G.mandato++; G.lunaMiel = 8; R.diario(s, '🏆', '¡Reelecto/a en el ballotage!', 'eleccion'); }
      else { R.gob.terminar(s, momentos, 'reeleccion'); return true; }
    }
    return false;
  };

  // Votar el presupuesto anual (no cuesta ⭐). Devuelve { ley, res, ok, aplicado }.
  con.votarPresupuesto = function (s, conFondos) {
    const ley = con.leyPresupuesto(s);
    if (conFondos) con.fondosGobernadores(s, ley);
    const res = con.contarVotos(s, ley);
    delete s.gob.negocia.presupuesto;
    const ok = res.aprobada;
    const aplicado = R.gob.aplicarEfectos(s, ok ? con.EF_PRESUPUESTO.si : con.EF_PRESUPUESTO.no);
    R.diario(s, '📒', ley.nombre + (ok ? ': aprobado' : ': rechazado'), 'ley');
    return { ley, res, ok, aplicado };
  };
  con.EF_PRESUPUESTO = { si: { pc: 2, riesgo: -50, todos: 1 }, no: { pc: -2, riesgo: 80, media: -2 } };
  con.efDnuCae = { pc: -2, media: -3, escandalo: 1 };

  // ⚖️ Juicio político: la oposición necesita 2/3 en Diputados (acusar) y 2/3 en el Senado (destituir).
  con.pApoyoJuicio = function (s, bloque) {
    if (bloque === 'YO') return 0.02;
    const G = s.gob;
    const x = (50 - G.rel[bloque]) / 14 + G.escandalo / 8 - (G.aprob - 35) / 18 - 1.2 + (G.juicioFondos || 0) * -0.6;
    return 1 / (1 + Math.exp(-x));
  };
  con.prediccionJuicio = function (s) {
    const out = {};
    for (const camara of ['diputados', 'senado']) {
      const comp = R.composicion(s, camara);
      let si = 0;
      for (const [id, n] of Object.entries(comp)) si += n * con.pApoyoJuicio(s, id);
      out[camara] = { si: Math.round(si), necesarios: Math.ceil((R.TOTAL_BANCAS[camara] * 2) / 3) };
    }
    return out;
  };
  con.votarJuicio = function (s) {
    const res = { camaras: {}, aprobada: true };
    for (const camara of ['diputados', 'senado']) {
      const comp = R.composicion(s, camara);
      const votos = [];
      let si = 0;
      for (const [id, n] of Object.entries(comp)) {
        const p = con.pApoyoJuicio(s, id);
        for (let i = 0; i < n; i++) { const v = R.rand(s) < p; if (v) si++; votos.push({ id, si: v }); }
      }
      const nec = Math.ceil((R.TOTAL_BANCAS[camara] * 2) / 3);
      res.camaras[camara] = { si, no: R.TOTAL_BANCAS[camara] - si, necesarios: nec, pasa: si >= nec, votos };
      if (si < nec) { res.aprobada = false; break; }
    }
    s.gob.juicioFondos = 0;
    if (!res.aprobada) {
      s.gob.escandalo = Math.max(0, s.gob.escandalo - 5);
      res.aplicado = R.gob.aplicarEfectos(s, { pc: 2, todos: 2 });
      R.diario(s, '⚖️', 'Sobreviviste al juicio político', 'ley');
    } else {
      res.aplicado = [];
      R.diario(s, '⚖️', 'El Congreso te destituyó', 'fin');
    }
    return res;
  };

  // Presupuesto anual: ¿lo aprueba el Congreso?
  con.leyPresupuesto = function (s) {
    const def = -R.eco.resultado(s);
    return { id: 'presupuesto', nombre: 'Presupuesto ' + (R.anio(s.mes) + 1), emoji: '📒', ideo: R.clamp(s.partido.ideo * 0.5 - def * 0.15, -1, 1), polemica: R.clamp(0.15 + Math.max(0, def) * 0.12, 0, 1) };
  };
})(globalThis.R = globalThis.R || {});
