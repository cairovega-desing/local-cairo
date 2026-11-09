// Metas con plazo. dato: el número que se mira; objetivo: a dónde hay que llevarlo; baja: true si hay que bajarlo.
// Las «grandes» se eligen al asumir (una, según tu ideología) y duran el mandato. Las otras aparecen solas cuando
// pasa algo (si) y tienen unos meses (plazo). premio y castigo son efectos de gobierno.
(function (R) {
  'use strict';
  const e = (s) => s.eco;
  const nivel = (id) => (s) => (R.prod && s.prod ? R.prod.nivel(s, id) : R.SECTOR[id].nivel0);

  R.METAS_GRANDES = [
    // Estado presente
    { id: 'g_pobreza', idea: 'estado', emoji: '🏘️', nombre: 'Pobreza bajo 15 %', dato: (s) => e(s).pobreza, objetivo: 15, baja: true, fmt: (v) => R.fmt(v) + '%' },
    { id: 'g_industria', idea: 'estado', emoji: '🏭', nombre: 'Industria a nivel 10', dato: nivel('industria'), objetivo: 10, fmt: (v) => 'nivel ' + v },
    { id: 'g_empleo', idea: 'estado', emoji: '👷', nombre: 'Desempleo bajo 4 %', dato: (s) => e(s).desempleo, objetivo: 4, baja: true, fmt: (v) => R.fmt(v, 1) + '%' },
    // Centro
    { id: 'g_energia', idea: 'centro', emoji: '⛽', nombre: 'Energía a nivel 9', dato: nivel('energia'), objetivo: 9, fmt: (v) => 'nivel ' + v },
    { id: 'g_pbipc', idea: 'centro', emoji: '💵', nombre: 'PBI por persona de US$ 18.000', dato: (s) => R.eco.pbiPorHabitante(s), objetivo: 18000, fmt: (v) => 'US$ ' + R.fmt(Math.round(v / 100) * 100) },
    { id: 'g_potencia', idea: 'centro', emoji: '🏆', nombre: 'Primera potencia de Sudamérica', dato: (s) => (R.mundo && R.mundo.ventajaRegional ? R.mundo.ventajaRegional(s) : 0.5), objetivo: 1, fmt: (v) => Math.round(v * 100) + '% del primero' },
    // Mercado
    { id: 'g_inflacion', idea: 'mercado', emoji: '🛒', nombre: 'Inflación bajo 5 % al año', dato: (s) => e(s).inflAnual, objetivo: 5, baja: true, fmt: (v) => R.fmt(v, 1) + '%' },
    { id: 'g_riesgo', idea: 'mercado', emoji: '📊', nombre: 'Riesgo país bajo 300', dato: (s) => e(s).riesgo, objetivo: 300, baja: true, fmt: (v) => R.fmt(v) + ' puntos' },
    { id: 'g_expo', idea: 'mercado', emoji: '🚢', nombre: 'Exportar 50 % más', dato: (s) => R.eco.factorExpo(s), objetivo: 1.5, fmt: (v) => '+' + Math.round((v - 1) * 100) + '%' },
  ];
  R.METAS_GRANDES.forEach((m) => {
    m.grande = true;
    m.premio = { pc: 5, todos: 6, prestigio: 15 };
    m.castigo = { todos: -3, media: -3 };
  });

  R.METAS = [
    { id: 'inflacion', emoji: '🛒', nombre: 'Domar la inflación', si: (s) => e(s).inflAnual > 50, dato: (s) => e(s).inflAnual, objetivo: 25, baja: true, plazo: 24,
      fmt: (v) => R.fmt(v) + '%', premio: { pc: 3, todos: 4, prestigio: 5 }, castigo: { todos: -4 } },
    { id: 'cepo', emoji: '🔓', nombre: 'Salir del cepo', si: (s) => e(s).cepo, dato: (s) => (e(s).cepo ? 1 : 0), objetivo: 0, baja: true, plazo: 18,
      fmt: (v) => (v ? 'con cepo' : 'sin cepo'), premio: { pc: 2, empresarios: 6, campo: 4 }, castigo: { empresarios: -4, campo: -3 } },
    { id: 'energia', emoji: '⚡', nombre: 'Autoabastecimiento energético', si: (s) => s.prod && s.gob.meses >= 3 && R.prod.energia(s).saldo < -0.3,
      dato: (s) => R.prod.energia(s).saldo, objetivo: 0.5, plazo: 30, fmt: (v) => (v >= 0 ? 'sobra ' : 'falta ') + R.fmt(Math.abs(v), 1),
      premio: { pc: 3, reservas: 4, todos: 2, prestigio: 5 }, castigo: { todos: -2 } },
    { id: 'deuda', emoji: '💳', nombre: 'Bajar la deuda', si: (s) => e(s).deuda > 85, dato: (s) => e(s).deuda, objetivo: 65, baja: true, plazo: 36,
      fmt: (v) => R.fmt(v) + '% del PBI', premio: { pc: 3, riesgo: -100 }, castigo: { riesgo: 100 } },
    { id: 'crecer', emoji: '📈', nombre: 'Volver a crecer', si: (s) => e(s).crec < -1.5, dato: (s) => e(s).crec, objetivo: 2, plazo: 12,
      fmt: (v) => R.fmt(v, 1) + '% al año', premio: { pc: 2, todos: 3 }, castigo: { todos: -3 } },
    { id: 'reservas', emoji: '🏦', nombre: 'Juntar reservas', si: (s) => e(s).reservas < 12, dato: (s) => e(s).reservas, objetivo: 30, plazo: 18,
      fmt: (v) => 'US$ ' + R.fmt(v) + ' mil M', premio: { pc: 2, riesgo: -80 }, castigo: { riesgo: 100 } },
    { id: 'pobreza', emoji: '🏚️', nombre: 'Bajar la pobreza', si: (s) => e(s).pobreza > 40, dato: (s) => e(s).pobreza, objetivo: 30, baja: true, plazo: 30,
      fmt: (v) => R.fmt(v) + '%', premio: { pc: 3, humildes: 6 }, castigo: { humildes: -5, todos: -2 } },
    { id: 'desempleo', emoji: '🚪', nombre: 'Crear trabajo', si: (s) => e(s).desempleo > 11, dato: (s) => e(s).desempleo, objetivo: 8, baja: true, plazo: 18,
      fmt: (v) => R.fmt(v, 1) + '%', premio: { pc: 2, trabajadores: 6 }, castigo: { trabajadores: -5 } },
    { id: 'cuentas', emoji: '⚖️', nombre: 'Ordenar las cuentas', si: (s) => s.gob.meses >= 4 && R.eco.resultado(s) < -1.5, dato: (s) => R.eco.resultado(s), objetivo: 0, plazo: 18,
      fmt: (v) => (v >= 0 ? 'superávit ' : 'déficit ') + R.fmt(Math.abs(v), 1) + '%', premio: { pc: 2, riesgo: -80 }, castigo: { riesgo: 80 } },
    // Oportunidades (para tener qué buscar cuando las cosas andan bien)
    { id: 'polo_tecno', emoji: '💻', nombre: 'Polo tecnológico de la región', si: (s) => s.prod && R.prod.nivel(s, 'tecno') >= 5, dato: nivel('tecno'), objetivo: 8, plazo: 24,
      fmt: (v) => 'nivel ' + v, premio: { pc: 3, media: 4, prestigio: 8 }, castigo: {} },
    { id: 'granero', emoji: '🌾', nombre: 'Granero del mundo', si: (s) => s.mundo && s.mundo.precios && s.mundo.precios.granos > 1.15, dato: nivel('campo'), objetivo: 10, plazo: 20,
      fmt: (v) => 'nivel ' + v, premio: { pc: 3, campo: 5, prestigio: 6 }, castigo: {} },
    { id: 'malvinas', emoji: '🏝️', nombre: 'Malvinas: mitad del camino', si: (s) => s.mundo && !s.mundo.malvinas.recuperadas && s.mundo.malvinas.soberania >= 20,
      dato: (s) => s.mundo.malvinas.soberania, objetivo: 50, plazo: 24, fmt: (v) => v + '%', premio: { pc: 3, todos: 4, prestigio: 10 }, castigo: {} },
  ];
  R.META = Object.fromEntries(R.METAS.concat(R.METAS_GRANDES).map((m) => [m.id, m]));
})(globalThis.R = globalThis.R || {});
