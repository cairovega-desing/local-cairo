# Camino a la Rosada — Plan del juego

Juego de estrategia política argentina para **celular y PC**, que se juega en el navegador.
Fundás un partido de la nada, hacés campaña, ganás la elección (o no) y después gobernás:
economía, Congreso, gobernadores y el mundo. Mes a mes llegan noticias con decisiones.

> Referencia: «¿Quién quiere gobernar?» (qqg.netlify.app). Tiene muchísimo contenido, pero todo es texto y
> números (rangos como `+0,3/+1,2`), las acciones son largas y **no se ve cómo lo que hacés le pega a la gente**.
> Este juego toma la idea y la rehace desde cero: mismas mecánicas de fondo, pero **se ve, se entiende y se siente**.

---

## 0. Lo que aprendimos del juego de referencia

Se analizó su código completo (sin ejecutarlo). Es una simulación gigante: 38 indicadores económicos, 16 palancas,
154 medidas, 66 reformas, 23 impuestos, 208 países, ~1.450 políticos reales, ~500 eventos (casi 470 armados por
combinación, con el mismo trío «ceder / negociar / rechazar») y más de 25 pestañas al gobernar.
Los efectos se muestran como rangos decimales («+0,5 a 2,2») y hay 4 métricas ocultas.

**Nos quedamos con (es lo divertido):**
1. El **dilema de la noticia mensual** con 2-3 opciones y riesgo visible.
2. La **imagen** (te conocen / les caés bien) y la tentación de la **plata de empresarios** a cambio de riesgo de escándalo.
3. **Acciones de campaña con presupuesto limitado** y rendimiento decreciente si repetís la misma provincia.
4. El **umbral de problemas que termina en caída** → acá será un **🔥 termómetro de crisis** bien visible.
5. La **noche electoral con mapa** y un «por qué ganaste o perdiste» en una línea.
6. **Logros** coleccionables y **momentos épicos** (Malvinas, paro general, FMI, Mundial).
7. Calendario real: 1 turno = 1 mes, PASO con piso de 1,5 %, ballotage 45 % o 40 + 10, medio término, 48 meses por mandato.

**Cortamos o simplificamos:** 38 indicadores → 6 tarjetas tangibles; 23 impuestos → 2 perillas; 154 medidas →
~20 acciones y ~24 leyes con dibujo; rangos decimales → flechas; 208 países → 12; políticos reales → personajes ficticios;
25 pestañas → 5 botones abajo; texto libre → todo con toques.

---

## 1. Pilares de diseño (todo se mide contra esto)

1. **Se entiende en 1 segundo.** Cada pantalla tiene una sola cosa importante. Botones de 1 a 3 palabras.
   Titulares de 8 palabras como mucho. Nada de párrafos.
2. **Se ve a quién le pega.** Toda decisión muestra **antes** (vista previa) y **después** (animación) a quién afecta:
   caras de la gente que cambian de humor, flechitas ▲▼ verdes o rojas y frases cortitas de la gente.
3. **La economía es tangible.** No hay planillas: la inflación es **el precio del changuito 🛒**, la pobreza son
   **10 muñequitos y cuántos son pobres**, el desempleo es **cuántos de cada 100 no tienen laburo**, el dólar es un cartel de
   casa de cambio. El presupuesto son **barras en % del gasto**: subís una y ves qué ganás y cuánto te come del presupuesto.
4. **Causa → efecto visible.** Cada indicador tiene un botón «¿Por qué?» que muestra la cadena:
   `🖨️ Emitiste → 💸 Más pesos → 📈 Inflación → 🛒 Changuito más caro → 👵 Jubilados enojados`.
5. **Sin números inútiles.** Los efectos se muestran con iconos y flechas (▲ poco, ▲▲ mucho, ▲▲▲ muchísimo).
   Solo hay números donde el jugador los necesita para decidir (costos, votos que faltan, % del presupuesto).
6. **Dopamina sana.** Noche de elecciones con barras que suben y mapa que se pinta, conteo de votos en el Congreso
   banca por banca, confeti cuando ganás, temblor cuando estalla una crisis, sonidos cortos de «ding» y «buzz».
7. **Perder también es jugar.** Si perdés la elección seguís en la oposición; si gobernás mal, caés en helicóptero
   (con pantalla final y logro, para reírse y volver a intentar).

---

## 2. Plataforma y tecnología

- **Web (HTML + CSS + JavaScript puro)**, sin frameworks ni instalación. Funciona en celular (vertical) y en PC
  (en pantalla ancha se ven dos columnas).
- **Un solo archivo jugable**: `python3 rosada/tools/build.py` junta todo en `rosada/dist/index.html`.
  Ese archivo se puede abrir con doble clic, subir a Netlify/GitHub Pages arrastrando la carpeta, o publicar como página de Claude.
- **Guardado automático** en el navegador (`localStorage`, con `try/catch` para que no se rompa si no hay).
- **Sin descargas externas obligatorias**: banderas dibujadas con SVG (las banderas emoji no se ven en Windows),
  sonidos generados con WebAudio (sin archivos), fuentes de Google Fonts con alternativa del sistema.
- **Motor separado de la interfaz**: toda la lógica (`js/motor/`) es JavaScript puro sin DOM, así se puede simular
  con Node miles de partidas para balancear y encontrar errores.

### Estructura de carpetas
```
rosada/
  index.html            versión de desarrollo (carga css y js por separado)
  css/estilo.css
  js/
    nucleo/             rng (semilla), utilidades, formato de números
    datos/              provincias, países, partidos, leyes, eventos, logros, personas, frases
    motor/              estado y guardado, campaña, elecciones, economía, sociedad, congreso,
                        provincias, mundo, guerra, eventos, turno
    ui/                 helpers de DOM, componentes (barras, caras, hemiciclo, mapa), pantallas
    sonido.js, main.js
  tools/build.py        arma dist/index.html (un archivo) y dist/pagina.html (para publicar en Claude)
  tests/sim.js          simula partidas en Node (bots) y chequea que nada se rompa ni dé NaN
  tests/ui.js           recorre el juego con Playwright en celular y PC y saca capturas
  PLAN.md  CLAUDE.md  README.md
```

---

## 3. Recorrido completo del jugador

```
Portada → Crear partido → CAMPAÑA (ene–oct 2027) → PASO (ago) → GENERALES (oct) → ¿Ballotage? (nov)
   ├─ ganaste → Asunción (10 dic) → GOBIERNO (48 meses) → Medio término (oct 2029) → Reelección (oct 2031)
   │                                   └─ si ganás: 2.º mandato (otros 48 meses) → Final con legado
   └─ perdiste → OPOSICIÓN (seguís con tus bancas) → Medio término 2029 → Presidenciales 2031
Finales posibles: mandato cumplido ⭐ · derrota electoral · renuncia (helicóptero 🚁) · juicio político · derrota militar
```

### 3.1 Portada
Logo grande, sol, botón **Jugar**, **Continuar** (si hay partida), **Cómo se juega** (3 tarjetas con dibujos),
**Logros** y sonido 🔊/🔇.

### 3.2 Crear partido (4 pasos, una pantalla cada uno, todo con toques)
1. **Nombre y sigla** del partido (con botón 🎲 que inventa uno: «Movimiento Celeste», «Partido del Mate»…).
2. **Color y símbolo** (paleta de 10 colores + 16 símbolos: ☀️ 🐎 🦁 🧉 🌾 🔥 ⭐ 🐄 ⚡ 🕊️ …). Se arma el escudito en vivo.
3. **Ideas** con 2 deslizadores visuales:
   - Economía: `🤲 Estado presente ←→ Mercado libre 💼`
   - Estilo: `🕊️ Dialoguista ←→ Confrontativo 🔥`
   Debajo se ve en vivo **a quién le gustás de entrada** (caras de los 6 grupos) y **en qué provincias arrancás mejor** (mapita).
4. **Tu candidato/a**: nombre (🎲 aleatorio) y cara (arma un avatar simple: piel, pelo, anteojos, bigote/barba).
   Elegís dificultad: 😊 Fácil · 😐 Normal · 😈 Difícil.

### 3.3 Campaña (cada turno = 1 mes)
**Pantalla principal de campaña** (de arriba abajo):
- Barra superior: escudo del partido, 📅 mes, 💰 fondos, ⏱️ agenda del mes (3 acciones).
- **Cuenta regresiva** a la próxima elección («Faltan 7 meses para las PASO»).
- **Encuesta**: barras horizontales con los 5 candidatos (vos + 4 rivales ficticios) y tu % grande.
- **Tu imagen** en 3 cosas simples: 👁️ Te conocen · ❤️ Les caés bien · 🏴 Militancia (estructura).
- Pestañas: **Acciones** · **Mapa** · **Rivales** · **Diario**.

**Acciones de campaña** (tarjetas de un toque; muestran costo y qué mejoran con iconos):

| Acción | Costo | Qué hace (se muestra con iconos) |
|---|---|---|
| 🎤 Acto en una provincia | 💰10 · ⏱️1 | Elegís en el mapa: sube cuánto te conocen y te quieren **solo en esa provincia**; al país le llega según lo que pesa en el padrón. Rinde según la afinidad (al cuadrado: donde piensan distinto rinde un tercio) y cada visita repetida rinde menos. |
| 📺 Publicidad en TV | 💰25 · ⏱️1 | Te conocen ▲▲ en todo el país. |
| 📱 Campaña en redes | 💰5 · ⏱️1 | Te conocen ▲ (jóvenes). 🎲 Chance de video viral (▲▲▲) o de metida de pata (▼). |
| 🎙️ Entrevista / stream | gratis · ⏱️1 | Les caés bien ▲ o ▼ (🎲, depende de tu estilo). |
| ⭐ Sumar una figura | 💰30 · ⏱️1 | Lista de famosos ficticios (ex jugador de la Selección, actriz de novelas, economista de la tele…): cada uno da un empujón distinto. Una vez cada uno. |
| 🏴 Armar estructura | 💰15 · ⏱️1 | Militancia ▲: fiscales y sedes. Sin fiscales, el día de la elección «te roban» votos. |
| 💵 Juntar plata | gratis · ⏱️1 | Cena con empresarios (💰▲▲ pero ❤️▼) o rifas con afiliados (💰▲). |
| 🗡️ Pegarle a un rival | 💰5 · ⏱️1 | Le bajás votos a uno; 🎲 te puede salir el tiro por la culata. |
| 🤝 Alianza | ⏱️1 | Un partido chico se suma: votos ▲, pero tus ideas se diluyen (❤️ de tu núcleo ▼). Una vez por elección. |
| 🗣️ Debate (solo antes de generales y ballotage) | ⏱️1 | **Minijuego**: 3 preguntas, elegís cómo responder (🔥 Atacar · 📊 Datos · ❤️ Emoción · 😂 Humor). Piedra-papel-tijera contra el estilo del rival. Gran premio o gran papelón. |

**Cómo se calcula el voto (por dentro):** cada provincia tiene una «inclinación» (izquierda/derecha y peronismo/antiperonismo).
Tu voto en una provincia = qué tanto te conocen × cuánto les caés × qué tanto coinciden tus ideas con la provincia
+ tu presencia por actos + figuras + alianzas − ataques. Los rivales tienen su base y se mueven con eventos.
Las encuestas muestran tu número con un poco de ruido (± 2 puntos), como en la vida real.

### 3.4 Elecciones (la parte más «dopamínica»)
- **PASO (agosto)**: si no llegás a 1,5 % quedás afuera (perdés la elección). Sirve de encuesta real.
- **Generales (octubre)**: Presidente + Diputados (mitad de la Cámara) + Senadores (8 provincias).
  - Ganás en 1.ª vuelta con **más de 45 %** o **más de 40 % y 10 puntos de diferencia** (regla real).
  - Si no, **ballotage en noviembre** contra el segundo (un mes más de campaña con debate final).
- **Noche de elecciones**: pantalla negra de «escrutinio», barras que crecen con el % de mesas escrutadas,
  mapa de provincias que se pinta del color del ganador una por una, y al final: 🎉 confeti o 😞 derrota.
- **Bancas**: Diputados por **D'Hondt** en cada provincia (piso 3 %), Senado: 2 bancas al primero y 1 al segundo.
  Se muestra el hemiciclo llenándose con tus bancas.

### 3.5 Gobierno (cada turno = 1 mes; 48 meses por mandato)
Asunción el 10 de diciembre (banda y bastón 🎖️ + elegís **Ministro/a de Economía** entre 3 perfiles:
📉 Ortodoxo · 📈 Heterodoxo · 🤝 Pragmático, cada uno con una ventaja y una desventaja).

**Ritmo de cada mes:**
1. **Resumen del mes anterior** (tarjeta corta): qué subió y qué bajó con flechas, **las 3 causas principales**
   y **lo que dice la gente** (2 o 3 globitos de diálogo de los personajes).
2. **Noticia del mes** (casi siempre 1, a veces 2, a veces ninguna): tarjeta tipo diario con dibujo de emojis,
   titular corto y 2-3 opciones. Cada opción muestra costo (⭐ capital político y/o 💸 % del presupuesto)
   y a quién afecta (caras con ▲▼). Algunas tienen 🎲 riesgo.
3. **Tu turno**: usás tu ⭐ capital político en los paneles (Economía, Congreso, Provincias, Mundo).
4. **Botón grande «Pasar el mes ▶»**.

**⭐ Capital político**: se gana cada mes (base + bonus por aprobación alta + bonus si tenés mayoría en el Congreso),
se acumula hasta un tope. Es lo que gastás en leyes, negociaciones, visitas y diplomacia.

#### Pantalla principal de gobierno («La Rosada»)
- Arriba: avatar con banda, 📅 mes, ⭐ capital, 👍 **aprobación** grande (con flecha del último mes).
- **La gente**: 6 personajes con cara de humor (😄🙂😐🙁😠). Tocás uno y ves qué le importa y por qué está así.
- **El país en 6 tarjetas tangibles**: 🛒 Changuito (inflación), 📈 Economía (crece/se cae), 👷 Trabajo (desempleo),
  🏚️ Pobreza (10 muñequitos), 💵 Dólar, 🏦 Reservas (bóveda llena/vacía). Cada una con «¿Por qué?».
- Próxima elección y cuenta regresiva.
- Navegación inferior: 🏠 Inicio · 💰 Economía · 🏛️ Congreso · 🗺️ Provincias · 🌎 Mundo.

---

## 4. Economía en % (lo que pidió el usuario)

### 4.1 Presupuesto por áreas
Cada área tiene una **barra deslizable** con su **% del gasto total** grande y una marca de «hoy».
Al moverla se ve en vivo:
- **Qué ganás** (iconos): «🏥 Hospitales ▲ · 👵 Jubilados 🙂 · 🏚️ Humildes 🙂».
- **Qué te cuesta**: el **balance anual** de arriba se mueve (ver 4.2).

| Área | Qué mejora con más plata | A quién le gusta |
|---|---|---|
| 👵 Jubilaciones | Ingreso de jubilados | Jubilados ▲▲▲ |
| 🤲 Ayuda social | Pobreza ▼ | Humildes ▲▲ (clase media ▼ si es mucho) |
| 🏥 Salud | Calidad de hospitales | Todos ▲, humildes y jubilados ▲▲ |
| 🎓 Educación | Escuelas y universidades (efecto lento, sube crecimiento a futuro) | Clase media ▲▲ |
| 👮 Seguridad | Delito ▼ | Clase media ▲▲ |
| 🪖 Defensa | Poder militar (clave para guerras y Malvinas) | — (FF.AA.) |
| 🏗️ Obra pública | Rutas, crecimiento y empleo ▲ | Trabajadores ▲, gobernadores ▲ |
| ⚡ Subsidios (luz, gas, colectivo) | Tarifas baratas = menos inflación inmediata | Todos ▲ hoy… pero cuesta muchísimo |
| 🔬 Ciencia | Crecimiento a largo plazo, eventos de inventos | Clase media ▲ |

### 4.2 El balance anual (una balanza ⚖️)
Arriba de las barras: **Recaudás 17 % del PBI | Gastás 19 % del PBI → Déficit 2 %** con una balanza que se inclina
y se pone roja (déficit) o verde (superávit). Debajo, dos perillas:
- 🧾 **Impuestos** (5 niveles: Muy bajos … Muy altos): más recaudación, pero empresarios y clase media ▼ y crecimiento ▼.
- 🌾 **Retenciones al campo** (0 %, 10 %, 20 %, 30 %): más recaudación y dólares que se quedan… el campo ▼▼.
- **¿Cómo cubrís el déficit?**: 🖨️ **Emitir** (inflación ▲) · 🏦 **Pedir prestado** (deuda ▲, riesgo país ▲).
  Una sola perilla con 3 posiciones (todo emisión / mitad y mitad / todo deuda).

Los costos de noticias y acciones («Bono para jubilados: 💸 0,3 % del presupuesto este año») se suman al gasto del año.

### 4.3 Medidas fuertes (botones con confirmación dentro del juego)
💱 Devaluar · 🔒 Poner/sacar el cepo · 🤝 Acuerdo con el FMI (pasa por el Congreso) · 💵 Dolarizar (requiere reservas, ley) ·
🪙 Moneda nueva · ✂️ Motosierra (recorte general del 10 %, shock) · 🧾 Blanqueo.

### 4.4 Modelo interno (mensual, oculto al jugador pero explicado con «¿Por qué?»)
Variables: PBI (índice), inflación mensual y anual, desempleo, pobreza, salario real, dólar oficial y brecha,
reservas (US$ miles de millones), deuda (% PBI), riesgo país, calidad de cada área (0-100).
1. **Recaudación** = nivel de impuestos + retenciones × exportaciones − evasión (sube con la informalidad y la crisis).
2. **Gasto** = suma de áreas + intereses de la deuda (tasa según riesgo país) + gastos puntuales del año.
3. **Déficit** → se cubre con emisión (empuja inflación) o deuda (empuja deuda y riesgo país).
4. **Inflación** = inercia del mes anterior + emisión + traslado del dólar + quita de subsidios − ancla de credibilidad
   (ley de Banco Central independiente, dolarización, ministro ortodoxo) + ruido.
5. **Crecimiento** = potencial + obra pública + infraestructura + educación/ciencia (lento) + confianza (riesgo país)
   − carga de impuestos − caos inflacionario − cepo + exportaciones (clima, precios del mundo, acuerdos comerciales).
6. **Desempleo** tiende a su nivel natural menos el efecto del crecimiento.
7. **Salario real** cae con la inflación y se recupera con las paritarias (con retraso).
8. **Pobreza** sigue al desempleo, al salario real y a la ayuda social.
9. **Reservas** = exportaciones − importaciones + préstamos − pagos de deuda − fuga (si hay desconfianza sin cepo).
10. **Dólar**: se devalúa si faltan reservas; con cepo aparece la brecha (dólar blue).
Cada término guarda su aporte para armar las **cadenas de causas** del botón «¿Por qué?».

---

## 5. La gente (grupos sociales con cara)

| Personaje | Grupo | Peso en el voto | Qué le importa | Si se enoja mucho… |
|---|---|---|---|---|
| 👷 Julio, metalúrgico | Trabajadores | 20 % | Salario real, empleo, reforma laboral | **Paro general de la CGT** (economía ▼ ese mes) |
| 🌾 Pedro, chacarero | Campo | 5 % | Retenciones, dólar, rutas | **Lockout del campo** (exportaciones ▼, reservas ▼) |
| 💼 Laura, empresaria pyme | Empresarios | 5 % | Impuestos, riesgo país, cepo, reglas claras | **Fuga de capitales** (reservas ▼) |
| 🏙️ Sofía, docente de clase media | Clase media | 30 % | Inflación, seguridad, educación, salud, corrupción | **Cacerolazo** (aprobación ▼▼) |
| 🏚️ Kevin, pibe del barrio | Humildes | 25 % | Ayuda social, pobreza, precio de la comida | **Cortes y piquetes** (aprobación ▼, caos) |
| 👵 Don Raúl, jubilado | Jubilados | 15 % | Jubilaciones, inflación, remedios | **Marcha de los miércoles** (aprobación ▼) |

- Cada grupo tiene un **humor 0-100** que se mueve cada mes hacia un «objetivo» calculado con lo que le importa,
  más golpes de las noticias que se van diluyendo.
- **Aprobación** = promedio ponderado del humor + luna de miel al principio − desgaste con el tiempo.
- Cada mes, los personajes con más cambio **dicen una frase corta** («¡Me alcanzó para el asado! 🥩»,
  «La jubilación no me dura ni una semana 😩»). Banco de ~150 frases por situación.

---

## 6. Congreso

- **Diputados (257)** y **Senado (72)**, dibujados como hemiciclos de puntitos de colores por partido.
- Composición inicial: bancas «viejas» repartidas entre los 4 partidos rivales ficticios + las que ganes en 2027.
  En 2029 y 2031 se renuevan (mitad de Diputados, un tercio del Senado) según tu aprobación y la campaña.
- **Leyes** (~24, cada una se ve como una tarjeta con dibujo, efecto con iconos y a quién le gusta):
  Reforma laboral · Reforma previsional · Ley de grandes inversiones · Banco Central independiente · Dolarización ·
  Moneda nueva · Ley de financiamiento universitario · Ley de seguridad · Baja de imputabilidad · Servicio militar ·
  Ley de ciencia · Retenciones cero · Impuesto a las grandes fortunas · Privatizar empresas · Estatizar empresas ·
  Ley de alquileres · Ley de litio y minería · Ley de humedales · Boleta única · Reforma judicial · Acuerdo con el FMI ·
  Declaración de guerra · Reforma constitucional (re-reelección, necesita 2/3) · Presupuesto anual.
- **Cómo se vota**: al elegir una ley se muestra «**Contamos los porotos**»: cada bloque se pinta Sí/No/Dudoso según
  ideología del bloque, tu aprobación, relación con gobernadores (sus legisladores responden a ellos) y negociaciones.
  Arriba: «Te faltan 12 votos en Diputados».
- **Para conseguir votos**: 🤝 Negociar con un bloque (⭐) · 💸 Fondos a provincias de esos legisladores (💸 % presupuesto)
  · 📜 Sacarla por **decreto (DNU)** (más ⭐, aprobación de clase media ▼ y riesgo de que el Congreso lo voltee).
- **Votación animada**: los puntitos se van poniendo verdes o rojos uno por uno → «¡APROBADA!» o «RECHAZADA».
- **Presupuesto anual** (cada noviembre): el Congreso vota tu presupuesto. Si pasa: ⭐ y riesgo país ▼; si no: se usa el del año anterior y ⭐▼.
- **Juicio político**: si hay escándalo grande y la oposición tiene 2/3, se vota tu destitución (final posible).

## 7. Provincias y gobernadores

- **Mapa de fichas hexagonales** con la forma de Argentina (24 distritos + Malvinas + territorios conquistados).
  Se lee perfecto en el celular y cada ficha es fácil de tocar.
- Cada provincia: gobernador ficticio con cara, partido (color), **relación con vos** (corazones), apoyo a vos (%),
  diputados y senadores que controla, y **qué pide** («🏗️ una ruta», «💸 fondos», «⚡ subsidios»).
- Acciones: 🏗️ **Obra pública** (💸 + relación ▲ + crecimiento local) · 💸 **Fondos (ATN)** (💸, relación ▲▲, sus legisladores te votan más)
  · 🚶 **Visita** (⭐, apoyo ▲ ahí) · 🚨 **Intervención federal** (ley, extremo).
- En 2031 se eligen gobernadores (y en algunas provincias cambian según tu fuerza).

## 8. El mundo: alianzas, comercio y conquista

**Países** (banderas dibujadas en SVG): Brasil, Chile, Uruguay, Paraguay, Bolivia, Perú, Venezuela, EE. UU., China,
Rusia, Reino Unido, Unión Europea (+ FMI como organismo).
Cada uno tiene: ❤️ relación (−100 a 100), ⚔️ poder militar, 💰 tamaño de su economía, bloque (Mercosur, OTAN, eje China-Rusia).

| Acción | Requisito | Efecto |
|---|---|---|
| ✈️ Visita oficial | ⭐ | Relación ▲ |
| 🤝 Tratado comercial | Relación ≥ 20 | Exportaciones ▲ y crecimiento ▲ (cada mes) |
| 💵 Pedir préstamo / swap | Relación ≥ 30 | Reservas ▲▲, deuda ▲ |
| 🛡️ Alianza militar | Relación ≥ 50 | Te ayudan en guerras y te defienden |
| 🚫 Sanciones / romper relaciones | — | Relación ▼▼, a veces aprobación ▲ (nacionalismo) |
| ⚔️ **Declarar la guerra** | Ley (o decreto con costo enorme) | Empieza una guerra |
| 🇦🇷 **Reclamo por Malvinas** | — | Barra de «soberanía» que avanza con diplomacia (ONU, votos, relación con Reino Unido) o por la fuerza |

**Guerra** (simple y tensa): una barra de «frente» tira-y-afloja entre las dos banderas. Cada mes elegís
⚔️ Ofensiva (💸, avanza más) · 🛡️ Defender (barato) · 🕊️ Pedir la paz. El avance depende del poder militar
(sale del gasto en 🪖 Defensa, servicio militar y compras de armamento) + aliados − enemigos + 🎲.
Mientras dura: gasto ▲, economía ▼, al principio aprobación ▲ (patriotismo) que se desgasta.
- **Ganar** = **anexás el país**: aparecen sus fichas en tu mapa, sumás PBI y población… pero también resistencia,
  sanciones y relaciones ▼ con todos.
- **Perder** = indemnizaciones, aprobación ▼▼▼ y quizás perder territorio (o el gobierno).
- **Malvinas** se puede recuperar por las buenas (soberanía 100 % con años de diplomacia) o por las malas (Reino Unido es muy fuerte, con EE. UU. de aliado).

## 9. Noticias (eventos)

Estructura de cada evento (en `js/datos/eventos_*.js`):
```js
{ id: 'paro_cgt', fase: 'gobierno', peso: 3, cuando: s => s.grupos.trabajadores < 35,
  dibujo: '👷📢🚫', titular: 'La CGT llama a paro general',
  opciones: [
    { txt: 'Negociar', costo: { pc: 2 }, efectos: { trabajadores: +8, empresarios: -3 } },
    { txt: 'Descontar el día', efectos: { trabajadores: -10, empresarios: +5, pbi: -0.2 } },
    { txt: 'Aumento de salarios', costo: { gasto: 0.2 }, efectos: { trabajadores: +12, inflacion: +0.4 } } ] }
```
- Se elige al azar entre los que cumplen su condición (con peso), sin repetir en un tiempo, y algunos encadenan
  otros (`siguiente`) para armar pequeñas historias (un escándalo que crece, una sequía que sigue, una guerra).
- **Meta de contenido**: ~30 de campaña, ~90 de gobierno, ~25 del mundo y la guerra, ~15 especiales (Mundial 2030,
  visita del Papa, Copa América, descubrimientos en Vaca Muerta, boom del litio, apagón, sequía, inundaciones, dengue,
  corrida cambiaria, escándalo de un ministro, audios filtrados, video bailando que se viraliza…).
- Personajes y partidos **ficticios** (inspirados en tipos reconocibles, sin nombres reales).

## 10. Partidos rivales (ficticios)

| Partido | Color | Tipo | Fuerte en |
|---|---|---|---|
| Movimiento Nacional Popular (MNP) | azul celeste | peronismo | conurbano, norte |
| Alianza Republicana (AR) | amarillo | centroderecha | CABA, Córdoba, Mendoza |
| Partido de la Libertad (PL) | violeta | libertario | jóvenes, todo el país |
| Unión Cívica Federal (UCF) | rojo y blanco | radicalismo | interior, Corrientes, Jujuy |
| Frente de Trabajadores (FT) | rojo | izquierda | universidades, Neuquén |

## 11. Finales, puntaje y logros

- **Legado** (0-100) al final: crecimiento, inflación, pobreza, empleo, deuda, aprobación final, territorio, Malvinas, leyes.
  Se muestra con 1-5 ⭐ y un **título**: «Padre/Madre de la Patria», «El de la motosierra», «Conquistador/a del Cono Sur»,
  «Se fue en helicóptero», «El de la inflación de 4 dígitos»…
- **🔥 Termómetro de crisis** (siempre visible en Inicio): cada problema grave suma una llamita
  (inflación descontrolada, pobreza alta, riesgo país por las nubes, reservas vacías, recesión, déficit enorme,
  aprobación por el piso, paro general, guerra perdiéndose). Con muchas llamitas, cada mes hay chance de **estallido**.
  El jugador ve exactamente qué llamita es qué y cómo apagarla.
- **Fin del juego si**: estallido por el termómetro o aprobación < 12 % tres meses seguidos (renuncia 🚁), juicio político aprobado,
  derrota en guerra con el país ocupado, o perdés la reelección.
- **~35 logros** con medallas: «Ganaste en primera vuelta», «Déficit cero», «Inflación de un dígito», «Malvinas argentinas»,
  «Ganaste el Mundial gobernando», «Cero pobres en 10», «Sobreviviste a un paro general», «Te fuiste en helicóptero»…

## 12. Dirección visual

- **Look de «figuritas pegadas»**: fondo cielo celeste, tarjetas blancas con borde azul marino grueso y sombra sólida
  desplazada (como stickers), dorado del Sol de Mayo para lo importante. Un solo estilo, pensado para el juego.
- **Tipografía**: una de títulos gordita y simpática y una redondeada muy legible para el resto (con alternativa del sistema).
- Botones grandes (mínimo 44 px de alto), todo usable con el pulgar; en PC, dos columnas y atajos de teclado
  (Enter = pasar mes, 1-3 = opciones de la noticia).
- Animaciones cortas (números que cuentan, barras que crecen, caras que rebotan) y respeto por «reducir movimiento».
- Sonidos cortos generados (toque, ding, buzz, aplausos, máquina de escribir del diario) con botón de silencio.

---

## 13. Vueltas de trabajo (el «loop»)

Cada vuelta: **hacer → probar automáticamente → mirar capturas en celular y PC → criticar duro → arreglar → commit y push**.

| Vuelta | Qué se hace | Cómo se prueba |
|---|---|---|
| 0 | Este plan | — |
| 1 | Base del proyecto, motor (estado, semilla, guardado), estilos, portada, **crear partido**, **campaña** con acciones y ~15 noticias, **PASO / generales / ballotage** con noche de elecciones y reparto de bancas | Node: 500 campañas con bots (ninguna da NaN, el % suma 100, a veces se gana). Playwright: capturas 390 px y 1280 px |
| 2 | **Gobierno**: presupuesto en %, impuestos, déficit y cómo cubrirlo, simulación mensual, **la gente** con caras y frases, aprobación, ~40 noticias, **resumen del mes con causas** | Bots que gobiernan 48 meses con estrategias distintas (gastar todo, motosierra, equilibrado): la economía tiene que reaccionar con sentido |
| 3 | **Congreso** (hemiciclos, leyes, porotos, negociación, DNU, presupuesto anual) y **Provincias** (mapa hexagonal, gobernadores, obras, fondos) | Bots que mandan leyes; probar que una ley sin votos no pasa y con negociación sí |
| 4 | **Mundo**: relaciones, tratados, préstamos, FMI, alianzas, **guerra y anexión**, **Malvinas** | Bots belicosos y pacifistas; chequear que ganar una guerra suma territorio y perder castiga |
| 5 | Medio término 2029, reelección 2031, **oposición** si perdés, finales con legado, logros | Partidas completas de punta a punta |
| 6 | Jugo: sonidos, confeti, transiciones, tutorial de 3 tarjetas, accesibilidad, PC en dos columnas | Revisión de capturas, prueba de teclado |
| 7 | **Balance**: simulaciones masivas (que ganar sea posible pero no regalado; que ninguna estrategia rompa el juego) | Estadísticas de 2000 partidas |
| 8+ | Más noticias (meta 160), más leyes, más frases, auditoría de errores, build final y publicación | Todo lo anterior |

### Criterios de «terminado»
- Se puede jugar de punta a punta (crear partido → campaña → gobierno → final) en celular y PC sin errores en consola.
- Ninguna pantalla tiene más de ~25 palabras visibles de golpe (sin contar nombres).
- Toda decisión muestra a quién afecta antes y después.
- 2000 partidas simuladas sin NaN ni valores fuera de rango.
- Hay al menos 150 noticias, 20 leyes, 12 países y 30 logros.

---

## 14. Estado (noviembre 2026)

| Vuelta | Estado |
|---|---|
| 0 · Plan | ✅ |
| 1 · Crear partido, campaña, PASO, generales, ballotage, debate, noche electoral, bancas | ✅ |
| 2 · Gobierno: presupuesto en %, impuestos, déficit, la gente con caras y frases, aprobación, crisis, resumen con «¿Por qué?» | ✅ |
| 3 · Congreso (leyes, porotos, negociar, decretos, presupuesto anual), gobernadores, medio término y reelección | ✅ |
| 4 · Mundo: 12 países, tratados, préstamos, alianzas, guerra con frente, anexión, Malvinas | ✅ |
| 5 · Logros, legado con título, oposición si perdés | ✅ |
| 6 · Guía de primeros pasos, juicio político, 150 noticias, prueba de textos cortos | ✅ |
| 7 · Pedidos al probarlo: mapa real, bandera de partido (con imagen), partidos reales, riesgos con % y efecto, gráfico de imagen mes a mes, todo sin deslizar en el celu | ✅ |
| 8 · Acto local: panel que salta al tocar la provincia y entra en la pantalla, efecto según afinidad, imagen del país = promedio de las provincias por padrón; Tierra del Fuego vuelve a dibujarse | ✅ |
| 9 · Congreso coherente: cada bloque vota según si la ley va para su lado (no por distancia pura), su bandera la empuja aunque esté peleado con vos, y se ve el motivo de cada voto | ✅ |
| 10 · Corto vs mediano plazo: las leyes muestran «⚡ Ahora» y «⏳ En 1-2 años» y maduran de a poco (tarjeta «Tus leyes, en camino»); el crecimiento llega a sueldos, precios y, por la «torta», a jubilados y ayuda social en plata real | ✅ |
| 11 · Leyes con motor: 54 leyes con filtros por tema e ideología (botones que abren una ventanita), filas compactas, «Al firmar» / «Con el tiempo» con pocos carteles directos; caminos viables para Estado presente, Centro y Mercado; retenciones e impuestos con efecto gradual en exportaciones e inversión; 36 noticias que dependen de ideología, leyes y economía | ✅ |
| 12 · Ritmo de juego: un mandato se juega en ~1 hora, así que las leyes llegan en meses, pegan ×1,5 y la economía reacciona ~2× más rápido (`R.eco.RITMO`); al año ya se notan los cambios | ✅ |
| 13 · Ficha de cada grupo más clara: humor con hacia dónde va, «lo que más lo enoja» con el dato real, barras que salen del centro (rojo resta, verde suma), «Tus ideas» marcada como fija y punto crítico visible en la pantalla de inicio | ✅ |
| 14 · Rediseño para que no parezca hecho por IA: estilo afiche (Archivo condensada, rosa Casa Rosada), portada como afiche, cajas planas sin sombras duras, sin emojis en títulos ni botones, íconos de línea en la barra, menos textos de ayuda y menos confeti | ✅ |

**Criterios de terminado:** se juega de punta a punta en celu y PC sin errores de consola (Playwright); 2000 campañas y 100 gobiernos
de dos mandatos simulados sin NaN; 150 noticias, 23 leyes, 12 países y 32 logros; ningún titular pasa de 9 palabras ni opción de 4.

**Lo que falta probar de verdad:** jugar con personas reales y ajustar el balance según lo que digan.

**Ideas para más adelante:** música, avatar del rival en cada noticia, resumen del año, más eventos encadenados (historias de varios meses),
gabinete completo, modo «gobernador de provincia», multijugador por turnos.
