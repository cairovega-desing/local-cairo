// Simula gobiernos con distintas estrategias para ver que la economía reaccione con sentido.
// Uso: node rosada/tests/sim_gob.js [partidas] [meses]
'use strict';
const { R, chequear } = require('./sim.js');

function nuevoGobierno(semilla, ideo) {
  const s = R.nuevaPartida({
    semilla, dificultad: 'normal',
    partido: { nombre: 'Prueba', sigla: 'PP', color: '#e8504f', simbolo: '☀️', ideo, estilo: 0 },
    lider: { nombre: 'Bot', avatar: R.avatarAzar() },
  });
  // Congreso como si hubiéramos sacado ~35 % de los votos.
  s.congreso.dip[2027] = { YO: 48, MNP: 40, PL: 22, AR: 12, UCF: 6, FT: 2 };
  s.congreso.sen[2027] = { YO: 10, MNP: 8, PL: 4, UCF: 2 };
  s.cola = [];
  R.gob.iniciar(s);
  s.cola = [];
  return s;
}

const ESTRATEGIAS = {
  quieto: () => {},
  gastador: (s) => { for (const a of R.AREAS) s.eco.niveles[a.id] = 1.4; s.eco.financiamiento = 0; },
  motosierra: (s) => { if (s.gob.meses === 0) { for (const a of R.AREAS) s.eco.niveles[a.id] = 0.75; s.eco.financiamiento = 2; } },
  equilibrado: (s) => {
    // Busca déficit ~0 subiendo/bajando subsidios y obras; usa acciones para el grupo más enojado.
    const r = R.eco.resultado(s);
    const e = s.eco;
    e.financiamiento = 2;
    if (r < -0.3) { if (e.niveles.subsidios > 0.6) e.niveles.subsidios = R.round(e.niveles.subsidios - 0.1, 2); else if (e.niveles.obras > 0.8) e.niveles.obras = R.round(e.niveles.obras - 0.1, 2); }
    else if (r > 0.8 && e.niveles.salud < 1.4) { e.niveles.salud = R.round(e.niveles.salud + 0.1, 2); e.niveles.educacion = R.round(e.niveles.educacion + 0.05, 2); }
    const peor = R.GRUPOS.slice().sort((a, b) => s.gob.grupos[a.id].humor - s.gob.grupos[b.id].humor)[0].id;
    const accion = { trabajadores: 'cgt', campo: 'campo', empresarios: 'inversores', humildes: 'barrios', jubilados: 'remedios', media: 'cadena' }[peor];
    if (accion && !R.gob.bloqueoAccion(s, R.gob.ACC[accion])) R.gob.hacer(s, accion);
  },
};

// Caminos por ideología: manejan el presupuesto como el equilibrado y mandan leyes de SU ideología.
const CAMINOS = { estado: -0.4, centro: 0, mercado: 0.4 };
for (const c of Object.keys(CAMINOS)) ESTRATEGIAS[c] = ESTRATEGIAS.equilibrado;
const valorLey = (s, l) => {
  const p = l.perm || {};
  return 2 * (p.bonusCrec || 0) + (p.bonusEmpleo || 0) + 10 * (p.bonusExpo || 0) + 1.5 * R.gob.fiscalLey(s, l) - 8 * (p.bonusPrecios || 0) - l.polemica * 0.5;
};

function decidir(s, inst, modo) {
  const d = R.ev.datos(s, inst);
  const ok = d.opciones.filter((o) => !o.bloqueo);
  if (!ok.length) return 0;
  if (modo === 'primera') return ok[0].i;
  let mejor = ok[0];
  let mv = -1e9;
  for (const o of ok) {
    const v = R.describirEfectosFase(s, o.ef).reduce((a, e) => a + (e.bueno ? 1 : -1) * e.flechas, 0) - (o.costo.pc || 0) * 0.5 - (o.costo.gasto || 0) * 0.4;
    if (v > mv) { mv = v; mejor = o; }
  }
  return mejor.i;
}

const stats = { presupuestos: [], elecciones: [], leyes: [], protestas: [], metas: [], avisos: 0, ataques: 0 };
// Qué construye cada camino (el Estado construye; el mercado deja que inviertan los privados y solo arregla la energía).
function construir(s, est) {
  if (!s.prod || R.prod.cuadrillas(s) <= s.prod.obras.length) return;
  const en = R.prod.energia(s).saldo;
  const n = (id) => R.prod.nivel(s, id) + s.prod.obras.filter((o) => o.id === id).length;
  let id = null;
  if (est === 'estado') id = en < 0.5 ? 'energia' : n('industria') <= n('campo') + 2 ? 'industria' : 'campo';
  else if (est === 'centro' || est === 'equilibrado') id = en < 0.5 ? 'energia' : 'tecno';
  else if (est === 'mercado') id = en < -0.5 ? 'energia' : null;
  const umbral = est === 'estado' ? 4 : 7;
  if (id && s.gob.pc >= umbral && !R.prod.bloqueoConstruir(s, id)) R.prod.construir(s, id);
}
function jugar(semilla, est, meses) {
  const s = nuevoGobierno(semilla, CAMINOS[est] ?? ((semilla % 5) - 2) / 2);
  R.gob.elegirMinistro(s, ['ortodoxo', 'heterodoxo', 'pragmatico'][semilla % 3]);
  const serie = [];
  for (let i = 0; i < meses && s.fase === 'gobierno'; i++) {
    ESTRATEGIAS[est](s);
    R.turno.pasar(s);
    while (s.cola.length) {
      const m = s.cola.shift();
      if (m.tipo === 'noticia') R.ev.resolver(s, m, decidir(s, m, est === 'quieto' ? 'primera' : 'mejor'));
      if (m.tipo === 'presupuesto') { const v = R.congreso.votarPresupuesto(s, est === 'equilibrado'); stats.presupuestos.push(v.ok); }
      if (m.tipo === 'dnu_cae') R.gob.aplicarEfectos(s, R.congreso.efDnuCae);
      if (m.tipo === 'eleccion') stats.elecciones.push(m.clave + ':' + (s.elecciones[m.clave].ganador === 'YO' ? 'gana' : s.elecciones[m.clave].ballotage && s.elecciones[m.clave].ballotage.includes('YO') ? 'ballotage' : 'pierde'));
      if (m.tipo === 'ministro') R.gob.elegirMinistro(s, 'pragmatico');
      if (m.tipo === 'legado') R.metas.elegirGrande(s, R.metas.opcionesGrandes(s)[semilla % 3].id);
      if (m.tipo === 'protesta') {
        const op = est === 'quieto' ? 'aguantar' : s.gob.pc >= 4 ? 'negociar' : 'ceder';
        R.protestas.resolver(s, m.grupo, op);
        stats.protestas.push(m.grupo + ':' + op);
      }
      if (m.tipo === 'aviso_mundo') {
        stats.avisos++;
        const X = R.prod.CICLO[m.id];
        if (est !== 'quieto' && s.gob.pc >= (X.prep.costo.pc || 0) + 4) R.prod.preparar(s);
      }
      if (m.tipo === 'meta') stats.metas.push((m.ok ? '✔' : '✘') + m.id);
      if (m.tipo === 'atacado') stats.ataques++;
      if (m.tipo === 'guerra' && s.mundo.guerra) R.mundo.orden(s, 'ofensiva');
    }
    if (est !== 'quieto' && est !== 'gastador' && est !== 'motosierra') construir(s, est);
    // Leyes: el equilibrado manda una ley afín cuando tiene ⭐ y votos; los caminos, la mejor de su ideología.
    if ((est === 'equilibrado' || CAMINOS[est] !== undefined) && s.gob.pc >= 6) {
      const ley = CAMINOS[est] !== undefined
        ? R.LEYES.filter((l) => !R.congreso.bloqueoLey(s, l) && R.ideaLey(l) === est && l.polemica < 0.9).sort((a, b) => valorLey(s, b) - valorLey(s, a))[0]
        : R.LEYES.find((l) => !R.congreso.bloqueoLey(s, l) && Math.abs(l.ideo - s.partido.ideo) < 0.6 && l.polemica < 0.7);
      if (ley) {
        const p = R.congreso.porotos(s, ley);
        if (p.diputados.si < p.diputados.necesarios) { const b = p.diputados.bloques.find((x) => x.postura !== 'si' && x.id !== 'YO'); if (b) R.congreso.negociar(s, ley, b.id); }
        const r = R.congreso.votar(s, ley);
        stats.leyes.push(r.aprobada);
      }
    }
    chequear(s, est + ' mes ' + s.mes);
    serie.push(R.eco.foto(s));
  }
  return { s, serie };
}

if (require.main === module) {
  const N = +process.argv[2] || 60;
  const MESES = +process.argv[3] || 48;
  const SOLO = process.argv[4];
  for (const est of Object.keys(ESTRATEGIAS).filter((e) => !SOLO || e === SOLO)) {
    const fin = { helicoptero: 0, estallido: 0 };
    const cortes = [6, 12, 24, 47].map(() => []);
    const finales = [];
    const sectores = [];
    for (let i = 0; i < N; i++) {
      const { s, serie } = jugar(500 + i, est, MESES);
      if (s.prod) sectores.push(Object.assign(Object.fromEntries(R.SECTORES.map((x) => [x.id, s.prod.sec[x.id].nivel])), { sa: R.mundo.puesto(s, true), prest: s.mundo.prestigio || 0 }));
      if (s.fin) fin[s.fin.motivo] = (fin[s.fin.motivo] || 0) + 1;
      if (s.fin && R.legado(s)) finales.push(R.legado(s));
      [6, 12, 24, 47].forEach((m, k) => { if (serie[m]) cortes[k].push(serie[m]); });
    }
    console.log(`\n▶ ${est} (${N} partidas) · terminan antes: ${JSON.stringify(fin)}`);
    const cuenta = (arr) => arr.reduce((a, x) => ((a[x] = (a[x] || 0) + 1), a), {});
    if (finales.length) console.log('  legados:', finales.map((x) => x.estrellas + '★ «' + x.titulo + '»').slice(0, 6).join(' · '));
    console.log('  presupuestos aprobados:', JSON.stringify(cuenta(stats.presupuestos)), '· leyes aprobadas:', JSON.stringify(cuenta(stats.leyes)), '· elecciones:', JSON.stringify(cuenta(stats.elecciones)));
    const prom = (k) => R.round(sectores.reduce((a, x) => a + x[k], 0) / Math.max(1, sectores.length), 1);
    console.log('  sectores al final:', R.SECTORES.map((x) => x.emoji + prom(x.id)).join(' '), '· puesto Sudamérica', prom('sa'), '· prestigio', prom('prest'),
      '· protestas/partida', R.round(stats.protestas.length / N, 1), '· avisos', R.round(stats.avisos / N, 1), '· ataques', stats.ataques);
    const metas = cuenta(stats.metas.map((x) => x[0]));
    console.log('  metas:', JSON.stringify(metas), '· protestas:', JSON.stringify(cuenta(stats.protestas.map((x) => x.split(':')[1]))));
    stats.presupuestos = []; stats.elecciones = []; stats.leyes = []; stats.protestas = []; stats.metas = []; stats.avisos = 0; stats.ataques = 0;
    [6, 12, 24, 47].forEach((m, k) => {
      const c = cortes[k];
      if (!c.length) return;
      const p = (f) => R.round(c.reduce((a, x) => a + x[f], 0) / c.length, 1);
      console.log(`  mes ${String(m + 1).padStart(2)}: aprob ${p('aprob')}% · infl anual ${p('inflAnual')}% · crec ${p('crec')}% · desempleo ${p('desempleo')}% · pobreza ${p('pobreza')}% · reservas ${p('reservas')} · deuda ${p('deuda')}% · riesgo ${p('riesgo')} · resultado ${p('resultado')}% (n=${c.length})`);
    });
  }
}
module.exports = { jugar, nuevoGobierno };
