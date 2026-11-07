// La gente: seis grupos con cara y nombre. peso = cuánto pesa en la aprobación; ideo = qué ideas prefieren.
(function (R) {
  'use strict';

  R.GRUPOS = [
    { id: 'trabajadores', emoji: '👷', nombre: 'Trabajadores', personaje: 'Julio', oficio: 'metalúrgico', peso: 20, ideo: -0.55,
      avatar: { piel: 2, pelo: 0, colorPelo: 0, anteojos: 0, barba: 1, ropa: 1 } },
    { id: 'campo', emoji: '🌾', nombre: 'El campo', personaje: 'Pedro', oficio: 'chacarero', peso: 5, ideo: 0.65,
      avatar: { piel: 1, pelo: 5, colorPelo: 4, anteojos: 0, barba: 0, ropa: 3 } },
    { id: 'empresarios', emoji: '💼', nombre: 'Empresarios', personaje: 'Laura', oficio: 'dueña de una pyme', peso: 5, ideo: 0.75,
      avatar: { piel: 0, pelo: 3, colorPelo: 2, anteojos: 2, barba: 0, ropa: 0 } },
    { id: 'media', emoji: '🏙️', nombre: 'Clase media', personaje: 'Sofía', oficio: 'docente', peso: 30, ideo: 0.15,
      avatar: { piel: 1, pelo: 2, colorPelo: 1, anteojos: 1, barba: 0, ropa: 4 } },
    { id: 'humildes', emoji: '🏚️', nombre: 'Barrios humildes', personaje: 'Kevin', oficio: 'repartidor', peso: 25, ideo: -0.6,
      avatar: { piel: 3, pelo: 4, colorPelo: 0, anteojos: 0, barba: 0, ropa: 2 } },
    { id: 'jubilados', emoji: '👵', nombre: 'Jubilados', personaje: 'Doña Marta', oficio: 'jubilada', peso: 15, ideo: -0.2,
      avatar: { piel: 0, pelo: 3, colorPelo: 4, anteojos: 1, barba: 0, ropa: 4 } },
  ];
  R.GRUPO = Object.fromEntries(R.GRUPOS.map((g) => [g.id, g]));

  // Cara según humor 0-100.
  R.cara = (v) => (v >= 72 ? '😄' : v >= 56 ? '🙂' : v >= 42 ? '😐' : v >= 28 ? '🙁' : '😠');
  R.humorAvatar = (v) => (v >= 62 ? 'feliz' : v >= 42 ? 'normal' : v >= 28 ? 'triste' : 'enojado');

  // Cuánto le gustás de entrada a cada grupo según tus ideas (0-100).
  R.simpatiaInicialGrupo = (g, ideo) => R.clamp(50 + 30 * (0.75 - Math.abs(g.ideo - ideo) * 1.2), 22, 78);
})(globalThis.R = globalThis.R || {});
