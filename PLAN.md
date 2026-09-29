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

## Próximas ideas (se revisan en cada vuelta de mejora)
- Más etapas: Rodillo gigante, Globos que huyen, Pisos que se hunden, Cañón humano
- Emotes o bailes de victoria desbloqueables
- Efecto de explosión desbloqueable (color del confeti)
- Espectadores: cámara que sigue a los corredores desde el lobby
- Carrera de 4 jugadores
- Sonido de ambiente y música de carrera que acelera en la última etapa
