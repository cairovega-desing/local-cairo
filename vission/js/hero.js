// HERO: un solo plano secuencia. La cámara arranca dentro de la pupila
// (pantalla negra con VISSION) y retrocede hasta mostrar el ojo completo.
import { Eye } from './eye.js';
import { EyeLife } from './eye-life.js';

const { gsap, ScrollTrigger } = window;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const DEG = Math.PI / 180;

// Curva monótona (Fritsch–Carlson) para el recorrido de la cámara:
// arranque suave, ritmo parejo y una llegada que "aterriza".
function monotone(xs, ys) {
  const n = xs.length, d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (3 * (xs[i + 1] - xs[i - 1])) / ((2 * xs[i + 1] - xs[i] - xs[i - 1]) / d[i - 1] + (xs[i + 1] + xs[i] - 2 * xs[i - 1]) / d[i]);
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}
// p (scroll 0..1) → u (avance de la cámara 0..1)
//  0–20 %: la pupila se encoge · 20–45 %: iris en macro · 45–70 %: esclerótica y párpados · 70–85 %: el ojo entero
const camCurve = monotone([0, 0.2, 0.45, 0.7, 0.85], [0, 0.11, 0.46, 0.80, 1]);

export function initHero({ assets, reduced, lenis }) {
  const hero = document.querySelector('.hero');
  const stage = hero.querySelector('.hero__stage');
  const wordmark = stage.querySelector('.eye__wordmark');
  const scrollHint = stage.querySelector('.hero__scroll');
  const linesSvg = stage.querySelector('.hero__lines');
  const annos = [...stage.querySelectorAll('.anno')];

  const eye = new Eye({
    stage,
    canvas: stage.querySelector('.eye__canvas'),
    cornea: stage.querySelector('.eye__cornea'),
    clip: stage.querySelector('.eye__clip'),
    wordmark,
    assets,
    dprCap: navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 ? 1.5 : 2,
  });
  const life = new EyeLife(eye, { reduced });
  const st = eye.state;

  // ---- composición según pantalla ----
  const L = {};
  const eyeCenterWorld = [850, 486];
  function layout() {
    eye.resize();
    const w = eye.w, h = eye.h;
    L.mobile = w < 760;
    L.vh = window.innerHeight;
    const lashesW = 1100, lashesH = 560;
    L.sEnd = L.mobile ? Math.min((1.0 * w) / lashesW, (0.3 * h) / lashesH) : Math.min((0.56 * w) / lashesW, (0.52 * h) / lashesH);
    L.eyeY = h * (L.mobile ? 0.455 : 0.5);
    L.s0 = (Math.hypot(w, h) / 2) * 1.05 / (eye.geo.pupilR * 1.16);
    L.tEnd = [eyeCenterWorld[0], eyeCenterWorld[1] - (L.eyeY - h / 2) / L.sEnd];
    // el wordmark nunca pasa del tamaño del titular de la intro
    const fontPx = clamp(w * 0.18, 96, 320);
    eye.wordmarkCap = Math.min((eye.textW / 320) * fontPx, w * 0.9);
    L.annoK = clamp(w / 1440, 0.72, 1.25);
    annoData.forEach((a) => { a.lw = 0; });
    L.inset = L.mobile ? 8 : 14;
    L.rad = L.mobile ? 26 : 38;
    const seq = parseFloat(getComputedStyle(hero).getPropertyValue('--seq')) || 230;
    L.seqPx = (seq / 100) * L.vh;
    L.heroTop = hero.offsetTop;
  }

  // ---- anotaciones: líneas finas que apuntan a partes fijas del ojo ----
  const NS = 'http://www.w3.org/2000/svg';
  const annoData = annos.map((li) => {
    const [ax, ay] = li.dataset.anchor.split(',').map(Number);
    const [ox, oy] = li.dataset.off.split(',').map(Number);
    const [mx, my] = (li.dataset.offM || li.dataset.off).split(',').map(Number);
    const g = document.createElementNS(NS, 'g');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('pathLength', '1');
    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = '1';
    const dot = document.createElementNS(NS, 'circle'); dot.setAttribute('r', '2.5');
    const ring = document.createElementNS(NS, 'circle'); ring.setAttribute('r', '7'); ring.setAttribute('class', 'ring');
    g.append(path, ring, dot);
    linesSvg.append(g);
    return { li, ax, ay, ox, oy, mx, my, side: li.dataset.side, label: li.querySelector('.anno__label'), path, dot, ring, g, draw: { v: 0 } };
  });

  // ---- línea de tiempo del scroll (scrub) ----
  const S = { p: 0 };
  const titleSpans = stage.querySelectorAll('.hero__title .mask > span');
  gsap.set(titleSpans, { yPercent: 108 });
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.to(S, { p: 1, duration: 1 }, 0);
  tl.to(titleSpans, { yPercent: 0, duration: 0.09, stagger: 0.025, ease: 'power3.out' }, 0.7);
  tl.fromTo('.hero__pill', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.72);
  annoData.forEach((a, i) => {
    tl.to(a.draw, { v: 1, duration: 0.08, ease: 'power2.inOut' }, 0.74 + i * 0.025);
    tl.fromTo(a.li.querySelector('.anno__label'), { opacity: 0, x: a.ox < 0 ? 8 : -8 }, { opacity: 1, x: 0, duration: 0.05, ease: 'power2.out' }, 0.79 + i * 0.025);
  });
  tl.fromTo('.hstat', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.06, stagger: 0.015, ease: 'power2.out' }, 0.77);
  tl.fromTo('.hero__lead', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.78);
  tl.fromTo('.hero__ctas', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.8);

  let trigger;
  function buildTrigger() {
    trigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: () => '+=' + L.seqPx,
      scrub: reduced ? true : 1.1,
      animation: tl,
      invalidateOnRefresh: true,
    });
  }

  // ---- intro (2–2,8 s) ----
  let introDone = false;
  function playIntro() {
    const letters = wordmark.querySelectorAll('.wm-l');
    const sOff = 0.045 * 320;
    gsap.set(letters, { yPercent: 112 });
    gsap.set(wordmark.querySelector('.wm-s1'), { x: -sOff });
    gsap.set(wordmark.querySelector('.wm-s2'), { x: sOff });
    wordmark.style.visibility = 'visible';
    st.sweepX = -3.4; st.sweepA = 0;
    const tlI = gsap.timeline({ delay: 0.4, onComplete: () => { introDone = true; } });
    tlI.to(letters, { yPercent: 0, duration: 0.95, stagger: 0.07, ease: 'expo.out' }, 0);
    tlI.to([wordmark.querySelector('.wm-s1'), wordmark.querySelector('.wm-s2')], { x: 0, duration: 0.9, ease: 'power3.inOut' }, 0.42);
    // el reflejo de la córnea: la primera pista de que estamos dentro de un ojo
    tlI.to(st, { sweepX: 3.4, duration: 1.0, ease: 'power2.inOut' }, 0.8);
    tlI.to(st, { sweepA: 1, duration: 0.42, ease: 'sine.out' }, 0.8);
    tlI.to(st, { sweepA: 0, duration: 0.5, ease: 'sine.in' }, 1.3);
    tlI.to(scrollHint.children, { opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.1 }, 1.25);
    tlI.to('.nav', { opacity: 1, duration: 0.9, ease: 'power2.out' }, 1.5);
    tlI.add(() => {
      document.body.classList.remove('is-loading');
      lenis && lenis.start();
    }, 1.35);
    return tlI;
  }

  // ---- CTA principal: la pupila se dilata ----
  stage.querySelectorAll('[data-dilate]').forEach((el) => {
    el.addEventListener('pointerenter', () => life.setHover(true));
    el.addEventListener('pointerleave', () => life.setHover(false));
    el.addEventListener('focus', () => life.setHover(true));
    el.addEventListener('blur', () => life.setHover(false));
  });

  // ---- bucle por frame ----
  let last = performance.now();
  let exit = 0;
  const pt = {};
  let navTheme = null;
  let lastY = 0;
  const nav = document.querySelector('.nav');

  function frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    const y = window.scrollY - L.heroTop;
    exit = clamp((y - L.seqPx) / L.vh, 0, 1);
    const p = S.p;

    // ¿se ve el hero?
    const visible = exit < 0.999;
    eye.setVisible(visible);

    // vida: solo con el ojo entero en pantalla
    life.setAlive(introDone && p >= 0.86 && visible, now);
    const lf = life.update(now, dt);

    // --- cámara ---
    const u = camCurve(p);
    const sLog = lerp(Math.log(L.s0), Math.log(L.sEnd), u);
    st.s = Math.exp(sLog);
    const w = Math.pow(u, 3);
    st.tx = lerp(eye.geo.irisC[0], L.tEnd[0], w);
    st.ty = lerp(eye.geo.irisC[1], L.tEnd[1], w);
    const tilt = reduced ? 0 : Math.sin(Math.PI * u);
    st.rx = 6.5 * DEG * tilt;
    st.ry = -4.5 * DEG * tilt;
    st.floatY = lf.floatY;

    // --- pupila: dilatada en la oscuridad, se contrae cuando entra la luz ---
    const dil = lerp(1.16, 1.0, smooth(0.12, 0.45, p));
    st.pupil = dil * lf.pupil;
    st.blink = lf.blink;
    st.detail = smooth(2.2, 7, st.s);
    st.hiRot = -0.6 * (1 - smooth(0.15, 0.62, p));
    st.hiAmt = smooth(0.08, 0.3, p);

    if (visible) eye.render(now / 1000);

    // --- escena: fondo, contenedor redondeado, salida con paralaje ---
    stage.classList.toggle('is-light', p > 0.5);
    const k = smooth(0.86, 0.985, p);
    stage.style.setProperty('--inset', (k * L.inset).toFixed(2) + 'px');
    stage.style.setProperty('--rad', (k * L.rad).toFixed(2) + 'px');
    stage.style.transform = exit > 0 ? `translate3d(0, ${(-exit * 0.16 * L.vh).toFixed(2)}px, 0)` : '';
    scrollHint.style.opacity = (1 - smooth(0.005, 0.05, p)).toFixed(3);

    // --- anotaciones ---
    if (p > 0.6 && visible) {
      for (const a of annoData) {
        if (a.li.offsetParent === null) { a.g.style.display = 'none'; continue; }
        a.g.style.display = '';
        eye.project(a.ax, a.ay, pt);
        const ax = pt.x, ay = pt.y;
        const ox = L.mobile ? a.mx : a.ox * L.annoK, oy = L.mobile ? a.my : a.oy * L.annoK;
        // que la etiqueta nunca se salga de la pantalla
        const lw = a.lw || (a.lw = a.label.offsetWidth);
        let ex = ax + ox;
        const ey = ay + oy;
        if (a.side === 'r') ex = Math.min(ex, eye.w - 12 - lw);
        else ex = Math.max(ex, 12 + lw);
        const bx = ax + (ex - ax) * 0.38;
        a.path.setAttribute('d', `M${ax.toFixed(1)},${ay.toFixed(1)} L${bx.toFixed(1)},${ey.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}`);
        a.path.style.strokeDashoffset = (1 - a.draw.v).toFixed(4);
        a.dot.setAttribute('cx', ax.toFixed(1)); a.dot.setAttribute('cy', ay.toFixed(1));
        a.ring.setAttribute('cx', ax.toFixed(1)); a.ring.setAttribute('cy', ay.toFixed(1));
        const o = smooth(0, 0.4, a.draw.v);
        a.dot.style.opacity = o; a.ring.style.opacity = o;
        a.li.style.transform = `translate3d(${ex.toFixed(1)}px, ${ey.toFixed(1)}px, 0)`;
      }
      linesSvg.style.display = '';
    } else {
      linesSvg.style.display = 'none';
    }

    // --- tema del menú ---
    let theme = 'light';
    if (y < L.seqPx + L.vh * 0.94) theme = p < 0.45 ? 'dark' : 'light';
    else {
      for (const s of darkSections) {
        const r = s.getBoundingClientRect();
        if (r.top <= 34 && r.bottom >= 34) { theme = 'dark'; break; }
      }
    }
    // fuera del hero, el menú se esconde al bajar y vuelve al subir
    const sy = window.scrollY;
    const pastHero = y > L.seqPx + L.vh * 1.2;
    if (!pastHero) nav.classList.remove('is-hidden');
    else if (Math.abs(sy - lastY) > 6) nav.classList.toggle('is-hidden', sy > lastY);
    lastY = sy;
    if (theme !== navTheme) { nav.dataset.theme = theme; navTheme = theme; document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#000000' : '#F5F5F2'; }
  }
  const darkSections = [...document.querySelectorAll('[data-nav="dark"]')];

  layout();
  buildTrigger();
  gsap.ticker.add(frame);

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { layout(); ScrollTrigger.refresh(); }, 120);
  });
  ScrollTrigger.addEventListener('refresh', () => { L.heroTop = hero.offsetTop; });

  return { eye, life, playIntro, relayout: layout };
}
