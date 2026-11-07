// El paso del tiempo: qué pasa cuando apretás «Pasar el mes» y el debate presidencial.
(function (R) {
  'use strict';

  const turno = (R.turno = {});

  // Calendario de 2027 (mes 0 = enero).
  turno.MES_PASO = 7; // agosto: se ven los resultados de las PASO
  turno.MES_GENERAL = 9; // octubre: se vota al final del mes
  turno.MES_BALLOTAGE = 10; // noviembre
  turno.MES_ASUNCION = 11; // 10 de diciembre

  // Texto del botón grande y aviso de la próxima elección.
  turno.botonPasar = function (s) {
    if (s.fase === 'campana' && s.mes === turno.MES_GENERAL) return { txt: 'Ir a votar', emoji: '🗳️' };
    if (s.fase === 'campana' && s.mes === turno.MES_BALLOTAGE) return { txt: 'Votar en el ballotage', emoji: '🗳️' };
    return { txt: 'Pasar el mes', emoji: '▶' };
  };
  turno.proximaEleccion = function (s) {
    if (s.fase !== 'campana') return null;
    if (s.mes < turno.MES_PASO) return { nombre: 'PASO', emoji: '🗳️', faltan: turno.MES_PASO - s.mes };
    if (s.mes < turno.MES_GENERAL) return { nombre: 'Generales', emoji: '🗳️', faltan: turno.MES_GENERAL - s.mes };
    if (s.mes === turno.MES_GENERAL) return { nombre: 'Generales', emoji: '🗳️', faltan: 0 };
    return { nombre: 'Ballotage', emoji: '⚔️', faltan: 0 };
  };

  // Devuelve la lista de «momentos» nuevos (también quedan en s.cola para sobrevivir a una recarga).
  turno.pasar = function (s) {
    if (s.cola.length) return [];
    const momentos = [];
    if (s.fase === 'campana') turno.pasarCampana(s, momentos);
    else if (s.fase === 'gobierno' && R.gob) R.gob.pasarMes(s, momentos);
    s.cola.push(...momentos);
    return momentos;
  };

  turno.pasarCampana = function (s, momentos) {
    if (s.mes === turno.MES_GENERAL) {
      const res = R.elec.general(s);
      momentos.push({ tipo: 'eleccion', clave: 'general' });
      if (res.ganador === 'YO') {
        turno.ganaste(s, momentos, 'primera');
      } else if (res.ballotage && res.ballotage.includes('YO')) {
        s.ballotage = res.ballotage;
        R.diario(s, '⚔️', 'Vamos al ballotage contra ' + R.elec.nombre(s, res.ballotage.find((x) => x !== 'YO')), 'eleccion');
        R.camp.finDeMes(s);
        s.mes++;
        s.camp.agenda = 2; // un mes cortito de campaña
        momentos.push({ tipo: 'debate', rival: res.ballotage.find((x) => x !== 'YO'), etapa: 'ballotage' });
      } else {
        turno.perdiste(s, momentos, 'general');
      }
      return;
    }
    if (s.mes === turno.MES_BALLOTAGE) {
      const res = R.elec.ballotage(s, s.ballotage);
      momentos.push({ tipo: 'eleccion', clave: 'ballotage' });
      if (res.ganador === 'YO') turno.ganaste(s, momentos, 'ballotage');
      else turno.perdiste(s, momentos, 'ballotage');
      return;
    }

    R.camp.finDeMes(s);
    s.mes++;
    if (s.mes === turno.MES_PASO) {
      const res = R.elec.paso(s);
      momentos.push({ tipo: 'eleccion', clave: 'paso' });
      R.diario(s, '🗳️', 'PASO: sacaste ' + R.pct(res.lista.find((x) => x.id === 'YO').v), 'eleccion');
      if (!res.pasa) {
        turno.perdiste(s, momentos, 'paso');
        return;
      }
    }
    if (s.mes === turno.MES_GENERAL) {
      const e = R.camp.votos(s).nac;
      const rivales = R.RIVALES.slice().sort((a, b) => e[b] - e[a]);
      momentos.push({ tipo: 'debate', rival: rivales[0], etapa: 'general' });
    }
    if (R.chance(s, s.mes === turno.MES_GENERAL ? 0.5 : 0.75)) {
      const n = R.ev.elegir(s, 'campana');
      if (n) momentos.push(n);
    }
    s.encuestas.push(R.camp.encuesta(s));
  };

  turno.ganaste = function (s, momentos, como) {
    s.fase = 'electo';
    s.flags.ganoEn = como;
    R.diario(s, '🏆', '¡' + s.lider.nombre + ' es presidente electo!', 'eleccion');
    momentos.push({ tipo: 'asuncion' });
  };
  turno.perdiste = function (s, momentos, donde) {
    s.fase = 'fin';
    s.fin = { motivo: donde, mes: s.mes };
    R.diario(s, '😞', donde === 'paso' ? 'Quedaste afuera en las PASO' : 'Perdiste la elección', 'eleccion');
    momentos.push({ tipo: 'fin' });
  };

  // ── Debate presidencial (minijuego) ──
  const deb = (R.debate = {});
  deb.ESTILOS = {
    ataque: { emoji: '🔥', nombre: 'Atacar' },
    datos: { emoji: '📊', nombre: 'Datos' },
    emocion: { emoji: '❤️', nombre: 'Emoción' },
    humor: { emoji: '😂', nombre: 'Humor' },
  };
  // A le gana a B: los datos desarman el ataque, el ataque ridiculiza la emoción,
  // la emoción le gana al chiste y el humor vuelve aburridos los datos.
  deb.GANA = { datos: 'ataque', ataque: 'emocion', emocion: 'humor', humor: 'datos' };
  deb.TEMAS = [
    { id: 'economia', emoji: '💰', nombre: 'Economía', fuerte: 'datos' },
    { id: 'seguridad', emoji: '👮', nombre: 'Seguridad', fuerte: 'ataque' },
    { id: 'salud', emoji: '🏥', nombre: 'Salud y escuelas', fuerte: 'emocion' },
    { id: 'corrupcion', emoji: '🕵️', nombre: 'Corrupción', fuerte: 'ataque' },
    { id: 'futuro', emoji: '🚀', nombre: 'El futuro', fuerte: 'emocion' },
    { id: 'campo', emoji: '🌾', nombre: 'Campo e industria', fuerte: 'datos' },
    { id: 'jovenes', emoji: '🎮', nombre: 'Jóvenes', fuerte: 'humor' },
    { id: 'jubilados', emoji: '👵', nombre: 'Jubilados', fuerte: 'emocion' },
  ];

  deb.nuevo = function (s, rival, etapa) {
    return { rival, etapa, temas: R.shuffle(s, deb.TEMAS).slice(0, 3), ronda: 0, puntos: 0, historia: [] };
  };

  deb.resultado = function (yo, el) {
    if (yo === el) return 'empate';
    if (deb.GANA[yo] === el) return 'gana';
    if (deb.GANA[el] === yo) return 'pierde';
    return 'empate';
  };

  deb.jugar = function (s, d, estilo) {
    const tema = d.temas[d.ronda];
    const pref = R.PARTIDOS[d.rival].debate;
    const el = R.chance(s, 0.5) ? pref : R.pick(s, Object.keys(deb.ESTILOS));
    const r = deb.resultado(estilo, el);
    let pts = r === 'gana' ? 1 : r === 'pierde' ? -1 : 0;
    if (tema.fuerte === estilo) pts += 0.5;
    d.puntos += pts;
    d.historia.push({ tema: tema.id, yo: estilo, el, r, pts });
    d.ronda++;
    return { el, r, pts, tema };
  };

  deb.terminar = function (s, d) {
    const p = d.puntos;
    const ef = { simpatia: R.round(p * 2.6, 1), conocen: 3, rival: { [d.rival]: -R.round(Math.max(0, p) * 1.1, 1) } };
    if (p < 0) ef.rival[d.rival] = R.round(-p * 0.6, 1);
    const aplicado = R.aplicarEfectos(s, ef);
    const veredicto = p >= 2 ? '¡Ganaste el debate por paliza!' : p > 0 ? 'Ganaste el debate' : p === 0 ? 'Empate técnico' : 'Perdiste el debate';
    R.diario(s, '🎙️', 'Debate: ' + veredicto.toLowerCase().replace('¡', '').replace('!', ''), 'debate');
    return { veredicto, aplicado, bueno: p >= 0 };
  };
})(globalThis.R = globalThis.R || {});
