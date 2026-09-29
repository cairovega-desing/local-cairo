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
