--[[
	ETAPA: NEUMÁTICOS
	Llantas en el piso; algunas esconden un globo. ¡Písalos!
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Neumaticos = {}

Neumaticos.Title = "Neumáticos"
Neumaticos.Hint = "¡Pisa los globos escondidos en las llantas!"

local TIRE_COLOR = Color3.fromRGB(35, 35, 40)
local TIRE_RADIUS = 2.6
local SPACING_X = 12

function Neumaticos.length(): number
	return Config.Neumaticos.Filas * SPACING_X + 8
end

local function buildTire(folder: Instance, center: Vector3)
	local sides = 10
	local sideLength = 2 * TIRE_RADIUS * math.tan(math.pi / sides) + 0.35
	for k = 0, sides - 1 do
		local a = k / sides * math.pi * 2
		Util.part({
			Name = "Llanta",
			Size = Vector3.new(1.3, 1, sideLength),
			CFrame = CFrame.new(center + Vector3.new(math.cos(a) * TIRE_RADIUS, 0.5, math.sin(a) * TIRE_RADIUS))
				* CFrame.Angles(0, -a, 0),
			Color = TIRE_COLOR,
			Parent = folder,
		})
	end
end

function Neumaticos.build(ctx)
	local cfg = Config.Neumaticos
	local handle = { tires = {} }
	local spacingZ = (ctx.width - 6) / cfg.Columnas
	for row = 1, cfg.Filas do
		for col = 1, cfg.Columnas do
			local x = ctx.x0 + 4 + (row - 0.5) * SPACING_X + ctx.rng:NextNumber(-1.5, 1.5)
			local z = ctx.z - ctx.width / 2 + 3 + (col - 0.5) * spacingZ + ctx.rng:NextNumber(-1, 1)
			local center = Vector3.new(x, ctx.floor, z)
			buildTire(ctx.folder, center)
			table.insert(handle.tires, center)
		end
	end
	return handle
end

function Neumaticos.start(handle, rt)
	-- Elegimos al azar qué llantas tienen globo (igual para los dos jugadores)
	local order = table.clone(handle.tires)
	for i = #order, 2, -1 do
		local j = rt.rng:NextInteger(1, i)
		order[i], order[j] = order[j], order[i]
	end
	local count = math.min(Config.Neumaticos.ConGlobo, #order)
	for i = 1, count do
		rt.addBalloon(order[i] + Vector3.new(0, 1.4, 0), { size = 2.4, noString = true })
	end
	return { goal = count }
end

return Neumaticos
