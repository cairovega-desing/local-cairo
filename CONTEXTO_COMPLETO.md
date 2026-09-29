# 🎈 Carrera de Globos — CONTEXTO COMPLETO para Claude

> **Para Claude:** este archivo trae todo lo necesario para seguir trabajando en el juego:
> quién es el usuario y qué quiere, cómo está hecho, cómo verificarlo y **el código completo**.
> 1. Lee primero «CLAUDE.md» (abajo).
> 2. Para reconstruir el proyecto, crea cada archivo de la sección «Código» con su ruta exacta.
> 3. Corre `python3 tools/build.py` para generar `CarreraDeGlobos.rbxmx`, lo que el usuario mete en Roblox Studio.
>
> Repo original: `cairovega-desing/local-cairo`, rama `ccr-f9dac4e9-zok3mj`.
> Los sonidos (`sounds/*.wav`) no van incluidos porque son binarios: se regeneran con
> `tools/make_sounds.py` y `tools/make_music.py` (necesitan numpy).


---

# 📄 CLAUDE.md

## CLAUDE.md — Contexto para seguir trabajando en «Carrera de Globos»

Juego de **Roblox** (Luau), inspirado en un mapa de Eggy Party que el usuario vio en TikTok.
Este archivo tiene todo lo que otra conversación de Claude necesita para continuar sin preguntar lo que ya se decidió.

### El usuario
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

### Estado actual
- **Nunca se probó en un Roblox real.** Solo pasó el verificador `luau-lsp` con las definiciones de la API de Roblox.
  Lo prioritario es arreglar lo que el usuario reporte al probar (ver `PRUEBAS.md`).
- Rama de trabajo: `ccr-f9dac4e9-zok3mj` en `cairovega-desing/local-cairo`. Historial en `PLAN.md` (vueltas 1 a 9).
- Los sonidos y la música están en `sounds/` como `.wav` generados por código. En `Config.Sonidos` hay rutas
  `rbxasset://` de relleno; la música (`Config.Musica`) queda en silencio hasta que el usuario suba los archivos y pegue los IDs.

### Cómo se instala (lo que hace el usuario)
1. `python3 tools/build.py` genera **`CarreraDeGlobos.rbxmx`**: una carpeta `CarreraGlobos` con todos los scripts.
2. En Studio: clic derecho en **ServerScriptService** → **Insertar desde archivo…** → Play. El mapa se construye solo con código.
3. También funciona con Rojo (`default.project.json` mapea `src/` → `ServerScriptService/CarreraGlobos`).

**Después de cada cambio en `src/`, regenerar el `.rbxmx` y hacer commit también de ese archivo.**

### Arquitectura (`src/`)
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

#### Las 9 etapas (cada carrera sortea 6, con `Gigante` siempre al final)
`Aspas` (botón verde + brazo con HingeConstraint motor), `Neumaticos` (globos en llantas), `Cinta` (cintas con
`AssemblyLinearVelocity`), `Dardos` (botón azul, cañón que barre y dardos que atraviesan; los dardos son visuales del
cliente y el servidor calcula los golpes), `Trampolines` (pads con etiqueta `TrampolinCarrera`), `Lluvia` (caen globos
cerca de ti), `Huidizos` (huyen pero son más lentos que tú), `Laberinto` (zigzag con esferas moradas de súper poder)
y `Gigante` (se infla con cada choque, te hace rebotar y explota).

#### API `rt` que recibe cada etapa en `start`
`player`, `folder`, `rng` (semilla compartida), `addBalloon(pos, {size, color, golden, noString, noBob})`,
`pop(model)`, `balloons()`, `move(model, pos)`, `hit(pos, color, radius)` (suma progreso sin globo), `done()`,
`bounce(velocity)`, `fx(kind, ...)` (FireAllClients) y `powerUp(seconds)`.

#### Eventos servidor → cliente (un solo RemoteEvent, primer argumento = tipo)
`estado`, `carrera`, `cuenta`, `etapa`, `progreso`, `globo`, `puerta`, `dardo`, `poder`, `poderJugador`, `rebote`,
`golpeGigante`, `explosion`, `ganador`, `aviso`, `desbloqueo`, `tienda` y `fin`.
Cliente → servidor: `hola` y `equipar(kind, id)`, con límite de 0.2 s por jugador.

### Cómo verificar antes de cada commit (obligatorio)
```bash
## Herramientas (una vez):
curl -sSL -o luau-lsp.zip https://github.com/JohnnyMorganz/luau-lsp/releases/latest/download/luau-lsp-linux-x86_64.zip && unzip -o luau-lsp.zip
curl -sSL -o globalTypes.d.luau https://raw.githubusercontent.com/JohnnyMorganz/luau-lsp/main/scripts/globalTypes.None.d.luau
## Cada vez:
python3 tools/build.py                       # genera el .rbxmx y sourcemap.json
python3 -c "import xml.dom.minidom as m; m.parse('CarreraDeGlobos.rbxmx')"
./luau-lsp analyze --definitions=globalTypes.d.luau --sourcemap=sourcemap.json $(find src -name "*.luau")
```
Tiene que salir **sin errores** (`selene` no sirve aquí: no descarga su stdlib por el proxy).
Sonidos y música: `pip install numpy && python3 tools/make_sounds.py && python3 tools/make_music.py`.

### Convenciones
- Comentarios, textos de UI y claves de `Config` **en español**; identificadores de código en inglés.
- Todo lo ajustable va en `Config`. Las etapas nuevas se agregan a `Config.Etapas`.
- El servidor manda (explotar, puertas y Wins se deciden en el servidor); el cliente solo dibuja y suena,
  salvo los impulsos de trampolín y rebote, que se aplican en el cliente porque el personaje es suyo.
- Rendimiento en celular: nada de mover muchas piezas desde el servidor cada frame (máximo 20 Hz y solo si `inside`).
- Commits en español, claros. No crear PR si el usuario no lo pide.

### Próximas ideas (de `PLAN.md`)
- Personajes redondos tipo «huevito» (opcional).
- Más etapas: rodillo gigante, pisos que se hunden, cañón humano.
- Efecto de explosión desbloqueable (color del confeti).
- Cámara de espectador desde el lobby.
- Carreras de 4 jugadores.
- Riesgos a revisar en Studio real: impulso de trampolín tras `ChangeState(Jumping)`, `PlayEmote`/Animate para el baile,
  rutas `rbxasset://sounds/...` de relleno, StreamingEnabled con teletransportes lejanos.

---

# 📄 PLAN.md

## Plan: Carrera de Globos

### Idea
Carrera 1 contra 1 (o contra el reloj) por pistas paralelas. Cada etapa es un
minijuego corto de explotar globos **con el cuerpo**. Una puerta bloquea la
siguiente etapa hasta completar la actual. Gana quien cruza la meta primero.

Principios de diseño:
1. **Se entiende en 1 segundo:** cada etapa tiene un cartel grande y una instrucción de 4 a 6 palabras.
2. **Recompensa constante:** cada globo suena, brilla y suma. Los combos suben de tono y la puerta celebra.
3. **Carrera justa:** las dos pistas usan la misma semilla y tienen los mismos globos en los mismos lugares.
4. **Rápido:** unas 8 etapas de 5 a 15 segundos cada una.

### Hecho (versión 1)
- [x] Mapa generado por código: lobby, 2 plataformas, pistas con vidrio, puertas con contador y meta
- [x] 8 etapas: Aspas, Neumáticos, Cinta, Dardos, Trampolines, Lluvia, Laberinto y Gigante
- [x] Explotar con el cuerpo (el servidor revisa la distancia, sin trampas de cliente)
- [x] Combos musicales, confeti, onda, +10 flotante, temblor de cámara y globos dorados
- [x] Súper poder morado (velocidad, más alcance y aura)
- [x] Cuenta atrás, barra de progreso de ambos jugadores y pantalla de ganador
- [x] Modo contra el reloj si estás solo
- [x] Reaparición en la última puerta si te caes o reinicias
- [x] Wins, Globos, estelas (9), títulos (6), tienda y guardado con DataStore
- [x] Tablas globales en el lobby: Más Wins, Mejores tiempos y Más globos
- [x] 13 sonidos hechos a medida (`sounds/`)
- [x] Un solo archivo `.rbxmx` para instalar

### Vuelta de mejora 1
- [x] Arreglo: el texto de estado se encimaba con la barra de carrera (espectadores)
- [x] Arreglo: trampolines y globo gigante lanzan de forma fiable (estado de salto antes del impulso)
- [x] Contra el reloj muestra «¡TERMINASTE!» o «¡NUEVO RÉCORD!» en vez de «¡GANASTE!»
- [x] El cartel de desbloqueo ya no tapa la pantalla de victoria
- [x] Rendimiento en celular: los globos flotan moviéndose todos juntos con `BulkMoveTo`
- [x] Guardado automático cada 2 minutos

### Vuelta de mejora 2
- [x] Cada carrera sortea 6 etapas del banco de 8, en orden aleatorio, con el Globo Gigante siempre al final
- [x] La pista se reconstruye después de cada carrera, así la próxima es distinta
- [x] Rachas de victorias 🔥: se ven en el título y en la pantalla de ganador («¡IMPARABLE!» con 3 o más)
- [x] Seguridad: si una carrera falla por un error, los jugadores vuelven al lobby

### Vuelta de mejora 3 (visual)
- [x] Iluminación alegre: colores más vivos, brillo en lo neón, rayos de sol y cielo suave (`Ambiente`, se apaga con `Config.MejorarIluminacion`)
- [x] Cada etapa con su piso de color pastel y un arco de entrada con su número y nombre
- [x] Banderines de fiesta y racimos de globos sobre las paredes
- [x] Globos con brillo blanco tipo juguete (el globo gigante lo agranda al inflarse)
- [x] Lobby con piso a cuadros pastel y racimos de globos en las esquinas
- [x] Paneles de la interfaz con degradado morado-rosa y borde blanco

### Vuelta de mejora 4
- [x] Arreglo: reiniciarse durante la cuenta atrás ya no te deja empezar en la etapa 1 con ventaja
- [x] Arreglo: quien entra al servidor a mitad de una carrera ve la barra de progreso
- [x] Las plataformas del lobby lanzan anillos de luz para que se vea dónde pararse
- [x] El ganador baila y aparece una corona 👑 sobre su cabeza

### Vuelta de mejora 5
- [x] Etapa nueva: 🏃 Globos huidizos (se escapan cuando te acercas; hay que acorralarlos). El banco ya tiene 9 etapas
- [x] Bailes de victoria desbloqueables con Wins (5), con pestaña en la tienda y vista previa al equipar
- [x] El botón del lobby ahora dice «✨ TIENDA»

### Vuelta de mejora 6 (pedido: música)
- [x] Música de fondo hecha a medida (loops perfectos): lobby tranquila y carrera chiptune a 140 BPM
- [x] La música sube un poco en cada etapa y en la última acelera a tope, con el cartel «🔥 ¡ÚLTIMA ETAPA! 🔥»
- [x] Al ganar, la música baja para que se escuche la fanfarria; en el lobby vuelve la tranquila

Principio que pidió el usuario: **emocionante y dopamínico, pero simple y sencillo.**

### Vuelta de mejora 7 (auditoría de errores)
- [x] Trampa: si el rival se va, ya no se regala una Win ni se guarda un tiempo récord falso de 0 segundos
- [x] Datos: si falla la carga, ya no se guarda encima (antes se podían borrar las Wins)
- [x] La carrera termina a los 4 minutos si nadie llega (antes alguien AFK bloqueaba el juego)
- [x] La limpieza de la carrera corre siempre, aunque haya un error
- [x] El baile de victoria usa el script Animate de Roblox y el ganador se queda quieto para que se vea
- [x] Trampolines: el impulso se vuelve a aplicar después del salto, para que no se pierda
- [x] Rendimiento en red: los globos huidizos y la lluvia se mueven solo con el jugador adentro, 20 veces por segundo
- [x] Seguridad: límite de mensajes por jugador en el RemoteEvent

### Vuelta de mejora 8 (simple e intuitivo)
- [x] Cuando te faltan 3 globos o menos, tus globos brillan a través de las paredes (se acabó buscar el último)
- [x] Anti-trampas de velocidad: si te mueves más rápido de lo posible, vuelves a tu última puerta (margen amplio para trampolines, cintas y rebotes)

### Vuelta de mejora 9 (pruebas)
- [x] `Config.ProbarEtapa`: la carrera tiene solo esa etapa, para probarlas una por una
- [x] `PRUEBAS.md`: lista de pruebas en Studio y cómo reportar errores

### Próximas ideas (se revisan en cada vuelta de mejora)
- Personajes redondos tipo «huevito» (opcional)
- Más etapas: Rodillo gigante, Globos que huyen, Pisos que se hunden, Cañón humano
- Efecto de explosión desbloqueable (color del confeti)
- Espectadores: cámara que sigue a los corredores desde el lobby
- Carrera de 4 jugadores

---

# 📄 PRUEBAS.md

## 🧪 Lista de pruebas en Roblox Studio

El código se revisó con un verificador contra la API de Roblox, pero **nunca se probó en un juego real**.
Esta lista te ayuda a probar todo en unos 15 minutos.

### Antes de empezar

1. Abre **View → Output**. Ahí aparecen los errores en rojo y los avisos `[CarreraGlobos]`.
2. Inserta `CarreraDeGlobos.rbxmx` en **ServerScriptService** y dale a **Play**.

**Si algo falla**, copia el texto rojo del Output y pégamelo en el chat, junto con qué estabas haciendo. Con eso lo arreglo.

### 1. Lobby (juega solo)
- [ ] Apareces en el lobby: piso a cuadros, letrero rosa y 3 tablas en la pared
- [ ] Las 2 plataformas lanzan anillos de luz
- [ ] Arriba dice «Párate en una plataforma para jugar 🎈»
- [ ] El botón **✨ TIENDA** abre la tienda con 3 pestañas; al equipar un baile, tu personaje baila
- [ ] Llevas una estela blanca al correr y un título «Novato · 🏆 0» sobre la cabeza

### 2. Carrera contra el reloj
- [ ] Te paras en una plataforma: arriba dice «…juegas solo contra el reloj en 6, 5, 4…» y te lleva a la pista
- [ ] Sale «3, 2, 1, ¡YA!» y no te puedes mover hasta el «¡YA!»
- [ ] Al entrar a cada etapa sale un cartel grande con su nombre
- [ ] Explotar globos suena, sale confeti y aparece «+10»; con varios seguidos sale «¡COMBO x5!» y la nota sube
- [ ] La puerta muestra «🎈 12 / 32» y se hunde al completar la etapa
- [ ] Llegas a la meta: «⏱ ¡TERMINASTE!» y vuelves al lobby

### 3. Cada etapa por separado
En `Config` pon `Config.ProbarEtapa = "Aspas"` (y después cada una) y juega:

| Etapa | Qué revisar |
|---|---|
| `Aspas` | Al pararte en el botón verde, el brazo gira y revienta el anillo |
| `Neumaticos` | Los globos dentro de las llantas explotan al pisarlos |
| `Cinta` | Las cintas te arrastran de lado y las franjas amarillas se mueven |
| `Dardos` | En el botón azul, el cañón gira y dispara dardos que atraviesan globos |
| `Trampolines` | Te lanzan bien alto y revientas la torre de 3 globos |
| `Lluvia` | Caen globos del cielo cerca de ti |
| `Huidizos` | Los globos se escapan, pero los puedes alcanzar |
| `Laberinto` | La esfera morada te da ⚡ SÚPER PODER (más rápido y con aura) |
| `Gigante` | Chocarlo te hace rebotar; se infla, se pone rojo y explota |

Cuando termines, vuelve a poner `Config.ProbarEtapa = ""`.

### 4. 1 contra 1
**Test → Clients and Servers → 2 jugadores → Start**. Cada jugador se para en una plataforma.
- [ ] Arriba se ve la barra de ambos jugadores y cuántas etapas lleva cada uno
- [ ] El ganador ve «🏆 ¡GANASTE!», baila y tiene una 👑
- [ ] El que pierde ve «¡Ganó …!»
- [ ] Al ganador se le suma 1 en **Wins** (tabla de jugadores, arriba a la derecha)
- [ ] Si cierras una ventana a mitad de carrera, al otro le sale «Tu rival se fue» y no gana Win

### 5. Sonidos y música (después de subirlos)
- [ ] El pop suena bien y la nota sube en los combos
- [ ] Música tranquila en el lobby y rápida en la carrera, que acelera en la última etapa

---

# 💾 Código (crea cada archivo con esta ruta exacta)

Archivos:
- `src/Ambiente.luau`
- `src/Balloons.luau`
- `src/CarreraUI/UI.client.luau`
- `src/CarreraUI/init.meta.json`
- `src/Config.luau`
- `src/Datos.luau`
- `src/Main.server.luau`
- `src/MapBuilder.luau`
- `src/Race.luau`
- `src/Recompensas.luau`
- `src/Stages/Aspas.luau`
- `src/Stages/Cinta.luau`
- `src/Stages/Dardos.luau`
- `src/Stages/Gigante.luau`
- `src/Stages/Huidizos.luau`
- `src/Stages/Laberinto.luau`
- `src/Stages/Lluvia.luau`
- `src/Stages/Neumaticos.luau`
- `src/Stages/Trampolines.luau`
- `src/Tablas.luau`
- `src/Util.luau`
- `tools/build.py`
- `tools/make_context.py`
- `tools/make_music.py`
- `tools/make_sounds.py`
- `default.project.json`
- `.gitignore`

## `src/Ambiente.luau`

```lua
--[[
	AMBIENTE: iluminación alegre tipo «juguete». Colores más vivos, brillo
	en lo neón, rayos de sol y un cielo suave. Se desactiva con
	Config.MejorarIluminacion = false (si prefieres tu propia iluminación).
]]

local Lighting = game:GetService("Lighting")

local Config = require(script.Parent.Config)

local Ambiente = {}

local function effect(className: string, name: string, props: { [string]: any })
	local inst = Lighting:FindFirstChild(name)
	if not inst then
		inst = Instance.new(className)
		inst.Name = name
	end
	for key, value in props do
		(inst :: any)[key] = value
	end
	inst.Parent = Lighting
	return inst
end

function Ambiente.apply()
	if not Config.MejorarIluminacion then
		return
	end

	Lighting.ClockTime = 14.5
	Lighting.Brightness = 2.5
	Lighting.GlobalShadows = true
	Lighting.Ambient = Color3.fromRGB(95, 85, 120)
	Lighting.OutdoorAmbient = Color3.fromRGB(160, 150, 180)
	Lighting.EnvironmentDiffuseScale = 1
	Lighting.EnvironmentSpecularScale = 1
	Lighting.ShadowSoftness = 0.3

	effect("ColorCorrectionEffect", "ColorCarrera", {
		Saturation = 0.25,
		Contrast = 0.08,
		Brightness = 0.02,
		TintColor = Color3.fromRGB(255, 248, 242),
	})
	effect("BloomEffect", "BrilloCarrera", {
		Intensity = 0.7,
		Size = 28,
		Threshold = 1.4, -- solo brilla lo neón (globos dorados, botones, meta)
	})
	effect("SunRaysEffect", "RayosCarrera", {
		Intensity = 0.05,
		Spread = 0.7,
	})
	effect("Atmosphere", "CieloCarrera", {
		Density = 0.18,
		Offset = 0.15,
		Color = Color3.fromRGB(205, 225, 255),
		Decay = Color3.fromRGB(255, 200, 230),
		Glare = 0.25,
		Haze = 1,
	})
end

return Ambiente
```

## `src/Balloons.luau`

```lua
-- Crea globos. Los efectos de explosión (partículas, sonido, «+10») los dibuja
-- cada cliente en UI.client.luau para que se vean fluidos.

local CollectionService = game:GetService("CollectionService")

local Config = require(script.Parent.Config)

local Balloons = {}

Balloons.TAG = "GloboCarrera" -- el cliente usa esta etiqueta para hacerlos flotar

export type Options = {
	size: number?,
	color: Color3?,
	golden: boolean?,
	noString: boolean?,
	noBob: boolean?, -- true si el servidor mueve este globo (el cliente no lo hace flotar)
}

function Balloons.create(parent: Instance, position: Vector3, opts: Options): Model
	local size = opts.size or 3
	local golden = opts.golden == true
	local color = if golden
		then Config.ColorDorado
		else opts.color or Config.ColoresGlobo[math.random(#Config.ColoresGlobo)]

	local model = Instance.new("Model")
	model.Name = if golden then "GloboDorado" else "Globo"

	local body = Instance.new("Part")
	body.Name = "Cuerpo"
	body.Size = Vector3.new(size, size * 1.2, size)
	body.CFrame = CFrame.new(position)
	body.Color = color
	body.Material = if golden then Enum.Material.Neon else Enum.Material.SmoothPlastic
	body.Reflectance = if golden then 0 else 0.12
	body.Anchored = true
	body.CanCollide = false
	body.CanTouch = false
	local mesh = Instance.new("SpecialMesh")
	mesh.MeshType = Enum.MeshType.Sphere
	mesh.Parent = body
	body.Parent = model

	-- Brillo blanco (le da aspecto de globo de verdad, como en Eggy Party)
	local shine = Instance.new("Part")
	shine.Name = "Brillo"
	shine.Shape = Enum.PartType.Ball
	shine.Size = Vector3.one * size * 0.22
	shine.CFrame = CFrame.new(position + Vector3.new(-size * 0.28, size * 0.3, -size * 0.18))
	shine.Color = Color3.new(1, 1, 1)
	shine.Material = Enum.Material.SmoothPlastic
	shine.Transparency = 0.35
	shine.Anchored = true
	shine.CanCollide = false
	shine.CanTouch = false
	shine.CanQuery = false
	shine.CastShadow = false
	shine.Parent = model

	if not opts.noString then
		local knot = Instance.new("Part")
		knot.Name = "Nudo"
		knot.Size = Vector3.new(0.5, 0.4, 0.5)
		knot.CFrame = CFrame.new(position - Vector3.new(0, size * 0.62, 0))
		knot.Color = color
		knot.Anchored = true
		knot.CanCollide = false
		knot.CanTouch = false
		knot.CanQuery = false
		knot.Parent = model

		local thread = Instance.new("Part")
		thread.Name = "Hilo"
		thread.Size = Vector3.new(0.08, size * 0.7, 0.08)
		thread.CFrame = CFrame.new(position - Vector3.new(0, size * 0.62 + size * 0.35, 0))
		thread.Color = Color3.fromRGB(245, 245, 245)
		thread.Material = Enum.Material.SmoothPlastic
		thread.Anchored = true
		thread.CanCollide = false
		thread.CanTouch = false
		thread.CanQuery = false
		thread.Parent = model
	end

	if golden then
		local light = Instance.new("PointLight")
		light.Color = Config.ColorDorado
		light.Range = 8
		light.Brightness = 2
		light.Parent = body
	end

	model.PrimaryPart = body
	model:SetAttribute("Fase", math.random() * math.pi * 2)
	if opts.noBob then
		model:SetAttribute("SinFlotar", true)
	end
	model.ModelStreamingMode = Enum.ModelStreamingMode.Atomic
	CollectionService:AddTag(model, Balloons.TAG)
	model.Parent = parent
	return model
end

return Balloons
```

## `src/CarreraUI/UI.client.luau`

```lua
--[[
	INTERFAZ Y EFECTOS DEL JUGADOR
	Todo lo que hace que explotar globos se sienta bien: partículas, «+10»
	flotantes, combos con notas musicales que suben, temblor de cámara,
	carteles grandes, trampolines, tienda de estelas y títulos.
]]

local CollectionService = game:GetService("CollectionService")
local ContentProvider = game:GetService("ContentProvider")
local Debris = game:GetService("Debris")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local SoundService = game:GetService("SoundService")
local TweenService = game:GetService("TweenService")
local Workspace = game:GetService("Workspace")

local gui = script.Parent :: ScreenGui
local playerGui = gui.Parent :: Instance

-- Evita que la interfaz exista dos veces
for _, other in playerGui:GetChildren() do
	if other ~= gui and other.Name == gui.Name and other:GetAttribute("Activa") then
		gui:Destroy()
		return
	end
end
gui:SetAttribute("Activa", true)
gui.ResetOnSpawn = false
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling

local player = Players.LocalPlayer
local Config = require(ReplicatedStorage:WaitForChild("CarreraGlobosConfig") :: ModuleScript) :: any
local remote = ReplicatedStorage:WaitForChild("CarreraGlobosEvento") :: RemoteEvent

local FONT = Enum.Font.FredokaOne
local WHITE = Color3.new(1, 1, 1)
local GOLD = Color3.fromRGB(255, 205, 40)
local GREEN = Color3.fromRGB(90, 255, 120)
local PURPLE = Color3.fromRGB(200, 90, 255)
local PINK = Color3.fromRGB(255, 110, 180)

-- ════════════════════════════════════════════════════════════════════
-- Utilidades de interfaz
-- ════════════════════════════════════════════════════════════════════

local function make(className: string, props: { [string]: any }, children: { Instance }?): any
	local inst = Instance.new(className)
	for key, value in props do
		if key ~= "Parent" then
			(inst :: any)[key] = value
		end
	end
	for _, child in (children or {}) :: { Instance } do
		child.Parent = inst
	end
	if props.Parent then
		inst.Parent = props.Parent
	end
	return inst
end

local function corner(px: number)
	return make("UICorner", { CornerRadius = UDim.new(0, px) })
end

local function stroke(thickness: number, color: Color3?)
	return make("UIStroke", { Thickness = thickness, Color = color or Color3.new(0, 0, 0), Transparency = 0.2 })
end

local function label(props: { [string]: any }): TextLabel
	props.BackgroundTransparency = props.BackgroundTransparency or 1
	props.Font = FONT
	props.TextScaled = true
	props.TextColor3 = props.TextColor3 or WHITE
	local l = make("TextLabel", props)
	make("UIStroke", { Thickness = 2.5, Color = Color3.new(0, 0, 0), Transparency = 0.1, Parent = l })
	return l
end

-- Panel con degradado morado→rosa y borde blanco (estilo caricatura)
local function stylePanel(frame: GuiObject)
	frame.BackgroundTransparency = 0.1
	frame.BackgroundColor3 = WHITE
	make("UIGradient", {
		Color = ColorSequence.new(Color3.fromRGB(110, 60, 220), Color3.fromRGB(255, 90, 170)),
		Rotation = 90,
		Parent = frame,
	})
	make("UIStroke", {
		Thickness = 3,
		Color = WHITE,
		ApplyStrokeMode = Enum.ApplyStrokeMode.Border,
		Parent = frame,
	})
end

local function bump(scale: UIScale, amount: number?)
	scale.Scale = amount or 1.3
	TweenService:Create(scale, TweenInfo.new(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Scale = 1 }):Play()
end

-- ════════════════════════════════════════════════════════════════════
-- Pantalla
-- ════════════════════════════════════════════════════════════════════

local status = label({
	Name = "Estado",
	AnchorPoint = Vector2.new(0.5, 0),
	Position = UDim2.new(0.5, 0, 0, 64),
	Size = UDim2.new(0.7, 0, 0, 38),
	BackgroundTransparency = 0.35,
	BackgroundColor3 = Color3.fromRGB(30, 20, 60),
	Text = "",
	Parent = gui,
})
corner(12).Parent = status
stylePanel(status)
make("UISizeConstraint", { MaxSize = Vector2.new(620, 38), Parent = status })

local raceFrame = make("Frame", {
	Name = "Carrera",
	AnchorPoint = Vector2.new(0.5, 0),
	Position = UDim2.new(0.5, 0, 0, 60),
	Size = UDim2.new(0, 360, 0, 70),
	BackgroundColor3 = Color3.fromRGB(30, 20, 60),
	BackgroundTransparency = 0.35,
	Visible = false,
	Parent = gui,
}, { corner(12), make("UIListLayout", { Padding = UDim.new(0, 4), HorizontalAlignment = Enum.HorizontalAlignment.Center, VerticalAlignment = Enum.VerticalAlignment.Center }) })
stylePanel(raceFrame)

local hint = label({
	Name = "Instruccion",
	AnchorPoint = Vector2.new(0.5, 0),
	Position = UDim2.new(0.5, 0, 0, 136),
	Size = UDim2.new(0.8, 0, 0, 32),
	TextColor3 = Color3.fromRGB(255, 250, 170),
	Text = "",
	Visible = false,
	Parent = gui,
})
make("UISizeConstraint", { MaxSize = Vector2.new(640, 32), Parent = hint })

local counter = label({
	Name = "Contador",
	AnchorPoint = Vector2.new(0.5, 1),
	Position = UDim2.new(0.5, 0, 1, -20),
	Size = UDim2.new(0, 270, 0, 72),
	BackgroundTransparency = 0.25,
	BackgroundColor3 = Color3.fromRGB(30, 20, 60),
	Text = "🎈 0 / 0",
	Visible = false,
	Parent = gui,
})
corner(18).Parent = counter
stylePanel(counter)
local counterScale = make("UIScale", { Parent = counter })
local counterBar = make("Frame", {
	Name = "Barra",
	AnchorPoint = Vector2.new(0, 1),
	Position = UDim2.new(0, 10, 1, -6),
	Size = UDim2.new(0, 0, 0, 6),
	BackgroundColor3 = GREEN,
	BorderSizePixel = 0,
	Parent = counter,
}, { corner(3) })

local combo = label({
	Name = "Combo",
	AnchorPoint = Vector2.new(0.5, 1),
	Position = UDim2.new(0.5, 0, 1, -100),
	Size = UDim2.new(0, 320, 0, 48),
	Text = "",
	Visible = false,
	Parent = gui,
})
local comboScale = make("UIScale", { Parent = combo })

local points = label({
	Name = "Puntos",
	AnchorPoint = Vector2.new(1, 0),
	Position = UDim2.new(1, -12, 0, 64),
	Size = UDim2.new(0, 160, 0, 40),
	TextColor3 = GOLD,
	TextXAlignment = Enum.TextXAlignment.Right,
	Text = "",
	Visible = false,
	Parent = gui,
})
local pointsScale = make("UIScale", { Parent = points })

local bannerHolder = make("Frame", {
	Name = "Cartel",
	AnchorPoint = Vector2.new(0.5, 0.5),
	Position = UDim2.fromScale(0.5, 0.38),
	Size = UDim2.fromScale(0.85, 0.24),
	BackgroundTransparency = 1,
	Visible = false,
	Parent = gui,
})
local bannerScale = make("UIScale", { Parent = bannerHolder })
local bannerTitle = label({ Size = UDim2.fromScale(1, 0.68), Text = "", Parent = bannerHolder })
make("UISizeConstraint", { MaxSize = Vector2.new(900, 130), Parent = bannerTitle })
local bannerSub = label({
	Position = UDim2.fromScale(0, 0.7),
	Size = UDim2.fromScale(1, 0.3),
	Text = "",
	TextColor3 = Color3.fromRGB(255, 250, 200),
	Parent = bannerHolder,
})

local flashFrame = make("Frame", {
	Name = "Destello",
	Size = UDim2.fromScale(1, 1),
	BackgroundTransparency = 1,
	BorderSizePixel = 0,
	ZIndex = 50,
	Parent = gui,
})

local bannerToken = 0
local function showBanner(text: string, color: Color3?, sub: string?, duration: number?)
	bannerToken += 1
	local token = bannerToken
	bannerTitle.Text = text
	bannerTitle.TextColor3 = color or WHITE
	bannerSub.Text = sub or ""
	for _, l in { bannerTitle, bannerSub } do
		l.TextTransparency = 0
		local s = l:FindFirstChildOfClass("UIStroke")
		if s then
			s.Transparency = 0.1
		end
	end
	bannerHolder.Visible = true
	bannerScale.Scale = 0.3
	TweenService:Create(bannerScale, TweenInfo.new(0.35, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Scale = 1 }):Play()
	task.delay(duration or 1.6, function()
		if token ~= bannerToken then
			return
		end
		for _, l in { bannerTitle, bannerSub } do
			TweenService:Create(l, TweenInfo.new(0.3), { TextTransparency = 1 }):Play()
			local s = l:FindFirstChildOfClass("UIStroke")
			if s then
				TweenService:Create(s, TweenInfo.new(0.3), { Transparency = 1 }):Play()
			end
		end
		task.delay(0.3, function()
			if token == bannerToken then
				bannerHolder.Visible = false
			end
		end)
	end)
end

local function flash(color: Color3, strength: number?)
	flashFrame.BackgroundColor3 = color
	flashFrame.BackgroundTransparency = 1 - (strength or 0.3)
	TweenService:Create(flashFrame, TweenInfo.new(0.45), { BackgroundTransparency = 1 }):Play()
end

-- ════════════════════════════════════════════════════════════════════
-- Sonido
-- ════════════════════════════════════════════════════════════════════

local templates: { [string]: Sound } = {}
for name, def in Config.Sonidos do
	if def.Id ~= "" then
		templates[name] = make("Sound", { Name = name, SoundId = def.Id, Volume = def.Volumen or 0.5, Parent = SoundService })
	end
end
task.spawn(function()
	local list = {}
	for _, sound in templates do
		table.insert(list, sound)
	end
	pcall(function()
		ContentProvider:PreloadAsync(list)
	end)
end)

-- ─── Música de fondo: lobby tranquila, carrera rápida que acelera al final ──
local music: { [string]: Sound } = {}
local musicVolume: { [string]: number } = {}
for _, name in { "Lobby", "Carrera" } do
	local def = Config.Musica and Config.Musica[name]
	if def and def.Id ~= "" then
		music[name] = make("Sound", { Name = "Musica" .. name, SoundId = def.Id, Looped = true, Volume = 0, Parent = SoundService })
		musicVolume[name] = def.Volumen or 0.3
	end
end
local currentMusic: string? = nil

local function playMusic(name: string, speed: number?)
	for musicName, sound in music do
		if musicName == name then
			if not sound.IsPlaying then
				sound.Volume = 0
				sound:Play()
			end
			TweenService:Create(sound, TweenInfo.new(0.8), { Volume = musicVolume[musicName], PlaybackSpeed = speed or 1 }):Play()
		elseif sound.IsPlaying then
			local fade = TweenService:Create(sound, TweenInfo.new(0.8), { Volume = 0 })
			fade:Play()
			fade.Completed:Once(function()
				if currentMusic ~= musicName then
					sound:Stop()
				end
			end)
		end
	end
	currentMusic = name
end

-- Cambia la velocidad de la música actual poco a poco
local function musicSpeed(speed: number, seconds: number)
	local sound = currentMusic and music[currentMusic]
	if sound then
		TweenService:Create(sound, TweenInfo.new(seconds), { PlaybackSpeed = speed }):Play()
	end
end

-- Baja la música un rato (para que se escuche la fanfarria)
local function duckMusic(seconds: number)
	local name = currentMusic
	local sound = name and music[name]
	if name and sound then
		TweenService:Create(sound, TweenInfo.new(0.3), { Volume = musicVolume[name] * 0.25 }):Play()
		task.delay(seconds, function()
			if currentMusic == name then
				TweenService:Create(sound, TweenInfo.new(1), { Volume = musicVolume[name] }):Play()
			end
		end)
	end
end

local function play(name: string, speed: number?, volumeScale: number?, position: Vector3?)
	local template = templates[name]
	if not template then
		return
	end
	local sound = template:Clone()
	sound.PlaybackSpeed = speed or 1
	sound.Volume = template.Volume * (volumeScale or 1)
	if position then
		local attachment = make("Attachment", { WorldPosition = position, Parent = Workspace.Terrain })
		sound.RollOffMaxDistance = 140
		sound.Parent = attachment
		Debris:AddItem(attachment, 4)
	else
		sound.Parent = SoundService
		Debris:AddItem(sound, 4)
	end
	sound:Play()
end

-- ════════════════════════════════════════════════════════════════════
-- Cámara que tiembla
-- ════════════════════════════════════════════════════════════════════

local shakeAmount = 0
local function shake(amount: number)
	shakeAmount = math.max(shakeAmount, amount)
end

-- ════════════════════════════════════════════════════════════════════
-- Efectos en el mundo
-- ════════════════════════════════════════════════════════════════════

local function burst(pos: Vector3, color: Color3, radius: number, count: number, golden: boolean?)
	local attachment = make("Attachment", { WorldPosition = pos, Parent = Workspace.Terrain })
	local confetti = make("ParticleEmitter", {
		Color = ColorSequence.new(color),
		LightEmission = 0.3,
		Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, math.max(radius * 0.35, 0.4)), NumberSequenceKeypoint.new(1, 0) }),
		Lifetime = NumberRange.new(0.35, 0.75),
		Speed = NumberRange.new(12, 24),
		SpreadAngle = Vector2.new(180, 180),
		Drag = 5,
		Acceleration = Vector3.new(0, -30, 0),
		Rotation = NumberRange.new(0, 360),
		RotSpeed = NumberRange.new(-300, 300),
		Rate = 0,
		Parent = attachment,
	})
	confetti:Emit(count)
	if golden then
		local sparkle = make("ParticleEmitter", {
			Color = ColorSequence.new(GOLD, WHITE),
			LightEmission = 1,
			Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.8), NumberSequenceKeypoint.new(1, 0) }),
			Lifetime = NumberRange.new(0.5, 1),
			Speed = NumberRange.new(6, 14),
			SpreadAngle = Vector2.new(180, 180),
			Rate = 0,
			Parent = attachment,
		})
		sparkle:Emit(30)
	end
	Debris:AddItem(attachment, 1.5)

	-- Onda expansiva
	local wave = make("Part", {
		Shape = Enum.PartType.Ball,
		Material = Enum.Material.Neon,
		Color = color,
		Anchored = true,
		CanCollide = false,
		CanQuery = false,
		CanTouch = false,
		CastShadow = false,
		Size = Vector3.one * radius * 1.5,
		CFrame = CFrame.new(pos),
		Transparency = 0.35,
		Parent = Workspace,
	})
	TweenService:Create(wave, TweenInfo.new(0.22, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		Size = Vector3.one * radius * 5,
		Transparency = 1,
	}):Play()
	Debris:AddItem(wave, 0.3)
end

local function floatText(pos: Vector3, text: string, color: Color3, big: boolean?)
	local attachment = make("Attachment", { WorldPosition = pos, Parent = Workspace.Terrain })
	local billboard = make("BillboardGui", {
		Size = if big then UDim2.fromOffset(200, 70) else UDim2.fromOffset(110, 44),
		StudsOffset = Vector3.new(0, 1, 0),
		AlwaysOnTop = true,
		LightInfluence = 0,
		Adornee = attachment,
		Parent = playerGui,
	})
	local l = label({ Size = UDim2.fromScale(1, 1), Text = text, TextColor3 = color, Parent = billboard })
	local scale = make("UIScale", { Scale = 0.4, Parent = l })
	TweenService:Create(scale, TweenInfo.new(0.25, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Scale = 1 }):Play()
	TweenService:Create(billboard, TweenInfo.new(0.8, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		StudsOffset = Vector3.new(0, 5, 0),
	}):Play()
	task.delay(0.45, function()
		TweenService:Create(l, TweenInfo.new(0.35), { TextTransparency = 1 }):Play()
		local s = l:FindFirstChildOfClass("UIStroke")
		if s then
			TweenService:Create(s, TweenInfo.new(0.35), { Transparency = 1 }):Play()
		end
	end)
	Debris:AddItem(billboard, 0.85)
	Debris:AddItem(attachment, 0.85)
end

local function confettiRain(seconds: number)
	local camera = Workspace.CurrentCamera
	local stop = os.clock() + seconds
	task.spawn(function()
		while os.clock() < stop do
			local cf = camera.CFrame
			local pos = cf.Position + cf.LookVector * 14 + Vector3.new(math.random(-10, 10), 9, math.random(-10, 10))
			burst(pos, Config.ColoresGlobo[math.random(#Config.ColoresGlobo)], 1.2, 25)
			task.wait(0.08)
		end
	end)
end

-- ════════════════════════════════════════════════════════════════════
-- Combos: cada globo seguido sube una nota de la escala
-- ════════════════════════════════════════════════════════════════════

local comboCount = 0
local lastPop = 0
local lastPopSound = 0
local COMBO_WORDS = { [5] = "¡GENIAL!", [10] = "¡INCREÍBLE!", [20] = "¡IMPARABLE!", [30] = "¡LEYENDA!", [50] = "¡DIOS DEL POP!" }

local function comboColor(n: number): Color3
	if n >= 30 then
		return Color3.fromHSV((os.clock() * 0.8) % 1, 0.7, 1)
	elseif n >= 20 then
		return PURPLE
	elseif n >= 10 then
		return PINK
	elseif n >= 5 then
		return GOLD
	end
	return WHITE
end

local function onMyPop(pos: Vector3, color: Color3, pointsWon: number, golden: boolean)
	local now = os.clock()
	comboCount = if now - lastPop <= Config.VentanaCombo then comboCount + 1 else 1
	lastPop = now

	-- Capa 1: el «¡plop!» con tono un poco distinto cada vez (nunca suena repetido)
	-- Capa 2: una nota musical que sube por la escala con cada globo del combo
	if now - lastPopSound > 0.03 then
		lastPopSound = now
		play("Pop", (0.9 + math.random() * 0.2) * (1 + math.min(comboCount, 20) * 0.012))
		local scale = Config.EscalaCombo
		play("Nota", scale[((comboCount - 1) % #scale) + 1])
	end

	if golden then
		play("Dorado", 1.25)
		floatText(pos, "+" .. pointsWon .. " ⭐", GOLD, true)
		flash(GOLD, 0.18)
		shake(0.5)
	else
		floatText(pos, "+" .. pointsWon, color)
		shake(0.16)
	end

	if comboCount >= 3 then
		combo.Visible = true
		combo.Text = "¡COMBO x" .. comboCount .. "!"
		combo.TextColor3 = comboColor(comboCount)
		combo.TextTransparency = 0
		bump(comboScale, 1.35)
	end
	local word = COMBO_WORDS[comboCount]
	if word then
		play("Combo", 1 + comboCount / 50)
		floatText(pos + Vector3.new(0, 2, 0), word, comboColor(comboCount), true)
		flash(comboColor(comboCount), 0.15)
		shake(0.45)
	end
end

-- ════════════════════════════════════════════════════════════════════
-- Tablero de la carrera (quién va en qué etapa)
-- ════════════════════════════════════════════════════════════════════

local racing = false
local currentStage = 0
local lastCleared: { [number]: number } = {}

local function renderRace(list, total: number)
	for _, child in raceFrame:GetChildren() do
		if child:IsA("Frame") then
			child:Destroy()
		end
	end
	racing = false
	for _, entry in list do
		if entry.userId == player.UserId then
			racing = true
		end
		local color = Config.ColoresPista[entry.lane] or WHITE
		local row = make("Frame", {
			Size = UDim2.new(1, -16, 0, 26),
			BackgroundTransparency = 1,
			Parent = raceFrame,
		}, {
			make("UIListLayout", {
				FillDirection = Enum.FillDirection.Horizontal,
				Padding = UDim.new(0, 4),
				VerticalAlignment = Enum.VerticalAlignment.Center,
			}),
		})
		label({
			Size = UDim2.new(0, 110, 1, 0),
			Text = if entry.userId == player.UserId then "TÚ" else entry.name,
			TextColor3 = color,
			TextXAlignment = Enum.TextXAlignment.Left,
			Parent = row,
		})
		local before = lastCleared[entry.userId] or 0
		for i = 1, total do
			local filled = i <= entry.cleared
			local dot = make("Frame", {
				Size = UDim2.fromOffset(20, 20),
				BackgroundColor3 = if filled then color else Color3.fromRGB(70, 60, 100),
				Parent = row,
			}, { make("UICorner", { CornerRadius = UDim.new(1, 0) }) })
			if filled and i > before then
				bump(make("UIScale", { Parent = dot }), 1.8)
			end
		end
		label({
			Size = UDim2.fromOffset(26, 26),
			Text = if entry.cleared >= total then "🏁" else "",
			Parent = row,
		})
		lastCleared[entry.userId] = entry.cleared
	end
	raceFrame.Size = UDim2.new(0, 140 + total * 24 + 40, 0, 12 + #list * 30)
	raceFrame.Visible = true
	status.Visible = false -- la barra de carrera ya dice todo (evita que se encimen)
	points.Visible = racing
end

-- Cuando faltan pocos globos, los tuyos brillan a través de las paredes (¡así los encuentras!)
local highlighted: { Highlight } = {}

local function clearHighlights()
	for _, h in highlighted do
		h:Destroy()
	end
	table.clear(highlighted)
end

local function highlightRemaining(stage: number)
	clearHighlights()
	for _, model in CollectionService:GetTagged("GloboCarrera") do
		if model:GetAttribute("Dueno") == player.UserId and model:GetAttribute("Etapa") == stage then
			table.insert(
				highlighted,
				make("Highlight", {
					Adornee = model,
					FillColor = Color3.fromRGB(255, 255, 120),
					FillTransparency = 0.5,
					OutlineColor = WHITE,
					DepthMode = Enum.HighlightDepthMode.AlwaysOnTop,
					Parent = model,
				})
			)
			if #highlighted >= 10 then
				break -- Roblox permite pocos Highlights a la vez
			end
		end
	end
end

local function setCounter(popped: number, goal: number, done: boolean?)
	counter.Visible = racing
	if done or popped >= goal then
		counter.Text = "✅ ¡Adelante!"
		counterBar.Size = UDim2.new(0, 250, 0, 6)
	else
		counter.Text = string.format("🎈 %d / %d", popped, goal)
		counterBar.Size = UDim2.new(0, 250 * popped / math.max(goal, 1), 0, 6)
	end
end

local function formatTime(seconds: number): string
	return string.format("%d:%05.2f", seconds // 60, seconds % 60)
end

-- Hace bailar a tu personaje con el script «Animate» de Roblox
local function dance(emote: string)
	local character = player.Character
	local animate = character and character:FindFirstChild("Animate")
	local bindable = animate and animate:FindFirstChild("PlayEmote")
	if bindable and bindable:IsA("BindableFunction") then
		pcall(function()
			bindable:Invoke(emote)
		end)
		return
	end
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	if humanoid then
		pcall(function()
			humanoid:PlayEmote(emote)
		end)
	end
end

-- ════════════════════════════════════════════════════════════════════
-- Tienda de estelas y títulos
-- ════════════════════════════════════════════════════════════════════

local myWins = 0
local myEquipped = { Estela = "nube", Titulo = "novato", Baile = "dance" }
local shopTab = "Estela"

local shopButton = make("TextButton", {
	Name = "BotonTienda",
	AnchorPoint = Vector2.new(0, 0.5),
	Position = UDim2.new(0, 12, 0.5, 0),
	Size = UDim2.fromOffset(120, 56),
	BackgroundColor3 = Color3.fromRGB(255, 90, 170),
	Font = FONT,
	TextScaled = true,
	TextColor3 = WHITE,
	Text = "✨ TIENDA\n🏆 0",
	Parent = gui,
}, { corner(14), stroke(3, WHITE) })
local shopButtonScale = make("UIScale", { Parent = shopButton })

local shop = make("Frame", {
	Name = "Tienda",
	AnchorPoint = Vector2.new(0.5, 0.5),
	Position = UDim2.fromScale(0.5, 0.5),
	Size = UDim2.fromScale(0.9, 0.75),
	BackgroundColor3 = Color3.fromRGB(40, 25, 80),
	Visible = false,
	ZIndex = 20,
	Parent = gui,
}, { corner(18), stroke(4, WHITE), make("UISizeConstraint", { MaxSize = Vector2.new(620, 440) }) })
local shopScale = make("UIScale", { Parent = shop })

local shopTitle = label({
	Position = UDim2.new(0, 16, 0, 8),
	Size = UDim2.new(1, -80, 0, 36),
	Text = "🏆 Tus Wins: 0",
	TextColor3 = GOLD,
	TextXAlignment = Enum.TextXAlignment.Left,
	ZIndex = 21,
	Parent = shop,
})
local closeButton = make("TextButton", {
	AnchorPoint = Vector2.new(1, 0),
	Position = UDim2.new(1, -10, 0, 8),
	Size = UDim2.fromOffset(40, 40),
	BackgroundColor3 = Color3.fromRGB(255, 70, 90),
	Font = FONT,
	TextScaled = true,
	TextColor3 = WHITE,
	Text = "X",
	ZIndex = 21,
	Parent = shop,
}, { corner(10) })

local tabs = make("Frame", {
	Position = UDim2.new(0, 16, 0, 52),
	Size = UDim2.new(1, -32, 0, 36),
	BackgroundTransparency = 1,
	ZIndex = 21,
	Parent = shop,
}, { make("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 8) }) })

local grid = make("ScrollingFrame", {
	Position = UDim2.new(0, 16, 0, 98),
	Size = UDim2.new(1, -32, 1, -110),
	BackgroundTransparency = 1,
	BorderSizePixel = 0,
	ScrollBarThickness = 6,
	AutomaticCanvasSize = Enum.AutomaticSize.Y,
	CanvasSize = UDim2.new(),
	ZIndex = 21,
	Parent = shop,
}, { make("UIGridLayout", { CellSize = UDim2.fromOffset(132, 132), CellPadding = UDim2.fromOffset(10, 10) }) })

local renderShop

local tabButtons = {}
for _, info in { { "Estela", "✨ Estelas" }, { "Titulo", "👑 Títulos" }, { "Baile", "💃 Bailes" } } do
	local button = make("TextButton", {
		Size = UDim2.fromOffset(140, 36),
		BackgroundColor3 = Color3.fromRGB(90, 60, 160),
		Font = FONT,
		TextScaled = true,
		TextColor3 = WHITE,
		Text = info[2],
		ZIndex = 22,
		Parent = tabs,
	}, { corner(10) })
	tabButtons[info[1]] = button
	button.Activated:Connect(function()
		shopTab = info[1]
		renderShop()
	end)
end

function renderShop()
	shopTitle.Text = "🏆 Tus Wins: " .. myWins
	for kind, button in tabButtons do
		button.BackgroundColor3 = if kind == shopTab then Color3.fromRGB(255, 90, 170) else Color3.fromRGB(90, 60, 160)
	end
	for _, child in grid:GetChildren() do
		if child:IsA("GuiObject") then
			child:Destroy()
		end
	end
	local list = if shopTab == "Estela" then Config.Estelas elseif shopTab == "Titulo" then Config.Titulos else Config.Bailes
	for order, item in list do
		local unlocked = myWins >= item.Wins
		local isEquipped = myEquipped[shopTab] == item.Id
		local card = make("Frame", {
			LayoutOrder = order,
			BackgroundColor3 = if isEquipped then Color3.fromRGB(80, 200, 120) else Color3.fromRGB(70, 50, 130),
			ZIndex = 22,
			Parent = grid,
		}, { corner(12) })

		local swatch = make("Frame", {
			Position = UDim2.new(0, 10, 0, 10),
			Size = UDim2.new(1, -20, 0, 40),
			BackgroundColor3 = WHITE,
			ZIndex = 23,
			Parent = card,
		}, { corner(10) })
		if shopTab == "Estela" then
			local keypoints = {}
			for i, color in item.Colores do
				table.insert(keypoints, ColorSequenceKeypoint.new((i - 1) / math.max(#item.Colores - 1, 1), color))
			end
			if #keypoints == 1 then
				table.insert(keypoints, ColorSequenceKeypoint.new(1, item.Colores[1]))
			end
			make("UIGradient", { Color = ColorSequence.new(keypoints), Parent = swatch })
		elseif shopTab == "Titulo" then
			swatch.BackgroundTransparency = 1
			label({ Size = UDim2.fromScale(1, 1), Text = item.Nombre, TextColor3 = item.Color, ZIndex = 24, Parent = swatch })
		else
			swatch.BackgroundTransparency = 1
			label({ Size = UDim2.fromScale(1, 1), Text = item.Icono, ZIndex = 24, Parent = swatch })
		end

		label({
			Position = UDim2.new(0, 6, 0, 54),
			Size = UDim2.new(1, -12, 0, 26),
			Text = item.Nombre,
			ZIndex = 23,
			Parent = card,
		})

		local button = make("TextButton", {
			Position = UDim2.new(0, 10, 1, -42),
			Size = UDim2.new(1, -20, 0, 32),
			BackgroundColor3 = if isEquipped
				then Color3.fromRGB(40, 140, 80)
				elseif unlocked then Color3.fromRGB(255, 180, 40)
				else Color3.fromRGB(60, 60, 70),
			Font = FONT,
			TextScaled = true,
			TextColor3 = WHITE,
			Text = if isEquipped then "EQUIPADO" elseif unlocked then "EQUIPAR" else "🔒 " .. item.Wins .. " Wins",
			AutoButtonColor = unlocked,
			ZIndex = 23,
			Parent = card,
		}, { corner(8) })
		button.Activated:Connect(function()
			if unlocked and not isEquipped then
				remote:FireServer("equipar", shopTab, item.Id)
				myEquipped[shopTab] = item.Id
				play("Desbloqueo", 1.4, 0.6)
				if shopTab == "Baile" then
					dance(item.Id) -- vista previa: tu personaje baila al equiparlo
				end
				renderShop()
			end
		end)
	end
end

local function openShop(open: boolean)
	shop.Visible = open
	if open then
		renderShop()
		shopScale.Scale = 0.6
		TweenService:Create(shopScale, TweenInfo.new(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Scale = 1 }):Play()
	end
end
shopButton.Activated:Connect(function()
	openShop(not shop.Visible)
end)
closeButton.Activated:Connect(function()
	openShop(false)
end)

-- ════════════════════════════════════════════════════════════════════
-- Eventos del servidor
-- ════════════════════════════════════════════════════════════════════

local handlers = {}

function handlers.estado(text: string)
	status.Text = text
	status.Visible = not raceFrame.Visible
end

function handlers.carrera(list, total: number)
	renderRace(list, total)
	shopButton.Visible = not racing
	if racing then
		openShop(false)
	end
end

function handlers.cuenta(n: number)
	if racing and currentMusic ~= "Carrera" then
		playMusic("Carrera", 1)
	end
	if n > 0 then
		showBanner(tostring(n), WHITE, "¡Prepárate!", 0.9)
		play("Cuenta", 1 + (Config.CuentaAtras - n) * 0.15)
		shake(0.2)
	else
		showBanner("¡YA!", GREEN, "", 1)
		play("Ya", 1.2)
		flash(WHITE, 0.35)
		shake(0.5)
	end
end

function handlers.etapa(s: number, total: number, title: string, hintText: string, popped: number, goal: number, done: boolean)
	currentStage = s
	clearHighlights()
	if not done and goal - popped <= Config.ResaltarUltimos then
		highlightRemaining(s)
	end
	hint.Visible = true
	hint.Text = if done then "¡Puerta abierta, sigue corriendo! ➜" else hintText
	setCounter(popped, goal, done)
	if s >= total then
		-- ¡Última etapa! La música acelera y se nota la emoción
		musicSpeed(Config.Musica.AceleracionFinal, 1.5)
		if not done then
			showBanner("🔥 ¡ÚLTIMA ETAPA! 🔥", Color3.fromRGB(255, 120, 60), title .. " · " .. hintText, 1.8)
			flash(Color3.fromRGB(255, 120, 60), 0.25)
			shake(0.4)
		end
	else
		musicSpeed(1 + (s - 1) * Config.Musica.SubidaPorEtapa, 1)
		if not done then
			showBanner(title, Color3.fromRGB(255, 240, 90), string.format("Etapa %d de %d · %s", s, total, hintText), 1.8)
		end
	end
end

function handlers.progreso(s: number, popped: number, goal: number, pts: number)
	points.Text = "⭐ " .. pts
	bump(pointsScale, 1.2)
	if s == currentStage then
		setCounter(popped, goal)
		bump(counterScale, 1.18)
		local left = goal - popped
		if left > 0 and left <= Config.ResaltarUltimos then
			highlightRemaining(s)
		else
			clearHighlights()
		end
	end
end

function handlers.globo(pos: Vector3, color: Color3, radius: number, ownerId: number, pointsWon: number, golden: boolean)
	burst(pos, color, radius, if golden then 40 else 22, golden)
	if ownerId == player.UserId then
		onMyPop(pos, color, pointsWon, golden)
	else
		play("Pop", 0.9 + math.random() * 0.2, 0.5, pos)
	end
end

function handlers.puerta(pos: Vector3, ownerId: number, s: number, total: number)
	for _ = 1, 4 do
		burst(
			pos + Vector3.new(0, math.random(2, 12), math.random(-10, 10)),
			Config.ColoresGlobo[math.random(#Config.ColoresGlobo)],
			2,
			25
		)
	end
	if ownerId == player.UserId then
		play("Puerta", 1)
		play("Nota", 2, 1.2)
		showBanner(if s >= total then "¡A LA META! 🏁" else "¡PUERTA ABIERTA! ➜", GREEN, "Etapa " .. s .. " completada", 1.3)
		hint.Text = "¡Corre a la siguiente etapa! ➜"
		setCounter(1, 1, true)
		flash(GREEN, 0.3)
		shake(0.6)
	else
		play("Puerta", 1, 0.5, pos)
	end
end

function handlers.dardo(origin: Vector3, dir: Vector3, range: number, speed: number, ownerId: number)
	local dart = make("Part", {
		Size = Vector3.new(2.4, 0.3, 0.3),
		Color = Color3.fromRGB(255, 255, 200),
		Material = Enum.Material.Neon,
		Anchored = true,
		CanCollide = false,
		CanQuery = false,
		CanTouch = false,
		CastShadow = false,
		CFrame = CFrame.fromMatrix(origin, dir, Vector3.yAxis),
		Parent = Workspace,
	})
	local a0 = make("Attachment", { Position = Vector3.new(0, 0.15, 0), Parent = dart })
	local a1 = make("Attachment", { Position = Vector3.new(0, -0.15, 0), Parent = dart })
	make("Trail", {
		Attachment0 = a0,
		Attachment1 = a1,
		Lifetime = 0.15,
		LightEmission = 1,
		Color = ColorSequence.new(Color3.fromRGB(150, 220, 255)),
		Parent = dart,
	})
	local duration = range / speed
	TweenService:Create(dart, TweenInfo.new(duration, Enum.EasingStyle.Linear), {
		CFrame = dart.CFrame + dir * range,
	}):Play()
	Debris:AddItem(dart, duration + 0.05)
	if ownerId == player.UserId then
		play("Disparo", 1.3 + math.random() * 0.3)
	end
end

function handlers.poder(pos: Vector3)
	burst(pos, PURPLE, 3, 60)
end

function handlers.poderJugador(seconds: number)
	showBanner("⚡ ¡SÚPER PODER! ⚡", PURPLE, "¡Más rápido y explotas todo a tu paso!", 1.5)
	play("Poder", 1)
	flash(PURPLE, 0.35)
	shake(0.5)
	local camera = Workspace.CurrentCamera
	TweenService:Create(camera, TweenInfo.new(0.3), { FieldOfView = 88 }):Play()
	task.delay(seconds, function()
		TweenService:Create(camera, TweenInfo.new(0.6), { FieldOfView = 70 }):Play()
	end)
end

-- Lanza a tu personaje (trampolines, globo gigante). Primero lo ponemos en
-- estado de salto; si no, el Humanoid «se pega» al piso y frena el impulso.
local function launch(velocity: Vector3)
	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	local root = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
	if humanoid and root then
		humanoid:ChangeState(Enum.HumanoidStateType.Jumping)
		root.AssemblyLinearVelocity = velocity
		-- El salto del Humanoid se procesa en el siguiente paso de física y podría
		-- pisar nuestro impulso: lo volvemos a aplicar justo después
		task.defer(function()
			if root.Parent then
				root.AssemblyLinearVelocity = velocity
			end
		end)
	end
end


function handlers.rebote(velocity: Vector3)
	launch(velocity)
	play("Rebote", 0.8 + math.random() * 0.2)
end

function handlers.golpeGigante(pos: Vector3, progress: number, ownerId: number)
	if ownerId == player.UserId then
		play("Gigante", 0.55 + progress * 0.7, 1.2)
		shake(0.4 + progress * 0.6)
		floatText(pos, "¡PUM!", Color3.fromRGB(255, 80 + (1 - progress) * 150, 80), true)
	else
		play("Gigante", 0.6 + progress * 0.6, 0.5, pos)
	end
end

function handlers.explosion(pos: Vector3, size: number, color: Color3)
	for _ = 1, 8 do
		burst(
			pos + Vector3.new(math.random(-4, 4), math.random(-4, 4), math.random(-4, 4)),
			Config.ColoresGlobo[math.random(#Config.ColoresGlobo)],
			size * 0.2,
			40
		)
	end
	burst(pos, color, size * 0.5, 80)
	play("Pop", 0.5, 2, pos)
	play("Combo", 0.8, 1, pos)
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
	if root and (root.Position - pos).Magnitude < 60 then
		flash(WHITE, 0.6)
		shake(1.4)
	end
end

function handlers.ganador(
	name: string,
	userId: number,
	pts: number,
	seconds: number,
	isRecord: boolean,
	solo: boolean,
	streak: number
)
	hint.Visible = false
	counter.Visible = false
	duckMusic(4)
	if solo and userId == player.UserId then
		local sub = string.format("⏱ %s · ⭐ %d puntos", formatTime(seconds), pts)
		showBanner(if isRecord then "🔥 ¡NUEVO RÉCORD! 🔥" else "⏱ ¡TERMINASTE!", GOLD, sub, 5)
		play("Victoria", 1)
		flash(GOLD, 0.4)
		if isRecord then
			confettiRain(2)
		end
	elseif userId == player.UserId then
		local sub = string.format("⭐ %d puntos · ⏱ %s", pts, formatTime(seconds))
		if isRecord then
			sub ..= " · ¡NUEVO RÉCORD!"
		end
		if streak >= 2 then
			sub ..= string.format(" · 🔥 ¡RACHA DE %d!", streak)
		end
		showBanner(if streak >= 3 then "🔥 ¡IMPARABLE! 🔥" else "🏆 ¡GANASTE! 🏆", GOLD, sub, 5)
		-- ¡A bailar! (emote de Roblox; si el personaje no lo soporta, no pasa nada)
		-- (el servidor te deja quieto; esperamos a que el personaje frene del todo)
		task.delay(0.8, function()
			dance(myEquipped.Baile)
		end)
		play("Victoria", 1)
		flash(GOLD, 0.5)
		confettiRain(3)
	elseif racing then
		showBanner("¡Ganó " .. name .. "!", PINK, "¡La próxima es tuya! 💪", 5)
	else
		showBanner("🏆 ¡Ganó " .. name .. "!", GOLD, "⏱ " .. formatTime(seconds), 4)
	end
end

function handlers.desbloqueo(unlocked: { string }, nextName: string?, nextWins: number?, wins: number)
	task.delay(5.2, function()
		if #unlocked > 0 then
			showBanner("✨ ¡DESBLOQUEASTE! ✨", GOLD, table.concat(unlocked, " · "), 3)
			play("Desbloqueo", 1)
			flash(GOLD, 0.35)
			bump(shopButtonScale, 1.5)
		elseif nextName and nextWins then
			showBanner("🏆 " .. wins .. " Wins", GOLD, string.format("Próximo premio: %s (faltan %d)", nextName, nextWins - wins), 3)
		end
	end)
end

function handlers.tienda(wins: number, estela: string, titulo: string, baile: string)
	myWins = wins
	myEquipped.Estela = estela
	myEquipped.Titulo = titulo
	myEquipped.Baile = baile
	shopButton.Text = "✨ TIENDA\n🏆 " .. wins
	if shop.Visible then
		renderShop()
	end
end

function handlers.aviso(title: string, sub: string?)
	showBanner(title, Color3.fromRGB(255, 200, 120), sub, 3)
end

function handlers.fin()
	clearHighlights()
	racing = false
	currentStage = 0
	table.clear(lastCleared)
	raceFrame.Visible = false
	hint.Visible = false
	counter.Visible = false
	points.Visible = false
	combo.Visible = false
	status.Visible = true
	shopButton.Visible = true
	Workspace.CurrentCamera.FieldOfView = 70
	playMusic("Lobby", 1)
end

remote.OnClientEvent:Connect(function(kind: string, ...)
	local handler = handlers[kind]
	if handler then
		handler(...)
	end
end)
remote:FireServer("hola")
playMusic("Lobby", 1)

-- ════════════════════════════════════════════════════════════════════
-- Cada frame: globos que flotan, cintas que se mueven, trampolines, cámara
-- ════════════════════════════════════════════════════════════════════

local floating: { [Instance]: { phase: number, parts: { { part: BasePart, base: CFrame } } } } = {}

local function track(model: Instance)
	if not model:IsA("Model") or model:GetAttribute("SinFlotar") then
		return
	end
	local entry = { phase = model:GetAttribute("Fase") or 0, parts = {} }
	for _, child in model:GetChildren() do
		if child:IsA("BasePart") then
			table.insert(entry.parts, { part = child, base = child.CFrame })
		end
	end
	floating[model] = entry
end
CollectionService:GetInstanceAddedSignal("GloboCarrera"):Connect(track)
CollectionService:GetInstanceRemovedSignal("GloboCarrera"):Connect(function(model)
	floating[model] = nil
end)
for _, model in CollectionService:GetTagged("GloboCarrera") do
	track(model)
end

local stripes: { [BasePart]: CFrame } = {}
local function trackStripe(part: Instance)
	if part:IsA("BasePart") then
		stripes[part] = part.CFrame
	end
end
CollectionService:GetInstanceAddedSignal("FranjaCinta"):Connect(trackStripe)
CollectionService:GetInstanceRemovedSignal("FranjaCinta"):Connect(function(part)
	stripes[part :: BasePart] = nil
end)
for _, part in CollectionService:GetTagged("FranjaCinta") do
	trackStripe(part)
end

local lastBounce = 0
local lastPadPulse = 0

-- Anillo de luz que sale de las plataformas del lobby (para que se vea dónde pararse)
local function padPulse()
	local map = Workspace:FindFirstChild("MapaCarreraGlobos")
	local lobby = map and map:FindFirstChild("Lobby")
	if not lobby or racing then
		return
	end
	for i = 1, 2 do
		local pad = lobby:FindFirstChild("Plataforma" .. i)
		if pad and pad:IsA("BasePart") then
			local ring = make("Part", {
				Shape = Enum.PartType.Cylinder,
				Size = Vector3.new(0.2, pad.Size.Y, pad.Size.Z),
				CFrame = pad.CFrame,
				Color = pad.Color,
				Material = Enum.Material.Neon,
				Transparency = 0.3,
				Anchored = true,
				CanCollide = false,
				CanQuery = false,
				CanTouch = false,
				CastShadow = false,
				Parent = Workspace,
			})
			TweenService:Create(ring, TweenInfo.new(1.1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
				Size = Vector3.new(0.2, pad.Size.Y * 1.9, pad.Size.Z * 1.9),
				Transparency = 1,
			}):Play()
			Debris:AddItem(ring, 1.2)
		end
	end
end
local bobParts: { BasePart } = {}
local bobCFrames: { CFrame } = {}

RunService.RenderStepped:Connect(function(dt)
	local t = os.clock()
	local camera = Workspace.CurrentCamera
	local camPos = camera.CFrame.Position

	-- Globos que flotan suavemente (solo los cercanos, todos juntos con BulkMoveTo: rápido en celular)
	table.clear(bobParts)
	table.clear(bobCFrames)
	for _, entry in floating do
		local first = entry.parts[1]
		if first and (first.base.Position - camPos).Magnitude < 140 then
			local offset = Vector3.new(0, math.sin(t * 2.2 + entry.phase) * 0.3, 0)
			for _, p in entry.parts do
				table.insert(bobParts, p.part)
				table.insert(bobCFrames, p.base + offset)
			end
		end
	end
	if #bobParts > 0 then
		Workspace:BulkMoveTo(bobParts, bobCFrames, Enum.BulkMoveMode.FireCFrameChanged)
	end

	-- Franjas de las cintas: se deslizan en la dirección en que empujan
	for part, base in stripes do
		local width = part:GetAttribute("CintaAncho") or 30
		local speed = part:GetAttribute("CintaVel") or 0
		local centerZ = part:GetAttribute("CintaZ") or base.Position.Z
		local rel = base.Position.Z - centerZ + width / 2
		local z = (rel + t * speed) % width
		part.CFrame = CFrame.new(base.Position.X, base.Position.Y, centerZ - width / 2 + z)
	end

	if t - lastPadPulse > 1.2 then
		lastPadPulse = t
		padPulse()
	end

	-- Combo que se apaga si dejas de explotar
	if combo.Visible and t - lastPop > Config.VentanaCombo then
		combo.TextTransparency = math.min(1, combo.TextTransparency + dt * 4)
		if combo.TextTransparency >= 1 then
			combo.Visible = false
		end
	end

	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	local root = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?

	-- Trampolines: si pisas uno, sales volando derechito hacia arriba
	if root and humanoid and t - lastBounce > 0.45 then
		for _, pad in CollectionService:GetTagged("TrampolinCarrera") do
			if pad:IsA("BasePart") then
				local d = root.Position - pad.Position
				if Vector3.new(d.X, 0, d.Z).Magnitude < pad.Size.Y / 2 + 0.5 and d.Y > 0 and d.Y < 4.5 then
					lastBounce = t
					local toCenter = Vector3.new(-d.X, 0, -d.Z) * 2
					launch(toCenter + Vector3.new(0, pad:GetAttribute("Fuerza") or 85, 0))
					play("Rebote", 1 + math.random() * 0.15)
					shake(0.3)
					break
				end
			end
		end
	end

	-- Temblor de cámara
	if humanoid then
		if shakeAmount > 0.01 then
			humanoid.CameraOffset = Vector3.new((math.random() - 0.5) * shakeAmount, (math.random() - 0.5) * shakeAmount, 0)
			shakeAmount *= math.exp(-dt * 10)
		elseif humanoid.CameraOffset ~= Vector3.zero then
			humanoid.CameraOffset = Vector3.zero
			shakeAmount = 0
		end
	end
end)
```

## `src/CarreraUI/init.meta.json`

```json
{
  "className": "ScreenGui",
  "properties": {
    "ResetOnSpawn": false
  }
}
```

## `src/Config.luau`

```lua
--[[
	CONFIGURACIÓN DE «CARRERA DE GLOBOS»
	Aquí puedes cambiar casi todo el juego sin tocar el resto del código.
]]

local Config = {}

-- ─── Mapa ──────────────────────────────────────────────────────────────
Config.Origen = Vector3.new(0, 0, 0) -- centro del lobby; el mapa se construye desde aquí hacia +X
Config.AnchoPista = 30 -- ancho de cada pista (studs)

-- ─── Carrera ───────────────────────────────────────────────────────────
Config.CuentaAtras = 3 -- segundos de «3, 2, 1, ¡YA!»
Config.VelocidadNormal = 16 -- velocidad al caminar en el lobby
Config.VelocidadCarrera = 26 -- velocidad durante la carrera (más rápido = más divertido)
Config.TiempoCelebracion = 7 -- segundos de fiesta antes de volver al lobby
Config.VelocidadMaximaTrampa = 120 -- studs/seg horizontales; más rápido que esto = trampa (vuelves a tu puerta)
Config.TiempoMaximoCarrera = 240 -- si nadie llega a la meta en este tiempo, la carrera termina
Config.EsperaSolo = 6 -- si estás solo en una plataforma, a los X segundos juegas contra el reloj (0 = desactivado)
Config.AutoGuardado = 120 -- cada cuántos segundos se guarda el progreso de todos
Config.GuardarProgreso = true -- guarda Wins, Globos y lo equipado (en Studio: activa «Enable Studio Access to API Services»)

-- ─── Globos ────────────────────────────────────────────────────────────
Config.AlcanceCuerpo = 2.5 -- qué tan cerca tiene que pasar tu cuerpo de un globo para explotarlo
Config.ProbabilidadDorado = 0.08 -- 8 % de los globos salen dorados (valen más puntos)
Config.PuntosGlobo = 10
Config.PuntosDorado = 50

Config.ColoresGlobo = {
	Color3.fromRGB(255, 70, 90), -- rojo
	Color3.fromRGB(255, 150, 40), -- naranja
	Color3.fromRGB(255, 225, 60), -- amarillo
	Color3.fromRGB(90, 220, 110), -- verde
	Color3.fromRGB(70, 170, 255), -- azul
	Color3.fromRGB(190, 110, 255), -- morado
	Color3.fromRGB(255, 120, 200), -- rosa
}
Config.ColorDorado = Color3.fromRGB(255, 205, 40)

Config.ColoresPista = {
	Color3.fromRGB(60, 150, 255), -- Jugador 1 (azul)
	Color3.fromRGB(255, 80, 150), -- Jugador 2 (rosa)
}

-- ─── Etapas (en orden). Cada nombre es un módulo dentro de la carpeta «Stages» ─
-- Banco de etapas. Puedes quitar, repetir o agregar etapas libremente.
Config.Etapas = { "Aspas", "Neumaticos", "Cinta", "Dardos", "Trampolines", "Lluvia", "Huidizos", "Laberinto", "Gigante" }
Config.OrdenAleatorio = true -- cada carrera mezcla el orden (las dos pistas siempre iguales)
Config.EtapasPorCarrera = 6 -- cuántas etapas del banco se juegan por carrera
Config.EtapaFinal = "Gigante" -- esta siempre va al final, como «jefe» ("" = ninguna)
Config.ProbarEtapa = "" -- PARA PROBAR: pon el nombre de una etapa (ej. "Aspas") y la carrera tendrá solo esa

Config.Aspas = {
	Anillos = 2, -- cuántos anillos de globos hay
	GlobosPorAnillo = 16,
	Radio = 10,
	VelocidadGiro = 3.5, -- radianes por segundo del brazo giratorio
}

Config.Neumaticos = {
	Filas = 4,
	Columnas = 4,
	ConGlobo = 11, -- cuántas llantas tienen globo (el resto están vacías)
}

Config.Dardos = {
	Globos = 18,
	Cadencia = 0.18, -- segundos entre dardo y dardo
	Barrido = 45, -- grados que gira el cañón hacia cada lado
	VelocidadBarrido = 1.8,
	VelocidadDardo = 110,
}

Config.Cinta = {
	Cintas = 4, -- franjas de piso que te arrastran de lado
	GlobosPorCinta = 6,
	Velocidad = 22,
	Porcentaje = 0.8,
}

Config.Trampolines = {
	Cantidad = 5,
	Fuerza = 85, -- qué tan alto te lanzan
	GlobosPorTrampolin = 3,
}

Config.Lluvia = {
	Meta = 12,
	MaximoEnPantalla = 10,
	Intervalo = 0.3, -- segundos entre globo y globo que cae
	VelocidadCaida = 10,
	Altura = 28,
}

Config.Huidizos = {
	Globos = 8,
	DistanciaSusto = 12, -- a qué distancia se asustan y huyen
	VelocidadHuida = 15, -- más lento que tú (VelocidadCarrera) para que puedas alcanzarlos
	VelocidadPaseo = 4,
}

Config.Gigante = {
	Golpes = 10, -- cuántas veces hay que chocarlo para reventarlo
	Tamano = 12,
	Crecimiento = 0.06, -- cuánto se infla con cada golpe
	Rebote = 55,
}

Config.Laberinto = {
	Paredes = 4,
	Porcentaje = 0.85, -- qué parte de los globos hay que explotar para abrir la puerta
	PoderDuracion = 6, -- segundos que dura el súper poder morado
	PoderAlcanceExtra = 4, -- alcance extra del cuerpo con el poder
	PoderVelocidadExtra = 10,
}

-- ─── Efectos ───────────────────────────────────────────────────────────
Config.MejorarIluminacion = true -- colores vivos, brillo neón y cielo suave (ver Ambiente)
Config.VentanaCombo = 1.2 -- segundos entre globos para que el combo siga vivo
Config.ResaltarUltimos = 3 -- cuando te faltan estos globos o menos, brillan a través de las paredes

--[[
	SONIDOS
	En la carpeta «sounds/» del proyecto hay sonidos hechos a medida para este juego.
	Súbelos en create.roblox.com → Creaciones → Audio, copia el ID de cada uno y pégalo
	aquí como "rbxassetid://123456789". Mientras tanto se usan sonidos que ya trae Roblox.
]]
Config.Sonidos = {
	Pop = { Id = "rbxasset://sounds/snap.wav", Volumen = 0.9 }, -- el «¡plop!» del globo
	Nota = { Id = "rbxasset://sounds/electronicpingshort.wav", Volumen = 0.35 }, -- nota musical que sube con el combo
	Dorado = { Id = "rbxasset://sounds/electronicpingshort.wav", Volumen = 0.7 },
	Combo = { Id = "rbxasset://sounds/electronicpingshort.wav", Volumen = 0.6 },
	Cuenta = { Id = "rbxasset://sounds/clickfast.wav", Volumen = 0.8 },
	Ya = { Id = "rbxasset://sounds/electronicpingshort.wav", Volumen = 0.9 },
	Puerta = { Id = "rbxasset://sounds/swoosh.wav", Volumen = 0.8 },
	Poder = { Id = "rbxasset://sounds/electronicpingshort.wav", Volumen = 0.8 },
	Disparo = { Id = "rbxasset://sounds/swoosh.wav", Volumen = 0.25 },
	Victoria = { Id = "rbxasset://sounds/victory.wav", Volumen = 0.9 },
	Rebote = { Id = "rbxasset://sounds/electronicpingshort.wav", Volumen = 0.6 }, -- trampolines y globo gigante
	Gigante = { Id = "rbxasset://sounds/snap.wav", Volumen = 1 }, -- golpe al globo gigante
	Desbloqueo = { Id = "rbxasset://sounds/electronicpingshort.wav", Volumen = 0.9 },
}

--[[
	MÚSICA DE FONDO (loops en sounds/musica_carrera.wav y sounds/musica_lobby.wav)
	Súbelas igual que los sonidos y pega los IDs aquí. Sin ID no suena música.
]]
Config.Musica = {
	Lobby = { Id = "", Volumen = 0.25 },
	Carrera = { Id = "", Volumen = 0.4 },
	SubidaPorEtapa = 0.02, -- cada etapa la música va un poquito más rápido
	AceleracionFinal = 1.2, -- en la última etapa: ¡a toda velocidad!
}

-- Escala pentatónica: cada globo seguido sube una nota (suena como una melodía)
Config.EscalaCombo = { 1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2, 3, 10 / 3 }

-- ─── Recompensas: las Wins desbloquean estelas y títulos (no se gastan) ─
Config.Estelas = {
	{ Id = "nube", Nombre = "Nube", Wins = 0, Colores = { Color3.fromRGB(255, 255, 255), Color3.fromRGB(200, 220, 255) } },
	{ Id = "electrica", Nombre = "Eléctrica", Wins = 1, Colores = { Color3.fromRGB(80, 200, 255), Color3.fromRGB(20, 80, 255) } },
	{ Id = "fuego", Nombre = "Fuego", Wins = 3, Colores = { Color3.fromRGB(255, 230, 80), Color3.fromRGB(255, 60, 20) } },
	{ Id = "menta", Nombre = "Menta", Wins = 5, Colores = { Color3.fromRGB(160, 255, 200), Color3.fromRGB(20, 190, 130) } },
	{ Id = "chicle", Nombre = "Chicle", Wins = 8, Colores = { Color3.fromRGB(255, 170, 230), Color3.fromRGB(255, 60, 170) } },
	{
		Id = "galaxia",
		Nombre = "Galaxia",
		Wins = 12,
		Colores = { Color3.fromRGB(120, 60, 255), Color3.fromRGB(255, 80, 220), Color3.fromRGB(40, 20, 120) },
	},
	{
		Id = "arcoiris",
		Nombre = "Arcoíris",
		Wins = 20,
		Colores = {
			Color3.fromRGB(255, 60, 60),
			Color3.fromRGB(255, 200, 40),
			Color3.fromRGB(60, 220, 90),
			Color3.fromRGB(60, 150, 255),
			Color3.fromRGB(180, 80, 255),
		},
	},
	{ Id = "oro", Nombre = "Oro", Wins = 30, Colores = { Color3.fromRGB(255, 240, 150), Color3.fromRGB(255, 180, 20) } },
	{ Id = "diamante", Nombre = "Diamante", Wins = 50, Colores = { Color3.fromRGB(255, 255, 255), Color3.fromRGB(120, 255, 255) } },
}

Config.Titulos = {
	{ Id = "novato", Nombre = "Novato", Wins = 0, Color = Color3.fromRGB(220, 220, 220) },
	{ Id = "explotador", Nombre = "Explotador", Wins = 2, Color = Color3.fromRGB(120, 220, 255) },
	{ Id = "veloz", Nombre = "Rayo Veloz", Wins = 6, Color = Color3.fromRGB(255, 230, 80) },
	{ Id = "rey", Nombre = "Rey del Globo", Wins = 15, Color = Color3.fromRGB(255, 120, 200) },
	{ Id = "leyenda", Nombre = "Leyenda", Wins = 30, Color = Color3.fromRGB(190, 110, 255) },
	{ Id = "dios", Nombre = "Dios del Pop", Wins = 60, Color = Color3.fromRGB(255, 200, 40) },
}

-- Bailes de victoria (emotes de Roblox: "dance", "dance2", "dance3", "cheer", "laugh", "wave", "point")
Config.Bailes = {
	{ Id = "dance", Nombre = "Baile clásico", Wins = 0, Icono = "💃" },
	{ Id = "cheer", Nombre = "¡Hurra!", Wins = 1, Icono = "🙌" },
	{ Id = "laugh", Nombre = "Risa", Wins = 3, Icono = "😂" },
	{ Id = "dance2", Nombre = "Baile loco", Wins = 7, Icono = "🕺" },
	{ Id = "dance3", Nombre = "Baile pro", Wins = 15, Icono = "🪩" },
}

return Config
```

## `src/Datos.luau`

```lua
-- Tabla de líderes (Wins y Globos), estela/título equipados y guardado con DataStore.

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local Config = require(script.Parent.Config)

local Datos = {}

local STATS = { "Wins", "Globos" }
local SAVED_ATTRIBUTES = { "Estela", "Titulo", "Baile", "MejorTiempo" } -- lo equipado y tu récord
local store: DataStore? = nil

local function key(player: Player): string
	return "jugador_" .. player.UserId
end

local onLoaded: ((Player) -> ())? = nil

local function setup(player: Player)
	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	for _, name in STATS do
		local value = Instance.new("IntValue")
		value.Name = name
		value.Parent = leaderstats
	end
	leaderstats.Parent = player

	local ds = store
	task.spawn(function()
		if ds then
			local ok, data = pcall(function()
				return ds:GetAsync(key(player))
			end)
			if not ok then
				warn("[CarreraGlobos] No se pudieron cargar los datos de " .. player.Name .. ". No se guardará para no borrar nada.")
			elseif player.Parent then
				-- Solo se guarda si la carga salió bien (si no, guardaríamos ceros encima)
				player:SetAttribute("DatosCargados", true)
			end
			if ok and type(data) == "table" then
				for _, name in STATS do
					local value = leaderstats:FindFirstChild(name) :: IntValue?
					if value and type(data[name]) == "number" then
						value.Value += data[name]
					end
				end
				for _, name in SAVED_ATTRIBUTES do
					if type(data[name]) == "string" or type(data[name]) == "number" then
						player:SetAttribute(name, data[name])
					end
				end
			end
		end
		if onLoaded and player.Parent then
			onLoaded(player)
		end
	end)
end

local function save(player: Player)
	local ds = store
	local leaderstats = player:FindFirstChild("leaderstats")
	if not ds or not leaderstats or not player:GetAttribute("DatosCargados") then
		return
	end
	local data = {}
	for _, name in STATS do
		local value = leaderstats:FindFirstChild(name) :: IntValue?
		data[name] = if value then value.Value else 0
	end
	for _, name in SAVED_ATTRIBUTES do
		data[name] = player:GetAttribute(name)
	end
	pcall(function()
		ds:SetAsync(key(player), data)
	end)
end

-- true si se puede escribir en las tablas globales (los datos se cargaron bien)
function Datos.loaded(player: Player): boolean
	return player:GetAttribute("DatosCargados") == true
end

function Datos.get(player: Player, stat: string): number
	local leaderstats = player:FindFirstChild("leaderstats")
	local value = leaderstats and leaderstats:FindFirstChild(stat) :: IntValue?
	return if value then value.Value else 0
end

function Datos.add(player: Player, stat: string, amount: number)
	local leaderstats = player:FindFirstChild("leaderstats")
	local value = leaderstats and leaderstats:FindFirstChild(stat) :: IntValue?
	if value then
		value.Value += amount
	end
end

-- loadedCallback se llama cuando terminan de cargarse los datos de un jugador
function Datos.init(loadedCallback: (Player) -> ())
	onLoaded = loadedCallback
	if Config.GuardarProgreso then
		local ok, result = pcall(function()
			return DataStoreService:GetDataStore("CarreraGlobos_v1")
		end)
		if ok then
			store = result
		else
			warn("[CarreraGlobos] No se pudo usar DataStore (¿API Services apagado?). No se guardará el progreso.")
		end
	end

	Players.PlayerAdded:Connect(setup)
	for _, player in Players:GetPlayers() do
		setup(player)
	end
	Players.PlayerRemoving:Connect(save)
	-- Guardado automático por si el servidor se cae
	task.spawn(function()
		while true do
			task.wait(Config.AutoGuardado)
			for _, player in Players:GetPlayers() do
				save(player)
			end
		end
	end)
	game:BindToClose(function()
		for _, player in Players:GetPlayers() do
			save(player)
		end
	end)
end

return Datos
```

## `src/Main.server.luau`

```lua
--[[
	🎈 CARRERA DE GLOBOS 🎈
	Script principal: construye el mapa, maneja el lobby y arranca carreras.

	Cómo se juega: dos jugadores se paran en las plataformas «Jugador 1» y
	«Jugador 2» del lobby. Corren por pistas paralelas; cada etapa tiene una
	puerta que se abre al explotar suficientes globos. ¡El primero en llegar a
	la meta gana una Win!
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local StarterGui = game:GetService("StarterGui")

local root = script.Parent
local Ambiente = require(root.Ambiente)
local Config = require(root.Config)
local Datos = require(root.Datos)
local MapBuilder = require(root.MapBuilder)
local Race = require(root.Race)
local Recompensas = require(root.Recompensas)
local Tablas = require(root.Tablas)

-- ─── Compartir configuración y canal de eventos con los clientes ───────
local sharedConfig = root.Config:Clone()
sharedConfig.Name = "CarreraGlobosConfig"
sharedConfig.Parent = ReplicatedStorage

local remote = Instance.new("RemoteEvent")
remote.Name = "CarreraGlobosEvento"
remote.Parent = ReplicatedStorage

-- ─── Interfaz: se mueve a StarterGui para que la reciban todos ─────────
local ui = root:FindFirstChild("CarreraUI")
if ui then
	ui.Parent = StarterGui
	for _, player in Players:GetPlayers() do
		local playerGui = player:FindFirstChildOfClass("PlayerGui")
		if playerGui and not playerGui:FindFirstChild("CarreraUI") then
			ui:Clone().Parent = playerGui
		end
	end
else
	warn("[CarreraGlobos] Falta «CarreraUI» (la interfaz). El juego funciona pero sin pantallas.")
end

-- ─── Datos, recompensas y mapa ─────────────────────────────────────────
Recompensas.init(remote)
Datos.init(function(player)
	Recompensas.apply(player)
	Recompensas.sendState(player)
end)

local stageModules: { [string]: any } = {}
for _, name in Config.Etapas do
	local module = root.Stages:FindFirstChild(name)
	if module and module:IsA("ModuleScript") then
		stageModules[name] = require(module) :: any
	else
		warn("[CarreraGlobos] No existe la etapa «" .. name .. "» dentro de la carpeta Stages")
	end
end

-- Elige las etapas de la próxima carrera (mezcladas, con la final siempre al final)
local function pickStages()
	local test = stageModules[Config.ProbarEtapa]
	if test then
		warn("[CarreraGlobos] Modo prueba: la carrera solo tiene la etapa «" .. Config.ProbarEtapa .. "»")
		return { test }
	end
	local names = {}
	for _, name in Config.Etapas do
		if stageModules[name] and name ~= Config.EtapaFinal then
			table.insert(names, name)
		end
	end
	if Config.OrdenAleatorio then
		for i = #names, 2, -1 do
			local j = math.random(1, i)
			names[i], names[j] = names[j], names[i]
		end
	end
	local final = stageModules[Config.EtapaFinal]
	local count = math.min(Config.EtapasPorCarrera - (if final then 1 else 0), #names)
	local chosen = {}
	for i = 1, count do
		table.insert(chosen, stageModules[names[i]])
	end
	if final then
		table.insert(chosen, final)
	end
	return chosen
end

Ambiente.apply()
local map = MapBuilder.build()
MapBuilder.buildTrack(map, pickStages())
Tablas.init(map.lobby)

-- ─── Lobby ─────────────────────────────────────────────────────────────
local status = ""
local racing = false

local function setStatus(text: string)
	if text ~= status then
		status = text
		remote:FireAllClients("estado", text)
	end
end

-- Límite de mensajes: evita que alguien sature el servidor mandando eventos sin parar
local lastMessage: { [Player]: number } = {}
Players.PlayerRemoving:Connect(function(player)
	lastMessage[player] = nil
end)

remote.OnServerEvent:Connect(function(player, kind, ...)
	local now = os.clock()
	if now - (lastMessage[player] or 0) < 0.2 then
		return
	end
	lastMessage[player] = now
	if kind == "hola" then
		remote:FireClient(player, "estado", status)
		Recompensas.sendState(player)
		if Race.lastProgress then
			remote:FireClient(player, "carrera", table.unpack(Race.lastProgress))
		end
	elseif kind == "equipar" then
		Recompensas.equip(player, ...)
	end
end)

local function playerOnPad(pad): Player?
	for _, player in Players:GetPlayers() do
		local character = player.Character
		local hrp = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if hrp and humanoid and humanoid.Health > 0 then
			local d = hrp.Position - pad.part.Position
			if Vector3.new(d.X, 0, d.Z).Magnitude < 4.5 and d.Y > -1 and d.Y < 8 then
				return player
			end
		end
	end
	return nil
end

local function startRace(players: { Player })
	racing = true
	setStatus("¡Carrera en curso! 🏁 Mira la pantalla")
	for _, pad in map.pads do
		pad.label.Text = "JUGADOR " .. pad.index .. "\n¡Párate aquí!"
	end
	task.spawn(function()
		local ok, err = pcall(Race.run, map, players, remote)
		if not ok then
			warn("[CarreraGlobos] Error en la carrera: " .. tostring(err))
			remote:FireAllClients("fin")
			-- Que nadie quede atrapado en la pista
			for i, player in players do
				local character = player.Character
				local humanoid = character and character:FindFirstChildOfClass("Humanoid")
				local hrp = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
				if hrp then
					hrp.Anchored = false
				end
				if humanoid then
					humanoid.WalkSpeed = Config.VelocidadNormal
				end
				if character then
					character:PivotTo(map.lobbyCFrame * CFrame.new(0, 0, (i - 1.5) * 6))
				end
			end
		end
		-- Pista nueva con otro orden para la próxima carrera
		local rebuilt, rebuildErr = pcall(MapBuilder.buildTrack, map, pickStages())
		if not rebuilt then
			warn("[CarreraGlobos] Error al reconstruir la pista: " .. tostring(rebuildErr))
		end
		racing = false
	end)
end

local aloneSince: number? = nil

while true do
	task.wait(0.2)
	if racing then
		aloneSince = nil
		continue
	end

	local p1 = playerOnPad(map.pads[1])
	local p2 = playerOnPad(map.pads[2])
	if p1 == p2 then
		p2 = nil
	end
	for i, pad in map.pads do
		local who = if i == 1 then p1 else p2
		pad.label.Text = if who then "JUGADOR " .. i .. "\n" .. who.DisplayName else "JUGADOR " .. i .. "\n¡Párate aquí!"
	end

	if p1 and p2 then
		aloneSince = nil
		startRace({ p1, p2 })
	elseif p1 or p2 then
		local now = os.clock()
		aloneSince = aloneSince or now
		local waited = now - (aloneSince :: number)
		if Config.EsperaSolo > 0 then
			local left = math.ceil(Config.EsperaSolo - waited)
			if left <= 0 then
				aloneSince = nil
				startRace({ (p1 or p2) :: Player })
			else
				setStatus(string.format("Esperando rival… o juegas solo contra el reloj en %d ⏱", left))
			end
		else
			setStatus("Esperando rival… ¡falta 1 jugador! 👀")
		end
	else
		aloneSince = nil
		setStatus("Párate en una plataforma para jugar 🎈")
	end
end
```

## `src/MapBuilder.luau`

```lua
--[[
	Construye todo el mapa con código: lobby, plataformas de «Jugador 1 / Jugador 2»,
	dos pistas paralelas separadas por vidrio, las etapas, las puertas y la meta.

	Vista desde arriba (X hacia la derecha):

	  LOBBY   | salida | etapa 1 |🚪| etapa 2 |🚪| etapa 3 |🚪| etapa 4 |🚪| META
	  [P1]    | pista 1 ─────────────────────────────────────────────────────►
	  [P2]    | pista 2 ─────────────────────────────────────────────────────►
]]

local Workspace = game:GetService("Workspace")

local Balloons = require(script.Parent.Balloons)
local Config = require(script.Parent.Config)
local Util = require(script.Parent.Util)

local MapBuilder = {}

local SAND = Color3.fromRGB(235, 195, 135)
local WALL = Color3.fromRGB(250, 235, 210)
local GLASS = Color3.fromRGB(200, 230, 255)
local WALL_H = 20
local START_ZONE = 20
local DOOR_T = 2
local FINISH_ZONE = 34

-- Colores pastel para el piso de cada etapa (se repiten si hay más etapas)
local STAGE_TINTS = {
	Color3.fromRGB(180, 240, 210), -- menta
	Color3.fromRGB(215, 200, 255), -- lila
	Color3.fromRGB(255, 215, 185), -- durazno
	Color3.fromRGB(190, 225, 255), -- celeste
	Color3.fromRGB(255, 245, 180), -- limón
	Color3.fromRGB(255, 205, 225), -- rosa
	Color3.fromRGB(185, 245, 245), -- agua
	Color3.fromRGB(230, 215, 255), -- lavanda
}
local FLAG_COLORS = {
	Color3.fromRGB(255, 80, 110),
	Color3.fromRGB(255, 200, 50),
	Color3.fromRGB(80, 200, 255),
	Color3.fromRGB(120, 230, 120),
	Color3.fromRGB(200, 120, 255),
}

-- Adorno: pieza sin colisión ni sombra (no molesta ni pesa)
local function decor(props: { [string]: any }): Part
	props.CanCollide = false
	props.CanQuery = false
	props.CanTouch = false
	props.CastShadow = false
	return Util.part(props)
end

-- Racimo de 3 globos de adorno (no se pueden explotar)
local function balloonBunch(parent: Instance, base: Vector3, size: number)
	for k = 0, 2 do
		local a = k / 3 * math.pi * 2
		local offset = Vector3.new(math.cos(a) * size * 0.45, size * (1.2 + 0.25 * k), math.sin(a) * size * 0.45)
		Balloons.create(parent, base + offset, { size = size })
	end
end

-- Banderines de fiesta colgando a lo largo de una pared
local function bunting(parent: Instance, fromX: number, toX: number, y: number, z: number)
	decor({
		Name = "Cuerda",
		Size = Vector3.new(toX - fromX, 0.1, 0.1),
		CFrame = CFrame.new((fromX + toX) / 2, y, z),
		Color = Color3.fromRGB(255, 255, 255),
		Parent = parent,
	})
	local n = 0
	for x = fromX + 2, toX - 2, 4 do
		n += 1
		decor({
			Name = "Banderin",
			Size = Vector3.new(1.3, 1.3, 0.1),
			CFrame = CFrame.new(x, y - 0.9, z) * CFrame.Angles(0, 0, math.rad(45)),
			Color = FLAG_COLORS[(n - 1) % #FLAG_COLORS + 1],
			Parent = parent,
		})
	end
end

-- Construye el lobby (una sola vez). Las pistas se hacen con buildTrack.
function MapBuilder.build()
	local O = Config.Origen
	local floorY = O.Y + 1

	local root = Instance.new("Folder")
	root.Name = "MapaCarreraGlobos"
	root.Parent = Workspace

	local map = { floorY = floorY, lanes = {}, pads = {}, root = root, track = nil :: Folder? }

	-- ─── Lobby ─────────────────────────────────────────────────────────
	local lobby = Instance.new("Folder")
	lobby.Name = "Lobby"
	lobby.Parent = root
	map.lobby = lobby

	Util.part({
		Name = "PisoLobby",
		Size = Vector3.new(64, 1, 64),
		CFrame = CFrame.new(O + Vector3.new(0, 0.5, 0)),
		Color = Color3.fromRGB(255, 240, 200),
		Parent = lobby,
	})
	-- Cuadros pastel encima del piso
	for gx = 0, 7 do
		for gz = 0, 7 do
			if (gx + gz) % 2 == 0 then
				decor({
					Name = "Cuadro",
					Size = Vector3.new(8, 0.04, 8),
					CFrame = CFrame.new(O + Vector3.new(-28 + gx * 8, 1.02, -28 + gz * 8)),
					Color = STAGE_TINTS[(gx + gz * 3) % #STAGE_TINTS + 1],
					Parent = lobby,
				})
			end
		end
	end
	for _, corner in { Vector3.new(-28, 1, -28), Vector3.new(-28, 1, 28), Vector3.new(28, 1, -28), Vector3.new(28, 1, 28) } do
		balloonBunch(lobby, O + corner, 3)
	end

	local spawn = Instance.new("SpawnLocation")
	spawn.Name = "SpawnCarrera"
	spawn.Anchored = true
	spawn.Size = Vector3.new(10, 1, 10)
	spawn.CFrame = CFrame.new(O + Vector3.new(-18, 0.6, 0))
	spawn.Color = Color3.fromRGB(255, 200, 80)
	spawn.Material = Enum.Material.SmoothPlastic
	spawn.TopSurface = Enum.SurfaceType.Smooth
	spawn.Duration = 0
	spawn.Neutral = true
	spawn.Parent = lobby
	-- Que todos aparezcan en nuestro lobby (solo mientras el juego corre)
	for _, other in Workspace:GetDescendants() do
		if other:IsA("SpawnLocation") and other ~= spawn then
			other.Enabled = false
		end
	end
	map.lobbyCFrame = CFrame.new(O + Vector3.new(-18, 4, 0))

	local sign = Util.part({
		Name = "Letrero",
		Size = Vector3.new(1, 10, 36),
		CFrame = CFrame.new(O + Vector3.new(-31, 8, 0)),
		Color = Color3.fromRGB(255, 90, 150),
		Parent = lobby,
	})
	Util.surfaceText(sign, Enum.NormalId.Right, "🎈 CARRERA DE GLOBOS 🎈")

	for i = 1, 2 do
		local padPos = O + Vector3.new(18, 0, if i == 1 then -10 else 10)
		local pad = Util.cylinder(padPos + Vector3.new(0, 1.2, 0), 0.4, 9, {
			Name = "Plataforma" .. i,
			Color = Config.ColoresPista[i],
			Material = Enum.Material.Neon,
			Parent = lobby,
		})
		local gui = Util.billboard(pad, "JUGADOR " .. i .. "\n¡Párate aquí!", 6, Config.ColoresPista[i])
		gui.Size = UDim2.fromScale(12, 4)
		map.pads[i] = { part = pad, label = gui:FindFirstChild("Texto") :: TextLabel, index = i }
	end

	return map
end

-- Construye (o reconstruye) las dos pistas con las etapas dadas, en ese orden.
-- Se llama al iniciar y después de cada carrera, para que la siguiente sea distinta.
function MapBuilder.buildTrack(map, stageModules)
	local O = Config.Origen
	local floorY = map.floorY
	local W = Config.AnchoPista
	if map.track then
		map.track:Destroy()
	end
	map.lanes = {}

	-- ─── Pistas ────────────────────────────────────────────────────────
	local startX = O.X + 60
	local stageXs = {}
	local x = startX + START_ZONE
	for s, module in stageModules do
		local length = module.length()
		stageXs[s] = { x0 = x, x1 = x + length }
		x += length + DOOR_T
	end
	local finishX = x + 14
	local endX = x + FINISH_ZONE
	local totalLength = endX - startX
	local midX = (startX + endX) / 2

	local track = Instance.new("Folder")
	track.Name = "Pistas"
	track.Parent = map.root
	map.track = track

	-- Divisor de vidrio entre pistas + paredes externas + paredes de inicio y fin
	Util.part({
		Name = "Divisor",
		Size = Vector3.new(totalLength, WALL_H, 2),
		CFrame = CFrame.new(midX, floorY + WALL_H / 2, O.Z),
		Color = GLASS,
		Material = Enum.Material.Glass,
		Transparency = 0.7,
		Parent = track,
	})
	for _, side in { -1, 1 } do
		Util.part({
			Name = "ParedExterna",
			Size = Vector3.new(totalLength, WALL_H, 1),
			CFrame = CFrame.new(midX, floorY + WALL_H / 2, O.Z + side * (W + 1.5)),
			Color = WALL,
			Transparency = 0.25,
			Parent = track,
		})
	end
	for _, side in { -1, 1 } do
		local wallZ = O.Z + side * (W + 1.5)
		bunting(track, startX, endX, floorY + WALL_H - 1.5, wallZ - side * 0.8)
		for bx = startX + 15, endX - 10, 30 do
			balloonBunch(track, Vector3.new(bx, floorY + WALL_H, wallZ), 2.5)
		end
	end
	for _, wx in { startX - 0.5, endX + 0.5 } do
		Util.part({
			Name = "ParedFinal",
			Size = Vector3.new(1, WALL_H, 2 * W + 4),
			CFrame = CFrame.new(wx, floorY + WALL_H / 2, O.Z),
			Color = GLASS,
			Material = Enum.Material.Glass,
			Transparency = 0.6,
			Parent = track,
		})
	end

	for i = 1, 2 do
		local z = O.Z + (if i == 1 then -1 else 1) * (W / 2 + 1)
		local color = Config.ColoresPista[i]
		local laneFolder = Instance.new("Folder")
		laneFolder.Name = "Pista" .. i
		laneFolder.Parent = track

		Util.part({
			Name = "Piso",
			Size = Vector3.new(totalLength, 1, W),
			CFrame = CFrame.new(midX, floorY - 0.5, z),
			Color = SAND,
			Parent = laneFolder,
		})
		-- Franja de salida del color del jugador
		Util.part({
			Name = "Salida",
			Size = Vector3.new(START_ZONE, 0.1, W),
			CFrame = CFrame.new(startX + START_ZONE / 2, floorY + 0.05, z),
			Color = color,
			Transparency = 0.4,
			CanCollide = false,
			Parent = laneFolder,
		})

		local lane = {
			index = i,
			z = z,
			color = color,
			startCFrame = CFrame.lookAt(Vector3.new(startX + 8, floorY + 3, z), Vector3.new(startX + 100, floorY + 3, z)),
			stages = {},
			finishX = finishX,
			finishCFrame = CFrame.lookAt(Vector3.new(finishX - 8, floorY + 3, z), Vector3.new(finishX + 100, floorY + 3, z)),
		}

		for s, module in stageModules do
			local range = stageXs[s]
			local stageFolder = Instance.new("Folder")
			stageFolder.Name = string.format("Etapa%d_%s", s, module.Title)
			stageFolder.Parent = laneFolder

			local barriers = {}
			local ctx = {
				folder = stageFolder,
				x0 = range.x0,
				length = range.x1 - range.x0,
				z = z,
				width = W,
				floor = floorY,
				color = color,
				lane = i,
				rng = Random.new(s * 7919), -- misma semilla en las dos pistas = carrera justa
				addBarrier = function(part: BasePart)
					table.insert(barriers, { part = part, cframe = part.CFrame })
				end,
			}
			local handle = module.build(ctx)

			-- Piso de color de la etapa y arco de entrada con su nombre
			local tint = STAGE_TINTS[(s - 1) % #STAGE_TINTS + 1]
			decor({
				Name = "PisoEtapa",
				Size = Vector3.new(range.x1 - range.x0, 0.04, W - 1),
				CFrame = CFrame.new((range.x0 + range.x1) / 2, floorY + 0.02, z),
				Color = tint,
				Parent = stageFolder,
			})
			local archColor = tint:Lerp(Color3.new(0, 0, 0), 0.25)
			for _, side in { -1, 1 } do
				decor({
					Name = "ArcoPilar",
					Size = Vector3.new(1.5, 13, 1.5),
					CFrame = CFrame.new(range.x0 + 0.75, floorY + 6.5, z + side * (W / 2 - 0.75)),
					Color = archColor,
					Parent = stageFolder,
				})
			end
			local archTop = decor({
				Name = "ArcoTecho",
				Size = Vector3.new(1.5, 3, W),
				CFrame = CFrame.new(range.x0 + 0.75, floorY + 14.5, z),
				Color = archColor,
				Parent = stageFolder,
			})
			Util.surfaceText(archTop, Enum.NormalId.Left, string.format("%d · %s", s, string.upper(module.Title)))

			local door = Util.part({
				Name = "Puerta",
				Size = Vector3.new(DOOR_T, WALL_H, W),
				CFrame = CFrame.new(range.x1 + DOOR_T / 2, floorY + WALL_H / 2, z),
				Color = color,
				Transparency = 0.1,
				Parent = stageFolder,
			})
			local doorLabel = Util.surfaceText(door, Enum.NormalId.Left, "🎈 0 / 0")
			table.insert(barriers, { part = door, cframe = door.CFrame })

			lane.stages[s] = {
				module = module,
				handle = handle,
				x0 = range.x0,
				x1 = range.x1,
				door = door,
				doorLabel = doorLabel,
				barriers = barriers,
				entryCFrame = CFrame.lookAt(
					Vector3.new(range.x0 + 3, floorY + 3, z),
					Vector3.new(range.x0 + 100, floorY + 3, z)
				),
			}
		end

		-- Meta a cuadros
		local tiles = 10
		for t = 0, tiles - 1 do
			Util.part({
				Name = "Meta",
				Size = Vector3.new(3, 0.12, W / tiles),
				CFrame = CFrame.new(finishX + 1.5, floorY + 0.06, z - W / 2 + (t + 0.5) * W / tiles),
				Color = if t % 2 == 0 then Color3.new(1, 1, 1) else Color3.new(0.1, 0.1, 0.1),
				CanCollide = false,
				Parent = laneFolder,
			})
		end
		for _, side in { -1, 1 } do
			Util.part({
				Name = "ArcoPilar",
				Size = Vector3.new(1.5, 14, 1.5),
				CFrame = CFrame.new(finishX + 1.5, floorY + 7, z + side * (W / 2 - 1)),
				Color = Color3.fromRGB(255, 205, 40),
				Material = Enum.Material.Neon,
				Parent = laneFolder,
			})
		end
		local arch = Util.part({
			Name = "ArcoTecho",
			Size = Vector3.new(1.5, 2.5, W),
			CFrame = CFrame.new(finishX + 1.5, floorY + 15, z),
			Color = Color3.fromRGB(255, 205, 40),
			Material = Enum.Material.Neon,
			Parent = laneFolder,
		})
		Util.surfaceText(arch, Enum.NormalId.Left, "🏁 META 🏁").TextColor3 = Color3.fromRGB(60, 30, 0)

		map.lanes[i] = lane
	end
end

return MapBuilder
```

## `src/Race.luau`

```lua
--[[
	Una carrera completa: prepara los globos de cada etapa, hace la cuenta atrás,
	explota globos cuando tu cuerpo los toca, abre puertas y anuncia al ganador.
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local Workspace = game:GetService("Workspace")

local Config = require(script.Parent.Config)
local Balloons = require(script.Parent.Balloons)
local Datos = require(script.Parent.Datos)
local Recompensas = require(script.Parent.Recompensas)
local Tablas = require(script.Parent.Tablas)

local Race = {}

-- Último estado de la barra de carrera (para quien entra a mitad de una carrera)
Race.lastProgress = nil :: { any }?

local function getCharacter(player: Player): (Humanoid?, BasePart?)
	local character = player.Character
	if not character then
		return nil, nil
	end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	local root = character:FindFirstChild("HumanoidRootPart")
	if humanoid and humanoid.Health > 0 and root and root:IsA("BasePart") then
		return humanoid, root
	end
	return nil, nil
end

local function teleport(player: Player, cframe: CFrame)
	local character = player.Character
	if character then
		character:PivotTo(cframe)
	end
end

local function setBarriers(stageMap, open: boolean)
	for _, barrier in stageMap.barriers do
		local part = barrier.part
		if open then
			part.CanCollide = false
			TweenService:Create(part, TweenInfo.new(0.6, Enum.EasingStyle.Back, Enum.EasingDirection.In), {
				CFrame = barrier.cframe - Vector3.new(0, part.Size.Y + 0.5, 0),
			}):Play()
		else
			part.CFrame = barrier.cframe
			part.CanCollide = true
		end
	end
end

function Race.run(map, players: { Player }, remote: RemoteEvent)
	local raceFolder = Instance.new("Folder")
	raceFolder.Name = "CarreraActiva"
	raceFolder.Parent = Workspace

	local seed = math.random(1, 1000000)
	local lanes = {}
	local connections: { RBXScriptConnection } = {}
	local cleaned = false
	local countingDown = true
	local startTime = os.clock()

	local function checkpoint(lane): CFrame
		for s, st in lane.stages do
			if not st.done then
				return lane.map.stages[s].entryCFrame
			end
		end
		return lane.map.finishCFrame
	end

	local function broadcastProgress()
		local list = {}
		for _, lane in lanes do
			table.insert(list, {
				name = lane.player.DisplayName,
				userId = lane.player.UserId,
				cleared = lane.cleared,
				lane = lane.index,
			})
		end
		Race.lastProgress = { list, #map.lanes[1].stages }
		remote:FireAllClients("carrera", list, #map.lanes[1].stages)
	end

	local function updateDoor(lane, s: number)
		local st = lane.stages[s]
		if not st.done then
			lane.map.stages[s].doorLabel.Text = string.format("🎈 %d / %d", math.min(st.popped, st.goal), st.goal)
		end
	end

	local function clearStage(lane, s: number)
		local st = lane.stages[s]
		st.done = true
		lane.cleared += 1
		local stageMap = lane.map.stages[s]
		stageMap.doorLabel.Text = "✅ ¡ABIERTO!"
		setBarriers(stageMap, true)
		remote:FireAllClients("puerta", stageMap.door.Position, lane.player.UserId, s, #lane.stages)
		broadcastProgress()
	end

	-- Suma un punto a la etapa (globo explotado o golpe al globo gigante)
	local function score(lane, s: number, pos: Vector3, color: Color3, radius: number, golden: boolean)
		local st = lane.stages[s]
		st.popped += 1
		local points = if golden then Config.PuntosDorado else Config.PuntosGlobo
		lane.points += points
		remote:FireAllClients("globo", pos, color, radius, lane.player.UserId, points, golden)
		Datos.add(lane.player, "Globos", 1)
		updateDoor(lane, s)
		remote:FireClient(lane.player, "progreso", s, math.min(st.popped, st.goal), st.goal, lane.points)
		if not st.done and st.popped >= st.goal then
			clearStage(lane, s)
		end
	end

	local function popBalloon(lane, s: number, model: Model)
		if cleaned then
			return
		end
		local st = lane.stages[s]
		local info = st.balloons[model]
		if not info then
			return
		end
		st.balloons[model] = nil
		model:Destroy()
		score(lane, s, info.pos, info.color, info.radius, info.golden)
	end

	local function endPower(lane)
		if lane.aura then
			lane.aura:Destroy()
			lane.aura = nil
		end
		local humanoid = getCharacter(lane.player)
		if humanoid and not cleaned then
			humanoid.WalkSpeed = Config.VelocidadCarrera
		end
	end

	local function powerUp(lane, seconds: number)
		lane.powerUntil = os.clock() + seconds
		local humanoid, root = getCharacter(lane.player)
		if humanoid then
			humanoid.WalkSpeed = Config.VelocidadCarrera + Config.Laberinto.PoderVelocidadExtra
		end
		if root and not lane.aura then
			local aura = Instance.new("ParticleEmitter")
			aura.Name = "AuraPoder"
			aura.Color = ColorSequence.new(Color3.fromRGB(200, 90, 255))
			aura.LightEmission = 1
			aura.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1.4), NumberSequenceKeypoint.new(1, 0) })
			aura.Transparency = NumberSequence.new(0.1, 1)
			aura.Lifetime = NumberRange.new(0.4, 0.8)
			aura.Rate = 70
			aura.Speed = NumberRange.new(2, 6)
			aura.SpreadAngle = Vector2.new(180, 180)
			local light = Instance.new("PointLight")
			light.Color = Color3.fromRGB(200, 90, 255)
			light.Range = 12
			light.Brightness = 3
			light.Parent = aura
			aura.Parent = root
			lane.aura = aura
		end
		remote:FireClient(lane.player, "poderJugador", seconds)
		task.delay(seconds, function()
			if os.clock() >= lane.powerUntil - 0.05 then
				endPower(lane)
			end
		end)
	end

	-- Limpieza: SIEMPRE se ejecuta (aunque haya un error), así nadie queda atrapado
	local function cleanup()
		Race.lastProgress = nil
		cleaned = true
		for _, connection in connections do
			connection:Disconnect()
		end
		for _, lane in lanes do
			endPower(lane)
			if lane.player.Parent == Players then
				local humanoid, root = getCharacter(lane.player)
				if root then
					root.Anchored = false
				end
				if humanoid then
					humanoid.WalkSpeed = Config.VelocidadNormal
				end
				teleport(lane.player, map.lobbyCFrame * CFrame.new(0, 0, (lane.index - 1.5) * 6))
			end
			for s, st in lane.stages do
				if st.stop then
					st.stop()
				end
				table.clear(st.balloons)
				local stageMap = lane.map.stages[s]
				setBarriers(stageMap, false)
				stageMap.doorLabel.Text = "🎈"
			end
		end
		raceFolder:Destroy()
		remote:FireAllClients("fin")
	end

	local function body()
		-- ─── Preparar cada pista ───────────────────────────────────────────
		for i, player in players do
			local laneMap = map.lanes[i]
			local lane = {
				player = player,
				index = i,
				map = laneMap,
				stages = {},
				current = -1,
				cleared = 0,
				points = 0,
				powerUntil = 0,
				aura = nil :: ParticleEmitter?,
				won = false,
				checkPos = nil :: Vector3?, -- anti-trampas: última posición revisada
				checkTime = 0,
			}
			lanes[i] = lane

			for s, stageMap in laneMap.stages do
				local st = { balloons = {}, popped = 0, goal = 0, done = false, update = nil, stop = nil }
				lane.stages[s] = st
				setBarriers(stageMap, false)

				local rng = Random.new(seed + s) -- misma semilla en las dos pistas
				local rt = {
					player = player,
					folder = raceFolder,
					rng = rng,
				}
				function rt.addBalloon(pos: Vector3, opts)
					-- Siempre usamos el rng las mismas veces para que las dos pistas sean idénticas
					local color = Config.ColoresGlobo[rng:NextInteger(1, #Config.ColoresGlobo)]
					local golden = rng:NextNumber() < Config.ProbabilidadDorado
					if opts.golden ~= nil then
						golden = opts.golden
					end
					local size = opts.size or 3
					local model = Balloons.create(raceFolder, pos, {
						size = size,
						color = opts.color or color,
						golden = golden,
						noString = opts.noString,
						noBob = opts.noBob,
					})
					local body = model.PrimaryPart :: BasePart
				-- Para que el cliente sepa de quién es y de qué etapa (resaltar los últimos)
				model:SetAttribute("Dueno", player.UserId)
				model:SetAttribute("Etapa", s)
					st.balloons[model] = { pos = pos, radius = size * 0.55, golden = golden, color = body.Color }
					return model
				end
				function rt.pop(model: Model)
					popBalloon(lane, s, model)
				end
				function rt.balloons()
					return st.balloons
				end
				function rt.move(model: Model, pos: Vector3)
					local info = st.balloons[model]
					if info then
						info.pos = pos
						model:PivotTo(CFrame.new(pos))
					end
				end
				function rt.hit(pos: Vector3, color: Color3, radius: number)
					if not cleaned then
						score(lane, s, pos, color, radius, false)
					end
				end
				function rt.done(): boolean
					return st.done
				end
				function rt.bounce(velocity: Vector3)
					remote:FireClient(player, "rebote", velocity)
				end
				function rt.fx(kind: string, ...)
					remote:FireAllClients(kind, ...)
				end
				function rt.powerUp(seconds: number)
					powerUp(lane, seconds)
				end

				local control = stageMap.module.start(stageMap.handle, rt)
				st.goal = control.goal
				st.update = control.update
				st.stop = control.stop
				updateDoor(lane, s)
			end
			for s, st in lane.stages do
				if st.goal <= 0 then
					clearStage(lane, s)
				end
			end
		end

		-- Si alguien se muere o se reinicia, reaparece en su última puerta
		for _, lane in lanes do
			table.insert(
				connections,
				lane.player.CharacterAdded:Connect(function(character)
					local root = character:WaitForChild("HumanoidRootPart", 10)
					local humanoid = character:WaitForChild("Humanoid", 10) :: Humanoid?
					if cleaned or not root then
						return
					end
					task.wait()
					lane.aura = nil
					if countingDown then
						-- Reiniciarse en la cuenta atrás no da ventaja: vuelves a la salida, quieto
						local frozen = root :: BasePart
						character:PivotTo(lane.map.startCFrame)
						frozen.Anchored = true
						return
					end
					character:PivotTo(checkpoint(lane))
					lane.checkPos = nil
					if humanoid then
						humanoid.WalkSpeed = Config.VelocidadCarrera
					end
				end)
			)
		end

		-- ─── Cuenta atrás ──────────────────────────────────────────────────
		for _, lane in lanes do
			local _, root = getCharacter(lane.player)
			if root then
				teleport(lane.player, lane.map.startCFrame)
				root.Anchored = true
			end
		end
		broadcastProgress()
		for n = Config.CuentaAtras, 1, -1 do
			remote:FireAllClients("cuenta", n)
			task.wait(1)
		end
		remote:FireAllClients("cuenta", 0)
		countingDown = false
		startTime = os.clock()
		for _, lane in lanes do
			local humanoid, root = getCharacter(lane.player)
			if root then
				root.Anchored = false
			end
			if humanoid then
				humanoid.WalkSpeed = Config.VelocidadCarrera
			end
		end

		-- ─── Bucle de la carrera ───────────────────────────────────────────
		local laneCount = 0
		for _ in lanes do
			laneCount += 1
		end

		local function stepLane(lane, root: BasePart, dt: number)
			local pos = root.Position
			if pos.Y < map.floorY - 30 then
				teleport(lane.player, checkpoint(lane))
				lane.checkPos = nil
				return
			end

			-- Anti-trampas: cada medio segundo revisamos que no se haya movido más de lo posible
			local now = os.clock()
			if not lane.checkPos then
				lane.checkPos, lane.checkTime = pos, now
			elseif now - lane.checkTime >= 0.5 then
				local moved = Vector3.new(pos.X - lane.checkPos.X, 0, pos.Z - lane.checkPos.Z).Magnitude
				if moved > Config.VelocidadMaximaTrampa * (now - lane.checkTime) then
					teleport(lane.player, checkpoint(lane))
					lane.checkPos = nil
					return
				end
				lane.checkPos, lane.checkTime = pos, now
			end

			-- ¿En qué etapa está? (para mostrar el cartel e instrucciones)
			local current = 0
			for s, stageMap in lane.map.stages do
				if pos.X >= stageMap.x0 and pos.X < stageMap.x1 + 2 then
					current = s
				end
			end
			if current ~= lane.current then
				lane.current = current
				if current > 0 then
					local st = lane.stages[current]
					local module = lane.map.stages[current].module
					remote:FireClient(
						lane.player,
						"etapa",
						current,
						#lane.stages,
						module.Title,
						module.Hint,
						math.min(st.popped, st.goal),
						st.goal,
						st.done
					)
				end
			end

			-- Tu cuerpo explota los globos que toca
			local reach = Config.AlcanceCuerpo
			if os.clock() < lane.powerUntil then
				reach += Config.Laberinto.PoderAlcanceExtra
			end
			for s, st in lane.stages do
				for model, info in st.balloons do
					if (info.pos - pos).Magnitude <= info.radius + reach then
						popBalloon(lane, s, model)
					end
				end
				if st.update then
					st.update(dt, root, s == current)
				end
			end

			if lane.cleared >= #lane.stages and pos.X >= lane.map.finishX then
				lane.won = true
			end
		end

		local winner = nil
		local timedOut = false
		while not winner do
			local dt = RunService.Heartbeat:Wait()
			if os.clock() - startTime > Config.TiempoMaximoCarrera then
				timedOut = true
				break
			end
			local present = {}
			for _, lane in lanes do
				if lane.player.Parent == Players then
					table.insert(present, lane)
				end
			end
			if #present == 0 then
				break
			end
			if #present == 1 and laneCount > 1 then
				winner = present[1] -- el rival se fue
				break
			end
			for _, lane in present do
				local _, root = getCharacter(lane.player)
				if root then
					stepLane(lane, root, dt)
					if lane.won then
						winner = lane
						break
					end
				end
			end
		end

		-- ─── Ganador ──────────────────────────────────────────────────────
		if timedOut then
			remote:FireAllClients("aviso", "⏱ ¡Se acabó el tiempo!", "Nadie llegó a la meta. ¡Otra vez!")
			task.wait(3)
		elseif winner and not winner.won then
			-- El rival se fue: no cuenta como Win (evita hacer trampa con otra cuenta)
			remote:FireClient(winner.player, "aviso", "Tu rival se fue 😢", "Esta carrera no cuenta. ¡Busca otro rival!")
			task.wait(3)
		elseif winner then
			local seconds = os.clock() - startTime
			local isRecord = Tablas.recordTime(winner.player, seconds)
			remote:FireAllClients(
				"ganador",
				winner.player.DisplayName,
				winner.player.UserId,
				winner.points,
				seconds,
				isRecord,
				laneCount == 1,
				(tonumber(winner.player:GetAttribute("Racha")) or 0) + (if laneCount > 1 then 1 else 0)
			)
			-- El ganador se queda quieto (así puede bailar) y le ponemos una corona
			local winnerHumanoid = getCharacter(winner.player)
			if winnerHumanoid then
				winnerHumanoid.WalkSpeed = 0
			end
			local head = winner.player.Character and winner.player.Character:FindFirstChild("Head")
			if head and head:IsA("BasePart") then
				local crown = Instance.new("BillboardGui")
				crown.Name = "CoronaGanador"
				crown.Size = UDim2.fromScale(4, 4)
				crown.StudsOffset = Vector3.new(0, 4.5, 0)
				crown.LightInfluence = 0
				local icon = Instance.new("TextLabel")
				icon.Size = UDim2.fromScale(1, 1)
				icon.BackgroundTransparency = 1
				icon.TextScaled = true
				icon.Text = "👑"
				icon.Parent = crown
				crown.Parent = head
				task.delay(Config.TiempoCelebracion, function()
					crown:Destroy()
				end)
			end

			-- Racha de victorias seguidas (solo en 1 contra 1)
			local streak = 0
			if laneCount > 1 then
				streak = (tonumber(winner.player:GetAttribute("Racha")) or 0) + 1
				winner.player:SetAttribute("Racha", streak)
				for _, lane in lanes do
					if lane ~= winner and lane.player.Parent == Players then
						lane.player:SetAttribute("Racha", 0)
						Recompensas.apply(lane.player)
					end
				end
			end
			-- Contra el reloj (solo) no suma Win: solo cuenta el tiempo
			if laneCount > 1 then
				Datos.add(winner.player, "Wins", 1)
				Tablas.saveWins(winner.player)
				Recompensas.onWin(winner.player)
			end
			task.wait(Config.TiempoCelebracion)
		end
		for _, lane in lanes do
			if lane.player.Parent == Players then
				Tablas.saveGlobos(lane.player)
			end
		end
		Tablas.refreshSoon()
	end

	local ok, err = pcall(body)
	cleanup()
	if not ok then
		error(err, 0)
	end
end

return Race
```

## `src/Recompensas.luau`

```lua
--[[
	RECOMPENSAS: las Wins desbloquean estelas (rastro que dejas al correr),
	títulos (cartel sobre tu cabeza) y bailes de victoria. Las Wins no se gastan: al llegar a cierta
	cantidad se desbloquea para siempre.
]]

local Players = game:GetService("Players")

local Config = require(script.Parent.Config)
local Datos = require(script.Parent.Datos)

local Recompensas = {}

local remote: RemoteEvent? = nil

local function find(list, id: any)
	for _, item in list do
		if item.Id == id then
			return item
		end
	end
	return nil
end

local LISTS = {
	Estela = Config.Estelas,
	Titulo = Config.Titulos,
	Baile = Config.Bailes,
}

local function equipped(player: Player, kind: string)
	local list = LISTS[kind]
	local item = find(list, player:GetAttribute(kind))
	-- Si no tiene nada válido (o ya no le alcanza), usamos el primero (gratis)
	if not item or Datos.get(player, "Wins") < item.Wins then
		item = list[1]
	end
	return item
end

local function applyTrail(player: Player, character: Model)
	local root = character:FindFirstChild("HumanoidRootPart")
	if not root then
		return
	end
	for _, name in { "EstelaCarrera", "EstelaArriba", "EstelaAbajo" } do
		local old = root:FindFirstChild(name)
		if old then
			old:Destroy()
		end
	end
	local item = equipped(player, "Estela")

	local top = Instance.new("Attachment")
	top.Name = "EstelaArriba"
	top.Position = Vector3.new(0, 0.9, 0)
	top.Parent = root
	local bottom = Instance.new("Attachment")
	bottom.Name = "EstelaAbajo"
	bottom.Position = Vector3.new(0, -0.9, 0)
	bottom.Parent = root

	local keypoints = {}
	for i, color in item.Colores do
		table.insert(keypoints, ColorSequenceKeypoint.new((i - 1) / math.max(#item.Colores - 1, 1), color))
	end
	if #keypoints == 1 then
		table.insert(keypoints, ColorSequenceKeypoint.new(1, item.Colores[1]))
	end

	local trail = Instance.new("Trail")
	trail.Name = "EstelaCarrera"
	trail.Attachment0 = top
	trail.Attachment1 = bottom
	trail.Color = ColorSequence.new(keypoints)
	trail.Lifetime = 0.55
	trail.LightEmission = 0.6
	trail.Transparency = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 0.1),
		NumberSequenceKeypoint.new(1, 1),
	})
	trail.WidthScale = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 1),
		NumberSequenceKeypoint.new(1, 0.2),
	})
	trail.FaceCamera = true
	trail.Parent = root
end

local function applyTitle(player: Player, character: Model)
	local head = character:FindFirstChild("Head")
	if not head then
		return
	end
	local old = head:FindFirstChild("TituloCarrera")
	if old then
		old:Destroy()
	end
	local item = equipped(player, "Titulo")

	local gui = Instance.new("BillboardGui")
	gui.Name = "TituloCarrera"
	gui.Size = UDim2.fromOffset(220, 46)
	gui.StudsOffset = Vector3.new(0, 2.6, 0)
	gui.MaxDistance = 80
	gui.LightInfluence = 0
	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Font = Enum.Font.FredokaOne
	label.TextScaled = true
	local text = string.format("%s · 🏆 %d", item.Nombre, Datos.get(player, "Wins"))
	local streak = tonumber(player:GetAttribute("Racha")) or 0
	if streak >= 2 then
		text ..= " · 🔥" .. streak
	end
	label.Text = text
	label.TextColor3 = item.Color
	label.TextStrokeTransparency = 0.2
	label.Parent = gui
	gui.Parent = head
end

function Recompensas.apply(player: Player)
	local character = player.Character
	if character then
		applyTrail(player, character)
		applyTitle(player, character)
	end
end

function Recompensas.sendState(player: Player)
	if remote then
		remote:FireClient(
			player,
			"tienda",
			Datos.get(player, "Wins"),
			equipped(player, "Estela").Id,
			equipped(player, "Titulo").Id,
			equipped(player, "Baile").Id
		)
	end
end

-- Llamado cuando el cliente toca «Equipar» en la tienda
function Recompensas.equip(player: Player, kind: any, id: any)
	local list = LISTS[kind]
	if not list or type(id) ~= "string" then
		return
	end
	local item = find(list, id)
	if item and Datos.get(player, "Wins") >= item.Wins then
		player:SetAttribute(kind, id)
		Recompensas.apply(player)
	end
	Recompensas.sendState(player)
end

-- Llamado después de sumar una Win: avisa si se desbloqueó algo nuevo
function Recompensas.onWin(player: Player)
	local wins = Datos.get(player, "Wins")
	local unlocked = {}
	for _, item in Config.Estelas do
		if item.Wins == wins then
			table.insert(unlocked, "Estela " .. item.Nombre)
		end
	end
	for _, item in Config.Titulos do
		if item.Wins == wins then
			table.insert(unlocked, "Título «" .. item.Nombre .. "»")
		end
	end
	for _, item in Config.Bailes do
		if item.Wins == wins then
			table.insert(unlocked, "Baile " .. item.Icono .. " " .. item.Nombre)
		end
	end

	-- Próxima recompensa, para que siempre haya una meta
	local nextItem = nil
	for _, list in LISTS do
		for _, item in list do
			if item.Wins > wins and (not nextItem or item.Wins < nextItem.Wins) then
				nextItem = item
			end
		end
	end

	if remote then
		remote:FireClient(
			player,
			"desbloqueo",
			unlocked,
			if nextItem then nextItem.Nombre else nil,
			if nextItem then nextItem.Wins else nil,
			wins
		)
	end
	Recompensas.apply(player)
	Recompensas.sendState(player)
end

function Recompensas.init(remoteEvent: RemoteEvent)
	remote = remoteEvent
	local function hook(player: Player)
		player.CharacterAdded:Connect(function(character)
			character:WaitForChild("HumanoidRootPart", 10)
			character:WaitForChild("Head", 10)
			Recompensas.apply(player)
		end)
	end
	Players.PlayerAdded:Connect(hook)
	for _, player in Players:GetPlayers() do
		hook(player)
	end
end

return Recompensas
```

## `src/Stages/Aspas.luau`

```lua
--[[
	ETAPA: ASPAS GIRATORIAS
	Anillos de globos alrededor de una plataforma con un botón verde.
	Mientras estés parado en el botón, el brazo gira y revienta todo el anillo.
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Aspas = {}

Aspas.Title = "Aspas giratorias"
Aspas.Hint = "¡Párate en el botón verde!"

local BUTTON_OFF = Color3.fromRGB(80, 220, 90)
local BUTTON_ON = Color3.fromRGB(255, 240, 80)
local RING_COLOR = Color3.fromRGB(90, 150, 230)
local PEDESTAL_H = 2.4
local ARM_Y = 1.8
local BALLOON_Y = 2.6
local HIT_ANGLE = 0.15 -- radianes: qué tan cerca debe pasar el brazo de un globo

function Aspas.length(): number
	local cfg = Config.Aspas
	return cfg.Anillos * (2 * cfg.Radio + 8) + 8
end

function Aspas.build(ctx)
	local cfg = Config.Aspas
	local R = cfg.Radio
	local handle = { rings = {} }

	for r = 1, cfg.Anillos do
		local cx = ctx.x0 + 4 + (r - 1) * (2 * R + 8) + R + 4
		local center = Vector3.new(cx, ctx.floor, ctx.z)

		-- Anillo azul donde se paran los globos
		local tiles = 28
		for k = 0, tiles - 1 do
			local a = k / tiles * math.pi * 2
			Util.part({
				Name = "Anillo",
				Size = Vector3.new(4, 0.6, 2 * math.pi * R / tiles + 0.3),
				CFrame = CFrame.new(center + Vector3.new(math.cos(a) * R, 0.3, math.sin(a) * R)) * CFrame.Angles(0, -a, 0),
				Color = RING_COLOR,
				Parent = ctx.folder,
			})
		end

		-- Plataforma central con el botón
		Util.cylinder(center + Vector3.new(0, PEDESTAL_H / 2, 0), PEDESTAL_H, 7, {
			Name = "Plataforma",
			Color = Color3.fromRGB(70, 110, 190),
			Parent = ctx.folder,
		})
		local button = Util.cylinder(center + Vector3.new(0, PEDESTAL_H + 0.15, 0), 0.3, 4.5, {
			Name = "Boton",
			Color = BUTTON_OFF,
			Material = Enum.Material.Neon,
			Parent = ctx.folder,
		})
		local sign = Util.billboard(button, "⬇ ¡PÁRATE AQUÍ! ⬇", 5, Color3.fromRGB(255, 255, 120))

		-- Eje invisible + brazo que gira con un motor (física = movimiento suave)
		local axle = Util.part({
			Name = "Eje",
			Size = Vector3.new(1, 1, 1),
			CFrame = CFrame.new(center + Vector3.new(0, ARM_Y, 0)),
			Transparency = 1,
			CanCollide = false,
			CanQuery = false,
			CanTouch = false,
			Parent = ctx.folder,
		})
		local armLength = R + 1
		local arm = Util.part({
			Name = "Brazo",
			Anchored = false,
			Size = Vector3.new(armLength, 1, 1.6),
			CFrame = CFrame.new(center + Vector3.new(armLength / 2, ARM_Y, 0)),
			Color = Color3.fromRGB(150, 95, 55),
			Material = Enum.Material.WoodPlanks,
			CanCollide = false,
			CanTouch = false,
			Parent = ctx.folder,
		})
		local tip = Util.part({
			Name = "Punta",
			Anchored = false,
			Shape = Enum.PartType.Ball,
			Size = Vector3.new(2.2, 2.2, 2.2),
			CFrame = CFrame.new(center + Vector3.new(armLength, ARM_Y, 0)),
			Color = Color3.fromRGB(255, 90, 220),
			Material = Enum.Material.Neon,
			CanCollide = false,
			CanTouch = false,
			Massless = true,
			Parent = ctx.folder,
		})
		local weld = Instance.new("WeldConstraint")
		weld.Part0 = arm
		weld.Part1 = tip
		weld.Parent = arm

		local verticalAxis = CFrame.Angles(0, 0, math.rad(90)) -- el eje de la bisagra (X) apunta hacia arriba
		local a0 = Instance.new("Attachment")
		a0.CFrame = verticalAxis
		a0.Parent = axle
		local a1 = Instance.new("Attachment")
		a1.CFrame = CFrame.new(-armLength / 2, 0, 0) * verticalAxis
		a1.Parent = arm
		local hinge = Instance.new("HingeConstraint")
		hinge.Attachment0 = a0
		hinge.Attachment1 = a1
		hinge.ActuatorType = Enum.ActuatorType.Motor
		hinge.MotorMaxTorque = 1e9
		hinge.MotorMaxAcceleration = 12 -- arranca poco a poco: da emoción
		hinge.AngularVelocity = 0
		hinge.Parent = arm

		pcall(function()
			arm:SetNetworkOwner(nil) -- el servidor controla el brazo
		end)

		table.insert(handle.rings, {
			center = center,
			arm = arm,
			hinge = hinge,
			button = button,
			sign = sign,
			spinning = false,
		})
	end

	return handle
end

local function onButton(ring, pos: Vector3): boolean
	local d = pos - ring.center
	return Vector3.new(d.X, 0, d.Z).Magnitude < 3.4 and d.Y > PEDESTAL_H + 1
end

function Aspas.start(handle, rt)
	local cfg = Config.Aspas
	local R = cfg.Radio
	local ringBalloons = {} -- [Model] = { ring = n, angle = a }
	local total = 0

	for r, ring in handle.rings do
		ring.hinge.AngularVelocity = 0
		ring.button.Color = BUTTON_OFF
		ring.sign.Enabled = true
		ring.spinning = false
		for k = 0, cfg.GlobosPorAnillo - 1 do
			local a = (k + 0.5) / cfg.GlobosPorAnillo * math.pi * 2
			local pos = ring.center + Vector3.new(math.cos(a) * R, BALLOON_Y, math.sin(a) * R)
			local model = rt.addBalloon(pos, {})
			ringBalloons[model] = { ring = r, angle = a }
			total += 1
		end
	end

	local function update(_dt: number, hrp: BasePart)
		for r, ring in handle.rings do
			local on = onButton(ring, hrp.Position)
			if on ~= ring.spinning then
				ring.spinning = on
				ring.hinge.AngularVelocity = if on then cfg.VelocidadGiro else 0
				ring.button.Color = if on then BUTTON_ON else BUTTON_OFF
			end

			local d = ring.arm.Position - ring.center
			local armAngle = math.atan2(d.Z, d.X)
			local left = 0
			for model, info in ringBalloons do
				if not model.Parent then
					ringBalloons[model] = nil
				elseif info.ring == r then
					local diff = math.abs((armAngle - info.angle + math.pi) % (2 * math.pi) - math.pi)
					if diff < HIT_ANGLE then
						rt.pop(model)
					else
						left += 1
					end
				end
			end
			ring.sign.Enabled = left > 0
		end
	end

	local function stop()
		for _, ring in handle.rings do
			ring.hinge.AngularVelocity = 0
			ring.button.Color = BUTTON_OFF
			ring.spinning = false
		end
	end

	return { goal = total, update = update, stop = stop }
end

return Aspas
```

## `src/Stages/Cinta.luau`

```lua
--[[
	ETAPA: CINTA LOCA
	Franjas de piso que te arrastran de lado. Cruza y deja que la cinta te
	lleve por la fila de globos.
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Cinta = {}

Cinta.Title = "Cinta loca"
Cinta.Hint = "¡Déjate llevar por las cintas y revienta la fila!"

local BELT_DEPTH = 8
local STEP = 12

function Cinta.length(): number
	return Config.Cinta.Cintas * STEP + 8
end

function Cinta.build(ctx)
	local cfg = Config.Cinta
	local belts = {}
	for k = 1, cfg.Cintas do
		local x = ctx.x0 + 4 + (k - 0.5) * STEP
		local direction = if k % 2 == 1 then 1 else -1
		local belt = Util.part({
			Name = "Cinta",
			Size = Vector3.new(BELT_DEPTH, 0.4, ctx.width),
			CFrame = CFrame.new(x, ctx.floor + 0.2, ctx.z),
			Color = Color3.fromRGB(60, 60, 75),
			Material = Enum.Material.DiamondPlate,
			Parent = ctx.folder,
		})
		belt.AssemblyLinearVelocity = Vector3.new(0, 0, direction * cfg.Velocidad)
		belt:SetAttribute("Direccion", direction)

		-- Franjas amarillas (el cliente las anima para que se vea que la cinta se mueve)
		local stripes = 6
		for n = 0, stripes - 1 do
			local stripe = Util.part({
				Name = "Franja",
				Size = Vector3.new(BELT_DEPTH, 0.05, 1),
				CFrame = CFrame.new(x, ctx.floor + 0.43, ctx.z - ctx.width / 2 + (n + 0.5) * ctx.width / stripes),
				Color = Color3.fromRGB(255, 200, 40),
				Material = Enum.Material.Neon,
				CanCollide = false,
				CanQuery = false,
				CanTouch = false,
				Parent = ctx.folder,
			})
			stripe:SetAttribute("CintaZ", ctx.z)
			stripe:SetAttribute("CintaAncho", ctx.width)
			stripe:SetAttribute("CintaVel", direction * cfg.Velocidad * 0.5)
			stripe:AddTag("FranjaCinta")
		end
		table.insert(belts, x)
	end
	return { belts = belts, z = ctx.z, width = ctx.width, floor = ctx.floor }
end

function Cinta.start(handle, rt)
	local cfg = Config.Cinta
	local total = 0
	for _, x in handle.belts do
		for n = 1, cfg.GlobosPorCinta do
			local z = handle.z - handle.width / 2 + n * handle.width / (cfg.GlobosPorCinta + 1)
			rt.addBalloon(Vector3.new(x, handle.floor + 2.6, z), {})
			total += 1
		end
	end
	return { goal = math.floor(total * cfg.Porcentaje) }
end

return Cinta
```

## `src/Stages/Dardos.luau`

```lua
--[[
	ETAPA: LANZADARDOS
	Súbete al botón azul: el cañón gira de lado a lado disparando dardos que
	atraviesan todos los globos que encuentran. Detrás del vidrio está el campo de globos.
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Dardos = {}

Dardos.Title = "Lanzadardos"
Dardos.Hint = "¡Súbete al botón azul y dispara!"

local PEDESTAL_H = 2.5
local DART_Y = 2.4
local FIELD_START = 20 -- distancia desde el inicio de la etapa hasta el campo de globos

function Dardos.length(): number
	return 70
end

function Dardos.build(ctx)
	local center = Vector3.new(ctx.x0 + 8, ctx.floor, ctx.z)

	Util.cylinder(center + Vector3.new(0, PEDESTAL_H / 2, 0), PEDESTAL_H, 7, {
		Name = "Plataforma",
		Color = Color3.fromRGB(110, 170, 240),
		Parent = ctx.folder,
	})
	local button = Util.cylinder(center + Vector3.new(0, PEDESTAL_H + 0.15, 0), 0.3, 4.5, {
		Name = "Boton",
		Color = Color3.fromRGB(40, 90, 200),
		Material = Enum.Material.Neon,
		Parent = ctx.folder,
	})
	local sign = Util.billboard(button, "⬇ ¡SÚBETE! ⬇", 5, Color3.fromRGB(150, 220, 255))

	local cannon = Util.part({
		Name = "Canon",
		Shape = Enum.PartType.Cylinder,
		Size = Vector3.new(3, 1.3, 1.3),
		CFrame = CFrame.new(center + Vector3.new(4.5, DART_Y, 0)),
		Color = Color3.fromRGB(40, 50, 80),
		Material = Enum.Material.Metal,
		CanCollide = false,
		Parent = ctx.folder,
	})

	-- Flechas pintadas en el piso (decoración, como en el video)
	for _, deg in { -30, 0, 30 } do
		local a = math.rad(deg)
		local dir = Vector3.new(math.cos(a), 0, math.sin(a))
		Util.part({
			Name = "Flecha",
			Size = Vector3.new(7, 0.1, 0.7),
			CFrame = CFrame.lookAt(center + dir * 11 + Vector3.new(0, 0.05, 0), center + dir * 20 + Vector3.new(0, 0.05, 0))
				* CFrame.Angles(0, math.rad(90), 0),
			Color = Color3.fromRGB(40, 70, 140),
			Material = Enum.Material.Neon,
			CanCollide = false,
			Parent = ctx.folder,
		})
	end

	-- Vidrio que separa al jugador de los globos (se abre junto con la puerta)
	local glass = Util.part({
		Name = "Vidrio",
		Size = Vector3.new(1, 20, ctx.width),
		CFrame = CFrame.new(ctx.x0 + FIELD_START - 5, ctx.floor + 10, ctx.z),
		Color = Color3.fromRGB(200, 230, 255),
		Material = Enum.Material.Glass,
		Transparency = 0.6,
		Parent = ctx.folder,
	})
	ctx.addBarrier(glass)

	return {
		center = center,
		cannon = cannon,
		button = button,
		sign = sign,
		fieldX0 = ctx.x0 + FIELD_START,
		fieldX1 = ctx.x0 + Dardos.length() - 4,
		z = ctx.z,
		halfWidth = ctx.width / 2 - 3,
		floor = ctx.floor,
	}
end

function Dardos.start(handle, rt)
	local cfg = Config.Dardos
	local placed = {}
	local tries = 0
	while #placed < cfg.Globos and tries < 2000 do
		tries += 1
		local pos = Vector3.new(
			rt.rng:NextNumber(handle.fieldX0, handle.fieldX1),
			handle.floor + DART_Y,
			handle.z + rt.rng:NextNumber(-handle.halfWidth, handle.halfWidth)
		)
		local ok = true
		for _, other in placed do
			if (other - pos).Magnitude < 4 then
				ok = false
				break
			end
		end
		if ok then
			table.insert(placed, pos)
			rt.addBalloon(pos, {})
		end
	end

	local origin = handle.center + Vector3.new(0, DART_Y, 0)
	local range = handle.fieldX1 - handle.center.X + 6
	local t = 0
	local cooldown = 0

	local function fire(angle: number)
		local dir = Vector3.new(math.cos(angle), 0, math.sin(angle))
		handle.cannon.CFrame = CFrame.fromMatrix(origin + dir * 4.5, dir, Vector3.yAxis)
		local muzzle = origin + dir * 6
		rt.fx("dardo", muzzle, dir, range, cfg.VelocidadDardo, rt.player.UserId)

		-- El dardo atraviesa todo lo que está en su línea
		for model, info in rt.balloons() do
			local v = info.pos - muzzle
			v = Vector3.new(v.X, 0, v.Z)
			local along = v:Dot(dir)
			if along > 0 and along < range then
				local perp = (v - dir * along).Magnitude
				if perp < info.radius + 0.6 then
					task.delay(along / cfg.VelocidadDardo, rt.pop, model)
				end
			end
		end
	end

	local function update(dt: number, hrp: BasePart)
		local d = hrp.Position - handle.center
		local on = Vector3.new(d.X, 0, d.Z).Magnitude < 3.4 and d.Y > PEDESTAL_H + 1
		handle.button.Color = if on then Color3.fromRGB(120, 230, 255) else Color3.fromRGB(40, 90, 200)
		handle.sign.Enabled = not on and next(rt.balloons()) ~= nil
		if not on then
			return
		end
		t += dt
		cooldown -= dt
		if cooldown <= 0 then
			cooldown = cfg.Cadencia
			fire(math.sin(t * cfg.VelocidadBarrido) * math.rad(cfg.Barrido))
		end
	end

	return { goal = #placed, update = update }
end

return Dardos
```

## `src/Stages/Gigante.luau`

```lua
--[[
	ETAPA FINAL: GLOBO GIGANTE
	Un globo enorme. Cada vez que lo chocas rebotas, se infla un poco más
	y se pone más rojo… ¡hasta que explota!
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)
local Balloons = require(script.Parent.Parent.Balloons)

local Gigante = {}

Gigante.Title = "¡GLOBO GIGANTE!"
Gigante.Hint = "¡Chócalo una y otra vez hasta que explote!"

local HIT_COOLDOWN = 0.35
local DANGER = Color3.fromRGB(255, 40, 40)

function Gigante.length(): number
	return 40
end

function Gigante.build(ctx)
	local center = Vector3.new(ctx.x0 + 20, ctx.floor, ctx.z)
	Util.cylinder(center + Vector3.new(0, 0.15, 0), 0.3, 22, {
		Name = "Arena",
		Color = Color3.fromRGB(255, 120, 170),
		CanCollide = false,
		Parent = ctx.folder,
	})
	return { center = center }
end

function Gigante.start(handle, rt)
	local cfg = Config.Gigante
	local size = cfg.Tamano
	local startColor = Config.ColoresGlobo[rt.rng:NextInteger(1, #Config.ColoresGlobo)]
	local balloonCenter = handle.center + Vector3.new(0, size * 0.6 + 0.5, 0)
	local model = Balloons.create(rt.folder, balloonCenter, {
		size = size,
		color = startColor,
		noString = true,
		noBob = true,
	})
	local body = model.PrimaryPart :: BasePart
	local hp = cfg.Golpes
	local lastHit = 0

	local function update(_dt: number, root: BasePart)
		if hp <= 0 or not model.Parent then
			return
		end
		local radius = body.Size.X / 2
		local offset = root.Position - body.Position
		if offset.Magnitude > radius * 1.15 + 2.5 or os.clock() - lastHit < HIT_COOLDOWN then
			return
		end
		lastHit = os.clock()
		hp -= 1

		-- ¡Rebote! Te empuja hacia afuera y hacia arriba
		local away = Vector3.new(offset.X, 0, offset.Z)
		away = if away.Magnitude > 0.1 then away.Unit else Vector3.new(-1, 0, 0)
		rt.bounce(away * cfg.Rebote + Vector3.new(0, cfg.Rebote * 0.8, 0))

		local contact = body.Position + offset.Unit * radius
		local progress = 1 - hp / cfg.Golpes
		rt.fx("golpeGigante", contact, progress, rt.player.UserId)

		if hp <= 0 then
			rt.fx("explosion", body.Position, body.Size.X, body.Color)
			model:Destroy()
		else
			-- Se infla y se pone rojo
			local grow = 1 + cfg.Crecimiento
			body.Size *= grow
			body.CFrame = CFrame.new(handle.center + Vector3.new(0, body.Size.Y / 2 + 0.5, 0))
			body.Color = startColor:Lerp(DANGER, progress)
			local shine = model:FindFirstChild("Brillo") :: BasePart?
			if shine then
				local d = body.Size.X
				shine.Size = Vector3.one * d * 0.22
				shine.CFrame = body.CFrame + Vector3.new(-d * 0.28, d * 0.3, -d * 0.18)
			end
		end
		rt.hit(contact, body.Color, 1.5)
	end

	return { goal = cfg.Golpes, update = update }
end

return Gigante
```

## `src/Stages/Huidizos.luau`

```lua
--[[
	ETAPA: GLOBOS HUIDIZOS
	¡Los globos se escapan cuando te acercas! Son más lentos que tú:
	acorrálalos contra las paredes para atraparlos.
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Huidizos = {}

Huidizos.Title = "Globos huidizos"
Huidizos.Hint = "¡Se escapan! Acorrálalos contra las paredes"

local HEIGHT = 2.8

function Huidizos.length(): number
	return 44
end

function Huidizos.build(ctx)
	-- Postes bajos en las esquinas: marcan el corral
	for _, cx in { ctx.x0 + 3, ctx.x0 + Huidizos.length() - 3 } do
		for _, side in { -1, 1 } do
			Util.cylinder(Vector3.new(cx, ctx.floor + 1.5, ctx.z + side * (ctx.width / 2 - 2)), 3, 1.2, {
				Name = "Poste",
				Color = Color3.fromRGB(255, 150, 60),
				Parent = ctx.folder,
			})
		end
	end
	return {
		x0 = ctx.x0 + 4,
		x1 = ctx.x0 + Huidizos.length() - 4,
		z0 = ctx.z - ctx.width / 2 + 2,
		z1 = ctx.z + ctx.width / 2 - 2,
		floor = ctx.floor,
	}
end

function Huidizos.start(handle, rt)
	local cfg = Config.Huidizos
	local runners = {} -- [Model] = { pos: Vector3, wander: Vector3 }

	for _ = 1, cfg.Globos do
		local pos = Vector3.new(
			rt.rng:NextNumber(handle.x0 + 8, handle.x1),
			handle.floor + HEIGHT,
			rt.rng:NextNumber(handle.z0, handle.z1)
		)
		local model = rt.addBalloon(pos, { noBob = true })
		local a = rt.rng:NextNumber(0, math.pi * 2)
		runners[model] = { pos = pos, wander = Vector3.new(math.cos(a), 0, math.sin(a)) }
	end

	local MOVE_STEP = 0.05 -- movemos los globos 20 veces por segundo (menos datos por la red)
	local accumulated = 0

	local function update(frameDt: number, root: BasePart, inside: boolean)
		if not inside then
			return -- nadie los mira: no gastamos red moviéndolos
		end
		accumulated += frameDt
		if accumulated < MOVE_STEP then
			return
		end
		local dt = accumulated
		accumulated = 0
		local me = root.Position
		for model, r in runners do
			if not model.Parent then
				runners[model] = nil
				continue
			end
			local away = Vector3.new(r.pos.X - me.X, 0, r.pos.Z - me.Z)
			local velocity
			if away.Magnitude < cfg.DistanciaSusto then
				-- ¡Huye! (más lento que tú, así que puedes alcanzarlo)
				velocity = away.Unit * cfg.VelocidadHuida + r.wander * 3
			else
				velocity = r.wander * cfg.VelocidadPaseo
			end
			local newPos = r.pos + velocity * dt
			-- Rebota en los bordes del corral
			if newPos.X < handle.x0 or newPos.X > handle.x1 then
				r.wander = Vector3.new(-r.wander.X, 0, r.wander.Z)
				newPos = Vector3.new(math.clamp(newPos.X, handle.x0, handle.x1), newPos.Y, newPos.Z)
			end
			if newPos.Z < handle.z0 or newPos.Z > handle.z1 then
				r.wander = Vector3.new(r.wander.X, 0, -r.wander.Z)
				newPos = Vector3.new(newPos.X, newPos.Y, math.clamp(newPos.Z, handle.z0, handle.z1))
			end
			-- Saltitos para que se vea vivo
			local hop = math.abs(math.sin(os.clock() * 6 + r.wander.X * 3)) * 0.8
			r.pos = Vector3.new(newPos.X, handle.floor + HEIGHT, newPos.Z)
			rt.move(model, r.pos + Vector3.new(0, hop, 0))
		end
	end

	return { goal = cfg.Globos, update = update }
end

return Huidizos
```

## `src/Stages/Laberinto.luau`

```lua
--[[
	ETAPA: LABERINTO
	Pasillos en zigzag llenos de globos: corre y revienta todo con el cuerpo.
	Las esferas moradas dan SÚPER PODER (más rápido y explotas desde más lejos).
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Laberinto = {}

Laberinto.Title = "Laberinto"
Laberinto.Hint = "¡Corre y revienta todo! Agarra la esfera morada ⚡"

local CORRIDOR = 12
local GAP = 9
local WALL_H = 8
local BALLOON_Y = 2.6
local ORB_COLOR = Color3.fromRGB(190, 80, 255)

function Laberinto.length(): number
	return CORRIDOR * (Config.Laberinto.Paredes + 1)
end

function Laberinto.build(ctx)
	local cfg = Config.Laberinto
	local half = ctx.width / 2
	for k = 1, cfg.Paredes do
		local x = ctx.x0 + CORRIDOR * k
		local wallLen = ctx.width - GAP
		-- Alternamos el hueco: una pared lo deja a la derecha y la siguiente a la izquierda
		local zCenter = if k % 2 == 1 then ctx.z - half + wallLen / 2 else ctx.z + half - wallLen / 2
		Util.part({
			Name = "Pared",
			Size = Vector3.new(1.5, WALL_H, wallLen),
			CFrame = CFrame.new(x, ctx.floor + WALL_H / 2, zCenter),
			Color = Color3.fromRGB(190, 140, 90),
			Material = Enum.Material.WoodPlanks,
			Parent = ctx.folder,
		})
	end

	local corridors = {}
	for c = 0, cfg.Paredes do
		table.insert(corridors, ctx.x0 + CORRIDOR * c + CORRIDOR / 2)
	end

	return { corridors = corridors, z = ctx.z, half = half, floor = ctx.floor }
end

function Laberinto.start(handle, rt)
	local cfg = Config.Laberinto
	local total = 0
	local orbCorridors = { [2] = true, [5] = true }
	local orbs = {}

	for c, x in handle.corridors do
		local z = handle.z - handle.half + 2.5
		local slot = 0
		while z <= handle.z + handle.half - 2.5 do
			slot += 1
			local pos = Vector3.new(x, handle.floor + BALLOON_Y, z)
			if orbCorridors[c] and slot == 5 then
				local orb = Util.part({
					Name = "PoderMorado",
					Shape = Enum.PartType.Ball,
					Size = Vector3.new(3, 3, 3),
					CFrame = CFrame.new(pos + Vector3.new(0, 1, 0)),
					Color = ORB_COLOR,
					Material = Enum.Material.Neon,
					CanCollide = false,
					CanTouch = false,
					Parent = rt.folder,
				})
				local light = Instance.new("PointLight")
				light.Color = ORB_COLOR
				light.Range = 14
				light.Brightness = 3
				light.Parent = orb
				Util.billboard(orb, "⚡", 2.5, Color3.fromRGB(255, 230, 120)).Size = UDim2.fromScale(3, 3)
				table.insert(orbs, orb)
			else
				rt.addBalloon(pos, { size = 2.6 })
				total += 1
			end
			z += 3.2
		end
	end

	local function update(_dt: number, hrp: BasePart)
		for i = #orbs, 1, -1 do
			local orb = orbs[i]
			if (orb.Position - hrp.Position).Magnitude < 4 then
				table.remove(orbs, i)
				rt.fx("poder", orb.Position, rt.player.UserId)
				orb:Destroy()
				rt.powerUp(cfg.PoderDuracion)
			end
		end
	end

	return { goal = math.floor(total * cfg.Porcentaje), update = update }
end

return Laberinto
```

## `src/Stages/Lluvia.luau`

```lua
--[[
	ETAPA: LLUVIA DE GLOBOS
	Cuando entras, empiezan a caer globos del cielo (muchos cerca de ti).
	Atrápalos corriendo debajo de ellos.
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Lluvia = {}

Lluvia.Title = "Lluvia de globos"
Lluvia.Hint = "¡Atrapa los globos que caen del cielo!"

function Lluvia.length(): number
	return 44
end

function Lluvia.build(ctx)
	-- Piso de nubes para distinguir la zona
	for n = 0, 3 do
		Util.part({
			Name = "Nube",
			Size = Vector3.new(9, 0.1, ctx.width - 4),
			CFrame = CFrame.new(ctx.x0 + 6 + n * 10, ctx.floor + 0.05, ctx.z),
			Color = Color3.fromRGB(200, 225, 255),
			CanCollide = false,
			Parent = ctx.folder,
		})
	end
	return { x0 = ctx.x0 + 4, x1 = ctx.x0 + Lluvia.length() - 4, z = ctx.z, half = ctx.width / 2 - 3, floor = ctx.floor }
end

function Lluvia.start(handle, rt)
	local cfg = Config.Lluvia
	local falling = {} -- [Model] = posición actual
	local timer = 0

	local function spawnOne(near: Vector3?)
		local x, z
		if near and rt.rng:NextNumber() < 0.6 then
			x = math.clamp(near.X + rt.rng:NextNumber(-8, 8), handle.x0, handle.x1)
			z = math.clamp(near.Z + rt.rng:NextNumber(-8, 8), handle.z - handle.half, handle.z + handle.half)
		else
			x = rt.rng:NextNumber(handle.x0, handle.x1)
			z = handle.z + rt.rng:NextNumber(-handle.half, handle.half)
		end
		local pos = Vector3.new(x, handle.floor + cfg.Altura, z)
		local model = rt.addBalloon(pos, { noBob = true })
		falling[model] = pos
	end

	local MOVE_STEP = 0.05 -- 20 veces por segundo (menos datos por la red)
	local accumulated = 0

	local function update(frameDt: number, root: BasePart, inside: boolean)
		if not inside then
			return
		end
		accumulated += frameDt
		if accumulated < MOVE_STEP then
			return
		end
		local dt = accumulated
		accumulated = 0
		local alive = 0
		for model, pos in falling do
			if not model.Parent then
				falling[model] = nil
			else
				alive += 1
				local ground = handle.floor + 2.2
				if pos.Y > ground then
					local newPos = Vector3.new(pos.X, math.max(ground, pos.Y - cfg.VelocidadCaida * dt), pos.Z)
					falling[model] = newPos
					rt.move(model, newPos)
				end
			end
		end

		if rt.done() then
			return
		end
		timer -= dt
		if timer <= 0 and alive < cfg.MaximoEnPantalla then
			timer = cfg.Intervalo
			spawnOne(root.Position)
		end
	end

	return { goal = cfg.Meta, update = update }
end

return Lluvia
```

## `src/Stages/Neumaticos.luau`

```lua
--[[
	ETAPA: NEUMÁTICOS
	Llantas en el piso; algunas esconden un globo. ¡Písalos!
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Neumaticos = {}

Neumaticos.Title = "Neumáticos"
Neumaticos.Hint = "¡Pisa los globos escondidos en las llantas!"

local TIRE_COLOR = Color3.fromRGB(35, 35, 40)
local TIRE_RADIUS = 2.6
local SPACING_X = 12

function Neumaticos.length(): number
	return Config.Neumaticos.Filas * SPACING_X + 8
end

local function buildTire(folder: Instance, center: Vector3)
	local sides = 10
	local sideLength = 2 * TIRE_RADIUS * math.tan(math.pi / sides) + 0.35
	for k = 0, sides - 1 do
		local a = k / sides * math.pi * 2
		Util.part({
			Name = "Llanta",
			Size = Vector3.new(1.3, 1, sideLength),
			CFrame = CFrame.new(center + Vector3.new(math.cos(a) * TIRE_RADIUS, 0.5, math.sin(a) * TIRE_RADIUS))
				* CFrame.Angles(0, -a, 0),
			Color = TIRE_COLOR,
			Parent = folder,
		})
	end
end

function Neumaticos.build(ctx)
	local cfg = Config.Neumaticos
	local handle = { tires = {} }
	local spacingZ = (ctx.width - 6) / cfg.Columnas
	for row = 1, cfg.Filas do
		for col = 1, cfg.Columnas do
			local x = ctx.x0 + 4 + (row - 0.5) * SPACING_X + ctx.rng:NextNumber(-1.5, 1.5)
			local z = ctx.z - ctx.width / 2 + 3 + (col - 0.5) * spacingZ + ctx.rng:NextNumber(-1, 1)
			local center = Vector3.new(x, ctx.floor, z)
			buildTire(ctx.folder, center)
			table.insert(handle.tires, center)
		end
	end
	return handle
end

function Neumaticos.start(handle, rt)
	-- Elegimos al azar qué llantas tienen globo (igual para los dos jugadores)
	local order = table.clone(handle.tires)
	for i = #order, 2, -1 do
		local j = rt.rng:NextInteger(1, i)
		order[i], order[j] = order[j], order[i]
	end
	local count = math.min(Config.Neumaticos.ConGlobo, #order)
	for i = 1, count do
		rt.addBalloon(order[i] + Vector3.new(0, 1.4, 0), { size = 2.4, noString = true })
	end
	return { goal = count }
end

return Neumaticos
```

## `src/Stages/Trampolines.luau`

```lua
--[[
	ETAPA: TRAMPOLINES
	Pisa un trampolín y sales volando hacia arriba, reventando la torre de
	globos que tiene encima. (El salto lo aplica el cliente: ver UI.client.luau)
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Trampolines = {}

Trampolines.Title = "Trampolines"
Trampolines.Hint = "¡Pisa los trampolines y vuela!"
Trampolines.TAG = "TrampolinCarrera"

local SPACING = 10

function Trampolines.length(): number
	return Config.Trampolines.Cantidad * SPACING + 8
end

function Trampolines.build(ctx)
	local cfg = Config.Trampolines
	local pads = {}
	for k = 1, cfg.Cantidad do
		local x = ctx.x0 + 4 + (k - 0.5) * SPACING
		local z = ctx.z + (if k % 2 == 1 then -6 else 6)
		local center = Vector3.new(x, ctx.floor, z)
		Util.cylinder(center + Vector3.new(0, 0.3, 0), 0.6, 7, {
			Name = "BaseTrampolin",
			Color = Color3.fromRGB(40, 40, 50),
			Parent = ctx.folder,
		})
		local pad = Util.cylinder(center + Vector3.new(0, 0.7, 0), 0.25, 5.5, {
			Name = "Trampolin",
			Color = Color3.fromRGB(90, 255, 120),
			Material = Enum.Material.Neon,
			Parent = ctx.folder,
		})
		pad:SetAttribute("Fuerza", cfg.Fuerza)
		pad:AddTag(Trampolines.TAG)
		table.insert(pads, center)
	end
	return { pads = pads, floor = ctx.floor }
end

function Trampolines.start(handle, rt)
	local cfg = Config.Trampolines
	local total = 0
	for _, center in handle.pads do
		for n = 1, cfg.GlobosPorTrampolin do
			rt.addBalloon(center + Vector3.new(0, 2 + n * 5, 0), {})
			total += 1
		end
	end
	return { goal = total }
end

return Trampolines
```

## `src/Tablas.luau`

```lua
--[[
	TABLAS DE LÍDERES del lobby: 🏆 Más Wins · ⏱ Mejores tiempos · 🎈 Más globos
	Son globales (todos los servidores) usando OrderedDataStore. Si DataStore no
	está disponible (por ejemplo en Studio sin «API Services»), muestran a los
	jugadores de este servidor.
]]

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local Config = require(script.Parent.Config)
local Datos = require(script.Parent.Datos)
local Util = require(script.Parent.Util)

local Tablas = {}

local ROWS = 10
local REFRESH = 60 -- segundos entre actualizaciones
local MEDALS = { "🥇", "🥈", "🥉" }

type Board = {
	id: string,
	title: string,
	color: Color3,
	ascending: boolean,
	format: (number) -> string,
	store: OrderedDataStore?,
	rows: { TextLabel },
}

local boards: { [string]: Board } = {}
local nameCache: { [number]: string } = {}

local function formatTime(ms: number): string
	local seconds = ms / 1000
	return string.format("%d:%05.2f", seconds // 60, seconds % 60)
end

local function nameOf(userId: number): string
	if nameCache[userId] then
		return nameCache[userId]
	end
	local ok, name = pcall(function()
		return Players:GetNameFromUserIdAsync(userId)
	end)
	local result = if ok and name then name else "Jugador"
	nameCache[userId] = result
	return result
end

local function buildBoard(parent: Instance, cframe: CFrame, board: Board)
	local part = Util.part({
		Name = "Tabla_" .. board.id,
		Size = Vector3.new(14, 15, 1),
		CFrame = cframe,
		Color = Color3.fromRGB(40, 25, 80),
		Parent = parent,
	})
	local gui = Instance.new("SurfaceGui")
	gui.Face = Enum.NormalId.Back
	gui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud
	gui.PixelsPerStud = 30
	gui.LightInfluence = 0
	gui.Parent = part

	local layout = Instance.new("UIListLayout")
	layout.Padding = UDim.new(0, 4)
	layout.HorizontalAlignment = Enum.HorizontalAlignment.Center
	layout.Parent = gui
	local padding = Instance.new("UIPadding")
	padding.PaddingTop = UDim.new(0, 12)
	padding.Parent = gui

	local title = Instance.new("TextLabel")
	title.Size = UDim2.new(1, -20, 0, 56)
	title.BackgroundTransparency = 1
	title.Font = Enum.Font.FredokaOne
	title.TextScaled = true
	title.Text = board.title
	title.TextColor3 = board.color
	title.TextStrokeTransparency = 0
	title.Parent = gui

	for i = 1, ROWS do
		local row = Instance.new("TextLabel")
		row.Size = UDim2.new(1, -30, 0, 34)
		row.BackgroundColor3 = if i % 2 == 0 then Color3.fromRGB(60, 40, 110) else Color3.fromRGB(75, 50, 135)
		row.BackgroundTransparency = 0.2
		row.Font = Enum.Font.FredokaOne
		row.TextScaled = true
		row.TextColor3 = if i <= 3 then Color3.fromRGB(255, 225, 120) else Color3.new(1, 1, 1)
		row.TextXAlignment = Enum.TextXAlignment.Left
		row.Text = ""
		row.LayoutOrder = i
		local corner = Instance.new("UICorner")
		corner.CornerRadius = UDim.new(0, 8)
		corner.Parent = row
		row.Parent = gui
		table.insert(board.rows, row)
	end
	title.LayoutOrder = 0
end

local function render(board: Board, entries: { { userId: number, value: number } })
	for i, row in board.rows do
		local entry = entries[i]
		if entry then
			local rank = MEDALS[i] or ("#" .. i)
			row.Text = string.format("  %s  %s — %s", rank, nameOf(entry.userId), board.format(entry.value))
		else
			row.Text = if i == 1 then "  ¡Sé el primero!" else ""
		end
	end
end

-- Valor de este jugador para cada tabla (para el modo sin DataStore)
local function localValue(player: Player, id: string): number?
	if id == "Tiempos" then
		local best = player:GetAttribute("MejorTiempo")
		return if type(best) == "number" then math.floor(best * 1000) else nil
	end
	return Datos.get(player, id)
end

local function refresh(board: Board)
	local entries = {}
	local store = board.store
	local ok = false
	if store then
		ok = pcall(function()
			local pages = store:GetSortedAsync(board.ascending, ROWS)
			for _, item in pages:GetCurrentPage() do
				local userId = tonumber(item.key)
				if userId then
					table.insert(entries, { userId = userId, value = item.value })
				end
			end
		end)
	end
	if not ok then
		entries = {}
		for _, player in Players:GetPlayers() do
			local value = localValue(player, board.id)
			if value and value > 0 then
				table.insert(entries, { userId = player.UserId, value = value })
			end
		end
		table.sort(entries, function(a, b)
			return if board.ascending then a.value < b.value else a.value > b.value
		end)
	end
	render(board, entries)
end

local function write(id: string, player: Player, value: number, onlyIfBetter: boolean)
	local board = boards[id]
	local store = board and board.store
	if not store or value <= 0 or not Datos.loaded(player) then
		return
	end
	task.spawn(function()
		pcall(function()
			store:UpdateAsync(tostring(player.UserId), function(old)
				if onlyIfBetter and type(old) == "number" and old <= value then
					return nil -- no es mejor: no cambiamos nada
				end
				return math.floor(value)
			end)
		end)
	end)
end

function Tablas.saveWins(player: Player)
	write("Wins", player, Datos.get(player, "Wins"), false)
end

function Tablas.saveGlobos(player: Player)
	write("Globos", player, Datos.get(player, "Globos"), false)
end

-- Guarda un tiempo de carrera. Devuelve true si es un nuevo récord personal.
function Tablas.recordTime(player: Player, seconds: number): boolean
	local best = player:GetAttribute("MejorTiempo")
	local isRecord = type(best) ~= "number" or seconds < best
	if isRecord then
		player:SetAttribute("MejorTiempo", seconds)
		write("Tiempos", player, seconds * 1000, true)
	end
	return isRecord
end

function Tablas.init(lobby: Instance)
	local definitions = {
		{ id = "Wins", title = "🏆 MÁS WINS", color = Color3.fromRGB(255, 205, 40), ascending = false, format = tostring },
		{ id = "Tiempos", title = "⏱ MEJORES TIEMPOS", color = Color3.fromRGB(120, 220, 255), ascending = true, format = formatTime },
		{ id = "Globos", title = "🎈 MÁS GLOBOS", color = Color3.fromRGB(255, 120, 200), ascending = false, format = tostring },
	}
	local O = Config.Origen
	for i, def in definitions do
		local store: OrderedDataStore? = nil
		if Config.GuardarProgreso then
			local ok, result = pcall(function()
				return DataStoreService:GetOrderedDataStore("CarreraGlobos_" .. def.id .. "_v1")
			end)
			if ok then
				store = result
			end
		end
		local board: Board = {
			id = def.id,
			title = def.title,
			color = def.color,
			ascending = def.ascending,
			format = def.format,
			store = store,
			rows = {},
		}
		boards[def.id] = board
		-- Tablas en la pared norte del lobby, mirando hacia el centro
		buildBoard(lobby, CFrame.new(O + Vector3.new(-18 + (i - 1) * 16, 8.5, -31.5)), board)
	end

	Players.PlayerRemoving:Connect(Tablas.saveGlobos)
	task.spawn(function()
		while true do
			for _, board in boards do
				refresh(board)
			end
			task.wait(REFRESH)
		end
	end)
end

-- Fuerza una actualización (por ejemplo, justo después de una carrera)
function Tablas.refreshSoon()
	task.delay(3, function()
		for _, board in boards do
			refresh(board)
		end
	end)
end

return Tablas
```

## `src/Util.luau`

```lua
-- Utilidades para construir piezas del mapa.

local Util = {}

-- Crea una Part anclada con las propiedades dadas. «Parent» se asigna al final.
function Util.part(props: { [string]: any }): Part
	local p = Instance.new("Part")
	p.Anchored = true
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.Material = Enum.Material.SmoothPlastic
	local parent = props.Parent
	for key, value in props do
		if key ~= "Parent" then
			(p :: any)[key] = value
		end
	end
	p.Parent = parent
	return p
end

-- Cilindro vertical (los cilindros de Roblox están acostados sobre X).
function Util.cylinder(center: Vector3, height: number, diameter: number, props: { [string]: any }): Part
	props.Shape = Enum.PartType.Cylinder
	props.Size = Vector3.new(height, diameter, diameter)
	props.CFrame = CFrame.new(center) * CFrame.Angles(0, 0, math.rad(90))
	return Util.part(props)
end

-- Cartel flotante con texto grande.
function Util.billboard(adornee: BasePart, text: string, offsetY: number, color: Color3?): BillboardGui
	local gui = Instance.new("BillboardGui")
	gui.Size = UDim2.fromScale(10, 2.5)
	gui.StudsOffset = Vector3.new(0, offsetY, 0)
	gui.LightInfluence = 0
	gui.MaxDistance = 150
	local label = Instance.new("TextLabel")
	label.Name = "Texto"
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Font = Enum.Font.FredokaOne
	label.TextScaled = true
	label.Text = text
	label.TextColor3 = color or Color3.new(1, 1, 1)
	label.TextStrokeTransparency = 0
	label.Parent = gui
	gui.Parent = adornee
	return gui
end

-- Texto pegado a una cara de una pieza (carteles de puertas, letreros).
function Util.surfaceText(part: BasePart, face: Enum.NormalId, text: string): TextLabel
	local gui = Instance.new("SurfaceGui")
	gui.Face = face
	gui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud
	gui.PixelsPerStud = 30
	gui.LightInfluence = 0
	local label = Instance.new("TextLabel")
	label.Name = "Texto"
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Font = Enum.Font.FredokaOne
	label.TextScaled = true
	label.Text = text
	label.TextColor3 = Color3.new(1, 1, 1)
	label.TextStrokeTransparency = 0
	label.Parent = gui
	gui.Parent = part
	return label
end

return Util
```

## `tools/build.py`

```python
#!/usr/bin/env python3
"""Empaqueta src/ en CarreraDeGlobos.rbxmx (para «Insert from File» en Roblox Studio)
y genera sourcemap.json (para revisar el código con luau-lsp).

Uso:  python3 tools/build.py
"""
import json
import os
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
OUT = os.path.join(ROOT, "CarreraDeGlobos.rbxmx")
SOURCEMAP = os.path.join(ROOT, "sourcemap.json")

counter = 0


def ref():
    global counter
    counter += 1
    return f"RBX{counter:08X}"


def script_kind(filename):
    """Devuelve (clase, nombre) siguiendo las convenciones de Rojo."""
    base = filename[: -len(".luau")]
    if base.endswith(".server"):
        return "Script", base[: -len(".server")]
    if base.endswith(".client"):
        return "LocalScript", base[: -len(".client")]
    return "ModuleScript", base


def prop_xml(name, value):
    if isinstance(value, bool):
        return f'<bool name="{name}">{"true" if value else "false"}</bool>'
    if isinstance(value, str):
        return f'<string name="{name}">{escape(value)}</string>'
    raise ValueError(f"Propiedad no soportada: {name}={value!r}")


def build_dir(path, name):
    """Devuelve (xml, sourcemap_node) de una carpeta."""
    class_name, props = "Folder", {}
    meta = os.path.join(path, "init.meta.json")
    if os.path.exists(meta):
        with open(meta, encoding="utf-8") as f:
            data = json.load(f)
        class_name = data.get("className", "Folder")
        props = data.get("properties", {})

    children_xml, children_map = [], []
    for entry in sorted(os.listdir(path)):
        full = os.path.join(path, entry)
        if os.path.isdir(full):
            x, m = build_dir(full, entry)
        elif entry.endswith(".luau"):
            x, m = build_script(full, entry)
        else:
            continue
        children_xml.append(x)
        children_map.append(m)

    props_xml = prop_xml("Name", name) + "".join(prop_xml(k, v) for k, v in props.items())
    xml = f'<Item class="{class_name}" referent="{ref()}"><Properties>{props_xml}</Properties>{"".join(children_xml)}</Item>'
    node = {"name": name, "className": class_name, "children": children_map}
    if os.path.exists(meta):
        node["filePaths"] = [os.path.relpath(meta, ROOT)]
    return xml, node


def build_script(path, filename):
    class_name, name = script_kind(filename)
    with open(path, encoding="utf-8") as f:
        source = f.read()
    if "]]>" in source:
        raise ValueError(f"{path} contiene ']]>' y no se puede meter en CDATA")
    xml = (
        f'<Item class="{class_name}" referent="{ref()}"><Properties>'
        f"{prop_xml('Name', name)}"
        f'<ProtectedString name="Source"><![CDATA[{source}]]></ProtectedString>'
        f"</Properties></Item>"
    )
    node = {"name": name, "className": class_name, "filePaths": [os.path.relpath(path, ROOT)]}
    return xml, node


def main():
    xml, node = build_dir(SRC, "CarreraGlobos")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write('<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" '
                'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
                'xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">')
        f.write(xml)
        f.write("</roblox>\n")

    sourcemap = {
        "name": "CarreraDeGlobos",
        "className": "DataModel",
        "children": [{"name": "ServerScriptService", "className": "ServerScriptService", "children": [node]}],
    }
    with open(SOURCEMAP, "w", encoding="utf-8") as f:
        json.dump(sourcemap, f, indent=1)
    print(f"Listo: {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
```

## `tools/make_context.py`

````python
#!/usr/bin/env python3
"""Genera CONTEXTO_COMPLETO.md: un solo archivo con todo lo necesario para que
otra conversación de Claude siga trabajando (contexto + plan + todo el código).

Uso:  python3 tools/make_context.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "CONTEXTO_COMPLETO.md")

DOCS = ["CLAUDE.md", "PLAN.md", "PRUEBAS.md"]
CODE_DIRS = ["src", "tools"]
EXTRA = ["default.project.json", ".gitignore"]
LANG = {".luau": "lua", ".py": "python", ".json": "json", ".md": "markdown"}

INTRO = """# 🎈 Carrera de Globos — CONTEXTO COMPLETO para Claude

> **Para Claude:** este archivo trae todo lo necesario para seguir trabajando en el juego:
> quién es el usuario y qué quiere, cómo está hecho, cómo verificarlo y **el código completo**.
> 1. Lee primero «CLAUDE.md» (abajo).
> 2. Para reconstruir el proyecto, crea cada archivo de la sección «Código» con su ruta exacta.
> 3. Corre `python3 tools/build.py` para generar `CarreraDeGlobos.rbxmx`, lo que el usuario mete en Roblox Studio.
>
> Repo original: `cairovega-desing/local-cairo`, rama `ccr-f9dac4e9-zok3mj`.
> Los sonidos (`sounds/*.wav`) no van incluidos porque son binarios: se regeneran con
> `tools/make_sounds.py` y `tools/make_music.py` (necesitan numpy).

"""


def fence(text):
    # Usa una cerca más larga que cualquier secuencia de ``` dentro del texto
    longest = 3
    run = 0
    for ch in text:
        run = run + 1 if ch == "`" else 0
        longest = max(longest, run + 1)
    return "`" * longest


def main():
    parts = [INTRO]
    for doc in DOCS:
        path = os.path.join(ROOT, doc)
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                body = f.read()
            parts.append(f"\n---\n\n# 📄 {doc}\n\n")
            # Bajamos un nivel los títulos para que no se mezclen con los del contexto
            parts.append("\n".join("#" + line if line.startswith("#") else line for line in body.splitlines()))
            parts.append("\n")

    files = []
    for d in CODE_DIRS:
        for base, _, names in os.walk(os.path.join(ROOT, d)):
            for name in names:
                if name.endswith((".luau", ".py", ".json")):
                    files.append(os.path.relpath(os.path.join(base, name), ROOT))
    files = sorted(files) + [e for e in EXTRA if os.path.exists(os.path.join(ROOT, e))]

    parts.append("\n---\n\n# 💾 Código (crea cada archivo con esta ruta exacta)\n\n")
    parts.append("Archivos:\n" + "\n".join(f"- `{p}`" for p in files) + "\n")
    for rel in files:
        with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
            code = f.read()
        lang = LANG.get(os.path.splitext(rel)[1], "")
        mark = fence(code)
        parts.append(f"\n## `{rel}`\n\n{mark}{lang}\n{code.rstrip()}\n{mark}\n")

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("".join(parts))
    print(f"Listo: {os.path.relpath(OUT, ROOT)} ({os.path.getsize(OUT) // 1024} KB, {len(files)} archivos de código)")


if __name__ == "__main__":
    main()
````

## `tools/make_music.py`

```python
#!/usr/bin/env python3
"""Genera la música de fondo (loops perfectos) en sounds/:
  musica_carrera.wav  chiptune alegre y rápida (140 BPM)
  musica_lobby.wav    versión tranquila (100 BPM)
El juego acelera la de carrera en la última etapa (Config.Musica).

Uso:  pip install numpy && python3 tools/make_music.py
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sounds")
rng = np.random.default_rng(3)

# Progresión feliz: Do - Sol - Lam - Fa (I–V–vi–IV)
CHORDS = [
    [60, 64, 67, 72],  # Do
    [55, 59, 62, 67],  # Sol
    [57, 60, 64, 69],  # Lam
    [53, 57, 60, 65],  # Fa
]
# Melodía (semitonos MIDI) por compás, en corcheas; None = silencio
HOOK = [
    [76, None, 79, 76, 74, None, 72, 74],
    [74, None, 71, 74, 79, None, 74, None],
    [72, None, 76, 72, 81, 79, 76, None],
    [77, None, 76, 74, 72, None, 74, None],
]


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def env(n, attack, decay_tau, release=0.01):
    x = np.arange(n) / SR
    e = np.clip(x / max(attack, 1e-5), 0, 1) * np.exp(-x / decay_tau)
    r = int(SR * release)
    if r and n > r:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def pulse(freq, n, duty=0.25):
    phase = (np.arange(n) * freq / SR) % 1.0
    return np.where(phase < duty, 1.0, -1.0)


def tri(freq, n):
    phase = (np.arange(n) * freq / SR) % 1.0
    return 4 * np.abs(phase - 0.5) - 1


def smooth(x, k=6):
    """Suaviza un poco (quita el «chirrido» de las ondas cuadradas)."""
    kernel = np.ones(k) / k
    return np.convolve(x, kernel, mode="same")


class Track:
    def __init__(self, seconds):
        self.buf = np.zeros(int(SR * seconds))

    def add(self, start_s, sig, gain):
        start = int(SR * start_s)
        idx = (np.arange(len(sig)) + start) % len(self.buf)  # lo que sobra vuelve al inicio: loop perfecto
        np.add.at(self.buf, idx, sig * gain)


def kick(n):
    x = np.arange(n) / SR
    freq = 50 + 110 * np.exp(-x / 0.03)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-x / 0.12)


def snare(n):
    x = np.arange(n) / SR
    noise = rng.uniform(-1, 1, n)
    return (noise * 0.8 + np.sin(2 * np.pi * 190 * x) * 0.4) * np.exp(-x / 0.06)


def hat(n):
    noise = rng.uniform(-1, 1, n)
    noise = noise - np.convolve(noise, np.ones(4) / 4, mode="same")  # solo agudos
    return noise * np.exp(-np.arange(n) / SR / 0.018)


def render(bpm, bars, energetic):
    beat = 60 / bpm
    eighth = beat / 2
    bar_len = beat * 4
    track = Track(bar_len * bars)

    for b in range(bars):
        chord = CHORDS[b % 4]
        t0 = b * bar_len

        # Bajo: corcheas saltando entre raíz y octava
        root = chord[0] - 24
        for k in range(8):
            note = root + (12 if k % 2 else 0)
            n = int(SR * eighth * 0.9)
            sig = smooth(pulse(midi(note), n, 0.5), 10) * env(n, 0.003, 0.18)
            track.add(t0 + k * eighth, sig, 0.30 if energetic else 0.22)

        # Colchón suave del acorde (triangular)
        n = int(SR * bar_len)
        pad = sum(tri(midi(note), n) for note in chord[:3]) / 3
        track.add(t0, pad * env(n, 0.08, 2.5, 0.2), 0.10)

        if energetic:
            # Arpegio rápido en semicorcheas (primera mitad) + melodía (segunda mitad)
            if b < bars // 2:
                pattern = [0, 1, 2, 3, 2, 1, 2, 3] * 2
                for k, idx in enumerate(pattern):
                    n = int(SR * eighth / 2 * 0.85)
                    sig = smooth(pulse(midi(chord[idx] + 12), n, 0.25), 4) * env(n, 0.002, 0.08)
                    track.add(t0 + k * eighth / 2, sig, 0.12)
            else:
                for k, note in enumerate(HOOK[b % 4]):
                    if note is None:
                        continue
                    n = int(SR * eighth * 0.95)
                    sig = smooth(pulse(midi(note), n, 0.25), 4) * env(n, 0.004, 0.25)
                    track.add(t0 + k * eighth, sig, 0.16)
            # Batería
            for k in range(4):
                track.add(t0 + k * beat, kick(int(SR * 0.25)), 0.85 if k % 2 == 0 else 0.6)
                if k % 2 == 1:
                    track.add(t0 + k * beat, snare(int(SR * 0.2)), 0.35)
            for k in range(8):
                track.add(t0 + k * eighth, hat(int(SR * 0.05)), 0.12 if k % 2 else 0.07)
        else:
            # Lobby: marimba tranquila con la melodía y un «tic» suave
            for k, note in enumerate(HOOK[b % 4]):
                if note is None:
                    continue
                n = int(SR * 0.6)
                x = np.arange(n) / SR
                bell = np.sin(2 * np.pi * midi(note) * x) + 0.3 * np.sin(2 * np.pi * midi(note) * 4 * x) * np.exp(-x / 0.03)
                track.add(t0 + k * eighth, bell * env(n, 0.002, 0.22), 0.16)
            for k in range(4):
                track.add(t0 + k * beat, kick(int(SR * 0.2)), 0.35 if k == 0 else 0.2)
                track.add(t0 + k * beat + eighth, hat(int(SR * 0.04)), 0.05)

    out = np.tanh(track.buf * 1.3)
    return out / (np.max(np.abs(out)) + 1e-9) * 0.85


def save(name, signal):
    path = os.path.join(OUT, name + ".wav")
    with wave.open(path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((signal * 32767).astype(np.int16).tobytes())
    print("  ", os.path.relpath(path), f"({len(signal) / SR:.1f} s)")


def main():
    os.makedirs(OUT, exist_ok=True)
    print("Generando música:")
    save("musica_carrera", render(bpm=140, bars=16, energetic=True))
    save("musica_lobby", render(bpm=100, bars=8, energetic=False))


if __name__ == "__main__":
    main()
```

## `tools/make_sounds.py`

```python
#!/usr/bin/env python3
"""Genera los sonidos del juego (WAV 44.1 kHz) en la carpeta sounds/.
Súbelos a Roblox (create.roblox.com → Audio) y pega los IDs en Config.Sonidos.

Uso:  pip install numpy && python3 tools/make_sounds.py
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sounds")
rng = np.random.default_rng(7)


def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def env(length, attack, tau):
    x = t(length)
    a = np.clip(x / max(attack, 1e-5), 0, 1)
    return a * np.exp(-x / tau)


def sweep(f0, f1, length, curve=1.0):
    """Seno cuyo tono va de f0 a f1 (curva exponencial)."""
    x = t(length) / length
    freq = f0 * (f1 / f0) ** (x**curve)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR)


def bell(freq, length, tau=0.25, bright=0.35):
    """Nota tipo marimba/campanita: fundamental + parciales que se apagan rápido."""
    x = t(length)
    tone = np.sin(2 * np.pi * freq * x)
    tone += bright * np.sin(2 * np.pi * freq * 4.0 * x) * np.exp(-x / (tau * 0.15))
    tone += 0.25 * np.sin(2 * np.pi * freq * 2.0 * x) * np.exp(-x / (tau * 0.5))
    return tone * env(length, 0.002, tau)


def noise(length):
    return rng.uniform(-1, 1, int(SR * length))


def highpass(x, amount=0.97):
    y = np.zeros_like(x)
    prev_x = prev_y = 0.0
    for i, v in enumerate(x):
        prev_y = amount * (prev_y + v - prev_x)
        prev_x = v
        y[i] = prev_y
    return y


def lowpass(x, amount=0.1):
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += amount * (v - acc)
        y[i] = acc
    return y


def mix(length, *parts):
    out = np.zeros(int(SR * length))
    for offset, sig in parts:
        start = int(SR * offset)
        end = min(len(out), start + len(sig))
        out[start:end] += sig[: end - start]
    return out


def save(name, signal, drive=1.4):
    signal = np.tanh(signal * drive)  # saturación suave: más «gordo», sin picos
    fade = min(len(signal), int(SR * 0.01))
    signal[-fade:] *= np.linspace(1, 0, fade)
    signal = signal / (np.max(np.abs(signal)) + 1e-9) * 0.92
    data = (signal * 32767).astype(np.int16)
    path = os.path.join(OUT, name + ".wav")
    with wave.open(path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(data.tobytes())
    print("  ", os.path.relpath(path))


def note(semitones_from_c5):
    return 523.25 * 2 ** (semitones_from_c5 / 12)


def main():
    os.makedirs(OUT, exist_ok=True)
    print("Generando sonidos:")

    # POP: chasquido brillante + golpe grave de goma + brillo agudo + aire
    L = 0.32
    snap = highpass(noise(L), 0.9) * env(L, 0.0004, 0.010)
    thump = sweep(460, 120, L, 0.5) * env(L, 0.001, 0.035) * 0.9
    shine = np.sin(2 * np.pi * 2300 * t(L)) * env(L, 0.0005, 0.012) * 0.18
    air = lowpass(noise(L), 0.15) * env(L, 0.002, 0.07) * 0.35
    save("pop", snap + thump + shine + air, drive=1.8)

    # NOTA: marimba en Do5 (el juego la sube por una escala pentatónica)
    save("nota", bell(note(0), 0.7, tau=0.22), drive=1.1)

    # DORADO: arpegio rápido de campanitas + brillo
    L = 0.9
    arp = [(i * 0.055, bell(note(12 + s), 0.6, tau=0.25)) for i, s in enumerate([0, 4, 7, 12, 16])]
    sparkle = highpass(noise(L), 0.98) * env(L, 0.01, 0.25) * 0.08
    save("dorado", mix(L, *arp, (0, sparkle)))

    # COMBO: acorde brillante que sube un poquito de tono
    L = 0.7
    chord = sum(sweep(note(s), note(s) * 1.06, L) for s in [0, 4, 7, 12]) * env(L, 0.005, 0.25)
    save("combo", chord + highpass(noise(L), 0.98) * env(L, 0.002, 0.1) * 0.1)

    # CUENTA y ¡YA!
    L = 0.18
    beep = (np.sin(2 * np.pi * 660 * t(L)) + 0.25 * np.sin(2 * np.pi * 1980 * t(L))) * env(L, 0.003, 0.08)
    save("cuenta", beep, drive=1.2)
    L = 0.5
    go = mix(L, (0, bell(988, 0.5, tau=0.2, bright=0.5)), (0.06, bell(1318, 0.44, tau=0.25, bright=0.5)))
    save("ya", go)

    # PUERTA: «fiuuu» + arpegio triunfal
    L = 1.0
    whoosh = highpass(noise(L), 0.8) * np.sin(np.pi * np.clip(t(L) / 0.45, 0, 1)) * 0.25
    fanfare = [(0.05 + i * 0.08, bell(note(s), 0.7, tau=0.3)) for i, s in enumerate([0, 4, 7, 12])]
    save("puerta", mix(L, (0, whoosh), *fanfare))

    # PODER: barrido hacia arriba con vibrato
    L = 0.8
    x = t(L)
    freq = 220 * (8 ** (x / L)) * (1 + 0.03 * np.sin(2 * np.pi * 18 * x))
    power = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    power += 0.3 * np.sign(power) * 0.5
    save("poder", power * env(L, 0.01, 0.6) + highpass(noise(L), 0.98) * env(L, 0.2, 0.3) * 0.08)

    # DISPARO: «fiu» corto
    L = 0.1
    save("disparo", sweep(2200, 500, L) * env(L, 0.001, 0.03) + highpass(noise(L), 0.9) * env(L, 0.0005, 0.01) * 0.4)

    # VICTORIA: fanfarria
    L = 1.6
    brass = lambda f, length: sum(np.sin(2 * np.pi * f * k * t(length)) / k for k in (1, 3, 5)) * env(length, 0.01, 0.5)
    parts = [(0.0, brass(note(0), 0.2)), (0.16, brass(note(4), 0.2)), (0.32, brass(note(7), 0.2)), (0.48, brass(note(12), 1.1))]
    parts += [(0.48, bell(note(s), 1.1, tau=0.5) * 0.5) for s in (0, 4, 7)]
    save("victoria", mix(L, *parts))

    # REBOTE: «boing»
    L = 0.35
    x = t(L)
    freq = 180 + 520 * (x / L) ** 0.6 + 30 * np.sin(2 * np.pi * 25 * x)
    save("rebote", np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(L, 0.003, 0.15))

    # GIGANTE: golpe grave de goma
    L = 0.4
    save("gigante", sweep(150, 45, L, 0.6) * env(L, 0.001, 0.12) + sweep(420, 260, L) * env(L, 0.001, 0.05) * 0.4
         + lowpass(noise(L), 0.1) * env(L, 0.001, 0.05) * 0.5, drive=2.0)

    # DESBLOQUEO: cascada de campanitas hacia arriba
    L = 1.2
    cascade = [(i * 0.045, bell(note(s), 0.7, tau=0.3)) for i, s in enumerate([0, 2, 4, 7, 9, 12, 14, 16, 19, 24])]
    save("desbloqueo", mix(L, *cascade, (0, highpass(noise(L), 0.99) * env(L, 0.05, 0.4) * 0.06)))


if __name__ == "__main__":
    main()
```

## `default.project.json`

```json
{
  "name": "CarreraDeGlobos",
  "tree": {
    "$className": "DataModel",
    "ServerScriptService": {
      "CarreraGlobos": {
        "$path": "src"
      }
    }
  }
}
```

## `.gitignore`

```
sourcemap.json
__pycache__/
```
