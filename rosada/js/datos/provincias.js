// Los 24 distritos. padron = % del padrón nacional; dip = diputados; sen = grupo de renovación del Senado
// (A vota en 2027, B en 2029, C en 2031); lean = inclinación económica (−1 Estado presente … +1 mercado libre);
// hex = [columna, fila] en el mapa de fichas (las filas impares se corren media ficha a la derecha).
(function (R) {
  'use strict';

  R.PROVINCIAS = [
    { id: 'JUJ', nombre: 'Jujuy', padron: 1.7, dip: 6, sen: 'B', lean: 0.0, hex: [1, 0], region: 'norte' },
    { id: 'SAL', nombre: 'Salta', padron: 3.0, dip: 7, sen: 'C', lean: -0.1, hex: [2, 0], region: 'norte' },
    { id: 'FOR', nombre: 'Formosa', padron: 1.4, dip: 5, sen: 'B', lean: -0.7, hex: [3, 0], region: 'norte' },
    { id: 'CAT', nombre: 'Catamarca', padron: 0.9, dip: 5, sen: 'A', lean: -0.4, hex: [1, 1], region: 'norte' },
    { id: 'TUC', nombre: 'Tucumán', padron: 3.6, dip: 9, sen: 'A', lean: -0.3, hex: [2, 1], region: 'norte' },
    { id: 'CHA', nombre: 'Chaco', padron: 2.6, dip: 7, sen: 'C', lean: -0.3, hex: [3, 1], region: 'litoral' },
    { id: 'MIS', nombre: 'Misiones', padron: 2.7, dip: 7, sen: 'B', lean: -0.1, hex: [4, 1], region: 'litoral' },
    { id: 'LRJ', nombre: 'La Rioja', padron: 0.9, dip: 5, sen: 'B', lean: -0.5, hex: [1, 2], region: 'norte' },
    { id: 'SGO', nombre: 'Santiago del Estero', corto: 'Santiago', padron: 2.3, dip: 7, sen: 'C', lean: -0.7, hex: [2, 2], region: 'norte' },
    { id: 'SFE', nombre: 'Santa Fe', padron: 8.0, dip: 19, sen: 'A', lean: 0.2, hex: [3, 2], region: 'centro' },
    { id: 'COR', nombre: 'Corrientes', padron: 2.5, dip: 7, sen: 'A', lean: 0.2, hex: [4, 2], region: 'litoral' },
    { id: 'SJU', nombre: 'San Juan', padron: 1.7, dip: 6, sen: 'B', lean: 0.1, hex: [0, 3], region: 'cuyo' },
    { id: 'SLU', nombre: 'San Luis', padron: 1.2, dip: 5, sen: 'B', lean: 0.3, hex: [1, 3], region: 'cuyo' },
    { id: 'CBA', nombre: 'Córdoba', padron: 8.7, dip: 18, sen: 'A', lean: 0.6, hex: [2, 3], region: 'centro' },
    { id: 'ERI', nombre: 'Entre Ríos', padron: 3.2, dip: 9, sen: 'C', lean: 0.2, hex: [3, 3], region: 'litoral' },
    { id: 'MZA', nombre: 'Mendoza', padron: 4.3, dip: 10, sen: 'A', lean: 0.5, hex: [1, 4], region: 'cuyo' },
    { id: 'LPA', nombre: 'La Pampa', padron: 0.9, dip: 5, sen: 'A', lean: -0.1, hex: [2, 4], region: 'centro' },
    { id: 'BUE', nombre: 'Buenos Aires', padron: 37.0, dip: 70, sen: 'B', lean: -0.2, hex: [3, 4], region: 'amba' },
    { id: 'CABA', nombre: 'Ciudad de Buenos Aires', corto: 'CABA', padron: 7.4, dip: 25, sen: 'C', lean: 0.5, hex: [4, 4], region: 'amba' },
    { id: 'NQN', nombre: 'Neuquén', padron: 1.6, dip: 5, sen: 'C', lean: 0.0, hex: [0, 5], region: 'patagonia' },
    { id: 'RNE', nombre: 'Río Negro', padron: 1.7, dip: 5, sen: 'C', lean: 0.0, hex: [1, 5], region: 'patagonia' },
    { id: 'CHU', nombre: 'Chubut', padron: 1.3, dip: 5, sen: 'A', lean: 0.0, hex: [1, 6], region: 'patagonia' },
    { id: 'SCR', nombre: 'Santa Cruz', padron: 0.8, dip: 5, sen: 'B', lean: -0.3, hex: [0, 7], region: 'patagonia' },
    { id: 'TDF', nombre: 'Tierra del Fuego', corto: 'T. del Fuego', padron: 0.4, dip: 5, sen: 'C', lean: -0.1, hex: [1, 8], region: 'patagonia' },
  ];

  // Normalizar el padrón para que sume exactamente 100.
  const total = R.PROVINCIAS.reduce((a, p) => a + p.padron, 0);
  R.PROVINCIAS.forEach((p) => {
    p.padron = (p.padron * 100) / total;
    p.corto = p.corto || p.nombre;
  });
  R.PROV = Object.fromEntries(R.PROVINCIAS.map((p) => [p.id, p]));

  R.REGIONES = {
    norte: { nombre: 'Norte', emoji: '🌵' },
    litoral: { nombre: 'Litoral', emoji: '🌊' },
    centro: { nombre: 'Centro', emoji: '🌾' },
    cuyo: { nombre: 'Cuyo', emoji: '🍇' },
    amba: { nombre: 'AMBA', emoji: '🏙️' },
    patagonia: { nombre: 'Patagonia', emoji: '🏔️' },
  };

  // Qué grupo del Senado se renueva cada año electoral.
  R.SENADO_GRUPO = { 2027: 'A', 2029: 'B', 2031: 'C', 2033: 'A', 2035: 'B', 2037: 'C' };

  // Malvinas: ficha especial del mapa (no vota).
  R.MALVINAS = { id: 'MLV', nombre: 'Islas Malvinas', corto: 'Malvinas', hex: [3, 7] };
})(globalThis.R = globalThis.R || {});
