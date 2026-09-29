--[[
	ETAPA FINAL: GLOBO GIGANTE
	Un globo enorme. Cada vez que lo chocas rebotas, se infla un poco más
	y se pone más rojo… ¡hasta que explota!
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)
local Balloons = require(script.Parent.Parent.Balloons)

local Gigante = {}

Gigante.Title = "¡GLOBO GIGANTE!"
Gigante.Hint = "¡Chócalo una y otra vez hasta que explote!"

local HIT_COOLDOWN = 0.35
local DANGER = Color3.fromRGB(255, 40, 40)

function Gigante.length(): number
	return 40
end

function Gigante.build(ctx)
	local center = Vector3.new(ctx.x0 + 20, ctx.floor, ctx.z)
	Util.cylinder(center + Vector3.new(0, 0.15, 0), 0.3, 22, {
		Name = "Arena",
		Color = Color3.fromRGB(255, 120, 170),
		CanCollide = false,
		Parent = ctx.folder,
	})
	return { center = center }
end

function Gigante.start(handle, rt)
	local cfg = Config.Gigante
	local size = cfg.Tamano
	local startColor = Config.ColoresGlobo[rt.rng:NextInteger(1, #Config.ColoresGlobo)]
	local balloonCenter = handle.center + Vector3.new(0, size * 0.6 + 0.5, 0)
	local model = Balloons.create(rt.folder, balloonCenter, {
		size = size,
		color = startColor,
		noString = true,
		noBob = true,
	})
	local body = model.PrimaryPart :: BasePart
	local hp = cfg.Golpes
	local lastHit = 0

	local function update(_dt: number, root: BasePart)
		if hp <= 0 or not model.Parent then
			return
		end
		local radius = body.Size.X / 2
		local offset = root.Position - body.Position
		if offset.Magnitude > radius * 1.15 + 2.5 or os.clock() - lastHit < HIT_COOLDOWN then
			return
		end
		lastHit = os.clock()
		hp -= 1

		-- ¡Rebote! Te empuja hacia afuera y hacia arriba
		local away = Vector3.new(offset.X, 0, offset.Z)
		away = if away.Magnitude > 0.1 then away.Unit else Vector3.new(-1, 0, 0)
		rt.bounce(away * cfg.Rebote + Vector3.new(0, cfg.Rebote * 0.8, 0))

		local contact = body.Position + offset.Unit * radius
		local progress = 1 - hp / cfg.Golpes
		rt.fx("golpeGigante", contact, progress, rt.player.UserId)

		if hp <= 0 then
			rt.fx("explosion", body.Position, body.Size.X, body.Color)
			model:Destroy()
		else
			-- Se infla y se pone rojo
			local grow = 1 + cfg.Crecimiento
			body.Size *= grow
			body.CFrame = CFrame.new(handle.center + Vector3.new(0, body.Size.Y / 2 + 0.5, 0))
			body.Color = startColor:Lerp(DANGER, progress)
			local shine = model:FindFirstChild("Brillo") :: BasePart?
			if shine then
				local d = body.Size.X
				shine.Size = Vector3.one * d * 0.22
				shine.CFrame = body.CFrame + Vector3.new(-d * 0.28, d * 0.3, -d * 0.18)
			end
		end
		rt.hit(contact, body.Color, 1.5)
	end

	return { goal = cfg.Golpes, update = update }
end

return Gigante
