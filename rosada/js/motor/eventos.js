// Motor de noticias: elige una noticia que cumpla su condición, arma el texto y aplica la opción elegida.
(function (R) {
  'use strict';

  const ev = (R.ev = {});
  R.EVENTOS = R.EVENTOS || [];
  ev.registrar = (lista) => lista.forEach((e) => R.EVENTOS.push(e));
  ev.porId = (id) => R.EVENTOS.find((e) => e.id === id);

  // Elige una noticia para esta fase (o null). Cada una sale una sola vez salvo que diga «repite: meses».
  ev.elegir = function (s, fase) {
    const posibles = R.EVENTOS.filter((e) => {
      if (e.fase !== fase) return false;
      const visto = s.vistos[e.id];
      if (visto !== undefined && (!e.repite || s.mes - visto < e.repite)) return false;
      if (e.desde !== undefined && s.mes < e.desde) return false;
      if (e.hasta !== undefined && s.mes > e.hasta) return false;
      try {
        return !e.cuando || e.cuando(s);
      } catch (err) {
        return false;
      }
    });
    const e = R.weighted(s, posibles, (x) => (typeof x.peso === 'function' ? x.peso(s) : x.peso ?? 1));
    if (!e) return null;
    return ev.instanciar(s, e);
  };

  ev.instanciar = function (s, e) {
    s.vistos[e.id] = s.mes;
    return { tipo: 'noticia', id: e.id, vars: e.vars ? e.vars(s) : {}, mes: s.mes };
  };

  function texto(s, t, vars) {
    if (!t) return t;
    return t.replace(/\{(\w+)\}/g, (m, k) => {
      if (k === 'rival' && vars.rival) return R.elec.nombre(s, vars.rival);
      if (k === 'rivalSigla' && vars.rival) return R.elec.sigla(s, vars.rival);
      if (k === 'prov' && vars.prov) return R.PROV[vars.prov].corto;
      if (k === 'lider') return s.lider.nombre;
      if (k === 'partido') return s.partido.sigla;
      return vars[k] !== undefined ? vars[k] : m;
    });
  }

  function resolverValor(s, v, vars) {
    return typeof v === 'function' ? v(s, vars) : v;
  }

  // Noticia lista para dibujar: textos con variables y cada opción con su costo, efectos y si se puede.
  ev.datos = function (s, inst) {
    const e = ev.porId(inst.id);
    if (!e) return null;
    const vars = inst.vars || {};
    return {
      id: e.id,
      dibujo: resolverValor(s, e.dibujo, vars),
      titular: texto(s, resolverValor(s, e.titular, vars), vars),
      bajada: texto(s, resolverValor(s, e.bajada, vars), vars),
      opciones: e.opciones.map((o, i) => {
        const ef = resolverValor(s, o.ef, vars) || {};
        const costo = resolverValor(s, o.costo, vars) || {};
        return {
          i,
          txt: texto(s, o.txt, vars),
          costo,
          ef,
          azar: o.azar ? { p: resolverValor(s, o.azar.p, vars), bueno: !!o.azar.bueno, ef: resolverValor(s, o.azar.ef, vars) || {} } : null,
          bloqueo: ev.bloqueoOpcion(s, costo, o, vars),
        };
      }),
    };
  };

  ev.bloqueoOpcion = function (s, costo, o, vars) {
    if (o.si && !o.si(s, vars)) return o.siTxt || 'No se puede';
    if (costo.fondos && s.camp && costo.fondos > s.camp.fondos) return 'Falta plata';
    if (costo.agenda && s.camp && costo.agenda > s.camp.agenda) return 'Sin agenda';
    if (R.gob && R.gob.bloqueoCosto) return R.gob.bloqueoCosto(s, costo);
    return null;
  };

  // Aplica la opción i. Devuelve { txt, bueno, aplicado: [...] }.
  ev.resolver = function (s, inst, i) {
    const e = ev.porId(inst.id);
    const o = e.opciones[i];
    const vars = inst.vars || {};
    const costo = resolverValor(s, o.costo, vars) || {};
    let ef = JSON.parse(JSON.stringify(resolverValor(s, o.ef, vars) || {}));
    let txt = texto(s, o.res, vars) || null;
    let bueno = o.bueno ?? true;
    if (o.azar && R.chance(s, resolverValor(s, o.azar.p, vars))) {
      ef = R.sumarEfectos(ef, resolverValor(s, o.azar.ef, vars));
      txt = texto(s, o.azar.txt, vars) || txt;
      bueno = o.azar.bueno ?? false;
      if (o.azar.flag) s.flags[o.azar.flag] = s.mes;
    }
    const total = R.sumarEfectos(ef, costoComoEfecto(costo));
    const aplicado = R.aplicarEfectosFase(s, total);
    if (o.flag) s.flags[o.flag] = s.mes;
    if (o.despues) o.despues(s, vars);
    s.stats.noticias++;
    const d = ev.datos(s, inst);
    R.diario(s, (d.dibujo || '📰').split(' ')[0], d.titular + ' → ' + d.opciones[i].txt, 'noticia');
    return { txt, bueno, aplicado, ef: total };
  };

  function costoComoEfecto(costo) {
    const out = {};
    if (costo.fondos) out.fondos = -costo.fondos;
    if (costo.agenda) out.agenda = -costo.agenda;
    if (costo.pc) out.pc = -costo.pc;
    if (costo.gasto) out.gastoExtra = costo.gasto;
    return out;
  }

  // Aplica efectos según la fase (en campaña los de campaña; en gobierno se agregan los del gobierno).
  R.aplicarEfectosFase = function (s, ef) {
    if (s.fase === 'gobierno' && R.gob && R.gob.aplicarEfectos) return R.gob.aplicarEfectos(s, ef);
    return R.aplicarEfectos(s, ef);
  };
  R.describirEfectosFase = function (s, ef) {
    if (s.fase === 'gobierno' && R.gob && R.gob.describirEfectos) return R.gob.describirEfectos(s, ef);
    return R.describirEfectos(s, ef);
  };
})(globalThis.R = globalThis.R || {});
