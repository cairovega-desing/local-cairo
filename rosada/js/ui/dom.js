// Ayudantes de interfaz: crear nodos, ventanas, avisos, chips de efectos y animaciones.
(function (R) {
  'use strict';

  const ui = (R.ui = R.ui || {});

  // h('div', {class: 'x', onclick: fn, style: {...}}, hijos...)
  const h = (R.h = function (tag, props, ...hijos) {
    const el = document.createElementNS(tag === 'svg' || props?.svg ? 'http://www.w3.org/2000/svg' : 'http://www.w3.org/1999/xhtml', tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v === null || v === undefined || v === false || k === 'svg') continue;
        if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'html') el.innerHTML = v;
        else el.setAttribute(k === 'className' ? 'class' : k, v === true ? '' : v);
      }
    }
    agregar(el, hijos);
    return el;
  });
  function agregar(el, hijos) {
    for (const c of hijos) {
      if (c === null || c === undefined || c === false) continue;
      if (Array.isArray(c)) agregar(el, c);
      else el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
  }
  // SVG: s('circle', {...})
  R.svg = (tag, props, ...hijos) => h(tag, Object.assign({ svg: true }, props), ...hijos);

  ui.montar = function (nodo, ancha) {
    const app = document.getElementById('app');
    const scroll = window.scrollY;
    app.className = 'app' + (ancha ? ' ancha' : '');
    app.replaceChildren(nodo);
    return scroll;
  };

  // ── Ventanas encima (hoja que sube desde abajo en el celu, centrada en la PC) ──
  let capaAbierta = null;
  ui.hayCapa = () => !!capaAbierta;
  ui.abrirCapa = function (contenido, opts) {
    opts = opts || {};
    ui.cerrarCapa(true);
    if (!opts.dejarAvisos) document.getElementById('avisos').replaceChildren();
    const capa = document.getElementById('capa');
    capa.className = 'capa' + (opts.oscura ? ' oscura' : '');
    const hoja = opts.oscura ? contenido : h('div', { class: 'hoja ' + (opts.clase || ''), role: 'dialog', 'aria-modal': 'true' },
      opts.cerrable ? h('button', { class: 'boton mini sec cerrar', onclick: () => ui.cerrarCapa(), 'aria-label': 'Cerrar' }, '✕') : null,
      contenido);
    capa.replaceChildren(hoja);
    capa.hidden = false;
    capaAbierta = { opts };
    if (opts.cerrable) {
      capa.onclick = (e) => { if (e.target === capa) ui.cerrarCapa(); };
    } else capa.onclick = null;
    const foco = hoja.querySelector('[autofocus]') || hoja.querySelector('button:not(.cerrar)');
    if (foco && !opts.sinFoco) setTimeout(() => foco.focus({ preventScroll: true }), 30);
    hoja.scrollTop = 0;
    return hoja;
  };
  ui.cerrarCapa = function (silencioso) {
    const capa = document.getElementById('capa');
    if (!capaAbierta) return;
    const opts = capaAbierta.opts;
    capaAbierta = null;
    capa.hidden = true;
    capa.replaceChildren();
    if (!silencioso && opts.alCerrar) opts.alCerrar();
  };

  // ── Avisos cortos arriba (resultado de una acción) ──
  ui.aviso = function (txt, opts) {
    opts = opts || {};
    const caja = document.getElementById('avisos');
    const el = h('div', { class: 'aviso ' + (opts.tipo || '') },
      h('div', { class: 'txt' }, txt),
      opts.efectos && opts.efectos.length ? ui.chipsEfectos(opts.efectos) : null,
      opts.extra || null);
    caja.appendChild(el);
    while (caja.children.length > 2) caja.firstChild.remove();
    const dur = opts.dur || 2600 + (opts.efectos ? opts.efectos.length * 250 : 0);
    setTimeout(() => {
      el.classList.add('saliendo');
      setTimeout(() => el.remove(), 320);
    }, dur);
    el.addEventListener('click', () => el.remove());
    return el;
  };

  // Chips de efectos: [{emoji, nombre, flechas, sube, bueno}] → «👁️ Te conocen ▲▲»
  ui.chipsEfectos = function (lista, opts) {
    opts = opts || {};
    return h('div', { class: 'efectos' }, opts.antes || null, lista.map((e) => {
      const fl = (e.sube ? '▲' : '▼').repeat(e.flechas);
      const etiqueta = e.pct ? R.fmt(Math.abs(e.v), 1) + '%' : e.numero ? R.signo(e.v, 0) : fl;
      return h('span', { class: 'ef ' + (e.bueno ? 'bien' : 'mal'), title: e.nombre + (e.sube ? ' sube' : ' baja') },
        h('span', { class: 'em' }, e.emoji),
        opts.conNombre !== false && !opts.compacto ? h('span', { class: 'nom' }, e.nombre) : null,
        h('span', { class: e.numero ? '' : 'fl' }, etiqueta));
    }));
  };

  // Número que cuenta de a poco.
  ui.contar = function (el, desde, hasta, dur, fmt) {
    fmt = fmt || ((x) => R.fmt(x, 1));
    const t0 = performance.now();
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(desde + (hasta - desde) * e);
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };

  ui.temblor = function (el) {
    el = el || document.getElementById('app');
    el.classList.remove('temblor');
    void el.offsetWidth;
    el.classList.add('temblor');
  };

  ui.confeti = function (colores) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    colores = colores || ['#f6b40e', '#6cb4ea', '#ffffff', '#ff8a80', '#5bd38c'];
    const c = h('canvas', { class: 'confeti' });
    document.body.appendChild(c);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    const ctx = c.getContext('2d');
    const ps = Array.from({ length: 140 }, () => ({
      x: Math.random() * c.width, y: -Math.random() * c.height * 0.5, vx: (Math.random() - 0.5) * 4 * dpr,
      vy: (2 + Math.random() * 4) * dpr, r: (4 + Math.random() * 5) * dpr, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3,
      col: colores[Math.floor(Math.random() * colores.length)],
    }));
    const t0 = performance.now();
    const paso = (t) => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05 * dpr; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.col;
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore();
      }
      if (t - t0 < 3200) requestAnimationFrame(paso);
      else c.remove();
    };
    requestAnimationFrame(paso);
  };

  // Escudo del partido: círculo de color con símbolo y sigla.
  ui.escudo = function (p, grande) {
    return h('div', { class: 'escudo' + (grande ? ' grande' : ''), style: { background: p.color } },
      h('span', null, p.simbolo), h('span', { class: 'sig' }, p.sigla));
  };
  ui.miniEscudo = (p) => h('div', { class: 'mini-escudo', style: { background: p.color }, title: p.nombre }, p.simbolo);

  // Mezcla un color con blanco (0 = color, 1 = blanco).
  ui.aclarar = function (hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const m = (x) => Math.round(x + (255 - x) * k);
    return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')';
  };
})(globalThis.R = globalThis.R || {});
