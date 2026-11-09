// Producción por sectores. Cada sector tiene un nivel (como «cuántos campos, pozos, fábricas u oficinas hay»).
// Subir un nivel = más PBI, más empleo y, si exporta, más dólares. Lo sube el Estado con obras o los privados si les conviene.
(function (R) {
  'use strict';

  // Lo que se vende al mundo: cada producto tiene un precio que sube y baja (1 = normal).
  R.PRODUCTOS = {
    granos: { emoji: '🌽', nombre: 'Granos y carne' },
    energia: { emoji: '🛢️', nombre: 'Petróleo, gas y litio' },
    manufacturas: { emoji: '⚙️', nombre: 'Manufacturas' },
    software: { emoji: '💾', nombre: 'Software' },
  };

  // nivel0: nivel al asumir. pbi: % de PBI que suma cada nivel. empleo: puntos de desempleo que baja cada nivel.
  // expo: cuánto suma a las exportaciones cada nivel (× el precio del mundo). meses y gasto: lo que tarda y cuesta
  // (en % del presupuesto por mes) una obra del Estado. leyes: cuánto atraen a los privados las leyes que pasaste.
  R.SECTORES = [
    {
      id: 'campo', emoji: '🌾', nombre: 'Campo', producto: 'granos', grupo: 'campo', nivel0: 6,
      pbi: 0.8, empleo: 0.12, expo: 0.035, meses: 4, gasto: 0.5, obra: 'Silos, puertos y caminos rurales',
      leyes: { retenciones_cero: 0.5, trenes: 0.25, junta_granos: -0.4, humedales: -0.25, reforma_laboral: 0.1 },
    },
    {
      id: 'energia', emoji: '⛽', nombre: 'Energía', producto: 'energia', grupo: 'empresarios', nivel0: 4,
      pbi: 1.0, empleo: 0.08, expo: 0.04, meses: 6, gasto: 0.8, obra: 'Pozos, gasoductos y represas',
      leyes: { vaca_muerta: 0.7, litio: 0.45, glaciares: 0.35, renovables: 0.3, inversiones: 0.45, privatizar: 0.2, estatizar: -0.5 },
    },
    {
      id: 'industria', emoji: '🏭', nombre: 'Industria', producto: 'manufacturas', grupo: 'trabajadores', nivel0: 6,
      pbi: 1.2, empleo: 0.3, expo: 0.012, meses: 5, gasto: 0.7, obra: 'Parques industriales',
      leyes: { industria_nacional: 0.35, banco_desarrollo: 0.45, educacion_tecnica: 0.3, pymes: 0.3, reforma_laboral: 0.25, inversiones: 0.3, acuerdo_social: 0.15, apertura: -0.4 },
    },
    {
      id: 'tecno', emoji: '💻', nombre: 'Tecnología', producto: 'software', grupo: 'media', nivel0: 3,
      pbi: 1.0, empleo: 0.1, expo: 0.02, meses: 4, gasto: 0.5, obra: 'Polos tecnológicos',
      leyes: { conocimiento: 0.7, ciencia: 0.35, universidades: 0.3, reforma_laboral: 0.15, competencia_monedas: 0.1 },
    },
  ];
  R.SECTOR = Object.fromEntries(R.SECTORES.map((x) => [x.id, x]));
  R.NIVEL_MAX_SECTOR = 15;
})(globalThis.R = globalThis.R || {});
