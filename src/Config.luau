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
