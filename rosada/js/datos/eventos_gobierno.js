// Noticias del gobierno. costo: { pc: ⭐, gasto: % del presupuesto anual }.
// ef: grupos (trabajadores, campo, empresarios, media, humildes, jubilados, todos), inflacion, crec, expo, reservas,
// deuda, riesgo, desempleo, pobreza, dolar, escandalo, calidad: {salud, educacion, seguridad, defensa, infra, ciencia}.
(function (R) {
  'use strict';
  const mes = (anio, m) => R.mesNum(anio, m);

  R.ev.registrar([
    // ── Reacciones de la gente (aparecen cuando un grupo está enojado) ──
    {
      id: 'g_paro', fase: 'gobierno', peso: 5, repite: 6, cuando: (s) => s.gob.grupos.trabajadores.humor < 35, dibujo: '✊ 🏭 🚫',
      titular: 'La CGT lanza un paro general',
      opciones: [
        { txt: 'Negociar', costo: { pc: 2 }, ef: { trabajadores: 8, empresarios: -2 }, res: 'Se levantó el paro 🤝' },
        { txt: 'Aumento por decreto', costo: { gasto: 2 }, ef: { trabajadores: 12, inflacion: 0.4, empresarios: -4 }, res: 'Los gremios festejan, los precios también 📈' },
        { txt: 'Descontar el día', ef: { trabajadores: -8, empresarios: 5, crec: -0.6 }, res: 'El país se paralizó un día', bueno: false },
      ],
    },
    {
      id: 'g_lockout', fase: 'gobierno', peso: 5, repite: 8, cuando: (s) => s.gob.grupos.campo.humor < 33, dibujo: '🚜 🛑 🌾',
      titular: 'El campo corta rutas y deja de vender granos',
      opciones: [
        { txt: 'Bajar retenciones', si: (s) => s.eco.retenciones > 0, siTxt: 'Ya no hay retenciones', ef: { campo: 14 },
          despues: (s) => { s.eco.retenciones = Math.max(0, s.eco.retenciones - 1); }, res: 'Las rutas se liberan 🚜' },
        { txt: 'Dialogar', costo: { pc: 3 }, ef: { campo: 9 }, res: 'Tregua con el campo 🧉' },
        { txt: 'No ceder', ef: { campo: -6, expo: -0.08, reservas: -3, humildes: 2 }, res: 'Se frenan las exportaciones', bueno: false },
      ],
    },
    {
      id: 'g_cacerolazo', fase: 'gobierno', peso: 5, repite: 6, cuando: (s) => s.gob.grupos.media.humor < 32, dibujo: '🍳 🥄 🏙️',
      titular: 'Cacerolazo en todo el país',
      opciones: [
        { txt: 'Cadena nacional', costo: { pc: 2 }, ef: { media: 5 }, azar: { p: 0.35, ef: { media: -6 }, txt: 'Más cacerolas que antes 🍳' }, res: 'Bajó el ruido' },
        { txt: 'Cambiar ministros', costo: { pc: 4 }, ef: { media: 9, todos: 2 }, res: 'Caras nuevas en el gabinete' },
        { txt: 'Ignorarlo', ef: { media: -6 }, res: 'Las cacerolas siguen sonando 🥄', bueno: false },
      ],
    },
    {
      id: 'g_miercoles', fase: 'gobierno', peso: 5, repite: 6, cuando: (s) => s.gob.grupos.jubilados.humor < 35, dibujo: '👵 🪧 🏛️',
      titular: 'Miles de jubilados marchan al Congreso',
      opciones: [
        { txt: 'Aumento de emergencia', costo: { gasto: 3 }, ef: { jubilados: 14, todos: 1 }, res: 'Los abuelos se vuelven a casa más tranquilos 👵' },
        { txt: 'Recibirlos', costo: { pc: 2 }, ef: { jubilados: 6, media: 2 }, res: 'Mate y charla en la Rosada 🧉' },
        { txt: 'Vallar la plaza', ef: { jubilados: -10, media: -6, escandalo: 2 }, res: 'Las fotos dan vuelta al mundo 📸', bueno: false },
      ],
    },
    {
      id: 'g_piquetes', fase: 'gobierno', peso: 5, repite: 6, cuando: (s) => s.gob.grupos.humildes.humor < 33, dibujo: '🔥 🛞 🏘️',
      titular: 'Cortes y piquetes en los accesos a la ciudad',
      opciones: [
        { txt: 'Más planes sociales', costo: { gasto: 2.5 }, ef: { humildes: 12, media: -4 }, res: 'Se levantan los cortes' },
        { txt: 'Comedores y trabajo', costo: { gasto: 1.5, pc: 2 }, ef: { humildes: 9, media: 1 }, res: 'Cooperativas trabajando 🛠️' },
        { txt: 'Despejar con policía', ef: { humildes: -9, media: 4, escandalo: 1 }, azar: { p: 0.3, ef: { todos: -4, escandalo: 3 }, txt: 'Hubo heridos y es escándalo 🚨' }, res: 'Accesos liberados' },
      ],
    },
    {
      id: 'g_estallido', fase: 'gobierno-especial', peso: 0, dibujo: '🔥 🚨 🏛️',
      titular: '¡Estallido social! Saqueos y represión',
      bajada: 'El país entero está en llamas',
      opciones: [
        { txt: 'Renunciar', ef: {}, res: 'Te vas en helicóptero 🚁', bueno: false, despues: (s) => { s.fase = 'fin'; s.fin = { motivo: 'estallido', mes: s.mes }; } },
        { txt: 'Gabinete nuevo', costo: { pc: 5 }, ef: { todos: 7 }, res: 'Ganaste un poco de aire' },
        { txt: 'Estado de sitio', ef: { todos: -4, escandalo: 4 }, azar: { p: 0.5, ef: {}, txt: 'Te sostenés… por ahora', bueno: true }, res: 'La calle se calma con miedo', bueno: false },
      ],
    },

    // ── Economía ──
    {
      id: 'g_corrida', fase: 'gobierno', peso: 4, repite: 8, cuando: (s) => s.eco.reservas < 16 && !s.eco.cepo, dibujo: '💵 🏃 📉',
      titular: 'Corrida cambiaria: todos quieren dólares',
      opciones: [
        { txt: 'Vender reservas', ef: { reservas: -5, todos: 1 }, res: 'El dólar se calma… por ahora' },
        { txt: 'Dejar que suba', ef: { dolar: 18, media: -5, campo: 4 }, res: 'El dólar saltó 18 % 💵', bueno: false },
        { txt: 'Poner cepo', ef: { empresarios: -8, campo: -5 }, despues: (s) => { s.eco.cepo = true; s.eco.brecha = 20; }, res: 'Cepo: se cuidan los dólares, aparece el blue 🔒' },
      ],
    },
    {
      id: 'g_fmi', fase: 'gobierno', peso: 4, repite: 18, cuando: (s) => s.eco.reservas < 14, dibujo: '🏦 🤝 🌎',
      titular: 'El FMI ofrece un préstamo… con condiciones',
      opciones: [
        { txt: 'Aceptar y ajustar', ef: { reservas: 15, deuda: 4, riesgo: -200, humildes: -5, trabajadores: -5, empresarios: 5 },
          despues: (s) => { for (const a of R.AREAS) s.eco.niveles[a.id] = Math.max(0.5, R.round(s.eco.niveles[a.id] - 0.05, 2)); }, res: 'Llegaron los dólares del Fondo 🏦' },
        { txt: 'Negociar', costo: { pc: 3 }, ef: { reservas: 8, deuda: 2, riesgo: -80 }, res: 'Préstamo más chico, sin ajuste' },
        { txt: 'Rechazar', ef: { trabajadores: 4, riesgo: 120 }, res: '«Soberanía», dicen unos. «Locura», dicen otros' },
      ],
    },
    {
      id: 'g_inflacion_record', fase: 'gobierno', peso: 6, repite: 6, cuando: (s) => s.eco.inflMes > 6, dibujo: '🛒 🔥 📈',
      titular: 'Inflación récord: los precios cambian a diario',
      opciones: [
        { txt: 'Congelar precios', costo: { pc: 2 }, ef: { inflacion: -1.5, empresarios: -8, media: 3 }, azar: { p: 0.4, ef: { inflacion: 2 }, txt: 'Desabastecimiento: las góndolas vacías 😱' }, res: 'Precios congelados 🧊' },
        { txt: 'Dejar de emitir', ef: { empresarios: 4, trabajadores: -3 }, despues: (s) => { s.eco.financiamiento = 2; }, res: 'Ahora pedís prestado en vez de imprimir' },
        { txt: 'Culpar a los formadores', ef: { humildes: 3, empresarios: -5 }, res: 'Nadie te cree mucho' },
      ],
    },
    {
      id: 'g_superavit', fase: 'gobierno', peso: 3, cuando: (s) => R.eco.resultado(s) > 0.5, dibujo: '⚖️ ✅ 💰',
      titular: '¡Superávit fiscal! Sobra plata en el Tesoro',
      opciones: [
        { txt: 'Bajar impuestos', si: (s) => s.eco.impuestos > 0, ef: { empresarios: 8, media: 6 }, despues: (s) => { s.eco.impuestos = Math.max(0, s.eco.impuestos - 1); s.eco.impuestosInicioMes = s.eco.impuestos; }, res: 'Impuestos más bajos 🧾' },
        { txt: 'Pagar deuda', ef: { deuda: -3, riesgo: -150, empresarios: 4 }, res: 'El riesgo país se desploma 📉' },
        { txt: 'Aumento a jubilados', ef: { jubilados: 10 }, despues: (s) => { s.eco.niveles.jubilaciones = Math.min(1.6, R.round(s.eco.niveles.jubilaciones + 0.05, 2)); s.eco.nivelesInicioMes.jubilaciones = s.eco.niveles.jubilaciones; }, res: 'Jubilaciones +5 % 👵' },
      ],
    },
    {
      id: 'g_sequia', fase: 'gobierno', peso: 2, repite: 24, dibujo: '☀️ 🌾 🥀',
      titular: 'Sequía histórica en la pampa húmeda',
      opciones: [
        { txt: 'Emergencia agropecuaria', costo: { gasto: 2 }, ef: { campo: 8, expo: -0.06, crec: -1 }, res: 'Ayudaste a los productores' },
        { txt: 'Bajar retenciones', si: (s) => s.eco.retenciones > 0, siTxt: 'Ya no hay retenciones', ef: { campo: 10, expo: -0.05, crec: -1 }, despues: (s) => { s.eco.retenciones = Math.max(0, s.eco.retenciones - 1); s.eco.retencionesInicioMes = s.eco.retenciones; }, res: 'Alivio para el campo' },
        { txt: 'Rezar por lluvia', ef: { expo: -0.12, crec: -2, campo: -6 }, res: 'No llovió 🌵', bueno: false },
      ],
    },
    {
      id: 'g_cosecha', fase: 'gobierno', peso: 2, repite: 18, dibujo: '🌽 🚛 💵',
      titular: '¡Cosecha récord! Entran dólares',
      opciones: [
        { txt: 'Guardar reservas', ef: { reservas: 6, campo: 3 }, res: 'El Banco Central respira 🏦' },
        { txt: 'Fondo para obras', ef: { reservas: 3, infra: 6, trabajadores: 3 }, res: 'Rutas nuevas con la cosecha 🛣️' },
      ],
    },
    {
      id: 'g_vaca_muerta', fase: 'gobierno', peso: 2, unaVez: true, dibujo: '🛢️ 🏔️ ⚡',
      titular: 'Descubren un yacimiento enorme en Vaca Muerta',
      opciones: [
        { txt: 'Que inviertan privados', ef: { empresarios: 8, expo: 0.1, riesgo: -60 }, res: 'Llueven inversiones 💼' },
        { txt: 'Que lo haga YPF', costo: { gasto: 3 }, ef: { trabajadores: 6, expo: 0.07, reservas: 2 }, res: 'Bandera argentina en el pozo 🇦🇷' },
        { txt: 'Asociarse con China', ef: { expo: 0.08, reservas: 4, empresarios: -2 }, res: 'Acuerdo con capitales chinos' },
      ],
    },
    {
      id: 'g_litio', fase: 'gobierno', peso: 2, dibujo: '🔋 ⛰️ 🚚',
      titular: 'Fiebre del litio en el Norte',
      opciones: [
        { txt: 'Abrir la minería', ef: { expo: 0.08, empresarios: 5, humildes: 2 }, azar: { p: 0.25, ef: { media: -4 }, txt: 'Protestas ambientales 🌱' }, res: 'Camiones de litio rumbo al puerto' },
        { txt: 'Fábrica de baterías', costo: { gasto: 2 }, ef: { ciencia: 6, trabajadores: 4, expo: 0.04 }, res: '¡Baterías argentinas! 🔋' },
        { txt: 'Proteger los salares', ef: { media: 3, empresarios: -4 }, res: 'Los salares quedan intactos 🦩' },
      ],
    },
    {
      id: 'g_inversion', fase: 'gobierno', peso: 2, cuando: (s) => s.eco.riesgo < 900, dibujo: '🏭 🌍 💵',
      titular: 'Una automotriz quiere poner una planta',
      opciones: [
        { txt: 'Darle exenciones', costo: { gasto: 1 }, ef: { trabajadores: 7, empresarios: 5, desempleo: -0.3, crec: 0.5 }, res: '3.000 puestos nuevos 🚗' },
        { txt: 'Sin privilegios', ef: { media: 2 }, azar: { p: 0.5, ef: { empresarios: -4 }, txt: 'Se fue a Brasil 😞' }, res: 'Vino igual, sin beneficios' },
      ],
    },
    {
      id: 'g_aerolineas', fase: 'gobierno', peso: 2, unaVez: true, dibujo: '✈️ 💸 🤔',
      titular: 'Aerolíneas Argentinas vuelve a dar pérdidas',
      opciones: [
        { txt: 'Privatizarla', ef: { empresarios: 6, trabajadores: -6, reservas: 1 }, res: 'Vendida al mejor postor ✈️' },
        { txt: 'Capitalizarla', costo: { gasto: 1.5 }, ef: { trabajadores: 3, media: -2 }, res: 'Sigue siendo de todos' },
        { txt: 'Achicarla', ef: { trabajadores: -3, empresarios: 2 }, res: 'Menos rutas, menos gastos' },
      ],
    },
    {
      id: 'g_tarifas', fase: 'gobierno', peso: 3, repite: 12, cuando: (s) => s.eco.niveles.subsidios >= 0.9, dibujo: '💡 🔥 🧾',
      titular: 'Las energéticas piden aumentar las tarifas',
      opciones: [
        { txt: 'Tarifazo', ef: { media: -6, humildes: -6, jubilados: -5, empresarios: 4 },
          despues: (s) => { s.eco.niveles.subsidios = Math.max(0.5, R.round(s.eco.niveles.subsidios - 0.2, 2)); }, res: 'Bajan los subsidios… y suben las boletas 💡' },
        { txt: 'Aumento gradual', ef: { media: -2, humildes: -2 },
          despues: (s) => { s.eco.niveles.subsidios = Math.max(0.5, R.round(s.eco.niveles.subsidios - 0.1, 2)); }, res: 'Suben de a poco' },
        { txt: 'Congelar', ef: { humildes: 3, empresarios: -4 }, azar: { p: 0.3, ef: { infra: -6 }, txt: 'Falta inversión: hay cortes de luz ⚡' }, res: 'Tarifas congeladas' },
      ],
    },
    {
      id: 'g_apagon', fase: 'gobierno', peso: 3, repite: 12, cuando: (s) => s.eco.calidad.infra < 42, dibujo: '⚡ 🕯️ 🥵',
      titular: 'Apagón masivo en plena ola de calor',
      opciones: [
        { txt: 'Plan de obras eléctricas', costo: { gasto: 2 }, ef: { infra: 8, media: 3 }, res: 'Vuelve la luz y se arma la red 🔌' },
        { txt: 'Multar a las empresas', ef: { media: 4, empresarios: -5 }, res: 'Las empresas pagan… y no invierten' },
        { txt: 'Pedir paciencia', ef: { media: -6, humildes: -4 }, res: 'Ventiladores apagados 🥵', bueno: false },
      ],
    },
    {
      id: 'g_bitcoin', fase: 'gobierno', peso: 1, unaVez: true, dibujo: '🪙 📱 🤑',
      titular: 'Te proponen hacer al bitcoin moneda legal',
      opciones: [
        { txt: '¡Hagámoslo!', ef: { riesgo: 150, media: -2, empresarios: -2 }, azar: { p: 0.4, ef: { reservas: 4 }, txt: 'Subió el bitcoin, ¡ganaste! 🤑', bueno: true }, res: 'El mundo te mira raro 🪙' },
        { txt: 'Ni loco', ef: { empresarios: 2 }, res: 'Seguimos con el peso' },
      ],
    },

    // ── Sociedad ──
    {
      id: 'g_dengue', fase: 'gobierno', peso: 3, repite: 12, cuando: (s) => s.eco.calidad.salud < 52, dibujo: '🦟 🏥 🌡️',
      titular: 'Brote de dengue en el norte',
      opciones: [
        { txt: 'Vacunación masiva', costo: { gasto: 1.5 }, ef: { salud: 5, humildes: 4, todos: 1 }, res: 'Se frenó el brote 💉' },
        { txt: 'Fumigar barrios', costo: { gasto: 0.5 }, ef: { humildes: 2 }, res: 'Algo ayudó' },
        { txt: 'Que se arreglen solos', ef: { humildes: -5, jubilados: -3 }, res: 'Hospitales colapsados 😷', bueno: false },
      ],
    },
    {
      id: 'g_narco', fase: 'gobierno', peso: 3, repite: 12, cuando: (s) => s.eco.calidad.seguridad < 50, dibujo: '🔫 🚨 🌃',
      titular: 'Balaceras narco en Rosario',
      opciones: [
        { txt: 'Mandar Gendarmería', costo: { gasto: 1 }, ef: { seguridad: 6, media: 5 }, res: 'Gendarmes en las calles 👮' },
        { txt: 'Plan social y urbano', costo: { gasto: 1.5 }, ef: { seguridad: 3, humildes: 4 }, res: 'Escuelas y clubes en los barrios' },
        { txt: 'Militarizar', ef: { seguridad: 8, media: 4, humildes: -5, escandalo: 1 }, res: 'Mano dura total' },
      ],
    },
    {
      id: 'g_universidad', fase: 'gobierno', peso: 3, repite: 12, cuando: (s) => s.eco.niveles.educacion < 1, dibujo: '🎓 📚 🪧',
      titular: 'Marcha universitaria masiva',
      opciones: [
        { txt: 'Más fondos', ef: { media: 7, educacion: 3 }, despues: (s) => { s.eco.niveles.educacion = Math.min(1.6, R.round(s.eco.niveles.educacion + 0.1, 2)); s.eco.nivelesInicioMes.educacion = s.eco.niveles.educacion; }, res: 'Las universidades respiran 🎓' },
        { txt: 'Auditar primero', ef: { media: -3, empresarios: 2 }, res: 'Polémica en las aulas' },
        { txt: 'No ceder', ef: { media: -7 }, res: 'Un millón en la calle 🪧', bueno: false },
      ],
    },
    {
      id: 'g_docentes', fase: 'gobierno', peso: 3, repite: 10, dibujo: '👩‍🏫 ✋ 🏫',
      titular: 'Paro docente: no empiezan las clases',
      opciones: [
        { txt: 'Aumento docente', costo: { gasto: 1.5 }, ef: { media: 5, trabajadores: 3 }, res: 'Arrancaron las clases 🏫' },
        { txt: 'Descontar los días', ef: { media: -2, trabajadores: -4, empresarios: 2 }, res: 'Pelea abierta con los gremios' },
      ],
    },
    {
      id: 'g_crimen', fase: 'gobierno', peso: 2, repite: 10, dibujo: '🚨 🕯️ 😢',
      titular: 'Un crimen conmueve al país',
      opciones: [
        { txt: 'Ley más dura', costo: { pc: 2 }, ef: { media: 5, seguridad: 2 }, res: 'Mensaje de firmeza ⚖️' },
        { txt: 'Recibir a la familia', costo: { pc: 1 }, ef: { todos: 2 }, res: 'Un gesto que se valora 🕯️' },
        { txt: 'Silencio', ef: { media: -5 }, res: '«No le importa», dicen', bueno: false },
      ],
    },
    {
      id: 'g_tomas', fase: 'gobierno', peso: 2, repite: 12, dibujo: '🏠 🪵 ⛺',
      titular: 'Toma de tierras en el conurbano',
      opciones: [
        { txt: 'Plan de viviendas', costo: { gasto: 2.5 }, ef: { humildes: 9, infra: 2 }, res: 'Lotes con servicios para todos 🏠' },
        { txt: 'Desalojar', ef: { media: 3, humildes: -8 }, res: 'Desalojo con topadoras' },
        { txt: 'Negociar', costo: { pc: 2 }, ef: { humildes: 3, media: -1 }, res: 'Se va arreglando' },
      ],
    },
    {
      id: 'g_inundacion', fase: 'gobierno', peso: 2, repite: 12, dibujo: '🌧️ 🏠 🛶',
      titular: 'Inundaciones dejan miles de evacuados',
      opciones: [
        { txt: 'Ayuda y obras', costo: { gasto: 2 }, ef: { humildes: 6, infra: 3, todos: 2 }, res: 'Llegó la ayuda 🚚' },
        { txt: 'Ir al lugar', costo: { pc: 1 }, ef: { todos: 2 }, res: 'Con las botas en el agua 👢' },
        { txt: 'Mandar un tuit', ef: { todos: -3 }, res: '«Pura foto»', bueno: false },
      ],
    },
    {
      id: 'g_incendios', fase: 'gobierno', peso: 2, repite: 12, dibujo: '🔥 🌲 🚒',
      titular: 'Incendios forestales en la Patagonia',
      opciones: [
        { txt: 'Aviones hidrantes', costo: { gasto: 1 }, ef: { media: 4 }, res: 'Fuego controlado 🚒' },
        { txt: 'Que se arreglen solos', ef: { media: -4 }, res: 'Se quemaron miles de hectáreas', bueno: false },
      ],
    },
    {
      id: 'g_ola_calor', fase: 'gobierno', peso: 1, repite: 12, dibujo: '🥵 🌡️ 💧',
      titular: 'Ola de calor récord: 45 grados',
      opciones: [
        { txt: 'Feriado y agua gratis', costo: { gasto: 0.5 }, ef: { media: 3, humildes: 3, crec: -0.2 }, res: '¡A la pileta! 🏊' },
        { txt: 'Que trabajen igual', ef: { trabajadores: -3 }, res: 'Golpes de calor en las fábricas' },
      ],
    },

    // ── Política ──
    {
      id: 'g_ministro_escandalo', fase: 'gobierno', peso: 3, repite: 14, desde: 15, dibujo: '🕵️ 💼 📰',
      titular: 'Un ministro, acusado de cobrar coimas',
      opciones: [
        { txt: 'Echarlo ya', costo: { pc: 2 }, ef: { media: 4, escandalo: -2 }, res: 'Tolerancia cero 🧹' },
        { txt: 'Defenderlo', ef: { escandalo: 4, media: -5 }, azar: { p: 0.4, ef: { escandalo: 4, todos: -4 }, txt: 'Aparecieron los videos 📹' }, res: 'Lo bancaste… a un costo' },
        { txt: 'Que decida la Justicia', ef: { escandalo: 2, media: -2 }, res: 'El tema sigue en las tapas' },
      ],
    },
    {
      id: 'g_audios', fase: 'gobierno', peso: 2, repite: 18, desde: 6, dibujo: '🎧 🤐 💣',
      titular: 'Filtran audios tuyos insultando a gobernadores',
      opciones: [
        { txt: 'Pedir disculpas', costo: { pc: 2 }, ef: { todos: 1 }, res: 'Disculpas aceptadas… a medias' },
        { txt: '«Son falsos»', ef: { escandalo: 3 }, azar: { p: 0.5, ef: { todos: -5 }, txt: 'Los peritos dicen que son reales 😬' }, res: 'Nadie sabe qué creer' },
        { txt: 'Redoblar la apuesta', ef: { media: -3, empresarios: 2, escandalo: 2 }, res: 'Pelea con todos los gobernadores' },
      ],
    },
    {
      id: 'g_vice', fase: 'gobierno', peso: 2, unaVez: true, desde: 8, dibujo: '🗡️ 🤵 🏛️',
      titular: 'Tu vice critica al gobierno en público',
      opciones: [
        { txt: 'Reunirte a solas', costo: { pc: 2 }, ef: { todos: 1 }, res: 'Paz… por ahora 🤝' },
        { txt: 'Romper con tu vice', ef: { media: -2, escandalo: 2 }, res: 'Guerra abierta en el gobierno ⚔️' },
        { txt: 'Ignorarlo', ef: { escandalo: 1 }, res: 'Las tapas hablan de la interna' },
      ],
    },
    {
      id: 'g_meme', fase: 'gobierno', peso: 2, repite: 12, dibujo: '😂 📱 🖼️',
      titular: 'Te hacen un meme que explota en redes',
      opciones: [
        { txt: 'Reírte y compartirlo', ef: { media: 3, humildes: 2 }, res: '¡Tenés calle! 😎' },
        { txt: 'Denunciar a los tuiteros', ef: { media: -5, escandalo: 1 }, res: 'Efecto Streisand: más memes', bueno: false },
      ],
    },
    {
      id: 'g_gobernadores', fase: 'gobierno', peso: 3, repite: 8, dibujo: '🗺️ 💰 🤝',
      titular: 'Los gobernadores piden más fondos',
      opciones: [
        { txt: 'Darles fondos', costo: { gasto: 2 }, ef: { pc: 3 }, res: 'Gobernadores contentos: más apoyo en el Congreso 🏛️' },
        { txt: 'Prometer obras', costo: { pc: 1 }, ef: { infra: 2 }, res: 'Promesas para la foto' },
        { txt: 'No hay plata', ef: { pc: -2, empresarios: 2 }, res: 'Los gobernadores se enojan', bueno: false },
      ],
    },
    {
      id: 'g_papa', fase: 'gobierno', peso: 1, unaVez: true, desde: 10, dibujo: '⛪ 🤍 🇦🇷',
      titular: 'El Papa anuncia que visita la Argentina',
      opciones: [
        { txt: 'Recibirlo con todo', costo: { gasto: 0.5 }, ef: { todos: 3, humildes: 3 }, res: 'Multitud en la 9 de Julio ⛪' },
        { txt: 'Visita protocolar', ef: { todos: 1 }, res: 'Correcto y breve' },
      ],
    },
    {
      id: 'g_influencer', fase: 'gobierno', peso: 2, repite: 12, dibujo: '🎙️ 📱 🔥',
      titular: 'Un streamer gigante te invita a su canal',
      opciones: [
        { txt: 'Ir', ef: { media: 3, humildes: 2 }, azar: { p: 0.3, ef: { media: -6 }, txt: 'Te trabaste en vivo 🫠' }, res: 'Récord de audiencia 🎮' },
        { txt: 'No ir', ef: {}, res: 'Nadie lo notó' },
      ],
    },

    // ── Fechas especiales ──
    {
      id: 'g_mundial', fase: 'gobierno', peso: 50, unaVez: true, desde: mes(2030, 6), hasta: mes(2030, 7), dibujo: '⚽ 🏆 🇦🇷',
      titular: '¡Argentina juega la final del Mundial!',
      opciones: [
        { txt: 'Feriado nacional', ef: { todos: 4, crec: -0.2 }, azar: { p: 0.5, ef: { todos: 6 }, txt: '¡SOMOS CAMPEONES DEL MUNDO! 🏆🎉', bueno: true, flag: 'campeon' }, res: 'Perdimos en los penales… 😭' },
        { txt: 'Verlo en la Rosada', ef: { todos: 1 }, azar: { p: 0.5, ef: { todos: 5 }, txt: '¡CAMPEONES! La gente te asocia con la alegría 🏆', bueno: true, flag: 'campeon' }, res: 'Perdimos la final 😢' },
      ],
    },
    {
      id: 'g_aguinaldo', fase: 'gobierno', peso: 6, repite: 11, cuando: (s) => R.mesDelAnio(s.mes) === 11, dibujo: '🎄 🥂 💵',
      titular: 'Llegan las fiestas: piden un bono navideño',
      opciones: [
        { txt: 'Bono navideño', costo: { gasto: 2 }, ef: { trabajadores: 5, humildes: 6, jubilados: 5, inflacion: 0.2 }, res: '¡Felices fiestas! 🎄' },
        { txt: 'Canasta navideña', costo: { gasto: 0.5 }, ef: { humildes: 3 }, res: 'Pan dulce para todos 🍞' },
        { txt: 'No hay plata', ef: { trabajadores: -3, humildes: -3, empresarios: 2 }, res: 'Fiestas austeras', bueno: false },
      ],
    },
  ]);
})(globalThis.R = globalThis.R || {});
