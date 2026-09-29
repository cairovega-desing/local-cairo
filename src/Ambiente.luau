--[[
	AMBIENTE: iluminación alegre tipo «juguete». Colores más vivos, brillo
	en lo neón, rayos de sol y un cielo suave. Se desactiva con
	Config.MejorarIluminacion = false (si prefieres tu propia iluminación).
]]

local Lighting = game:GetService("Lighting")

local Config = require(script.Parent.Config)

local Ambiente = {}

local function effect(className: string, name: string, props: { [string]: any })
	local inst = Lighting:FindFirstChild(name)
	if not inst then
		inst = Instance.new(className)
		inst.Name = name
	end
	for key, value in props do
		(inst :: any)[key] = value
	end
	inst.Parent = Lighting
	return inst
end

function Ambiente.apply()
	if not Config.MejorarIluminacion then
		return
	end

	Lighting.ClockTime = 14.5
	Lighting.Brightness = 2.5
	Lighting.GlobalShadows = true
	Lighting.Ambient = Color3.fromRGB(95, 85, 120)
	Lighting.OutdoorAmbient = Color3.fromRGB(160, 150, 180)
	Lighting.EnvironmentDiffuseScale = 1
	Lighting.EnvironmentSpecularScale = 1
	Lighting.ShadowSoftness = 0.3

	effect("ColorCorrectionEffect", "ColorCarrera", {
		Saturation = 0.25,
		Contrast = 0.08,
		Brightness = 0.02,
		TintColor = Color3.fromRGB(255, 248, 242),
	})
	effect("BloomEffect", "BrilloCarrera", {
		Intensity = 0.7,
		Size = 28,
		Threshold = 1.4, -- solo brilla lo neón (globos dorados, botones, meta)
	})
	effect("SunRaysEffect", "RayosCarrera", {
		Intensity = 0.05,
		Spread = 0.7,
	})
	effect("Atmosphere", "CieloCarrera", {
		Density = 0.18,
		Offset = 0.15,
		Color = Color3.fromRGB(205, 225, 255),
		Decay = Color3.fromRGB(255, 200, 230),
		Glare = 0.25,
		Haze = 1,
	})
end

return Ambiente
