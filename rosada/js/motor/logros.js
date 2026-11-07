// Logros (se guardan en el dispositivo) y legado final con título.
(function (R) {
  'use strict';

  const enGob = (s) => s.fase === 'gobierno' && s.gob && s.eco;
  const contar = (s, tipo, re) => s.diario.filter((d) => d.tipo === tipo && (!re || re.test(d.txt))).length;

  R.LOGROS = [
    { id: 'primera_vuelta', emoji: '🥇', nombre: 'Ganaste en primera vuelta', si: (s) => s.flags.ganoEn === 'primera' },
    { id: 'ballotage', emoji: '⚔️', nombre: 'Ganaste un ballotage', si: (s) => s.flags.ganoEn === 'ballotage' },
    { id: 'manos_limpias', emoji: '🧼', nombre: 'Presidente sin plata de empresarios', si: (s) => s.fase === 'gobierno' && !s.flags.plataEmpresas },
    { id: 'bancada', emoji: '🏛️', nombre: 'Más de 50 diputados propios', si: (s) => (R.composicion(s, 'diputados').YO || 0) > 50 },
    { id: 'mayoria', emoji: '🏛️', nombre: 'Mayoría propia en el Congreso', si: (s) => s.gob && R.congreso.mayoria(s) },
    { id: 'medio_termino', emoji: '🗳️', nombre: 'Ganaste un medio término', si: (s) => s.elecciones.legislativa && s.elecciones.legislativa.ganador === 'YO' },
    { id: 'reelecto', emoji: '🏆', nombre: 'Reelecto/a', si: (s) => s.gob && s.gob.mandato >= 2 },
    { id: 'tres_mandatos', emoji: '👑', nombre: 'Tercer mandato', si: (s) => s.gob && s.gob.mandato >= 3 },
    { id: 'un_digito', emoji: '🎯', nombre: 'Inflación de un dígito', si: (s) => enGob(s) && s.gob.meses >= 12 && s.eco.inflAnual < 10 },
    { id: 'superavit', emoji: '⚖️', nombre: 'Superávit fiscal', si: (s) => enGob(s) && R.eco.resultado(s) > 0 },
    { id: 'pobreza_20', emoji: '🏠', nombre: 'Pobreza por debajo del 20 %', si: (s) => enGob(s) && s.eco.pobreza < 20 },
    { id: 'pleno_empleo', emoji: '👷', nombre: 'Desempleo por debajo del 5 %', si: (s) => enGob(s) && s.eco.desempleo < 5 },
    { id: 'reservas_100', emoji: '🏦', nombre: 'Más de US$ 100 mil M de reservas', si: (s) => enGob(s) && s.eco.reservas > 100 },
    { id: 'aprob_70', emoji: '😍', nombre: 'Aprobación de más del 70 %', si: (s) => enGob(s) && s.gob.aprob > 70 },
    { id: 'todos_contentos', emoji: '🥳', nombre: 'Los 6 grupos contentos a la vez', si: (s) => enGob(s) && R.GRUPOS.every((g) => s.gob.grupos[g.id].humor >= 60) },
    { id: 'crece_4', emoji: '🚀', nombre: 'La economía crece más del 4 %', si: (s) => enGob(s) && s.eco.crec > 4 },
    { id: 'diez_leyes', emoji: '📜', nombre: '10 leyes aprobadas', si: (s) => s.gob && Object.values(s.gob.leyesEstado || {}).filter((x) => x.estado === 'aprobada').length >= 10 },
    { id: 'decretazo', emoji: '✍️', nombre: '3 decretos firmados', si: (s) => s.gob && Object.values(s.gob.leyesEstado || {}).filter((x) => x.estado === 'dnu').length >= 3 },
    { id: 'gobernadores', emoji: '🗺️', nombre: '12 gobernadores aliados', si: (s) => s.gob && s.gob.gobernadores && R.PROVINCIAS.filter((p) => s.gob.gobernadores[p.id].rel >= 70).length >= 12 },
    { id: 'cinco_tratados', emoji: '📦', nombre: '5 tratados comerciales', si: (s) => s.mundo && R.PAISES.filter((p) => s.mundo.paises[p.id].tratado).length >= 5 },
    { id: 'aliado_eeuu', emoji: '🦅', nombre: 'Alianza con Estados Unidos', si: (s) => s.mundo && s.mundo.paises.USA.alianza },
    { id: 'aliado_china', emoji: '🐉', nombre: 'Alianza con China', si: (s) => s.mundo && s.mundo.paises.CHN.alianza },
    { id: 'malvinas_paz', emoji: '🕊️', nombre: 'Malvinas por la diplomacia', si: (s) => s.mundo && s.mundo.malvinas.recuperadas && !contar(s, 'mundo', /RECUPERAMOS/) },
    { id: 'malvinas_guerra', emoji: '⚓', nombre: 'Malvinas por la fuerza', si: (s) => s.mundo && s.mundo.malvinas.recuperadas && contar(s, 'mundo', /RECUPERAMOS/) > 0 },
    { id: 'conquistador', emoji: '🏴', nombre: 'Anexaste un país', si: (s) => s.mundo && R.PAISES.some((p) => s.mundo.paises[p.id].anexado) },
    { id: 'imperio', emoji: '👑', nombre: 'Anexaste 3 países', si: (s) => s.mundo && R.PAISES.filter((p) => s.mundo.paises[p.id].anexado).length >= 3 },
    { id: 'campeon', emoji: '⚽', nombre: 'Campeones del mundo en tu gobierno', si: (s) => !!s.flags.campeon },
    { id: 'mandato_completo', emoji: '🏁', nombre: 'Terminaste un mandato', si: (s) => s.gob && (s.gob.mandato >= 2 || (s.fin && s.fin.motivo === 'mandato')) },
    { id: 'oposicion', emoji: '🔄', nombre: 'Ganaste desde la oposición', si: (s) => s.fase === 'gobierno' && !!s.flags.vinoDeOposicion },
    { id: 'hiper', emoji: '💸', nombre: 'Hiperinflación (más de 1000 %)', malo: true, si: (s) => enGob(s) && s.eco.inflAnual > 1000 },
    { id: 'helicoptero', emoji: '🚁', nombre: 'Te fuiste en helicóptero', malo: true, si: (s) => s.fin && (s.fin.motivo === 'helicoptero' || s.fin.motivo === 'estallido') },
    { id: 'juicio', emoji: '🛡️', nombre: 'Sobreviviste a un juicio político', si: (s) => s.diario.some((d) => d.txt === 'Sobreviviste al juicio político') },
  ];

  const CLAVE = 'logros';
  R.logrosGuardados = () => R.pref(CLAVE) || {};

  // Revisa logros nuevos. Devuelve la lista de los que se desbloquearon ahora.
  R.revisarLogros = function (s) {
    const guardados = R.logrosGuardados();
    s.logros = s.logros || {};
    const nuevos = [];
    for (const l of R.LOGROS) {
      if (s.logros[l.id]) continue;
      let ok = false;
      try { ok = !!l.si(s); } catch (e) { ok = false; }
      if (!ok) continue;
      s.logros[l.id] = s.mes;
      if (!guardados[l.id]) { guardados[l.id] = Date.now(); nuevos.push(l); }
    }
    if (nuevos.length) R.pref(CLAVE, guardados);
    return nuevos;
  };

  // ── Legado al terminar ──
  R.legado = function (s) {
    if (!s.gob) return null;
    const e = s.eco;
    const ini = s.gob.historia[0] || { inflAnual: 27, pobreza: 34, desempleo: 7.8, aprob: 55 };
    let p = 50;
    p += (s.gob.aprob - 50) * 0.35;
    p += R.clamp((ini.inflAnual - e.inflAnual) * 0.25, -20, 12);
    p += (ini.pobreza - e.pobreza) * 0.9;
    p += (ini.desempleo - e.desempleo) * 1.5;
    p += R.clamp((e.pbi - 100) * 0.4, -15, 15);
    p += Object.values(s.gob.leyesEstado || {}).filter((x) => x.estado === 'aprobada').length * 0.6;
    p += (s.gob.mandato - 1) * 6;
    const anex = s.mundo ? R.PAISES.filter((x) => s.mundo.paises[x.id].anexado).length : 0;
    const malvinas = s.mundo && s.mundo.malvinas.recuperadas;
    p += anex * 4 + (malvinas ? 15 : 0);
    if (s.fin && ['helicoptero', 'estallido', 'juicio'].includes(s.fin.motivo)) p -= 25;
    const puntos = Math.round(R.clamp(p, 0, 100));
    const estrellas = puntos >= 85 ? 5 : puntos >= 68 ? 4 : puntos >= 50 ? 3 : puntos >= 32 ? 2 : 1;
    let titulo = ['Un desastre nacional', 'Una gestión olvidable', 'Una gestión correcta', 'Una gran presidencia', 'Prócer de la Patria'][estrellas - 1];
    if (s.fin && s.fin.motivo === 'helicoptero') titulo = 'La del helicóptero';
    else if (e.inflAnual > 1000) titulo = 'La de la hiperinflación';
    else if (malvinas) titulo = 'La que recuperó Malvinas';
    else if (anex >= 2) titulo = 'Conquista del Cono Sur';
    else if (s.diario.some((d) => d.txt === 'Motosierra') && estrellas >= 3) titulo = 'Motosierra de oro';
    return { puntos, estrellas, titulo };
  };
})(globalThis.R = globalThis.R || {});
