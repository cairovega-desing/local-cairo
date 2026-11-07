// Noticias de la campaña. Titulares cortos, opciones de 1 a 3 palabras.
// ef usa las claves de efectos.js; ideoDer/ideoIzq dependen de tus ideas; azar = chance de que salga distinto.
(function (R) {
  'use strict';

  const rivalAzar = (s) => ({ rival: R.pick(s, R.RIVALES.slice(0, 4)) });
  const rivalPuntero = (s) => {
    const e = R.camp.votos(s).nac;
    return { rival: R.RIVALES.reduce((a, b) => (e[a] > e[b] ? a : b)) };
  };

  R.ev.registrar([
    {
      id: 'c_baile', fase: 'campana', peso: 2, dibujo: '🕺 📱 🔥',
      titular: 'Se viraliza un video tuyo bailando cumbia',
      opciones: [
        { txt: 'Subir otro', ef: { conocen: 6 }, azar: { p: 0.4, ef: { simpatia: -3 }, txt: 'El segundo no causó gracia 😬' }, res: '¡Ya sos tendencia! 💃' },
        { txt: 'Reírte de vos', ef: { conocen: 4, simpatia: 3 }, res: 'La gente valora el humor 😄' },
        { txt: 'Pedir que lo bajen', ef: { conocen: 1, simpatia: -2 }, res: 'Quedaste como amargo', bueno: false },
      ],
    },
    {
      id: 'c_empresario', fase: 'campana', peso: 2, dibujo: '💼 💰 🤫',
      titular: 'Un empresario ofrece plata para tu campaña',
      bajada: 'No pide nada… por ahora',
      opciones: [
        { txt: 'Aceptar', ef: { fondos: 55, sucio: 2 }, res: 'La caja se llenó 💰' },
        { txt: 'Aceptar y declararlo', ef: { fondos: 30, ideoIzq: 1 }, res: 'Todo en blanco ✅' },
        { txt: 'Rechazar', ef: { simpatia: 1.5 }, res: 'Manos limpias 🙌' },
      ],
    },
    {
      id: 'c_filtracion', fase: 'campana', peso: 6, cuando: (s) => s.camp.sucio >= 2, dibujo: '📰 🔍 💸',
      titular: 'Filtran quién financia tu campaña',
      opciones: [
        { txt: 'Negar todo', ef: {}, azar: { p: 0.55, ef: { simpatia: -8 }, txt: 'Aparecieron más papeles 😱' }, res: 'Zafaste… esta vez', despues: (s) => (s.camp.sucio = 0) },
        { txt: 'Mostrar las cuentas', ef: { simpatia: -3 }, res: 'Duele, pero se termina el tema', despues: (s) => (s.camp.sucio = 0) },
        { txt: 'Echar al tesorero', ef: { simpatia: -1.5, militancia: -4 }, res: 'Rodó una cabeza', despues: (s) => (s.camp.sucio = 0) },
      ],
    },
    {
      id: 'c_streamer', fase: 'campana', peso: 2, dibujo: '🎮 🎙️ 👾',
      titular: 'Un streamer famoso te invita a su canal',
      opciones: [
        { txt: 'Ir', ef: { conocen: 6, simpatia: 1 }, azar: { p: 0.3, ef: { simpatia: -5 }, txt: 'No entendiste ningún chiste 🫠' }, res: 'Los pibes te conocen 🎮' },
        { txt: 'Mandar un vocero', ef: { conocen: 2 }, res: 'Correcto, sin brillo' },
        { txt: 'No ir', ef: {}, res: 'Nadie se enteró' },
      ],
    },
    {
      id: 'c_acusacion', fase: 'campana', peso: 3, vars: rivalPuntero, dibujo: '🗡️ 😠 📺',
      titular: '{rival} dice que sos un improvisado',
      cuando: (s) => s.camp.conocen > 15,
      opciones: [
        { txt: 'Responder fuerte', ef: (s, v) => ({ confrontativo: 2, rival: { [v.rival]: -1.5 } }), res: 'Pelea en todos los canales 🥊' },
        { txt: 'Con humor', ef: { simpatia: 3, conocen: 2 }, azar: { p: 0.3, ef: { simpatia: -4 }, txt: 'El chiste no salió 😶' }, res: '¡Ganaste el día! 😂' },
        { txt: 'Ignorar', ef: { simpatia: -1.5 }, res: 'Quedó flotando', bueno: false },
      ],
    },
    {
      id: 'c_sindicato', fase: 'campana', peso: 2, dibujo: '👷 🤝 📣',
      titular: 'Un sindicato grande ofrece apoyarte',
      opciones: [
        { txt: 'Aceptar', ef: { militancia: 14, ideoIzq: 3 }, res: 'Sumás micros y fiscales 🚌' },
        { txt: 'Gracias, no', ef: { ideoDer: 1.5 }, res: 'Mantenés distancia' },
      ],
    },
    {
      id: 'c_campo', fase: 'campana', peso: 2, dibujo: '🌾 🚜 ❓',
      titular: 'El campo te pide definirte sobre retenciones',
      opciones: [
        { txt: 'Bajarlas', ef: { presencia: { centro: 10 }, ideoDer: 3 }, res: 'Aplausos en la ruta 🚜' },
        { txt: 'Mantenerlas', ef: { simpatia: 0.5 }, res: 'Ni fu ni fa' },
        { txt: 'Subirlas', ef: { presencia: { centro: -10 }, ideoIzq: 3 }, res: 'El campo se enoja 😤' },
      ],
    },
    {
      id: 'c_inundacion', fase: 'campana', peso: 2, dibujo: '🌧️ 🏠 🛶',
      titular: 'Inundaciones en el Litoral',
      opciones: [
        { txt: 'Ir a ayudar', costo: { agenda: 1 }, ef: { presencia: { litoral: 14 }, simpatia: 3 }, res: 'Con las botas en el barro 👢' },
        { txt: 'Mandar donaciones', costo: { fondos: 15 }, ef: { presencia: { litoral: 6 }, simpatia: 2 }, res: 'Llegaron camiones con ayuda 🚚' },
        { txt: 'Tuit de apoyo', ef: { simpatia: -1 }, res: '«Pura foto», dicen', bueno: false },
      ],
    },
    {
      id: 'c_afiches', fase: 'campana', peso: 2, dibujo: '🧱 🖌️ 😤',
      titular: 'Te arrancan los afiches en todo el país',
      opciones: [
        { txt: 'Repintar todo', costo: { fondos: 10 }, ef: { militancia: 4, conocen: 1 }, res: 'La militancia sale de noche 🖌️' },
        { txt: 'Denunciarlo en la tele', ef: { conocen: 3, simpatia: 1 }, res: 'Quedaste como víctima' },
      ],
    },
    {
      id: 'c_jingle', fase: 'campana', peso: 2, dibujo: '🎵 🎤 🎶',
      titular: 'Te proponen un jingle pegadizo',
      opciones: [
        { txt: 'Comprarlo', costo: { fondos: 20 }, ef: { conocen: 6 }, res: 'Lo canta todo el país 🎶' },
        { txt: 'Hacerlo casero', ef: { militancia: 3 }, azar: { p: 0.35, ef: { conocen: 6 }, txt: '¡El casero pegó más! 🎸', bueno: true }, res: 'Simpático, nada más' },
        { txt: 'Sin jingle', ef: {}, res: 'Campaña seria' },
      ],
    },
    {
      id: 'c_provincial', fase: 'campana', peso: 2, vars: (s) => ({ prov: R.pick(s, R.PROVINCIAS.filter((p) => p.padron < 4)).id }),
      dibujo: '🤝 🗺️ 📍',
      titular: 'Un partido de {prov} quiere sumarse',
      opciones: [
        { txt: 'Aceptar', ef: (s, v) => ({ presencia: { [v.prov]: 25 }, militancia: 3, simpatia: -0.5 }), res: 'Sumás estructura local 🏘️' },
        { txt: 'Rechazar', ef: { simpatia: 0.5 }, res: 'Lista pura' },
      ],
    },
    {
      id: 'c_fake', fase: 'campana', peso: 2, dibujo: '🤥 📲 💥',
      titular: 'Circula una noticia falsa sobre vos',
      cuando: (s) => s.camp.conocen > 12,
      opciones: [
        { txt: 'Desmentir', costo: { fondos: 5 }, ef: { simpatia: -0.5 }, res: 'Aclarado a tiempo' },
        { txt: 'Ignorar', ef: {}, azar: { p: 0.5, ef: { simpatia: -5 }, txt: 'Mucha gente se la creyó 😩' }, res: 'Se olvidó rápido' },
        { txt: 'Ir a la Justicia', costo: { agenda: 1 }, ef: { simpatia: 1.5, conocen: 1 }, res: 'Mostrás que no tenés nada que esconder' },
      ],
    },
    {
      id: 'c_pan', fase: 'campana', peso: 2, dibujo: '🍞 🎤 😰',
      titular: 'Te preguntan cuánto sale el kilo de pan',
      opciones: [
        { txt: 'Arriesgar un número', ef: { simpatia: 4 }, azar: { p: 0.45, ef: { simpatia: -8 }, txt: 'Le erraste por mucho 🤦' }, res: '¡Clavado! Sabés lo que vive la gente' },
        { txt: 'Cambiar de tema', ef: { simpatia: -2 }, res: 'Se notó', bueno: false },
        { txt: 'Admitir que no sabés', ef: { simpatia: 1 }, res: 'Honesto, al menos' },
      ],
    },
    {
      id: 'c_asado', fase: 'campana', peso: 2, dibujo: '🥩 🔥 🍷',
      titular: 'La militancia organiza un asado gigante',
      opciones: [
        { txt: 'Ir a cocinar', costo: { agenda: 1 }, ef: { militancia: 7, simpatia: 2 }, res: 'Asador del año 🥩' },
        { txt: 'Mandar saludos', ef: { militancia: 1 }, res: 'Te extrañaron' },
      ],
    },
    {
      id: 'c_exministro', fase: 'campana', peso: 2, dibujo: '👴 💼 🤔',
      titular: 'Un exministro quiere sumarse a tu equipo',
      opciones: [
        { txt: 'Sumarlo', ef: { conocen: 3, militancia: 5, simpatia: -2 }, res: 'Experiencia… y mochila' },
        { txt: 'Caras nuevas', ef: { simpatia: 1.5 }, res: '«Lo nuevo», dicen' },
      ],
    },
    {
      id: 'c_meme', fase: 'campana', peso: 2, dibujo: '😂 📱 🖼️',
      titular: 'Te hacen un meme que explota',
      cuando: (s) => s.camp.conocen > 10,
      opciones: [
        { txt: 'Usarlo de slogan', ef: { conocen: 5, simpatia: 2 }, res: 'Convertiste la burla en marca 😎' },
        { txt: 'Enojarte', ef: { conocen: 2, simpatia: -3 }, res: 'Más memes 😅', bueno: false },
      ],
    },
    {
      id: 'c_cumbre', fase: 'campana', peso: 1, dibujo: '✈️ 🌎 🤝',
      titular: 'Te invitan a una cumbre en el exterior',
      opciones: [
        { txt: 'Ir', costo: { agenda: 1 }, ef: { simpatia: 2, conocen: 2 }, res: 'Foto con líderes del mundo 📸' },
        { txt: 'Quedarte acá', ef: { simpatia: 0.5 }, res: 'Prioridad: los argentinos' },
      ],
    },
    {
      id: 'c_rival_escandalo', fase: 'campana', peso: 2, vars: rivalAzar, dibujo: '📰 💥 🕵️',
      titular: 'Escándalo de corrupción salpica a {rival}',
      opciones: [
        { txt: 'Aprovechar', ef: (s, v) => ({ rival: { [v.rival]: -3 }, simpatia: -1 }), res: 'Le pegaste donde duele' },
        { txt: 'Pedir respeto', ef: (s, v) => ({ rival: { [v.rival]: -1.5 }, simpatia: 3 }), res: 'Quedaste como un estadista' },
      ],
    },
    {
      id: 'c_dolar', fase: 'campana', peso: 2, dibujo: '💵 📈 😨',
      titular: 'El dólar se dispara en plena campaña',
      opciones: [
        { txt: 'Prometer dolarizar', ef: { ideoDer: 4, conocen: 2 }, res: 'Todos hablan de tu propuesta' },
        { txt: 'Culpar al gobierno', ef: { rival: { PL: -2 }, simpatia: 0.5 }, res: 'Golpe al oficialismo ⚡' },
        { txt: 'Llevar calma', ef: { simpatia: 2, dialoguista: 1.5 }, res: 'Sonás a alguien serio' },
      ],
    },
    {
      id: 'c_docentes', fase: 'campana', peso: 2, dibujo: '🎓 ✋ 🏫',
      titular: 'Paro docente: te piden que te definas',
      opciones: [
        { txt: 'Con los docentes', ef: { ideoIzq: 3, simpatia: 1 }, res: 'Las aulas te aplauden 👩‍🏫' },
        { txt: 'Clases sí o sí', ef: { ideoDer: 3, simpatia: 1 }, res: 'Los padres te bancan 👪' },
      ],
    },
    {
      id: 'c_crimen', fase: 'campana', peso: 2, dibujo: '🚨 😢 🕯️',
      titular: 'Un crimen conmociona al país',
      opciones: [
        { txt: 'Mano dura', ef: { ideoDer: 3, conocen: 2 }, res: 'Mensaje firme 👮' },
        { txt: 'Acompañar a la familia', costo: { agenda: 1 }, ef: { simpatia: 3 }, res: 'Un gesto humano 🕯️' },
        { txt: 'Prudencia', ef: { simpatia: 0.5 }, res: 'Nadie te escuchó' },
      ],
    },
    {
      id: 'c_encuestadora', fase: 'campana', peso: 1, dibujo: '📊 💵 🤨',
      titular: 'Una encuestadora te ofrece «mejorar» tus números',
      opciones: [
        { txt: 'Pagar', costo: { fondos: 20 }, ef: { conocen: 3, sucio: 1 }, res: 'Apareciste arriba en la tele 📈' },
        { txt: 'Denunciarlo', ef: { simpatia: 2.5 }, res: 'Bien ahí 👏' },
      ],
    },
    {
      id: 'c_vice', fase: 'campana', peso: 4, desde: 3, dibujo: '👥 🤝 🗳️',
      titular: '¿Con quién armás la fórmula?',
      bajada: 'Tu compañero/a de fórmula',
      opciones: [
        { txt: 'Un gobernador', ef: { presencia: { norte: 10 }, militancia: 5 }, res: 'Sumás territorio 🌵' },
        { txt: 'Una economista', ef: { ideoDer: 2, simpatia: 1 }, res: 'Sumás credibilidad 📊' },
        { txt: 'Alguien de tu riñón', ef: { simpatia: 1.5, conocen: -1 }, res: 'Lealtad absoluta 🫡' },
      ],
    },
    {
      id: 'c_lluvia_acto', fase: 'campana', peso: 1, dibujo: '⛈️ 🎤 ☂️',
      titular: 'Diluvia en tu acto más grande',
      opciones: [
        { txt: 'Hablar igual', ef: { simpatia: 2, militancia: 3 }, azar: { p: 0.2, ef: { simpatia: -3 }, txt: 'Se cortó el sonido 🔇' }, res: 'Épico bajo la lluvia ☔' },
        { txt: 'Suspender', ef: { militancia: -2 }, res: 'Prudente, pero frío', bueno: false },
      ],
    },
    {
      id: 'c_tiktok', fase: 'campana', peso: 2, dibujo: '🎬 📱 🕺',
      titular: 'Tu equipo quiere que hagas TikToks diarios',
      opciones: [
        { txt: '¡Dale!', costo: { fondos: 8 }, ef: { conocen: 5 }, azar: { p: 0.25, ef: { simpatia: -2 }, txt: 'Un poco cringe 😅' }, res: 'Llegás a los jóvenes 📱' },
        { txt: 'Prefiero la radio', ef: { simpatia: 1 }, res: 'Estilo clásico 📻' },
      ],
    },
    {
      id: 'c_papa', fase: 'campana', peso: 1, dibujo: '⛪ 🤍 📸',
      titular: 'El Papa recibe a los candidatos en Roma',
      opciones: [
        { txt: 'Viajar', costo: { agenda: 1, fondos: 10 }, ef: { simpatia: 3, conocen: 3 }, res: 'La foto recorre el país 📸' },
        { txt: 'No viajar', ef: {}, res: 'Te la perdiste' },
      ],
    },
  ]);
})(globalThis.R = globalThis.R || {});
