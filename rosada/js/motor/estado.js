// Estado de la partida: creación, guardado y carga.
(function (R) {
  'use strict';

  const CLAVE = 'rosada_partida_v1';

  R.DIFICULTADES = {
    facil: { nombre: 'Fácil', emoji: '😊', fondos: 140, agenda: 4, rival: 0.9, mult: 1.15 },
    normal: { nombre: 'Normal', emoji: '😐', fondos: 100, agenda: 3, rival: 1, mult: 1 },
    dificil: { nombre: 'Difícil', emoji: '😈', fondos: 70, agenda: 3, rival: 1.1, mult: 0.88 },
  };

  // cfg: { partido: {nombre, sigla, color, simbolo, ideo, estilo}, lider: {nombre, avatar}, dificultad, semilla? }
  R.nuevaPartida = function (cfg) {
    const dif = R.DIFICULTADES[cfg.dificultad] ? cfg.dificultad : 'normal';
    const D = R.DIFICULTADES[dif];
    const semilla = (cfg.semilla ?? Math.floor(Math.random() * 2 ** 31)) | 0;
    const s = {
      v: R.VERSION,
      semilla,
      rng: semilla,
      fase: 'campana',
      mes: 0,
      dif,
      partido: {
        nombre: cfg.partido.nombre,
        sigla: cfg.partido.sigla,
        color: cfg.partido.color,
        simbolo: cfg.partido.simbolo,
        bandera: cfg.partido.bandera || null,
        ideo: R.clamp(cfg.partido.ideo ?? 0, -1, 1),
        estilo: R.clamp(cfg.partido.estilo ?? 0, -1, 1),
      },
      lider: { nombre: cfg.lider.nombre, avatar: cfg.lider.avatar },
      camp: {
        fondos: D.fondos,
        agenda: D.agenda,
        agendaMax: D.agenda,
        conocen: 6,
        simpatia: 52,
        relevancia: 5,
        militancia: 8,
        presencia: {},
        visitas: {},
        figuras: [],
        alianza: null,
        sucio: 0,
        usadasMes: {},
        bonusVotos: 0,
      },
      rivales: Object.fromEntries(R.RIVALES.map((id) => [id, 0])),
      encuestas: [],
      elecciones: {},
      congreso: null,
      diario: [],
      cola: [], // momentos pendientes de mostrar (noticias por decidir, resultados…)
      vistos: {},
      flags: {},
      stats: { acciones: 0, noticias: 0 },
    };
    R.PROVINCIAS.forEach((p) => {
      s.camp.presencia[p.id] = 0;
      s.camp.visitas[p.id] = 0;
    });
    s.congreso = R.congresoInicial();
    s.encuestas.push(R.camp.encuesta(s));
    R.diario(s, '🎉', 'Nace ' + s.partido.nombre);
    return s;
  };

  R.diario = function (s, emoji, txt, tipo) {
    s.diario.unshift({ mes: s.mes, emoji, txt, tipo: tipo || 'info' });
    if (s.diario.length > 120) s.diario.length = 120;
  };

  // ── Guardado (el navegador puede no tener localStorage: todo con try/catch) ──
  R.guardar = function (s) {
    try {
      globalThis.localStorage && globalThis.localStorage.setItem(CLAVE, JSON.stringify(s));
      return true;
    } catch (e) {
      return false;
    }
  };
  R.cargar = function () {
    try {
      const txt = globalThis.localStorage && globalThis.localStorage.getItem(CLAVE);
      if (!txt) return null;
      const s = JSON.parse(txt);
      if (!s || s.v !== R.VERSION) return null;
      return s;
    } catch (e) {
      return null;
    }
  };
  R.borrarPartida = function () {
    try {
      globalThis.localStorage && globalThis.localStorage.removeItem(CLAVE);
    } catch (e) {
      /* nada */
    }
  };

  // Preferencias (sonido, tutorial visto…) aparte de la partida.
  R.pref = function (clave, valor) {
    const K = 'rosada_pref_' + clave;
    try {
      if (valor === undefined) {
        const v = globalThis.localStorage && globalThis.localStorage.getItem(K);
        return v === null || v === undefined ? undefined : JSON.parse(v);
      }
      globalThis.localStorage && globalThis.localStorage.setItem(K, JSON.stringify(valor));
    } catch (e) {
      return undefined;
    }
    return valor;
  };
})(globalThis.R = globalThis.R || {});
