// Sonidos generados en el momento con WebAudio (no hay archivos). Arranca después del primer toque.
(function (R) {
  'use strict';

  const son = (R.son = {});
  let ctx = null;
  son.activo = R.pref('sonido') !== false;

  function audio() {
    if (!son.activo) return null;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) {
      return null;
    }
  }

  function tono(frec, dur, opts) {
    const a = audio();
    if (!a) return;
    opts = opts || {};
    const t = a.currentTime + (opts.retraso || 0);
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = opts.tipo || 'sine';
    o.frequency.setValueAtTime(frec, t);
    if (opts.hasta) o.frequency.exponentialRampToValueAtTime(opts.hasta, t + dur);
    const vol = opts.vol ?? 0.18;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function ruido(dur, opts) {
    const a = audio();
    if (!a) return;
    opts = opts || {};
    const t = a.currentTime + (opts.retraso || 0);
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (opts.crepitar ? (Math.random() < 0.08 ? 1 : 0.2) : 1);
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = opts.filtro || 'bandpass';
    f.frequency.value = opts.frec || 1800;
    f.Q.value = opts.q || 0.8;
    const g = a.createGain();
    const vol = opts.vol ?? 0.25;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (opts.ataque || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(a.destination);
    src.start(t);
  }

  son.toque = () => tono(660, 0.07, { tipo: 'triangle', vol: 0.12 });
  son.bien = () => { tono(660, 0.12, { tipo: 'triangle' }); tono(990, 0.18, { tipo: 'triangle', retraso: 0.09 }); };
  son.genial = () => [523, 659, 784, 1046].forEach((f, i) => tono(f, 0.2, { tipo: 'triangle', retraso: i * 0.08, vol: 0.16 }));
  son.mal = () => { tono(220, 0.22, { tipo: 'sawtooth', vol: 0.08, hasta: 150 }); };
  son.moneda = () => { tono(988, 0.08, { tipo: 'square', vol: 0.06 }); tono(1318, 0.22, { tipo: 'square', vol: 0.06, retraso: 0.07 }); };
  son.diario = () => { for (let i = 0; i < 5; i++) ruido(0.03, { retraso: i * 0.07, frec: 3000, vol: 0.12, q: 2 }); };
  son.tambor = () => { tono(110, 0.25, { vol: 0.3, hasta: 50 }); ruido(0.12, { frec: 400, vol: 0.15 }); };
  son.aplausos = (dur) => ruido(dur || 1.6, { crepitar: true, frec: 2400, q: 0.6, vol: 0.3, ataque: 0.15 });
  son.abucheo = () => { tono(180, 0.7, { tipo: 'sawtooth', vol: 0.06, hasta: 120 }); tono(150, 0.7, { tipo: 'sawtooth', vol: 0.05, hasta: 100 }); };
  son.tic = () => tono(1200, 0.025, { tipo: 'square', vol: 0.04 });

  son.alternar = function () {
    son.activo = !son.activo;
    R.pref('sonido', son.activo);
    if (son.activo) son.bien();
    return son.activo;
  };
})(globalThis.R = globalThis.R || {});
