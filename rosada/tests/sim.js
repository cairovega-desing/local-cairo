// Simula partidas con bots en Node (sin navegador) para encontrar errores y balancear.
// Uso: node rosada/tests/sim.js [cantidad] [estrategia]
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((f) => !f.includes('/ui/') && !f.endsWith('main.js'));
for (const f of scripts) vm.runInThisContext(fs.readFileSync(path.join(raiz, f), 'utf8'), { filename: f });
const R = globalThis.R;

let errores = 0;
function chequear(s, donde) {
  const malos = [];
  const mirar = (obj, ruta) => {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'number' && !isFinite(v)) malos.push(ruta + k + '=' + v);
      else if (v && typeof v === 'object' && !Array.isArray(v) && ruta.split('.').length < 5) mirar(v, ruta + k + '.');
    }
  };
  mirar(s, '');
  const v = R.camp.votos(s).nac;
  const tot = R.sum(Object.values(v));
  if (Math.abs(tot - 100) > 0.01) malos.push('votos suman ' + tot);
  if (malos.length) {
    errores++;
    if (errores < 5) console.log('❌', donde, malos.slice(0, 5).join(', '));
  }
}


// Estrategias de campaña.
const ESTRATEGIAS = {
  azar(s) {
    const acc = R.pick(s, R.camp.ACCIONES);
    let arg;
    if (acc.elegir === 'provincia') arg = R.pick(s, R.PROVINCIAS).id;
    if (acc.elegir === 'plata') arg = R.pick(s, ['rifa', 'empresas']);
    if (acc.elegir === 'figura') arg = R.pick(s, R.FIGURAS.filter((f) => !s.camp.figuras.includes(f.id))).id;
    if (acc.elegir === 'rival') arg = R.pick(s, R.RIVALES);
    if (acc.elegir === 'aliado') arg = R.pick(s, R.ALIADOS).id;
    return [acc.id, arg];
  },
  lista(s) {
    const c = s.camp;
    const usar = (id) => !R.camp.bloqueo(s, R.camp.ACC[id], undefined) || R.camp.ACC[id].elegir;
    if (c.conocen < 70 && c.fondos >= 25 && !c.usadasMes.tv) return ['tv'];
    if (c.militancia < 45 && c.fondos >= 15 && R.chance(s, 0.4)) return ['estructura'];
    const fig = R.FIGURAS.filter((f) => !c.figuras.includes(f.id) && f.costo <= c.fondos).sort((a, b) => Math.abs(a.ideo - s.partido.ideo) - Math.abs(b.ideo - s.partido.ideo))[0];
    if (fig && c.fondos > 50 && R.chance(s, 0.5)) return ['figura', fig.id];
    if (!c.alianza && s.mes >= 4) return ['alianza', R.ALIADOS.slice().sort((a, b) => Math.abs(a.ideo - s.partido.ideo) - Math.abs(b.ideo - s.partido.ideo))[0].id];
    if (c.fondos < 15) return R.chance(s, 0.5) ? ['plata', 'rifa'] : ['entrevista'];
    const prov = R.camp.mejorActo(s); // la que el juego marca con ⭐
    if (c.fondos >= 10) return ['acto', prov];
    return usar('entrevista') ? ['entrevista'] : ['plata', 'rifa'];
  },
};

function decidirNoticia(s, inst) {
  const d = R.ev.datos(s, inst);
  const ok = d.opciones.filter((o) => !o.bloqueo);
  // El bot elige la opción con más simpatía esperada (o al azar).
  let mejor = ok[0];
  let mejorV = -1e9;
  for (const o of ok) {
    const v = R.describirEfectos(s, o.ef).reduce((a, e) => a + (e.bueno ? 1 : -1) * e.flechas, 0) + R.rand(s) * 0.5;
    if (v > mejorV) { mejorV = v; mejor = o; }
  }
  return mejor ? mejor.i : 0;
}

function jugarCampana(semilla, estrategia, opts) {
  const s = R.nuevaPartida({
    semilla,
    dificultad: opts.dif || 'normal',
    partido: { nombre: 'Prueba', sigla: 'PP', color: '#e8504f', simbolo: '☀️', ideo: opts.ideo ?? (semilla % 5) / 2 - 1, estilo: 0 },
    lider: { nombre: 'Bot', avatar: R.avatarAzar() },
  });
  let guard = 0;
  while ((s.fase === 'campana' || s.cola.length) && guard++ < 200) {
    // Procesar la cola.
    while (s.cola.length) {
      const m = s.cola.shift();
      if (m.tipo === 'noticia') R.ev.resolver(s, m, decidirNoticia(s, m));
      if (m.tipo === 'debate') {
        const d = R.debate.nuevo(s, m.rival, m.etapa);
        while (d.ronda < 3) R.debate.jugar(s, d, d.temas[d.ronda].fuerte);
        R.debate.terminar(s, d);
      }
      chequear(s, 'cola ' + m.tipo + ' mes ' + s.mes);
    }
    if (s.fase !== 'campana') break;
    let intentos = 0;
    while (s.camp.agenda > 0 && intentos++ < 12) {
      const [id, arg] = ESTRATEGIAS[estrategia](s);
      R.camp.hacer(s, id, arg);
    }
    chequear(s, 'mes ' + s.mes);
    R.turno.pasar(s);
  }
  return s;
}

module.exports = { R, jugarCampana, ESTRATEGIAS, decidirNoticia, chequear };
if (require.main === module) {
const N = +process.argv[2] || 300;
const est = process.argv[3] || 'lista';
const stats = { gana1: 0, ganaBal: 0, pierdeBal: 0, pierdeGen: 0, pierdePaso: 0, votosGen: [], dip: [], sen: [] };
for (let i = 0; i < N; i++) {
  const s = jugarCampana(1000 + i, est, {});
  const g = s.elecciones.general;
  if (g) {
    stats.votosGen.push(g.lista.find((x) => x.id === 'YO').v);
    stats.dip.push(g.bancas.dip.YO || 0);
    stats.sen.push(g.bancas.sen.YO || 0);
  }
  if (s.fase === 'electo') s.flags.ganoEn === 'primera' ? stats.gana1++ : stats.ganaBal++;
  else if (s.fin && s.fin.motivo === 'ballotage') stats.pierdeBal++;
  else if (s.fin && s.fin.motivo === 'general') stats.pierdeGen++;
  else if (s.fin && s.fin.motivo === 'paso') stats.pierdePaso++;
}
const prom = (a) => (a.length ? R.round(R.sum(a) / a.length, 1) : 0);
const pctl = (a, p) => R.round(a.slice().sort((x, y) => x - y)[Math.floor(a.length * p)] || 0, 1);
console.log(`Estrategia «${est}», ${N} campañas`);
console.log(`  Gana 1.ª vuelta: ${stats.gana1} · Gana ballotage: ${stats.ganaBal} · Pierde ballotage: ${stats.pierdeBal} · Pierde general: ${stats.pierdeGen} · Afuera en PASO: ${stats.pierdePaso}`);
console.log(`  Votos en generales: prom ${prom(stats.votosGen)} % (p10 ${pctl(stats.votosGen, 0.1)} · p50 ${pctl(stats.votosGen, 0.5)} · p90 ${pctl(stats.votosGen, 0.9)})`);
console.log(`  Diputados ganados: prom ${prom(stats.dip)} · Senadores: prom ${prom(stats.sen)}`);
console.log(errores ? `❌ ${errores} problemas` : '✅ Sin NaN ni sumas raras');
process.exitCode = errores ? 1 : 0;
}
