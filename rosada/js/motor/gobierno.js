// Gobierno: la gente (humor de cada grupo), aprobación, capital político, crisis y el paso del mes.
(function (R) {
  'use strict';

  const gob = (R.gob = {});

  R.MINISTROS = {
    ortodoxo: {
      emoji: '📉', tipo: 'Ortodoxo', nombre: 'Bruno Lagos', desc: 'Baja la inflación, pero enfría la economía',
      ancla: 0.22, riesgo: -90, crec: -0.4, impacto: { trabajadores: -6, humildes: -4, empresarios: 7 },
      avatar: { piel: 0, pelo: 1, colorPelo: 4, anteojos: 2, barba: 0, ropa: 1 },
    },
    heterodoxo: {
      emoji: '📈', tipo: 'Heterodoxo', nombre: 'Marina Paz', desc: 'Empuja el consumo, pero sube la inflación',
      ancla: -0.15, riesgo: 80, crec: 0.6, impacto: { trabajadores: 6, humildes: 5, empresarios: -6 },
      avatar: { piel: 2, pelo: 2, colorPelo: 0, anteojos: 1, barba: 0, ropa: 2 },
    },
    pragmatico: {
      emoji: '🤝', tipo: 'Pragmático', nombre: 'Jorge Ibarra', desc: 'Ni frío ni calor: negocia bien (+1 ⭐ por mes)',
      pcExtra: 1, impacto: {},
      avatar: { piel: 1, pelo: 5, colorPelo: 1, anteojos: 0, barba: 1, ropa: 0 },
    },
  };

  // Elecciones del mandato (mes 0 = enero 2027).
  gob.MES_MEDIO_TERMINO = R.mesNum(2029, 9);
  gob.MES_PRESIDENCIAL = R.mesNum(2031, 9);

  gob.iniciar = function (s) {
    s.fase = 'gobierno';
    s.mes = R.mesNum(R.anio(s.mes), 11);
    s.eco = R.eco.inicial();
    const grupos = {};
    for (const g of R.GRUPOS) {
      const h = R.simpatiaInicialGrupo(g, s.partido.ideo) + 6;
      grupos[g.id] = { humor: h, antes: h, partes: [], partesAntes: [] };
    }
    s.gob = {
      inicio: s.mes, mandato: 1, pc: 8, pcMax: 20, aprob: 55, lunaMiel: 12, ministro: null, grupos,
      leyes: {}, enfr: {}, meses: 0, crisisMeses: 0, escandalo: 0, historia: [], llamas: [],
    };
    gob.actualizarAprob(s);
    if (R.congreso) R.congreso.iniciar(s);
    if (R.mundo) R.mundo.iniciar(s);
    s.gob.historia.push(R.eco.foto(s));
    R.diario(s, '🎖️', 'Asumís la Presidencia', 'gobierno');
    s.cola.push({ tipo: 'ministro' });
  };

  gob.elegirMinistro = function (s, id) {
    const antes = s.gob.ministro;
    s.gob.ministro = id;
    const imp = R.MINISTROS[id].impacto || {};
    const aplicado = gob.aplicarEfectos(s, imp);
    R.diario(s, R.MINISTROS[id].emoji, 'Ministro/a de Economía: ' + R.MINISTROS[id].nombre + (antes ? ' (cambio de gabinete)' : ''), 'gobierno');
    return aplicado;
  };

  // ── Lo que quiere cada grupo ──
  // Devuelve { obj, partes: [{k, v}] } — cada parte es una razón de su humor (sirve para las frases y el «¿por qué?»).
  gob.objetivoGrupo = function (s, id) {
    const e = s.eco;
    const m = e.niveles;
    const g = R.GRUPO[id];
    const ideoGob = s.partido.ideo;
    const Pinf = R.clamp((e.inflAnual - 15) / 2, 0, 45);
    const Pdes = (e.desempleo - 7.5) * 2.2;
    const S = (e.salarioReal - 100) * 0.7;
    const Gr = (e.crec - 1.5) * 2;
    const q = e.calidad;
    // Plata real: el gasto está en % del PBI; si el país creció, el mismo % es más plata (y si se achicó, menos).
    const torta = R.eco.torta(s);
    const p = [];
    const add = (k, v) => p.push({ k, v });
    add('ideas', 12 * (0.45 - Math.abs(g.ideo - ideoGob)));
    switch (id) {
      case 'trabajadores':
        add('salario', S * 1.2); add('empleo', -Pdes * 1.3); add('inflacion', -Pinf * 0.5); add('obras', 12 * (m.obras - 1));
        break;
      case 'campo':
        add('retenciones', -10 * (e.retenciones - 1.5)); add('cepo', e.cepo ? -10 : 0); add('crecimiento', Gr * 0.6);
        add('inflacion', -Pinf * 0.25); add('rutas', (q.infra - 50) * 0.25);
        break;
      case 'empresarios':
        add('impuestos', -7 * (e.impuestos - 2)); add('riesgo', -(e.riesgo - 650) / 35); add('cepo', e.cepo ? -10 : 0);
        add('crecimiento', Gr * 1.3); add('inflacion', -Pinf * 0.35);
        break;
      case 'media':
        add('inflacion', -Pinf * 0.85); add('seguridad', (q.seguridad - 50) * 0.3); add('educacion', (q.educacion - 50) * 0.2);
        add('salud', (q.salud - 50) * 0.15); add('impuestos', -5 * (e.impuestos - 2)); add('crecimiento', Gr * 0.7);
        add('social', -12 * Math.max(0, m.social - 1.2));
        break;
      case 'humildes':
        add('inflacion', -Pinf * 0.7); add('empleo', -Pdes * 0.8); add('social', 25 * (m.social * torta - 1)); add('subsidios', 10 * (m.subsidios - 1));
        add('salud', (q.salud - 50) * 0.2); add('pobreza', -(e.pobreza - 30) * 0.4);
        break;
      case 'jubilados':
        add('jubilaciones', 35 * (m.jubilaciones * torta - 1)); add('inflacion', -Pinf * 0.95); add('salud', (q.salud - 50) * 0.3); add('subsidios', 6 * (m.subsidios - 1));
        break;
    }
    const bonus = s.gob && s.gob.bonusGrupo ? s.gob.bonusGrupo[id] || 0 : 0;
    if (bonus) add('leyes', bonus);
    const obj = R.clamp(50 + R.sum(p.map((x) => x.v)), 3, 97);
    return { obj, partes: p };
  };

  gob.actualizarAprob = function (s) {
    const G = s.gob;
    let tot = 0;
    let w = 0;
    for (const g of R.GRUPOS) {
      tot += G.grupos[g.id].humor * g.peso;
      w += g.peso;
    }
    const desgaste = Math.min(7, G.meses * 0.08);
    const dif = { facil: 5, normal: 0, dificil: -5 }[s.dif] || 0;
    G.aprob = R.clamp(tot / w + G.lunaMiel - desgaste - G.escandalo * 0.6 + dif, 2, 96);
    return G.aprob;
  };

  // Capital político por mes.
  gob.ingresoPC = function (s) {
    const G = s.gob;
    let pc = 2 + Math.round((G.aprob - 40) / 15);
    if (G.ministro && R.MINISTROS[G.ministro].pcExtra) pc += R.MINISTROS[G.ministro].pcExtra;
    if (R.congreso && R.congreso.mayoria && R.congreso.mayoria(s)) pc += 1;
    return Math.max(1, pc);
  };

  // 🔥 Termómetro de crisis: cada problema grave es una llamita.
  gob.LLAMAS = [
    { id: 'hiper', emoji: '🛒', txt: 'Inflación descontrolada', si: (s) => s.eco.inflAnual > 100, doble: (s) => s.eco.inflAnual > 300, arreglo: 'Bajá el déficit o dejá de emitir' },
    { id: 'pobreza', emoji: '🏚️', txt: 'Pobreza muy alta', si: (s) => s.eco.pobreza > 45, arreglo: 'Más ayuda social y empleo' },
    { id: 'desempleo', emoji: '🚪', txt: 'Mucho desempleo', si: (s) => s.eco.desempleo > 13, arreglo: 'Obra pública y crecimiento' },
    { id: 'reservas', emoji: '🏦', txt: 'Sin dólares en el Banco Central', si: (s) => s.eco.reservas < 5, arreglo: 'Exportá más, pedí un préstamo o poné cepo' },
    { id: 'riesgo', emoji: '📊', txt: 'Riesgo país por las nubes', si: (s) => s.eco.riesgo > 2000, arreglo: 'Ordená las cuentas' },
    { id: 'recesion', emoji: '📉', txt: 'Recesión fuerte', si: (s) => s.eco.crec < -3, arreglo: 'Bajá impuestos o más obra pública' },
    { id: 'aprob', emoji: '👎', txt: 'Nadie te banca', si: (s) => s.gob.aprob < 25, doble: (s) => s.gob.aprob < 15, arreglo: 'Contentá a los grupos más enojados' },
    { id: 'cgt', emoji: '✊', txt: 'Paro general permanente', si: (s) => s.gob.grupos.trabajadores.humor < 18, arreglo: 'Mesa con la CGT y salarios' },
    { id: 'barrios', emoji: '🔥', txt: 'Estallido en los barrios', si: (s) => s.gob.grupos.humildes.humor < 18, arreglo: 'Ayuda social y comida' },
    { id: 'deficit', emoji: '💸', txt: 'Déficit enorme', si: (s) => R.eco.resultado(s) < -6, arreglo: 'Recortá gastos o subí impuestos' },
    { id: 'guerra', emoji: '⚔️', txt: 'Vamos perdiendo la guerra', si: (s) => !!(s.mundo && s.mundo.guerra && s.mundo.guerra.frente < 30), arreglo: 'Pedí la paz o conseguí aliados' },
  ];
  gob.llamas = function (s) {
    const out = [];
    for (const l of gob.LLAMAS) {
      if (l.si(s)) {
        out.push(l);
        if (l.doble && l.doble(s)) out.push(l);
      }
    }
    return out;
  };

  // ── Efectos del gobierno ──
  R.EF_GOB = {
    trabajadores: { emoji: '👷', nombre: 'Trabajadores', paso: 4, grupo: true },
    campo: { emoji: '🌾', nombre: 'Campo', paso: 4, grupo: true },
    empresarios: { emoji: '💼', nombre: 'Empresarios', paso: 4, grupo: true },
    media: { emoji: '🏙️', nombre: 'Clase media', paso: 4, grupo: true },
    humildes: { emoji: '🏘️', nombre: 'Humildes', paso: 4, grupo: true },
    jubilados: { emoji: '👵', nombre: 'Jubilados', paso: 4, grupo: true },
    todos: { emoji: '👥', nombre: 'Todos', paso: 3, grupo: true },
    pc: { emoji: '⭐', nombre: 'Capital político', paso: 1, numero: true },
    gastoExtra: { emoji: '💸', nombre: 'del presupuesto', paso: 1, inverso: true, pct: true },
    inflacion: { emoji: '🛒', nombre: 'Inflación', paso: 0.4, inverso: true },
    crec: { emoji: '📈', nombre: 'Economía', paso: 0.6 },
    expo: { emoji: '🚢', nombre: 'Exportaciones', paso: 0.04 },
    reservas: { emoji: '🏦', nombre: 'Reservas', paso: 2 },
    deuda: { emoji: '💳', nombre: 'Deuda', paso: 2, inverso: true },
    riesgo: { emoji: '📊', nombre: 'Riesgo país', paso: 80, inverso: true },
    desempleo: { emoji: '🚪', nombre: 'Desempleo', paso: 0.4, inverso: true },
    pobreza: { emoji: '🏚️', nombre: 'Pobreza', paso: 1, inverso: true },
    dolar: { emoji: '💵', nombre: 'Dólar', paso: 6, inverso: true },
    escandalo: { emoji: '🕵️', nombre: 'Escándalo', paso: 1, inverso: true },
    salud: { emoji: '🏥', nombre: 'Hospitales', paso: 3 },
    educacion: { emoji: '🎓', nombre: 'Escuelas', paso: 3 },
    seguridad: { emoji: '👮', nombre: 'Seguridad', paso: 3 },
    defensa: { emoji: '🪖', nombre: 'Fuerzas Armadas', paso: 3 },
    infra: { emoji: '🛣️', nombre: 'Rutas', paso: 3 },
    ciencia: { emoji: '🔬', nombre: 'Ciencia', paso: 3 },
    soberania: { emoji: '🏝️', nombre: 'Malvinas', paso: 4 },
  };
  const CALIDADES = ['salud', 'educacion', 'seguridad', 'defensa', 'infra', 'ciencia'];
  const MESES_SHOCK = { crec: 6, expo: 8, riesgo: 4 };

  gob.expandir = function (s, ef) {
    const out = [];
    for (const [k, v] of Object.entries(ef || {})) {
      if (!v) continue;
      if (k === 'calidad' && typeof v === 'object') {
        for (const [c, n] of Object.entries(v)) out.push({ k: c, v: n });
      } else if (k === 'rel' && typeof v === 'object') {
        for (const [c, n] of Object.entries(v)) out.push({ k: 'rel', v: n, sub: c });
      } else if (R.EF_GOB[k]) out.push({ k, v });
    }
    return out;
  };

  gob.aplicarEfectos = function (s, ef) {
    const lista = gob.expandir(s, ef);
    const G = s.gob;
    const e = s.eco;
    for (const { k, v, sub } of lista) {
      if (k === 'rel') { if (s.mundo && s.mundo.paises[sub]) s.mundo.paises[sub].rel = R.clamp(s.mundo.paises[sub].rel + v, 0, 100); continue; }
      if (k === 'soberania') { if (s.mundo) s.mundo.malvinas.soberania = R.clamp(s.mundo.malvinas.soberania + v, 0, 99); continue; }
      if (R.GRUPO[k]) G.grupos[k].humor = R.clamp(G.grupos[k].humor + v, 0, 100);
      else if (k === 'todos') R.GRUPOS.forEach((g) => (G.grupos[g.id].humor = R.clamp(G.grupos[g.id].humor + v, 0, 100)));
      else if (k === 'pc') G.pc = R.clamp(G.pc + v, 0, G.pcMax);
      else if (k === 'gastoExtra') {
        const pbi = R.eco.gastoComoPBI(s, v);
        e.gastoExtraMes += pbi;
        e.gastoExtraAnio += pbi;
      } else if (k === 'inflacion') e.shocks.push({ k: 'infl', v, meses: 1 });
      else if (MESES_SHOCK[k]) e.shocks.push({ k, v, meses: MESES_SHOCK[k] });
      else if (k === 'reservas') e.reservas = Math.max(-5, e.reservas + v);
      else if (k === 'deuda') e.deuda = Math.max(5, e.deuda + v);
      else if (k === 'desempleo') e.desempleo = R.clamp(e.desempleo + v, 2, 35);
      else if (k === 'pobreza') e.pobreza = R.clamp(e.pobreza + v, 3, 75);
      else if (k === 'dolar') {
        e.dolar *= 1 + v / 100;
        e.shocks.push({ k: 'infl', v: v * 0.12, meses: 3 });
      } else if (k === 'escandalo') G.escandalo = Math.max(0, G.escandalo + v);
      else if (CALIDADES.includes(k)) e.calidad[k] = R.clamp(e.calidad[k] + v, 0, 100);
    }
    gob.actualizarAprob(s);
    return lista;
  };

  gob.describirAplicado = function (s, lista) {
    return lista.map(({ k, v, sub }) => {
      const meta = k === 'rel' ? { emoji: '🤝', nombre: R.PAIS[sub] ? R.PAIS[sub].nombre : sub, paso: 5 } : R.EF_GOB[k];
      if (!meta) return null;
      const sube = v > 0;
      return {
        k, v, sube, bueno: meta.inverso ? !sube : sube, emoji: meta.emoji, nombre: meta.nombre, numero: meta.numero || meta.pct,
        pct: meta.pct, flechas: Math.min(3, Math.max(1, Math.ceil(Math.abs(v) / meta.paso - 0.15))),
      };
    }).filter(Boolean);
  };
  gob.describirEfectos = (s, ef) => gob.describirAplicado(s, gob.expandir(s, ef));

  // ── Qué hace una ley, en pocos carteles y solo lo que toca directo ──
  // { ya: [...], luego: [...] } — «ya» = al firmarla; «luego» = lo que llega con el tiempo (madura en 1-2 años).
  // Sale de la definición de la ley (ef, perm y lo que cambia en el presupuesto), no de efectos indirectos.
  // [emoji, nombre, paso de una flecha, signo: +1 si que suba es bueno, −1 si es malo, 0 neutro]
  const PERM_META = {
    bonusCrec: ['📈', 'Economía', 0.3, 1],
    bonusEmpleo: ['🚪', 'Desempleo', 0.45, -1], // positivo = baja el desempleo
    bonusExpo: ['🚢', 'Exportaciones', 0.035, 1],
    bonusImpo: ['📦', 'Importaciones', 0.035, 0],
    bonusRecauda: ['🧾', 'Recaudación', 0.2, 1],
    bonusPrecios: ['🛒', 'Inflación', 0.03, -1],
    bonusSalario: ['💰', 'Sueldos', 0.02, 1],
    bonusRiesgo: ['📊', 'Riesgo país', 22, -1],
  };
  // Lo que cambia el `hacer` de una ley en el presupuesto y en las perillas (sin tocar la partida).
  gob.impactoHacer = function (s, ley) {
    const r = { areas: [], dRec: 0, dGasto: 0, dExpo: 0, dCrec: 0, dReservas: 0 };
    if (!ley.hacer || !s.eco) return r;
    const c = Object.assign({}, s, { eco: JSON.parse(JSON.stringify(s.eco)) });
    ley.hacer(c);
    const a = s.eco;
    const b = c.eco;
    for (const ar of R.AREAS) {
      const d = R.round(b.niveles[ar.id] - a.niveles[ar.id], 2);
      if (d) { r.areas.push({ id: ar.id, d }); r.dGasto += d * ar.base; }
    }
    r.dRec = R.eco.recaudacion(c) - R.eco.recaudacion(s);
    r.dReservas = b.reservas - a.reservas;
    // Con el tiempo: menos retenciones = más exportaciones; menos impuestos = más inversión; obras y educación empujan.
    r.dExpo = (a.retenciones - b.retenciones) * 0.06;
    r.dCrec = 0.7 * (a.impuestos - b.impuestos) + 0.3 * (a.retenciones - b.retenciones) + r.dExpo * 6;
    for (const { id, d } of r.areas) {
      if (id === 'obras') r.dCrec += 2.2 * d;
      if (id === 'educacion' || id === 'ciencia') r.dCrec += (48 * d) / 45;
    }
    return r;
  };
  // Plata que deja (+) o se come (−) la ley en las cuentas, en % del PBI, cuando ya dio todo.
  gob.fiscalLey = function (s, ley) {
    const im = gob.impactoHacer(s, ley);
    return im.dRec + ((ley.perm && ley.perm.bonusRecauda) || 0) * R.eco.RITMO.impacto - im.dGasto;
  };
  gob.efectosLey = function (s, ley, max) {
    max = max || 3;
    const ya = {};
    const luego = {};
    const add = (dest, k, emoji, nombre, v, paso, signo) => {
      if (!v) return;
      const x = dest[k] || (dest[k] = { k, emoji, nombre, v: 0, paso, signo });
      x.v += v;
    };
    const p = ley.perm || {};
    const im = gob.impactoHacer(s, ley);
    // Al firmar: cómo reacciona cada grupo y los golpes a la economía.
    for (const [k, v] of Object.entries(ley.ef || {})) {
      const m = R.EF_GOB[k];
      if (!m || k === 'pc') continue;
      add(ya, k, m.emoji, m.grupo ? R.GRUPO[k] ? R.GRUPO[k].nombre : m.nombre : m.nombre, v, m.paso, m.inverso ? -1 : 1);
    }
    for (const [g, v] of Object.entries(p.bonusGrupo || {})) add(ya, g, R.GRUPO[g].emoji, R.GRUPO[g].nombre, v, 4, 1);
    for (const { id, d } of im.areas) add(ya, 'area_' + id, R.AREA[id].emoji, R.AREA[id].nombre, d, 0.05, 1);
    if (Math.abs(im.dRec) > 0.05) add(ya, 'recauda', '🧾', 'Recaudación', im.dRec, 0.3, 1);
    if (Math.abs(im.dReservas) > 0.5) add(ya, 'reservas', '🏦', 'Reservas', im.dReservas, 2, 1);
    // Con el tiempo: lo que la ley cambia en el motor.
    for (const [k, [em, nom, paso, signo]] of Object.entries(PERM_META)) {
      let v = (p[k] || 0) * R.eco.RITMO.impacto;
      if (k === 'bonusEmpleo') v = -v; // se muestra como «Desempleo ▼»
      if (k === 'bonusCrec') v += im.dCrec;
      if (k === 'bonusExpo') v += im.dExpo;
      add(luego, k, em, nom, v, paso, signo);
    }
    for (const [c, v] of Object.entries(p.bonusCalidad || {})) add(luego, c, R.EF_GOB[c].emoji, R.EF_GOB[c].nombre, v * R.eco.RITMO.impacto, 5, 1);
    const lista = (obj) => Object.values(obj)
      .filter((x) => Math.abs(x.v) >= x.paso * (R.GRUPO[x.k] ? 0.85 : 0.4))
      .map((x) => ({
        k: x.k, emoji: x.emoji, nombre: x.nombre, v: x.v, sube: x.v > 0, neutro: x.signo === 0,
        bueno: x.signo === 0 ? true : (x.v > 0) === (x.signo > 0),
        flechas: Math.min(3, Math.max(1, Math.round(Math.abs(x.v) / x.paso))),
        grupo: !!R.GRUPO[x.k],
      }))
      .sort((a, b) => b.flechas - a.flechas || a.grupo - b.grupo)
      .slice(0, max);
    return { ya: lista(ya), luego: lista(luego) };
  };
  gob.describirPerm = (s, ley) => gob.efectosLey(s, ley, 4).luego;

  // Un cambio permanente en el motor que llega de a poco (lo usan las noticias que dejan huella).
  gob.bono = function (s, k, v, meses, sub) {
    const G = s.gob;
    v *= R.eco.RITMO.impacto;
    if (meses) meses = R.eco.mesesMadura(meses);
    if (sub) { G[k] = G[k] || {}; G[k][sub] = (G[k][sub] || 0) + v; } else G[k] = (G[k] || 0) + v;
    if (meses) { G.madurando = G.madurando || []; G.madurando.push({ ley: 'noticia', k, v, sub, desde: s.mes, meses }); }
  };

  gob.bloqueoCosto = function (s, costo) {
    if (!s.gob) return null;
    if (costo.pc && costo.pc > s.gob.pc) return 'Falta capital político ⭐';
    return null;
  };

  // ── Acciones de gobierno (cuestan ⭐) ──
  gob.ACCIONES = [
    { id: 'cadena', emoji: '📺', nombre: 'Cadena nacional', desc: 'Explicás tu plan', pc: 2, enfr: 2,
      ef: { todos: 2.5 }, azar: { p: 0.25, ef: { media: -5 }, txt: 'Cortaste la novela: la gente se enojó 😒' }, res: 'Te escucharon en todo el país 📺' },
    { id: 'cgt', emoji: '✊', nombre: 'Mesa con la CGT', desc: 'Calmás a los gremios', pc: 2, enfr: 3,
      ef: { trabajadores: 8, empresarios: -2 }, res: 'Foto con los gremios 🤝' },
    { id: 'campo', emoji: '🌾', nombre: 'Reunión con el campo', desc: 'Escuchás a los productores', pc: 2, enfr: 3,
      ef: { campo: 9 }, res: 'Mate en la estancia 🧉' },
    { id: 'inversores', emoji: '💼', nombre: 'Foro de inversiones', desc: 'Traés empresas', pc: 2, enfr: 3,
      ef: { empresarios: 8, riesgo: -40 }, res: 'Los inversores sonríen 💼' },
    { id: 'barrios', emoji: '🏘️', nombre: 'Recorrer los barrios', desc: 'Escuchás a los vecinos', pc: 2, enfr: 3,
      ef: { humildes: 8, media: 1 }, res: 'Abrazos en el barrio 🫂' },
    { id: 'remedios', emoji: '💊', nombre: 'Remedios gratis', desc: 'Para jubilados', pc: 1, gasto: 1.5, enfr: 4,
      ef: { jubilados: 10 }, res: 'Doña Marta ya tiene sus pastillas 💊' },
    { id: 'bono', emoji: '💵', nombre: 'Bono', desc: 'Plata extra a todos', pc: 1, gasto: 3, enfr: 6,
      ef: { trabajadores: 6, humildes: 7, jubilados: 6, inflacion: 0.3 }, res: 'El bono llegó 💵' },
    { id: 'precios', emoji: '🏷️', nombre: 'Acuerdo de precios', desc: 'Frenás los aumentos', pc: 3, enfr: 6,
      ef: { inflacion: -0.6, empresarios: -6, media: 3 }, azar: { p: 0.3, ef: { inflacion: 0.6 }, txt: 'Nadie respetó el acuerdo 🙄' }, res: 'Precios congelados 🏷️' },
    { id: 'feriado', emoji: '🏖️', nombre: 'Feriado largo', desc: 'Fin de semana XL', pc: 1, enfr: 4,
      ef: { media: 4, trabajadores: 3, empresarios: -4, crec: -0.3 }, res: '¡A la costa! 🏖️' },
  ];
  gob.ACC = Object.fromEntries(gob.ACCIONES.map((a) => [a.id, a]));

  gob.bloqueoAccion = function (s, a) {
    const G = s.gob;
    if (s.fase !== 'gobierno') return 'No es momento';
    if (G.enfr[a.id] && s.mes - G.enfr[a.id] < a.enfr) return 'De nuevo en ' + (a.enfr - (s.mes - G.enfr[a.id])) + (a.enfr - (s.mes - G.enfr[a.id]) === 1 ? ' mes' : ' meses');
    if (a.pc > G.pc) return 'Falta ⭐';
    return null;
  };

  gob.efectosAccion = (s, a) => Object.assign({}, a.ef, a.gasto ? { gastoExtra: a.gasto } : {}, { pc: -a.pc });

  gob.hacer = function (s, id) {
    const a = gob.ACC[id];
    const b = gob.bloqueoAccion(s, a);
    if (b) return { error: b };
    let ef = gob.efectosAccion(s, a);
    let txt = a.res;
    let bueno = true;
    if (a.azar && R.chance(s, a.azar.p)) {
      ef = R.sumarEfectos(ef, a.azar.ef);
      txt = a.azar.txt;
      bueno = false;
    }
    const antes = s.gob.aprob;
    const aplicado = gob.aplicarEfectos(s, ef);
    s.gob.enfr[id] = s.mes;
    R.diario(s, a.emoji, a.nombre, 'accion');
    return { txt, bueno, aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob };
  };

  // ── Medidas económicas fuertes ──
  gob.MEDIDAS = [
    { id: 'devaluar', emoji: '💱', nombre: 'Devaluar', desc: 'Dólar 30 % más caro', enfr: 12,
      ef: { dolar: 30, expo: 0.12, campo: 8, empresarios: 3, trabajadores: -8, media: -7, humildes: -5, jubilados: -5 },
      res: 'El dólar saltó: más exportaciones, pero suben los precios 💱' },
    { id: 'cepo', emoji: '🔒', nombre: 'Poner cepo', desc: 'Nadie compra dólares', enfr: 6, si: (s) => !s.eco.cepo,
      ef: { empresarios: -10, campo: -6, media: -5 }, hacer: (s) => { s.eco.cepo = true; s.eco.brecha = 15; },
      res: 'Cepo al dólar: cuidás las reservas, pero aparece el blue 🔒' },
    { id: 'sincepo', emoji: '🔓', nombre: 'Sacar el cepo', desc: 'Dólar libre', enfr: 6, si: (s) => s.eco.cepo,
      ef: (s) => ({ empresarios: 10, campo: 7, dolar: Math.round(Math.max(5, s.eco.brecha * 0.6 + (s.eco.reservas < 15 ? 20 : 0))), media: -2 }),
      hacer: (s) => { s.eco.cepo = false; s.eco.brecha = 0; }, res: 'Chau cepo: el dólar se acomoda 🔓' },
    { id: 'pagar_deuda', emoji: '🏦', nombre: 'Pagar deuda con reservas', desc: 'Usás US$ 10 mil M', enfr: 12, si: (s) => s.eco.reservas >= 20,
      ef: (s) => ({ reservas: -10, deuda: -R.round((10 / R.eco.pbiUSD(s)) * 100, 1), empresarios: 2 }),
      res: 'Pagaste deuda con reservas: debés menos, pero tenés menos colchón 🏦' },
    { id: 'motosierra', emoji: '🪚', nombre: 'Motosierra', desc: 'Recorte del 15 % en todo', enfr: 12,
      ef: { empresarios: 6, riesgo: -150 },
      hacer: (s) => { for (const a of R.AREAS) s.eco.niveles[a.id] = Math.max(R.eco.NIVEL_MIN, R.round(s.eco.niveles[a.id] - 0.15, 2)); },
      res: '¡Motosierra! El gasto se achica. A fin de mes reacciona la gente 🪚' },
  ];
  gob.MED = Object.fromEntries(gob.MEDIDAS.map((m) => [m.id, m]));
  gob.efectoMedida = (s, m) => (typeof m.ef === 'function' ? m.ef(s) : m.ef);
  gob.bloqueoMedida = function (s, m) {
    if (m.si && !m.si(s)) return 'No aplica';
    const k = 'med_' + m.id;
    if (s.gob.enfr[k] && s.mes - s.gob.enfr[k] < m.enfr) return 'De nuevo en ' + (m.enfr - (s.mes - s.gob.enfr[k])) + ' meses';
    return null;
  };
  gob.medida = function (s, id) {
    const m = gob.MED[id];
    const b = gob.bloqueoMedida(s, m);
    if (b) return { error: b };
    const antes = s.gob.aprob;
    const aplicado = gob.aplicarEfectos(s, gob.efectoMedida(s, m));
    if (m.hacer) m.hacer(s);
    s.gob.enfr['med_' + id] = s.mes;
    R.diario(s, m.emoji, m.nombre, 'medida');
    return { txt: m.res, bueno: true, aplicado, aprobAntes: antes, aprobDespues: s.gob.aprob };
  };

  // ── Cambios de presupuesto: la gente reacciona a fin de mes ──
  const AREA_GRUPOS = {
    jubilaciones: { jubilados: 1 },
    social: { humildes: 1, media: -0.25 },
    salud: { jubilados: 0.4, humildes: 0.4, media: 0.3 },
    educacion: { media: 0.6 },
    seguridad: { media: 0.5 },
    defensa: {},
    obras: { trabajadores: 0.6 },
    subsidios: { trabajadores: 0.35, media: 0.35, humildes: 0.5, jubilados: 0.5 },
    ciencia: { media: 0.25 },
  };
  // Reacción inmediata (anuncio) a los cambios del mes, comparando con cómo arrancó el mes.
  gob.reaccionPresupuesto = function (s) {
    const e = s.eco;
    const ef = {};
    const sumar = (k, v) => (ef[k] = (ef[k] || 0) + v);
    for (const a of R.AREAS) {
      const d = e.niveles[a.id] - e.nivelesInicioMes[a.id];
      if (Math.abs(d) < 0.01) continue;
      const fuerza = d < 0 ? 22 : 11; // perder duele el doble que ganar
      for (const [g, w] of Object.entries(AREA_GRUPOS[a.id])) sumar(g, d * fuerza * w * (a.id === 'jubilaciones' || a.id === 'social' ? 1.4 : 1));
    }
    const di = e.impuestos - e.impuestosInicioMes;
    if (di) { sumar('empresarios', di > 0 ? -7 * di : -4 * di); sumar('media', di > 0 ? -5 * di : -3 * di); }
    const dr = e.retenciones - e.retencionesInicioMes;
    if (dr) sumar('campo', dr > 0 ? -9 * dr : -6 * dr);
    for (const k in ef) ef[k] = R.round(ef[k], 1);
    return ef;
  };

  // ── El mes del gobierno ──
  gob.pasarMes = function (s, momentos) {
    const G = s.gob;
    const e = s.eco;
    const antes = R.eco.foto(s);
    const humorAntes = Object.fromEntries(R.GRUPOS.map((g) => [g.id, G.grupos[g.id].humor]));
    const aprobAntes = G.aprob;

    // Reacción a los cambios de presupuesto e impuestos del mes
    const reaccion = gob.reaccionPresupuesto(s);
    if (Object.keys(reaccion).length) gob.aplicarEfectos(s, reaccion);

    R.eco.mes(s);

    // La gente se acomoda de a poco a cómo le va
    for (const g of R.GRUPOS) {
      const st = G.grupos[g.id];
      const { obj, partes } = gob.objetivoGrupo(s, g.id);
      st.partesAntes = st.partes;
      st.partes = partes;
      st.objetivo = obj;
      st.antes = humorAntes[g.id];
      st.humor = R.clamp(st.humor + (obj - st.humor) * 0.28 + R.gauss(s) * 0.6, 0, 100);
    }
    G.lunaMiel *= 0.88;
    G.meses++;
    G.escandalo *= 0.93;
    gob.actualizarAprob(s);
    G.pc = R.clamp(G.pc + gob.ingresoPC(s), 0, G.pcMax);

    // Nuevo mes y año
    s.mes++;
    e.nivelesInicioMes = Object.assign({}, e.niveles);
    e.impuestosInicioMes = e.impuestos;
    e.retencionesInicioMes = e.retenciones;
    if (R.mesDelAnio(s.mes) === 0) {
      e.gastoExtraAnio = 0;
      e.deficitAcumAnio = 0;
    }

    const despues = R.eco.foto(s);
    G.historia.push(despues);
    if (G.historia.length > 120) G.historia.shift();

    // Crisis
    G.llamas = gob.llamas(s).map((l) => l.id);
    G.aprobBajaMeses = G.aprob < 12 ? (G.aprobBajaMeses || 0) + 1 : 0;

    momentos.push({ tipo: 'resumen', antes, despues, aprobAntes, aprobDespues: G.aprob, humorAntes, reaccion, frases: gob.frases(s, humorAntes, 3) });

    if (G.aprobBajaMeses >= 3) {
      gob.terminar(s, momentos, 'helicoptero');
      return;
    }
    if (G.escandalo >= 10 && (!G.juicioMes || s.mes - G.juicioMes > 12)) {
      G.juicioMes = s.mes;
      momentos.push({ tipo: 'juicio' });
    }
    const nLlamas = G.llamas.length;
    if (nLlamas >= 6 && R.chance(s, 0.1 * (nLlamas - 5))) {
      const ev = R.ev.porId('g_estallido');
      if (ev) momentos.push(R.ev.instanciar(s, ev));
    }

    // El mundo (guerra, resistencia) y las elecciones del mandato
    if (R.mundo && R.mundo.mes) R.mundo.mes(s, momentos);
    if (R.gob.elecciones && R.gob.elecciones(s, momentos)) return;

    // Noticia del mes
    if (R.chance(s, 0.85)) {
      const n = R.ev.elegir(s, 'gobierno');
      if (n) momentos.push(n);
    }
  };

  gob.terminar = function (s, momentos, motivo) {
    s.fase = 'fin';
    s.fin = { motivo, mes: s.mes };
    const txt = { helicoptero: 'Renunciaste y te fuiste en helicóptero 🚁', estallido: 'Estallido social: tuviste que renunciar', mandato: 'Terminaste tu mandato', juicio: 'Te destituyó el Congreso' }[motivo] || 'Fin';
    R.diario(s, '🏁', txt, 'fin');
    momentos.push({ tipo: 'fin' });
  };

  // Frase de la gente: elige la razón que más cambió para cada grupo.
  gob.frases = function (s, humorAntes, max) {
    const G = s.gob;
    const out = [];
    for (const g of R.GRUPOS) {
      const st = G.grupos[g.id];
      const d = st.humor - humorAntes[g.id];
      let mejor = null;
      let mejorD = 0;
      for (const p of st.partes) {
        const ant = (st.partesAntes || []).find((x) => x.k === p.k);
        const dd = p.v - (ant ? ant.v : 0);
        if (Math.abs(dd) > Math.abs(mejorD)) { mejor = p.k; mejorD = dd; }
      }
      // Si nada cambió mucho, habla de lo que más le pesa.
      if (!mejor || Math.abs(mejorD) < 0.6) {
        const top = st.partes.slice().sort((a, b) => Math.abs(b.v) - Math.abs(a.v))[0];
        if (top && Math.abs(top.v) > 4) { mejor = top.k; mejorD = top.v; }
      }
      const clave = mejor ? mejor + (mejorD >= 0 ? '+' : '-') : d >= 0 ? 'bien' : 'mal';
      const banco = (R.FRASES[g.id] && (R.FRASES[g.id][clave] || R.FRASES[g.id][d >= 0 ? 'bien' : 'mal'])) || [];
      if (!banco.length) continue;
      out.push({ grupo: g.id, d, txt: banco[Math.floor(R.rand(s) * banco.length)], bueno: (mejorD || d) >= 0, peso: Math.abs(d) + Math.abs(mejorD) * 0.5 });
    }
    return out.sort((a, b) => b.peso - a.peso).slice(0, max || 3);
  };
})(globalThis.R = globalThis.R || {});
