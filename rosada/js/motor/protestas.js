// Grupos con poder: cada grupo tiene 💪 poder (cuánto puede presionar, no cuántos votos tiene) y, si está muy enojado,
// junta 😡 bronca hasta que arma su jugada (paro, tractorazo, fuga de capitales…). Vos elegís: ceder, negociar o aguantar.
(function (R) {
  'use strict';

  const pro = (R.protestas = {});

  // 💪 Poder: lo cambian los sectores (más industria = sindicatos más fuertes, más campo = el campo pesa más) y algunas leyes.
  pro.poder = function (s) {
    const n = (id) => (R.prod && s.prod ? R.prod.nivel(s, id) : R.SECTOR[id].nivel0);
    const L = (id) => !!(s.gob && s.gob.leyes[id]);
    const e = s.eco;
    const crudo = {
      trabajadores: 16 + n('industria') * 1.6 - (L('reforma_sindical') ? 8 : 0) + (L('reforma_laboral') ? -3 : 0),
      campo: 7 + n('campo') * 1.5,
      empresarios: 7 + n('energia') * 1.0 + n('industria') * 0.5 + n('tecno') * 0.6,
      media: 15 + n('tecno') * 1.2,
      humildes: 9 + Math.max(0, e.pobreza - 20) * 0.35,
      jubilados: 9,
    };
    const tot = R.sum(Object.values(crudo));
    return Object.fromEntries(Object.entries(crudo).map(([k, v]) => [k, (v / tot) * 100]));
  };
  // Qué tan fuerte pega una protesta de ese grupo (0,6 a ~1,9).
  pro.fuerza = (s, id) => 0.6 + pro.poder(s)[id] / 25;

  pro.UMBRAL = 36; // por debajo de este humor el grupo empieza a juntar bronca
  pro.LIMITE = 10; // con esta bronca sale a la calle

  // Lo que hace cada grupo cuando explota. aguantar se multiplica por la fuerza del grupo.
  pro.TIPOS = {
    trabajadores: {
      emoji: '✊', titulo: 'Paro general de la CGT', dibujo: '🏭 ✊ 🚫', pide: 'Sueldos que alcancen',
      ceder: { txt: 'Bono y paritaria', ef: { trabajadores: 10, gastoExtra: 3, inflacion: 0.3 } },
      negociar: { txt: 'Mesa con la CGT', pc: 2, ef: { trabajadores: 5 } },
      aguantar: { txt: 'No ceder', ef: { crec: -1.2, trabajadores: -4, empresarios: 2 } },
    },
    campo: {
      emoji: '🚜', titulo: 'Tractorazo y paro del campo', dibujo: '🚜 🌾 🛑', pide: 'Menos retenciones',
      ceder: { txt: 'Bajar retenciones', ef: { campo: 9 }, hacer: (s) => { if (s.eco.retenciones > 0) s.eco.retenciones--; }, si: (s) => s.eco.retenciones > 0,
        alt: { txt: 'Créditos para el campo', ef: { campo: 8, gastoExtra: 2 } } },
      negociar: { txt: 'Mesa de enlace', pc: 2, ef: { campo: 5 } },
      aguantar: { txt: 'No ceder', ef: { expo: -0.08, reservas: -3, campo: -4 } },
    },
    empresarios: {
      emoji: '💸', titulo: 'Fuga de capitales', dibujo: '💼 💸 ✈️', pide: 'Reglas claras y menos impuestos',
      ceder: { txt: 'Bajar impuestos', ef: { empresarios: 9 }, hacer: (s) => { if (s.eco.impuestos > 0) s.eco.impuestos--; }, si: (s) => s.eco.impuestos > 0,
        alt: { txt: 'Exenciones', ef: { empresarios: 8, gastoExtra: 2 } } },
      negociar: { txt: 'Reunión en la Rosada', pc: 2, ef: { empresarios: 5, riesgo: -40 } },
      aguantar: { txt: 'No ceder', ef: { reservas: -5, riesgo: 150, dolar: 6, empresarios: -3 } },
    },
    media: {
      emoji: '🍳', titulo: 'Cacerolazo en todo el país', dibujo: '🍳 🏙️ 📢', pide: 'Que se note una mejora',
      ceder: { txt: 'Alivio para la clase media', ef: { media: 9, gastoExtra: 2 } },
      negociar: { txt: 'Cadena nacional', pc: 2, ef: { media: 5 } },
      aguantar: { txt: 'Ignorarlo', ef: { media: -4, todos: -1, escandalo: 1 } },
    },
    humildes: {
      emoji: '🔥', titulo: 'Piquetes y cortes de ruta', dibujo: '🔥 🛣️ 🪧', pide: 'Comida y trabajo',
      ceder: { txt: 'Más ayuda social', ef: { humildes: 10, gastoExtra: 3, media: -2 } },
      negociar: { txt: 'Acuerdo con los movimientos', pc: 2, ef: { humildes: 5 } },
      aguantar: { txt: 'Despejar las rutas', ef: { crec: -0.6, humildes: -5, media: 2, escandalo: 1 } },
    },
    jubilados: {
      emoji: '👵', titulo: 'Marcha de jubilados al Congreso', dibujo: '👵 🏛️ 🪧', pide: 'Que la jubilación alcance',
      ceder: { txt: 'Bono para jubilados', ef: { jubilados: 10, gastoExtra: 2 } },
      negociar: { txt: 'Recibirlos', pc: 1, ef: { jubilados: 5 } },
      aguantar: { txt: 'No recibirlos', ef: { jubilados: -5, media: -2, escandalo: 1 } },
    },
  };

  // Las 3 opciones de una protesta, ya con los números finales (aguantar pega según el poder del grupo).
  pro.opciones = function (s, grupo) {
    const T = pro.TIPOS[grupo];
    const f = pro.fuerza(s, grupo);
    const ceder = T.ceder.si && !T.ceder.si(s) ? T.ceder.alt : T.ceder;
    const aguantarEf = {};
    for (const [k, v] of Object.entries(T.aguantar.ef)) aguantarEf[k] = k === 'escandalo' ? v : R.round(v * f, 2);
    return [
      { id: 'ceder', emoji: '🤝', txt: ceder.txt, ef: ceder.ef, hacer: ceder.hacer, costo: {} },
      { id: 'negociar', emoji: '🗣️', txt: T.negociar.txt, ef: T.negociar.ef, costo: { pc: T.negociar.pc } },
      { id: 'aguantar', emoji: '🧱', txt: T.aguantar.txt, ef: aguantarEf, costo: {} },
    ];
  };
  pro.bloqueo = (s, op) => (op.costo.pc && s.gob.pc < op.costo.pc ? 'Falta ⭐' : null);

  pro.resolver = function (s, grupo, id) {
    const op = pro.opciones(s, grupo).find((o) => o.id === id);
    const b = pro.bloqueo(s, op);
    if (b) return { error: b };
    const T = pro.TIPOS[grupo];
    const st = s.gob.grupos[grupo];
    if (op.costo.pc) s.gob.pc -= op.costo.pc;
    if (op.hacer) op.hacer(s);
    const antes = s.gob.aprob;
    const aplicado = R.gob.aplicarEfectos(s, op.ef);
    st.bronca = id === 'ceder' ? 0 : id === 'negociar' ? 2 : 5;
    s.gob.protestas = (s.gob.protestas || 0) + 1;
    const txt = id === 'ceder' ? T.emoji + ' Cediste: se levanta la protesta' : id === 'negociar' ? '🗣️ Negociaste: se calma por ahora' : '🧱 Aguantaste: la protesta pegó fuerte';
    R.diario(s, T.emoji, T.titulo + ': ' + op.txt.toLowerCase(), 'gobierno');
    return { txt, bueno: id !== 'aguantar', aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob };
  };

  // Cada mes: los grupos muy enojados juntan bronca; el más caliente puede salir a la calle (una protesta cada 3 meses como mucho).
  pro.mes = function (s, momentos) {
    const G = s.gob;
    const pod = pro.poder(s);
    let candidato = null;
    for (const g of R.GRUPOS) {
      const st = G.grupos[g.id];
      st.bronca = st.bronca || 0;
      // Un golpe fuerte de un mes para el otro (una reforma, un ajuste) también calienta, aunque el grupo esté bien.
      // (los primeros meses no cuentan: la gente se está acomodando al gobierno nuevo).
      const golpe = G.meses >= 4 ? Math.max(0, (st.antes ?? st.humor) - st.humor - 2) * 0.9 * (0.5 + pod[g.id] / 25) : 0;
      if (st.humor < pro.UMBRAL) st.bronca += ((pro.UMBRAL - st.humor) / 6) * (0.5 + pod[g.id] / 25) + golpe;
      else st.bronca = Math.max(0, st.bronca + golpe - (st.humor > 50 ? 1.2 : 0.5));
      // Un grupo contento no sale a la calle aunque venga calentito.
      if (st.bronca >= pro.LIMITE && st.humor < 50 && (!candidato || st.bronca > G.grupos[candidato].bronca)) candidato = g.id;
    }
    if (candidato && s.mes - (G.protestaMes ?? -99) >= 3) {
      G.protestaMes = s.mes;
      momentos.push({ tipo: 'protesta', grupo: candidato });
    }
  };
})(globalThis.R = globalThis.R || {});
