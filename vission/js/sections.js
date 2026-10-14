// Todo lo que viene después del hero.
import { Eye } from './eye.js';
import { EyeLife } from './eye-life.js';

const { gsap, ScrollTrigger } = window;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ---------- Frases de marca / testimonios ----------
// Cuando haya testimonios reales, se cargan acá: { quote, soft?, name, business, rubro }.
// `soft` es el final de la frase en gris. El diseño no cambia: si hay nombre, aparece la firma.
export const STATEMENTS = [
  { quote: 'Si tu cliente no te encuentra,', soft: 'no existe.' },
  { quote: 'La primera impresión', soft: 'ya no es en persona.' },
  { quote: 'Una buena web trabaja', soft: 'mientras vos atendés.' },
];
const QUOTE_TIME = 5.5; // segundos que queda cada frase

// ---------- Contacto ----------
// EDITAR: número de WhatsApp en formato internacional, sin + ni espacios (ej.: 59899123456)
export const CONTACT = { whatsapp: '', whatsappLabel: '[número]' };

export function initSections({ reduced, lenis, assets }) {
  splitReveals();
  facts();
  services(reduced);
  plans();
  process(reduced);
  beforeAfter(reduced);
  team();
  experience(reduced);
  quotes(reduced);
  const contactApi = contact({ reduced, assets });
  links(lenis);
  return { contact: contactApi };
}

// Revelado con máscara: líneas que suben desde abajo
function splitReveals() {
  document.querySelectorAll('.split').forEach((el) => {
    const spans = el.querySelectorAll('.mask > span');
    gsap.set(spans, { yPercent: 108 });
    gsap.to(spans, {
      yPercent: 0, duration: 1.15, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none reverse' },
    });
  });
  document.querySelectorAll('.reveal-fade').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
    });
  });
}

function facts() {
  const counts = document.querySelectorAll('.facts .count');
  counts.forEach((el) => {
    const to = +el.dataset.to;
    const from = to === 0 ? 9 : 0;
    const o = { v: from };
    el.textContent = from;
    gsap.to(o, {
      v: to, duration: 1.6, ease: 'power3.out',
      onUpdate: () => { el.textContent = Math.round(o.v); },
      scrollTrigger: { trigger: '.facts__row', start: 'top 82%', toggleActions: 'play none none reverse' },
    });
  });
  gsap.from('.fact', {
    y: 40, opacity: 0, duration: 1.2, stagger: 0.09, ease: 'expo.out',
    scrollTrigger: { trigger: '.facts__row', start: 'top 85%', toggleActions: 'play none none reverse' },
  });
}

function services(reduced) {
  const box = document.querySelector('.services__box');
  // el contenedor oscuro sube sobre el blanco
  gsap.fromTo(box, { y: reduced ? 0 : 160, scale: 0.955, borderRadius: 64 }, {
    y: 0, scale: 1, borderRadius: window.innerWidth < 760 ? 26 : 38, ease: 'none',
    scrollTrigger: { trigger: '.services', start: 'top bottom', end: 'top 25%', scrub: 1.1 },
  });
  const cards = gsap.utils.toArray('.scard');
  // entran de costado, de a una
  gsap.from(cards, {
    x: 140, opacity: 0, duration: 1.4, stagger: 0.14, ease: 'expo.out',
    scrollTrigger: { trigger: '.services__cards', start: 'top 82%', toggleActions: 'play none none reverse' },
  });
  // paralaje sutil distinto para cada tarjeta
  if (!reduced && window.innerWidth > 900) {
    cards.forEach((c) => {
      const [a, b] = c.dataset.par.split(',').map(Number);
      gsap.fromTo(c, { y: a }, {
        y: b, ease: 'none',
        scrollTrigger: { trigger: '.services__cards', start: 'top bottom', end: 'bottom top', scrub: 1.2 },
      });
    });
  }
}

function plans() {
  gsap.from('.plan', {
    y: 50, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.plans__grid', start: 'top 82%', toggleActions: 'play none none reverse' },
  });
}

// Proceso: la composición de dispositivos se arma, gira apenas, se despiece en capas y se vuelve a juntar
function process(reduced) {
  const section = document.querySelector('.process');
  const devices = section.querySelector('.devices');
  const phone = section.querySelector('.phone');
  const layers = section.querySelectorAll('.layer');
  const tags = section.querySelectorAll('.layer__tag');
  const labels = section.querySelectorAll('.plabel');
  const steps = section.querySelectorAll('.pstep');
  const mobile = window.innerWidth < 900;
  const z = mobile ? [10, 26, 44, 64] : [22, 60, 104, 150];
  const layersEl = section.querySelector('.layers');
  gsap.set(layers, { z: (i) => 0.1 * (i + 1) });
  // grilla y SEO solo se ven cuando la web se despieza
  const structural = section.querySelectorAll('.layer--grid, .layer--seo');
  gsap.set(structural, { opacity: 0 });

  gsap.set(devices, { xPercent: -50, yPercent: -50 });
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  // 1 · entra la composición
  tl.fromTo(devices, { y: 140, opacity: 0, rotateX: 16, scale: 0.9 }, { y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 0.16, ease: 'power3.out' }, 0);
  tl.fromTo(phone, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.12, ease: 'power3.out' }, 0.05);
  // 2 · etiquetas técnicas
  tl.to(labels, { opacity: 1, duration: 0.05, stagger: 0.025 }, 0.16);
  // 3 · giro de 10–15°
  tl.to(devices, { rotateY: reduced ? 0 : -13, rotateX: reduced ? 0 : 8, duration: 0.16 }, 0.28);
  // 4 · capas separadas en profundidad: grilla → diseño → contenido → SEO/código
  tl.to(labels, { opacity: 0, duration: 0.05 }, 0.42);
  layers.forEach((l, i) => tl.to(l, { z: z[i], duration: 0.18 }, 0.42 + i * 0.012));
  tl.to(layersEl, { '--edge': 1, duration: 0.1 }, 0.44);
  tl.to(structural, { opacity: 1, duration: 0.08 }, 0.44);
  tl.to(tags, { opacity: 1, duration: 0.05, stagger: 0.02 }, 0.5);
  tl.to(phone, { x: mobile ? 30 : 110, z: 160, opacity: 0.25, duration: 0.18 }, 0.42);
  // 5 · la cámara se acerca y todo vuelve a su lugar
  tl.to(tags, { opacity: 0, duration: 0.05 }, 0.7);
  tl.to(layers, { z: (i) => 0.1 * (i + 1), duration: 0.16 }, 0.72);
  tl.to(layersEl, { '--edge': 0, duration: 0.1 }, 0.76);
  tl.to(structural, { opacity: 0, duration: 0.08 }, 0.74);
  tl.to(phone, { x: 0, z: 60, opacity: 1, duration: 0.16 }, 0.72);
  tl.to(labels, { opacity: 1, duration: 0.06, stagger: 0.02 }, 0.82);
  tl.to(devices, { scale: 1.08, rotateY: reduced ? 0 : -6, rotateX: reduced ? 0 : 4, duration: 0.2 }, 0.72);
  tl.to({}, { duration: 0.08 }, 0.92);

  let active = -1;
  ScrollTrigger.create({
    trigger: section, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 1.2, animation: tl,
    onUpdate: (self) => {
      const i = clamp(Math.floor(self.progress * 4), 0, 3);
      if (i !== active) {
        active = i;
        steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
      }
    },
  });
  steps[0].classList.add('is-active');
}

function beforeAfter(reduced) {
  const frame = document.querySelector('.ba__frame');
  const handle = frame.querySelector('.ba__handle');
  const tabs = document.querySelectorAll('.ba__tabs button');
  const cases = frame.querySelectorAll('.ba__case');
  const state = { v: 50 };
  const set = (v) => {
    state.v = clamp(v, 0, 100);
    frame.style.setProperty('--split', state.v + '%');
    handle.setAttribute('aria-valuenow', Math.round(state.v));
  };
  let dragging = false;
  const fromEvent = (e) => {
    const r = frame.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  };
  frame.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.ba__tabs')) return;
    dragging = true; handle.classList.add('is-drag');
    gsap.killTweensOf(state);
    frame.setPointerCapture(e.pointerId);
    fromEvent(e);
  });
  frame.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
  const stop = () => { dragging = false; handle.classList.remove('is-drag'); };
  frame.addEventListener('pointerup', stop);
  frame.addEventListener('pointercancel', stop);
  handle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { set(state.v - 4); e.preventDefault(); }
    if (e.key === 'ArrowRight') { set(state.v + 4); e.preventDefault(); }
  });
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((x) => x.setAttribute('aria-selected', x === t ? 'true' : 'false'));
    cases.forEach((c) => c.classList.toggle('is-active', c.dataset.case === t.dataset.case));
  }));
  // una pasada sola para mostrar que se puede arrastrar
  if (!reduced) {
    ScrollTrigger.create({
      trigger: frame, start: 'top 65%', once: true,
      onEnter: () => {
        gsap.timeline()
          .to(state, { v: 28, duration: 1.1, ease: 'power3.inOut', onUpdate: () => set(state.v) })
          .to(state, { v: 64, duration: 1.3, ease: 'power3.inOut', onUpdate: () => set(state.v) })
          .to(state, { v: 50, duration: 1.0, ease: 'power3.inOut', onUpdate: () => set(state.v) });
      },
    });
  }
  gsap.from(frame, {
    y: 60, scale: 0.97, opacity: 0, duration: 1.4, ease: 'expo.out',
    scrollTrigger: { trigger: frame, start: 'top 88%', toggleActions: 'play none none reverse' },
  });
}

function team() {
  document.querySelectorAll('.person__photo').forEach((box) => {
    const img = box.querySelector('img');
    const ok = () => box.classList.add('has-photo');
    const fail = () => img.remove();
    if (img.complete) { img.naturalWidth ? ok() : fail(); } else { img.addEventListener('load', ok); img.addEventListener('error', fail); }
  });
  gsap.from('.person', {
    y: 70, opacity: 0, duration: 1.4, stagger: 0.14, ease: 'expo.out',
    scrollTrigger: { trigger: '.team__grid', start: 'top 85%', toggleActions: 'play none none reverse' },
  });
}

function experience(reduced) {
  if (reduced) return;
  gsap.fromTo('.exp__bg', { scale: 1.0, yPercent: 6 }, {
    scale: 1.18, yPercent: -6, ease: 'none',
    scrollTrigger: { trigger: '.exp', start: 'top bottom', end: 'bottom top', scrub: 1.2 },
  });
  gsap.from('.exp__points li', {
    y: 30, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out',
    scrollTrigger: { trigger: '.exp__points', start: 'top 88%', toggleActions: 'play none none reverse' },
  });
}

// Frases: pasan solas, una por una, sin necesidad de scrollear
function quotes(reduced) {
  const section = document.querySelector('.quotes');
  const stage = section.querySelector('.quotes__stage');
  const nav = section.querySelector('.quotes__nav');
  const n = STATEMENTS.length;
  const words = (text, cls = '') => text.split(' ').map((w) => `<span class="mask"><span class="w${cls}">${w}</span></span>`).join(' ');
  stage.innerHTML = STATEMENTS.map((q) => {
    const body = words(q.quote) + (q.soft ? ' ' + words(q.soft, ' soft') : '');
    const sign = q.name ? `<figcaption><b>${q.name}</b> · ${q.business}${q.rubro ? ' · ' + q.rubro : ''}</figcaption>` : '';
    return `<figure class="quote"><blockquote>${q.name ? '“' : ''}${body}${q.name ? '”' : ''}</blockquote>${sign}</figure>`;
  }).join('');
  nav.style.setProperty('--n', n);
  nav.innerHTML = STATEMENTS.map((_, i) => `<button role="tab" aria-label="Frase ${i + 1}"><i></i></button>`).join('');
  section.querySelector('.quotes__n').textContent = String(n).padStart(2, '0');
  const counter = section.querySelector('.quotes__i');
  const slides = [...stage.children];
  const bars = [...nav.querySelectorAll('i')];
  const buttons = [...nav.children];
  slides.forEach((sl) => gsap.set(sl.querySelectorAll('.w'), { yPercent: 108 }));

  let current = -1, timer = null, visible = false;
  function show(i) {
    const prev = slides[current];
    if (prev && current !== i) {
      gsap.killTweensOf(prev.querySelectorAll('.w'));
      gsap.to(prev.querySelectorAll('.w'), {
        yPercent: -108, duration: reduced ? 0.01 : 0.6, stagger: 0.02, ease: 'power3.in',
        onComplete: () => prev.classList.remove('is-on'),
      });
    }
    current = i;
    const sl = slides[i];
    sl.classList.add('is-on');
    gsap.killTweensOf(sl.querySelectorAll('.w'));
    gsap.fromTo(sl.querySelectorAll('.w'), { yPercent: 108 }, {
      yPercent: 0, duration: reduced ? 0.01 : 1.1, stagger: 0.04, ease: 'expo.out', delay: prev ? 0.45 : 0,
    });
    counter.textContent = String(i + 1).padStart(2, '0');
    buttons.forEach((b, j) => b.setAttribute('aria-selected', j === i ? 'true' : 'false'));
    // barra de progreso de cada frase
    gsap.killTweensOf(bars);
    bars.forEach((b, j) => gsap.set(b, { scaleX: j < i ? 1 : 0 }));
    if (timer) timer.kill();
    timer = gsap.to(bars[i], { scaleX: 1, duration: QUOTE_TIME, ease: 'none', paused: !visible, onComplete: () => show((i + 1) % n) });
  }
  buttons.forEach((b, j) => b.addEventListener('click', () => show(j)));
  new IntersectionObserver((en) => {
    visible = en[0].isIntersecting;
    if (current < 0 && visible) show(0);
    else if (timer) visible ? timer.resume() : timer.pause();
  }, { threshold: 0.35 }).observe(section);
}

function contact({ reduced, assets }) {
  // enlaces de WhatsApp
  document.querySelectorAll('[data-wa]').forEach((a) => {
    if (CONTACT.whatsapp) a.href = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hola VISSION, quiero mi demo gratis.')}`;
    else { a.href = '#contacto'; a.removeAttribute('target'); }
  });
  document.querySelectorAll('.wa-number').forEach((a) => { a.textContent = CONTACT.whatsapp ? '+' + CONTACT.whatsapp : CONTACT.whatsappLabel; });
  document.querySelectorAll('.year').forEach((y) => { y.textContent = new Date().getFullYear(); });

  if (!assets) return;
  const box = document.querySelector('.cta__eye');
  let eye;
  try {
    eye = new Eye({
      stage: box,
      canvas: box.querySelector('.eye__canvas'),
      cornea: box.querySelector('.eye__cornea'),
      clip: box.querySelector('.eye__clip'),
      wordmark: box.querySelector('.eye__wordmark'),
      assets,
      dprCap: 2,
    });
  } catch (e) { return; }
  eye.wordmarkRatio = 0.66;
  const life = new EyeLife(eye, { reduced, maxYaw: 0.34, maxPitch: 0.2 });
  const st = eye.state;
  const open = { v: 0 };
  let override = null; // apertura forzada (viaje desde el CTA del hero)
  let inView = false;
  const fit = () => {
    eye.resize();
    st.s = (eye.w * 1.02) / 1000;
    st.tx = 850; st.ty = 492;
  };
  fit();
  box.querySelector('.eye__wordmark').style.visibility = 'visible';
  window.addEventListener('resize', fit);
  new IntersectionObserver((en) => { inView = en[0].isIntersecting; }).observe(box);

  // el ojo se abre despacio cuando entra la sección
  gsap.to(open, {
    v: 1, ease: 'none',
    scrollTrigger: { trigger: '.cta', start: 'top 75%', end: 'top 10%', scrub: 1.4 },
  });

  let last = performance.now();
  gsap.ticker.add(() => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!inView) { eye.setVisible(false); life.setAlive(false, now); return; }
    eye.setVisible(true);
    const ov = override ? override.v : open.v;
    const opened = ov > 0.97;
    life.setAlive(opened, now);
    const lf = life.update(now, dt);
    const lid = 1 - easeOut(ov);
    st.blink = Math.max(lid, lf.blink);
    st.pupil = lf.pupil * (1.1 - 0.12 * ov);
    st.floatY = 0;
    st.hiAmt = 1;
    eye.render(now / 1000);
  });

  return {
    // el ojo arranca cerrado y se abre despacio
    playOpen(duration = 1.8) {
      override = { v: 0 };
      inView = true;
      return gsap.to(override, { v: 1, duration, ease: 'power2.inOut', onComplete: () => { override = null; open.v = 1; } });
    },
  };
}
const easeOut = (t) => 1 - Math.pow(1 - t, 2.2);

function links(lenis) {
  document.querySelectorAll('a[href^="#"]:not([data-eyejump])').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = id === '#inicio' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else if (target === 0) window.scrollTo({ top: 0 });
      else target.scrollIntoView();
    });
  });
}
