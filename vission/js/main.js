// Arranque: scroll suave (Lenis) + GSAP ScrollTrigger + el ojo.
import { loadEyeAssets } from './eye.js';
import { initHero } from './hero.js';
import { initSections } from './sections.js';
import { initJourney } from './journey.js';

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.add('js');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

let lenis = null;
if (!reduced && window.Lenis) {
  lenis = new window.Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.3,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
}

function unlock() {
  document.body.classList.remove('is-loading');
  lenis && lenis.start();
}

async function boot() {
  await document.fonts.ready.catch(() => {});
  let assets = null;
  let hero = null;
  if (webglOK()) {
    try {
      assets = await loadEyeAssets();
      hero = initHero({ assets, reduced, lenis });
    } catch (e) {
      console.warn('[VISSION] sin WebGL, uso la imagen fija', e);
      hero = null;
    }
  }
  if (!hero) {
    document.documentElement.classList.add('no-webgl');
    gsap.set(['.hero__title .mask > span'], { yPercent: 0 });
    gsap.set(['.hero__eyebrow', '.hero__lead', '.hero__ctas', '.hstat', '.nav', '.hero__scroll > *'], { opacity: 1 });
    document.querySelector('.hero').style.height = '100svh';
    document.querySelector('.hero__stage').classList.add('is-light');
    document.querySelector('.nav').dataset.theme = 'light';
    unlock();
  }
  const sections = initSections({ reduced, lenis, assets });
  initJourney({ hero, contact: sections.contact, lenis, reduced });
  ScrollTrigger.refresh();
  if (hero) hero.playIntro();
  // por si algo falla en la intro, nunca dejamos el scroll trabado
  setTimeout(unlock, 4000);
}

boot();
