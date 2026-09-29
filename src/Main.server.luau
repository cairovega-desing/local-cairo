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
