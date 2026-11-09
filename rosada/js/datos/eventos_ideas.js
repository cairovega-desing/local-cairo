// Noticias que dependen de lo que hiciste: tu ideología, las leyes que pasaste y cómo está la economía.
// Hay noticias comunes (le pasan a cualquiera) y estas, que solo aparecen si se dan las condiciones.
// Pesan más que las comunes: si se cumplen, es probable que lleguen.
(function (R) {
  'use strict';
  const ley = (s, id) => !!(s.gob && s.gob.leyes && s.gob.leyes[id]);
  const mesesDesde = (s, id) => { const st = s.gob.leyesEstado && s.gob.leyesEstado[id]; return st ? s.mes - st.mes : -1; };
  const izq = (s) => s.partido.ideo <= -0.2;
  const der = (s) => s.partido.ideo >= 0.2;
  const centro = (s) => Math.abs(s.partido.ideo) < 0.2;
  const rel = (s, p) => (s.mundo && s.mundo.paises[p] ? s.mundo.paises[p].rel : 50);
  const bono = (k, v, meses, sub) => (s) => R.gob.bono(s, k, v, meses, sub);

  R.ev.registrar([
    // ── Por tus leyes de mercado ──
    {
      id: 'i_minera', fase: 'gobierno', peso: 3, dibujo: '⛏️ 💰 🏔️',
      cuando: (s) => ley(s, 'glaciares') || ley(s, 'litio') || ley(s, 'inversiones'),
      titular: 'Una minera anuncia una inversión gigante',
      opciones: [
        { txt: 'Aprobarla ya', ef: { crec: 0.5, empresarios: 5, media: -2 }, despues: bono('bonusExpo', 0.03, 18), res: 'Llegan los dólares de la mina ⛏️' },
        { txt: 'Con control ambiental', costo: { pc: 1 }, ef: { crec: 0.25, media: 2 }, despues: bono('bonusExpo', 0.02, 18), res: 'Mina con reglas claras 🏔️' },
        { txt: 'Rechazarla', ef: { empresarios: -5, media: 2 }, res: 'La inversión se va a Chile', bueno: false },
      ],
    },
    {
      id: 'i_cierra_fabrica', fase: 'gobierno', peso: 4, dibujo: '🏭 🔒 👷',
      cuando: (s) => ley(s, 'apertura') && mesesDesde(s, 'apertura') >= 3,
      titular: 'Cierra una textil por las importaciones',
      opciones: [
        { txt: 'Ayuda para reconvertirse', costo: { gasto: 1 }, ef: { trabajadores: 4, desempleo: -0.1 }, res: 'La fábrica cambia de rubro 🧵' },
        { txt: 'Es el mercado', ef: { trabajadores: -5, desempleo: 0.2, media: 1 }, res: 'Ropa más barata, menos empleo', bueno: false },
        { txt: 'Volver a los aranceles', ef: { media: -3, trabajadores: 3, empresarios: -2 }, despues: bono('bonusImpo', -0.03, 6), res: 'Marcha atrás con la apertura' },
      ],
    },
    {
      id: 'i_wall_street', fase: 'gobierno', peso: 3, dibujo: '🏦 📈 🗽',
      cuando: (s) => (ley(s, 'bcra') || ley(s, 'regla_fiscal') || ley(s, 'achicar_estado')) && s.eco.riesgo < 700,
      titular: 'Wall Street aplaude tu plan: bajan las tasas',
      opciones: [
        { txt: 'Tomar deuda barata', ef: { reservas: 6, deuda: 3, riesgo: -30 }, res: 'Entran dólares frescos 💵' },
        { txt: 'No endeudarse', ef: { riesgo: -40, empresarios: 2 }, res: 'Más confianza todavía 📉' },
      ],
    },
    {
      id: 'i_paro_reforma', fase: 'gobierno', peso: 4, dibujo: '✊ 🚫 🏭',
      cuando: (s) => ley(s, 'reforma_laboral') || ley(s, 'reforma_sindical'),
      titular: 'La CGT lanza un paro general contra tu reforma',
      opciones: [
        { txt: 'Negociar', costo: { pc: 1 }, ef: { trabajadores: 5, empresarios: -2 }, res: 'Mesa con la CGT 🤝' },
        { txt: 'Aguantar el paro', ef: { crec: -0.3, trabajadores: -4, media: -2 }, res: 'Un día sin trenes ni colectivos', bueno: false },
        { txt: 'Descontar el día', ef: { trabajadores: -7, empresarios: 4, media: 2 }, res: 'Mano dura con el paro' },
      ],
    },
    {
      id: 'i_apps', fase: 'gobierno', peso: 3, dibujo: '📱 🚗 🛵',
      cuando: (s) => ley(s, 'desregulacion'),
      titular: 'Llegan apps y competencia a todos los rubros',
      opciones: [
        { txt: 'Bienvenidas', ef: { crec: 0.25, media: 3, trabajadores: -2, inflacion: -0.1 }, res: 'Más opciones y más baratas 📱' },
        { txt: 'Regularlas', ef: { media: -1, trabajadores: 2 }, res: 'Apps con reglas' },
      ],
    },
    {
      id: 'i_tarifas_privadas', fase: 'gobierno', peso: 4, dibujo: '💡 📈 😱',
      cuando: (s) => ley(s, 'privatizar') && mesesDesde(s, 'privatizar') >= 4,
      titular: 'La empresa privatizada triplica las tarifas',
      opciones: [
        { txt: 'Que invierta', ef: { inflacion: 0.4, empresarios: 3, humildes: -5, media: -3, crec: 0.2 }, res: 'Mejor servicio, boletas caras', bueno: false },
        { txt: 'Tope a las tarifas', ef: { empresarios: -5, riesgo: 40, humildes: 3, media: 2 }, res: 'Tarifas congeladas 🧊' },
      ],
    },
    {
      id: 'i_eeuu_energia', fase: 'gobierno', peso: 3, dibujo: '🇺🇸 🛢️ 🤝',
      cuando: (s) => (der(s) || ley(s, 'vaca_muerta')) && rel(s, 'USA') >= 45,
      titular: 'Estados Unidos quiere invertir en Vaca Muerta',
      opciones: [
        { txt: 'Firmar el acuerdo', ef: { crec: 0.3, empresarios: 4, rel: { USA: 8, CHN: -5 } }, despues: bono('bonusExpo', 0.03, 24), res: 'Gas y petróleo para exportar 🛢️' },
        { txt: 'Abrirlo a todos', costo: { pc: 1 }, ef: { crec: 0.2, rel: { USA: 3, CHN: 3 } }, despues: bono('bonusExpo', 0.02, 24), res: 'Licitación abierta al mundo' },
      ],
    },
    {
      id: 'i_cumbre_eeuu', fase: 'gobierno', peso: 2, dibujo: '🇺🇸 🤝 🌎',
      cuando: (s) => s.partido.ideo >= 0.3,
      titular: 'Te invitan a una cumbre en la Casa Blanca',
      opciones: [
        { txt: 'Ir', ef: { riesgo: -40, empresarios: 3, rel: { USA: 10, CHN: -4 } }, res: 'Foto con el presidente de EE.UU. 📸' },
        { txt: 'Mandar al canciller', ef: { rel: { USA: 2 } }, res: 'Presencia discreta' },
      ],
    },

    // ── Por tus leyes de Estado presente ──
    {
      id: 'i_swap_china', fase: 'gobierno', peso: 3, dibujo: '🇨🇳 💱 🏦',
      cuando: (s) => izq(s) || ley(s, 'industria_nacional') || ley(s, 'estatizar') || s.eco.reservas < 15,
      titular: 'China ofrece ampliar el swap de monedas',
      opciones: [
        { txt: 'Aceptar', ef: { reservas: 8, riesgo: -20, rel: { CHN: 8, USA: -5 } }, res: 'Más reservas en yuanes 🇨🇳' },
        { txt: 'Rechazar', ef: { rel: { CHN: -4, USA: 2 } }, res: 'Sin swap' },
      ],
    },
    {
      id: 'i_empresarios_amenazan', fase: 'gobierno', peso: 4, dibujo: '💼 ✈️ 😠',
      cuando: (s) => ley(s, 'fortunas') || ley(s, 'renta_financiera') || ley(s, 'banca_publica'),
      titular: 'Grandes empresarios amenazan con irse del país',
      opciones: [
        { txt: 'Dialogar', costo: { pc: 1 }, ef: { empresarios: 6 }, res: 'Se quedan, por ahora' },
        { txt: 'Que se vayan', ef: { empresarios: -6, crec: -0.3, riesgo: 40, trabajadores: 2, humildes: 2 }, res: 'Algunos se fueron a Uruguay', bueno: false },
        { txt: 'Créditos para quedarse', costo: { gasto: 1 }, ef: { empresarios: 5, desempleo: -0.1 }, res: 'Acuerdo para invertir acá' },
      ],
    },
    {
      id: 'i_fabrica_recuperada', fase: 'gobierno', peso: 3, dibujo: '🏭 🤝 🇧🇷',
      cuando: (s) => ley(s, 'cooperativas') || ley(s, 'industria_nacional') || ley(s, 'banco_desarrollo'),
      titular: 'Una fábrica recuperada empieza a exportar',
      opciones: [
        { txt: 'Darle créditos', costo: { gasto: 0.5 }, ef: { trabajadores: 4, humildes: 2 }, despues: bono('bonusExpo', 0.01, 12), res: 'Ejemplo de trabajo argentino 🏭' },
        { txt: 'Ponerla de ejemplo', ef: { todos: 1, trabajadores: 2 }, res: 'Foto con los trabajadores 📸' },
      ],
    },
    {
      id: 'i_faltan_productos', fase: 'gobierno', peso: 5, dibujo: '🛒 ❌ 😟',
      cuando: (s) => ley(s, 'control_precios') && mesesDesde(s, 'control_precios') >= 5,
      titular: 'Faltan productos en las góndolas',
      opciones: [
        { txt: 'Liberar los precios', ef: { inflacion: 0.8, empresarios: 6, media: -3 }, despues: bono('bonusPrecios', -0.03, 3), res: 'Vuelven los productos, más caros' },
        { txt: 'Más controles', ef: { empresarios: -6, crec: -0.2, media: -3 }, res: 'Inspectores en los súper', bueno: false },
        { txt: 'Importar lo que falta', ef: { reservas: -3, media: 3, empresarios: -2 }, res: 'Góndolas llenas con importados' },
      ],
    },
    {
      id: 'i_yacimiento', fase: 'gobierno', peso: 4, dibujo: '⛽ 🎉 🇦🇷',
      cuando: (s) => ley(s, 'estatizar') && mesesDesde(s, 'estatizar') >= 6,
      titular: 'La energética estatal descubre un yacimiento',
      opciones: [
        { txt: 'Invertir con fondos públicos', costo: { gasto: 2 }, ef: { trabajadores: 4, crec: 0.3 }, despues: bono('bonusExpo', 0.05, 24), res: 'Soberanía energética ⛽' },
        { txt: 'Asociarse con privados', ef: { empresarios: 4, crec: 0.2, riesgo: -30 }, despues: bono('bonusExpo', 0.04, 24), res: 'Estatal con socios privados' },
      ],
    },
    {
      id: 'i_fmi_ajuste', fase: 'gobierno', peso: 4, dibujo: '🌐 ✂️ 💵',
      cuando: (s) => izq(s) && s.eco.reservas < 20 && s.eco.deuda > 70,
      titular: 'El FMI exige un ajuste para refinanciar',
      opciones: [
        { txt: 'Aceptar el ajuste', ef: { reservas: 10, riesgo: -100, humildes: -5, trabajadores: -4 }, res: 'Acuerdo firmado, ajuste en marcha', bueno: false },
        { txt: 'Romper con el FMI', ef: { riesgo: 250, reservas: -3, trabajadores: 4, humildes: 3, rel: { USA: -8, CHN: 4 } }, res: '¡Soberanía! Los mercados tiemblan' },
        { txt: 'Pedir más tiempo', costo: { pc: 2 }, ef: { riesgo: 60 }, res: 'Ganaste seis meses' },
      ],
    },
    {
      id: 'i_brasil_queja', fase: 'gobierno', peso: 3, dibujo: '🇧🇷 😤 🇦🇷',
      cuando: (s) => ley(s, 'industria_nacional'),
      titular: 'Brasil se queja del Compre Nacional',
      opciones: [
        { txt: 'Acuerdo en el Mercosur', ef: { empresarios: -2, rel: { BRA: 6 } }, despues: bono('bonusImpo', 0.01, 6), res: 'Paz con Brasil 🤝' },
        { txt: 'Mantenerlo', ef: { trabajadores: 3, expo: -0.02, rel: { BRA: -8 } }, res: 'Brasil frena nuestros autos', bueno: false },
      ],
    },
    {
      id: 'i_paro_campo', fase: 'gobierno', peso: 4, dibujo: '🌾 🚜 🚧',
      cuando: (s) => ley(s, 'junta_granos') || s.eco.retenciones >= 3,
      titular: 'El campo para y corta las rutas',
      opciones: [
        { txt: 'Negociar', costo: { pc: 1 }, ef: { campo: 6 }, res: 'Mesa con la Mesa de Enlace 🧉' },
        { txt: 'Aguantar', ef: { campo: -6, expo: -0.04, reservas: -2, crec: -0.3 }, res: 'Rutas cortadas y menos dólares', bueno: false },
        { txt: 'Bajar retenciones', si: (s) => s.eco.retenciones > 0, siTxt: 'Ya no hay retenciones', ef: { campo: 10 }, despues: (s) => { s.eco.retenciones -= 1; s.eco.retencionesInicioMes = s.eco.retenciones; }, res: 'El campo levanta el paro 🌾' },
      ],
    },
    {
      id: 'i_tren_vuelve', fase: 'gobierno', peso: 4, dibujo: '🚆 🎉 🌾',
      cuando: (s) => ley(s, 'trenes') && mesesDesde(s, 'trenes') >= 12,
      titular: 'Vuelve el tren de carga al norte',
      opciones: [
        { txt: 'Inaugurarlo en persona', ef: { todos: 2, campo: 3, trabajadores: 2 }, res: 'El tren llega a Tucumán 🚆' },
        { txt: 'Extender la red', costo: { gasto: 1 }, ef: { trabajadores: 3 }, despues: bono('bonusCrec', 0.15, 18), res: 'Más vías hacia el sur' },
      ],
    },
    {
      id: 'i_hospitales', fase: 'gobierno', peso: 4, dibujo: '🏥 📉 ❤️',
      cuando: (s) => ley(s, 'salud_publica') && mesesDesde(s, 'salud_publica') >= 8,
      titular: 'Mejoran los hospitales públicos en todo el país',
      opciones: [
        { txt: 'Ampliar el plan', costo: { gasto: 1 }, ef: { humildes: 4, jubilados: 4, salud: 4 }, res: 'Salud para todos 🏥' },
        { txt: 'Celebrarlo', ef: { todos: 1, jubilados: 2 }, res: 'Los médicos lo festejan' },
      ],
    },
    {
      id: 'i_bloque_regional', fase: 'gobierno', peso: 2, dibujo: '🌎 ✊ 🤝',
      cuando: (s) => s.partido.ideo <= -0.3,
      titular: 'Gobiernos de izquierda te invitan a su bloque',
      opciones: [
        { txt: 'Sumarse', ef: { trabajadores: 2, riesgo: 30, rel: { VEN: 10, BOL: 6, USA: -6 } }, res: 'Foto con la izquierda regional ✊' },
        { txt: 'Neutralidad', ef: { media: 1 }, res: 'Argentina no se alinea' },
      ],
    },
    {
      id: 'i_puerto_china', fase: 'gobierno', peso: 2, dibujo: '🇨🇳 ⚓ 🏗️',
      cuando: (s) => izq(s) || ley(s, 'trenes') || rel(s, 'CHN') >= 60,
      titular: 'China quiere financiar un puerto en el sur',
      opciones: [
        { txt: 'Aceptar', ef: { crec: 0.3, trabajadores: 2, riesgo: 20, rel: { CHN: 8, USA: -8 } }, despues: bono('bonusExpo', 0.02, 24), res: 'Nuevo puerto en Chubut ⚓' },
        { txt: 'Con condiciones', costo: { pc: 1 }, ef: { crec: 0.15, rel: { CHN: 3 } }, despues: bono('bonusExpo', 0.01, 24), res: 'Puerto con control argentino' },
        { txt: 'Rechazar', ef: { rel: { CHN: -5, USA: 3 } }, res: 'Sin puerto chino' },
      ],
    },

    // ── Por tus leyes de centro ──
    {
      id: 'i_acuerdo_tension', fase: 'gobierno', peso: 4, dibujo: '🤝 💢 📊',
      cuando: (s) => ley(s, 'acuerdo_social') && s.eco.inflAnual > 25,
      titular: 'Los gremios quieren romper el acuerdo social',
      opciones: [
        { txt: 'Renegociar', costo: { pc: 1 }, ef: { trabajadores: 4, empresarios: -2, inflacion: 0.3 }, res: 'Nuevo acuerdo de precios y sueldos' },
        { txt: 'Sostenerlo', ef: { trabajadores: -4, inflacion: -0.2 }, res: 'El acuerdo resiste' },
      ],
    },
    {
      id: 'i_unicornio', fase: 'gobierno', peso: 3, dibujo: '🦄 💻 🚀',
      cuando: (s) => ley(s, 'conocimiento') && mesesDesde(s, 'conocimiento') >= 6,
      titular: 'Una startup argentina ya vale mil millones',
      opciones: [
        { txt: 'Foto en la Rosada', ef: { media: 3, empresarios: 2 }, res: 'Otro unicornio argentino 🦄' },
        { txt: 'Más beneficios al sector', ef: { empresarios: 4, media: 2 }, despues: (s) => { bono('bonusExpo', 0.02, 12)(s); R.gob.bono(s, 'bonusRecauda', -0.05); }, res: 'Programadores que exportan 💻' },
      ],
    },
    {
      id: 'i_parque_solar', fase: 'gobierno', peso: 3, dibujo: '🌞 ⚡ 🏜️',
      cuando: (s) => ley(s, 'renovables') && mesesDesde(s, 'renovables') >= 6,
      titular: 'Inauguran el parque solar más grande del país',
      opciones: [
        { txt: 'Más licitaciones', costo: { gasto: 0.5 }, ef: { media: 2, trabajadores: 2 }, despues: bono('bonusCrec', 0.1, 18), res: 'Energía limpia y empleo 🌞' },
        { txt: 'Celebrarlo', ef: { media: 2 }, res: 'Sol de Catamarca a la red' },
      ],
    },
    {
      id: 'i_consenso', fase: 'gobierno', peso: 2, dibujo: '🏛️ 🤝 📜',
      cuando: (s) => centro(s) && s.gob.aprob > 50,
      titular: 'Oficialismo y oposición firman un gran acuerdo',
      opciones: [
        { txt: 'Firmar', costo: { pc: 1 }, ef: { todos: 2, riesgo: -40 }, despues: (s) => { for (const b of R.congreso.BLOQUES) s.gob.rel[b] = R.clamp(s.gob.rel[b] + 6, 0, 100); }, res: 'Acuerdo de Estado 🤝' },
        { txt: 'No hace falta', ef: { media: -1 }, res: 'Cada uno por su lado' },
      ],
    },

    {
      id: 'i_pymes_contratan', fase: 'gobierno', peso: 3, dibujo: '🧰 👷 📈',
      cuando: (s) => ley(s, 'pymes') && mesesDesde(s, 'pymes') >= 6,
      titular: 'Las pymes contratan como nunca',
      opciones: [
        { txt: 'Ampliar el beneficio', ef: { empresarios: 4, trabajadores: 2 }, despues: (s) => { R.gob.bono(s, 'bonusEmpleo', 0.2, 12); R.gob.bono(s, 'bonusRecauda', -0.05); }, res: 'Más pymes en el régimen 🧰' },
        { txt: 'Celebrarlo', ef: { empresarios: 3, trabajadores: 2 }, res: 'Récord de empleo pyme' },
      ],
    },
    {
      id: 'i_blanqueo_laboral', fase: 'gobierno', peso: 3, dibujo: '🧾 ✅ 👷',
      cuando: (s) => ley(s, 'monotributo') && mesesDesde(s, 'monotributo') >= 6,
      titular: 'Un millón de trabajadores pasan al blanco',
      opciones: [
        { txt: 'Cadena nacional', ef: { todos: 2 }, res: 'Más gente con aportes y obra social' },
        { txt: 'Bajar la cuota', ef: { trabajadores: 3, media: 2 }, despues: (s) => { R.gob.bono(s, 'bonusEmpleo', 0.1, 12); R.gob.bono(s, 'bonusRecauda', -0.05); }, res: 'Monotributo más barato' },
      ],
    },
    {
      id: 'i_ue_inversiones', fase: 'gobierno', peso: 2, dibujo: '🇪🇺 🤝 🏭',
      cuando: (s) => centro(s) && rel(s, 'UE') >= 40,
      titular: 'Europa propone un acuerdo de inversiones',
      opciones: [
        { txt: 'Firmar', ef: { crec: 0.3, campo: 2, trabajadores: -2, rel: { UE: 8 } }, despues: bono('bonusExpo', 0.02, 18), res: 'Fábricas europeas en Argentina 🇪🇺' },
        { txt: 'Con cuidado industrial', costo: { pc: 1 }, ef: { crec: 0.15, rel: { UE: 3 } }, despues: bono('bonusExpo', 0.01, 18), res: 'Acuerdo con protección' },
      ],
    },

    // ── Por cómo está la economía (a cualquiera) ──
    {
      id: 'i_inflacion_alta', fase: 'gobierno', peso: 4, repite: 18, dibujo: '🛒 🔥 📈',
      cuando: (s) => s.eco.inflAnual > 60,
      titular: 'Los precios suben todos los días',
      opciones: [
        { txt: 'Plan antiinflacionario', costo: { pc: 2 }, ef: { inflacion: -1.5, crec: -0.4, media: 3 }, res: 'Plan de estabilización en marcha' },
        { txt: 'Congelar precios', ef: { inflacion: -0.8, empresarios: -6, media: 2 }, res: 'Precios congelados por 90 días 🧊' },
        { txt: 'Esperar', ef: { todos: -2 }, res: 'La gente está harta', bueno: false },
      ],
    },
    {
      id: 'i_desempleo_alto', fase: 'gobierno', peso: 4, repite: 18, dibujo: '🚪 👷 😞',
      cuando: (s) => s.eco.desempleo > 10,
      titular: 'Hay colas para conseguir trabajo',
      opciones: [
        { txt: 'Plan de empleo', costo: { gasto: 2 }, ef: { desempleo: -0.6, humildes: 4, trabajadores: 2 }, res: 'Miles de puestos nuevos 👷' },
        { txt: 'Menos cargas al contratar', ef: { desempleo: -0.3, empresarios: 3 }, despues: (s) => { R.gob.bono(s, 'bonusEmpleo', 0.3, 12); R.gob.bono(s, 'bonusRecauda', -0.1); }, res: 'Contratar sale más barato' },
        { txt: 'Esperar que crezca', ef: { trabajadores: -4, humildes: -3 }, res: 'El desempleo sigue', bueno: false },
      ],
    },
    {
      id: 'i_corrida', fase: 'gobierno', peso: 5, repite: 12, dibujo: '💵 🏃 🏦',
      cuando: (s) => s.eco.reservas < 8,
      titular: 'Corrida: todos quieren comprar dólares',
      opciones: [
        { txt: 'Poner cepo', si: (s) => !s.eco.cepo, siTxt: 'Ya hay cepo', ef: { media: -5, empresarios: -4, reservas: 2 }, despues: (s) => { s.eco.cepo = true; }, res: 'Cepo al dólar 🔒', bueno: false },
        { txt: 'Subir las tasas', ef: { crec: -0.6, reservas: 3, media: -2 }, res: 'Se calma, pero frena la economía' },
        { txt: 'Pedir un préstamo', ef: { reservas: 6, deuda: 4, riesgo: 40 }, res: 'Dólares prestados para aguantar' },
      ],
    },
    {
      id: 'i_boom', fase: 'gobierno', peso: 3, repite: 24, dibujo: '🚗 🏠 📈',
      cuando: (s) => s.eco.crec > 4,
      titular: 'Récord de ventas de autos y casas',
      opciones: [
        { txt: 'Ahorrar para después', ef: { riesgo: -40, reservas: 3 }, res: 'Fondo anticrisis 🐷' },
        { txt: 'Bajar impuestos', si: (s) => s.eco.impuestos > 0, siTxt: 'Ya están al mínimo', ef: { empresarios: 5, media: 4 }, despues: (s) => { s.eco.impuestos -= 1; s.eco.impuestosInicioMes = s.eco.impuestos; }, res: 'Menos impuestos para todos 🧾' },
        { txt: 'Subir sueldos públicos', costo: { gasto: 1.5 }, ef: { trabajadores: 4, media: 3 }, res: 'Aumento para estatales' },
      ],
    },
    {
      id: 'i_superavit', fase: 'gobierno', peso: 3, repite: 24, dibujo: '⚖️ 💰 🎉',
      cuando: (s) => R.eco.resultado(s) > 1.2,
      titular: 'Sobra plata en el presupuesto',
      opciones: [
        { txt: 'Bajar impuestos', si: (s) => s.eco.impuestos > 0, siTxt: 'Ya están al mínimo', ef: { media: 4, empresarios: 4 }, despues: (s) => { s.eco.impuestos -= 1; s.eco.impuestosInicioMes = s.eco.impuestos; }, res: 'Alivio fiscal 🧾' },
        { txt: 'Pagar deuda', ef: { deuda: -3, riesgo: -50 }, res: 'Menos deuda, más confianza' },
        { txt: 'Más obra pública', ef: { trabajadores: 4 }, despues: (s) => { s.eco.niveles.obras = R.clamp(R.round(s.eco.niveles.obras + 0.1, 2), R.eco.NIVEL_MIN, R.eco.NIVEL_MAX); s.eco.nivelesInicioMes.obras = s.eco.niveles.obras; }, res: 'Rutas y escuelas nuevas 🏗️' },
      ],
    },
    {
      id: 'i_riesgo_minimo', fase: 'gobierno', peso: 3, dibujo: '📊 📉 🎉',
      cuando: (s) => s.eco.riesgo < 400,
      titular: 'El riesgo país toca un mínimo histórico',
      opciones: [
        { txt: 'Salir a los mercados', ef: { reservas: 6, deuda: 3 }, res: 'Deuda a tasas bajísimas' },
        { txt: 'Atraer inversiones', costo: { pc: 1 }, ef: { empresarios: 4 }, despues: bono('bonusCrec', 0.2, 12), res: 'Llegan fábricas nuevas 🏭' },
      ],
    },
    {
      id: 'i_pobreza_baja', fase: 'gobierno', peso: 3, dibujo: '🏚️ 📉 😊',
      cuando: (s) => s.eco.pobreza < 25,
      titular: 'La pobreza baja por primera vez en años',
      opciones: [
        { txt: 'Cadena nacional', ef: { todos: 2 }, res: 'Lo anunciás con orgullo 📺' },
        { txt: 'Ir por más', costo: { gasto: 1 }, ef: { humildes: 4 }, despues: (s) => R.gob.bono(s, 'bonusEmpleo', 0.2, 12), res: 'Plan para los que faltan' },
      ],
    },
    {
      id: 'i_sueldos_ganan', fase: 'gobierno', peso: 3, dibujo: '💰 📈 👷',
      cuando: (s) => s.eco.salarioReal > 108,
      titular: 'Los sueldos le ganan a la inflación',
      opciones: [
        { txt: 'Festejarlo', ef: { trabajadores: 3, media: 2 }, res: 'El changuito rinde más 🛒' },
        { txt: 'Bajar Ganancias', ef: { trabajadores: 4, media: 4 }, despues: (s) => R.gob.bono(s, 'bonusRecauda', -0.2), res: 'Más plata en el bolsillo' },
      ],
    },
  ]);
})(globalThis.R = globalThis.R || {});
