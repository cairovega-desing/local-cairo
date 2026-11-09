// Revisa que los textos sean cortos (pilar del juego: poco texto).
'use strict';
const { R } = require('./sim.js');
let malos = 0;
for (const e of R.EVENTOS) {
  const t = typeof e.titular === 'string' ? e.titular : '';
  if (t.split(' ').length > 9) { console.log('❌ titular largo:', e.id, '→', t); malos++; }
  for (const o of e.opciones) if (!o.txt || o.txt.split(' ').length > 4) { console.log('❌ opción larga:', e.id, '→', o.txt); malos++; }
}
for (const l of R.LEYES) if (l.desc.split(' ').length > 7) { console.log('❌ ley larga:', l.id); malos++; }
const c = {};
for (const e of R.EVENTOS) c[e.fase] = (c[e.fase] || 0) + 1;
console.log('Noticias:', JSON.stringify(c), '· leyes:', R.LEYES.length, '· países:', R.PAISES.length, '· logros:', R.LOGROS.length);
console.log(malos ? `❌ ${malos} textos largos` : '✅ Textos cortos');
process.exitCode = malos ? 1 : 0;
