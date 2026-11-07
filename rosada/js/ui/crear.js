// Crear partido: 4 pasos cortos, todo con toques.
(function (R) {
  'use strict';
  const h = R.h;
  const ui = R.ui;

  const IDEO_TXT = ['Muy Estado', 'Estado', 'Al medio', 'Mercado', 'Muy mercado'];
  const ESTILO_TXT = ['Muy dialoguista', 'Dialoguista', 'Equilibrado', 'Confrontativo', 'Muy confrontativo'];

  ui.crear = function () {
    const nombre = R.nombrePartidoAzar();
    ui.borrador = {
      paso: 0,
      nombre: nombre.nombre,
      sigla: nombre.sigla,
      bandera: R.BANDERA.azar(),
      ideo: 0,
      estilo: 0,
      lider: R.nombreLiderAzar(),
      avatar: R.avatarAzar(),
      dificultad: 'normal',
    };
    pintar();
  };

  function pintar() {
    const b = ui.borrador;
    ui.ocultarNav();
    const pasos = [pasoNombre, pasoColor, pasoIdeas, pasoCandidato];
    const nodo = h('main', { class: 'pila', style: { paddingTop: '8px' } },
      h('div', { class: 'progreso-pasos', 'aria-label': 'Paso ' + (b.paso + 1) + ' de 4' }, [0, 1, 2, 3].map((i) => h('i', { class: i <= b.paso ? 'hecho' : '' }))),
      h('div', { class: 'fila', style: { justifyContent: 'center', padding: '6px 0 10px' } },
        ui.escudo(infoBorrador(b), true)),
      pasos[b.paso](),
      h('div', { class: 'fila', style: { marginTop: '6px' } },
        h('button', { class: 'boton sec', onclick: () => { R.son.toque(); if (b.paso === 0) ui.irPortada(); else { b.paso--; pintar(); } } }, b.paso === 0 ? '✕' : '◀'),
        b.paso < 3
          ? h('button', { class: 'boton grande', style: { flex: 1 }, disabled: !valido(b) ? true : null, onclick: () => { R.son.toque(); b.paso++; pintar(); window.scrollTo(0, 0); } }, 'Siguiente ▶')
          : h('button', { class: 'boton grande verde', style: { flex: 1 }, disabled: !valido(b) ? true : null, onclick: fundar }, '🎉 ¡Fundar el partido!')));
    ui.montar(nodo);
  }

  function valido(b) {
    if (b.paso === 0) return b.nombre.trim().length >= 3 && b.sigla.trim().length >= 2;
    if (b.paso === 3) return b.lider.trim().length >= 3;
    return true;
  }

  function pasoNombre() {
    const b = ui.borrador;
    const inNombre = h('input', { type: 'text', id: 'in-nombre', maxlength: 34, value: b.nombre, autocomplete: 'off',
      oninput: (e) => { b.nombre = e.target.value; refrescarBoton(); } });
    const inSigla = h('input', { type: 'text', id: 'in-sigla', maxlength: 5, value: b.sigla, autocomplete: 'off', style: { textTransform: 'uppercase' },
      oninput: (e) => { b.sigla = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ0-9]/g, ''); e.target.value = b.sigla; refrescarEscudo(); refrescarBoton(); } });
    return h('section', { class: 'tarjeta pila' },
      h('h2', null, '¿Cómo se llama tu partido?'),
      h('div', { class: 'campo' }, h('label', { class: 'etiqueta', for: 'in-nombre' }, 'Nombre'), inNombre),
      h('div', { class: 'campo' }, h('label', { class: 'etiqueta', for: 'in-sigla' }, 'Sigla (2 a 5 letras)'), inSigla),
      h('button', { class: 'boton sec', onclick: () => { const n = R.nombrePartidoAzar(); b.nombre = n.nombre; b.sigla = n.sigla; R.son.toque(); pintar(); } }, '🎲 Inventame uno'));
  }

  function infoBorrador(b) {
    return { sigla: b.sigla || '?', nombre: b.nombre, bandera: b.bandera, color: R.BANDERA.principal(b.bandera), simbolo: R.BANDERA.simbolo(b.bandera) };
  }

  // Editor de bandera compacto: diseño, colores (una sola paleta), emblema o una imagen propia.
  function pasoColor() {
    const b = ui.borrador;
    const B = b.bandera;
    const cambiar = (fn) => { fn(); R.son.toque(); pintar(); };
    const patron = R.BANDERA.PATRONES.find((p) => p.id === B.patron) || R.BANDERA.PATRONES[0];
    const nombres = patron.id === 'triangulo' ? ['Arriba', 'Abajo', 'Triángulo'] : patron.id === 'disco' ? ['Fondo', 'Disco'] : patron.id === 'v3' ? ['Izq.', 'Centro', 'Der.'] : patron.n === 1 ? ['Fondo'] : patron.n === 2 ? ['Arriba', 'Abajo'] : ['Arriba', 'Centro', 'Abajo'];
    if ((b.slot || 0) >= patron.n) b.slot = 0;
    const slot = b.slot || 0;
    const emblemaVista = (e) => {
      if (e === 'ninguno') return h('span', { style: { fontSize: '11px', fontWeight: 900 } }, 'Sin');
      if (e === 'sol' || e === 'estrella' || e === 'estrellas') return R.ui.banderaPartido({ patron: 'liso', colores: ['#74acdf'], emblema: e }, { ancho: 32, sinBorde: true });
      return e;
    };
    const archivo = h('input', { type: 'file', accept: 'image/*', id: 'in-imagen', class: 'oculto-visual',
      onchange: (e) => {
        const f = e.target.files && e.target.files[0];
        R.BANDERA.leerImagen(f, (url, color) => { B.imagen = url; B.colorImagen = color; R.son.bien(); pintar(); },
          (msg) => { R.son.mal(); ui.aviso('🚫 ' + msg, { tipo: 'mal' }); });
      } });
    const subir = h('label', { class: 'boton mini sec', for: 'in-imagen' }, B.imagen ? '🖼️ Cambiar' : '📷 Tu imagen', archivo);
    if (B.imagen) {
      return h('section', { class: 'tarjeta pila editor-bandera' },
        h('div', { class: 'fila entre' }, h('h2', null, 'Tu bandera'), subir),
        h('p', { class: 'chico suave' }, 'Usás tu propia imagen como bandera. Se recorta en forma de bandera.'),
        h('button', { class: 'boton sec', onclick: () => cambiar(() => { delete B.imagen; delete B.colorImagen; }) }, '✕ Quitar la imagen y diseñarla'));
    }
    return h('section', { class: 'tarjeta pila editor-bandera' },
      h('div', { class: 'fila entre' }, h('h2', null, 'Tu bandera'),
        h('div', { class: 'fila', style: { gap: '6px' } }, subir,
          h('button', { class: 'boton mini sec', 'aria-label': 'Bandera al azar', onclick: () => cambiar(() => { b.bandera = R.BANDERA.azar(); }) }, '🎲'))),
      h('div', { class: 'patrones' }, R.BANDERA.PATRONES.map((p) =>
        h('button', { class: 'opcion' + (B.patron === p.id ? ' elegida' : ''), title: p.nombre, 'aria-label': 'Diseño ' + p.nombre, onclick: () => cambiar(() => { B.patron = p.id; }) },
          R.ui.banderaPartido({ patron: p.id, colores: B.colores, emblema: 'ninguno' }, { ancho: 40 })))),
      h('div', { class: 'slots' }, Array.from({ length: patron.n }, (_, i) =>
        h('button', { class: 'slot' + (slot === i ? ' elegido' : ''), onclick: () => cambiar(() => { b.slot = i; }) },
          h('i', { style: { background: B.colores[i] || B.colores[0] } }), nombres[i]))),
      h('div', { class: 'paleta' }, R.BANDERA.COLORES.map((col) =>
        h('button', { class: (B.colores[slot] === col.c ? 'elegida' : ''), style: { background: col.c }, title: col.n, 'aria-label': nombres[slot] + ': ' + col.n,
          onclick: () => cambiar(() => { B.colores[slot] = col.c; }) }))),
      h('div', { class: 'emblemas' }, R.BANDERA.EMBLEMAS.map((e) =>
        h('button', { class: B.emblema === e ? 'elegida' : '', 'aria-label': 'Emblema ' + e, onclick: () => cambiar(() => { B.emblema = e; }) }, emblemaVista(e)))));
  }

  function pasoIdeas() {
    const b = ui.borrador;
    const vistaPrevia = h('div', { class: 'pila', id: 'vista-ideas' });
    const refrescar = () => {
      const fit = (p) => R.clamp(1 + 0.6 * (0.55 - Math.abs(p.lean - b.ideo / 2)), 0.6, 1.35);
      vistaPrevia.replaceChildren(
        h('div', { class: 'etiqueta' }, 'Cómo te reciben de entrada'),
        h('div', { class: 'caritas' }, R.GRUPOS.map((g) => {
          const v = R.simpatiaInicialGrupo(g, b.ideo / 2);
          return h('div', { class: 'carita' }, h('span', { class: 'cara' }, R.cara(v)), g.emoji + ' ' + g.nombre);
        })),
        h('div', { class: 'etiqueta' }, 'Dónde arrancás mejor'),
        R.ui.mapa({ sinMalvinas: true, colorDe: (id) => {
          const f = fit(R.PROV[id]);
          return f > 1.15 ? '#7ed79f' : f > 0.95 ? '#d7f2df' : f > 0.8 ? '#fbe7c2' : '#f7b3ae';
        } }),
        h('div', { class: 'leyenda' }, h('span', { class: 'chip', style: { background: '#7ed79f' } }, 'Te quieren'), h('span', { class: 'chip', style: { background: '#d7f2df' } }, 'Bien'), h('span', { class: 'chip', style: { background: '#fbe7c2' } }, 'Difícil'), h('span', { class: 'chip', style: { background: '#f7b3ae' } }, 'Muy difícil')));
    };
    refrescar();
    const deslizador = (id, izq, der, valor, textos, alCambiar) => h('div', { class: 'deslizador' },
      h('div', { class: 'extremos' }, h('span', null, izq), h('span', null, der)),
      h('input', { type: 'range', id, min: -2, max: 2, step: 1, value: valor, 'aria-valuetext': textos[valor + 2],
        oninput: (e) => { alCambiar(+e.target.value); e.target.setAttribute('aria-valuetext', textos[+e.target.value + 2]); e.target.nextSibling.textContent = textos[+e.target.value + 2]; } }),
      h('div', { class: 'centro chico suave' }, textos[valor + 2]));
    return h('section', { class: 'tarjeta pila' },
      h('h2', null, 'Tus ideas'),
      deslizador('rg-ideo', '🤲 Estado presente', 'Mercado libre 💼', b.ideo, IDEO_TXT, (v) => { b.ideo = v; refrescar(); }),
      deslizador('rg-estilo', '🕊️ Dialoguista', 'Confrontativo 🔥', b.estilo, ESTILO_TXT, (v) => { b.estilo = v; }),
      h('p', { class: 'chico suave' }, '🕊️ Más seguro y negociador · 🔥 Más viral, pero más riesgoso'),
      vistaPrevia);
  }

  function pasoCandidato() {
    const b = ui.borrador;
    const fondoAv = ui.aclarar(R.BANDERA.principal(b.bandera), 0.65);
    const vista = h('div', { id: 'vista-avatar' }, R.ui.avatar(b.avatar, { size: 104, humor: 'feliz', fondo: fondoAv }));
    const ciclo = (clave, etiqueta, n) => h('button', { class: 'boton mini sec', onclick: () => {
      b.avatar[clave] = ((b.avatar[clave] || 0) + 1) % n;
      R.son.toque();
      vista.replaceChildren(R.ui.avatar(b.avatar, { size: 104, humor: 'feliz', fondo: fondoAv }));
    } }, etiqueta);
    return h('section', { class: 'tarjeta pila' },
      h('h2', null, 'Tu candidato/a'),
      h('div', { class: 'campo' }, h('label', { class: 'etiqueta', for: 'in-lider' }, 'Nombre'),
        h('div', { class: 'fila' },
          h('input', { type: 'text', id: 'in-lider', maxlength: 30, value: b.lider, autocomplete: 'off', oninput: (e) => { b.lider = e.target.value; refrescarBoton(); } }),
          h('button', { class: 'boton mini sec', 'aria-label': 'Nombre al azar', onclick: () => { b.lider = R.nombreLiderAzar(); pintar(); } }, '🎲'))),
      h('div', { class: 'editor-avatar' }, vista,
        h('div', { class: 'controles' },
          ciclo('piel', '🎨 Piel', R.AV.piel.length), ciclo('pelo', '💇 Pelo', R.AV.pelo.length),
          ciclo('colorPelo', '🖌️ Color', R.AV.colorPelo.length), ciclo('anteojos', '👓 Lentes', 3),
          ciclo('barba', '🧔 Barba', 3), ciclo('ropa', '👔 Ropa', R.AV.ropa.length))),
      h('div', { class: 'etiqueta' }, 'Dificultad'),
      h('div', { class: 'dificultades' }, Object.entries(R.DIFICULTADES).map(([id, d]) =>
        h('button', { class: 'opcion' + (b.dificultad === id ? ' elegida' : ''), onclick: () => { b.dificultad = id; R.son.toque(); pintar(); } },
          h('div', null, d.emoji), d.nombre))));
  }

  function refrescarEscudo() {
    const b = ui.borrador;
    const viejo = document.querySelector('.escudo-bandera.grande');
    if (viejo) viejo.replaceWith(ui.escudo(infoBorrador(b), true));
  }
  function refrescarBoton() {
    const btn = document.querySelector('main .boton.grande');
    if (btn) btn.disabled = !valido(ui.borrador);
  }

  function fundar() {
    const b = ui.borrador;
    const s = R.nuevaPartida({
      dificultad: b.dificultad,
      partido: { nombre: b.nombre.trim(), sigla: b.sigla.trim(), color: R.BANDERA.principal(b.bandera), simbolo: R.BANDERA.simbolo(b.bandera), bandera: b.bandera, ideo: b.ideo / 2, estilo: b.estilo / 2 },
      lider: { nombre: b.lider.trim(), avatar: b.avatar },
    });
    ui.s = s;
    R.guardar(s);
    R.son.genial();
    ui.confeti([R.BANDERA.principal(b.bandera)].concat(b.bandera.colores, ['#f6b40e']));
    ui.vista = { tab: 'acciones' };
    ui.render();
    ui.abrirCapa(h('div', { class: 'pila centro' },
      ui.escudo(s.partido, true),
      h('h2', { style: { marginTop: '10px' } }, '¡Nace ' + s.partido.nombre + '!'),
      h('div', { class: 'mis-numeros' },
        h('div', { class: 'mi-numero' }, h('div', { class: 'em' }, '👁️'), h('div', { class: 'val' }, R.fmt(s.camp.conocen) + '%'), h('div', { class: 'nom' }, 'conocimiento')),
        h('div', { class: 'mi-numero' }, h('div', { class: 'em' }, '🗳️'), h('div', { class: 'val' }, R.fmt(R.camp.votos(s).nac.YO, 1) + '%'), h('div', { class: 'nom' }, 'te vota')),
        h('div', { class: 'mi-numero' }, h('div', { class: 'em' }, '🗓️'), h('div', { class: 'val' }, R.turno.cal(s).paso - s.mes), h('div', { class: 'nom' }, 'meses a las PASO'))),
      h('p', null, 'Arrancás de abajo. Cada mes tenés ', h('b', null, s.camp.agendaMax + ' acciones'), '. ¡A recorrer el país!'),
      h('button', { class: 'boton grande ancho', onclick: () => ui.cerrarCapa() }, '¡Vamos! 💪')));
  }
})(globalThis.R = globalThis.R || {});
