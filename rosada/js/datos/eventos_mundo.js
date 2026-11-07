// Noticias del mundo (salen junto con las de gobierno). rel: { PAÍS: cambio de relación }, soberania: avance en Malvinas.
(function (R) {
  'use strict';
  const rel = (id) => (s) => (s.mundo ? s.mundo.paises[id].rel : 50);
  const enGuerra = (s) => !!(s.mundo && s.mundo.guerra);

  R.ev.registrar([
    {
      id: 'm_tlc_eeuu', fase: 'gobierno', peso: 2, cuando: (s) => rel('USA')(s) >= 45 && !s.mundo.paises.USA.tratado, dibujo: '🦅 📦 🤝',
      titular: 'Estados Unidos ofrece un tratado de libre comercio',
      opciones: [
        { txt: 'Firmar', ef: { empresarios: 6, campo: 4, trabajadores: -4, rel: { USA: 10, CHN: -8 } },
          despues: (s) => { s.mundo.paises.USA.tratado = true; s.gob.bonusExpo = (s.gob.bonusExpo || 0) + R.PAIS.USA.expo; }, res: 'Tratado firmado: más exportaciones 🚢' },
        { txt: 'Negociar con calma', ef: { rel: { USA: 3 } }, res: 'Seguimos conversando' },
        { txt: 'Rechazar', ef: { trabajadores: 2, rel: { USA: -10 } }, res: '«No somos colonia», dicen algunos' },
      ],
    },
    {
      id: 'm_china_base', fase: 'gobierno', peso: 2, unaVez: true, dibujo: '🐉 📡 🏔️',
      titular: 'China quiere una base espacial en la Patagonia',
      opciones: [
        { txt: 'Aceptar', ef: { reservas: 5, rel: { CHN: 15, USA: -15 } }, res: 'Antenas chinas en Neuquén 📡' },
        { txt: 'Que sea civil y controlada', costo: { pc: 2 }, ef: { reservas: 2, rel: { CHN: 6, USA: -4 } }, res: 'Acuerdo con condiciones' },
        { txt: 'Rechazar', ef: { rel: { CHN: -12, USA: 8 } }, res: 'Washington aplaude 👏' },
      ],
    },
    {
      id: 'm_china_soja', fase: 'gobierno', peso: 2, repite: 18, dibujo: '🌱 🚢 🐉',
      titular: 'China quiere comprar toda la cosecha de soja',
      opciones: [
        { txt: 'Vender todo', ef: { reservas: 5, campo: 6, rel: { CHN: 6 } }, res: 'Barcos repletos rumbo a Shanghái 🚢' },
        { txt: 'Exigir que inviertan acá', costo: { pc: 1 }, ef: { reservas: 3, empresarios: 3, crec: 0.4, rel: { CHN: 2 } }, res: 'Fábrica china en Rosario 🏭' },
      ],
    },
    {
      id: 'm_brasil_crisis', fase: 'gobierno', peso: 2, repite: 20, dibujo: '🦜 📉 💸',
      titular: 'Brasil devalúa fuerte: sus productos inundan el mercado',
      opciones: [
        { txt: 'Proteger la industria', ef: { trabajadores: 4, empresarios: 2, media: -3, rel: { BRA: -8 } }, res: 'Aranceles a lo brasileño' },
        { txt: 'Dejar entrar', ef: { media: 3, trabajadores: -5, expo: -0.03 }, res: 'Zapatillas baratas, fábricas cerradas' },
        { txt: 'Negociar en el Mercosur', costo: { pc: 2 }, ef: { trabajadores: 2, rel: { BRA: 5 } }, res: 'Cupos acordados 🤝' },
      ],
    },
    {
      id: 'm_mercosur', fase: 'gobierno', peso: 2, repite: 24, dibujo: '🤝 🌎 💱',
      titular: 'Cumbre del Mercosur: proponen una moneda común',
      opciones: [
        { txt: 'Apoyar la idea', ef: { rel: { BRA: 10, URY: 8, PRY: 8 }, riesgo: 40 }, res: 'El «sur» en camino 💱' },
        { txt: 'Más comercio, sin moneda', ef: { rel: { BRA: 4, URY: 4 }, expo: 0.02 }, res: 'Bajan los aranceles entre vecinos' },
        { txt: 'Salir del Mercosur', ef: { empresarios: 3, trabajadores: -4, rel: { BRA: -20, URY: -15, PRY: -15 }, expo: -0.04 }, res: 'Portazo regional 🚪' },
      ],
    },
    {
      id: 'm_pesca_malvinas', fase: 'gobierno', peso: 3, repite: 18, cuando: (s) => s.mundo && !s.mundo.malvinas.recuperadas, dibujo: '🎣 🏝️ 🚢',
      titular: 'El Reino Unido vende licencias de pesca en Malvinas',
      opciones: [
        { txt: 'Protesta formal', costo: { pc: 1 }, ef: { todos: 1, soberania: 3, rel: { GBR: -5 } }, res: 'La ONU toma nota 📜' },
        { txt: 'Sancionar a las pesqueras', ef: { todos: 3, rel: { GBR: -12, UE: -4 } }, res: 'Barcos piratas, afuera 🏴‍☠️' },
        { txt: 'Proponer pesca conjunta', costo: { pc: 2 }, ef: { reservas: 2, soberania: 6, media: -2, rel: { GBR: 8 } }, res: 'Primer acuerdo en décadas 🤝' },
      ],
    },
    {
      id: 'm_onu_malvinas', fase: 'gobierno', peso: 3, repite: 24, cuando: (s) => s.mundo && s.mundo.malvinas.soberania >= 25 && !s.mundo.malvinas.recuperadas, dibujo: '🌐 🗳️ 🏝️',
      titular: 'La ONU vota una resolución sobre Malvinas',
      opciones: [
        { txt: 'Hacer lobby con todos', costo: { pc: 3 }, ef: { soberania: 12, todos: 2 }, res: '¡Apoyo masivo en la ONU! 🌐' },
        { txt: 'Pedir apoyo a China', ef: { soberania: 7, rel: { CHN: 5, USA: -6 } }, res: 'China vota con vos 🐉' },
        { txt: 'Pedir apoyo a EE. UU.', ef: { soberania: 7, rel: { USA: 5, CHN: -6 } }, res: 'Washington se abstiene, algo es algo' },
      ],
    },
    {
      id: 'm_hielos', fase: 'gobierno', peso: 1, unaVez: true, dibujo: '🏔️ 🧊 🗺️',
      titular: 'Chile publica un mapa que se queda con los Hielos Continentales',
      opciones: [
        { txt: 'Reclamo firme', ef: { todos: 2, rel: { CHL: -15 } }, res: 'Tensión en la cordillera' },
        { txt: 'Comisión binacional', costo: { pc: 1 }, ef: { rel: { CHL: 5 } }, res: 'Lo arreglan los técnicos' },
      ],
    },
    {
      id: 'm_bolivia_gas', fase: 'gobierno', peso: 2, unaVez: true, dibujo: '🔥 🛢️ 🦙',
      titular: 'Bolivia ofrece gas barato por 10 años',
      opciones: [
        { txt: 'Aceptar', ef: { media: 2, humildes: 2, rel: { BOL: 12 } }, despues: (s) => { s.eco.niveles.subsidios = Math.max(0.5, R.round(s.eco.niveles.subsidios - 0.1, 2)); s.eco.nivelesInicioMes.subsidios = s.eco.niveles.subsidios; }, res: 'Gas barato: bajan los subsidios sin tarifazo 🔥' },
        { txt: 'Mejor Vaca Muerta', ef: { empresarios: 3, rel: { BOL: -8 } }, res: 'Energía argentina' },
      ],
    },
    {
      id: 'm_migrantes', fase: 'gobierno', peso: 2, repite: 24, dibujo: '🧳 🚌 🏠',
      titular: 'Llegan miles de migrantes de Venezuela',
      opciones: [
        { txt: 'Recibirlos', ef: { media: 1, humildes: -2, crec: 0.3, rel: { VEN: -5, USA: 4 } }, res: 'Médicos e ingenieros que suman 🩺' },
        { txt: 'Cerrar la frontera', ef: { media: 2, humildes: 2, rel: { VEN: 4, UE: -5 } }, res: 'Frontera cerrada 🚧' },
      ],
    },
    {
      id: 'm_potencias', fase: 'gobierno', peso: 1, repite: 30, desde: 12, dibujo: '🦅 ⚡ 🐉',
      titular: 'Tensión entre EE. UU. y China: te piden elegir bando',
      opciones: [
        { txt: 'Con Estados Unidos', ef: { empresarios: 3, rel: { USA: 15, GBR: 6, CHN: -15, RUS: -10 } }, res: 'Alineamiento con Occidente 🦅' },
        { txt: 'Con China', ef: { trabajadores: 2, rel: { CHN: 15, RUS: 8, USA: -15, GBR: -6 } }, res: 'Socio estratégico de Pekín 🐉' },
        { txt: 'Neutralidad', costo: { pc: 1 }, ef: { rel: { USA: -2, CHN: -2 } }, res: 'Ni con unos ni con otros' },
      ],
    },
    {
      id: 'm_espia', fase: 'gobierno', peso: 1, unaVez: true, desde: 6, dibujo: '🕵️ 🐻 📡',
      titular: 'Atrapan a un espía ruso en Buenos Aires',
      opciones: [
        { txt: 'Expulsar diplomáticos', ef: { media: 2, rel: { RUS: -15, USA: 6 } }, res: 'Fuera del país 🚪' },
        { txt: 'Canjearlo en silencio', ef: { rel: { RUS: 4 }, escandalo: 1 }, res: 'Nadie se enteró… casi' },
      ],
    },
    {
      id: 'm_pastera', fase: 'gobierno', peso: 1, unaVez: true, dibujo: '🏭 🌊 🐟',
      titular: 'Uruguay autoriza otra papelera sobre el río',
      opciones: [
        { txt: 'Cortar el puente', ef: { media: 2, rel: { URY: -15 } }, res: 'Bloqueo en Gualeguaychú 🌉' },
        { txt: 'Control ambiental conjunto', costo: { pc: 1 }, ef: { rel: { URY: 6 } }, res: 'Monitoreo binacional 🔬' },
      ],
    },
    // Guerra
    {
      id: 'm_guerra_onu', fase: 'gobierno', peso: 6, repite: 4, cuando: enGuerra, dibujo: '🌐 🕊️ ⚔️',
      titular: 'La ONU pide un alto el fuego',
      opciones: [
        { txt: 'Seguir peleando', ef: { media: -3, rel: { UE: -6, USA: -4 } }, res: 'El mundo te mira con preocupación' },
        { txt: 'Aceptar una tregua', ef: { todos: 2 }, despues: (s) => { if (s.mundo.guerra) R.mundo.terminarGuerra(s, s.mundo.guerra.frente >= 55 ? 'paz_buena' : 'paz_mala'); }, res: 'Se callaron las armas 🕊️' },
      ],
    },
    {
      id: 'm_guerra_heroe', fase: 'gobierno', peso: 4, repite: 6, cuando: enGuerra, dibujo: '🎖️ 🪖 ☀️',
      titular: 'Un soldado se vuelve héroe nacional',
      opciones: [
        { txt: 'Condecorarlo', costo: { pc: 1 }, ef: { todos: 4 }, res: 'Todo el país lo aplaude 🎖️' },
        { txt: 'Bajo perfil', ef: { todos: 1 }, res: 'Héroe anónimo' },
      ],
    },
    {
      id: 'm_insurgencia', fase: 'gobierno', peso: 5, repite: 6, cuando: (s) => s.mundo && s.mundo.resistencia > 0, dibujo: '🔥 🏴 🚧',
      titular: 'Protestas contra la anexión en los territorios nuevos',
      opciones: [
        { txt: 'Inversión y autonomía', costo: { gasto: 2 }, ef: { todos: 1 }, despues: (s) => { s.mundo.resistencia = Math.max(0, s.mundo.resistencia - 6); }, res: 'Escuelas y rutas: baja la tensión 🏗️' },
        { txt: 'Mano dura', ef: { media: -2, escandalo: 2 }, despues: (s) => { s.mundo.resistencia = Math.max(0, s.mundo.resistencia - 3); }, res: 'Orden… con miedo' },
      ],
    },
  ]);
})(globalThis.R = globalThis.R || {});
