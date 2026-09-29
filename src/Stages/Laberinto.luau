--[[
	ETAPA: LABERINTO
	Pasillos en zigzag llenos de globos: corre y revienta todo con el cuerpo.
	Las esferas moradas dan SÚPER PODER (más rápido y explotas desde más lejos).
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Laberinto = {}

Laberinto.Title = "Laberinto"
Laberinto.Hint = "¡Corre y revienta todo! Agarra la esfera morada ⚡"

local CORRIDOR = 12
local GAP = 9
local WALL_H = 8
local BALLOON_Y = 2.6
local ORB_COLOR = Color3.fromRGB(190, 80, 255)

function Laberinto.length(): number
	return CORRIDOR * (Config.Laberinto.Paredes + 1)
end

function Laberinto.build(ctx)
	local cfg = Config.Laberinto
	local half = ctx.width / 2
	for k = 1, cfg.Paredes do
		local x = ctx.x0 + CORRIDOR * k
		local wallLen = ctx.width - GAP
		-- Alternamos el hueco: una pared lo deja a la derecha y la siguiente a la izquierda
		local zCenter = if k % 2 == 1 then ctx.z - half + wallLen / 2 else ctx.z + half - wallLen / 2
		Util.part({
			Name = "Pared",
			Size = Vector3.new(1.5, WALL_H, wallLen),
			CFrame = CFrame.new(x, ctx.floor + WALL_H / 2, zCenter),
			Color = Color3.fromRGB(190, 140, 90),
			Material = Enum.Material.WoodPlanks,
			Parent = ctx.folder,
		})
	end

	local corridors = {}
	for c = 0, cfg.Paredes do
		table.insert(corridors, ctx.x0 + CORRIDOR * c + CORRIDOR / 2)
	end

	return { corridors = corridors, z = ctx.z, half = half, floor = ctx.floor }
end

function Laberinto.start(handle, rt)
	local cfg = Config.Laberinto
	local total = 0
	local orbCorridors = { [2] = true, [5] = true }
	local orbs = {}

	for c, x in handle.corridors do
		local z = handle.z - handle.half + 2.5
		local slot = 0
		while z <= handle.z + handle.half - 2.5 do
			slot += 1
			local pos = Vector3.new(x, handle.floor + BALLOON_Y, z)
			if orbCorridors[c] and slot == 5 then
				local orb = Util.part({
					Name = "PoderMorado",
					Shape = Enum.PartType.Ball,
					Size = Vector3.new(3, 3, 3),
					CFrame = CFrame.new(pos + Vector3.new(0, 1, 0)),
					Color = ORB_COLOR,
					Material = Enum.Material.Neon,
					CanCollide = false,
					CanTouch = false,
					Parent = rt.folder,
				})
				local light = Instance.new("PointLight")
				light.Color = ORB_COLOR
				light.Range = 14
				light.Brightness = 3
				light.Parent = orb
				Util.billboard(orb, "⚡", 2.5, Color3.fromRGB(255, 230, 120)).Size = UDim2.fromScale(3, 3)
				table.insert(orbs, orb)
			else
				rt.addBalloon(pos, { size = 2.6 })
				total += 1
			end
			z += 3.2
		end
	end

	local function update(_dt: number, hrp: BasePart)
		for i = #orbs, 1, -1 do
			local orb = orbs[i]
			if (orb.Position - hrp.Position).Magnitude < 4 then
				table.remove(orbs, i)
				rt.fx("poder", orb.Position, rt.player.UserId)
				orb:Destroy()
				rt.powerUp(cfg.PoderDuracion)
			end
		end
	end

	return { goal = math.floor(total * cfg.Porcentaje), update = update }
end

return Laberinto
