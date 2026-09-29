--[[
	ETAPA: ASPAS GIRATORIAS
	Anillos de globos alrededor de una plataforma con un botón verde.
	Mientras estés parado en el botón, el brazo gira y revienta todo el anillo.
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Aspas = {}

Aspas.Title = "Aspas giratorias"
Aspas.Hint = "¡Párate en el botón verde!"

local BUTTON_OFF = Color3.fromRGB(80, 220, 90)
local BUTTON_ON = Color3.fromRGB(255, 240, 80)
local RING_COLOR = Color3.fromRGB(90, 150, 230)
local PEDESTAL_H = 2.4
local ARM_Y = 1.8
local BALLOON_Y = 2.6
local HIT_ANGLE = 0.15 -- radianes: qué tan cerca debe pasar el brazo de un globo

function Aspas.length(): number
	local cfg = Config.Aspas
	return cfg.Anillos * (2 * cfg.Radio + 8) + 8
end

function Aspas.build(ctx)
	local cfg = Config.Aspas
	local R = cfg.Radio
	local handle = { rings = {} }

	for r = 1, cfg.Anillos do
		local cx = ctx.x0 + 4 + (r - 1) * (2 * R + 8) + R + 4
		local center = Vector3.new(cx, ctx.floor, ctx.z)

		-- Anillo azul donde se paran los globos
		local tiles = 28
		for k = 0, tiles - 1 do
			local a = k / tiles * math.pi * 2
			Util.part({
				Name = "Anillo",
				Size = Vector3.new(4, 0.6, 2 * math.pi * R / tiles + 0.3),
				CFrame = CFrame.new(center + Vector3.new(math.cos(a) * R, 0.3, math.sin(a) * R)) * CFrame.Angles(0, -a, 0),
				Color = RING_COLOR,
				Parent = ctx.folder,
			})
		end

		-- Plataforma central con el botón
		Util.cylinder(center + Vector3.new(0, PEDESTAL_H / 2, 0), PEDESTAL_H, 7, {
			Name = "Plataforma",
			Color = Color3.fromRGB(70, 110, 190),
			Parent = ctx.folder,
		})
		local button = Util.cylinder(center + Vector3.new(0, PEDESTAL_H + 0.15, 0), 0.3, 4.5, {
			Name = "Boton",
			Color = BUTTON_OFF,
			Material = Enum.Material.Neon,
			Parent = ctx.folder,
		})
		local sign = Util.billboard(button, "⬇ ¡PÁRATE AQUÍ! ⬇", 5, Color3.fromRGB(255, 255, 120))

		-- Eje invisible + brazo que gira con un motor (física = movimiento suave)
		local axle = Util.part({
			Name = "Eje",
			Size = Vector3.new(1, 1, 1),
			CFrame = CFrame.new(center + Vector3.new(0, ARM_Y, 0)),
			Transparency = 1,
			CanCollide = false,
			CanQuery = false,
			CanTouch = false,
			Parent = ctx.folder,
		})
		local armLength = R + 1
		local arm = Util.part({
			Name = "Brazo",
			Anchored = false,
			Size = Vector3.new(armLength, 1, 1.6),
			CFrame = CFrame.new(center + Vector3.new(armLength / 2, ARM_Y, 0)),
			Color = Color3.fromRGB(150, 95, 55),
			Material = Enum.Material.WoodPlanks,
			CanCollide = false,
			CanTouch = false,
			Parent = ctx.folder,
		})
		local tip = Util.part({
			Name = "Punta",
			Anchored = false,
			Shape = Enum.PartType.Ball,
			Size = Vector3.new(2.2, 2.2, 2.2),
			CFrame = CFrame.new(center + Vector3.new(armLength, ARM_Y, 0)),
			Color = Color3.fromRGB(255, 90, 220),
			Material = Enum.Material.Neon,
			CanCollide = false,
			CanTouch = false,
			Massless = true,
			Parent = ctx.folder,
		})
		local weld = Instance.new("WeldConstraint")
		weld.Part0 = arm
		weld.Part1 = tip
		weld.Parent = arm

		local verticalAxis = CFrame.Angles(0, 0, math.rad(90)) -- el eje de la bisagra (X) apunta hacia arriba
		local a0 = Instance.new("Attachment")
		a0.CFrame = verticalAxis
		a0.Parent = axle
		local a1 = Instance.new("Attachment")
		a1.CFrame = CFrame.new(-armLength / 2, 0, 0) * verticalAxis
		a1.Parent = arm
		local hinge = Instance.new("HingeConstraint")
		hinge.Attachment0 = a0
		hinge.Attachment1 = a1
		hinge.ActuatorType = Enum.ActuatorType.Motor
		hinge.MotorMaxTorque = 1e9
		hinge.MotorMaxAcceleration = 12 -- arranca poco a poco: da emoción
		hinge.AngularVelocity = 0
		hinge.Parent = arm

		pcall(function()
			arm:SetNetworkOwner(nil) -- el servidor controla el brazo
		end)

		table.insert(handle.rings, {
			center = center,
			arm = arm,
			hinge = hinge,
			button = button,
			sign = sign,
			spinning = false,
		})
	end

	return handle
end

local function onButton(ring, pos: Vector3): boolean
	local d = pos - ring.center
	return Vector3.new(d.X, 0, d.Z).Magnitude < 3.4 and d.Y > PEDESTAL_H + 1
end

function Aspas.start(handle, rt)
	local cfg = Config.Aspas
	local R = cfg.Radio
	local ringBalloons = {} -- [Model] = { ring = n, angle = a }
	local total = 0

	for r, ring in handle.rings do
		ring.hinge.AngularVelocity = 0
		ring.button.Color = BUTTON_OFF
		ring.sign.Enabled = true
		ring.spinning = false
		for k = 0, cfg.GlobosPorAnillo - 1 do
			local a = (k + 0.5) / cfg.GlobosPorAnillo * math.pi * 2
			local pos = ring.center + Vector3.new(math.cos(a) * R, BALLOON_Y, math.sin(a) * R)
			local model = rt.addBalloon(pos, {})
			ringBalloons[model] = { ring = r, angle = a }
			total += 1
		end
	end

	local function update(_dt: number, hrp: BasePart)
		for r, ring in handle.rings do
			local on = onButton(ring, hrp.Position)
			if on ~= ring.spinning then
				ring.spinning = on
				ring.hinge.AngularVelocity = if on then cfg.VelocidadGiro else 0
				ring.button.Color = if on then BUTTON_ON else BUTTON_OFF
			end

			local d = ring.arm.Position - ring.center
			local armAngle = math.atan2(d.Z, d.X)
			local left = 0
			for model, info in ringBalloons do
				if not model.Parent then
					ringBalloons[model] = nil
				elseif info.ring == r then
					local diff = math.abs((armAngle - info.angle + math.pi) % (2 * math.pi) - math.pi)
					if diff < HIT_ANGLE then
						rt.pop(model)
					else
						left += 1
					end
				end
			end
			ring.sign.Enabled = left > 0
		end
	end

	local function stop()
		for _, ring in handle.rings do
			ring.hinge.AngularVelocity = 0
			ring.button.Color = BUTTON_OFF
			ring.spinning = false
		end
	end

	return { goal = total, update = update, stop = stop }
end

return Aspas
