--[[
	Construye todo el mapa con código: lobby, plataformas de «Jugador 1 / Jugador 2»,
	dos pistas paralelas separadas por vidrio, las etapas, las puertas y la meta.

	Vista desde arriba (X hacia la derecha):

	  LOBBY   | salida | etapa 1 |🚪| etapa 2 |🚪| etapa 3 |🚪| etapa 4 |🚪| META
	  [P1]    | pista 1 ─────────────────────────────────────────────────────►
	  [P2]    | pista 2 ─────────────────────────────────────────────────────►
]]

local Workspace = game:GetService("Workspace")

local Balloons = require(script.Parent.Balloons)
local Config = require(script.Parent.Config)
local Util = require(script.Parent.Util)

local MapBuilder = {}

local SAND = Color3.fromRGB(235, 195, 135)
local WALL = Color3.fromRGB(250, 235, 210)
local GLASS = Color3.fromRGB(200, 230, 255)
local WALL_H = 20
local START_ZONE = 20
local DOOR_T = 2
local FINISH_ZONE = 34

-- Colores pastel para el piso de cada etapa (se repiten si hay más etapas)
local STAGE_TINTS = {
	Color3.fromRGB(180, 240, 210), -- menta
	Color3.fromRGB(215, 200, 255), -- lila
	Color3.fromRGB(255, 215, 185), -- durazno
	Color3.fromRGB(190, 225, 255), -- celeste
	Color3.fromRGB(255, 245, 180), -- limón
	Color3.fromRGB(255, 205, 225), -- rosa
	Color3.fromRGB(185, 245, 245), -- agua
	Color3.fromRGB(230, 215, 255), -- lavanda
}
local FLAG_COLORS = {
	Color3.fromRGB(255, 80, 110),
	Color3.fromRGB(255, 200, 50),
	Color3.fromRGB(80, 200, 255),
	Color3.fromRGB(120, 230, 120),
	Color3.fromRGB(200, 120, 255),
}

-- Adorno: pieza sin colisión ni sombra (no molesta ni pesa)
local function decor(props: { [string]: any }): Part
	props.CanCollide = false
	props.CanQuery = false
	props.CanTouch = false
	props.CastShadow = false
	return Util.part(props)
end

-- Racimo de 3 globos de adorno (no se pueden explotar)
local function balloonBunch(parent: Instance, base: Vector3, size: number)
	for k = 0, 2 do
		local a = k / 3 * math.pi * 2
		local offset = Vector3.new(math.cos(a) * size * 0.45, size * (1.2 + 0.25 * k), math.sin(a) * size * 0.45)
		Balloons.create(parent, base + offset, { size = size })
	end
end

-- Banderines de fiesta colgando a lo largo de una pared
local function bunting(parent: Instance, fromX: number, toX: number, y: number, z: number)
	decor({
		Name = "Cuerda",
		Size = Vector3.new(toX - fromX, 0.1, 0.1),
		CFrame = CFrame.new((fromX + toX) / 2, y, z),
		Color = Color3.fromRGB(255, 255, 255),
		Parent = parent,
	})
	local n = 0
	for x = fromX + 2, toX - 2, 4 do
		n += 1
		decor({
			Name = "Banderin",
			Size = Vector3.new(1.3, 1.3, 0.1),
			CFrame = CFrame.new(x, y - 0.9, z) * CFrame.Angles(0, 0, math.rad(45)),
			Color = FLAG_COLORS[(n - 1) % #FLAG_COLORS + 1],
			Parent = parent,
		})
	end
end

-- Construye el lobby (una sola vez). Las pistas se hacen con buildTrack.
function MapBuilder.build()
	local O = Config.Origen
	local floorY = O.Y + 1

	local root = Instance.new("Folder")
	root.Name = "MapaCarreraGlobos"
	root.Parent = Workspace

	local map = { floorY = floorY, lanes = {}, pads = {}, root = root, track = nil :: Folder? }

	-- ─── Lobby ─────────────────────────────────────────────────────────
	local lobby = Instance.new("Folder")
	lobby.Name = "Lobby"
	lobby.Parent = root
	map.lobby = lobby

	Util.part({
		Name = "PisoLobby",
		Size = Vector3.new(64, 1, 64),
		CFrame = CFrame.new(O + Vector3.new(0, 0.5, 0)),
		Color = Color3.fromRGB(255, 240, 200),
		Parent = lobby,
	})
	-- Cuadros pastel encima del piso
	for gx = 0, 7 do
		for gz = 0, 7 do
			if (gx + gz) % 2 == 0 then
				decor({
					Name = "Cuadro",
					Size = Vector3.new(8, 0.04, 8),
					CFrame = CFrame.new(O + Vector3.new(-28 + gx * 8, 1.02, -28 + gz * 8)),
					Color = STAGE_TINTS[(gx + gz * 3) % #STAGE_TINTS + 1],
					Parent = lobby,
				})
			end
		end
	end
	for _, corner in { Vector3.new(-28, 1, -28), Vector3.new(-28, 1, 28), Vector3.new(28, 1, -28), Vector3.new(28, 1, 28) } do
		balloonBunch(lobby, O + corner, 3)
	end

	local spawn = Instance.new("SpawnLocation")
	spawn.Name = "SpawnCarrera"
	spawn.Anchored = true
	spawn.Size = Vector3.new(10, 1, 10)
	spawn.CFrame = CFrame.new(O + Vector3.new(-18, 0.6, 0))
	spawn.Color = Color3.fromRGB(255, 200, 80)
	spawn.Material = Enum.Material.SmoothPlastic
	spawn.TopSurface = Enum.SurfaceType.Smooth
	spawn.Duration = 0
	spawn.Neutral = true
	spawn.Parent = lobby
	-- Que todos aparezcan en nuestro lobby (solo mientras el juego corre)
	for _, other in Workspace:GetDescendants() do
		if other:IsA("SpawnLocation") and other ~= spawn then
			other.Enabled = false
		end
	end
	map.lobbyCFrame = CFrame.new(O + Vector3.new(-18, 4, 0))

	local sign = Util.part({
		Name = "Letrero",
		Size = Vector3.new(1, 10, 36),
		CFrame = CFrame.new(O + Vector3.new(-31, 8, 0)),
		Color = Color3.fromRGB(255, 90, 150),
		Parent = lobby,
	})
	Util.surfaceText(sign, Enum.NormalId.Right, "🎈 CARRERA DE GLOBOS 🎈")

	for i = 1, 2 do
		local padPos = O + Vector3.new(18, 0, if i == 1 then -10 else 10)
		local pad = Util.cylinder(padPos + Vector3.new(0, 1.2, 0), 0.4, 9, {
			Name = "Plataforma" .. i,
			Color = Config.ColoresPista[i],
			Material = Enum.Material.Neon,
			Parent = lobby,
		})
		local gui = Util.billboard(pad, "JUGADOR " .. i .. "\n¡Párate aquí!", 6, Config.ColoresPista[i])
		gui.Size = UDim2.fromScale(12, 4)
		map.pads[i] = { part = pad, label = gui:FindFirstChild("Texto") :: TextLabel, index = i }
	end

	return map
end

-- Construye (o reconstruye) las dos pistas con las etapas dadas, en ese orden.
-- Se llama al iniciar y después de cada carrera, para que la siguiente sea distinta.
function MapBuilder.buildTrack(map, stageModules)
	local O = Config.Origen
	local floorY = map.floorY
	local W = Config.AnchoPista
	if map.track then
		map.track:Destroy()
	end
	map.lanes = {}

	-- ─── Pistas ────────────────────────────────────────────────────────
	local startX = O.X + 60
	local stageXs = {}
	local x = startX + START_ZONE
	for s, module in stageModules do
		local length = module.length()
		stageXs[s] = { x0 = x, x1 = x + length }
		x += length + DOOR_T
	end
	local finishX = x + 14
	local endX = x + FINISH_ZONE
	local totalLength = endX - startX
	local midX = (startX + endX) / 2

	local track = Instance.new("Folder")
	track.Name = "Pistas"
	track.Parent = map.root
	map.track = track

	-- Divisor de vidrio entre pistas + paredes externas + paredes de inicio y fin
	Util.part({
		Name = "Divisor",
		Size = Vector3.new(totalLength, WALL_H, 2),
		CFrame = CFrame.new(midX, floorY + WALL_H / 2, O.Z),
		Color = GLASS,
		Material = Enum.Material.Glass,
		Transparency = 0.7,
		Parent = track,
	})
	for _, side in { -1, 1 } do
		Util.part({
			Name = "ParedExterna",
			Size = Vector3.new(totalLength, WALL_H, 1),
			CFrame = CFrame.new(midX, floorY + WALL_H / 2, O.Z + side * (W + 1.5)),
			Color = WALL,
			Transparency = 0.25,
			Parent = track,
		})
	end
	for _, side in { -1, 1 } do
		local wallZ = O.Z + side * (W + 1.5)
		bunting(track, startX, endX, floorY + WALL_H - 1.5, wallZ - side * 0.8)
		for bx = startX + 15, endX - 10, 30 do
			balloonBunch(track, Vector3.new(bx, floorY + WALL_H, wallZ), 2.5)
		end
	end
	for _, wx in { startX - 0.5, endX + 0.5 } do
		Util.part({
			Name = "ParedFinal",
			Size = Vector3.new(1, WALL_H, 2 * W + 4),
			CFrame = CFrame.new(wx, floorY + WALL_H / 2, O.Z),
			Color = GLASS,
			Material = Enum.Material.Glass,
			Transparency = 0.6,
			Parent = track,
		})
	end

	for i = 1, 2 do
		local z = O.Z + (if i == 1 then -1 else 1) * (W / 2 + 1)
		local color = Config.ColoresPista[i]
		local laneFolder = Instance.new("Folder")
		laneFolder.Name = "Pista" .. i
		laneFolder.Parent = track

		Util.part({
			Name = "Piso",
			Size = Vector3.new(totalLength, 1, W),
			CFrame = CFrame.new(midX, floorY - 0.5, z),
			Color = SAND,
			Parent = laneFolder,
		})
		-- Franja de salida del color del jugador
		Util.part({
			Name = "Salida",
			Size = Vector3.new(START_ZONE, 0.1, W),
			CFrame = CFrame.new(startX + START_ZONE / 2, floorY + 0.05, z),
			Color = color,
			Transparency = 0.4,
			CanCollide = false,
			Parent = laneFolder,
		})

		local lane = {
			index = i,
			z = z,
			color = color,
			startCFrame = CFrame.lookAt(Vector3.new(startX + 8, floorY + 3, z), Vector3.new(startX + 100, floorY + 3, z)),
			stages = {},
			finishX = finishX,
			finishCFrame = CFrame.lookAt(Vector3.new(finishX - 8, floorY + 3, z), Vector3.new(finishX + 100, floorY + 3, z)),
		}

		for s, module in stageModules do
			local range = stageXs[s]
			local stageFolder = Instance.new("Folder")
			stageFolder.Name = string.format("Etapa%d_%s", s, module.Title)
			stageFolder.Parent = laneFolder

			local barriers = {}
			local ctx = {
				folder = stageFolder,
				x0 = range.x0,
				length = range.x1 - range.x0,
				z = z,
				width = W,
				floor = floorY,
				color = color,
				lane = i,
				rng = Random.new(s * 7919), -- misma semilla en las dos pistas = carrera justa
				addBarrier = function(part: BasePart)
					table.insert(barriers, { part = part, cframe = part.CFrame })
				end,
			}
			local handle = module.build(ctx)

			-- Piso de color de la etapa y arco de entrada con su nombre
			local tint = STAGE_TINTS[(s - 1) % #STAGE_TINTS + 1]
			decor({
				Name = "PisoEtapa",
				Size = Vector3.new(range.x1 - range.x0, 0.04, W - 1),
				CFrame = CFrame.new((range.x0 + range.x1) / 2, floorY + 0.02, z),
				Color = tint,
				Parent = stageFolder,
			})
			local archColor = tint:Lerp(Color3.new(0, 0, 0), 0.25)
			for _, side in { -1, 1 } do
				decor({
					Name = "ArcoPilar",
					Size = Vector3.new(1.5, 13, 1.5),
					CFrame = CFrame.new(range.x0 + 0.75, floorY + 6.5, z + side * (W / 2 - 0.75)),
					Color = archColor,
					Parent = stageFolder,
				})
			end
			local archTop = decor({
				Name = "ArcoTecho",
				Size = Vector3.new(1.5, 3, W),
				CFrame = CFrame.new(range.x0 + 0.75, floorY + 14.5, z),
				Color = archColor,
				Parent = stageFolder,
			})
			Util.surfaceText(archTop, Enum.NormalId.Left, string.format("%d · %s", s, string.upper(module.Title)))

			local door = Util.part({
				Name = "Puerta",
				Size = Vector3.new(DOOR_T, WALL_H, W),
				CFrame = CFrame.new(range.x1 + DOOR_T / 2, floorY + WALL_H / 2, z),
				Color = color,
				Transparency = 0.1,
				Parent = stageFolder,
			})
			local doorLabel = Util.surfaceText(door, Enum.NormalId.Left, "🎈 0 / 0")
			table.insert(barriers, { part = door, cframe = door.CFrame })

			lane.stages[s] = {
				module = module,
				handle = handle,
				x0 = range.x0,
				x1 = range.x1,
				door = door,
				doorLabel = doorLabel,
				barriers = barriers,
				entryCFrame = CFrame.lookAt(
					Vector3.new(range.x0 + 3, floorY + 3, z),
					Vector3.new(range.x0 + 100, floorY + 3, z)
				),
			}
		end

		-- Meta a cuadros
		local tiles = 10
		for t = 0, tiles - 1 do
			Util.part({
				Name = "Meta",
				Size = Vector3.new(3, 0.12, W / tiles),
				CFrame = CFrame.new(finishX + 1.5, floorY + 0.06, z - W / 2 + (t + 0.5) * W / tiles),
				Color = if t % 2 == 0 then Color3.new(1, 1, 1) else Color3.new(0.1, 0.1, 0.1),
				CanCollide = false,
				Parent = laneFolder,
			})
		end
		for _, side in { -1, 1 } do
			Util.part({
				Name = "ArcoPilar",
				Size = Vector3.new(1.5, 14, 1.5),
				CFrame = CFrame.new(finishX + 1.5, floorY + 7, z + side * (W / 2 - 1)),
				Color = Color3.fromRGB(255, 205, 40),
				Material = Enum.Material.Neon,
				Parent = laneFolder,
			})
		end
		local arch = Util.part({
			Name = "ArcoTecho",
			Size = Vector3.new(1.5, 2.5, W),
			CFrame = CFrame.new(finishX + 1.5, floorY + 15, z),
			Color = Color3.fromRGB(255, 205, 40),
			Material = Enum.Material.Neon,
			Parent = laneFolder,
		})
		Util.surfaceText(arch, Enum.NormalId.Left, "🏁 META 🏁").TextColor3 = Color3.fromRGB(60, 30, 0)

		map.lanes[i] = lane
	end
end

return MapBuilder
