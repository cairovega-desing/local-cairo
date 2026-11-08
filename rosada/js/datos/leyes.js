// Leyes que podés mandar al Congreso. ideo: −1 (Estado presente) … +1 (mercado). polemica: 0 … 1.
// cat: tema (para los filtros). ef: lo que pasa al firmarla (la gente reacciona, algún golpe a la economía).
// perm: lo que cambia en el motor para siempre. Lo económico madura de a poco: `madura` meses «de la vida real»
// (18 si no dice), que el juego acelera con R.eco.RITMO (llega en un tercio del tiempo y pega más fuerte):
//   bonusCrec (crecimiento), bonusEmpleo (baja el desempleo), bonusExpo (exportaciones), bonusImpo (importaciones),
//   bonusRecauda (recaudación, % PBI), bonusPrecios (inflación por mes), bonusSalario (sueldo real por mes),
//   bonusRiesgo (riesgo país), bonusCalidad {área}. bonusGrupo {grupo}: cómo lo siente cada grupo, desde ya.
// hacer: cambios en el presupuesto (subirNivel) o en las perillas de la economía.
// Cada ideología tiene su camino para hacer crecer al país, con costos y beneficios de verdad.
// mayoria: 'simple' (mitad + 1 de cada cámara) o 'dos_tercios'. dnu: se puede sacar por decreto.
(function (R) {
  'use strict';

  const subirNivel = (area, d) => (s) => {
    s.eco.niveles[area] = R.clamp(R.round(s.eco.niveles[area] + d, 2), R.eco.NIVEL_MIN, R.eco.NIVEL_MAX);
    s.eco.nivelesInicioMes[area] = s.eco.niveles[area];
  };
  const varias = (...fs) => (s) => fs.forEach((f) => f(s));

  R.TEMAS_LEY = [
    { id: 'economia', emoji: '💰', nombre: 'Economía' },
    { id: 'trabajo', emoji: '👷', nombre: 'Trabajo' },
    { id: 'produccion', emoji: '🏭', nombre: 'Producción' },
    { id: 'social', emoji: '❤️', nombre: 'Social' },
    { id: 'seguridad', emoji: '👮', nombre: 'Seguridad' },
    { id: 'instituciones', emoji: '🏛️', nombre: 'Instituciones' },
  ];
  R.IDEAS_LEY = [
    { id: 'estado', emoji: '🤲', nombre: 'Estado presente' },
    { id: 'centro', emoji: '⚖️', nombre: 'Centro' },
    { id: 'mercado', emoji: '💼', nombre: 'Mercado' },
  ];
  R.ideaLey = (ley) => (ley.ideo <= -0.2 ? 'estado' : ley.ideo >= 0.2 ? 'mercado' : 'centro');

  R.LEYES = [
    // ── 💰 Economía ──
    { id: 'inversiones', cat: 'economia', emoji: '🏭', nombre: 'Ley de grandes inversiones', desc: 'Beneficios para invertir', ideo: 0.5, polemica: 0.35, dnu: true, madura: 24,
      ef: { empresarios: 8, riesgo: -60 }, perm: { bonusCrec: 0.5, bonusExpo: 0.05, bonusEmpleo: 0.3, bonusRecauda: -0.1 } },
    { id: 'reforma_tributaria', cat: 'economia', emoji: '🧾', nombre: 'Reforma tributaria', desc: 'Menos impuestos que frenan la producción', ideo: 0.5, polemica: 0.3, madura: 18,
      ef: { empresarios: 7, media: 3 }, perm: { bonusCrec: 0.45, bonusEmpleo: 0.25, bonusRecauda: -0.3 } },
    { id: 'desregulacion', cat: 'economia', emoji: '✂️', nombre: 'Desregulación económica', desc: 'Menos trámites y reglas para producir', ideo: 0.8, polemica: 0.5, dnu: true, madura: 18,
      ef: { empresarios: 8, trabajadores: -3 }, perm: { bonusCrec: 0.4, bonusPrecios: -0.03, bonusEmpleo: 0.2 } },
    { id: 'apertura', cat: 'economia', emoji: '🚢', nombre: 'Apertura de importaciones', desc: 'Bajar aranceles: importar más barato', ideo: 0.7, polemica: 0.5, dnu: true, madura: 18,
      ef: { media: 5, trabajadores: -6, empresarios: -2 }, perm: { bonusImpo: 0.06, bonusPrecios: -0.07, bonusExpo: 0.03, bonusCrec: 0.2, bonusEmpleo: -0.4 } },
    { id: 'achicar_estado', cat: 'economia', emoji: '🪓', nombre: 'Achicar el Estado', desc: 'Menos ministerios y empleados públicos', ideo: 0.8, polemica: 0.6, dnu: true, madura: 6,
      ef: { media: 3, trabajadores: -5, empresarios: 4, desempleo: 0.4 }, perm: { bonusRecauda: 0.4, bonusRiesgo: -30 } },
    { id: 'bcra', cat: 'economia', emoji: '🏦', nombre: 'Banco Central independiente', desc: 'Nadie lo usa para imprimir', ideo: 0.4, polemica: 0.3,
      ef: { empresarios: 5, riesgo: -80 }, nota: 'Baja la inflación todos los meses' },
    { id: 'regla_fiscal', cat: 'economia', emoji: '⚖️', nombre: 'Responsabilidad fiscal', desc: 'Prohibido gastar más de lo que entra', ideo: 0.3, polemica: 0.35, madura: 12,
      ef: { empresarios: 4, riesgo: -100 }, perm: { bonusRiesgo: -70, bonusPrecios: -0.03 } },
    { id: 'competencia_monedas', cat: 'economia', emoji: '💱', nombre: 'Competencia de monedas', desc: 'Podés usar dólares para todo', ideo: 0.9, polemica: 0.6, madura: 12,
      ef: { media: 4, empresarios: 4, riesgo: -40 }, perm: { bonusPrecios: -0.05, bonusRiesgo: -20, bonusExpo: 0.01 }, hacer: (s) => { s.eco.cepo = false; } },
    { id: 'dolarizacion', cat: 'economia', emoji: '💵', nombre: 'Dolarización', desc: 'Chau peso, hola dólar', ideo: 0.9, polemica: 0.9,
      requiere: (s) => s.eco.reservas >= 35, requiereTxt: 'Necesitás US$ 35 mil M de reservas',
      ef: { media: 5, trabajadores: -6, humildes: -4, campo: 3, riesgo: -150 },
      hacer: (s) => { s.eco.cepo = false; s.eco.brecha = 0; s.eco.financiamiento = 2; s.eco.reservas -= 20; },
      nota: 'La inflación baja muchísimo, pero ya no podés emitir nunca más' },
    { id: 'privatizar', cat: 'economia', emoji: '🏷️', nombre: 'Privatizar empresas públicas', desc: 'Vender empresas del Estado', ideo: 0.8, polemica: 0.7, madura: 24,
      ef: { reservas: 6, trabajadores: -6, empresarios: 6, riesgo: -60 }, perm: { bonusCrec: 0.25, bonusRecauda: 0.1 } },
    { id: 'blanqueo', cat: 'economia', emoji: '💵', nombre: 'Blanqueo de capitales', desc: 'Traé tus dólares sin multa', ideo: 0.4, polemica: 0.4, madura: 6,
      ef: { reservas: 8, empresarios: 4, media: -2, escandalo: 1 }, perm: { bonusRecauda: 0.1, bonusCrec: 0.1 } },
    { id: 'fmi', cat: 'economia', emoji: '🌐', nombre: 'Acuerdo con el FMI', desc: 'Dólares a cambio de ajuste', ideo: 0.5, polemica: 0.6,
      requiere: (s) => s.eco.reservas < 22, requiereTxt: 'Solo si las reservas están bajas',
      ef: { reservas: 20, deuda: 6, riesgo: -250, humildes: -5, trabajadores: -5, empresarios: 5 } },
    { id: 'acuerdo_social', cat: 'economia', emoji: '🤝', nombre: 'Acuerdo económico y social', desc: 'Empresas y gremios pactan precios y sueldos', ideo: -0.1, polemica: 0.25, madura: 12,
      ef: { trabajadores: 4, empresarios: 3, media: 3, inflacion: -0.6 }, perm: { bonusPrecios: -0.06, bonusSalario: 0.02, bonusRiesgo: -20 } },
    { id: 'competencia', cat: 'economia', emoji: '🔍', nombre: 'Defensa de la competencia', desc: 'Multas a los que abusan con precios', ideo: 0, polemica: 0.2, madura: 12,
      ef: { media: 4, empresarios: -4 }, perm: { bonusPrecios: -0.04, bonusCrec: 0.05 } },
    { id: 'banco_desarrollo', cat: 'economia', emoji: '🏗️', nombre: 'Banco de desarrollo', desc: 'Créditos baratos para producir', ideo: -0.5, polemica: 0.3, madura: 18,
      ef: { trabajadores: 3, empresarios: 2 }, perm: { bonusCrec: 0.5, bonusEmpleo: 0.5, bonusRecauda: -0.1 } },
    { id: 'renta_financiera', cat: 'economia', emoji: '📉', nombre: 'Impuesto a la renta financiera', desc: 'Que paguen las ganancias de la timba', ideo: -0.4, polemica: 0.4, madura: 12,
      ef: { empresarios: -4, humildes: 2 }, perm: { bonusRecauda: 0.3, bonusRiesgo: 15 } },
    { id: 'fortunas', cat: 'economia', emoji: '💰', nombre: 'Impuesto a las grandes fortunas', desc: 'Que paguen los que más tienen', ideo: -0.8, polemica: 0.6, madura: 12,
      ef: { empresarios: -10, humildes: 5, trabajadores: 3 }, perm: { bonusRecauda: 0.45, bonusCrec: -0.1, bonusRiesgo: 20 } },
    { id: 'control_precios', cat: 'economia', emoji: '🏷️', nombre: 'Control de precios', desc: 'Precios máximos para la canasta', ideo: -0.8, polemica: 0.7, madura: 18,
      ef: { humildes: 6, media: 5, empresarios: -12, inflacion: -1.0 }, perm: { bonusPrecios: 0.03, bonusCrec: -0.15, bonusGrupo: { empresarios: -3 } },
      nota: 'Alivio rápido; si dura mucho, faltan productos' },
    { id: 'banca_publica', cat: 'economia', emoji: '🏛️', nombre: 'Nacionalizar los bancos', desc: 'Los ahorros, a créditos para producir', ideo: -1, polemica: 0.95, madura: 24,
      ef: { empresarios: -14, media: -4, trabajadores: 3, riesgo: 200 }, perm: { bonusCrec: 0.8, bonusEmpleo: 0.8, bonusRiesgo: 60, bonusPrecios: 0.03 } },

    // ── 👷 Trabajo ──
    { id: 'reforma_laboral', cat: 'trabajo', emoji: '📋', nombre: 'Reforma laboral', desc: 'Contratar y despedir más fácil', ideo: 0.7, polemica: 0.6, dnu: true, madura: 18,
      ef: { trabajadores: -10, empresarios: 10 }, perm: { bonusEmpleo: 1.2, bonusCrec: 0.3, bonusRecauda: 0.15, bonusGrupo: { trabajadores: -3, empresarios: 4 } } },
    { id: 'reforma_sindical', cat: 'trabajo', emoji: '📢', nombre: 'Reforma sindical', desc: 'Menos poder para los gremios', ideo: 0.8, polemica: 0.7, madura: 12,
      ef: { trabajadores: -8, empresarios: 8 }, perm: { bonusEmpleo: 0.3, bonusCrec: 0.1, bonusSalario: -0.02, bonusGrupo: { trabajadores: -2 } } },
    { id: 'monotributo', cat: 'trabajo', emoji: '🧾', nombre: 'Monotributo simple', desc: 'Pagar impuestos fácil y en blanco', ideo: 0.15, polemica: 0.1, madura: 12,
      ef: { trabajadores: 2, media: 2 }, perm: { bonusRecauda: 0.15, bonusEmpleo: 0.3 } },
    { id: 'pymes', cat: 'trabajo', emoji: '🧰', nombre: 'Ley pyme', desc: 'Menos impuestos para empresas chicas', ideo: 0.1, polemica: 0.15, madura: 18,
      ef: { empresarios: 6, trabajadores: 2, media: 2 }, perm: { bonusEmpleo: 0.6, bonusCrec: 0.25, bonusRecauda: -0.2 } },
    { id: 'salario_minimo', cat: 'trabajo', emoji: '💵', nombre: 'Suba del salario mínimo', desc: 'Que nadie gane menos de lo justo', ideo: -0.5, polemica: 0.3, dnu: true, madura: 12,
      ef: { trabajadores: 9, humildes: 4, empresarios: -6, inflacion: 0.3, crec: 0.4 }, perm: { bonusSalario: 0.04, bonusEmpleo: -0.3, bonusGrupo: { trabajadores: 3 } } },
    { id: 'jornada', cat: 'trabajo', emoji: '⏰', nombre: 'Semana de 40 horas', desc: 'Trabajar menos con el mismo sueldo', ideo: -0.6, polemica: 0.5, madura: 12,
      ef: { trabajadores: 12, empresarios: -9, media: 3 }, perm: { bonusEmpleo: 0.4, bonusCrec: -0.15, bonusPrecios: 0.02, bonusGrupo: { trabajadores: 4 } } },
    { id: 'cooperativas', cat: 'trabajo', emoji: '🤝', nombre: 'Trabajo cooperativo', desc: 'Cooperativas de trabajo para desocupados', ideo: -0.6, polemica: 0.3, madura: 12,
      ef: { humildes: 7, trabajadores: 3, empresarios: -2 }, perm: { bonusEmpleo: 0.8, bonusCrec: 0.05, bonusRecauda: -0.1 } },

    // ── 🏭 Producción ──
    { id: 'retenciones_cero', cat: 'produccion', emoji: '🌾', nombre: 'Retenciones cero', desc: 'El campo no paga más retenciones', ideo: 0.7, polemica: 0.5, madura: 24,
      ef: { campo: 15, humildes: -2 }, perm: { bonusExpo: 0.03, bonusCrec: 0.25, bonusRecauda: 0.3 },
      hacer: (s) => { s.eco.retenciones = 0; s.eco.retencionesInicioMes = 0; }, nota: 'Recaudás menos ya; en unos meses crece la cosecha' },
    { id: 'vaca_muerta', cat: 'produccion', emoji: '🛢️', nombre: 'Régimen de hidrocarburos', desc: 'Más inversión en Vaca Muerta', ideo: 0.3, polemica: 0.35, madura: 24,
      ef: { empresarios: 5, trabajadores: 2, media: -2 }, perm: { bonusExpo: 0.08, bonusCrec: 0.35, bonusRecauda: 0.05 } },
    { id: 'glaciares', cat: 'produccion', emoji: '⛰️', nombre: 'Reforma de glaciares', desc: 'Minería cerca de la cordillera', ideo: 0.6, polemica: 0.6, madura: 24,
      ef: { empresarios: 5, media: -5 }, perm: { bonusExpo: 0.05, bonusCrec: 0.2 } },
    { id: 'litio', cat: 'produccion', emoji: '🔋', nombre: 'Ley del litio', desc: 'Reglas claras para la minería', ideo: 0.15, polemica: 0.3, madura: 24,
      ef: { empresarios: 4 }, perm: { bonusExpo: 0.06, bonusCrec: 0.15 } },
    { id: 'conocimiento', cat: 'produccion', emoji: '💻', nombre: 'Economía del conocimiento', desc: 'Software y servicios para exportar', ideo: 0.1, polemica: 0.15, madura: 24,
      ef: { media: 4, empresarios: 3 }, perm: { bonusExpo: 0.04, bonusEmpleo: 0.3, bonusCrec: 0.25, bonusRecauda: -0.08 } },
    { id: 'renovables', cat: 'produccion', emoji: '🌞', nombre: 'Energías renovables', desc: 'Sol y viento para producir energía', ideo: -0.1, polemica: 0.1, madura: 24,
      ef: { media: 4 }, perm: { bonusExpo: 0.02, bonusPrecios: -0.02, bonusCrec: 0.15, bonusEmpleo: 0.2 } },
    { id: 'ciencia', cat: 'produccion', emoji: '🔬', nombre: 'Ley de ciencia', desc: 'Más plata para investigar', ideo: -0.15, polemica: 0.1,
      ef: { media: 3 }, hacer: subirNivel('ciencia', 0.3), nota: 'La ciencia empuja el crecimiento a largo plazo' },
    { id: 'trenes', cat: 'produccion', emoji: '🚆', nombre: 'Plan de trenes', desc: 'Volver a tener trenes de carga', ideo: -0.3, polemica: 0.2, madura: 24,
      ef: { trabajadores: 5, campo: 3 }, perm: { bonusCrec: 0.25, bonusExpo: 0.02, bonusEmpleo: 0.3, bonusCalidad: { infra: 8 } }, hacer: subirNivel('obras', 0.12) },
    { id: 'industria_nacional', cat: 'produccion', emoji: '🇦🇷', nombre: 'Compre nacional', desc: 'Proteger a la industria argentina', ideo: -0.6, polemica: 0.4, madura: 18,
      ef: { trabajadores: 6, empresarios: 3, media: -3 }, perm: { bonusImpo: -0.05, bonusEmpleo: 0.7, bonusCrec: 0.2, bonusPrecios: 0.05, bonusExpo: -0.02 } },
    { id: 'estatizar', cat: 'produccion', emoji: '⛽', nombre: 'Estatizar la energía', desc: 'Petróleo y luz, del Estado', ideo: -0.8, polemica: 0.7, madura: 24,
      ef: { trabajadores: 5, humildes: 3, empresarios: -10, riesgo: 120 }, perm: { bonusPrecios: -0.04, bonusExpo: 0.02, bonusRecauda: 0.1, bonusRiesgo: 40, bonusGrupo: { trabajadores: 2 } } },
    { id: 'junta_granos', cat: 'produccion', emoji: '🌽', nombre: 'Junta Nacional de Granos', desc: 'El Estado compra y vende el grano', ideo: -0.9, polemica: 0.8, madura: 12,
      ef: { campo: -15, trabajadores: 3, reservas: 3 }, perm: { bonusRecauda: 0.35, bonusPrecios: -0.03, bonusExpo: -0.02, bonusRiesgo: 30 } },
    { id: 'humedales', cat: 'produccion', emoji: '🌱', nombre: 'Ley de humedales', desc: 'Proteger ríos y lagunas', ideo: -0.3, polemica: 0.4,
      ef: { media: 4, campo: -8 }, perm: { bonusExpo: -0.01, bonusCrec: 0.05, bonusGrupo: { media: 2 } }, nota: 'Más turismo y menos inundaciones' },

    // ── ❤️ Social ──
    { id: 'reforma_previsional', cat: 'social', emoji: '👴', nombre: 'Reforma jubilatoria', desc: 'Se jubilan más tarde', ideo: 0.6, polemica: 0.75, madura: 12,
      ef: { jubilados: -9, media: -3, empresarios: 4, riesgo: -100 }, perm: { bonusRiesgo: -40 }, hacer: subirNivel('jubilaciones', -0.1), nota: 'Baja el gasto en jubilaciones sin que se note de golpe' },
    { id: 'educacion_tecnica', cat: 'social', emoji: '🛠️', nombre: 'Escuelas técnicas', desc: 'Oficios para los jóvenes', ideo: 0, polemica: 0.05, madura: 24,
      ef: { media: 3, trabajadores: 3, empresarios: 2 }, perm: { bonusEmpleo: 0.4, bonusCrec: 0.15 }, hacer: subirNivel('educacion', 0.1) },
    { id: 'universidades', cat: 'social', emoji: '🎓', nombre: 'Financiamiento universitario', desc: 'Más plata para las universidades', ideo: -0.4, polemica: 0.3,
      ef: { media: 7 }, hacer: subirNivel('educacion', 0.15), nota: 'Más profesionales: más crecimiento a largo plazo' },
    { id: 'salud_publica', cat: 'social', emoji: '🏥', nombre: 'Sistema integrado de salud', desc: 'Salud pública para todos', ideo: -0.4, polemica: 0.4, madura: 18,
      ef: { humildes: 6, jubilados: 6, media: 2, empresarios: -3 }, perm: { bonusCalidad: { salud: 8 }, bonusEmpleo: 0.1 }, hacer: subirNivel('salud', 0.25) },
    { id: 'auh', cat: 'social', emoji: '👶', nombre: 'Más asignación por hijo', desc: 'Más plata para los chicos pobres', ideo: -0.5, polemica: 0.3, madura: 6,
      ef: { humildes: 9, media: -2 }, perm: { bonusCrec: 0.05 }, hacer: subirNivel('social', 0.2) },
    { id: 'movilidad', cat: 'social', emoji: '👵', nombre: 'Movilidad jubilatoria', desc: 'Jubilaciones que le ganen a la inflación', ideo: -0.5, polemica: 0.4, madura: 6,
      ef: { jubilados: 12, riesgo: 60 }, perm: { bonusRiesgo: 20 }, hacer: subirNivel('jubilaciones', 0.05) },
    { id: 'vivienda', cat: 'social', emoji: '🏘️', nombre: 'Plan nacional de vivienda', desc: 'Casas para los que no tienen', ideo: -0.4, polemica: 0.2, madura: 12,
      ef: { humildes: 8, trabajadores: 4 }, perm: { bonusEmpleo: 0.4, bonusCrec: 0.15, bonusCalidad: { infra: 3 } }, hacer: subirNivel('obras', 0.1) },
    { id: 'alquileres', cat: 'social', emoji: '🏠', nombre: 'Ley de alquileres', desc: 'Contratos largos y con tope', ideo: -0.3, polemica: 0.4, dnu: true,
      ef: { media: 4, empresarios: -2 }, perm: { bonusGrupo: { media: 1 } } },

    // ── 👮 Seguridad ──
    { id: 'seguridad', cat: 'seguridad', emoji: '👮', nombre: 'Ley de seguridad', desc: 'Más policías y cárceles', ideo: 0.4, polemica: 0.3, dnu: true, madura: 12,
      ef: { media: 5 }, perm: { bonusCalidad: { seguridad: 12 }, bonusCrec: 0.05 } },
    { id: 'imputabilidad', cat: 'seguridad', emoji: '⚖️', nombre: 'Bajar la edad de imputabilidad', desc: 'Menores que delinquen, a juicio', ideo: 0.6, polemica: 0.6, madura: 12,
      ef: { media: 6, humildes: -5 }, perm: { bonusCalidad: { seguridad: 5 } } },
    { id: 'narcotrafico', cat: 'seguridad', emoji: '🚨', nombre: 'Ley contra el narcotráfico', desc: 'Más jueces y control en fronteras', ideo: 0.15, polemica: 0.15, madura: 12,
      ef: { media: 5, humildes: 2 }, perm: { bonusCalidad: { seguridad: 8 } }, hacer: subirNivel('seguridad', 0.05) },
    { id: 'servicio_militar', cat: 'seguridad', emoji: '🪖', nombre: 'Servicio militar obligatorio', desc: 'Los jóvenes, a los cuarteles', ideo: 0.5, polemica: 0.8, madura: 24,
      ef: { media: -4, humildes: -3 }, perm: { bonusCalidad: { defensa: 20 } }, nota: 'Mucho más poder militar' },

    // ── 🏛️ Instituciones ──
    { id: 'boleta_unica', cat: 'instituciones', emoji: '🗳️', nombre: 'Boleta única', desc: 'Votar más fácil y sin trampa', ideo: 0, polemica: 0.1,
      ef: { media: 3, escandalo: -1 } },
    { id: 'ficha_limpia', cat: 'instituciones', emoji: '🧼', nombre: 'Ficha limpia', desc: 'Condenados no pueden ser candidatos', ideo: 0.15, polemica: 0.3,
      ef: { media: 5, escandalo: -2 } },
    { id: 'transparencia', cat: 'instituciones', emoji: '🔎', nombre: 'Ley de transparencia', desc: 'Todo gasto público, a la vista', ideo: 0, polemica: 0.1, madura: 12,
      ef: { media: 4, escandalo: -2 }, perm: { bonusRiesgo: -20, bonusRecauda: 0.05 } },
    { id: 're_reeleccion', cat: 'instituciones', emoji: '👑', nombre: 'Reforma constitucional', desc: 'Poder ser reelecto otra vez', ideo: 0, polemica: 1, mayoria: 'dos_tercios',
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
