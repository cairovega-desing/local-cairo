// Elecciones: PASO, generales, ballotage y legislativas. Reparto de bancas (D'Hondt y Senado).
(function (R) {
  'use strict';

  const elec = (R.elec = {});

  // ── Congreso por «tandas» (año en que se eligió cada grupo de bancas) ──
  R.congresoInicial = function () {
    return {
      dip: { 2025: Object.assign({}, R.CONGRESO_INICIAL.diputados) },
      sen: {
        2023: { MNP: 11, PL: 4, AR: 3, UCF: 4, PROV: 2 }, // grupo B (se renueva en 2029)
        2025: { PL: 12, MNP: 8, PROV: 2, AR: 1, UCF: 1 }, // grupo C (se renueva en 2031)
      },
    };
  };
  R.composicion = function (s, camara) {
    const out = {};
    const tandas = s.congreso[camara === 'senado' ? 'sen' : 'dip'];
    for (const t of Object.values(tandas)) for (const [p, n] of Object.entries(t)) out[p] = (out[p] || 0) + n;
    return out;
  };
  R.TOTAL_BANCAS = { diputados: 257, senado: 72 };

  // Diputados que renueva cada provincia: en años «A» (2027, 2031…) se usa renovA, en los otros el resto.
  const impares = R.PROVINCIAS.filter((p) => p.dip % 2 === 1).sort((a, b) => b.padron - a.padron).slice(0, 11).map((p) => p.id);
  elec.renuevaDip = function (prov, anio) {
    const a = Math.floor(prov.dip / 2) + (impares.includes(prov.id) ? 1 : 0);
    return ((anio - 2027) / 2) % 2 === 0 ? a : prov.dip - a;
  };

  // D'Hondt con piso (en % de votos).
  elec.dhondt = function (votos, bancas, piso) {
    const partidos = Object.keys(votos).filter((k) => votos[k] >= (piso ?? 3));
    const out = Object.fromEntries(partidos.map((k) => [k, 0]));
    for (let i = 0; i < bancas; i++) {
      let mejor = null;
      let mejorQ = -1;
      for (const k of partidos) {
        const q = votos[k] / (out[k] + 1);
        if (q > mejorQ) {
          mejorQ = q;
          mejor = k;
        }
      }
      if (mejor === null) break;
      out[mejor]++;
    }
    return out;
  };

  const ordenar = (nac) => Object.entries(nac).map(([id, v]) => ({ id, v })).sort((a, b) => b.v - a.v);

  // Calcula votos reales: encuesta + ruido + efecto de los fiscales.
  elec.contar = function (s) {
    const ruido = {};
    for (const p of R.PROVINCIAS) for (const id of R.RIVALES) ruido[p.id + id] = R.gauss(s);
    const swing = R.gauss(s) * 1.2;
    const gobierno = s.fase === 'gobierno' && R.elec.votosGobierno;
    const r = (gobierno ? R.elec.votosGobierno : R.camp.votos)(s, { ruido, extraYo: swing });
    // Fiscales: con poca militancia «te roban» parte de los votos en las mesas (gobernando tenés el aparato).
    const mil = s.camp.militancia;
    const perdida = !gobierno && mil < 45 ? ((45 - mil) / 45) * 0.08 : 0;
    let perdidos = 0;
    for (const p of R.PROVINCIAS) {
      const v = r.prov[p.id];
      const quita = v.YO * perdida;
      if (quita > 0) {
        const top = R.RIVALES.reduce((a, b) => (v[a] > v[b] ? a : b));
        v.YO -= quita;
        v[top] += quita;
        perdidos += (quita * p.padron) / 100;
      }
    }
    const nac = { YO: 0 };
    R.RIVALES.forEach((id) => (nac[id] = 0));
    for (const p of R.PROVINCIAS) for (const k in r.prov[p.id]) nac[k] += (r.prov[p.id][k] * p.padron) / 100;
    return { nac, prov: r.prov, perdidos };
  };

  function ganadoresPorProvincia(prov) {
    const out = {};
    for (const id in prov) {
      const v = prov[id];
      out[id] = Object.keys(v).reduce((a, b) => (v[a] > v[b] ? a : b));
    }
    return out;
  }

  // Bancas legislativas que se eligen este año.
  elec.bancas = function (s, prov, anio) {
    const dip = {};
    const sen = {};
    const tuyos = { dip: {}, sen: {} };
    const grupo = R.SENADO_GRUPO[anio];
    for (const p of R.PROVINCIAS) {
      const d = elec.dhondt(prov[p.id], elec.renuevaDip(p, anio), 3);
      for (const [k, n] of Object.entries(d)) {
        dip[k] = (dip[k] || 0) + n;
        if (k === 'YO' && n) tuyos.dip[p.id] = n;
      }
      if (p.sen === grupo) {
        const o = ordenar(prov[p.id]);
        sen[o[0].id] = (sen[o[0].id] || 0) + 2;
        sen[o[1].id] = (sen[o[1].id] || 0) + 1;
        if (o[0].id === 'YO') tuyos.sen[p.id] = 2;
        else if (o[1].id === 'YO') tuyos.sen[p.id] = 1;
      }
    }
    return { dip, sen, tuyos };
  };

  elec.renovarCongreso = function (s, anio, bancas) {
    delete s.congreso.dip[anio - 4];
    delete s.congreso.sen[anio - 6];
    s.congreso.dip[anio] = bancas.dip;
    s.congreso.sen[anio] = bancas.sen;
  };

  // PASO: los que no llegan al 1,5 % quedan afuera.
  elec.paso = function (s) {
    const c = elec.contar(s);
    const lista = ordenar(c.nac);
    const res = {
      tipo: 'paso', titulo: 'PASO 2027', anio: R.anio(s.mes), lista, prov: c.prov,
      ganadores: ganadoresPorProvincia(c.prov), pasa: c.nac.YO >= 1.5, perdidos: c.perdidos,
    };
    s.elecciones.paso = res;
    return res;
  };

  // Generales: presidente + Congreso.
  elec.general = function (s) {
    const anio = R.anio(s.mes);
    const c = elec.contar(s);
    const lista = ordenar(c.nac);
    const [a, b] = lista;
    const directo = a.v >= 45 || (a.v >= 40 && a.v - b.v >= 10);
    const bancas = elec.bancas(s, c.prov, anio);
    elec.renovarCongreso(s, anio, bancas);
    const res = {
      tipo: 'general', titulo: 'Elecciones generales ' + anio, anio, lista, prov: c.prov,
      ganadores: ganadoresPorProvincia(c.prov), perdidos: c.perdidos, bancas,
      ganador: directo ? a.id : null, ballotage: directo ? null : [a.id, b.id],
    };
    s.elecciones.general = res;
    return res;
  };

  // Ballotage: los votos de los demás se reparten por cercanía de ideas (y cuánto les caés vos).
  elec.ballotage = function (s, pares) {
    const [A, B] = pares;
    const c = elec.contar(s);
    const ideo = (id) => (id === 'YO' ? s.partido.ideo : R.PARTIDOS[id].ideo);
    const prov = {};
    const nac = { [A]: 0, [B]: 0 };
    for (const p of R.PROVINCIAS) {
      const v = c.prov[p.id];
      // El partido tradicional tiene aparato: micros, punteros y fiscales en todas las mesas.
      let va = v[A] + (A !== 'YO' ? 3 : 0);
      let vb = v[B] + (B !== 'YO' ? 3 : 0);
      for (const k in v) {
        if (k === A || k === B) continue;
        const da = Math.abs(ideo(k) - ideo(A));
        const db = Math.abs(ideo(k) - ideo(B));
        let wa = Math.exp(-1.6 * da);
        let wb = Math.exp(-1.6 * db);
        // Al que no conocen mucho le tienen miedo; al que cae bien, lo votan.
        const simp = s.fase === 'gobierno' && s.gob ? s.gob.aprob : s.camp.simpatia;
        if (A === 'YO') wa *= 0.45 + 0.6 * (simp / 100);
        if (B === 'YO') wb *= 0.45 + 0.6 * (simp / 100);
        // Si ninguno de los dos se parece a lo que votaron, muchos votan en blanco.
        const vota = 0.92 - 0.25 * Math.min(da, db);
        va += (v[k] * vota * wa) / (wa + wb);
        vb += (v[k] * vota * wb) / (wa + wb);
      }
      const t = va + vb;
      prov[p.id] = { [A]: (va / t) * 100, [B]: (vb / t) * 100 };
      nac[A] += (prov[p.id][A] * p.padron) / 100;
      nac[B] += (prov[p.id][B] * p.padron) / 100;
    }
    const lista = ordenar(nac);
    const res = {
      tipo: 'ballotage', titulo: 'Ballotage ' + R.anio(s.mes), anio: R.anio(s.mes), lista, prov,
      ganadores: ganadoresPorProvincia(prov), ganador: lista[0].id, perdidos: c.perdidos,
    };
    s.elecciones.ballotage = res;
    return res;
  };

  // Elección de medio término: solo Congreso.
  elec.legislativa = function (s) {
    const anio = R.anio(s.mes);
    const c = elec.contar(s);
    const lista = ordenar(c.nac);
    const bancas = elec.bancas(s, c.prov, anio);
    elec.renovarCongreso(s, anio, bancas);
    const res = {
      tipo: 'legislativa', titulo: 'Medio término ' + anio, anio, lista, prov: c.prov,
      ganadores: ganadoresPorProvincia(c.prov), perdidos: 0, bancas, ganador: lista[0].id,
    };
    s.elecciones.legislativa = res;
    R.diario(s, '🗳️', 'Medio término: ' + (res.ganador === 'YO' ? 'ganaste con ' : 'sacaste ') + R.pct(lista.find((x) => x.id === 'YO').v), 'eleccion');
    return res;
  };

  // Nombre lindo de un competidor.
  elec.nombre = function (s, id) {
    if (id === 'YO') return s.lider.nombre;
    return R.PARTIDOS[id].candidato.nombre;
  };
  elec.color = (s, id) => (id === 'YO' ? s.partido.color : R.PARTIDOS[id].color);
  elec.sigla = (s, id) => (id === 'YO' ? s.partido.sigla : R.PARTIDOS[id].sigla);
})(globalThis.R = globalThis.R || {});
