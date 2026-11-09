// Historias de varios capítulos: lo que elegís en una noticia vuelve meses después.
// Se encadenan con s.flags (cada opción marca un flag con el mes; el capítulo siguiente lo mira).
(function (R) {
  'use strict';
  const f = (s, k) => s.flags[k];
  const hace = (s, k, meses) => f(s, k) !== undefined && s.mes - f(s, k) >= meses;
  const nada = (s, ...ks) => ks.every((k) => f(s, k) === undefined);
  const gobernador = (id, v) => (s) => { if (s.gob.gobernadores && s.gob.gobernadores[id]) s.gob.gobernadores[id].rel = R.clamp(s.gob.gobernadores[id].rel + v, 0, 100); };

  R.ev.registrar([
    // ── 1) El FMI: un acuerdo grande que después te revisan ──
    {
      id: 'h_fmi_1', fase: 'gobierno', peso: 3, cuando: (s) => s.gob.meses >= 6 && s.eco.deuda > 75 && nada(s, 'fmiSi', 'fmiNo'), dibujo: '🌐 🤝 💵',
      titular: 'El FMI ofrece un acuerdo grande',
      bajada: 'Capítulo 1 de 2: si firmás, en unos meses revisan tus cuentas.',
      opciones: [
        { txt: 'Firmar', flag: 'fmiSi', ef: { reservas: 12, deuda: 4, riesgo: -150, humildes: -3, jubilados: -3 }, res: 'Llegan los dólares. Y la lupa 🔍' },
        { txt: 'Rechazar', flag: 'fmiNo', ef: { riesgo: 60, trabajadores: 2 }, res: 'Seguimos sin el Fondo' },
      ],
    },
    {
      id: 'h_fmi_2ok', fase: 'gobierno', peso: 6, cuando: (s) => hace(s, 'fmiSi', 8) && nada(s, 'fmiFin') && R.eco.resultado(s) >= -0.5, dibujo: '🌐 ✅ 📋',
      titular: 'El FMI aprueba tus cuentas',
      bajada: 'Capítulo 2 de 2: cumpliste. ¿Pedís más o te despedís?',
      opciones: [
        { txt: 'Pedir más plata', flag: 'fmiFin', ef: { reservas: 6, deuda: 2, riesgo: -40 }, res: 'Otro desembolso 💵' },
        { txt: 'Pagar y despedirlo', flag: 'fmiFin', ef: { reservas: -5, deuda: -3, riesgo: -80, prestigio: 6, todos: 2 }, res: '«Chau, Fondo»: le pagamos todo 👋' },
      ],
    },
    {
      id: 'h_fmi_2mal', fase: 'gobierno', peso: 6, cuando: (s) => hace(s, 'fmiSi', 8) && nada(s, 'fmiFin') && R.eco.resultado(s) < -0.5, dibujo: '🌐 ⚠️ ✂️',
      titular: 'El FMI amenaza con cortar la plata',
      bajada: 'Capítulo 2 de 2: no cumpliste con el déficit.',
      opciones: [
        { txt: 'Ajustar', flag: 'fmiFin', ef: { humildes: -4, media: -2, riesgo: -60 },
          despues: (s) => { for (const a of R.AREAS) s.eco.niveles[a.id] = Math.max(R.eco.NIVEL_MIN, R.round(s.eco.niveles[a.id] - 0.05, 2)); }, res: 'Tijera en todo el presupuesto ✂️' },
        { txt: 'Romper con el FMI', flag: 'fmiFin', ef: { riesgo: 250, reservas: -4, trabajadores: 3, prestigio: -3 }, res: 'Portazo al Fondo 🚪' },
      ],
    },

    // ── 2) Un escándalo en Obra Pública (un secretario inventado) ──
    {
      id: 'h_esc_1', fase: 'gobierno', peso: 2, cuando: (s) => s.gob.meses >= 8 && nada(s, 'escEchado', 'escDefendido'), dibujo: '🏗️ 💰 🕵️',
      titular: 'Denuncian coimas en Obra Pública',
      bajada: 'Capítulo 1 de 3: apuntan a tu secretario de Obras.',
      opciones: [
        { txt: 'Echarlo ya', flag: 'escEchado', ef: { escandalo: 1, media: 2 }, res: 'Renunció el secretario 🚪' },
        { txt: 'Defenderlo', flag: 'escDefendido', ef: { escandalo: 2, trabajadores: 1 }, res: '«Es una operación», dijiste' },
      ],
    },
    {
      id: 'h_esc_2', fase: 'gobierno', peso: 6, cuando: (s) => hace(s, 'escDefendido', 3) && nada(s, 'escPerdon', 'escNiega'), dibujo: '🎧 📰 😱',
      titular: 'Aparecen audios de tu secretario',
      bajada: 'Capítulo 2 de 3: lo defendiste y ahora hay pruebas.',
      opciones: [
        { txt: 'Pedir perdón', flag: 'escPerdon', ef: { escandalo: 2, todos: -3, media: 1 }, res: 'Perdón en cadena nacional 🙏' },
        { txt: 'Decir que es falso', flag: 'escNiega', ef: { escandalo: 3, media: -5 }, res: 'Nadie te cree mucho 😬' },
      ],
    },
    {
      id: 'h_esc_3', fase: 'gobierno', peso: 6, cuando: (s) => hace(s, 'escNiega', 4) && nada(s, 'escFin'), dibujo: '⚖️ 🏛️ 🕵️',
      titular: 'Un juez cita a tu secretario',
      bajada: 'Capítulo 3 de 3: ¿lo dejás declarar?',
      opciones: [
        { txt: 'Que declare', flag: 'escFin', ef: { escandalo: 2, media: 3 }, res: 'Declaró. Se aclaró bastante ⚖️' },
        { txt: 'Indultarlo', flag: 'escFin', costo: { pc: 3 }, ef: { escandalo: 5, media: -6, todos: -2 }, res: 'Indulto polémico 😡' },
      ],
    },

    // ── 3) Neuquén y Vaca Muerta: las regalías ──
    {
      id: 'h_nqn_1', fase: 'gobierno', peso: 3, cuando: (s) => s.prod && R.prod.nivel(s, 'energia') >= 6 && nada(s, 'nqnSi', 'nqnNo'), dibujo: '🛢️ 🏔️ 💰',
      titular: 'Neuquén pide más regalías por Vaca Muerta',
      bajada: 'Capítulo 1 de 2: el gobernador quiere su parte.',
      opciones: [
        { txt: 'Darle más', flag: 'nqnSi', ef: { gastoExtra: 2 }, despues: gobernador('NQN', 15), res: 'El gobernador sonríe 😄' },
        { txt: 'No', flag: 'nqnNo', despues: gobernador('NQN', -15), res: 'El gobernador se enoja 😠' },
      ],
    },
    {
      id: 'h_nqn_2si', fase: 'gobierno', peso: 6, cuando: (s) => hace(s, 'nqnSi', 6) && nada(s, 'nqnFin'), dibujo: '🛢️ 🤝 🏗️',
      titular: 'Neuquén invierte las regalías en pozos',
      bajada: 'Capítulo 2 de 2: la plata volvió en forma de energía.',
      opciones: [
        { txt: 'Inaugurar juntos', flag: 'nqnFin', ef: { todos: 2, empresarios: 2 }, despues: (s) => { if (s.prod) R.prod.subir(s, 'energia', 'extranjera'); }, res: 'Pozos nuevos ⛽ +1' },
      ],
    },
    {
      id: 'h_nqn_2no', fase: 'gobierno', peso: 6, cuando: (s) => hace(s, 'nqnNo', 3) && nada(s, 'nqnFin'), dibujo: '🛢️ 🚫 🔥',
      titular: 'Neuquén amenaza con cortar el gas',
      bajada: 'Capítulo 2 de 2: dijiste que no a las regalías.',
      opciones: [
        { txt: 'Negociar', flag: 'nqnFin', costo: { pc: 2 }, ef: { gastoExtra: 1 }, despues: gobernador('NQN', 10), res: 'Acuerdo de último momento 🤝' },
        { txt: 'Intervenir la provincia', flag: 'nqnFin', ef: { escandalo: 2, media: -3, todos: -1 }, res: 'Intervención federal 🚨' },
        { txt: 'Aguantar', flag: 'nqnFin', ef: { empresarios: -3 }, despues: (s) => { if (s.prod) R.prod.bajar(s, 'energia'); }, res: 'Cortan el gas: ⛽ −1' },
      ],
    },
  ]);
})(globalThis.R = globalThis.R || {});
