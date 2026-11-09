// Partidos rivales (ficticios), figuras para sumar a la campaña, aliados chicos y generadores de nombres.
(function (R) {
  'use strict';

  // Partidos reales de la Argentina (escenario 2027, tras las legislativas de 2025).
  // Los ids internos son históricos: MNP = peronismo, PL = La Libertad Avanza, AR = PRO, UCF = UCR,
  // FT = Frente de Izquierda, PROV = Provincias Unidas (bloque de gobernadores, no tiene candidato presidencial).
  // Los candidatos y gobernadores son personajes inventados: los partidos son reales, las personas no.
  // ideo: −1 Estado presente … +1 mercado libre. base: intención de voto nacional al empezar.
  // fuerte: bonus por provincia. debate: estilo preferido en los debates. bandera: cómo se dibuja su bandera.
  R.PARTIDOS = {
    MNP: {
      id: 'MNP', sigla: 'PJ', nombre: 'Peronismo (Fuerza Patria)', color: '#2f7fd0', simbolo: '✌️', ideo: -0.55, base: 30,
      bandera: { patron: 'h3', colores: ['#2f7fd0', '#ffffff', '#2f7fd0'], emblema: '✌️' },
      candidato: { nombre: 'Ramón Arrieta', avatar: { piel: 2, pelo: 1, colorPelo: 4, anteojos: 0, barba: 1, ropa: 0 } },
      debate: 'emocion',
      fuerte: { FOR: 0.4, SGO: 0.4, LRJ: 0.35, CAT: 0.2, BUE: 0.15, TUC: 0.2, SCR: 0.15, LPA: 0.15, TDF: 0.15, CHA: 0.1 },
    },
    PL: {
      id: 'PL', sigla: 'LLA', nombre: 'La Libertad Avanza', color: '#6c3fb5', simbolo: '🦁', ideo: 0.9, base: 34,
      bandera: { patron: 'liso', colores: ['#6c3fb5'], emblema: '🦁' },
      candidato: { nombre: 'Tomás Kessler', avatar: { piel: 0, pelo: 4, colorPelo: 1, anteojos: 0, barba: 0, ropa: 3 } },
      debate: 'ataque',
      fuerte: { CBA: 0.25, MZA: 0.25, SLU: 0.15, SJU: 0.15, SAL: 0.15, TUC: 0.1, CABA: 0.1, ERI: 0.1, CHA: 0.05 },
      oficialismo: true,
    },
    AR: {
      id: 'AR', sigla: 'PRO', nombre: 'PRO', color: '#f0b90b', simbolo: '🟡', ideo: 0.5, base: 9,
      bandera: { patron: 'liso', colores: ['#f5c400'], emblema: 'ninguno', sigla: true },
      candidato: { nombre: 'Valeria Montes', avatar: { piel: 0, pelo: 2, colorPelo: 3, anteojos: 1, barba: 0, ropa: 2 } },
      debate: 'datos',
      fuerte: { CABA: 0.6, ERI: 0.25, CBA: 0.05 },
    },
    UCF: {
      id: 'UCF', sigla: 'UCR', nombre: 'Unión Cívica Radical', color: '#d6453d', simbolo: '🎩', ideo: 0.05, base: 7,
      bandera: { patron: 'h2', colores: ['#d32f2f', '#ffffff'], emblema: 'ninguno' },
      candidato: { nombre: 'Elena Cabral', avatar: { piel: 1, pelo: 3, colorPelo: 5, anteojos: 2, barba: 0, ropa: 1 } },
      debate: 'datos',
      fuerte: { COR: 0.55, MZA: 0.25, JUJ: 0.35, CHA: 0.25, SFE: 0.1, CAT: 0.1 },
    },
    FT: {
      id: 'FT', sigla: 'FIT', nombre: 'Frente de Izquierda', color: '#a51c30', simbolo: '✊', ideo: -1, base: 4,
      bandera: { patron: 'liso', colores: ['#c62828'], emblema: '✊' },
      candidato: { nombre: 'Nicolás Ferro', avatar: { piel: 1, pelo: 5, colorPelo: 0, anteojos: 1, barba: 2, ropa: 4 } },
      debate: 'ataque',
      fuerte: { NQN: 0.4, JUJ: 0.35, CABA: 0.2, SAL: 0.15, SFE: 0.05 },
    },
    PROV: {
      id: 'PROV', sigla: 'PU', nombre: 'Provincias Unidas', color: '#13a89e', simbolo: '🗺️', ideo: 0.15, base: 0,
      bandera: { patron: 'h2', colores: ['#13a89e', '#ffffff'], emblema: '🗺️' },
      noCompite: true,
    },
  };
  R.RIVALES = ['MNP', 'PL', 'AR', 'UCF', 'FT'];

  // Bancas que NO se renuevan en 2027 (Diputados elegidos en 2025; aproximado a la composición real).
  R.CONGRESO_INICIAL = {
    diputados: { PL: 60, MNP: 44, PROV: 12, AR: 4, UCF: 4, FT: 3 }, // 127
  };

  // Figuras para sumar a la campaña. ideo: a qué votante le gusta (−1 izq, +1 der, 0 a todos).
  R.FIGURAS = [
    { id: 'diez', emoji: '⚽', nombre: 'Ex 10 de la Selección', conocen: 12, simpatia: 3, ideo: 0, costo: 35 },
    { id: 'actriz', emoji: '🎭', nombre: 'Actriz de novelas', conocen: 9, simpatia: 3, ideo: 0, costo: 30 },
    { id: 'economista', emoji: '📈', nombre: 'Economista de la tele', conocen: 5, simpatia: 6, ideo: 0.8, costo: 30 },
    { id: 'cura', emoji: '⛪', nombre: 'Cura de barrio', conocen: 4, simpatia: 7, ideo: -0.8, costo: 20 },
    { id: 'streamer', emoji: '🎮', nombre: 'Streamer famosa', conocen: 10, simpatia: 2, ideo: 0.2, costo: 25, riesgo: true },
    { id: 'parrillero', emoji: '🥩', nombre: 'Parrillero de la tele', conocen: 7, simpatia: 5, ideo: 0, costo: 25 },
    { id: 'rockero', emoji: '🎸', nombre: 'Rockero de los 80', conocen: 6, simpatia: 4, ideo: -0.4, costo: 20 },
    { id: 'medica', emoji: '🩺', nombre: 'Médica de la pandemia', conocen: 5, simpatia: 6, ideo: -0.2, costo: 20 },
    { id: 'campo', emoji: '🚜', nombre: 'Productor rural famoso', conocen: 4, simpatia: 5, ideo: 0.7, costo: 20, region: 'centro' },
    { id: 'sindical', emoji: '👷', nombre: 'Dirigente sindical', conocen: 4, simpatia: 3, ideo: -0.7, costo: 15, militancia: 12 },
  ];

  // Partidos chicos que pueden sumarse en una alianza.
  R.ALIADOS = [
    { id: 'vecinal', nombre: 'Partido Vecinal', emoji: '🏘️', ideo: 0.1, votos: 2.5, region: 'amba' },
    { id: 'verde', nombre: 'Partido Verde', emoji: '🌱', ideo: -0.3, votos: 2, region: 'patagonia' },
    { id: 'demo', nombre: 'Demócratas del Interior', emoji: '🐎', ideo: 0.5, votos: 2.5, region: 'cuyo' },
    { id: 'norte', nombre: 'Frente Norteño', emoji: '🌵', ideo: -0.3, votos: 2.5, region: 'norte' },
    { id: 'litoral', nombre: 'Movimiento Litoraleño', emoji: '🌊', ideo: 0.1, votos: 2, region: 'litoral' },
  ];

  // Opciones visuales del partido propio.
  R.COLORES_PARTIDO = ['#e8504f', '#f28c28', '#e9b200', '#3aa655', '#13a89e', '#2f7fd0', '#5b5bd6', '#a24bc6', '#e0569b', '#6aa31a'];
  R.SIMBOLOS_PARTIDO = ['☀️', '🧉', '🐎', '🌾', '🔥', '⭐', '🐄', '🕊️', '🌳', '🏔️', '⚓', '🦅', '🐆', '🌻', '💡', '🛠️'];

  const PRE = ['Movimiento', 'Partido', 'Frente', 'Unión', 'Fuerza', 'Coalición', 'Encuentro', 'Bloque'];
  const POST = ['Celeste', 'del Mate', 'Federal', 'de la Esperanza', 'Patria Grande', 'del Sol', 'Renovador', 'de los Laburantes',
    'Productivo', 'Futuro', 'Vecinal', 'de la Gente', 'Nuevo Rumbo', 'del Asado', 'Argentino', 'Despierta'];
  R.nombrePartidoAzar = function () {
    const a = PRE[Math.floor(Math.random() * PRE.length)];
    const b = POST[Math.floor(Math.random() * POST.length)];
    const nombre = a + ' ' + b;
    const sigla = nombre.split(' ').filter((w) => w.length > 2 && w[0] === w[0].toUpperCase()).map((w) => w[0]).join('').slice(0, 4);
    return { nombre, sigla: sigla.length >= 2 ? sigla : nombre.slice(0, 3).toUpperCase() };
  };

  const NOMBRES = ['Lucía', 'Martín', 'Sofía', 'Diego', 'Carla', 'Javier', 'Valentina', 'Gustavo', 'Paula', 'Facundo', 'Romina',
    'Hernán', 'Mariela', 'Pablo', 'Agustina', 'Ezequiel', 'Florencia', 'Matías', 'Julieta', 'Rodrigo'];
  const APELLIDOS = ['Benítez', 'Ruiz Díaz', 'Ferreyra', 'Acosta', 'Medina', 'Godoy', 'Sosa', 'Correa', 'Villalba', 'Paz',
    'Castro', 'Rojas', 'Luna', 'Aguirre', 'Peralta', 'Domínguez', 'Ledesma', 'Molina', 'Ríos', 'Quiroga'];
  R.nombreLiderAzar = function () {
    return NOMBRES[Math.floor(Math.random() * NOMBRES.length)] + ' ' + APELLIDOS[Math.floor(Math.random() * APELLIDOS.length)];
  };
  R.avatarAzar = function () {
    const r = (n) => Math.floor(Math.random() * n);
    return { piel: r(5), pelo: r(6), colorPelo: r(6), anteojos: r(3) === 0 ? r(2) + 1 : 0, barba: r(3) === 0 ? r(2) + 1 : 0, ropa: r(5) };
  };

  // Datos del partido del jugador como «partido» para el Congreso y las elecciones.
  R.partidoInfo = function (s, id) {
    if (id === 'YO') return { id: 'YO', sigla: s.partido.sigla, nombre: s.partido.nombre, color: s.partido.color, simbolo: s.partido.simbolo, ideo: s.partido.ideo, bandera: s.partido.bandera };
    return R.PARTIDOS[id];
  };
})(globalThis.R = globalThis.R || {});
