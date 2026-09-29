--[[
	ETAPA: CINTA LOCA
	Franjas de piso que te arrastran de lado. Cruza y deja que la cinta te
	lleve por la fila de globos.
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Cinta = {}

Cinta.Title = "Cinta loca"
Cinta.Hint = "¡Déjate llevar por las cintas y revienta la fila!"

local BELT_DEPTH = 8
local STEP = 12

function Cinta.length(): number
	return Config.Cinta.Cintas * STEP + 8
end

function Cinta.build(ctx)
	local cfg = Config.Cinta
	local belts = {}
	for k = 1, cfg.Cintas do
		local x = ctx.x0 + 4 + (k - 0.5) * STEP
		local direction = if k % 2 == 1 then 1 else -1
		local belt = Util.part({
			Name = "Cinta",
			Size = Vector3.new(BELT_DEPTH, 0.4, ctx.width),
			CFrame = CFrame.new(x, ctx.floor + 0.2, ctx.z),
			Color = Color3.fromRGB(60, 60, 75),
			Material = Enum.Material.DiamondPlate,
			Parent = ctx.folder,
		})
		belt.AssemblyLinearVelocity = Vector3.new(0, 0, direction * cfg.Velocidad)
		belt:SetAttribute("Direccion", direction)

		-- Franjas amarillas (el cliente las anima para que se vea que la cinta se mueve)
		local stripes = 6
		for n = 0, stripes - 1 do
			local stripe = Util.part({
				Name = "Franja",
				Size = Vector3.new(BELT_DEPTH, 0.05, 1),
				CFrame = CFrame.new(x, ctx.floor + 0.43, ctx.z - ctx.width / 2 + (n + 0.5) * ctx.width / stripes),
				Color = Color3.fromRGB(255, 200, 40),
				Material = Enum.Material.Neon,
				CanCollide = false,
				CanQuery = false,
				CanTouch = false,
				Parent = ctx.folder,
			})
			stripe:SetAttribute("CintaZ", ctx.z)
			stripe:SetAttribute("CintaAncho", ctx.width)
			stripe:SetAttribute("CintaVel", direction * cfg.Velocidad * 0.5)
			stripe:AddTag("FranjaCinta")
		end
		table.insert(belts, x)
	end
	return { belts = belts, z = ctx.z, width = ctx.width, floor = ctx.floor }
end

function Cinta.start(handle, rt)
	local cfg = Config.Cinta
	local total = 0
	for _, x in handle.belts do
		for n = 1, cfg.GlobosPorCinta do
			local z = handle.z - handle.width / 2 + n * handle.width / (cfg.GlobosPorCinta + 1)
			rt.addBalloon(Vector3.new(x, handle.floor + 2.6, z), {})
			total += 1
		end
	end
	return { goal = math.floor(total * cfg.Porcentaje) }
end

return Cinta
