--[[
	ETAPA: LANZADARDOS
	Súbete al botón azul: el cañón gira de lado a lado disparando dardos que
	atraviesan todos los globos que encuentran. Detrás del vidrio está el campo de globos.
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Dardos = {}

Dardos.Title = "Lanzadardos"
Dardos.Hint = "¡Súbete al botón azul y dispara!"

local PEDESTAL_H = 2.5
local DART_Y = 2.4
local FIELD_START = 20 -- distancia desde el inicio de la etapa hasta el campo de globos

function Dardos.length(): number
	return 70
end

function Dardos.build(ctx)
	local center = Vector3.new(ctx.x0 + 8, ctx.floor, ctx.z)

	Util.cylinder(center + Vector3.new(0, PEDESTAL_H / 2, 0), PEDESTAL_H, 7, {
		Name = "Plataforma",
		Color = Color3.fromRGB(110, 170, 240),
		Parent = ctx.folder,
	})
	local button = Util.cylinder(center + Vector3.new(0, PEDESTAL_H + 0.15, 0), 0.3, 4.5, {
		Name = "Boton",
		Color = Color3.fromRGB(40, 90, 200),
		Material = Enum.Material.Neon,
		Parent = ctx.folder,
	})
	local sign = Util.billboard(button, "⬇ ¡SÚBETE! ⬇", 5, Color3.fromRGB(150, 220, 255))

	local cannon = Util.part({
		Name = "Canon",
		Shape = Enum.PartType.Cylinder,
		Size = Vector3.new(3, 1.3, 1.3),
		CFrame = CFrame.new(center + Vector3.new(4.5, DART_Y, 0)),
		Color = Color3.fromRGB(40, 50, 80),
		Material = Enum.Material.Metal,
		CanCollide = false,
		Parent = ctx.folder,
	})

	-- Flechas pintadas en el piso (decoración, como en el video)
	for _, deg in { -30, 0, 30 } do
		local a = math.rad(deg)
		local dir = Vector3.new(math.cos(a), 0, math.sin(a))
		Util.part({
			Name = "Flecha",
			Size = Vector3.new(7, 0.1, 0.7),
			CFrame = CFrame.lookAt(center + dir * 11 + Vector3.new(0, 0.05, 0), center + dir * 20 + Vector3.new(0, 0.05, 0))
				* CFrame.Angles(0, math.rad(90), 0),
			Color = Color3.fromRGB(40, 70, 140),
			Material = Enum.Material.Neon,
			CanCollide = false,
			Parent = ctx.folder,
		})
	end

	-- Vidrio que separa al jugador de los globos (se abre junto con la puerta)
	local glass = Util.part({
		Name = "Vidrio",
		Size = Vector3.new(1, 20, ctx.width),
		CFrame = CFrame.new(ctx.x0 + FIELD_START - 5, ctx.floor + 10, ctx.z),
		Color = Color3.fromRGB(200, 230, 255),
		Material = Enum.Material.Glass,
		Transparency = 0.6,
		Parent = ctx.folder,
	})
	ctx.addBarrier(glass)

	return {
		center = center,
		cannon = cannon,
		button = button,
		sign = sign,
		fieldX0 = ctx.x0 + FIELD_START,
		fieldX1 = ctx.x0 + Dardos.length() - 4,
		z = ctx.z,
		halfWidth = ctx.width / 2 - 3,
		floor = ctx.floor,
	}
end

function Dardos.start(handle, rt)
	local cfg = Config.Dardos
	local placed = {}
	local tries = 0
	while #placed < cfg.Globos and tries < 2000 do
		tries += 1
		local pos = Vector3.new(
			rt.rng:NextNumber(handle.fieldX0, handle.fieldX1),
			handle.floor + DART_Y,
			handle.z + rt.rng:NextNumber(-handle.halfWidth, handle.halfWidth)
		)
		local ok = true
		for _, other in placed do
			if (other - pos).Magnitude < 4 then
				ok = false
				break
			end
		end
		if ok then
			table.insert(placed, pos)
			rt.addBalloon(pos, {})
		end
	end

	local origin = handle.center + Vector3.new(0, DART_Y, 0)
	local range = handle.fieldX1 - handle.center.X + 6
	local t = 0
	local cooldown = 0

	local function fire(angle: number)
		local dir = Vector3.new(math.cos(angle), 0, math.sin(angle))
		handle.cannon.CFrame = CFrame.fromMatrix(origin + dir * 4.5, dir, Vector3.yAxis)
		local muzzle = origin + dir * 6
		rt.fx("dardo", muzzle, dir, range, cfg.VelocidadDardo, rt.player.UserId)

		-- El dardo atraviesa todo lo que está en su línea
		for model, info in rt.balloons() do
			local v = info.pos - muzzle
			v = Vector3.new(v.X, 0, v.Z)
			local along = v:Dot(dir)
			if along > 0 and along < range then
				local perp = (v - dir * along).Magnitude
				if perp < info.radius + 0.6 then
					task.delay(along / cfg.VelocidadDardo, rt.pop, model)
				end
			end
		end
	end

	local function update(dt: number, hrp: BasePart)
		local d = hrp.Position - handle.center
		local on = Vector3.new(d.X, 0, d.Z).Magnitude < 3.4 and d.Y > PEDESTAL_H + 1
		handle.button.Color = if on then Color3.fromRGB(120, 230, 255) else Color3.fromRGB(40, 90, 200)
		handle.sign.Enabled = not on and next(rt.balloons()) ~= nil
		if not on then
			return
		end
		t += dt
		cooldown -= dt
		if cooldown <= 0 then
			cooldown = cfg.Cadencia
			fire(math.sin(t * cfg.VelocidadBarrido) * math.rad(cfg.Barrido))
		end
	end

	return { goal = #placed, update = update }
end

return Dardos
