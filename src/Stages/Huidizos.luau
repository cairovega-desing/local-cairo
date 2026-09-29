--[[
	ETAPA: GLOBOS HUIDIZOS
	¡Los globos se escapan cuando te acercas! Son más lentos que tú:
	acorrálalos contra las paredes para atraparlos.
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Huidizos = {}

Huidizos.Title = "Globos huidizos"
Huidizos.Hint = "¡Se escapan! Acorrálalos contra las paredes"

local HEIGHT = 2.8

function Huidizos.length(): number
	return 44
end

function Huidizos.build(ctx)
	-- Postes bajos en las esquinas: marcan el corral
	for _, cx in { ctx.x0 + 3, ctx.x0 + Huidizos.length() - 3 } do
		for _, side in { -1, 1 } do
			Util.cylinder(Vector3.new(cx, ctx.floor + 1.5, ctx.z + side * (ctx.width / 2 - 2)), 3, 1.2, {
				Name = "Poste",
				Color = Color3.fromRGB(255, 150, 60),
				Parent = ctx.folder,
			})
		end
	end
	return {
		x0 = ctx.x0 + 4,
		x1 = ctx.x0 + Huidizos.length() - 4,
		z0 = ctx.z - ctx.width / 2 + 2,
		z1 = ctx.z + ctx.width / 2 - 2,
		floor = ctx.floor,
	}
end

function Huidizos.start(handle, rt)
	local cfg = Config.Huidizos
	local runners = {} -- [Model] = { pos: Vector3, wander: Vector3 }

	for _ = 1, cfg.Globos do
		local pos = Vector3.new(
			rt.rng:NextNumber(handle.x0 + 8, handle.x1),
			handle.floor + HEIGHT,
			rt.rng:NextNumber(handle.z0, handle.z1)
		)
		local model = rt.addBalloon(pos, { noBob = true })
		local a = rt.rng:NextNumber(0, math.pi * 2)
		runners[model] = { pos = pos, wander = Vector3.new(math.cos(a), 0, math.sin(a)) }
	end

	local MOVE_STEP = 0.05 -- movemos los globos 20 veces por segundo (menos datos por la red)
	local accumulated = 0

	local function update(frameDt: number, root: BasePart, inside: boolean)
		if not inside then
			return -- nadie los mira: no gastamos red moviéndolos
		end
		accumulated += frameDt
		if accumulated < MOVE_STEP then
			return
		end
		local dt = accumulated
		accumulated = 0
		local me = root.Position
		for model, r in runners do
			if not model.Parent then
				runners[model] = nil
				continue
			end
			local away = Vector3.new(r.pos.X - me.X, 0, r.pos.Z - me.Z)
			local velocity
			if away.Magnitude < cfg.DistanciaSusto then
				-- ¡Huye! (más lento que tú, así que puedes alcanzarlo)
				velocity = away.Unit * cfg.VelocidadHuida + r.wander * 3
			else
				velocity = r.wander * cfg.VelocidadPaseo
			end
			local newPos = r.pos + velocity * dt
			-- Rebota en los bordes del corral
			if newPos.X < handle.x0 or newPos.X > handle.x1 then
				r.wander = Vector3.new(-r.wander.X, 0, r.wander.Z)
				newPos = Vector3.new(math.clamp(newPos.X, handle.x0, handle.x1), newPos.Y, newPos.Z)
			end
			if newPos.Z < handle.z0 or newPos.Z > handle.z1 then
				r.wander = Vector3.new(r.wander.X, 0, -r.wander.Z)
				newPos = Vector3.new(newPos.X, newPos.Y, math.clamp(newPos.Z, handle.z0, handle.z1))
			end
			-- Saltitos para que se vea vivo
			local hop = math.abs(math.sin(os.clock() * 6 + r.wander.X * 3)) * 0.8
			r.pos = Vector3.new(newPos.X, handle.floor + HEIGHT, newPos.Z)
			rt.move(model, r.pos + Vector3.new(0, hop, 0))
		end
	end

	return { goal = cfg.Globos, update = update }
end

return Huidizos
