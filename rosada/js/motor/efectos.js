// Efectos: cómo se aplican y cómo se muestran (icono + flechas, sin números raros).
// Un objeto de efectos es plano: { conocen: +5, simpatia: -2, fondos: 20, presencia: { BUE: 10 }, rival: { MNP: -2 } }.
(function (R) {
  'use strict';

  // paso = cuánto vale una flecha. inverso = subir es malo para vos.
  R.EF_META = {
    conocen: { emoji: '👁️', nombre: 'Te conocen', paso: 3 },
    simpatia: { emoji: '❤️', nombre: 'Les caés bien', paso: 2 },
    militancia: { emoji: '🏴', nombre: 'Militancia', paso: 4 },
    fondos: { emoji: '💰', nombre: 'Fondos', paso: 15, numero: true },
    sucio: { emoji: '⚠️', nombre: 'Riesgo de escándalo', paso: 1, inverso: true },
    agenda: { emoji: '⏱️', nombre: 'Agenda', paso: 1, numero: true },
    presencia: { emoji: '📍', nombre: 'Apoyo local', paso: 8 },
    rival: { emoji: '🗡️', nombre: 'Rival', paso: 1.5, inverso: true },
    votos: { emoji: '🗳️', nombre: 'Votos', paso: 1.5 },
    aprobRival: { emoji: '🏛️', nombre: 'Gobierno rival', paso: 3, inverso: true },
  };

  function flechas(meta, v) {
    return Math.min(3, Math.max(1, Math.ceil(Math.abs(v) / meta.paso - 0.15)));
  }

  // Convierte efectos que dependen de la ideología del jugador en simpatía concreta.
  // ideoDer: n → +n si sos de derecha, −n si sos de izquierda (proporcional a cuánto).
  function simpatiaIdeologica(s, ef) {
    let d = 0;
    if (ef.ideoDer) d += ef.ideoDer * s.partido.ideo;
    if (ef.ideoIzq) d += ef.ideoIzq * -s.partido.ideo;
    if (ef.confrontativo) d += ef.confrontativo * s.partido.estilo;
    if (ef.dialoguista) d += ef.dialoguista * -s.partido.estilo;
    return d;
  }

  // Expande un efecto a sus deltas concretos (sin aplicarlos). Devuelve una lista [{k, v, sub}].
  R.expandirEfectos = function (s, ef) {
    const out = [];
    if (!ef) return out;
    let simp = (ef.simpatia || 0) + simpatiaIdeologica(s, ef);
    // Rendimientos decrecientes: cuanto más alto estás, más cuesta seguir subiendo.
    if (simp > 0 && s.camp) simp *= R.clamp(1 - (s.camp.simpatia - 50) / 40, 0.2, 1);
    for (const k of ['conocen', 'militancia', 'fondos', 'sucio', 'agenda']) {
      if (!ef[k]) continue;
      let v = ef[k];
      if (k === 'conocen' && v > 0 && s.camp) v *= R.clamp(1 - (s.camp.conocen - 40) / 80, 0.3, 1);
      out.push({ k, v: R.round(v, 2) });
    }
    if (Math.abs(simp) >= 0.05) out.push({ k: 'simpatia', v: R.round(simp, 2) });
    if (ef.presencia) {
      for (const [where, v] of Object.entries(ef.presencia)) {
        out.push({ k: 'presencia', v, sub: where });
      }
    }
    if (ef.rival) {
      for (const [id, v] of Object.entries(ef.rival)) out.push({ k: 'rival', v, sub: id });
    }
    if (ef.votos) out.push({ k: 'votos', v: ef.votos });
    if (ef.aprobRival && s.gobRival) out.push({ k: 'aprobRival', v: ef.aprobRival });
    return out;
  };

  function provinciasDe(where) {
    if (where === 'todas') return R.PROVINCIAS.map((p) => p.id);
    if (R.REGIONES[where]) return R.PROVINCIAS.filter((p) => p.region === where).map((p) => p.id);
    if (R.PROV[where]) return [where];
    return [];
  }

  R.aplicarEfectos = function (s, ef) {
    const lista = R.expandirEfectos(s, ef);
    const c = s.camp;
    for (const { k, v, sub } of lista) {
      switch (k) {
        case 'conocen': c.conocen = R.clamp(c.conocen + v, 0, 100); break;
        case 'simpatia': c.simpatia = R.clamp(c.simpatia + v, 0, 100); break;
        case 'militancia': c.militancia = R.clamp(c.militancia + v, 0, 100); break;
        case 'fondos': c.fondos = Math.max(0, c.fondos + v); break;
        case 'sucio': c.sucio = Math.max(0, c.sucio + v); break;
        case 'agenda': c.agenda = Math.max(0, c.agenda + v); break;
        case 'presencia':
          provinciasDe(sub).forEach((id) => { c.presencia[id] = R.clamp(c.presencia[id] + v, 0, 100); });
          break;
        case 'rival': if (s.rivales[sub] !== undefined) s.rivales[sub] += v; break;
        case 'votos': c.bonusVotos += v; break;
        case 'aprobRival': if (s.gobRival) s.gobRival.aprob = R.clamp(s.gobRival.aprob + v, 10, 85); break;
      }
    }
    return lista;
  };

  // Para dibujar: [{emoji, nombre, flechas, sube, bueno, sub}]
  R.describirEfectos = function (s, ef) {
    return R.expandirEfectos(s, ef).map(({ k, v, sub }) => {
      const meta = R.EF_META[k] || { emoji: '•', nombre: k, paso: 1 };
      let nombre = meta.nombre;
      let emoji = meta.emoji;
      if (k === 'presencia') nombre = (R.PROV[sub] ? R.PROV[sub].corto : R.REGIONES[sub] ? R.REGIONES[sub].nombre : 'Todo el país');
      if (k === 'rival') {
        const p = R.PARTIDOS[sub];
        nombre = p ? p.sigla : sub;
        emoji = p ? p.simbolo : emoji;
      }
      const sube = v > 0;
      const bueno = meta.inverso ? !sube : sube;
      return { k, emoji, nombre, v, sube, bueno, flechas: flechas(meta, v), numero: meta.numero, sub };
    });
  };

  // Describe una lista ya aplicada [{k, v, sub}] (sin volver a escalar los valores).
  R.describirAplicado = function (s, lista) {
    if (s.fase === 'gobierno' && R.gob && R.gob.describirAplicado) return R.gob.describirAplicado(s, lista);
    return lista.map(({ k, v, sub }) => {
      const out = R.describirEfectos({ partido: s.partido, camp: null }, sub ? { [k]: { [sub]: v } } : { [k]: v });
      return out[0];
    }).filter(Boolean);
  };

  // Suma dos objetos de efectos (para combinar costo + resultado).
  R.sumarEfectos = function (a, b) {
    const out = JSON.parse(JSON.stringify(a || {}));
    for (const [k, v] of Object.entries(b || {})) {
      if (v && typeof v === 'object') {
        out[k] = out[k] || {};
        for (const [k2, v2] of Object.entries(v)) out[k][k2] = (out[k][k2] || 0) + v2;
      } else out[k] = (out[k] || 0) + v;
    }
    return out;
  };
})(globalThis.R = globalThis.R || {});
