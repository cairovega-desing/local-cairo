-- Crea globos. Los efectos de explosión (partículas, sonido, «+10») los dibuja
-- cada cliente en UI.client.luau para que se vean fluidos.

local CollectionService = game:GetService("CollectionService")

local Config = require(script.Parent.Config)

local Balloons = {}

Balloons.TAG = "GloboCarrera" -- el cliente usa esta etiqueta para hacerlos flotar

export type Options = {
	size: number?,
	color: Color3?,
	golden: boolean?,
	noString: boolean?,
	noBob: boolean?, -- true si el servidor mueve este globo (el cliente no lo hace flotar)
}

function Balloons.create(parent: Instance, position: Vector3, opts: Options): Model
	local size = opts.size or 3
	local golden = opts.golden == true
	local color = if golden
		then Config.ColorDorado
		else opts.color or Config.ColoresGlobo[math.random(#Config.ColoresGlobo)]

	local model = Instance.new("Model")
	model.Name = if golden then "GloboDorado" else "Globo"

	local body = Instance.new("Part")
	body.Name = "Cuerpo"
	body.Size = Vector3.new(size, size * 1.2, size)
	body.CFrame = CFrame.new(position)
	body.Color = color
	body.Material = if golden then Enum.Material.Neon else Enum.Material.SmoothPlastic
	body.Reflectance = if golden then 0 else 0.12
	body.Anchored = true
	body.CanCollide = false
	body.CanTouch = false
	local mesh = Instance.new("SpecialMesh")
	mesh.MeshType = Enum.MeshType.Sphere
	mesh.Parent = body
	body.Parent = model

	if not opts.noString then
		local knot = Instance.new("Part")
		knot.Name = "Nudo"
		knot.Size = Vector3.new(0.5, 0.4, 0.5)
		knot.CFrame = CFrame.new(position - Vector3.new(0, size * 0.62, 0))
		knot.Color = color
		knot.Anchored = true
		knot.CanCollide = false
		knot.CanTouch = false
		knot.CanQuery = false
		knot.Parent = model

		local thread = Instance.new("Part")
		thread.Name = "Hilo"
		thread.Size = Vector3.new(0.08, size * 0.7, 0.08)
		thread.CFrame = CFrame.new(position - Vector3.new(0, size * 0.62 + size * 0.35, 0))
		thread.Color = Color3.fromRGB(245, 245, 245)
		thread.Material = Enum.Material.SmoothPlastic
		thread.Anchored = true
		thread.CanCollide = false
		thread.CanTouch = false
		thread.CanQuery = false
		thread.Parent = model
	end

	if golden then
		local light = Instance.new("PointLight")
		light.Color = Config.ColorDorado
		light.Range = 8
		light.Brightness = 2
		light.Parent = body
	end

	model.PrimaryPart = body
	model:SetAttribute("Fase", math.random() * math.pi * 2)
	if opts.noBob then
		model:SetAttribute("SinFlotar", true)
	end
	model.ModelStreamingMode = Enum.ModelStreamingMode.Atomic
	CollectionService:AddTag(model, Balloons.TAG)
	model.Parent = parent
	return model
end

return Balloons
