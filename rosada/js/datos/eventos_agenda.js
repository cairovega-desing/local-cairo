// La agenda del mundo: los países te piden cosas, te ofrecen negocios y te presionan según cómo te llevás con ellos
// y lo que producís. Algunas opciones suben un sector (inversión extranjera).
(function (R) {
  'use strict';
  const rel = (id) => (s) => (s.mundo ? s.mundo.paises[id].rel : 50);
  const libre = (id) => (s) => s.mundo && !s.mundo.paises[id].anexado && !(s.mundo.guerra && s.mundo.guerra.pais === id);
  const nivel = (id) => (s) => (s.prod ? R.prod.nivel(s, id) : R.SECTOR[id].nivel0);
  const subir = (id) => (s) => { if (s.prod) R.prod.subir(s, id, 'extranjera'); };

  R.ev.registrar([
    {
      id: 'a_usa_base', fase: 'gobierno', peso: 2, cuando: (s) => libre('USA')(s) && rel('USA')(s) >= 35 && s.gob.meses >= 4, dibujo: '🦅 ⚓ 🏔️',
      titular: 'Estados Unidos pide una base en Ushuaia',
      opciones: [
        { txt: 'Aceptar', ef: { defensa: 6, reservas: 3, trabajadores: -2, rel: { USA: 15, CHN: -12, RUS: -10 } }, res: 'Marines en Tierra del Fuego ⚓' },
        { txt: 'Solo ejercicios', costo: { pc: 1 }, ef: { defensa: 2, rel: { USA: 4 } }, res: 'Maniobras conjuntas, sin base' },
        { txt: 'Rechazar', ef: { trabajadores: 2, rel: { USA: -10, CHN: 5 } }, res: '«La soberanía no se negocia»' },
      ],
    },
    {
      id: 'a_china_litio', fase: 'gobierno', peso: 2, repite: 24, cuando: (s) => libre('CHN')(s) && rel('CHN')(s) >= 40 && nivel('energia')(s) < R.NIVEL_MAX_SECTOR, dibujo: '🐉 🔋 ⛰️',
      titular: 'China quiere invertir en el litio',
      opciones: [
        { txt: 'Aceptar', ef: { empresarios: 3, rel: { CHN: 8, USA: -6 } }, despues: subir('energia'), res: 'Minas nuevas en la Puna ⛽ +1' },
        { txt: 'Con socios locales', costo: { pc: 2 }, ef: { empresarios: 5, trabajadores: 2, rel: { CHN: 3 } }, despues: subir('energia'), res: 'Mitad china, mitad nacional ⛽ +1' },
        { txt: 'Rechazar', ef: { rel: { CHN: -8 } }, res: 'El litio espera' },
      ],
    },
    {
      id: 'a_brasil_aranceles', fase: 'gobierno', peso: 2, repite: 30, cuando: (s) => libre('BRA')(s) && rel('BRA')(s) >= 30, dibujo: '🦜 📦 🤝',
      titular: 'Brasil pide bajar los aranceles del Mercosur',
      opciones: [
        { txt: 'Bajarlos', ef: { expo: 0.04, media: 2, trabajadores: -4, rel: { BRA: 10 } }, res: 'Más comercio con Brasil 🚚' },
        { txt: 'Mantenerlos', ef: { trabajadores: 2, rel: { BRA: -6 } }, res: 'Brasilia se enoja' },
      ],
    },
    {
      id: 'a_bolivia_gas', fase: 'gobierno', peso: 3, cuando: (s) => libre('BOL')(s) && s.prod && R.prod.energia(s).saldo < 0 && rel('BOL')(s) >= 30, dibujo: '🔥 🚰 🇧🇴',
      titular: 'Bolivia ofrece gas barato por diez años',
      opciones: [
        { txt: 'Firmar', ef: { reservas: 2, rel: { BOL: 10 } }, despues: subir('energia'), res: 'Gasoducto lleno ⛽ +1' },
        { txt: 'Rechazar', ef: { rel: { BOL: -5 } }, res: 'Seguimos importando barcos de gas' },
      ],
    },
    {
      id: 'a_fmi', fase: 'gobierno', peso: 3, repite: 24, cuando: (s) => s.eco.reservas < 20, dibujo: '🌐 💵 📋',
      titular: 'El FMI ofrece plata con condiciones',
      opciones: [
        { txt: 'Aceptar', ef: { reservas: 10, deuda: 3, riesgo: -100, humildes: -4, jubilados: -4, trabajadores: -3 }, res: 'Llegan los dólares… y el ajuste' },
        { txt: 'Rechazar', ef: { riesgo: 80, trabajadores: 2 }, res: '«Nos arreglamos solos»' },
      ],
    },
    {
      id: 'a_refugiados', fase: 'gobierno', peso: 1, repite: 36, cuando: (s) => s.gob.meses >= 6, dibujo: '🧳 🌎 🤲',
      titular: 'Llegan miles de refugiados venezolanos',
      opciones: [
        { txt: 'Recibirlos', ef: { humildes: -2, salud: -2, prestigio: 3, rel: { USA: 3, VEN: -3 } }, res: 'El mundo aplaude 👏' },
        { txt: 'Cerrar la frontera', ef: { media: 2, prestigio: -3, rel: { VEN: -2 } }, res: 'Polémica internacional' },
      ],
    },
    {
      id: 'a_chile_corredor', fase: 'gobierno', peso: 2, cuando: (s) => libre('CHL')(s) && rel('CHL')(s) >= 40, dibujo: '🏔️ 🚛 🌊',
      titular: 'Chile propone un corredor bioceánico',
      opciones: [
        { txt: 'Construirlo', ef: { gastoExtra: 3, campo: 3, rel: { CHL: 10 } }, despues: subir('campo'), res: 'Del Atlántico al Pacífico 🌾 +1' },
        { txt: 'Más adelante', ef: { rel: { CHL: -2 } }, res: 'Queda en carpeta' },
      ],
    },
    {
      id: 'a_ue_ambiente', fase: 'gobierno', peso: 2, repite: 30, cuando: (s) => rel('UE')(s) >= 35 && !s.gob.leyes.humedales, dibujo: '🇪🇺 🌳 ✋',
      titular: 'Europa frena el acuerdo por el ambiente',
      opciones: [
        { txt: 'Prometer cuidar', costo: { pc: 1 }, ef: { campo: -2, expo: 0.02, rel: { UE: 6 } }, res: 'Acuerdo destrabado' },
        { txt: 'Que se arreglen', ef: { campo: 2, rel: { UE: -8 } }, res: 'Bruselas se queja' },
      ],
    },
    {
      id: 'a_rusia_aviones', fase: 'gobierno', peso: 1, repite: 30, cuando: (s) => libre('RUS')(s) && rel('RUS')(s) >= 30, dibujo: '🐻 ✈️ 💰',
      titular: 'Rusia ofrece aviones de combate baratos',
      opciones: [
        { txt: 'Comprar', ef: { gastoExtra: 2, defensa: 4, rel: { RUS: 8, USA: -10 } }, despues: (s) => { s.mundo.poderExtra += 5; }, res: 'Nuevos cazas en la base ✈️' },
        { txt: 'No, gracias', ef: { rel: { USA: 3 } }, res: 'Washington toma nota' },
      ],
    },
    {
      id: 'a_bandos', fase: 'gobierno', peso: 3, cuando: (s) => s.gob.meses >= 12 && rel('USA')(s) >= 40 && rel('CHN')(s) >= 40, dibujo: '🦅 ⚖️ 🐉',
      titular: 'Estados Unidos y China te piden elegir',
      opciones: [
        { txt: 'Con Washington', ef: { empresarios: 3, rel: { USA: 15, CHN: -15 } }, res: 'Alineados con el norte' },
        { txt: 'Con Pekín', ef: { campo: 3, rel: { CHN: 15, USA: -15 } }, res: 'Socios de China' },
        { txt: 'Neutrales', costo: { pc: 2 }, ef: { prestigio: 4, rel: { USA: -3, CHN: -3 } }, res: 'Equilibrio difícil, pero respetado' },
      ],
    },
    {
      id: 'a_uruguay', fase: 'gobierno', peso: 1, cuando: (s) => libre('URY')(s) && rel('URY')(s) < 60, dibujo: '🧉 🚪 🤝',
      titular: 'Uruguay quiere irse del Mercosur',
      opciones: [
        { txt: 'Convencerlo', costo: { pc: 2 }, ef: { rel: { URY: 8, BRA: 2 } }, res: 'Se queda, por ahora' },
        { txt: 'Dejarlo ir', ef: { expo: -0.02, rel: { URY: -5, BRA: -3 } }, res: 'El bloque se achica' },
      ],
    },
    {
      id: 'a_yacyreta', fase: 'gobierno', peso: 1, cuando: (s) => libre('PRY')(s) && rel('PRY')(s) >= 30, dibujo: '💧 ⚡ 🇵🇾',
      titular: 'Paraguay pide renegociar Yacyretá',
      opciones: [
        { txt: 'Pagar más', ef: { gastoExtra: 2, rel: { PRY: 10 } }, res: 'Paraguay contento' },
        { txt: 'Mantener', ef: { rel: { PRY: -8 } }, res: 'Asunción protesta' },
      ],
    },
    {
      id: 'a_tecno', fase: 'gobierno', peso: 2, repite: 30, cuando: (s) => nivel('tecno')(s) >= 4 && s.eco.riesgo < 900, dibujo: '🏢 💻 🌎',
      titular: 'Un gigante tecnológico busca dónde instalarse',
      opciones: [
        { txt: 'Dar exenciones', costo: { pc: 2 }, ef: { gastoExtra: 2, media: 3 }, despues: subir('tecno'), res: 'Oficinas nuevas en Córdoba 💻 +1' },
        { txt: 'Que pague todo', ef: { empresarios: -2 }, res: 'Se fueron a Uruguay' },
      ],
    },
    {
      id: 'a_espias', fase: 'gobierno', peso: 1, cuando: (s) => s.mundo && !s.mundo.malvinas.recuperadas && s.gob.meses >= 8, dibujo: '🕵️ 🇬🇧 🏝️',
      titular: 'Descubren espías británicos en la Patagonia',
      opciones: [
        { txt: 'Expulsarlos', ef: { todos: 3, soberania: 2, rel: { GBR: -10 } }, res: 'Escándalo diplomático' },
        { txt: 'Silencio', ef: { rel: { GBR: 3 } }, res: 'Nadie se enteró… casi' },
      ],
    },
  ]);
})(globalThis.R = globalThis.R || {});
