// «Pedí tu demo gratis»: el ojo del hero mira al frente y se cierra, la vista de quien mira
// se nubla y se oscurece, y al abrir aparece la sección de contacto con el otro ojo abriéndose.
// El efecto de poca visión dura solo lo que dura la animación.
const { gsap } = window;

export function initJourney({ hero, contact, lenis, reduced }) {
  const v = document.querySelector('.vision');
  const blur = v.querySelector('.vision__blur');
  const vig = v.querySelector('.vision__vig');
  const top = v.querySelector('.vision__lid--top');
  const bot = v.querySelector('.vision__lid--bot');
  const black = v.querySelector('.vision__black');
  const target = document.querySelector('#contacto');
  let running = false;
  gsap.set(top, { yPercent: -100 });
  gsap.set(bot, { yPercent: 100 });

  const jump = () => {
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
    else target.scrollIntoView();
  };

  function go(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (running) return;
    if (reduced) { jump(); contact && contact.playOpen(0.6); return; }
    running = true;
    lenis && lenis.stop();
    const life = hero && hero.life;
    const fx = { b: 0, sat: 1 };
    const setFx = () => {
      blur.style.setProperty('--b', fx.b.toFixed(2) + 'px');
      blur.style.setProperty('--sat', fx.sat.toFixed(3));
    };
    v.classList.add('is-on');

    const tl = gsap.timeline({
      onComplete: () => {
        v.classList.remove('is-on');
        gsap.set([top], { yPercent: -100 }); gsap.set([bot], { yPercent: 100 });
        gsap.set([vig, black], { opacity: 0 });
        fx.b = 0; fx.sat = 1; setFx();
        running = false;
      },
    });
    // 1 · el ojo deja de seguir el cursor y mira al frente
    tl.add(() => { if (life) life.forceCenter = true; }, 0);
    // 2 · se cierra despacio; quien mira pierde nitidez y los bordes se oscurecen
    if (life) tl.to(life, { closeAmt: 1, duration: 0.6, ease: 'power2.in' }, 0.45);
    tl.to(fx, { b: 9, sat: 0.6, duration: 0.7, ease: 'power2.in', onUpdate: setFx }, 0.35);
    tl.to(vig, { opacity: 1, duration: 0.6, ease: 'power2.in' }, 0.4);
    tl.fromTo(top, { yPercent: -100 }, { yPercent: -18, duration: 0.6, ease: 'power3.in' }, 0.5);
    tl.fromTo(bot, { yPercent: 100 }, { yPercent: 18, duration: 0.6, ease: 'power3.in' }, 0.5);
    tl.to(black, { opacity: 1, duration: 0.25, ease: 'power1.in' }, 0.9);
    // 3 · a oscuras, saltamos al contacto y dejamos el ojo del hero como estaba
    tl.add(() => {
      jump();
      if (life) { life.forceCenter = false; life.closeAmt = 0; }
      contact && contact.playOpen(1.9);
    }, 1.2);
    // 4 · la vista se abre junto con el otro ojo y recupera nitidez
    tl.to(black, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 1.35);
    tl.to(top, { yPercent: -100, duration: 1.1, ease: 'power3.out' }, 1.4);
    tl.to(bot, { yPercent: 100, duration: 1.1, ease: 'power3.out' }, 1.4);
    tl.to(vig, { opacity: 0, duration: 1.3, ease: 'power2.out' }, 1.5);
    tl.to(fx, { b: 0, sat: 1, duration: 1.5, ease: 'power2.out', onUpdate: setFx }, 1.45);
    tl.add(() => { lenis && lenis.start(); }, 2.6);
  }

  document.querySelectorAll('[data-eyejump]').forEach((a) => a.addEventListener('click', go, true));
}
