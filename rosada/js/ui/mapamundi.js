// Mapamundi de la pestaña Mundo (formas reales de Natural Earth en js/datos/mundo_geo.js).
// Vistas («lentes»): relación, bloques, comercio y poder. Zoom con botones, rueda o doble toque; se arrastra para moverlo
// (en el celu, con un dedo de costado; para arriba y abajo se mueve la página). Tocás un país y se abre su ficha.
// Líneas: alianzas, tratados, pactos entre países, guerra y reclamo. Las banderas no se pisan: si no entran, se esconden
// las de menos prioridad hasta que hagas zoom.
(function (R) {
  'use strict';
  const S = R.svg;
  const h = R.h;
  const ui = (R.ui = R.ui || {});

  // Lo que se recuerda entre redibujos (la vista y el lente elegidos).
  const estado = { lente: 'relacion', centro: null, ancho: null, preset: 'mundo' };

  ui.LENTES = [
    { id: 'relacion', emoji: '🤝', nombre: 'Relación' },
    { id: 'bloques', emoji: '🛡️', nombre: 'Bloques' },
    { id: 'comercio', emoji: '🛒', nombre: 'Comercio' },
    { id: 'poder', emoji: '⚔️', nombre: 'Poder' },
  ];
  const PRESETS = [
    { id: 'mundo', emoji: '🌍', nombre: 'Mundo' },
    { id: 'america', emoji: '🌎', nombre: 'América' },
    { id: 'sudamerica', emoji: '🧉', nombre: 'Sudamérica' },
  ];
  const COLOR_BLOQUE = { mercosur: '#86d69a', pacifico: '#6fd0de', otan: '#86b4ff', oriental: '#ff9a8c' };

  // Colores
  const mezclar = (a, b, t) => {
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const c = [16, 8, 0].map((sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t));
    return '#' + c.map((x) => x.toString(16).padStart(2, '0')).join('');
  };
  const colorRel = (r) => (r < 50 ? mezclar('#f28b82', '#ffd77a', r / 50) : mezclar('#ffd77a', '#7fd49a', (r - 50) / 50));
  const caraRel = (r) => (r >= 70 ? '😊' : r >= 40 ? '😐' : r >= 20 ? '😠' : '🤬');

  function colorPais(s, id, lente) {
    const p = R.PAIS[id];
    const st = s.mundo.paises[id];
    if (st.anexado) return 'url(#mm-anexado)';
    if (s.mundo.guerra && s.mundo.guerra.pais === id) return 'url(#mm-guerra)';
    if (lente === 'bloques') return p.bloque ? COLOR_BLOQUE[p.bloque] : '#e7ddc4';
    if (lente === 'comercio') {
      if (!R.COMPRA || !R.COMPRA[id]) return '#e7ddc4';
      const m = R.mundo.mezcla(s, id);
      return m >= 1.05 ? '#7fd49a' : m <= 0.95 ? '#f7a596' : '#ffe08a';
    }
    if (lente === 'poder') return mezclar('#f1ebff', '#5b3fd0', Math.min(1, p.poder / 100));
    return colorRel(st.rel);
  }

  // Qué va en la insignia de cada bandera según el lente.
  function insignia(s, id, lente) {
    const st = s.mundo.paises[id];
    if (s.mundo.guerra && s.mundo.guerra.pais === id) return '⚔️';
    if (s.mundo.crisis && s.mundo.crisis.pais === id) return '😤';
    if (lente === 'bloques') return R.PAIS[id].bloque ? R.BLOQUES_MUNDO[R.PAIS[id].bloque].emoji : '';
    if (lente === 'comercio') return st.tratado ? '📦' : '';
    if (lente === 'poder') return String(R.PAIS[id].poder);
    if (st.alianza) return '🛡️';
    return caraRel(st.rel);
  }

  // Línea curva entre dos puntos (para que no se tapen con las fronteras).
  function curva(a, b, comba) {
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const k = comba ?? 0.18;
    const cx = mx + dy * k;
    const cy = my - Math.abs(dx) * k - Math.abs(dy) * 0.05;
    return { d: 'M' + a[0].toFixed(1) + ',' + a[1].toFixed(1) + ' Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + b[0].toFixed(1) + ',' + b[1].toFixed(1), medio: [(a[0] + 2 * cx + b[0]) / 4, (a[1] + 2 * cy + b[1]) / 4] };
  }

  ui.mapamundi = function (s, opts) {
    opts = opts || {};
    const G = R.MUNDO_GEO;
    const M = s.mundo;
    const ASPECTO = opts.aspecto || (ui.esPC && ui.esPC() ? 2.1 : 1.45); // ancho / alto del recuadro
    const lente = estado.lente;
    if (!estado.centro) irA(estado.preset);

    function irA(id) {
      const v = G.vistas[id] || G.vistas.mundo;
      estado.preset = id;
      // Que entre entera en el recuadro (según el aspecto).
      const ancho = Math.max(v[2], v[3] * ASPECTO);
      estado.ancho = id === 'mundo' ? G.ancho * (ASPECTO < 2 ? 0.88 : 1) : ancho * 1.08;
      estado.centro = id === 'mundo' ? [G.ancho * 0.5, G.alto * 0.56] : [v[0] + v[2] / 2, v[1] + v[3] / 2];
    }

    const centros = G.centros;
    const yo = centros.ARG;

    // ── Capas ──
    const defs = S('defs', null,
      S('pattern', { id: 'mm-anexado', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
        S('rect', { width: 8, height: 8, fill: '#ffffff' }), S('rect', { width: 4, height: 8, fill: '#74acdf' })),
      S('pattern', { id: 'mm-guerra', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-45)' },
        S('rect', { width: 8, height: 8, fill: '#ffb3ab' }), S('rect', { width: 3, height: 8, fill: '#e5534b' })),
      S('clipPath', { id: 'mm-recorte' }, S('path', { d: G.borde })),
      S('radialGradient', { id: 'mm-panico', cx: '50%', cy: '50%', r: '75%' },
        S('stop', { offset: '40%', 'stop-color': '#e5534b', 'stop-opacity': 0 }), S('stop', { offset: '100%', 'stop-color': '#e5534b', 'stop-opacity': 1 })));
    const oceano = S('path', { d: G.borde, class: 'mm-oceano' });
    const grilla = S('path', { d: G.grilla, class: 'mm-grilla' });
    const resto = S('path', { d: G.resto, class: 'mm-resto' });

    const paises = [];
    for (const p of R.PAISES) {
      if (!G.paises[p.id]) continue;
      const st = M.paises[p.id];
      const el = S('path', { d: G.paises[p.id], class: 'mm-pais' + (st.anexado ? ' anexado' : ''), fill: colorPais(s, p.id, lente), 'data-id': p.id, tabindex: 0, role: 'button', 'aria-label': p.nombre });
      if (opts.alTocar) {
        el.addEventListener('click', (e) => { if (arrastro) { e.preventDefault(); return; } opts.alTocar(p.id); });
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.alTocar(p.id); } });
      }
      paises.push(el);
    }
    // Malvinas: argentinas si las recuperaste; si no, del color del Reino Unido.
    const malvinas = S('path', { d: G.paises.FLK, class: 'mm-pais mm-malvinas', fill: M.malvinas.recuperadas ? '#74acdf' : colorPais(s, 'GBR', lente) });
    const argentina = S('path', { d: G.paises.ARG, class: 'mm-pais mm-arg', fill: '#74acdf' });

    // ── Líneas ──
    const lineas = S('g', { class: 'mm-lineas' });
    const iconos = []; // [x, y, emoji, clase]
    const agregarLinea = (a, b, clase, icono, comba) => {
      const c = curva(a, b, comba);
      lineas.appendChild(S('path', { d: c.d, class: 'mm-linea ' + clase }));
      if (icono) iconos.push([c.medio[0], c.medio[1], icono, clase, Math.hypot(b[0] - a[0], b[1] - a[1])]);
    };
    if (lente === 'bloques') {
      for (const [a, b] of M.pactos || []) if (centros[a] && centros[b] && !M.paises[a].anexado && !M.paises[b].anexado) agregarLinea(centros[a], centros[b], 'pacto', null, 0.12);
    }
    for (const p of R.PAISES) {
      const st = M.paises[p.id];
      if (st.anexado || !centros[p.id]) continue;
      if (st.alianza && lente !== 'poder') agregarLinea(yo, centros[p.id], 'alianza');
      else if (st.tratado && (lente === 'relacion' || lente === 'comercio')) agregarLinea(yo, centros[p.id], 'tratado');
    }
    if (M.guerra && centros[M.guerra.pais]) agregarLinea(yo, M.guerra.objetivo === 'malvinas' ? centros.FLK : centros[M.guerra.pais], 'guerra', '⚔️', 0.1);
    if (M.crisis && centros[M.crisis.pais]) agregarLinea(yo, centros[M.crisis.pais], 'crisis', '😤');

    const capaMarcas = S('g', { class: 'mm-marcas' });
    const panico = S('rect', { class: 'mm-panico', fill: 'url(#mm-panico)', opacity: Math.min(0.55, (M.panico || 0) / 120) });

    const tierra = S('g', { 'clip-path': 'url(#mm-recorte)' }, grilla, resto, ...paises, argentina, malvinas);
    const svg = S('svg', { class: 'mm-svg', role: 'img', 'aria-label': 'Mapa del mundo', preserveAspectRatio: 'xMidYMid meet' },
      defs, oceano, tierra, lineas, panico, capaMarcas);

    // ── Banderas (con prioridad; las que se pisan se esconden) ──
    function prioridad(id) {
      if (id === 'ARG') return 1000;
      if (M.guerra && M.guerra.pais === id) return 900;
      if (M.crisis && M.crisis.pais === id) return 850;
      const st = M.paises[id];
      return (st.alianza ? 300 : 0) + (st.tratado ? 100 : 0) + R.PAIS[id].poder;
    }
    const ids = ['ARG'].concat(R.PAISES.filter((p) => !M.paises[p.id].anexado && centros[p.id]).map((p) => p.id)).sort((a, b) => prioridad(b) - prioridad(a));

    function marcas(px) {
      // px = unidades del mapa por píxel de pantalla (para que las banderas tengan siempre el mismo tamaño).
      capaMarcas.replaceChildren();
      const ancho = (estado.ancho < 600 ? 22 : 26) * px; // de cerca, banderas un poco más chicas para que entren todas
      const alto = ancho * (2 / 3);
      const puestas = [];
      for (const id of ids) {
        const [x, y] = centros[id];
        if (puestas.some(([a, b]) => Math.abs(a - x) < ancho * 1.05 && Math.abs(b - y) < alto * 1.25)) continue;
        puestas.push([x, y]);
        const bandera = R.ui.bandera(id, 26);
        bandera.setAttribute('x', (x - ancho / 2).toFixed(1));
        bandera.setAttribute('y', (y - alto / 2).toFixed(1));
        bandera.setAttribute('width', ancho.toFixed(2));
        bandera.setAttribute('height', alto.toFixed(2));
        bandera.removeAttribute('class');
        const g = S('g', { class: 'mm-marca' + (id === 'ARG' ? ' yo' : ''), 'data-id': id },
          S('rect', { x: (x - ancho / 2 - 1.5 * px).toFixed(1), y: (y - alto / 2 - 1.5 * px).toFixed(1), width: (ancho + 3 * px).toFixed(1), height: (alto + 3 * px).toFixed(1), rx: 3 * px, class: 'mm-marco' }),
          bandera);
        const ins = id === 'ARG' ? '' : insignia(s, id, lente);
        if (ins) {
          const r = 8 * px;
          const cx = x + ancho / 2;
          const cy = y + alto / 2;
          g.appendChild(S('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: r.toFixed(2), class: 'mm-insignia' }));
          g.appendChild(S('text', { x: cx.toFixed(1), y: (cy + r * 0.38).toFixed(1), 'font-size': (/^\d+$/.test(ins) ? 8.5 : 10) * px, 'text-anchor': 'middle', class: 'mm-insignia-txt' }, ins));
        }
        if (opts.alTocar && id !== 'ARG') g.addEventListener('click', (e) => { if (arrastro) { e.preventDefault(); return; } opts.alTocar(id); });
        capaMarcas.appendChild(g);
      }
      // Íconos de las líneas (guerra, reclamo)
      for (const [x, y, em, , largo] of iconos) {
        if (largo / px < 110) continue; // línea corta: el ícono taparía las banderas (ya está en la insignia del país)
        capaMarcas.appendChild(S('circle', { cx: x, cy: y, r: 11 * px, class: 'mm-icono-fondo' }));
        capaMarcas.appendChild(S('text', { x, y: y + 4.5 * px, 'font-size': 13 * px, 'text-anchor': 'middle' }, em));
      }
      // Malvinas: su soberanía
      if (!M.malvinas.recuperadas && centros.FLK && (estado.ancho < 450)) {
        const [x, y] = centros.FLK;
        capaMarcas.appendChild(S('text', { x: x + 9 * px, y: y + 4 * px, 'font-size': 10 * px, class: 'mm-texto' }, '🏝️ ' + M.malvinas.soberania + '%'));
      }
    }

    // ── Vista: centro + ancho → viewBox ──
    let pxAncho = 340;
    function limitar() {
      estado.ancho = R.clamp(estado.ancho, 110, G.ancho);
      const altoVista = estado.ancho / ASPECTO;
      const [cx, cy] = estado.centro;
      const medioX = estado.ancho / 2;
      const medioY = altoVista / 2;
      estado.centro = [R.clamp(cx, Math.min(medioX, G.ancho / 2), Math.max(G.ancho - medioX, G.ancho / 2)), R.clamp(cy, Math.min(medioY, G.alto / 2), Math.max(G.alto - medioY, G.alto / 2))];
    }
    function actualizar() {
      limitar();
      const altoVista = estado.ancho / ASPECTO;
      const x = estado.centro[0] - estado.ancho / 2;
      const y = estado.centro[1] - altoVista / 2;
      svg.setAttribute('viewBox', x.toFixed(1) + ' ' + y.toFixed(1) + ' ' + estado.ancho.toFixed(1) + ' ' + altoVista.toFixed(1));
      panico.setAttribute('x', x); panico.setAttribute('y', y); panico.setAttribute('width', estado.ancho); panico.setAttribute('height', altoVista);
      const r = svg.getBoundingClientRect();
      if (r.width > 0) pxAncho = r.width;
      marcas(estado.ancho / pxAncho);
      botones.forEach(([id, b]) => b.classList.toggle('elegida', estado.preset === id));
    }
    function zoom(f, foco) {
      const antes = estado.ancho;
      estado.ancho = R.clamp(estado.ancho * f, 110, G.ancho);
      if (foco) {
        // Que el punto bajo el dedo/mouse quede quieto.
        const k = 1 - estado.ancho / antes;
        estado.centro = [estado.centro[0] + (foco[0] - estado.centro[0]) * k, estado.centro[1] + (foco[1] - estado.centro[1]) * k];
      }
      estado.preset = null;
      actualizar();
    }
    const aMapa = (ev) => {
      const r = svg.getBoundingClientRect();
      const px = estado.ancho / r.width;
      const altoVista = estado.ancho / ASPECTO;
      return [estado.centro[0] - estado.ancho / 2 + (ev.clientX - r.left) * px, estado.centro[1] - altoVista / 2 + (ev.clientY - r.top) * px];
    };

    // ── Arrastrar, rueda y doble toque ──
    let arrastro = false;
    let inicio = null;
    svg.addEventListener('pointerdown', (ev) => {
      inicio = { x: ev.clientX, y: ev.clientY, centro: estado.centro.slice(), tipo: ev.pointerType };
      arrastro = false;
    });
    svg.addEventListener('pointermove', (ev) => {
      if (!inicio) return;
      const dx = ev.clientX - inicio.x;
      const dy = inicio.tipo === 'mouse' ? ev.clientY - inicio.y : 0; // en el celu, para arriba/abajo se mueve la página
      if (!arrastro && Math.hypot(dx, dy) < 6) return;
      arrastro = true;
      const px = estado.ancho / svg.getBoundingClientRect().width;
      estado.centro = [inicio.centro[0] - dx * px, inicio.centro[1] - dy * px];
      estado.preset = null;
      actualizar();
    });
    const soltar = () => { inicio = null; setTimeout(() => { arrastro = false; }, 0); };
    svg.addEventListener('pointerup', soltar);
    svg.addEventListener('pointercancel', soltar);
    svg.addEventListener('pointerleave', () => { inicio = null; });
    svg.addEventListener('wheel', (ev) => { ev.preventDefault(); zoom(ev.deltaY > 0 ? 1.25 : 0.8, aMapa(ev)); }, { passive: false });
    svg.addEventListener('dblclick', (ev) => { ev.preventDefault(); zoom(0.55, aMapa(ev)); });

    // ── Controles ──
    const botones = PRESETS.map((v) => [v.id, h('button', { class: 'chip toque' + (estado.preset === v.id ? ' elegida' : ''), onclick: () => { R.son.toque(); irA(v.id); actualizar(); } }, v.emoji + ' ' + v.nombre)]);
    const zoomCtl = h('div', { class: 'mm-zoom' },
      h('button', { class: 'boton mini sec', 'aria-label': 'Acercar', onclick: () => zoom(0.66) }, '＋'),
      h('button', { class: 'boton mini sec', 'aria-label': 'Alejar', onclick: () => zoom(1.5) }, '－'));
    const chipPanico = (M.panico || 0) >= 1 ? h('span', { class: 'chip mal mm-chip-panico' }, '😱 Pánico ' + Math.round(M.panico) + '%') : null;
    const caja = h('div', { class: 'mm-caja', style: { aspectRatio: String(ASPECTO) } }, svg, zoomCtl, chipPanico);

    const lentes = h('div', { class: 'mm-lentes' }, ui.LENTES.map((l) => h('button', { class: 'chip toque' + (lente === l.id ? ' elegida' : ''), onclick: () => { R.son.toque(); estado.lente = l.id; if (opts.alCambiar) opts.alCambiar(); } }, l.emoji + ' ' + l.nombre)));
    const vistas = h('div', { class: 'mm-vistas' }, botones.map(([, b]) => b));

    const raiz = h('div', { class: 'mapamundi' }, lentes, caja, vistas, leyenda(s, lente));
    // Cuando ya está en pantalla, se mide para que las banderas tengan el tamaño justo.
    requestAnimationFrame(actualizar);
    actualizar();
    return raiz;
  };

  function leyenda(s, lente) {
    const item = (color, txt) => h('span', { class: 'mm-ley' }, h('i', { style: { background: color } }), txt);
    const linea = (clase, txt) => h('span', { class: 'mm-ley' }, h('b', { class: 'mm-ley-linea ' + clase }), txt);
    let cosas;
    if (lente === 'bloques') cosas = Object.entries(R.BLOQUES_MUNDO).map(([k, b]) => item(COLOR_BLOQUE[k], b.emoji + ' ' + b.nombre)).concat([linea('pacto', 'Pacto')]);
    else if (lente === 'comercio') cosas = [item('#7fd49a', 'Le vendés mucho'), item('#ffe08a', 'Normal'), item('#f7a596', 'Poco'), h('span', { class: 'mm-ley' }, '📦 Tratado')];
    else if (lente === 'poder') cosas = [item('#f1ebff', 'Débil'), item('#a58cf0', 'Medio'), item('#5b3fd0', 'Potencia'), h('span', { class: 'mm-ley' }, '🔢 = poder militar')];
    else cosas = [item('#7fd49a', '😊 Amigos'), item('#ffd77a', '😐 Neutral'), item('#f28b82', '😠 Mal'), linea('alianza', 'Alianza'), linea('tratado', 'Tratado')];
    if (s.mundo.guerra || s.mundo.crisis) cosas.push(h('span', { class: 'mm-ley' }, s.mundo.guerra ? '⚔️ Guerra' : '😤 Reclamo'));
    if (R.PAISES.some((p) => s.mundo.paises[p.id].anexado)) cosas.push(item('repeating-linear-gradient(45deg,#74acdf 0 3px,#fff 3px 6px)', 'Anexado'));
    return h('div', { class: 'mm-leyenda' }, cosas);
  }
})(globalThis.R = globalThis.R || {});
