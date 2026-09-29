--[[
	ETAPA: LLUVIA DE GLOBOS
	Cuando entras, empiezan a caer globos del cielo (muchos cerca de ti).
	Atrápalos corriendo debajo de ellos.
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Lluvia = {}

Lluvia.Title = "Lluvia de globos"
Lluvia.Hint = "¡Atrapa los globos que caen del cielo!"

function Lluvia.length(): number
	return 44
end

function Lluvia.build(ctx)
	-- Piso de nubes para distinguir la zona
	for n = 0, 3 do
		Util.part({
			Name = "Nube",
			Size = Vector3.new(9, 0.1, ctx.width - 4),
			CFrame = CFrame.new(ctx.x0 + 6 + n * 10, ctx.floor + 0.05, ctx.z),
			Color = Color3.fromRGB(200, 225, 255),
			CanCollide = false,
			Parent = ctx.folder,
		})
	end
	return { x0 = ctx.x0 + 4, x1 = ctx.x0 + Lluvia.length() - 4, z = ctx.z, half = ctx.width / 2 - 3, floor = ctx.floor }
end

function Lluvia.start(handle, rt)
	local cfg = Config.Lluvia
	local falling = {} -- [Model] = posición actual
	local timer = 0

	local function spawnOne(near: Vector3?)
		local x, z
		if near and rt.rng:NextNumber() < 0.6 then
			x = math.clamp(near.X + rt.rng:NextNumber(-8, 8), handle.x0, handle.x1)
			z = math.clamp(near.Z + rt.rng:NextNumber(-8, 8), handle.z - handle.half, handle.z + handle.half)
		else
			x = rt.rng:NextNumber(handle.x0, handle.x1)
			z = handle.z + rt.rng:NextNumber(-handle.half, handle.half)
		end
		local pos = Vector3.new(x, handle.floor + cfg.Altura, z)
		local model = rt.addBalloon(pos, { noBob = true })
		falling[model] = pos
	end

	local MOVE_STEP = 0.05 -- 20 veces por segundo (menos datos por la red)
	local accumulated = 0

	local function update(frameDt: number, root: BasePart, inside: boolean)
		if not inside then
			return
		end
		accumulated += frameDt
		if accumulated < MOVE_STEP then
			return
		end
		local dt = accumulated
		accumulated = 0
		local alive = 0
		for model, pos in falling do
			if not model.Parent then
				falling[model] = nil
			else
				alive += 1
				local ground = handle.floor + 2.2
				if pos.Y > ground then
					local newPos = Vector3.new(pos.X, math.max(ground, pos.Y - cfg.VelocidadCaida * dt), pos.Z)
					falling[model] = newPos
					rt.move(model, newPos)
				end
			end
		end

		if rt.done() then
			return
		end
		timer -= dt
		if timer <= 0 and alive < cfg.MaximoEnPantalla then
			timer = cfg.Intervalo
			spawnOne(root.Position)
		end
	end

	return { goal = cfg.Meta, update = update }
end

return Lluvia
