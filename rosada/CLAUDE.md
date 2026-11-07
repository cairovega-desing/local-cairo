# CLAUDE.md — «Camino a la Rosada»

Juego web de estrategia política argentina (celular y PC). Fundás un partido, hacés campaña, ganás la elección y gobernás mes a mes.
Inspirado en «¿Quién quiere gobernar?» (qqg.netlify.app), pero rehecho para que sea **visual, simple y se entienda qué le pasa a la gente**.

## El usuario
- Habla español rioplatense, escribe rápido. Responder en español, simple y directo.
- Pidió: basado en decisiones, **poco texto**, Congreso (senadores/diputados), noticias con opciones de distinto costo,
  economía en **% del gasto** (subís un área y ves qué ganás y cuánto te come del presupuesto anual), alianzas con otros países y conquista.
- Remarcó: el original tiene acciones largas y engorrosas y **no se ve cómo las acciones repercuten en la gente y la economía**.
  Todo tiene que mostrar a quién le pega (caras, flechas ▲▼, frases cortas de la gente, cadenas de causa → efecto).
- Le gusta que Claude trabaje en vueltas («loop») y sea muy crítico con su propio trabajo.

## Cómo está hecho
- HTML + CSS + JS puro, sin frameworks ni build obligatorio. `index.html` carga los scripts en orden (esa lista es la fuente de verdad).
- Todo cuelga del objeto global `R` (cada archivo es `(function (R) { … })(globalThis.R = globalThis.R || {})`).
- **Motor sin DOM** (`js/nucleo`, `js/datos`, `js/motor`): se puede correr en Node. **Interfaz** en `js/ui`.
- Azar con semilla guardada en el estado (`R.rand(s)`), así guardar/cargar es reproducible.
- Guardado en `localStorage` (siempre con try/catch).

| Carpeta | Qué hay |
|---|---|
| `js/nucleo/util.js` | azar, fechas (mes 0 = enero 2027), formato de números a la argentina |
| `js/datos/` | provincias (padrón, diputados, grupo de Senado, inclinación, posición en el mapa hexagonal), partidos rivales ficticios, grupos sociales, noticias |
| `js/motor/estado.js` | crear partida, guardar/cargar |
| `js/motor/efectos.js` | aplicar y **describir** efectos (icono + flechas). `R.describirAplicado` para mostrar lo que realmente se aplicó |
| `js/motor/campana.js` | acciones de campaña, voto por provincia (`R.camp.votos`), paso del mes |
| `js/motor/elecciones.js` | PASO, generales (45 % o 40+10), ballotage, D'Hondt, Senado por grupos, Congreso por tandas |
| `js/motor/eventos.js` | motor de noticias (`R.ev.elegir/datos/resolver`) |
| `js/motor/turno.js` | qué pasa al «Pasar el mes» y el debate (piedra-papel-tijera de estilos) |
| `js/motor/economia.js` | presupuesto por áreas (niveles 0,5–1,6 sobre una base en % del PBI), impuestos, retenciones, simulación mensual y causas |
| `js/motor/gobierno.js` | la gente (humor por grupo y sus razones), aprobación, ⭐ capital político, 🔥 llamas de crisis, acciones, medidas, resumen y frases |
| `js/motor/congreso.js` | bloques, relación, apoyo a cada ley (`R.congreso.apoyo`), votación, decretos, gobernadores, votos en el gobierno y elecciones del mandato |
| `js/ui/` | pantallas, mapa real (`mapa.js` + `js/datos/mapa_geo.js`), banderas de partido (`bandera.js`), hemiciclo, avatar SVG, sonidos WebAudio |
| `tools/mapa.py` | genera `js/datos/mapa_geo.js` con las 24 provincias, Malvinas y vecinos (Natural Earth vía npm `datamaps` y `world-atlas`) |
| `js/main.js` | ruteo de pantallas y la **cola de momentos** (`s.cola`: noticias, elecciones, debates, asunción) |

## Probar antes de cada commit (obligatorio)
```bash
python3 rosada/tools/build.py                 # arma rosada/dist/index.html (un solo archivo) y dist/pagina.html
for f in rosada/js/*.js rosada/js/*/*.js; do node --check "$f"; done
node rosada/tests/sim.js 300 lista            # bots que juegan campañas: sin NaN y con chances razonables
node rosada/tests/sim.js 300 azar
node rosada/tests/sim_gob.js 30 60          # gobiernos con 4 estrategias (quieto, gastador, motosierra, equilibrado)
node rosada/tests/textos.js                   # que ningún titular/opción sea largo
ROSADA_FUENTES=dir node rosada/tests/responsive.js 1.3   # nada se sale por los costados (360/390 px, letra +30 %)
node rosada/tests/ui.js /tmp/capturas celu    # Playwright: juega solo, saca capturas, falla si hay errores de consola
node rosada/tests/ui.js /tmp/capturas pc
```
Mirar las capturas y criticar: texto de más, cosas tapadas, botones chicos, efectos que no se entienden.
**Después de cada cambio, regenerar `dist/` y commitearlo** (es lo que el usuario abre o sube).

## Convenciones
- Textos, comentarios y nombres de datos en español; identificadores de código en inglés o español corto.
- Titulares de noticias ≤ 8 palabras; opciones de 1 a 3 palabras. Efectos con flechas, no con números.
- **Partidos reales** (LLA, peronismo/PJ, PRO, UCR, FIT y Provincias Unidas como bloque), con sus colores y una base parecida a 2025. Los ids internos son históricos (MNP = PJ, PL = LLA, AR = PRO, UCF = UCR, FT = FIT, PROV = Provincias Unidas). **Las personas son inventadas** (candidatos, gobernadores): no ponerle escándalos inventados a gente real.
- Todo azar se muestra con su % y su efecto (`riesgos(s, arg)` en las acciones de campaña, `azar` en noticias y acciones; `ui.riesgos`).
- Nunca `alert/confirm/prompt` (no andan en la página publicada): confirmaciones dentro del juego.
- `[hidden]` siempre con `display:none !important` en el CSS.
- **Nada puede deslizarse de costado** y las pantallas cortas no se mueven: `.app` tiene `overflow-x: clip`, sin `min-height`/`height: 100%`; la barra de arriba es una grilla con `minmax(0, 1fr)`. El usuario tiene la letra del celu grande: probar con `tests/responsive.js 1.3` (fuentes reales de npm `@fontsource/lilita-one` y `@fontsource/nunito`).

## Estado y plan
Ver `PLAN.md` (diseño completo y vueltas). Hecho: Vuelta 0 (plan), Vuelta 1 (crear partido, campaña, PASO, generales, ballotage, debate, noche electoral, Congreso) y Vuelta 2 (gobierno: presupuesto en % por área, impuestos, déficit, la gente con caras y frases, aprobación, crisis, resumen del mes con «¿Por qué?», 40 noticias). `tests/sim_gob.js` simula gobiernos con 4 estrategias. Vuelta 3: Congreso (24 leyes, porotos por bloque, negociar, decreto, votación animada, presupuesto anual), gobernadores en el mapa, medio término y reelección (`js/motor/congreso.js`, `R.gob.elecciones`). Vuelta 4: mundo (`js/motor/mundo.js`, `js/datos/paises.js` con banderas SVG): relación con 12 países, tratados, préstamos, alianzas, compra de aviones, guerra con frente tira y afloja (orden mensual), anexión de vecinos (aparecen en el mapa) y Malvinas por diplomacia o por la fuerza; 16 noticias del mundo. Vuelta 5: logros (`js/motor/logros.js`), legado con título, oposición si perdés en 2027 (`js/motor/oposicion.js`, `s.calendario`, turnos de 3 meses), guía de primeros pasos, juicio político, 33 noticias más (`eventos_extra.js`). Vuelta 8 (pedido del usuario): mapa con formas reales, editor de bandera de partido (diseño, colores, emblema, sigla), partidos reales y riesgos con % + efecto. Publicado como página de Claude: https://claude.ai/artifact/JYF7A6NTa7S5AS8uJ4TxYM (republicar `rosada/dist/pagina.html` con la misma ruta).
