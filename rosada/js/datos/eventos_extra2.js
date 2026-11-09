// Tercera tanda de noticias: más variedad para segundos mandatos y campañas largas.
(function (R) {
  'use strict';
  const rivalAzar = (s) => ({ rival: R.pick(s, R.RIVALES.slice(0, 4)) });
  const provAzar = (s) => ({ prov: R.pick(s, R.PROVINCIAS).id });

  R.ev.registrar([
    // ── Gobierno ──
    {
      id: 'g_gobernador_rebelde', fase: 'gobierno', peso: 2, repite: 12, vars: provAzar, dibujo: '🗺️ 😤 🚧',
      titular: 'El gobernador de {prov} te declara la guerra',
      opciones: [
        { txt: 'Mandarle fondos', costo: { gasto: 1 }, ef: { pc: 1 }, despues: (s, v) => { const g = s.gob.gobernadores[v.prov]; g.rel = R.clamp(g.rel + 20, 0, 100); }, res: 'Paz con la provincia 🤝' },
        { txt: 'Visitar la provincia', costo: { pc: 1 }, ef: { todos: 1 }, despues: (s, v) => { const g = s.gob.gobernadores[v.prov]; g.rel = R.clamp(g.rel + 8, 0, 100); }, res: 'Mate con el gobernador 🧉' },
        { txt: 'Cortarle los fondos', ef: { pc: -1, media: 1 }, despues: (s, v) => { const g = s.gob.gobernadores[v.prov]; g.rel = R.clamp(g.rel - 20, 0, 100); }, res: 'Guerra abierta con {prov}', bueno: false },
      ],
    },
    {
      id: 'g_puerto', fase: 'gobierno', peso: 1, unaVez: true, dibujo: '⚓ 🚢 📜',
      titular: 'Hay que licitar la Hidrovía del Paraná',
      opciones: [
        { txt: 'Licitación internacional', ef: { expo: 0.04, empresarios: 4, rel: { USA: 3, CHN: 3 } }, res: 'Ríos más profundos, más barcos 🚢' },
        { txt: 'Que sea estatal', costo: { gasto: 1 }, ef: { trabajadores: 3, expo: 0.02 }, res: 'Hidrovía estatal ⚓' },
      ],
    },
    {
      id: 'g_autos_electricos', fase: 'gobierno', peso: 1, unaVez: true, desde: 10, dibujo: '🚗 ⚡ 🔋',
      titular: 'Una marca quiere fabricar autos eléctricos acá',
      opciones: [
        { txt: 'Beneficios fiscales', costo: { gasto: 1 }, ef: { trabajadores: 5, ciencia: 3, crec: 0.4 }, res: 'Autos eléctricos made in Argentina ⚡' },
        { txt: 'Sin ayuda', ef: {}, azar: { p: 0.5, ef: { empresarios: -2 }, txt: 'Se fueron a México 😞' }, res: 'Vinieron igual' },
      ],
    },
    {
      id: 'g_vino', fase: 'gobierno', peso: 1, repite: 24, dibujo: '🍷 🍇 🌎',
      titular: 'Los bodegueros piden ayuda para exportar',
      opciones: [
        { txt: 'Promoción en el mundo', costo: { gasto: 0.5 }, ef: { expo: 0.02, campo: 4 }, res: 'Malbec en todas las mesas del mundo 🍷' },
        { txt: 'Que se arreglen', ef: { campo: -2 }, res: 'Las bodegas protestan' },
      ],
    },
    {
      id: 'g_cadena_hospitales', fase: 'gobierno', peso: 2, repite: 14, cuando: (s) => s.eco.calidad.salud < 45, dibujo: '🏥 ⏳ 😷',
      titular: 'Colapsan las guardias de los hospitales',
      opciones: [
        { txt: 'Fondos de emergencia', costo: { gasto: 1.5 }, ef: { salud: 6, jubilados: 4, humildes: 4 }, res: 'Más médicos y camas 🏥' },
        { txt: 'Médicos de afuera', costo: { pc: 1 }, ef: { salud: 3, media: -1 }, res: 'Médicos extranjeros en las guardias' },
        { txt: 'Culpar a las provincias', ef: { jubilados: -5, humildes: -4 }, res: 'Las guardias siguen colapsadas', bueno: false },
      ],
    },
    {
      id: 'g_escuelas', fase: 'gobierno', peso: 2, repite: 14, cuando: (s) => s.eco.calidad.educacion < 45, dibujo: '🏫 🥶 📉',
      titular: 'Escuelas sin calefacción y pruebas que dan mal',
      opciones: [
        { txt: 'Plan de escuelas', costo: { gasto: 1.5 }, ef: { educacion: 6, media: 5 }, res: 'Escuelas arregladas y más horas de clase 🏫' },
        { txt: 'Más días de clase', costo: { pc: 2 }, ef: { educacion: 3, trabajadores: -2, media: 3 }, res: '190 días de clase ✅' },
        { txt: 'Prometer y esperar', ef: { media: -4 }, res: 'Los padres se enojan', bueno: false },
      ],
    },
    {
      id: 'g_policia_reclamo', fase: 'gobierno', peso: 1, repite: 18, dibujo: '👮 🪧 💰',
      titular: 'Policías federales reclaman aumento',
      opciones: [
        { txt: 'Aumento', costo: { gasto: 1 }, ef: { seguridad: 3 }, res: 'Policías contentos 👮' },
        { txt: 'Negar', ef: { seguridad: -4, media: -2 }, res: 'Menos patrullaje en las calles', bueno: false },
      ],
    },
    {
      id: 'g_gendarmes_frontera', fase: 'gobierno', peso: 1, repite: 18, dibujo: '🛃 🌵 📦',
      titular: 'Contrabando récord en la frontera norte',
      opciones: [
        { txt: 'Más gendarmes', costo: { gasto: 0.8 }, ef: { seguridad: 4, empresarios: 2 }, res: 'Frontera más cuidada 🛃' },
        { txt: 'Bajar impuestos internos', ef: { empresarios: 3 }, despues: (s) => { s.eco.impuestos = Math.max(0, s.eco.impuestos); }, res: 'Conviene comprar en blanco' },
      ],
    },
    {
      id: 'g_empleo_publico', fase: 'gobierno', peso: 2, repite: 18, dibujo: '🏢 👔 📋',
      titular: 'Hay demasiados empleados públicos, dicen los economistas',
      opciones: [
        { txt: 'Retiros voluntarios', costo: { gasto: 1 }, ef: { empresarios: 4, riesgo: -40, trabajadores: -2 }, res: 'Estado más chico, sin despidos' },
        { txt: 'Despidos', ef: { empresarios: 6, trabajadores: -8, desempleo: 0.4, riesgo: -60 }, res: 'Miles de despidos 📉' },
        { txt: 'Dejarlo como está', ef: { trabajadores: 2 }, res: 'Nadie toca nada' },
      ],
    },
    {
      id: 'g_premio_nobel', fase: 'gobierno', peso: 1, unaVez: true, cuando: (s) => s.eco.calidad.ciencia >= 55, dibujo: '🏅 🔬 ☀️',
      titular: '¡Una científica argentina gana el Nobel!',
      opciones: [
        { txt: 'Recibirla en la Rosada', ef: { todos: 3, ciencia: 3 }, res: 'Orgullo nacional 🏅' },
        { txt: 'Duplicar su laboratorio', costo: { gasto: 0.5 }, ef: { ciencia: 6, media: 3 }, res: 'Más investigación 🔬' },
      ],
    },
    {
      id: 'g_inundacion_amba', fase: 'gobierno', peso: 1, repite: 18, dibujo: '🌧️ 🏙️ 🚗',
      titular: 'Una tormenta inunda media ciudad',
      opciones: [
        { txt: 'Obras hidráulicas', costo: { gasto: 2 }, ef: { infra: 6, media: 4 }, res: 'Nunca más inundaciones 🚧' },
        { txt: 'Ayuda a los afectados', costo: { gasto: 0.5 }, ef: { humildes: 3 }, res: 'Colchones y comida para los evacuados' },
      ],
    },
    {
      id: 'g_boleto_estudiantil', fase: 'gobierno', peso: 1, unaVez: true, dibujo: '🎒 🚌 🎓',
      titular: 'Los estudiantes piden boleto gratis',
      opciones: [
        { txt: 'Dárselo', costo: { gasto: 0.8 }, ef: { media: 4, humildes: 3, educacion: 2 }, res: 'Boleto estudiantil gratis 🎒' },
        { txt: 'Medio boleto', costo: { gasto: 0.3 }, ef: { media: 2 }, res: 'Algo es algo' },
        { txt: 'No hay plata', ef: { media: -3 }, res: 'Marcha de estudiantes', bueno: false },
      ],
    },
    {
      id: 'g_ganancias', fase: 'gobierno', peso: 2, repite: 18, dibujo: '🧾 💼 😩',
      titular: 'Los trabajadores piden bajar el impuesto a las ganancias',
      opciones: [
        { txt: 'Bajarlo', ef: { trabajadores: 7, media: 5 }, despues: (s) => { s.gob.bonusRecauda = (s.gob.bonusRecauda || 0) - 0.3; }, res: 'Más plata en el bolsillo 💰' },
        { txt: 'Subir el mínimo', costo: { pc: 1 }, ef: { trabajadores: 3, media: 2 }, despues: (s) => { s.gob.bonusRecauda = (s.gob.bonusRecauda || 0) - 0.1; }, res: 'Menos gente paga' },
        { txt: 'Mantenerlo', ef: { trabajadores: -3, media: -2 }, res: 'Bronca en los recibos de sueldo', bueno: false },
      ],
    },
    {
      id: 'g_reservas_oro', fase: 'gobierno', peso: 1, unaVez: true, cuando: (s) => s.eco.reservas > 50, dibujo: '🪙 🏦 ✨',
      titular: 'Te proponen comprar oro con las reservas',
      opciones: [
        { txt: 'Comprar oro', ef: { riesgo: -40 }, azar: { p: 0.5, ef: { reservas: 6 }, txt: '¡El oro subió! Ganaste 🪙', bueno: true }, res: 'El oro se quedó quieto' },
        { txt: 'Mejor dólares', ef: {}, res: 'Todo en dólares' },
      ],
    },
    {
      id: 'g_feriado_mundial', fase: 'gobierno', peso: 1, repite: 30, dibujo: '⚽ 📺 🎉',
      titular: 'La Selección gana la Copa América',
      opciones: [
        { txt: 'Recibirlos en la Rosada', ef: { todos: 3 }, azar: { p: 0.3, ef: { media: -4 }, txt: 'Desborde de gente y caos 😬' }, res: 'Fiesta en el balcón 🏆' },
        { txt: 'Que festejen tranquilos', ef: { todos: 1 }, res: 'Bien por ellos' },
      ],
    },
    {
      id: 'g_ministro_renuncia', fase: 'gobierno', peso: 1, unaVez: true, desde: 18, dibujo: '🚪 🧑‍💼 📰',
      titular: 'Tu ministro de Economía amenaza con renunciar',
      opciones: [
        { txt: 'Bancarlo', costo: { pc: 2 }, ef: { riesgo: -50 }, res: 'Se queda y los mercados respiran 📊' },
        { txt: 'Cambiar de ministro', ef: { riesgo: 120, todos: -1 }, despues: (s) => { s.cola.push({ tipo: 'ministro' }); }, res: 'Hay que elegir un nuevo ministro' },
      ],
    },
    {
      id: 'g_reforma_tributaria', fase: 'gobierno', peso: 1, unaVez: true, desde: 12, dibujo: '🧾 ✂️ 📊',
      titular: 'Te proponen simplificar todos los impuestos',
      opciones: [
        { txt: 'Impuesto único', costo: { pc: 3 }, ef: { empresarios: 8, media: 4, crec: 0.6 }, despues: (s) => { s.gob.bonusRecauda = (s.gob.bonusRecauda || 0) - 0.4; }, res: 'Pagar impuestos ahora es fácil 🧾' },
        { txt: 'Más adelante', ef: {}, res: 'Queda en un cajón' },
      ],
    },
    {
      id: 'g_soja_precio', fase: 'gobierno', peso: 2, repite: 18, dibujo: '🌱 📈 🌎',
      titular: 'El precio mundial de la soja se dispara',
      opciones: [
        { txt: 'Guardar los dólares', ef: { reservas: 5, campo: 4 }, res: 'Reservas que crecen 🏦' },
        { txt: 'Subir retenciones', si: (s) => s.eco.retenciones < 3, siTxt: 'Ya están al máximo', ef: { campo: -8 }, despues: (s) => { s.eco.retenciones = Math.min(3, s.eco.retenciones + 1); s.eco.retencionesInicioMes = s.eco.retenciones; }, res: 'Más recaudación, el campo furioso' },
      ],
    },
    {
      id: 'g_soja_baja', fase: 'gobierno', peso: 2, repite: 18, dibujo: '🌱 📉 😟',
      titular: 'Se desploma el precio de la soja',
      opciones: [
        { txt: 'Bajar retenciones', si: (s) => s.eco.retenciones > 0, siTxt: 'Ya no hay retenciones', ef: { campo: 8 }, despues: (s) => { s.eco.retenciones = Math.max(0, s.eco.retenciones - 1); s.eco.retencionesInicioMes = s.eco.retenciones; }, res: 'Alivio para los productores 🚜' },
        { txt: 'Aguantar', ef: { expo: -0.06, campo: -4 }, res: 'Entran menos dólares', bueno: false },
      ],
    },
    {
      id: 'g_veto_popular', fase: 'gobierno', peso: 1, repite: 18, desde: 6, dibujo: '🏛️ ✋ 📜',
      titular: 'El Congreso aprueba una ley que no te gusta',
      opciones: [
        { txt: 'Vetarla', costo: { pc: 2 }, ef: { media: -3, empresarios: 2 }, res: 'Veto firmado ✋' },
        { txt: 'Dejar que salga', ef: { media: 2, pc: 1 }, res: 'Buena relación con el Congreso' },
      ],
    },

    // ── Campaña ──
    {
      id: 'c_bunker', fase: 'campana', peso: 1, dibujo: '🏢 🎈 🎤',
      titular: 'Te ofrecen un búnker de campaña lujoso',
      opciones: [
        { txt: 'Alquilarlo', costo: { fondos: 20 }, ef: { militancia: 4, conocen: 2 }, res: 'Búnker con pantallas gigantes 🎈' },
        { txt: 'Un local de barrio', ef: { simpatia: 2 }, res: 'Austero y cercano' },
      ],
    },
    {
      id: 'c_vecinos', fase: 'campana', peso: 2, vars: provAzar, dibujo: '🏘️ 💧 🙋',
      titular: 'Vecinos de {prov} te piden agua potable',
      opciones: [
        { txt: 'Prometer la obra', ef: (s, v) => ({ presencia: { [v.prov]: 12 }, simpatia: 1 }), res: 'Te creen… por ahora' },
        { txt: 'Ir a escucharlos', costo: { agenda: 1 }, ef: (s, v) => ({ presencia: { [v.prov]: 20 }, simpatia: 2 }), res: 'Mate con los vecinos 🧉' },
      ],
    },
    {
      id: 'c_encuesta_mala', fase: 'campana', peso: 2, cuando: (s) => s.mes >= 3, dibujo: '📊 📉 😰',
      titular: 'Una encuesta te da muy abajo',
      opciones: [
        { txt: 'Redoblar la campaña', costo: { fondos: 10 }, ef: { conocen: 3, militancia: 2 }, res: 'Más energía que nunca 💪' },
        { txt: '«Las encuestas mienten»', ef: { simpatia: -1, militancia: 2 }, res: 'Tu gente se motiva' },
      ],
    },
    {
      id: 'c_spot_humor', fase: 'campana', peso: 2, dibujo: '🎬 😂 📺',
      titular: 'Un director famoso te ofrece un spot de humor',
      opciones: [
        { txt: 'Hacerlo', costo: { fondos: 15 }, ef: { conocen: 6, simpatia: 2 }, azar: { p: 0.25, ef: { simpatia: -4 }, txt: 'El humor no cayó bien 🙃' }, res: '¡Spot viral! 🎬' },
        { txt: 'Spot serio', costo: { fondos: 10 }, ef: { conocen: 3, simpatia: 1 }, res: 'Correcto y prolijo' },
      ],
    },
    {
      id: 'c_robo_sede', fase: 'campana', peso: 1, dibujo: '🚪 🦹 📂',
      titular: 'Roban computadoras de tu sede',
      opciones: [
        { txt: 'Denunciar espionaje', ef: { conocen: 3, confrontativo: 1 }, res: 'Escándalo en la tele 🕵️' },
        { txt: 'Bajar el perfil', costo: { fondos: 8 }, ef: {}, res: 'Compraste todo de nuevo' },
      ],
    },
    {
      id: 'c_pibe_viral', fase: 'campana', peso: 2, dibujo: '🧒 📱 ❤️',
      titular: 'Un nene te hace una pregunta y se viraliza',
      opciones: [
        { txt: 'Responder con ternura', ef: { simpatia: 4, conocen: 3 }, res: 'Todo el país se enterneció ❤️' },
        { txt: 'Responder con datos', ef: { conocen: 2, ideoDer: 1 }, res: 'Bien, pero frío' },
      ],
    },
    {
      id: 'c_ataque_redes', fase: 'campana', peso: 2, cuando: (s) => s.camp.conocen > 25, vars: rivalAzar, dibujo: '🤖 📱 💣',
      titular: 'Un ejército de trolls te ataca en redes',
      opciones: [
        { txt: 'Denunciar a {rivalSigla}', ef: (s, v) => ({ rival: { [v.rival]: -1.5 }, conocen: 1 }), res: 'Expusiste a los trolls 🕵️' },
        { txt: 'Tus propios trolls', costo: { fondos: 12 }, ef: { conocen: 2, sucio: 1 }, res: 'Guerra de bots en redes 🤖' },
        { txt: 'Ignorar', ef: { simpatia: -2 }, res: 'Algunos se lo creyeron' },
      ],
    },
    // ── Mundo ──
    {
      id: 'm_cumbre_g20', fase: 'gobierno', peso: 1, repite: 24, desde: 6, dibujo: '🌐 🤝 🍽️',
      titular: 'Te invitan a la cumbre del G20',
      opciones: [
        { txt: 'Ir y negociar', costo: { pc: 1 }, ef: { rel: { USA: 4, CHN: 4, UE: 4 }, riesgo: -40 }, res: 'Fotos con los líderes del mundo 📸' },
        { txt: 'Mandar al canciller', ef: { rel: { USA: 1, UE: 1 } }, res: 'Presencia discreta' },
      ],
    },
    {
      id: 'm_ue_acuerdo', fase: 'gobierno', peso: 2, unaVez: true, cuando: (s) => s.mundo && s.mundo.paises.UE.rel >= 45 && !s.mundo.paises.UE.tratado, dibujo: '⭐ 🤝 🧀',
      titular: 'La Unión Europea ofrece cerrar el acuerdo comercial',
      opciones: [
        { txt: 'Firmar', ef: { campo: 6, empresarios: 3, trabajadores: -3, rel: { UE: 8 } }, despues: (s) => { s.mundo.paises.UE.tratado = true; s.gob.bonusExpo = (s.gob.bonusExpo || 0) + R.PAIS.UE.expo; }, res: 'Acuerdo histórico Mercosur-UE 🤝' },
        { txt: 'Pedir protección industrial', costo: { pc: 2 }, ef: { trabajadores: 2, rel: { UE: 2 } }, res: 'Negociación larga…' },
      ],
    },
    {
      id: 'm_rusia_trigo', fase: 'gobierno', peso: 1, unaVez: true, dibujo: '🌾 🚢 🐻',
      titular: 'Rusia ofrece trigo y fertilizantes baratos',
      opciones: [
        { txt: 'Comprar', ef: { campo: 4, rel: { RUS: 8, USA: -5 } }, res: 'Fertilizantes baratos para el campo 🌾' },
        { txt: 'No, gracias', ef: { rel: { RUS: -4, USA: 2 } }, res: 'Seguimos con los proveedores de siempre' },
      ],
    },
    {
      id: 'm_peru_crisis', fase: 'gobierno', peso: 1, unaVez: true, dibujo: '🏔️ 🔥 🧳',
      titular: 'Crisis política en Perú: piden asilo',
      opciones: [
        { txt: 'Dar asilo', ef: { media: 1, rel: { PER: -6, UE: 3 } }, res: 'Argentina, tierra de asilo 🕊️' },
        { txt: 'No meterse', ef: { rel: { PER: 3 } }, res: 'Neutralidad' },
      ],
    },
    {
      id: 'm_chile_paso', fase: 'gobierno', peso: 1, unaVez: true, cuando: (s) => s.mundo && s.mundo.paises.CHL.rel >= 40, dibujo: '🏔️ 🚛 🌊',
      titular: 'Chile propone un corredor al Pacífico',
      opciones: [
        { txt: 'Construirlo juntos', costo: { gasto: 1.5 }, ef: { expo: 0.04, infra: 3, rel: { CHL: 12 } }, res: 'Ruta al Pacífico para exportar 🚛' },
        { txt: 'Muy caro', ef: { rel: { CHL: -4 } }, res: 'Queda para otro gobierno' },
      ],
    },
    {
      id: 'm_paraguay_energia', fase: 'gobierno', peso: 1, unaVez: true, dibujo: '⚡ 🌊 🤝',
      titular: 'Paraguay quiere renegociar Yacyretá',
      opciones: [
        { txt: 'Ceder un poco', ef: { rel: { PRY: 10 } }, despues: (s) => { s.eco.niveles.subsidios = Math.min(1.6, R.round(s.eco.niveles.subsidios + 0.05, 2)); s.eco.nivelesInicioMes.subsidios = s.eco.niveles.subsidios; }, res: 'Paz energética con Paraguay ⚡' },
        { txt: 'No ceder', ef: { rel: { PRY: -10 } }, res: 'Tensión en la represa' },
      ],
    },
    {
      id: 'c_feria_campo', fase: 'campana', peso: 1, dibujo: '🐄 🚜 🎪',
      titular: 'Te invitan a la Exposición Rural',
      opciones: [
        { txt: 'Ir y hablar', costo: { agenda: 1 }, ef: { presencia: { centro: 10 }, ideoDer: 2 }, res: 'Aplausos de los productores 🐄' },
        { txt: 'No ir', ef: { ideoIzq: 1 }, res: 'Los del campo lo notan' },
      ],
    },
    {
      id: 'c_universidad', fase: 'campana', peso: 1, dibujo: '🎓 🎤 📚',
      titular: 'Te invitan a debatir en una universidad',
      opciones: [
        { txt: 'Ir', costo: { agenda: 1 }, ef: { conocen: 3, simpatia: 2, ideoIzq: 1 }, azar: { p: 0.25, ef: { simpatia: -4 }, txt: 'Te abuchearon 😬' }, res: 'Ovación de los estudiantes 🎓' },
        { txt: 'Mandar un video', ef: { conocen: 1 }, res: 'Video correcto' },
      ],
    },
  ]);
})(globalThis.R = globalThis.R || {});
