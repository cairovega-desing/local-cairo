--[[
	ETAPA: TRAMPOLINES
	Pisa un trampolín y sales volando hacia arriba, reventando la torre de
	globos que tiene encima. (El salto lo aplica el cliente: ver UI.client.luau)
]]

local Config = require(script.Parent.Parent.Config)
local Util = require(script.Parent.Parent.Util)

local Trampolines = {}

Trampolines.Title = "Trampolines"
Trampolines.Hint = "¡Pisa los trampolines y vuela!"
Trampolines.TAG = "TrampolinCarrera"

local SPACING = 10

function Trampolines.length(): number
	return Config.Trampolines.Cantidad * SPACING + 8
end

function Trampolines.build(ctx)
	local cfg = Config.Trampolines
	local pads = {}
	for k = 1, cfg.Cantidad do
		local x = ctx.x0 + 4 + (k - 0.5) * SPACING
		local z = ctx.z + (if k % 2 == 1 then -6 else 6)
		local center = Vector3.new(x, ctx.floor, z)
		Util.cylinder(center + Vector3.new(0, 0.3, 0), 0.6, 7, {
			Name = "BaseTrampolin",
			Color = Color3.fromRGB(40, 40, 50),
			Parent = ctx.folder,
		})
		local pad = Util.cylinder(center + Vector3.new(0, 0.7, 0), 0.25, 5.5, {
			Name = "Trampolin",
			Color = Color3.fromRGB(90, 255, 120),
			Material = Enum.Material.Neon,
			Parent = ctx.folder,
		})
		pad:SetAttribute("Fuerza", cfg.Fuerza)
		pad:AddTag(Trampolines.TAG)
		table.insert(pads, center)
	end
	return { pads = pads, floor = ctx.floor }
end

function Trampolines.start(handle, rt)
	local cfg = Config.Trampolines
	local total = 0
	for _, center in handle.pads do
		for n = 1, cfg.GlobosPorTrampolin do
			rt.addBalloon(center + Vector3.new(0, 2 + n * 5, 0), {})
			total += 1
		end
	end
	return { goal = total }
end

return Trampolines
