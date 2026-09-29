# 🎈 Carrera de Globos (Roblox)

Carrera 1 contra 1 inspirada en un mapa de Eggy Party. Dos jugadores corren por
pistas paralelas separadas por vidrio. Cada etapa termina en una puerta que se
abre cuando explotas suficientes globos **con tu cuerpo**: pisándolos, chocándolos,
subiéndote a botones o volando en trampolines. El primero en cruzar la meta gana
una **Win**. Las Wins desbloquean **estelas** y **títulos**.

## Cómo meterlo en Roblox Studio (2 minutos)

1. Descarga **`CarreraDeGlobos.rbxmx`** de este repositorio.
2. Abre Roblox Studio con un lugar nuevo (la plantilla **Baseplate** sirve).
3. En el **Explorer**, haz clic derecho en **ServerScriptService** → **Insert from File…** → elige `CarreraDeGlobos.rbxmx`.
4. Dale a **Play** ▶. El mapa se construye solo.
5. Párate en una plataforma del lobby. Si estás solo, a los 6 segundos juegas **contra el reloj**.
   Para probar 1 contra 1 en Studio: pestaña **Test** → **Clients and Servers** → 2 jugadores → **Start**.

> Para que se guarden las Wins y funcionen las tablas globales:
> **Home → Game Settings → Security → Enable Studio Access to API Services** (el juego tiene que estar publicado).

### Poner los sonidos buenos (recomendado)

En `sounds/` hay 13 sonidos hechos a medida para este juego. El pop tiene 4 capas
y la nota sube por una escala musical con cada globo del combo.

1. Ve a [create.roblox.com](https://create.roblox.com) → **Creaciones** → **Audio** → sube cada `.wav`.
2. Copia el ID de cada uno.
3. En Studio abre `ServerScriptService/CarreraGlobos/Config` y pega cada ID en `Config.Sonidos`, por ejemplo:
   `Pop = { Id = "rbxassetid://1234567890", Volumen = 0.9 },`

Mientras tanto se usan sonidos que ya trae Roblox.

## Las 8 etapas

| # | Etapa | Qué haces |
|---|---|---|
| 1 | 🌀 Aspas giratorias | Te paras en el botón verde y un brazo gira reventando el anillo de globos |
| 2 | 🛞 Neumáticos | Pisas los globos escondidos dentro de las llantas |
| 3 | ➡️ Cinta loca | Cintas del piso te arrastran de lado por filas de globos |
| 4 | 🎯 Lanzadardos | Te subes al botón azul y un cañón dispara dardos que atraviesan globos |
| 5 | 🦘 Trampolines | Los trampolines te lanzan hacia torres de globos |
| 6 | 🌧️ Lluvia de globos | Caen globos del cielo, sobre todo cerca de ti |
| 7 | 🌽 Laberinto | Zigzag lleno de globos, con una esfera morada de súper poder ⚡ |
| 8 | 💥 Globo gigante | Lo chocas una y otra vez: rebotas, se infla, se pone rojo… ¡y explota! |

Cada puerta muestra cuántos globos te faltan (🎈 12 / 32).

## Qué hace que se sienta bien

- **Combos musicales:** cada globo seguido suena una nota más alta de una escala pentatónica.
- Confeti del color del globo, una onda expansiva, números **+10** flotantes y una leve sacudida de cámara.
- Carteles de **¡GENIAL!**, **¡INCREÍBLE!** e **¡IMPARABLE!** al encadenar combos.
- **Globos dorados** (8 %) que valen +50 y brillan.
- Puertas que se hunden con fanfarria y confeti.
- Una barra arriba que muestra en qué etapa vas tú y en cuál tu rival.
- Una lluvia de confeti al ganar, más el aviso **¡NUEVO RÉCORD!** si mejoras tu tiempo.

## Recompensas y tablas

- **Wins:** ganas 1 por cada carrera 1 contra 1. No se gastan; al llegar a cierta cantidad desbloqueas cosas para siempre.
- **Estelas (9):** Nube, Eléctrica, Fuego, Menta, Chicle, Galaxia, Arcoíris, Oro y Diamante (hasta 50 Wins).
- **Títulos (6):** se ven sobre tu cabeza con tus Wins. Van de «Novato» a «Dios del Pop».
- **Tienda:** el botón ✨ ESTELAS del lobby.
- **Tablas globales en el lobby:** 🏆 Más Wins, ⏱ Mejores tiempos y 🎈 Más globos.

## Cambiar el juego

Casi todo se cambia en **`Config`**: velocidad, cantidad de globos, orden de las
etapas, colores, puntos, sonidos, estelas y títulos. Para agregar una etapa, copia
un módulo de `Stages/`, cámbiale el nombre y agrégalo a `Config.Etapas`.

## Para programadores

```
src/
  Main.server.luau     lobby, plataformas, arranque de carreras
  Race.luau            una carrera: globos, puertas, cuenta atrás, ganador
  MapBuilder.luau      construye el mapa con código
  Balloons.luau        crea globos
  Datos.luau           leaderstats + DataStore
  Recompensas.luau     estelas y títulos
  Tablas.luau          tablas de líderes (OrderedDataStore)
  Config.luau          toda la configuración
  Util.luau            ayudantes para crear piezas
  Stages/              una etapa por módulo: length(), build(ctx), start(handle, rt)
  CarreraUI/           ScreenGui + UI.client.luau (efectos, sonidos, tienda)
tools/build.py         genera CarreraDeGlobos.rbxmx (y sourcemap.json)
tools/make_sounds.py   genera los sonidos de sounds/
```

- Compatible con **Rojo** (`rojo serve`), usando `default.project.json`.
- Después de cambiar algo en `src/`, corre `python3 tools/build.py` para regenerar el `.rbxmx`.
