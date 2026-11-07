// Economía: presupuesto por áreas (en % del gasto), impuestos, déficit y la simulación mensual.
// Cada indicador guarda sus «causas» (cuánto aportó cada cosa) para el botón «¿Por qué?».
(function (R) {
  'use strict';

  const eco = (R.eco = {});

  // base = gasto inicial en % del PBI. El jugador mueve un «nivel» (0,5 = la mitad … 1,6 = 60 % más).
  R.AREAS = [
    { id: 'jubilaciones', emoji: '👵', nombre: 'Jubilaciones', base: 7.5,
      gana: [['👵', 'Jubilados', 3], ['🏚️', 'Pobreza', -1]] },
    { id: 'social', emoji: '🤲', nombre: 'Ayuda social', base: 1.5,
      gana: [['🏘️', 'Barrios humildes', 3], ['🏚️', 'Pobreza', -2], ['🏙️', 'Clase media', -1]] },
    { id: 'salud', emoji: '🏥', nombre: 'Salud', base: 0.7, calidad: 'salud',
      gana: [['🏥', 'Hospitales', 2], ['👵', 'Jubilados', 1], ['🏘️', 'Humildes', 1]] },
    { id: 'educacion', emoji: '🎓', nombre: 'Educación', base: 1.1, calidad: 'educacion',
      gana: [['🎓', 'Escuelas', 2], ['🏙️', 'Clase media', 2], ['🚀', 'Crecimiento futuro', 1]] },
    { id: 'seguridad', emoji: '👮', nombre: 'Seguridad', base: 0.7, calidad: 'seguridad',
      gana: [['👮', 'Menos delito', 2], ['🏙️', 'Clase media', 2]] },
    { id: 'defensa', emoji: '🪖', nombre: 'Defensa', base: 0.5, calidad: 'defensa',
      gana: [['🪖', 'Poder militar', 3]] },
    { id: 'obras', emoji: '🏗️', nombre: 'Obra pública', base: 0.8, calidad: 'infra',
      gana: [['📈', 'Crecimiento', 2], ['👷', 'Trabajadores', 2], ['🛣️', 'Rutas', 1]] },
    { id: 'subsidios', emoji: '⚡', nombre: 'Subsidios a tarifas', base: 1.5,
      gana: [['💡', 'Tarifas baratas', 3], ['🏘️', 'Humildes', 1], ['👵', 'Jubilados', 1]] },
    { id: 'ciencia', emoji: '🔬', nombre: 'Ciencia', base: 0.3, calidad: 'ciencia',
      gana: [['🔬', 'Inventos', 2], ['🚀', 'Crecimiento futuro', 1]] },
  ];
  R.AREA = Object.fromEntries(R.AREAS.map((a) => [a.id, a]));
  eco.NIVEL_MIN = 0.5;
  eco.NIVEL_MAX = 1.6;
  eco.nivelTxt = (m) => (m < 0.75 ? 'Recorte fuerte' : m < 0.95 ? 'Recorte' : m <= 1.05 ? 'Como estaba' : m <= 1.25 ? 'Más plata' : 'Mucha más plata');

  eco.IMPUESTOS = [
    { nombre: 'Muy bajos', recauda: 12.6 },
    { nombre: 'Bajos', recauda: 13.8 },
    { nombre: 'Normales', recauda: 15.0 },
    { nombre: 'Altos', recauda: 16.2 },
    { nombre: 'Muy altos', recauda: 17.4 },
  ];
  eco.RETENCIONES = [
    { nombre: 'Sin retenciones', pct: 0, recauda: 0 },
    { nombre: '10 %', pct: 10, recauda: 0.5 },
    { nombre: '20 %', pct: 20, recauda: 1.0 },
    { nombre: '30 %', pct: 30, recauda: 1.5 },
  ];
  eco.FINANCIAMIENTO = [
    { emoji: '🖨️', nombre: 'Emitir', desc: 'Más inflación', emision: 1 },
    { emoji: '⚖️', nombre: 'Mitad y mitad', desc: 'Un poco de cada', emision: 0.5 },
    { emoji: '🏦', nombre: 'Pedir prestado', desc: 'Más deuda', emision: 0 },
  ];

  eco.inicial = function () {
    const e = {
      pbi: 100,
      crec: 1.0,
      inflMes: 2.0,
      inflAnual: 27,
      inflHist: [2.1, 2.1, 2.0, 2.0, 2.1, 2.0, 2.0, 1.9, 2.0, 2.1, 2.0, 2.0],
      desempleo: 7.8,
      pobreza: 34,
      salarioReal: 100,
      reservas: 28,
      deuda: 78,
      riesgo: 750,
      dolar: 1550,
      brecha: 0,
      cepo: false,
      changuito: 120000,
      niveles: Object.fromEntries(R.AREAS.map((a) => [a.id, 1])),
      nivelesInicioMes: Object.fromEntries(R.AREAS.map((a) => [a.id, 1])),
      impuestos: 2,
      retenciones: 2,
      financiamiento: 1,
      impuestosInicioMes: 2,
      retencionesInicioMes: 2,
      calidad: { salud: 48, educacion: 50, seguridad: 42, defensa: 30, infra: 44, ciencia: 45 },
      gastoExtraAnio: 0, // gastos puntuales del año (en % del PBI)
      gastoExtraMes: 0,
      shocks: [], // [{k: 'crec'|'expo'|'infl', v, meses}]
      deficitAcumAnio: 0,
      causas: {},
      historia: [],
    };
    return e;
  };

  // ── Mediano plazo ──
  // Bonos permanentes (leyes, tratados). Los de las leyes «maduran»: llegan de a poco en 1-2 años
  // (una fábrica nueva no aparece el mismo mes que se firma la ley).
  eco.madurez = (s, m) => R.clamp((s.mes - m.desde) / m.meses, 0, 1);
  eco.bonus = function (s, k, sub) {
    const g = s.gob;
    if (!g) return 0;
    let v = sub ? (g[k] && g[k][sub]) || 0 : g[k] || 0;
    for (const m of g.madurando || []) {
      if (m.k === k && (!sub || m.sub === sub)) v -= m.v * (1 - eco.madurez(s, m));
    }
    return v;
  };
  // La torta: el PBI por habitante desde que asumiste. El gasto está en % del PBI, así que si la economía
  // crece, el mismo % alcanza para más (jubilaciones, ayuda, hospitales, escuelas). Si se achica, para menos.
  eco.torta = function (s) {
    const anios = s.gob ? Math.max(0, s.mes - s.gob.inicio) / 12 : 0;
    return R.clamp(s.eco.pbi / 100 / Math.pow(1.009, anios), 0.7, 1.4);
  };

  // ── Cuentas del presupuesto ──
  eco.gastoArea = (e, id) => R.AREA[id].base * e.niveles[id];
  eco.gastoPrimario = (e) => R.sum(R.AREAS.map((a) => eco.gastoArea(e, a.id)));
  eco.tasa = (e) => 1.6 + e.riesgo / 1000; // % anual que se paga por la deuda
  eco.intereses = (e) => (e.deuda * eco.tasa(e)) / 100;
  eco.gastoTotal = (e) => eco.gastoPrimario(e) + eco.intereses(e);
  eco.factorExpo = (s) => {
    const e = s.eco;
    let f = 1 + (2 - e.retenciones) * 0.06;
    if (e.cepo) f -= 0.05;
    if (s.gob) f += ((s.gob.grupos.campo.humor - 50) / 50) * 0.05;
    for (const sh of e.shocks) if (sh.k === 'expo') f += sh.v;
    f += eco.bonus(s, 'bonusExpo');
    return Math.max(0.5, f);
  };
  eco.recaudacion = (s) => {
    const e = s.eco;
    const evasion = 1 - 0.012 * Math.max(0, e.desempleo - 8) - 0.002 * Math.max(0, e.inflAnual - 60) / 10;
    const extra = eco.bonus(s, 'bonusRecauda');
    return eco.IMPUESTOS[e.impuestos].recauda * Math.max(0.8, evasion) + extra + eco.RETENCIONES[e.retenciones].recauda * eco.factorExpo(s);
  };
  eco.resultado = (s) => eco.recaudacion(s) - eco.gastoTotal(s.eco); // + superávit, − déficit (% PBI anual)
  eco.participacion = (e, id) => (eco.gastoArea(e, id) / eco.gastoPrimario(e)) * 100; // % del presupuesto

  // Gasto puntual en «% del presupuesto anual» → % del PBI.
  eco.gastoComoPBI = (s, pctPresupuesto) => (pctPresupuesto / 100) * eco.gastoTotal(s.eco);

  eco.inflAnualDe = (hist) => (hist.reduce((a, m) => a * (1 + m / 100), 1) - 1) * 100;

  // ── Un mes de economía ──
  eco.mes = function (s) {
    const e = s.eco;
    const g = s.gob;
    const m = e.niveles;
    const shock = (k) => R.sum(e.shocks.filter((x) => x.k === k).map((x) => x.v));
    const min = g ? R.MINISTROS[g.ministro] : null;
    const ley = (id) => !!(g && g.leyes && g.leyes[id]);
    const C = {}; // causas

    // 1) Cuentas fiscales del mes
    const rec = eco.recaudacion(s);
    const gasto = eco.gastoTotal(e);
    const deficitMes = (gasto - rec) / 12 + e.gastoExtraMes; // % del PBI de este mes
    e.gastoExtraMes = 0;
    e.deficitAcumAnio += deficitMes;
    const dolarizado = ley('dolarizacion');
    const emision = dolarizado ? 0 : eco.FINANCIAMIENTO[e.financiamiento].emision;
    const emitido = Math.max(0, deficitMes) * emision;
    const prestado = deficitMes > 0 ? deficitMes * (1 - emision) : deficitMes; // superávit = paga deuda

    // 2) Inflación
    const inercia = 0.55 * e.inflMes;
    let base = 0.45 * 0.8;
    let ancla = 0;
    if (min && min.ancla) ancla -= min.ancla;
    if (ley('bcra')) ancla -= 0.12;
    if (dolarizado) { base = 0.45 * 0.25; ancla = 0; }
    const pEmision = emitido * 18;
    const subsidiosAntes = e.nivelesInicioMes.subsidios;
    const pTarifas = m.subsidios < subsidiosAntes ? (subsidiosAntes - m.subsidios) * R.AREA.subsidios.base * 2.6 : 0;
    // Dólar: se mueve con la inflación más presión si faltan reservas.
    let presion = 0;
    if (e.reservas < 15) presion += (15 - e.reservas) * 0.18;
    if (!e.cepo && e.riesgo > 1200) presion += (e.riesgo - 1200) / 900;
    presion += shock('dolar');
    const pDolar = dolarizado ? 0 : presion * 0.38;
    const pShock = shock('infl');
    const pParitarias = g && g.grupos.trabajadores.humor < 30 ? 0.15 : 0;
    // Si la economía crece por inversión, rutas, confianza y exportaciones (no por gastar), hay más
    // producción y más competencia: los precios suben un poco menos. Si se derrumba la oferta, al revés.
    // Con inflación casi cero el efecto se apaga (los precios no bajan para siempre).
    const pOferta = -R.clamp((e.oferta || 0) * 0.03, -0.08, 0.1) * R.clamp(e.inflMes / 1.5, 0, 1);
    let infl = inercia + base + ancla + pEmision + pTarifas + pDolar + pShock + pParitarias + pOferta + R.gauss(s) * 0.12;
    infl = R.clamp(infl, -0.5, 60);
    C.inflacion = [
      { k: 'inercia', v: inercia + base },
      { k: 'emision', v: pEmision },
      { k: 'tarifas', v: pTarifas },
      { k: 'dolar', v: pDolar },
      { k: 'ancla', v: ancla },
      { k: 'oferta', v: pOferta },
      { k: 'shock', v: pShock + pParitarias },
    ];
    const inflAntes = e.inflMes;
    e.inflMes = infl;
    e.inflHist.push(infl);
    if (e.inflHist.length > 12) e.inflHist.shift();
    e.inflAnual = eco.inflAnualDe(e.inflHist);
    e.changuito *= 1 + infl / 100;

    // 3) Dólar y brecha
    if (!dolarizado) {
      const devalMes = Math.max(0, inflAntes * 0.95 + presion);
      e.dolar *= 1 + devalMes / 100;
      if (e.cepo) e.brecha = R.clamp(e.brecha * 0.9 + 3 + Math.max(0, e.inflAnual - 30) * 0.1 + Math.max(0, 15 - e.reservas), 5, 250);
      else e.brecha = Math.max(0, e.brecha * 0.5);
    }

    // 4) Crecimiento (anualizado)
    const pPot = 1.4;
    const pObras = 2.2 * (m.obras - 1) + (e.calidad.infra - 50) / 30;
    const pFuturo = (e.calidad.educacion - 50) / 45 + (e.calidad.ciencia - 50) / 45;
    const pConfianza = -(e.riesgo - 650) / 420;
    const pImpuestos = -0.7 * (e.impuestos - 2) - 0.3 * (e.retenciones - 2);
    const pInflacion = -Math.max(0, e.inflAnual - 35) / 25;
    const pCepo = e.cepo ? -0.7 : 0;
    const pExpo = (eco.factorExpo(s) - 1) * 6;
    const pGasto = 0.5 * (eco.gastoPrimario(e) - 14.6);
    const pShockCrec = shock('crec');
    const pMin = min && min.crec ? min.crec : 0;
    const pLeyes = eco.bonus(s, 'bonusCrec');
    let crecMes = pPot + pObras + pFuturo + pConfianza + pImpuestos + pInflacion + pCepo + pExpo + pGasto + pShockCrec + pMin + pLeyes + R.gauss(s) * 0.6;
    crecMes = R.clamp(crecMes, -15, 12);
    e.pbi *= 1 + crecMes / 1200;
    e.crec = e.crec * 0.82 + crecMes * 0.18;
    const oferta = pObras + pFuturo + pConfianza + pImpuestos + pExpo + pMin + pLeyes;
    e.oferta = (e.oferta || 0) * 0.85 + oferta * 0.15;
    C.crecimiento = [
      { k: 'obras', v: pObras }, { k: 'futuro', v: pFuturo }, { k: 'confianza', v: pConfianza }, { k: 'impuestos', v: pImpuestos },
      { k: 'inflacion', v: pInflacion }, { k: 'cepo', v: pCepo }, { k: 'expo', v: pExpo }, { k: 'gasto', v: pGasto },
      { k: 'shock', v: pShockCrec }, { k: 'ministro', v: pMin + pLeyes },
    ];

    // 5) Empleo
    const desObj = R.clamp(7.5 - 0.5 * (e.crec - 1.5) - eco.bonus(s, 'bonusEmpleo'), 2.5, 30);
    const desAntes = e.desempleo;
    e.desempleo = R.clamp(e.desempleo + (desObj - e.desempleo) * 0.09 + shock('desempleo'), 2, 35);
    C.desempleo = [{ k: 'crecimiento', v: (e.desempleo - desAntes) }];

    // 6) Salario real: las paritarias corren detrás de la inflación. Y a mediano plazo los sueldos siguen
    // a la productividad: si la economía crece y falta gente para trabajar, las empresas pagan más.
    const paritaria = 0.75 * inflAntes + 0.25 * Math.min(infl, inflAntes * 1.5) + 0.04 + (g && g.grupos.trabajadores.humor < 35 ? 0.1 : 0) + shock('salario');
    const tiron = 0.05 * e.crec + 0.03 * (7.5 - e.desempleo);
    const salAntes = e.salarioReal;
    e.salarioReal = R.clamp(e.salarioReal * (1 + (paritaria + tiron - infl) / 100), 45, 160);
    C.salario = [{ k: 'inflacion', v: (salAntes * (paritaria - infl)) / 100 }, { k: 'productividad', v: (salAntes * tiron) / 100 }];

    // 7) Pobreza
    const pDes = 1.0 * (e.desempleo - 7.5);
    const pSal = 0.4 * (100 - e.salarioReal);
    const pInf = 0.12 * Math.max(0, e.inflAnual - 15);
    const torta = eco.torta(s);
    const pSocial = -6 * (m.social * torta - 1) - 3 * (m.jubilaciones * torta - 1);
    const pobObj = R.clamp(29 + pDes + pSal + pInf + pSocial, 3, 75);
    e.pobreza = R.clamp(e.pobreza + (pobObj - e.pobreza) * 0.1, 3, 75);
    C.pobreza = [{ k: 'desempleo', v: pDes }, { k: 'salario', v: pSal }, { k: 'inflacion', v: pInf }, { k: 'social', v: pSocial }];

    // 8) Reservas (miles de millones de dólares)
    const expo = 6.6 * eco.factorExpo(s);
    const impo = 6.0 * (1 + (e.crec - 1.5) / 40) * (e.cepo ? 0.92 : 1);
    const pagos = 0.55 + (e.deuda / 100) * 0.15;
    const fuga = e.cepo ? 0 : Math.max(0, (e.riesgo - 900) / 1000) * 0.6 + Math.max(0, e.inflAnual - 60) / 200;
    const prestamos = shock('reservas');
    const dRes = expo - impo - pagos - fuga + prestamos;
    e.reservas = R.clamp(e.reservas + dRes, -5, 250);
    C.reservas = [{ k: 'comercio', v: expo - impo }, { k: 'pagos', v: -pagos }, { k: 'fuga', v: -fuga }, { k: 'prestamos', v: prestamos }];

    // 9) Deuda y riesgo país
    e.deuda = R.clamp(e.deuda + prestado * 1.0 - e.deuda * (crecMes / 1200) + shock('deuda'), 5, 300);
    const defAnual = -eco.resultado(s);
    const riesgoObj = R.clamp(320 + 7 * Math.max(0, e.deuda - 45) + 70 * Math.max(0, defAnual) + 3.5 * Math.max(0, e.inflAnual - 20)
      - 5 * (e.reservas - 25) + (e.cepo ? 120 : 0) + shock('riesgo') + (min && min.riesgo ? min.riesgo : 0) - (ley('bcra') ? 80 : 0), 150, 5000);
    e.riesgo = R.clamp(e.riesgo + (riesgoObj - e.riesgo) * 0.2, 150, 5000);

    // 10) Calidad de cada área: va lento hacia lo que le das.
    for (const a of R.AREAS) {
      if (!a.calidad) continue;
      const obj = R.clamp(50 + 48 * (m[a.id] * torta - 1) - Math.max(0, e.inflAnual - 40) * 0.08 + eco.bonus(s, 'bonusCalidad', a.calidad), 5, 97);
      e.calidad[a.calidad] = R.clamp(e.calidad[a.calidad] + (obj - e.calidad[a.calidad]) * 0.06, 0, 100);
    }

    // 11) Los shocks se gastan y las leyes que ya maduraron dejan de estar «en camino»
    if (g && g.madurando) {
      const listas = new Set();
      g.madurando = g.madurando.filter((x) => {
        if (eco.madurez(s, x) < 1) return true;
        listas.add(x.ley);
        return false;
      });
      for (const id of listas) if (R.LEY && R.LEY[id] && !g.madurando.some((x) => x.ley === id)) R.diario(s, R.LEY[id].emoji, R.LEY[id].nombre + ': ya da todo su efecto', 'ley');
    }
    e.shocks.forEach((x) => x.meses--);
    e.shocks = e.shocks.filter((x) => x.meses > 0);
    e.causas = C;
    e.ultimoDeficitMes = deficitMes;
    return C;
  };

  // Foto del mes (para gráficos y para comparar).
  eco.foto = function (s) {
    const e = s.eco;
    return {
      mes: s.mes, aprob: s.gob ? s.gob.aprob : null, inflMes: e.inflMes, inflAnual: e.inflAnual, crec: e.crec, desempleo: e.desempleo,
      pobreza: e.pobreza, salarioReal: e.salarioReal, reservas: e.reservas, deuda: e.deuda, riesgo: e.riesgo, dolar: e.dolar,
      changuito: e.changuito, resultado: eco.resultado(s),
    };
  };

  // Textos de causas para «¿Por qué?».
  R.CAUSAS = {
    inflacion: {
      inercia: ['🔁', 'Los precios vienen subiendo'], emision: ['🖨️', 'Emitiste para pagar el déficit'], tarifas: ['⚡', 'Subieron las tarifas'],
      dolar: ['💵', 'Saltó el dólar'], ancla: ['⚓', 'Confían en tu plan'], shock: ['💥', 'Golpes de este mes'],
      oferta: ['🏭', 'Más producción y competencia'],
    },
    crecimiento: {
      obras: ['🏗️', 'Obra pública y rutas'], futuro: ['🎓', 'Educación y ciencia'], confianza: ['📊', 'Riesgo país'],
      impuestos: ['🧾', 'Impuestos y retenciones'], inflacion: ['🛒', 'La inflación frena todo'], cepo: ['🔒', 'El cepo'],
      expo: ['🚢', 'Exportaciones'], gasto: ['💸', 'Gasto del Estado'], shock: ['💥', 'Clima y sorpresas'], ministro: ['🧑‍💼', 'Tu ministro y tus leyes'],
    },
    pobreza: {
      desempleo: ['👷', 'Falta de trabajo'], salario: ['💰', 'Sueldos que no alcanzan'], inflacion: ['🛒', 'Precios altos'], social: ['🤲', 'Ayuda social y jubilaciones'],
    },
    reservas: {
      comercio: ['🚢', 'Exportaciones menos importaciones'], pagos: ['🏦', 'Pago de deuda'], fuga: ['✈️', 'Gente que se lleva los dólares'], prestamos: ['🤝', 'Préstamos'],
    },
  };
})(globalThis.R = globalThis.R || {});
