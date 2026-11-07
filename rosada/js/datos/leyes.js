// Leyes que podés mandar al Congreso. ideo: −1 (Estado presente) … +1 (mercado). polemica: 0 … 1.
// ef: efecto inmediato (con las claves de gobierno). perm: efecto que queda para siempre; lo económico
// (empleo, crecimiento, exportaciones, recaudación, calidad) madura de a poco en `madura` meses (18 si no dice).
// mayoria: 'simple' (mitad + 1 de cada cámara) o 'dos_tercios'. dnu: se puede sacar por decreto.
(function (R) {
  'use strict';

  const subirNivel = (area, d) => (s) => {
    s.eco.niveles[area] = R.clamp(R.round(s.eco.niveles[area] + d, 2), R.eco.NIVEL_MIN, R.eco.NIVEL_MAX);
    s.eco.nivelesInicioMes[area] = s.eco.niveles[area];
  };

  R.LEYES = [
    { id: 'reforma_laboral', emoji: '📋', nombre: 'Reforma laboral', desc: 'Contratar y despedir más fácil', ideo: 0.7, polemica: 0.6, dnu: true,
      ef: { trabajadores: -10, empresarios: 10 }, perm: { bonusEmpleo: 1.2, bonusCrec: 0.3, bonusGrupo: { trabajadores: -3, empresarios: 4 } }, madura: 18 },
    { id: 'salario_minimo', emoji: '💵', nombre: 'Suba del salario mínimo', desc: 'Que nadie gane menos de lo justo', ideo: -0.5, polemica: 0.3, dnu: true,
      ef: { trabajadores: 9, humildes: 4, empresarios: -6, inflacion: 0.3 }, perm: { bonusEmpleo: -0.4, bonusGrupo: { trabajadores: 3 } }, madura: 12 },
    { id: 'reforma_previsional', emoji: '👴', nombre: 'Reforma jubilatoria', desc: 'Se jubilan más tarde', ideo: 0.6, polemica: 0.75,
      ef: { jubilados: -9, media: -3, empresarios: 4, riesgo: -100 }, hacer: subirNivel('jubilaciones', -0.1), nota: 'Baja el gasto en jubilaciones sin que se note de golpe' },
    { id: 'inversiones', emoji: '🏭', nombre: 'Ley de grandes inversiones', desc: 'Beneficios para invertir', ideo: 0.5, polemica: 0.35, dnu: true,
      ef: { empresarios: 8, riesgo: -60 }, perm: { bonusCrec: 0.5, bonusExpo: 0.05 }, madura: 24 },
    { id: 'bcra', emoji: '🏦', nombre: 'Banco Central independiente', desc: 'Nadie lo usa para imprimir', ideo: 0.4, polemica: 0.3,
      ef: { empresarios: 5, riesgo: -80 }, nota: 'Baja la inflación todos los meses' },
    { id: 'dolarizacion', emoji: '💵', nombre: 'Dolarización', desc: 'Chau peso, hola dólar', ideo: 0.9, polemica: 0.9,
      requiere: (s) => s.eco.reservas >= 35, requiereTxt: 'Necesitás US$ 35 mil M de reservas',
      ef: { media: 5, trabajadores: -6, humildes: -4, campo: 3, riesgo: -150 },
      hacer: (s) => { s.eco.cepo = false; s.eco.brecha = 0; s.eco.financiamiento = 2; s.eco.reservas -= 20; },
      nota: 'La inflación baja muchísimo, pero ya no podés emitir nunca más' },
    { id: 'universidades', emoji: '🎓', nombre: 'Financiamiento universitario', desc: 'Más plata para las universidades', ideo: -0.4, polemica: 0.3,
      ef: { media: 7 }, hacer: subirNivel('educacion', 0.15) },
    { id: 'seguridad', emoji: '👮', nombre: 'Ley de seguridad', desc: 'Más policías y cárceles', ideo: 0.4, polemica: 0.3, dnu: true,
      ef: { media: 5 }, perm: { bonusCalidad: { seguridad: 12 } }, madura: 12 },
    { id: 'imputabilidad', emoji: '⚖️', nombre: 'Bajar la edad de imputabilidad', desc: 'Menores que delinquen, a juicio', ideo: 0.6, polemica: 0.6,
      ef: { media: 6, humildes: -5 }, perm: { bonusCalidad: { seguridad: 5 } }, madura: 12 },
    { id: 'servicio_militar', emoji: '🪖', nombre: 'Servicio militar obligatorio', desc: 'Los jóvenes, a los cuarteles', ideo: 0.5, polemica: 0.8,
      ef: { media: -4, humildes: -3 }, perm: { bonusCalidad: { defensa: 20 } }, madura: 24, nota: 'Mucho más poder militar' },
    { id: 'ciencia', emoji: '🔬', nombre: 'Ley de ciencia', desc: 'Más plata para investigar', ideo: -0.2, polemica: 0.1,
      ef: { media: 3 }, hacer: subirNivel('ciencia', 0.3) },
    { id: 'retenciones_cero', emoji: '🌾', nombre: 'Retenciones cero', desc: 'El campo no paga más retenciones', ideo: 0.7, polemica: 0.5,
      ef: { campo: 15, humildes: -2 }, hacer: (s) => { s.eco.retenciones = 0; s.eco.retencionesInicioMes = 0; } },
    { id: 'fortunas', emoji: '💰', nombre: 'Impuesto a las grandes fortunas', desc: 'Que paguen los que más tienen', ideo: -0.8, polemica: 0.6,
      ef: { empresarios: -10, humildes: 5, trabajadores: 3 }, perm: { bonusRecauda: 0.4, bonusCrec: -0.2 }, madura: 12 },
    { id: 'privatizar', emoji: '🏷️', nombre: 'Privatizar empresas públicas', desc: 'Vender empresas del Estado', ideo: 0.8, polemica: 0.7,
      ef: { reservas: 6, trabajadores: -6, empresarios: 6, riesgo: -60 }, perm: { bonusCrec: 0.2 }, madura: 24 },
    { id: 'estatizar', emoji: '⛽', nombre: 'Estatizar la energía', desc: 'Petróleo y luz, del Estado', ideo: -0.8, polemica: 0.7,
      ef: { trabajadores: 5, empresarios: -10, riesgo: 120 }, perm: { bonusExpo: -0.03, bonusCrec: -0.2, bonusGrupo: { trabajadores: 2 } }, madura: 18 },
    { id: 'alquileres', emoji: '🏠', nombre: 'Ley de alquileres', desc: 'Contratos largos y con tope', ideo: -0.3, polemica: 0.4, dnu: true,
      ef: { media: 4, empresarios: -2 } },
    { id: 'litio', emoji: '🔋', nombre: 'Ley del litio', desc: 'Reglas claras para la minería', ideo: 0.2, polemica: 0.3,
      ef: { empresarios: 4 }, perm: { bonusExpo: 0.06 }, madura: 24 },
    { id: 'humedales', emoji: '🌱', nombre: 'Ley de humedales', desc: 'Proteger ríos y lagunas', ideo: -0.3, polemica: 0.4,
      ef: { media: 4, campo: -8 } },
    { id: 'boleta_unica', emoji: '🗳️', nombre: 'Boleta única', desc: 'Votar más fácil y sin trampa', ideo: 0, polemica: 0.1,
      ef: { media: 3, escandalo: -1 } },
    { id: 'ficha_limpia', emoji: '🧼', nombre: 'Ficha limpia', desc: 'Condenados no pueden ser candidatos', ideo: 0.2, polemica: 0.3,
      ef: { media: 5, escandalo: -2 } },
    { id: 'vivienda', emoji: '🏘️', nombre: 'Plan nacional de vivienda', desc: 'Casas para los que no tienen', ideo: -0.4, polemica: 0.2,
      costo: { gasto: 3 }, ef: { humildes: 8, trabajadores: 4, infra: 5 } },
    { id: 'fmi', emoji: '🌐', nombre: 'Acuerdo con el FMI', desc: 'Dólares a cambio de ajuste', ideo: 0.5, polemica: 0.6,
      requiere: (s) => s.eco.reservas < 22, requiereTxt: 'Solo si las reservas están bajas',
      ef: { reservas: 20, deuda: 6, riesgo: -250, humildes: -5, trabajadores: -5, empresarios: 5 } },
    { id: 're_reeleccion', emoji: '👑', nombre: 'Reforma constitucional', desc: 'Poder ser reelecto otra vez', ideo: 0, polemica: 1, mayoria: 'dos_tercios',
      requiere: (s) => s.gob.mandato >= 2, requiereTxt: 'Solo en tu segundo mandato',
      ef: { media: -6, escandalo: 3 }, nota: 'Te deja buscar un tercer mandato' },
  ];
  R.LEY = Object.fromEntries(R.LEYES.map((l) => [l.id, l]));

  // Partido de cada gobernación al empezar (como en 2026). Las personas son inventadas.
  R.GOBERNADORES_INICIALES = {
    JUJ: 'PROV', SAL: 'PROV', FOR: 'MNP', CAT: 'MNP', TUC: 'MNP', CHA: 'UCF', MIS: 'PROV', LRJ: 'MNP', SGO: 'MNP', SFE: 'PROV',
    COR: 'UCF', SJU: 'PROV', SLU: 'PROV', CBA: 'PROV', ERI: 'AR', MZA: 'UCF', LPA: 'MNP', BUE: 'MNP', CABA: 'AR', NQN: 'PROV',
    RNE: 'PROV', CHU: 'PROV', SCR: 'PROV', TDF: 'MNP',
  };
  R.PEDIDOS = {
    obras: { emoji: '🏗️', txt: 'una ruta nueva' },
    fondos: { emoji: '💸', txt: 'fondos para sueldos' },
    visita: { emoji: '🤝', txt: 'que lo visites' },
  };
})(globalThis.R = globalThis.R || {});
