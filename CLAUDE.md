# CLAUDE.md — Contexto para seguir trabajando en «Carrera de Globos»

Juego de **Roblox** (Luau), inspirado en un mapa de Eggy Party que el usuario vio en TikTok.
Este archivo tiene todo lo que otra conversación de Claude necesita para continuar sin preguntar lo que ya se decidió.

## El usuario
- Habla **español** (rioplatense/latino, escribe rápido y con faltas). Responder siempre en español, simple y directo.
- No es programador experto: explicar pasos de Roblox Studio con clics concretos. Su Studio está **en español**:
  «Probar», «Explorador», «Insertar desde archivo…», «Archivo → Configuración del juego», «Vista → Salida».
- Su lugar en Studio se llamaba «Superpoder» (plantilla Baseplate); quería renombrarlo a «Carrera de Globos».
- **Principio de diseño que pidió:** «emocionante y dopamínico, pero simple y sencillo». Cada minijuego se entiende en 1 segundo.
- Explotar globos es **con el cuerpo** (pisar, chocar, pararse en botones, volar en trampolines). **Nunca con clics**.
- Pidió: sonido de pop muy satisfactorio, más etapas rápidas y dinámicas, Wins que sirvan para algo (estelas, etc.),
  tablas de mejores tiempos y más Wins, mejora visual y música de fondo que acelere en la última etapa.
- Le gusta que Claude trabaje en ciclos de mejora («loop»), siendo muy crítico con el propio código.
- **Nadie tiene acceso a su Roblox**: Claude escribe código en este repo y el usuario lo mete en Studio.

## Estado actual
- **Nunca se probó en un Roblox real.** Solo pasó el verificador `luau-lsp` con las definiciones de la API de Roblox.
  Lo prioritario es arreglar lo que el usuario reporte al probar (ver `PRUEBAS.md`).
- Rama de trabajo: `ccr-f9dac4e9-zok3mj` en `cairovega-desing/local-cairo`. Historial en `PLAN.md` (vueltas 1 a 9).
- Los sonidos y la música están en `sounds/` como `.wav` generados por código. En `Config.Sonidos` hay rutas
  `rbxasset://` de relleno; la música (`Config.Musica`) queda en silencio hasta que el usuario suba los archivos y pegue los IDs.

## Cómo se instala (lo que hace el usuario)
1. `python3 tools/build.py` genera **`CarreraDeGlobos.rbxmx`**: una carpeta `CarreraGlobos` con todos los scripts.
2. En Studio: clic derecho en **ServerScriptService** → **Insertar desde archivo…** → Play. El mapa se construye solo con código.
3. También funciona con Rojo (`default.project.json` mapea `src/` → `ServerScriptService/CarreraGlobos`).

**Después de cada cambio en `src/`, regenerar el `.rbxmx` y hacer commit también de ese archivo.**

## Arquitectura (`src/`)
| Archivo | Qué hace |
|---|---|
| `Main.server.luau` | Arranque. Clona `Config` a ReplicatedStorage (`CarreraGlobosConfig`), crea el RemoteEvent `CarreraGlobosEvento` y mueve la ScreenGui `CarreraUI` a StarterGui. Construye el lobby, sortea etapas (`pickStages`) y construye la pista. También maneja el bucle de las plataformas del lobby (1v1, o solo contra el reloj tras `EsperaSolo`), el límite de mensajes por jugador y la reconstrucción de la pista tras cada carrera. |
| `Race.luau` | Una carrera completa: `Race.run(map, players, remote)`. Prepara los globos por etapa con **semilla compartida** (las dos pistas son idénticas). Hace la cuenta atrás (HRP anclado), el bucle Heartbeat de explotar por distancia del cuerpo y las puertas/barreras. También reaparición en la última puerta, súper poder, anti-trampas de velocidad, límite de tiempo, ganador, rachas y corona. `cleanup()` corre **siempre** (el cuerpo va dentro de un `pcall`). |
| `MapBuilder.luau` | `build()` hace el lobby: plataformas, spawn, letrero y decoración. `buildTrack(map, stageModules)` destruye y rehace las 2 pistas paralelas (eje +X, separadas por un vidrio en Z=0): puertas con contador, arcos, pisos de color, banderines y meta. |
| `Balloons.luau` | Crea un globo: Model con Cuerpo (esfera), Brillo, Nudo e Hilo, más la etiqueta `GloboCarrera`. Atributos: `Fase`, `SinFlotar`, y además `Dueno`/`Etapa` (los pone Race). |
| `Stages/*.luau` | Una etapa por módulo. Interfaz: `Title`, `Hint`, `length()`, `build(ctx) -> handle` (geometría fija) y `start(handle, rt) -> { goal, update?(dt, root, inside), stop? }`. |
| `Datos.luau` | leaderstats (`Wins`, `Globos`) y DataStore `CarreraGlobos_v1`. Guarda los atributos `Estela`, `Titulo`, `Baile` y `MejorTiempo`. **Solo guarda si `DatosCargados`** (no pisa datos si la carga falló). Autoguardado cada 120 s. |
| `Recompensas.luau` | Estelas (Trail en el HRP), títulos (Billboard en Head con Wins y 🔥 racha) y bailes. Las Wins **no se gastan**: desbloquean por umbral. Maneja `equip` y el aviso de «desbloqueo». |
| `Tablas.luau` | 3 tablas globales en el lobby (OrderedDataStore): Más Wins, Mejores tiempos (ms, ascendente) y Más globos. Si no hay DataStore, muestran a los jugadores del servidor. |
| `Ambiente.luau` | Iluminación alegre: ColorCorrection, Bloom, SunRays y Atmosphere. Se apaga con `Config.MejorarIluminacion`. |
| `Util.luau` | Ayudantes: `part`, `cylinder` (vertical), `billboard` y `surfaceText`. |
| `Config.luau` | **Todo lo ajustable**, con claves en español: etapas, velocidades, sonidos, música, estelas, títulos, bailes, etc. |
| `CarreraUI/UI.client.luau` | Todo lo del cliente: interfaz y carteles, sonidos (pop + nota pentatónica por combo), confeti, «+10» y temblor de cámara. También la música (acelera en la última etapa), la tienda con 3 pestañas, la barra de carrera, los trampolines (el impulso lo aplica el cliente), el baile (vía el bindable `Animate.PlayEmote`), el flotar de los globos con `BulkMoveTo`, las cintas animadas, los anillos de las plataformas y el resaltado de los últimos globos. |

### Las 9 etapas (cada carrera sortea 6, con `Gigante` siempre al final)
`Aspas` (botón verde + brazo con HingeConstraint motor), `Neumaticos` (globos en llantas), `Cinta` (cintas con
`AssemblyLinearVelocity`), `Dardos` (botón azul, cañón que barre y dardos que atraviesan; los dardos son visuales del
cliente y el servidor calcula los golpes), `Trampolines` (pads con etiqueta `TrampolinCarrera`), `Lluvia` (caen globos
cerca de ti), `Huidizos` (huyen pero son más lentos que tú), `Laberinto` (zigzag con esferas moradas de súper poder)
y `Gigante` (se infla con cada choque, te hace rebotar y explota).

### API `rt` que recibe cada etapa en `start`
`player`, `folder`, `rng` (semilla compartida), `addBalloon(pos, {size, color, golden, noString, noBob})`,
`pop(model)`, `balloons()`, `move(model, pos)`, `hit(pos, color, radius)` (suma progreso sin globo), `done()`,
`bounce(velocity)`, `fx(kind, ...)` (FireAllClients) y `powerUp(seconds)`.

### Eventos servidor → cliente (un solo RemoteEvent, primer argumento = tipo)
`estado`, `carrera`, `cuenta`, `etapa`, `progreso`, `globo`, `puerta`, `dardo`, `poder`, `poderJugador`, `rebote`,
`golpeGigante`, `explosion`, `ganador`, `aviso`, `desbloqueo`, `tienda` y `fin`.
Cliente → servidor: `hola` y `equipar(kind, id)`, con límite de 0.2 s por jugador.

## Cómo verificar antes de cada commit (obligatorio)
```bash
# Herramientas (una vez):
curl -sSL -o luau-lsp.zip https://github.com/JohnnyMorganz/luau-lsp/releases/latest/download/luau-lsp-linux-x86_64.zip && unzip -o luau-lsp.zip
curl -sSL -o globalTypes.d.luau https://raw.githubusercontent.com/JohnnyMorganz/luau-lsp/main/scripts/globalTypes.None.d.luau
# Cada vez:
python3 tools/build.py                       # genera el .rbxmx y sourcemap.json
python3 -c "import xml.dom.minidom as m; m.parse('CarreraDeGlobos.rbxmx')"
./luau-lsp analyze --definitions=globalTypes.d.luau --sourcemap=sourcemap.json $(find src -name "*.luau")
```
Tiene que salir **sin errores** (`selene` no sirve aquí: no descarga su stdlib por el proxy).
Sonidos y música: `pip install numpy && python3 tools/make_sounds.py && python3 tools/make_music.py`.

## Convenciones
- Comentarios, textos de UI y claves de `Config` **en español**; identificadores de código en inglés.
- Todo lo ajustable va en `Config`. Las etapas nuevas se agregan a `Config.Etapas`.
- El servidor manda (explotar, puertas y Wins se deciden en el servidor); el cliente solo dibuja y suena,
  salvo los impulsos de trampolín y rebote, que se aplican en el cliente porque el personaje es suyo.
- Rendimiento en celular: nada de mover muchas piezas desde el servidor cada frame (máximo 20 Hz y solo si `inside`).
- Commits en español, claros. No crear PR si el usuario no lo pide.

## Próximas ideas (de `PLAN.md`)
- Personajes redondos tipo «huevito» (opcional).
- Más etapas: rodillo gigante, pisos que se hunden, cañón humano.
- Efecto de explosión desbloqueable (color del confeti).
- Cámara de espectador desde el lobby.
- Carreras de 4 jugadores.
- Riesgos a revisar en Studio real: impulso de trampolín tras `ChangeState(Jumping)`, `PlayEmote`/Animate para el baile,
  rutas `rbxasset://sounds/...` de relleno, StreamingEnabled con teletransportes lejanos.
