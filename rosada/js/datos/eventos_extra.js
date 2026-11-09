// Más noticias para que cada partida sea distinta (gobierno y campaña).
(function (R) {
  'use strict';
  const mes = (anio, m) => R.mesNum(anio, m);
  const rivalAzar = (s) => ({ rival: R.pick(s, R.RIVALES.slice(0, 4)) });

  R.ev.registrar([
    // ── Gobierno ──
    {
      id: 'g_camioneros', fase: 'gobierno', peso: 2, repite: 14, dibujo: '🚚 🛑 🛒',
      titular: 'Camioneros bloquean los centros de distribución',
      opciones: [
        { txt: 'Darles el aumento', costo: { gasto: 1 }, ef: { trabajadores: 5, inflacion: 0.3, empresarios: -3 }, res: 'Vuelven los camiones 🚚' },
        { txt: 'Conciliación obligatoria', costo: { pc: 2 }, ef: { trabajadores: -2, media: 2 }, res: 'Tregua de 15 días ⏳' },
        { txt: 'Aguantar', ef: { media: -5, humildes: -4, crec: -0.5 }, res: 'Góndolas vacías una semana 😱', bueno: false },
      ],
    },
    {
      id: 'g_corte_jubilados', fase: 'gobierno', peso: 2, repite: 24, desde: 8, dibujo: '⚖️ 👵 💸',
      titular: 'La Corte ordena pagar juicios a jubilados',
      opciones: [
        { txt: 'Pagar todo', costo: { gasto: 3 }, ef: { jubilados: 10, media: 2 }, res: 'Miles de abuelos cobran lo que les debían 👵' },
        { txt: 'Pagar en cuotas', costo: { gasto: 1 }, ef: { jubilados: 3 }, res: 'De a poco, pero pagás' },
        { txt: 'Apelar', ef: { jubilados: -8, escandalo: 1 }, res: '«Esperan que se mueran», dicen', bueno: false },
      ],
    },
    {
      id: 'g_corte_vacante', fase: 'gobierno', peso: 2, unaVez: true, desde: 10, dibujo: '⚖️ 🪑 🧑‍⚖️',
      titular: 'Queda una vacante en la Corte Suprema',
      opciones: [
        { txt: 'Un juez amigo', ef: { escandalo: 3, media: -4, pc: 3 }, res: 'Tenés un aliado en la Corte… y críticas' },
        { txt: 'Una jueza prestigiosa', costo: { pc: 2 }, ef: { media: 5, escandalo: -2 }, res: 'Aplausos de todos lados ⚖️' },
      ],
    },
    {
      id: 'g_cerebros', fase: 'gobierno', peso: 2, repite: 18, cuando: (s) => s.eco.calidad.ciencia < 45, dibujo: '🔬 ✈️ 😢',
      titular: 'Cientos de científicos se van del país',
      opciones: [
        { txt: 'Programa de repatriación', costo: { gasto: 1 }, ef: { ciencia: 6, media: 3 }, res: 'Vuelven investigadores a casa 🔬' },
        { txt: 'Que se vayan', ef: { ciencia: -4, media: -3 }, res: 'Fuga de talentos', bueno: false },
      ],
    },
    {
      id: 'g_turismo', fase: 'gobierno', peso: 2, repite: 12, cuando: (s) => s.eco.dolar > 2500 || s.eco.inflAnual < 30, dibujo: '🧳 🏔️ 💵',
      titular: 'Récord de turistas extranjeros este verano',
      opciones: [
        { txt: 'Campaña en el exterior', costo: { gasto: 0.5 }, ef: { reservas: 3, empresarios: 3, trabajadores: 2 }, res: 'Bariloche e Iguazú llenos 🏔️' },
        { txt: 'Cobrar tasa turística', ef: { reservas: 1, empresarios: -2 }, res: 'Un poquito más de recaudación' },
      ],
    },
    {
      id: 'g_cripto', fase: 'gobierno', peso: 1, unaVez: true, dibujo: '🪙 📉 😭',
      titular: 'Una estafa cripto deja miles de ahorristas sin nada',
      opciones: [
        { txt: 'Investigación a fondo', costo: { pc: 1 }, ef: { media: 4 }, res: 'Detienen a los responsables 🚔' },
        { txt: 'Regular las cripto', ef: { media: 2, empresarios: -2 }, res: 'Reglas nuevas para el sector' },
        { txt: '«Problema de ellos»', ef: { media: -5 }, res: 'Indignación general', bueno: false },
      ],
    },
    {
      id: 'g_colectivos', fase: 'gobierno', peso: 2, repite: 12, dibujo: '🚌 🛑 🚶',
      titular: 'Paro de colectivos en el AMBA',
      opciones: [
        { txt: 'Más subsidios al transporte', ef: { trabajadores: 3, media: 2 }, despues: (s) => { s.eco.niveles.subsidios = Math.min(1.6, R.round(s.eco.niveles.subsidios + 0.05, 2)); s.eco.nivelesInicioMes.subsidios = s.eco.niveles.subsidios; }, res: 'Vuelven los colectivos 🚌' },
        { txt: 'Que suba el boleto', ef: { humildes: -5, media: -3, empresarios: 2 }, res: 'Boleto más caro', bueno: false },
      ],
    },
    {
      id: 'g_parana', fase: 'gobierno', peso: 2, repite: 24, dibujo: '🌊 🚢 🏜️',
      titular: 'Bajante histórica del Paraná: los barcos no pueden cargar',
      opciones: [
        { txt: 'Dragar urgente', costo: { gasto: 1.5 }, ef: { expo: -0.03, infra: 3 }, res: 'Los barcos vuelven a salir' },
        { txt: 'Esperar que llueva', ef: { expo: -0.08, campo: -4 }, res: 'Se pierden millones en exportaciones', bueno: false },
      ],
    },
    {
      id: 'g_hackeo', fase: 'gobierno', peso: 1, unaVez: true, dibujo: '💻 🔓 📂',
      titular: 'Hackean a la agencia de impuestos y filtran datos',
      opciones: [
        { txt: 'Plan de ciberseguridad', costo: { gasto: 0.5 }, ef: { ciencia: 3, media: 2 }, res: 'Sistemas blindados 🛡️' },
        { txt: 'Minimizarlo', ef: { media: -4, escandalo: 1 }, res: 'Los datos de todos, en internet', bueno: false },
      ],
    },
    {
      id: 'g_pandemia', fase: 'gobierno', peso: 1, unaVez: true, desde: 14, dibujo: '🦠 😷 🏥',
      titular: 'Un virus nuevo llega al país',
      opciones: [
        { txt: 'Cuarentena estricta', ef: { salud: 4, crec: -3, todos: 2, empresarios: -8, trabajadores: -4 }, res: 'Todos en casa 🏠' },
        { txt: 'Vacunas y cuidados', costo: { gasto: 3 }, ef: { salud: 3, jubilados: 4 }, res: 'Se frena el contagio 💉' },
        { txt: 'Que siga la vida', ef: { crec: -0.5, jubilados: -8, salud: -6 }, res: 'Hospitales desbordados 😷', bueno: false },
      ],
    },
    {
      id: 'g_trenes', fase: 'gobierno', peso: 2, repite: 18, cuando: (s) => s.eco.calidad.infra < 50, dibujo: '🚆 💥 🚑',
      titular: 'Choque de trenes en el conurbano',
      opciones: [
        { txt: 'Plan ferroviario', costo: { gasto: 2 }, ef: { infra: 7, trabajadores: 3, media: 2 }, res: 'Trenes nuevos en camino 🚆' },
        { txt: 'Echar a los responsables', costo: { pc: 1 }, ef: { media: 2 }, res: 'Rodaron cabezas' },
        { txt: 'Mala suerte', ef: { media: -6, humildes: -4 }, res: 'La gente no te lo perdona', bueno: false },
      ],
    },
    {
      id: 'g_satelite', fase: 'gobierno', peso: 1, unaVez: true, cuando: (s) => s.eco.calidad.ciencia >= 50, dibujo: '🛰️ 🚀 ☀️',
      titular: '¡Lanzan un satélite hecho en Argentina!',
      opciones: [
        { txt: 'Celebrarlo en cadena', ef: { todos: 3, ciencia: 3 }, res: 'Orgullo nacional en órbita 🛰️' },
        { txt: 'Venderle satélites al mundo', ef: { reservas: 3, ciencia: 2, empresarios: 3 }, res: '¡Exportamos tecnología! 🚀' },
      ],
    },
    {
      id: 'g_olimpicos', fase: 'gobierno', peso: 40, unaVez: true, desde: mes(2028, 7), hasta: mes(2028, 8), dibujo: '🏅 🏃 🏊',
      titular: 'Juegos Olímpicos: Las Leonas van por el oro',
      opciones: [
        { txt: 'Becas para atletas', costo: { gasto: 0.5 }, ef: { media: 3 }, azar: { p: 0.5, ef: { todos: 4 }, txt: '¡MEDALLA DE ORO! 🥇', bueno: true }, res: 'Medalla de plata 🥈' },
        { txt: 'Mirarlo por TV', ef: { todos: 1 }, azar: { p: 0.4, ef: { todos: 3 }, txt: '¡ORO para Argentina! 🥇', bueno: true }, res: 'Bronce, igual se festeja 🥉' },
      ],
    },
    {
      id: 'g_alquileres', fase: 'gobierno', peso: 2, repite: 14, dibujo: '🏠 💸 📈',
      titular: 'Los alquileres se van por las nubes',
      opciones: [
        { txt: 'Créditos hipotecarios', costo: { gasto: 1.5 }, ef: { media: 6, trabajadores: 3 }, res: 'Miles sacan su crédito para la casa 🏠' },
        { txt: 'Congelar alquileres', ef: { media: 3, empresarios: -4 }, azar: { p: 0.4, ef: { media: -6 }, txt: 'Desaparecen los departamentos en alquiler 🙃' }, res: 'Alivio para inquilinos' },
        { txt: 'No intervenir', ef: { media: -4, empresarios: 3 }, res: 'Los inquilinos sufren', bueno: false },
      ],
    },
    {
      id: 'g_frio', fase: 'gobierno', peso: 2, repite: 12, cuando: (s) => [5, 6].includes(R.mesDelAnio(s.mes)), dibujo: '🥶 🔥 🧯',
      titular: 'Ola polar: falta gas en las casas',
      opciones: [
        { txt: 'Importar gas caro', ef: { reservas: -3, humildes: 3, jubilados: 3 }, res: 'Las estufas vuelven a prender 🔥' },
        { txt: 'Cortarles a las fábricas', ef: { humildes: 2, empresarios: -6, crec: -0.4 }, res: 'Las casas primero' },
        { txt: 'Pedir que ahorren', ef: { jubilados: -5, humildes: -4 }, res: 'Mucho frío en los barrios 🥶', bueno: false },
      ],
    },
    {
      id: 'g_carne', fase: 'gobierno', peso: 2, repite: 14, dibujo: '🥩 📈 🐄',
      titular: 'El asado está más caro que nunca',
      opciones: [
        { txt: 'Cerrar exportaciones de carne', ef: { media: 3, humildes: 3, campo: -10, expo: -0.03 }, res: 'Baja un poco la carne, el campo furioso 🐄' },
        { txt: 'Cortes a precio fijo', costo: { pc: 1 }, ef: { humildes: 4, campo: -2 }, res: 'Asado para todos los domingos 🥩' },
        { txt: 'No intervenir', ef: { humildes: -3, campo: 4 }, res: 'Más pollo y menos vaca' },
      ],
    },
    {
      id: 'g_gnl', fase: 'gobierno', peso: 2, unaVez: true, desde: 12, dibujo: '🔥 🚢 💰',
      titular: 'Proponen exportar gas licuado al mundo',
      opciones: [
        { txt: 'Construir la planta', costo: { gasto: 2 }, ef: { expo: 0.08, trabajadores: 4, empresarios: 4 }, res: 'Barcos de gas argentino al mundo 🚢' },
        { txt: 'Con inversión privada', ef: { expo: 0.05, empresarios: 6, trabajadores: -2 }, res: 'La hacen empresas extranjeras' },
      ],
    },
    {
      id: 'g_apuestas', fase: 'gobierno', peso: 1, unaVez: true, dibujo: '🎰 📱 🧒',
      titular: 'Furor de apuestas online entre adolescentes',
      opciones: [
        { txt: 'Prohibir la publicidad', costo: { pc: 1 }, ef: { media: 5, empresarios: -2 }, res: 'Los padres te agradecen 👪' },
        { txt: 'Cobrarles impuestos', ef: { media: 1, empresarios: -3 }, res: 'Algo de recaudación' },
      ],
    },
    {
      id: 'g_intendentes', fase: 'gobierno', peso: 2, repite: 12, dibujo: '🏘️ 🧑‍💼 💰',
      titular: 'Los intendentes del conurbano piden fondos',
      opciones: [
        { txt: 'Obras en los barrios', costo: { gasto: 1.5 }, ef: { humildes: 6, infra: 2 }, res: 'Cloacas y asfalto 🚧' },
        { txt: 'Solo a los aliados', costo: { gasto: 0.5 }, ef: { pc: 1, escandalo: 1 }, res: 'Premio a los propios' },
        { txt: 'No hay plata', ef: { humildes: -3 }, res: 'Los intendentes te critican' },
      ],
    },
    {
      id: 'g_motochorros', fase: 'gobierno', peso: 2, repite: 12, cuando: (s) => s.eco.calidad.seguridad < 55, dibujo: '🏍️ 📱 😱',
      titular: 'Ola de robos en moto en las grandes ciudades',
      opciones: [
        { txt: 'Más patrulleros', costo: { gasto: 1 }, ef: { seguridad: 4, media: 4 }, res: 'Patrulleros en cada esquina 🚓' },
        { txt: 'Cámaras y tecnología', costo: { gasto: 0.8 }, ef: { seguridad: 3, ciencia: 1, media: 3 }, res: 'Ciudades con ojos 📹' },
        { txt: 'Que se arreglen solos', ef: { media: -4 }, res: '«El gobierno no hace nada»', bueno: false },
      ],
    },
    {
      id: 'g_censo', fase: 'gobierno', peso: 1, unaVez: true, desde: 18, dibujo: '📋 🏠 📊',
      titular: 'El censo revela más pobreza de la esperada',
      opciones: [
        { txt: 'Plan contra el hambre', costo: { gasto: 2 }, ef: { humildes: 7, pobreza: -1 }, res: 'Comedores y tarjetas alimentarias 🍲' },
        { txt: 'Discutir los números', ef: { media: -3, escandalo: 1 }, res: 'Nadie te cree', bueno: false },
      ],
    },
    {
      id: 'g_inversores_chinos', fase: 'gobierno', peso: 1, unaVez: true, desde: 6, dibujo: '🏭 🐉 💵',
      titular: 'Una empresa china quiere comprar una minera',
      opciones: [
        { txt: 'Aprobar', ef: { reservas: 4, empresarios: 2, rel: { CHN: 6, USA: -5 } }, res: 'Llegan los dólares chinos 💵' },
        { txt: 'Socia de una argentina', costo: { pc: 1 }, ef: { reservas: 2, trabajadores: 2 }, res: 'Mitad y mitad' },
        { txt: 'Rechazar', ef: { rel: { CHN: -8, USA: 4 } }, res: 'Cerrado a China' },
      ],
    },

    // ── Campaña ──
    {
      id: 'c_caravana', fase: 'campana', peso: 2, dibujo: '🚗 🎉 📣',
      titular: 'Te proponen una caravana por el conurbano',
      opciones: [
        { txt: '¡Vamos!', costo: { agenda: 1, fondos: 10 }, ef: { presencia: { BUE: 14 }, conocen: 2 }, res: 'Bocinazos en todo el conurbano 📣' },
        { txt: 'Muy riesgoso', ef: {}, res: 'Te quedás en el búnker' },
      ],
    },
    {
      id: 'c_famoso_critica', fase: 'campana', peso: 2, cuando: (s) => s.camp.conocen > 20, dibujo: '🎤 🌟 😤',
      titular: 'Un cantante famoso te critica en un show',
      opciones: [
        { txt: 'Invitarlo a charlar', ef: { simpatia: 3, dialoguista: 1 }, res: 'Charla buena onda que se viraliza 🎶' },
        { txt: 'Responderle fuerte', ef: { conocen: 3, confrontativo: 2 }, res: 'Grieta con sus fans 🔥' },
        { txt: 'Ignorarlo', ef: { simpatia: -1 }, res: 'El tema se apaga' },
      ],
    },
    {
      id: 'c_rivales_unidos', fase: 'campana', peso: 2, desde: 4, vars: rivalAzar, dibujo: '🤝 🗡️ 😬',
      titular: '{rival} y otro partido se unen contra vos',
      opciones: [
        { txt: 'Denunciar «la casta unida»', ef: (s, v) => ({ simpatia: 2, rival: { [v.rival]: -1 } }), res: 'Te paraste del lado de la gente' },
        { txt: 'Buscar tu propia alianza', costo: { agenda: 1 }, ef: { militancia: 5, presencia: { todas: 3 } }, res: 'Sumás dirigentes del interior' },
      ],
    },
    {
      id: 'c_app_caida', fase: 'campana', peso: 1, dibujo: '📱 💥 🙃',
      titular: 'Se cae tu app de afiliación: demasiada gente',
      opciones: [
        { txt: 'Chiste en redes', ef: { conocen: 3, simpatia: 1 }, res: '«Somos tantos que rompimos todo» 😂' },
        { txt: 'Contratar servidores', costo: { fondos: 10 }, ef: { militancia: 4 }, res: 'Miles de afiliados nuevos 📝' },
      ],
    },
    {
      id: 'c_fiscales_gremio', fase: 'campana', peso: 2, desde: 5, cuando: (s) => s.camp.militancia < 50, dibujo: '🗳️ 👷 🧾',
      titular: 'Un gremio te ofrece fiscales para votar',
      opciones: [
        { txt: 'Aceptar', ef: { militancia: 12, ideoIzq: 1.5 }, res: 'Mesas cubiertas en todo el país 🧾' },
        { txt: 'Pagar fiscales propios', costo: { fondos: 25 }, ef: { militancia: 10 }, res: 'Fiscales tuyos y de confianza' },
        { txt: 'Arreglarse como se pueda', ef: {}, res: 'Ojo con las mesas sin fiscal' },
      ],
    },
    {
      id: 'c_spot_copiado', fase: 'campana', peso: 1, vars: rivalAzar, dibujo: '📺 📋 😠',
      titular: '{rival} copió tu spot de campaña',
      opciones: [
        { txt: 'Escracharlo', ef: (s, v) => ({ conocen: 3, rival: { [v.rival]: -0.5 } }), res: 'Todos hablan de tu spot original 📺' },
        { txt: 'Agradecerle', ef: { simpatia: 3 }, res: '«Gracias por la publicidad» 😎' },
      ],
    },
    {
      id: 'c_marcha_apoyo', fase: 'campana', peso: 2, desde: 3, cuando: (s) => s.camp.militancia > 25, dibujo: '🚶 🚶 🏴',
      titular: 'Tu militancia organiza una marcha gigante',
      opciones: [
        { txt: 'Encabezarla', costo: { agenda: 1 }, ef: { militancia: 6, conocen: 3, simpatia: 1 }, res: 'Ríos de gente con tus banderas 🏴' },
        { txt: 'Que vaya tu equipo', ef: { militancia: 2 }, res: 'Linda foto, sin vos' },
      ],
    },
    {
      id: 'c_entrevista_internacional', fase: 'campana', peso: 1, cuando: (s) => s.camp.conocen > 30, dibujo: '🌍 📰 🎙️',
      titular: 'Un diario internacional quiere entrevistarte',
      opciones: [
        { txt: 'Dar la entrevista', ef: { simpatia: 2, ideoDer: 1 }, azar: { p: 0.25, ef: { simpatia: -4 }, txt: 'Sacaron una frase de contexto 😬' }, res: 'Te presentan como «la sorpresa argentina»' },
        { txt: 'Prioridad: medios locales', ef: { conocen: 2 }, res: 'Mejor la radio del barrio 📻' },
      ],
    },
  ]);
})(globalThis.R = globalThis.R || {});
