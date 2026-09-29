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
