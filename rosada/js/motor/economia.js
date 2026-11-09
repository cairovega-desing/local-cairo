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
      // Lo que la economía «siente» de impuestos y retenciones: se acomoda de a poco (siembras, inversiones).
      impEf: 2,
      retEf: 2,
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

  // ── Ritmo del juego ──
  // Un mandato son 48 turnos y se juega en más o menos una hora. Por eso las cosas pasan más rápido
  // y pegan más fuerte que en la vida real: para que lo que hacés se note dentro del mandato.
  // Acá se ajusta todo junto.
  eco.RITMO = {
    madura: 1 / 3, // las leyes dan todo su efecto en un tercio del tiempo (18 meses → 6)
    impacto: 1.5, // y pegan un 50 % más fuerte (lo bueno y lo malo)
    reaccion: 2.2, // empleo, pobreza, calidad, inversión y confianza se acomodan ~2 veces más rápido
  };
  const RX = (k) => Math.min(0.6, k * eco.RITMO.reaccion);
  eco.mesesMadura = (meses) => Math.max(2, Math.round((meses || 18) * eco.RITMO.madura));

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
  // PBI en dólares (a precios de hoy): arranca como el de la Argentina (~US$ 640 mil millones, 46,5 M de habitantes).
  eco.PBI_USD = 640;
  eco.POBLACION = 46.5;
  eco.pbiUSD = (s) => (eco.PBI_USD * s.eco.pbi) / 100; // miles de millones de dólares
  eco.pbiPorHabitante = (s) => {
    const anios = s.gob ? Math.max(0, s.mes - s.gob.inicio) / 12 : 0;
    return (eco.pbiUSD(s) * 1000) / (eco.POBLACION * Math.pow(1.009, anios)); // dólares por persona
  };
  eco.deudaUSD = (s) => (s.eco.deuda / 100) * eco.pbiUSD(s);
  // La cadena: más riesgo país = más interés por la deuda = más gasto = más déficit = más deuda.
  // (más sensible que en la vida real, para que se note: 700 puntos ≈ 2,4 % anual, 150 ≈ 1,1 %, 1500 ≈ 4,1 %)
  eco.tasa = (e) => 0.8 + e.riesgo / 450; // % anual que se pagaría hoy por deuda nueva
  // La tasa que pagás de verdad se acomoda de a poco (la deuda vieja sigue con la tasa vieja).
  eco.tasaPagada = (e) => e.tasaEf ?? eco.tasa(e);
  eco.intereses = (e) => (e.deuda * eco.tasaPagada(e)) / 100;
  eco.gastoTotal = (e) => eco.gastoPrimario(e) + eco.intereses(e);
  eco.factorExpo = (s) => {
    const e = s.eco;
    let f = 1 + (2 - (e.retEf ?? e.retenciones)) * 0.06;
    if (e.cepo) f -= 0.05;
    if (s.mundo) f -= (s.mundo.panico || 0) * 0.0015; // con pánico, el mundo te compra menos
    if (s.gob) f += ((s.gob.grupos.campo.humor - 50) / 50) * 0.05;
    for (const sh of e.shocks) if (sh.k === 'expo') f += sh.v;
    // Leyes y tratados: suman exportaciones, con techo (no se puede exportar el doble por decreto).
    const bExpo = eco.bonus(s, 'bonusExpo');
    f += Math.sign(bExpo) * 0.45 * (1 - Math.exp(-Math.abs(bExpo) / 0.45));
    // Sectores: más campos, pozos y fábricas = más para vender (× el precio del mundo).
    if (R.prod && s.prod) f += R.prod.expoExtra(s);
    // Tratados: rinden más si producís lo que ese país compra.
    if (R.mundo && R.mundo.extraComercio && s.mundo) f += R.mundo.extraComercio(s);
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
    // Leyes que mueven los precios: competencia, apertura, acuerdos (bajan) o protección, controles que rebotan (suben).
    // (lo que baja los precios se apaga cerca de cero: no hay deflación por ley)
    let pLeyesInfl = eco.bonus(s, 'bonusPrecios');
    if (pLeyesInfl < 0) pLeyesInfl *= R.clamp(e.inflMes / 1.2, 0, 1);
    // Recalentamiento: si la economía crece muy rápido y no hay gente para trabajar, suben precios y sueldos.
    const pRecal = Math.max(0, e.crec - 5) * 0.05 + Math.max(0, 4 - e.desempleo) * 0.05;
    let infl = inercia + base + ancla + pEmision + pTarifas + pDolar + pShock + pParitarias + pOferta + pLeyesInfl + pRecal + R.gauss(s) * 0.12;
    infl = R.clamp(infl, -0.5, 60);
    C.inflacion = [
      { k: 'inercia', v: inercia + base },
      { k: 'emision', v: pEmision },
      { k: 'tarifas', v: pTarifas },
      { k: 'dolar', v: pDolar },
      { k: 'ancla', v: ancla },
      { k: 'oferta', v: pOferta },
      { k: 'leyes', v: pLeyesInfl },
      { k: 'recalentamiento', v: pRecal },
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
    const pObras = 3.2 * (m.obras - 1) + (e.calidad.infra - 50) / 22;
    const pFuturo = (e.calidad.educacion - 50) / 30 + (e.calidad.ciencia - 50) / 30;
    const pConfianza = -(e.riesgo - 650) / 420;
    const pImpuestos = -0.7 * ((e.impEf ?? e.impuestos) - 2) - 0.3 * ((e.retEf ?? e.retenciones) - 2);
    const pInflacion = -Math.max(0, e.inflAnual - 35) / 25;
    const pCepo = e.cepo ? -0.7 : 0;
    // Exportar más empuja, pero con techo: duplicar lo que vendés no duplica el crecimiento.
    const pExpo = 3.2 * Math.tanh((eco.factorExpo(s) - 1) / 0.45);
    const pGasto = 0.5 * (eco.gastoPrimario(e) - 14.6);
    const pShockCrec = shock('crec');
    const pMin = min && min.crec ? min.crec : 0;
    // Leyes: cada una suma, pero con rendimientos decrecientes (no se crece al infinito a fuerza de leyes).
    const bCrec = eco.bonus(s, 'bonusCrec');
    const pLeyes = Math.sign(bCrec) * 3 * (1 - Math.exp(-Math.abs(bCrec) / 3));
    // Sectores: la tecnología sube la productividad; si falta energía, la industria frena.
    const pSectores = R.prod && s.prod ? R.prod.crecExtra(s) : 0;
    // Techo: con casi todos trabajando no se puede crecer mucho más rápido (falta gente).
    const pCapacidad = -Math.max(0, 5 - e.desempleo) * 1.8;
    let crecMes = pPot + pObras + pFuturo + pConfianza + pImpuestos + pInflacion + pCepo + pExpo + pGasto + pShockCrec + pMin + pLeyes + pSectores + pCapacidad + R.gauss(s) * 0.6;
    crecMes = R.clamp(crecMes, -15, 12);
    e.pbi *= 1 + crecMes / 1200;
    e.crec = e.crec * (1 - RX(0.18)) + crecMes * RX(0.18);
    const oferta = pObras + pFuturo + pConfianza + pImpuestos + pExpo + pMin + pLeyes + pSectores;
    e.oferta = (e.oferta || 0) * (1 - RX(0.15)) + oferta * RX(0.15);
    C.crecimiento = [
      { k: 'obras', v: pObras }, { k: 'futuro', v: pFuturo }, { k: 'confianza', v: pConfianza }, { k: 'impuestos', v: pImpuestos },
      { k: 'inflacion', v: pInflacion }, { k: 'cepo', v: pCepo }, { k: 'expo', v: pExpo }, { k: 'gasto', v: pGasto },
      { k: 'shock', v: pShockCrec }, { k: 'ministro', v: pMin + pLeyes }, { k: 'sectores', v: pSectores }, { k: 'capacidad', v: pCapacidad },
    ];

    // 5) Empleo
    const desObj = R.clamp(7.5 - 0.5 * (e.crec - 1.5) - eco.bonus(s, 'bonusEmpleo'), 2.5, 30);
    const desAntes = e.desempleo;
    e.desempleo = R.clamp(e.desempleo + (desObj - e.desempleo) * RX(0.09) + shock('desempleo'), 2, 35);
    C.desempleo = [{ k: 'crecimiento', v: (e.desempleo - desAntes) }];

    // 6) Salario real: las paritarias corren detrás de la inflación. Y a mediano plazo los sueldos siguen
    // a la productividad: si la economía crece y falta gente para trabajar, las empresas pagan más.
    const paritaria = 0.75 * inflAntes + 0.25 * Math.min(infl, inflAntes * 1.5) + 0.04 + (g && g.grupos.trabajadores.humor < 35 ? 0.1 : 0) + shock('salario');
    const tiron = 0.08 * e.crec + 0.05 * (7.5 - e.desempleo) + eco.bonus(s, 'bonusSalario');
    const salAntes = e.salarioReal;
    e.salarioReal = R.clamp(e.salarioReal * (1 + (paritaria + tiron - infl) / 100), 45, 160);
    C.salario = [{ k: 'inflacion', v: (salAntes * (paritaria - infl)) / 100 }, { k: 'productividad', v: (salAntes * tiron) / 100 }];

    // 7) Pobreza
    const pDes = 1.0 * (e.desempleo - 7.5);
    const pSal = 0.4 * (100 - e.salarioReal);
    const pInf = 0.12 * Math.max(0, e.inflAnual - 15);
    const torta = eco.torta(s);
    const pSocial = -9 * (m.social * torta - 1) - 4.5 * (m.jubilaciones * torta - 1);
    const pobObj = R.clamp(29 + pDes + pSal + pInf + pSocial, 7, 75);
    e.pobreza = R.clamp(e.pobreza + (pobObj - e.pobreza) * RX(0.1), 3, 75);
    C.pobreza = [{ k: 'desempleo', v: pDes }, { k: 'salario', v: pSal }, { k: 'inflacion', v: pInf }, { k: 'social', v: pSocial }];

    // 8) Reservas (miles de millones de dólares)
    const expo = 6.6 * eco.factorExpo(s);
    const impo = 6.0 * (1 + (e.crec - 1.5) / 40) * (e.cepo ? 0.92 : 1) * Math.max(0.6, 1 + eco.bonus(s, 'bonusImpo'));
    const pagos = 0.55 + (e.deuda / 100) * 0.15;
    const fuga = e.cepo ? 0 : Math.max(0, (e.riesgo - 900) / 1000) * 0.6 + Math.max(0, e.inflAnual - 60) / 200;
    const prestamos = shock('reservas');
    const pEnergia = R.prod && s.prod ? R.prod.costoEnergia(s) : 0; // si falta energía, se compra afuera
    const dRes = expo - impo - pagos - fuga + prestamos + pEnergia;
    e.reservas = R.clamp(e.reservas + dRes, -5, 250);
    C.reservas = [{ k: 'comercio', v: expo - impo }, { k: 'energia', v: pEnergia }, { k: 'pagos', v: -pagos }, { k: 'fuga', v: -fuga }, { k: 'prestamos', v: prestamos }];

    // 9) Deuda y riesgo país
    // La deuda sube con el déficit que no se emite, baja con superávit (se paga sola) y, si la economía crece,
    // pesa menos en % del PBI aunque no pagues nada.
    const dCrecDeuda = -e.deuda * (crecMes / 1200);
    e.deuda = R.clamp(e.deuda + prestado * 1.0 + dCrecDeuda + shock('deuda'), 5, 300);
    C.deuda = [{ k: prestado > 0 ? 'deficit' : 'superavit', v: prestado * 12 }, { k: 'crecimiento', v: dCrecDeuda * 12 }, { k: 'shock', v: shock('deuda') }]; // por año
    // Riesgo país: lo sube la deuda alta, el déficit, la inflación y el cepo; lo bajan las reservas y las leyes que dan confianza.
    const defAnual = -eco.resultado(s);
    const rDeuda = 7 * Math.max(0, e.deuda - 45);
    const rDeficit = 70 * Math.max(0, defAnual);
    const rInfl = 3.5 * Math.max(0, e.inflAnual - 20);
    const rReservas = -5 * (e.reservas - 25);
    const rCepo = e.cepo ? 120 : 0;
    const rLeyes = -(ley('bcra') ? 80 : 0) + eco.bonus(s, 'bonusRiesgo');
    const rMin = min && min.riesgo ? min.riesgo : 0;
    const rMundo = s.mundo ? (s.mundo.panico || 0) * 3 : 0; // pánico mundial por tus guerras
    const riesgoObj = R.clamp(320 + rDeuda + rDeficit + rInfl + rReservas + rCepo + shock('riesgo') + rMin + rLeyes + rMundo, 150, 5000);
    e.riesgo = R.clamp(e.riesgo + (riesgoObj - e.riesgo) * RX(0.16), 150, 5000);
    e.tasaEf = (e.tasaEf ?? eco.tasa(e)) + (eco.tasa(e) - (e.tasaEf ?? eco.tasa(e))) * 0.08;
    C.riesgo = [{ k: 'deuda', v: rDeuda }, { k: 'deficit', v: rDeficit }, { k: 'inflacion', v: rInfl }, { k: 'reservas', v: rReservas },
      { k: 'cepo', v: rCepo }, { k: 'leyes', v: rLeyes }, { k: 'ministro', v: rMin }, { k: 'mundo', v: rMundo }, { k: 'shock', v: shock('riesgo') }];

    // 10) Calidad de cada área: va lento hacia lo que le das.
    for (const a of R.AREAS) {
      if (!a.calidad) continue;
      const obj = R.clamp(50 + 48 * (m[a.id] * torta - 1) - Math.max(0, e.inflAnual - 40) * 0.08 + eco.bonus(s, 'bonusCalidad', a.calidad), 5, 97);
      e.calidad[a.calidad] = R.clamp(e.calidad[a.calidad] + (obj - e.calidad[a.calidad]) * RX(0.06), 0, 100);
    }

    // 10 bis) Impuestos y retenciones: la producción se acomoda de a poco.
    e.impEf = (e.impEf ?? e.impuestos) + (e.impuestos - (e.impEf ?? e.impuestos)) * RX(0.08);
    e.retEf = (e.retEf ?? e.retenciones) + (e.retenciones - (e.retEf ?? e.retenciones)) * RX(0.08);

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
      oferta: ['🏭', 'Más producción y competencia'], leyes: ['📜', 'Tus leyes'], recalentamiento: ['🔥', 'Economía recalentada'],
    },
    crecimiento: {
      obras: ['🏗️', 'Obra pública y rutas'], futuro: ['🎓', 'Educación y ciencia'], confianza: ['📊', 'Riesgo país'],
      impuestos: ['🧾', 'Impuestos y retenciones'], inflacion: ['🛒', 'La inflación frena todo'], cepo: ['🔒', 'El cepo'],
      expo: ['🚢', 'Exportaciones'], gasto: ['💸', 'Gasto del Estado'], shock: ['💥', 'Clima, obras y sorpresas'], ministro: ['🧑‍💼', 'Tu ministro y tus leyes'],
      sectores: ['🏭', 'Tecnología y energía'], capacidad: ['🧑‍🏭', 'Falta gente para trabajar'],
    },
    pobreza: {
      desempleo: ['👷', 'Falta de trabajo'], salario: ['💰', 'Sueldos que no alcanzan'], inflacion: ['🛒', 'Precios altos'], social: ['🤲', 'Ayuda social y jubilaciones'],
    },
    riesgo: {
      deuda: ['💳', 'Mucha deuda'], deficit: ['⚖️', 'Déficit'], inflacion: ['🛒', 'Inflación'], reservas: ['🏦', 'Reservas'],
      cepo: ['🔒', 'El cepo'], leyes: ['📜', 'Tus leyes'], ministro: ['🧑‍💼', 'Tu ministro'], mundo: ['😱', 'Pánico mundial'], shock: ['💥', 'Noticias del mes'],
    },
    deuda: {
      deficit: ['⚖️', 'Déficit que se paga con deuda'], superavit: ['💰', 'Superávit: pagás deuda'],
      crecimiento: ['📈', 'La economía crece: pesa menos'], shock: ['💥', 'Préstamos y acuerdos'],
    },
    reservas: {
      comercio: ['🚢', 'Exportaciones menos importaciones'], energia: ['⛽', 'Energía que comprás afuera'], pagos: ['🏦', 'Pago de deuda'], fuga: ['✈️', 'Gente que se lleva los dólares'], prestamos: ['🤝', 'Préstamos'],
    },
  };
})(globalThis.R = globalThis.R || {});
