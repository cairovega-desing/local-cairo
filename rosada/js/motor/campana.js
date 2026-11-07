// Campaña: acciones del mes, paso del tiempo y cálculo de la intención de voto por provincia.
(function (R) {
  'use strict';

  const camp = (R.camp = {});

  // Afinidad entre tus ideas y la provincia: 0,6 (nada que ver) … 1,35 (calcado).
  camp.afinidad = (s, prov) => R.clamp(1 + 0.6 * (0.55 - Math.abs(prov.lean - s.partido.ideo)), 0.6, 1.35);
  const cercania = (a, b) => 1 - Math.abs(a - b) / 2; // 0 … 1

  // ── Acciones ──
  // Cada acción: costo (fondos), elegir (qué hay que elegir antes), max por mes, preview y hacer.
  camp.ACCIONES = [
    {
      id: 'acto', emoji: '🎤', nombre: 'Acto', desc: 'Subís fuerte en una provincia', costo: 10, elegir: 'provincia',
      calc(s, provId) {
        const p = R.PROV[provId];
        const vis = s.camp.visitas[provId] || 0;
        const af = camp.afinidad(s, p);
        const rinde = Math.pow(0.62, vis);
        return {
          presencia: { [provId]: Math.round(30 * af * rinde) },
          conocen: R.round((0.5 + p.padron * 0.07) * rinde + 0.3, 1),
          simpatia: R.round(0.6 * af * rinde, 1),
          militancia: 1,
        };
      },
      riesgos: (s, provId) => [{ p: 0.15, bueno: true, txt: 'Plaza llena', ef: { presencia: { [provId || 'todas']: 8 } } }],
      hacer(s, provId) {
        const ef = this.calc(s, provId);
        s.camp.visitas[provId] = (s.camp.visitas[provId] || 0) + 1;
        const lleno = R.chance(s, this.riesgos(s, provId)[0].p);
        if (lleno) ef.presencia[provId] += 8;
        return { ef, txt: lleno ? '¡Plaza llena en ' + R.PROV[provId].corto + '! 🙌' : 'Acto en ' + R.PROV[provId].corto, bueno: true };
      },
    },
    {
      id: 'tv', emoji: '📺', nombre: 'Publicidad en TV', desc: 'Que te conozca todo el país', costo: 25, max: 1,
      calc(s) {
        return { conocen: R.round(10 * (1 - s.camp.conocen / 115), 1), simpatia: 0.5 };
      },
      hacer(s) {
        return { ef: this.calc(s), txt: 'Tu spot sale en todos los canales', bueno: true };
      },
    },
    {
      id: 'redes', emoji: '📱', nombre: 'Redes', desc: 'Barato, a veces explota', costo: 5, max: 2, azar: true,
      calc(s) {
        return { conocen: R.round(4 * (1 - s.camp.conocen / 125), 1) };
      },
      riesgos: (s) => [
        { p: R.round(0.14 + 0.05 * s.partido.estilo, 3), bueno: true, txt: 'Se hace viral', ef: { conocen: 8, simpatia: 2, relevancia: 6 } },
        { p: R.round(0.1 + 0.05 * s.partido.estilo, 3), bueno: false, txt: 'Metés la pata', ef: { simpatia: -3 } },
      ],
      hacer(s) {
        const ef = this.calc(s);
        const [bien, mal] = this.riesgos(s);
        const r = R.rand(s);
        if (r < bien.p) return { ef: R.sumarEfectos(ef, bien.ef), txt: '¡Se hizo viral! 🔥', bueno: true, especial: true };
        if (r > 1 - mal.p) return { ef: R.sumarEfectos(ef, mal.ef), txt: 'Un posteo tuyo cae mal 😬', bueno: false };
        return { ef, txt: 'Buen alcance en redes', bueno: true };
      },
    },
    {
      id: 'entrevista', emoji: '🎙️', nombre: 'Entrevista', desc: 'Gratis, pero arriesgada', costo: 0, max: 1, azar: true,
      calc() {
        return { conocen: 1.5, simpatia: 1.5, relevancia: 3 };
      },
      riesgos: (s) => [
        { p: R.round(0.35 - 0.05 * s.partido.estilo, 3), bueno: true, txt: 'La rompés', ef: { conocen: 2.5, simpatia: 4, relevancia: 6 } },
        { p: R.round(0.2 + 0.1 * s.partido.estilo, 3), bueno: false, txt: 'Te comen', ef: { conocen: 2, simpatia: -3 } },
      ],
      hacer(s) {
        const [bien, mal] = this.riesgos(s);
        const r = R.rand(s);
        if (r < mal.p) return { ef: mal.ef, txt: 'Te comieron en la entrevista 😓', bueno: false };
        if (r > 1 - bien.p) return { ef: bien.ef, txt: '¡La rompiste en la entrevista! 👏', bueno: true, especial: true };
        return { ef: this.calc(s), txt: 'Entrevista correcta', bueno: true };
      },
    },
    {
      id: 'estructura', emoji: '🏴', nombre: 'Militancia', desc: 'Fiscales y sedes', costo: 15,
      calc(s) {
        return { militancia: R.round(12 * (1 - s.camp.militancia / 120) + 1, 1) };
      },
      hacer(s) {
        return { ef: this.calc(s), txt: 'Abrís sedes y sumás fiscales', bueno: true };
      },
    },
    {
      id: 'plata', emoji: '💵', nombre: 'Juntar plata', desc: 'Rifas o empresarios', costo: 0, elegir: 'plata',
      opciones: [
        { id: 'rifa', emoji: '🎟️', nombre: 'Rifas y aportes chicos', ef: { fondos: 18 } },
        { id: 'empresas', emoji: '💼', nombre: 'Cena con empresarios', ef: { fondos: 45, sucio: 1, ideoIzq: 1.5 }, riesgo: true,
          riesgos: [{ p: 0.5, bueno: false, txt: 'Si se filtra', ef: { simpatia: -8 } }] },
      ],
      calc(s, op) {
        const o = this.opciones.find((x) => x.id === op) || this.opciones[0];
        return o.ef;
      },
      hacer(s, op) {
        const o = this.opciones.find((x) => x.id === op) || this.opciones[0];
        if (o.id === 'empresas') s.flags.plataEmpresas = s.mes;
        return { ef: JSON.parse(JSON.stringify(o.ef)), txt: o.id === 'rifa' ? 'La militancia junta plata' : 'Los empresarios ponen la plata 💼', bueno: true };
      },
    },
    {
      id: 'figura', emoji: '⭐', nombre: 'Sumar una figura', desc: 'Un famoso te banca', costo: 0, elegir: 'figura',
      costoDe: (s, id) => (R.FIGURAS.find((f) => f.id === id) || { costo: 0 }).costo,
      calc(s, id) {
        const f = R.FIGURAS.find((x) => x.id === id);
        if (!f) return {};
        const ajuste = 1 - 0.55 * Math.abs(f.ideo - s.partido.ideo);
        const ef = { conocen: f.conocen, simpatia: R.round(f.simpatia * ajuste, 1) };
        if (f.militancia) ef.militancia = f.militancia;
        if (f.region) ef.presencia = { [f.region]: 10 };
        return ef;
      },
      riesgos: (s, id) => {
        const f = R.FIGURAS.find((x) => x.id === id);
        return f && f.riesgo ? [{ p: 0.25, bueno: false, txt: 'Arma polémica', ef: { simpatia: -5 } }] : [];
      },
      hacer(s, id) {
        const f = R.FIGURAS.find((x) => x.id === id);
        s.camp.figuras.push(id);
        const ef = this.calc(s, id);
        const rg = this.riesgos(s, id);
        if (rg.length && R.chance(s, rg[0].p)) {
          ef.simpatia -= 5;
          return { ef, txt: f.emoji + ' Se suma… y arma polémica 🙃', bueno: false };
        }
        return { ef, txt: f.emoji + ' ' + f.nombre + ' te apoya', bueno: true, especial: true };
      },
    },
    {
      id: 'ataque', emoji: '🗡️', nombre: 'Pegarle a un rival', desc: 'Le bajás votos', costo: 5, elegir: 'rival', max: 1, azar: true,
      calc(s, id) {
        return { rival: { [id]: -R.round(2 * (1 + 0.3 * s.partido.estilo), 1) }, simpatia: -0.5 };
      },
      riesgos: (s, id) => [{ p: R.round(0.25 - 0.08 * s.partido.estilo, 3), bueno: false, txt: 'Te sale el tiro por la culata', ef: { rival: { [id || 'MNP']: -0.5 }, simpatia: -4 } }],
      hacer(s, id) {
        const mal = this.riesgos(s, id)[0];
        if (R.chance(s, mal.p)) {
          return { ef: mal.ef, txt: 'Te salió el tiro por la culata 🤦', bueno: false };
        }
        return { ef: this.calc(s, id), txt: 'Golpe certero contra ' + R.PARTIDOS[id].sigla + ' 🥊', bueno: true };
      },
    },
    {
      id: 'alianza', emoji: '🤝', nombre: 'Alianza', desc: 'Un partido chico se suma', costo: 0, elegir: 'aliado',
      disponible: (s) => !s.camp.alianza,
      calc(s, id) {
        const a = R.ALIADOS.find((x) => x.id === id);
        if (!a) return {};
        return { votos: a.votos, simpatia: -R.round(3 * Math.abs(a.ideo - s.partido.ideo), 1), presencia: { [a.region]: 10 } };
      },
      hacer(s, id) {
        s.camp.alianza = id;
        const a = R.ALIADOS.find((x) => x.id === id);
        return { ef: this.calc(s, id), txt: a.emoji + ' ' + a.nombre + ' se suma a tu frente', bueno: true, especial: true };
      },
    },
  ];
  camp.ACC = Object.fromEntries(camp.ACCIONES.map((a) => [a.id, a]));

  camp.costo = (s, acc, arg) => (acc.costoDe ? acc.costoDe(s, arg) : acc.costo);

  // ¿Se puede hacer? Devuelve null si sí, o un motivo corto si no.
  camp.bloqueo = function (s, acc, arg) {
    if (s.fase !== 'campana') return 'No es momento';
    if (s.camp.agenda <= 0) return 'Sin agenda este mes';
    if (acc.disponible && !acc.disponible(s)) return 'Ya lo hiciste';
    if (acc.max && (s.camp.usadasMes[acc.id] || 0) >= acc.max) return 'Ya lo hiciste este mes';
    if (arg !== undefined && camp.costo(s, acc, arg) > s.camp.fondos) return 'No te alcanza la plata';
    if (arg === undefined && !acc.elegir && acc.costo > s.camp.fondos) return 'No te alcanza la plata';
    return null;
  };

  camp.hacer = function (s, accId, arg) {
    const acc = camp.ACC[accId];
    if (!acc) throw new Error('Acción desconocida ' + accId);
    const motivo = camp.bloqueo(s, acc, arg);
    if (motivo) return { error: motivo };
    const costo = camp.costo(s, acc, arg);
    const res = acc.hacer(s, arg);
    s.camp.fondos -= costo;
    s.camp.agenda -= 1;
    s.camp.usadasMes[accId] = (s.camp.usadasMes[accId] || 0) + 1;
    s.stats.acciones++;
    const antes = camp.votos(s).nac.YO;
    res.aplicado = R.aplicarEfectos(s, res.ef);
    res.costo = costo;
    res.votosAntes = antes;
    res.votosDespues = camp.votos(s).nac.YO;
    return res;
  };

  // ── Votos ──
  // Devuelve { nac: {YO, MNP, …}, prov: {BUE: {YO, MNP, …}} } en % de votos válidos.
  camp.votos = function (s, opts) {
    opts = opts || {};
    const c = s.camp;
    const ideoP = s.partido.ideo;
    const dif = R.DIFICULTADES[s.dif] || R.DIFICULTADES.normal;
    const ali = c.alianza ? R.ALIADOS.find((a) => a.id === c.alianza) : null;
    const nac = { YO: 0 };
    R.RIVALES.forEach((id) => (nac[id] = 0));
    const prov = {};
    for (const p of R.PROVINCIAS) {
      const pres = c.presencia[p.id] || 0;
      const know = R.clamp(c.conocen + pres * 0.45, 0, 100) / 100;
      const like = R.clamp(c.simpatia + pres * 0.12, 0, 100) / 100;
      const af = camp.afinidad(s, p);
      // Voto útil: si sos relevante, la gente siente que votarte «sirve».
      const util = 0.88 + 0.24 * ((c.relevancia ?? 30) / 100);
      let yo = 100 * know * Math.pow(like, 1.6) * af * 0.58 * dif.mult * util;
      yo += c.bonusVotos;
      if (ali) yo += ali.votos * (ali.region === p.region ? 2.2 : 0.75);
      if (opts.extraYo) yo += opts.extraYo;
      yo = R.clamp(yo, 0.2, 78);
      const ws = {};
      let tot = 0;
      for (const id of R.RIVALES) {
        const r = R.PARTIDOS[id];
        let w = Math.max(0.3, (r.base * dif.rival + s.rivales[id]));
        w *= 1 + (r.fuerte[p.id] || 0);
        w *= R.clamp(1 + 0.7 * (0.5 - Math.abs(p.lean - r.ideo)), 0.45, 1.4);
        if (s.gobRival && R.oposicion) w *= R.oposicion.factor(s, id);
        w *= 1 - 0.5 * (yo / 100) * cercania(r.ideo, ideoP);
        if (opts.ruido) w *= Math.max(0.2, 1 + opts.ruido[p.id + id] * 0.06);
        ws[id] = Math.max(0.05, w);
        tot += ws[id];
      }
      const res = { YO: yo };
      for (const id of R.RIVALES) res[id] = ((100 - yo) * ws[id]) / tot;
      prov[p.id] = res;
      for (const k in res) nac[k] += (res[k] * p.padron) / 100;
    }
    return { nac, prov };
  };

  // Encuesta: tus números con un poquito de error (como en la vida real), ordenados.
  // Imagen como la miden las consultoras: positiva + negativa + regular + no te conoce = 100.
  camp.imagen = function (s) {
    const c = s.camp;
    const k = c.conocen;
    const pos = (k * c.simpatia) / 100;
    const neg = ((k * (100 - c.simpatia)) / 100) * 0.75;
    return { conocimiento: k, positiva: pos, negativa: neg, regular: Math.max(0, k - pos - neg), relevancia: c.relevancia ?? 5, diferencial: pos - neg };
  };

  camp.encuesta = function (s) {
    const v = camp.votos(s).nac;
    const e = { mes: s.mes, img: camp.imagen(s) };
    for (const k in v) e[k] = R.round(v[k], 1);
    return e;
  };

  // ── Paso del mes ──
  camp.finDeMes = function (s) {
    const c = s.camp;
    const dif = R.DIFICULTADES[s.dif] || R.DIFICULTADES.normal;
    c.fondos += Math.round((7 + c.militancia * 0.12) * (dif.mult > 1 ? 1.2 : 1));
    if (c.conocen > 5) c.conocen = Math.max(5, c.conocen - 0.5);
    c.simpatia += (50 - c.simpatia) * 0.06;
    // La relevancia se apaga si no hacés ruido; el piso depende de cuánto medís.
    const piso = 3 + camp.votos(s).nac.YO * 1.3;
    c.relevancia = R.clamp((c.relevancia ?? 5) + (piso - (c.relevancia ?? 5)) * 0.18, 0, 100);
    for (const id in c.presencia) c.presencia[id] *= 0.96;
    for (const id of R.RIVALES) {
      s.rivales[id] = s.rivales[id] * 0.94 + R.gauss(s) * 0.45;
    }
    c.agenda = c.agendaMax;
    c.usadasMes = {};
  };
})(globalThis.R = globalThis.R || {});
