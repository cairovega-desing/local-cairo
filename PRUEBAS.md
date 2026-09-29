# 🧪 Lista de pruebas en Roblox Studio

El código se revisó con un verificador contra la API de Roblox, pero **nunca se probó en un juego real**.
Esta lista te ayuda a probar todo en unos 15 minutos.

## Antes de empezar

1. Abre **View → Output**. Ahí aparecen los errores en rojo y los avisos `[CarreraGlobos]`.
2. Inserta `CarreraDeGlobos.rbxmx` en **ServerScriptService** y dale a **Play**.

**Si algo falla**, copia el texto rojo del Output y pégamelo en el chat, junto con qué estabas haciendo. Con eso lo arreglo.

## 1. Lobby (juega solo)
- [ ] Apareces en el lobby: piso a cuadros, letrero rosa y 3 tablas en la pared
- [ ] Las 2 plataformas lanzan anillos de luz
- [ ] Arriba dice «Párate en una plataforma para jugar 🎈»
- [ ] El botón **✨ TIENDA** abre la tienda con 3 pestañas; al equipar un baile, tu personaje baila
- [ ] Llevas una estela blanca al correr y un título «Novato · 🏆 0» sobre la cabeza

## 2. Carrera contra el reloj
- [ ] Te paras en una plataforma: arriba dice «…juegas solo contra el reloj en 6, 5, 4…» y te lleva a la pista
- [ ] Sale «3, 2, 1, ¡YA!» y no te puedes mover hasta el «¡YA!»
- [ ] Al entrar a cada etapa sale un cartel grande con su nombre
- [ ] Explotar globos suena, sale confeti y aparece «+10»; con varios seguidos sale «¡COMBO x5!» y la nota sube
- [ ] La puerta muestra «🎈 12 / 32» y se hunde al completar la etapa
- [ ] Llegas a la meta: «⏱ ¡TERMINASTE!» y vuelves al lobby

## 3. Cada etapa por separado
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

## 4. 1 contra 1
**Test → Clients and Servers → 2 jugadores → Start**. Cada jugador se para en una plataforma.
- [ ] Arriba se ve la barra de ambos jugadores y cuántas etapas lleva cada uno
- [ ] El ganador ve «🏆 ¡GANASTE!», baila y tiene una 👑
- [ ] El que pierde ve «¡Ganó …!»
- [ ] Al ganador se le suma 1 en **Wins** (tabla de jugadores, arriba a la derecha)
- [ ] Si cierras una ventana a mitad de carrera, al otro le sale «Tu rival se fue» y no gana Win

## 5. Sonidos y música (después de subirlos)
- [ ] El pop suena bien y la nota sube en los combos
- [ ] Música tranquila en el lobby y rápida en la carrera, que acelera en la última etapa
