// Motor de metas: el gran objetivo del mandato y las metas que aparecen solas, con barra, plazo, premio y castigo.
(function (R) {
  'use strict';

  const met = (R.metas = {});

  met.asegurar = function (s) {
    if (!s.metas) s.metas = { grande: null, activas: [], hechas: {}, fallidas: {} };
    return s.metas;
  };

  // Tu ideología decide qué grandes objetivos te ofrecen.
  met.ideaDe = (s) => (s.partido.ideo <= -0.2 ? 'estado' : s.partido.ideo >= 0.2 ? 'mercado' : 'centro');
  met.opcionesGrandes = (s) => R.METAS_GRANDES.filter((m) => m.idea === met.ideaDe(s));

  met.FIN_GRANDE = 44; // meses desde que asumís: se define antes de la elección

  met.elegirGrande = function (s, id) {
    met.asegurar(s);
    const M = R.META[id];
    s.metas.grande = id;
    s.metas.activas = s.metas.activas.filter((a) => !R.META[a.id].grande);
    s.metas.activas.unshift({ id, desde: s.mes, hasta: s.gob.inicio + met.FIN_GRANDE, base: M.dato(s) });
    R.diario(s, '👑', 'Tu gran objetivo: ' + M.nombre, 'gobierno');
  };

  // 0 a 1: cuánto del camino recorriste desde que apareció la meta.
  met.progreso = function (s, a) {
    const M = R.META[a.id];
    const v = M.dato(s);
    const desde = a.base;
    const hasta = M.objetivo;
    if (met.cumplida(s, a.id)) return 1;
    const tramo = hasta - desde;
    if (Math.abs(tramo) < 1e-9) return 0;
    return R.clamp((v - desde) / tramo, 0, 1);
  };
  met.cumplida = function (s, id) {
    const M = R.META[id];
    const v = M.dato(s);
    return M.baja ? v <= M.objetivo : v >= M.objetivo;
  };
  met.quedan = (s, a) => Math.max(0, a.hasta - s.mes);

  // Cuánto falta y cómo llegar. Para las metas de un sector: niveles que faltan (contando las obras en marcha)
  // y cuántos meses tardarías con tus cuadrillas si construís sin parar.
  met.camino = function (s, a) {
    const M = R.META[a.id];
    const v = M.dato(s);
    const out = { hoy: M.fmt(v), meta: M.fmt(M.objetivo), como: M.como || [] };
    if (M.sector && s.prod) {
      const enObra = s.prod.obras.filter((o) => o.id === M.sector).length;
      const faltan = Math.max(0, Math.ceil(M.objetivo - v) - enObra);
      out.sector = M.sector;
      out.faltan = faltan;
      out.enObra = enObra;
      const c = R.prod.cuadrillas(s);
      out.meses = faltan ? Math.ceil(faltan / c) * R.prod.mesesObra(s, M.sector) : 0;
      out.cuadrillas = c;
    }
    return out;
  };
  // La meta activa que apunta a un sector (para mostrarla en la hoja del sector).
  met.deSector = (s, id) => (s.metas ? s.metas.activas.find((a) => R.META[a.id].sector === id) : null);

  // Cada mes: se cumplen, vencen o aparecen metas. Devuelve los momentos para mostrar.
  met.mes = function (s, momentos) {
    met.asegurar(s);
    const S = s.metas;
    // Partidas guardadas antes de que existieran las metas: se ofrece el gran objetivo una vez.
    if (!S.grande && !S.ofrecido) { S.ofrecido = true; momentos.push({ tipo: 'legado' }); }
    const seguir = [];
    for (const a of S.activas) {
      const M = R.META[a.id];
      if (met.cumplida(s, a.id)) {
        const aplicado = R.gob.aplicarEfectos(s, M.premio);
        S.hechas[a.id] = s.mes;
        R.diario(s, '🎯', '¡Meta cumplida! ' + M.nombre, 'gobierno');
        momentos.push({ tipo: 'meta', id: a.id, ok: true, aplicado });
      } else if (s.mes >= a.hasta) {
        const aplicado = R.gob.aplicarEfectos(s, M.castigo || {});
        S.fallidas[a.id] = s.mes;
        R.diario(s, '⌛', 'No llegaste: ' + M.nombre, 'gobierno');
        momentos.push({ tipo: 'meta', id: a.id, ok: false, aplicado });
      } else seguir.push(a);
    }
    S.activas = seguir;
    // Nuevas (como mucho 3 a la vez, además del gran objetivo; la misma no vuelve antes de 2 años).
    const chicas = () => S.activas.filter((a) => !R.META[a.id].grande).length;
    for (const M of R.METAS) {
      if (chicas() >= 3) break;
      if (S.activas.some((a) => a.id === M.id)) continue;
      const ultima = Math.max(S.hechas[M.id] ?? -99, S.fallidas[M.id] ?? -99);
      if (s.mes - ultima < 24) continue;
      let ok = false;
      try { ok = M.si(s); } catch (err) { ok = false; }
      if (!ok || met.cumplida(s, M.id)) continue;
      S.activas.push({ id: M.id, desde: s.mes, hasta: s.mes + M.plazo, base: M.dato(s) });
      R.diario(s, '🎯', 'Nueva meta: ' + M.nombre, 'gobierno');
    }
  };
})(globalThis.R = globalThis.R || {});
