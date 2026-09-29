# Plan: Carrera de Globos

## Idea
Carrera 1 contra 1 (o contra el reloj) por pistas paralelas. Cada etapa es un
minijuego corto de explotar globos **con el cuerpo**. Una puerta bloquea la
siguiente etapa hasta completar la actual. Gana quien cruza la meta primero.

Principios de diseño:
1. **Se entiende en 1 segundo:** cada etapa tiene un cartel grande y una instrucción de 4 a 6 palabras.
2. **Recompensa constante:** cada globo suena, brilla y suma. Los combos suben de tono y la puerta celebra.
3. **Carrera justa:** las dos pistas usan la misma semilla y tienen los mismos globos en los mismos lugares.
4. **Rápido:** unas 8 etapas de 5 a 15 segundos cada una.

## Hecho (versión 1)
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

## Vuelta de mejora 1
- [x] Arreglo: el texto de estado se encimaba con la barra de carrera (espectadores)
- [x] Arreglo: trampolines y globo gigante lanzan de forma fiable (estado de salto antes del impulso)
- [x] Contra el reloj muestra «¡TERMINASTE!» o «¡NUEVO RÉCORD!» en vez de «¡GANASTE!»
- [x] El cartel de desbloqueo ya no tapa la pantalla de victoria
- [x] Rendimiento en celular: los globos flotan moviéndose todos juntos con `BulkMoveTo`
- [x] Guardado automático cada 2 minutos

## Vuelta de mejora 2
- [x] Cada carrera sortea 6 etapas del banco de 8, en orden aleatorio, con el Globo Gigante siempre al final
- [x] La pista se reconstruye después de cada carrera, así la próxima es distinta
- [x] Rachas de victorias 🔥: se ven en el título y en la pantalla de ganador («¡IMPARABLE!» con 3 o más)
- [x] Seguridad: si una carrera falla por un error, los jugadores vuelven al lobby

## Vuelta de mejora 3 (visual)
- [x] Iluminación alegre: colores más vivos, brillo en lo neón, rayos de sol y cielo suave (`Ambiente`, se apaga con `Config.MejorarIluminacion`)
- [x] Cada etapa con su piso de color pastel y un arco de entrada con su número y nombre
- [x] Banderines de fiesta y racimos de globos sobre las paredes
- [x] Globos con brillo blanco tipo juguete (el globo gigante lo agranda al inflarse)
- [x] Lobby con piso a cuadros pastel y racimos de globos en las esquinas
- [x] Paneles de la interfaz con degradado morado-rosa y borde blanco

## Vuelta de mejora 4
- [x] Arreglo: reiniciarse durante la cuenta atrás ya no te deja empezar en la etapa 1 con ventaja
- [x] Arreglo: quien entra al servidor a mitad de una carrera ve la barra de progreso
- [x] Las plataformas del lobby lanzan anillos de luz para que se vea dónde pararse
- [x] El ganador baila y aparece una corona 👑 sobre su cabeza

## Vuelta de mejora 5
- [x] Etapa nueva: 🏃 Globos huidizos (se escapan cuando te acercas; hay que acorralarlos). El banco ya tiene 9 etapas
- [x] Bailes de victoria desbloqueables con Wins (5), con pestaña en la tienda y vista previa al equipar
- [x] El botón del lobby ahora dice «✨ TIENDA»

## Vuelta de mejora 6 (pedido: música)
- [x] Música de fondo hecha a medida (loops perfectos): lobby tranquila y carrera chiptune a 140 BPM
- [x] La música sube un poco en cada etapa y en la última acelera a tope, con el cartel «🔥 ¡ÚLTIMA ETAPA! 🔥»
- [x] Al ganar, la música baja para que se escuche la fanfarria; en el lobby vuelve la tranquila

Principio que pidió el usuario: **emocionante y dopamínico, pero simple y sencillo.**

## Próximas ideas (se revisan en cada vuelta de mejora)
- Personajes redondos tipo «huevito» (opcional)
- Más etapas: Rodillo gigante, Globos que huyen, Pisos que se hunden, Cañón humano
- Efecto de explosión desbloqueable (color del confeti)
- Espectadores: cámara que sigue a los corredores desde el lobby
- Carrera de 4 jugadores
