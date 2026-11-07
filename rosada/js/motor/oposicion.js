// Oposición: si perdiste en 2027, seguís construyendo hasta el medio término de 2029 y las presidenciales de 2031.
(function (R) {
  'use strict';

  const op = (R.oposicion = {});

  op.puede = (s) => s.fase === 'fin' && s.fin && ['paso', 'general', 'ballotage'].includes(s.fin.motivo) && !s.gob && !s.gobRival && R.anio(s.mes) === 2027;

  op.iniciar = function (s) {
    let ganador = null;
    if (s.elecciones.ballotage) ganador = s.elecciones.ballotage.ganador;
    else if (s.elecciones.general) ganador = s.elecciones.general.ganador || s.elecciones.general.lista.find((x) => x.id !== 'YO').id;
    else if (s.elecciones.paso) ganador = s.elecciones.paso.lista.find((x) => x.id !== 'YO').id;
    if (!ganador || ganador === 'YO') ganador = 'PL';
    s.gobRival = { partido: ganador, aprob: 55 };
    s.fase = 'campana';
    s.fin = null;
    s.mes = R.mesNum(2027, 11);
    s.calendario = { medio: R.mesNum(2029, 9), paso: R.mesNum(2031, 7), general: R.mesNum(2031, 9), ballotage: R.mesNum(2031, 10) };
    s.ballotage = null;
    s.cola = [];
    s.flags.vinoDeOposicion = true;
    const c = s.camp;
    c.agenda = c.agendaMax;
    c.usadasMes = {};
    c.alianza = null;
    c.fondos += 40;
    R.diario(s, '🔄', 'Seguís en la oposición. Gobierna ' + R.elec.nombre(s, ganador), 'oposicion');
    s.encuestas.push(R.camp.encuesta(s));
  };

  // El gobierno rival se desgasta (o no) mes a mes.
  op.mes = function (s) {
    const G = s.gobRival;
    if (!G) return;
    G.aprob = R.clamp(G.aprob + R.gauss(s) * 2.4 - 0.12, 15, 80);
  };

  // Peso extra del partido que gobierna según su aprobación (lo usa R.camp.votos).
  op.factor = (s, id) => (s.gobRival && s.gobRival.partido === id ? 0.7 + (s.gobRival.aprob / 100) * 1.0 : 1);

  const rival = (s) => ({ rival: s.gobRival.partido });
  R.ev.registrar([
    {
      id: 'o_ajuste', fase: 'campana', peso: 3, repite: 9, cuando: (s) => !!s.gobRival, vars: rival, dibujo: '🪚 🏛️ 😡',
      titular: 'El gobierno de {rival} anuncia un ajuste duro',
      opciones: [
        { txt: 'Criticarlo en la tele', ef: { conocen: 3, ideoIzq: 2.5, aprobRival: -2 }, res: 'Te convertís en la voz opositora 📺' },
        { txt: 'Marchar con la gente', costo: { agenda: 1 }, ef: { militancia: 6, ideoIzq: 2, aprobRival: -2 }, res: 'Una multitud en la Plaza de Mayo 🪧' },
        { txt: 'Apoyar el ajuste', ef: { ideoDer: 3, aprobRival: 1 }, res: '«Hace falta orden», decís' },
      ],
    },
    {
      id: 'o_escandalo', fase: 'campana', peso: 3, repite: 10, cuando: (s) => !!s.gobRival, vars: rival, dibujo: '🕵️ 💰 🏛️',
      titular: 'Estalla un escándalo de corrupción en el gobierno',
      opciones: [
        { txt: 'Pedir juicio político', ef: { conocen: 4, confrontativo: 3, aprobRival: -2 }, azar: { p: 0.3, ef: { simpatia: -4 }, txt: 'Te acusan de golpista 😬' }, res: 'Todos hablan de tu pedido ⚖️' },
        { txt: 'Pedir que investigue la Justicia', ef: { simpatia: 2, dialoguista: 2, aprobRival: -2 }, res: 'Quedás como alguien serio' },
      ],
    },
    {
      id: 'o_ley', fase: 'campana', peso: 3, repite: 9, cuando: (s) => !!s.gobRival && (R.composicion(s, 'diputados').YO || 0) >= 10, vars: rival, dibujo: '🏛️ 🗳️ 🤝',
      titular: 'El gobierno necesita tus diputados para una ley',
      opciones: [
        { txt: 'Votar a favor', ef: { dialoguista: 3, aprobRival: 2, fondos: 15 }, res: 'Te devuelven el favor con fondos 💰' },
        { txt: 'Votar en contra', ef: { confrontativo: 3, aprobRival: -2, conocen: 2 }, res: 'La ley se cae: ganaste peso 🏛️' },
        { txt: 'Negociar cambios', costo: { agenda: 1 }, ef: { simpatia: 2, conocen: 2 }, res: 'La ley sale con tus ideas ✍️' },
      ],
    },
    {
      id: 'o_crisis', fase: 'campana', peso: 2, repite: 12, cuando: (s) => !!s.gobRival, dibujo: '💵 📈 😱',
      titular: 'Crisis: el dólar se dispara y los precios vuelan',
      opciones: [
        { txt: 'Presentar tu plan', ef: { conocen: 3, simpatia: 2, aprobRival: -3 }, res: 'Tu plan económico es tendencia 📊' },
        { txt: 'Pedir unidad nacional', ef: { dialoguista: 3, aprobRival: -2 }, res: 'Mensaje responsable 🤝' },
      ],
    },
    {
      id: 'o_cargo', fase: 'campana', peso: 1, unaVez: true, cuando: (s) => !!s.gobRival, vars: rival, dibujo: '💼 🏛️ 🤔',
      titular: 'El gobierno te ofrece un ministerio',
      opciones: [
        { txt: 'Aceptar', ef: { conocen: 8, simpatia: -5, aprobRival: 2, fondos: 20 }, res: 'Ministro/a… del gobierno rival 😅' },
        { txt: 'Rechazar', ef: { simpatia: 3 }, res: 'Coherencia ante todo' },
      ],
    },
    {
      id: 'o_bancada', fase: 'campana', peso: 2, unaVez: true, cuando: (s) => !!s.gobRival && (R.composicion(s, 'diputados').YO || 0) >= 8, dibujo: '🏛️ 💔 🪓',
      titular: 'Tu bancada se divide: tres diputados se van',
      opciones: [
        { txt: 'Contenerlos', costo: { fondos: 20 }, ef: { militancia: 3 }, res: 'La bancada sigue unida 🤝' },
        { txt: 'Dejarlos ir', ef: { simpatia: 1, militancia: -4 }, res: 'Menos diputados, más lealtad' },
      ],
    },
  ]);
})(globalThis.R = globalThis.R || {});
