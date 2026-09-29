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
