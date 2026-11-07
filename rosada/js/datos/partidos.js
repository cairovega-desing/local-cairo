// Partidos rivales (ficticios), figuras para sumar a la campaña, aliados chicos y generadores de nombres.
(function (R) {
  'use strict';

  // ideo: −1 Estado presente … +1 mercado libre. base: intención de voto nacional al empezar.
  // fuerte: bonus por provincia. debate: estilo preferido en los debates.
  R.PARTIDOS = {
    MNP: {
      id: 'MNP', sigla: 'MNP', nombre: 'Movimiento Nacional Popular', color: '#2f7fd0', simbolo: '✌️', ideo: -0.55, base: 31,
      candidato: { nombre: 'Ramón Arrieta', avatar: { piel: 2, pelo: 1, colorPelo: 4, anteojos: 0, barba: 1, ropa: 0 } },
      debate: 'emocion',
      fuerte: { FOR: 0.35, SGO: 0.4, LRJ: 0.3, CAT: 0.2, BUE: 0.15, TUC: 0.25, SCR: 0.25, CHA: 0.15, MIS: 0.1 },
    },
    PL: {
      id: 'PL', sigla: 'PL', nombre: 'Partido de la Libertad', color: '#7c3fc4', simbolo: '⚡', ideo: 0.9, base: 30,
      candidato: { nombre: 'Tomás Kessler', avatar: { piel: 0, pelo: 4, colorPelo: 1, anteojos: 0, barba: 0, ropa: 3 } },
      debate: 'ataque',
      fuerte: { CBA: 0.25, MZA: 0.2, SLU: 0.15, SJU: 0.15, SAL: 0.1, TUC: 0.1, CABA: 0.05 },
      oficialismo: true,
    },
    AR: {
      id: 'AR', sigla: 'AR', nombre: 'Alianza Republicana', color: '#f0b90b', simbolo: '🏛️', ideo: 0.45, base: 15,
      candidato: { nombre: 'Valeria Montes', avatar: { piel: 0, pelo: 2, colorPelo: 3, anteojos: 1, barba: 0, ropa: 2 } },
      debate: 'datos',
      fuerte: { CABA: 0.5, CBA: 0.15, ERI: 0.2, SFE: 0.1, MZA: 0.15 },
    },
    UCF: {
      id: 'UCF', sigla: 'UCF', nombre: 'Unión Cívica Federal', color: '#d6453d', simbolo: '📜', ideo: 0.05, base: 9,
      candidato: { nombre: 'Elena Cabral', avatar: { piel: 1, pelo: 3, colorPelo: 5, anteojos: 2, barba: 0, ropa: 1 } },
      debate: 'datos',
      fuerte: { COR: 0.6, JUJ: 0.45, MZA: 0.3, CHU: 0.15, SFE: 0.15, CAT: 0.1 },
    },
    FT: {
      id: 'FT', sigla: 'FT', nombre: 'Frente de Trabajadores', color: '#a51c30', simbolo: '✊', ideo: -1, base: 4,
      candidato: { nombre: 'Nicolás Ferro', avatar: { piel: 1, pelo: 5, colorPelo: 0, anteojos: 1, barba: 2, ropa: 4 } },
      debate: 'ataque',
      fuerte: { NQN: 0.45, JUJ: 0.35, CABA: 0.2, SFE: 0.1, SAL: 0.1 },
    },
    PROV: {
      id: 'PROV', sigla: 'Prov.', nombre: 'Partidos provinciales', color: '#8a96a8', simbolo: '🗺️', ideo: 0.1, base: 0,
      noCompite: true,
    },
  };
  R.RIVALES = ['MNP', 'PL', 'AR', 'UCF', 'FT'];

  // Bancas que NO se renuevan en 2027 (elegidas en 2025 y 2023).
  R.CONGRESO_INICIAL = {
    diputados: { PL: 52, MNP: 47, AR: 11, UCF: 10, FT: 3, PROV: 4 }, // 127
    senado: { MNP: 20, PL: 13, AR: 4, UCF: 7, PROV: 4 }, // 48 (grupos B y C)
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
    if (id === 'YO') return { id: 'YO', sigla: s.partido.sigla, nombre: s.partido.nombre, color: s.partido.color, simbolo: s.partido.simbolo, ideo: s.partido.ideo };
    return R.PARTIDOS[id];
  };
})(globalThis.R = globalThis.R || {});
