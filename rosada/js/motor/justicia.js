// La Justicia: una ley polémica puede terminar en la Corte, que la frena. Vos elegís acatar, apelar (con %) o desobedecer.
(function (R) {
  'use strict';

  const jus = (R.justicia = {});

  // Chance por mes de que la Corte frene una ley: crece con la polémica; los decretos (DNU) caen el doble.
  jus.chance = function (s, ley) {
    const st = s.gob.leyesEstado[ley.id];
    let c = Math.max(0, ley.polemica - 0.45) * 0.15;
    if (st && st.estado === 'dnu') c *= 2;
    if (s.gob.leyes.transparencia) c *= 0.7; // con transparencia los jueces tienen menos de dónde agarrarse
    return c;
  };
  // Chance de ganar la apelación: mejor si la gente te banca.
  jus.chanceApelar = (s) => R.clamp(0.45 + (s.gob.aprob - 50) / 200, 0.2, 0.8);

  jus.mes = function (s, momentos) {
    const G = s.gob;
    G.revisadas = G.revisadas || {};
    if (s.mes - (G.corteMes ?? -99) < 6) return;
    for (const id of Object.keys(G.leyes)) {
      const ley = R.LEY[id];
      const st = G.leyesEstado[id];
      if (!ley || !st || G.revisadas[id] || ley.polemica < 0.55) continue;
      const meses = s.mes - st.mes;
      if (meses < 1) continue;
      if (meses > 10) { G.revisadas[id] = true; continue; }
      if (R.chance(s, jus.chance(s, ley))) {
        G.revisadas[id] = true;
        G.corteMes = s.mes;
        momentos.push({ tipo: 'justicia', ley: id });
        return;
      }
    }
  };

  jus.OPCIONES = [
    { id: 'acatar', emoji: '⚖️', txt: 'Acatar el fallo', costo: {}, ef: { media: 2 } },
    { id: 'apelar', emoji: '📜', txt: 'Apelar', costo: { pc: 2 }, ef: {} },
    { id: 'desobedecer', emoji: '😤', txt: 'No acatar', costo: {}, ef: { escandalo: 3, media: -4, riesgo: 80 } },
  ];
  jus.resolver = function (s, m, id) {
    const op = jus.OPCIONES.find((o) => o.id === id);
    const G = s.gob;
    const ley = R.LEY[m.ley];
    if (op.costo.pc && G.pc < op.costo.pc) return { error: 'Falta ⭐' };
    if (op.costo.pc) G.pc -= op.costo.pc;
    const antes = G.aprob;
    let txt;
    let bueno = true;
    let aplicado = R.gob.aplicarEfectos(s, op.ef);
    if (id === 'acatar') {
      R.congreso.derogar(s, ley.id, 'corte');
      txt = '⚖️ Acataste: ' + ley.nombre + ' queda frenada';
      bueno = false;
    } else if (id === 'apelar') {
      if (R.chance(s, jus.chanceApelar(s))) {
        txt = '📜 ¡Ganaste la apelación! ' + ley.nombre + ' sigue';
        R.diario(s, '📜', 'Ganaste la apelación: ' + ley.nombre, 'ley');
      } else {
        R.congreso.derogar(s, ley.id, 'corte');
        aplicado = aplicado.concat(R.gob.aplicarEfectos(s, { media: -1 }));
        txt = '📜 Perdiste la apelación: ' + ley.nombre + ' cae';
        bueno = false;
      }
    } else {
      txt = '😤 No acataste: ' + ley.nombre + ' sigue, pero hay escándalo';
      R.diario(s, '😤', 'No acataste a la Corte por ' + ley.nombre, 'ley');
      bueno = false;
    }
    return { txt, bueno, aplicado, aprobAntes: antes, aprobDespues: G.aprob };
  };
})(globalThis.R = globalThis.R || {});
