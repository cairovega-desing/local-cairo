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

-- ════════════════════════════════════════════════════════════════════
-- Tienda de estelas y títulos
-- ════════════════════════════════════════════════════════════════════

local myWins = 0
local myEquipped = { Estela = "nube", Titulo = "novato" }
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
	Text = "✨ ESTELAS\n🏆 0",
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
for _, info in { { "Estela", "✨ Estelas" }, { "Titulo", "👑 Títulos" } } do
	local button = make("TextButton", {
		Size = UDim2.fromOffset(150, 36),
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
	local list = if shopTab == "Estela" then Config.Estelas else Config.Titulos
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
		else
			swatch.BackgroundTransparency = 1
			label({ Size = UDim2.fromScale(1, 1), Text = item.Nombre, TextColor3 = item.Color, ZIndex = 24, Parent = swatch })
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
	hint.Visible = true
	hint.Text = if done then "¡Puerta abierta, sigue corriendo! ➜" else hintText
	setCounter(popped, goal, done)
	if not done then
		showBanner(title, Color3.fromRGB(255, 240, 90), string.format("Etapa %d de %d · %s", s, total, hintText), 1.8)
	end
end

function handlers.progreso(s: number, popped: number, goal: number, pts: number)
	points.Text = "⭐ " .. pts
	bump(pointsScale, 1.2)
	if s == currentStage then
		setCounter(popped, goal)
		bump(counterScale, 1.18)
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
		task.delay(0.4, function()
			local humanoid = player.Character and player.Character:FindFirstChildOfClass("Humanoid")
			if humanoid then
				pcall(function()
					humanoid:PlayEmote("dance")
				end)
			end
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

function handlers.tienda(wins: number, estela: string, titulo: string)
	myWins = wins
	myEquipped.Estela = estela
	myEquipped.Titulo = titulo
	shopButton.Text = "✨ ESTELAS\n🏆 " .. wins
	if shop.Visible then
		renderShop()
	end
end

function handlers.fin()
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
end

remote.OnClientEvent:Connect(function(kind: string, ...)
	local handler = handlers[kind]
	if handler then
		handler(...)
	end
end)
remote:FireServer("hola")

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
