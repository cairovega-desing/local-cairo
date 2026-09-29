--[[
	Una carrera completa: prepara los globos de cada etapa, hace la cuenta atrás,
	explota globos cuando tu cuerpo los toca, abre puertas y anuncia al ganador.
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local Workspace = game:GetService("Workspace")

local Config = require(script.Parent.Config)
local Balloons = require(script.Parent.Balloons)
local Datos = require(script.Parent.Datos)
local Recompensas = require(script.Parent.Recompensas)
local Tablas = require(script.Parent.Tablas)

local Race = {}

-- Último estado de la barra de carrera (para quien entra a mitad de una carrera)
Race.lastProgress = nil :: { any }?

local function getCharacter(player: Player): (Humanoid?, BasePart?)
	local character = player.Character
	if not character then
		return nil, nil
	end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	local root = character:FindFirstChild("HumanoidRootPart")
	if humanoid and humanoid.Health > 0 and root and root:IsA("BasePart") then
		return humanoid, root
	end
	return nil, nil
end

local function teleport(player: Player, cframe: CFrame)
	local character = player.Character
	if character then
		character:PivotTo(cframe)
	end
end

local function setBarriers(stageMap, open: boolean)
	for _, barrier in stageMap.barriers do
		local part = barrier.part
		if open then
			part.CanCollide = false
			TweenService:Create(part, TweenInfo.new(0.6, Enum.EasingStyle.Back, Enum.EasingDirection.In), {
				CFrame = barrier.cframe - Vector3.new(0, part.Size.Y + 0.5, 0),
			}):Play()
		else
			part.CFrame = barrier.cframe
			part.CanCollide = true
		end
	end
end

function Race.run(map, players: { Player }, remote: RemoteEvent)
	local raceFolder = Instance.new("Folder")
	raceFolder.Name = "CarreraActiva"
	raceFolder.Parent = Workspace

	local seed = math.random(1, 1000000)
	local lanes = {}
	local connections: { RBXScriptConnection } = {}
	local cleaned = false
	local countingDown = true
	local startTime = os.clock()

	local function checkpoint(lane): CFrame
		for s, st in lane.stages do
			if not st.done then
				return lane.map.stages[s].entryCFrame
			end
		end
		return lane.map.finishCFrame
	end

	local function broadcastProgress()
		local list = {}
		for _, lane in lanes do
			table.insert(list, {
				name = lane.player.DisplayName,
				userId = lane.player.UserId,
				cleared = lane.cleared,
				lane = lane.index,
			})
		end
		Race.lastProgress = { list, #map.lanes[1].stages }
		remote:FireAllClients("carrera", list, #map.lanes[1].stages)
	end

	local function updateDoor(lane, s: number)
		local st = lane.stages[s]
		if not st.done then
			lane.map.stages[s].doorLabel.Text = string.format("🎈 %d / %d", math.min(st.popped, st.goal), st.goal)
		end
	end

	local function clearStage(lane, s: number)
		local st = lane.stages[s]
		st.done = true
		lane.cleared += 1
		local stageMap = lane.map.stages[s]
		stageMap.doorLabel.Text = "✅ ¡ABIERTO!"
		setBarriers(stageMap, true)
		remote:FireAllClients("puerta", stageMap.door.Position, lane.player.UserId, s, #lane.stages)
		broadcastProgress()
	end

	-- Suma un punto a la etapa (globo explotado o golpe al globo gigante)
	local function score(lane, s: number, pos: Vector3, color: Color3, radius: number, golden: boolean)
		local st = lane.stages[s]
		st.popped += 1
		local points = if golden then Config.PuntosDorado else Config.PuntosGlobo
		lane.points += points
		remote:FireAllClients("globo", pos, color, radius, lane.player.UserId, points, golden)
		Datos.add(lane.player, "Globos", 1)
		updateDoor(lane, s)
		remote:FireClient(lane.player, "progreso", s, math.min(st.popped, st.goal), st.goal, lane.points)
		if not st.done and st.popped >= st.goal then
			clearStage(lane, s)
		end
	end

	local function popBalloon(lane, s: number, model: Model)
		if cleaned then
			return
		end
		local st = lane.stages[s]
		local info = st.balloons[model]
		if not info then
			return
		end
		st.balloons[model] = nil
		model:Destroy()
		score(lane, s, info.pos, info.color, info.radius, info.golden)
	end

	local function endPower(lane)
		if lane.aura then
			lane.aura:Destroy()
			lane.aura = nil
		end
		local humanoid = getCharacter(lane.player)
		if humanoid and not cleaned then
			humanoid.WalkSpeed = Config.VelocidadCarrera
		end
	end

	local function powerUp(lane, seconds: number)
		lane.powerUntil = os.clock() + seconds
		local humanoid, root = getCharacter(lane.player)
		if humanoid then
			humanoid.WalkSpeed = Config.VelocidadCarrera + Config.Laberinto.PoderVelocidadExtra
		end
		if root and not lane.aura then
			local aura = Instance.new("ParticleEmitter")
			aura.Name = "AuraPoder"
			aura.Color = ColorSequence.new(Color3.fromRGB(200, 90, 255))
			aura.LightEmission = 1
			aura.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 1.4), NumberSequenceKeypoint.new(1, 0) })
			aura.Transparency = NumberSequence.new(0.1, 1)
			aura.Lifetime = NumberRange.new(0.4, 0.8)
			aura.Rate = 70
			aura.Speed = NumberRange.new(2, 6)
			aura.SpreadAngle = Vector2.new(180, 180)
			local light = Instance.new("PointLight")
			light.Color = Color3.fromRGB(200, 90, 255)
			light.Range = 12
			light.Brightness = 3
			light.Parent = aura
			aura.Parent = root
			lane.aura = aura
		end
		remote:FireClient(lane.player, "poderJugador", seconds)
		task.delay(seconds, function()
			if os.clock() >= lane.powerUntil - 0.05 then
				endPower(lane)
			end
		end)
	end

	-- Limpieza: SIEMPRE se ejecuta (aunque haya un error), así nadie queda atrapado
	local function cleanup()
		Race.lastProgress = nil
		cleaned = true
		for _, connection in connections do
			connection:Disconnect()
		end
		for _, lane in lanes do
			endPower(lane)
			if lane.player.Parent == Players then
				local humanoid, root = getCharacter(lane.player)
				if root then
					root.Anchored = false
				end
				if humanoid then
					humanoid.WalkSpeed = Config.VelocidadNormal
				end
				teleport(lane.player, map.lobbyCFrame * CFrame.new(0, 0, (lane.index - 1.5) * 6))
			end
			for s, st in lane.stages do
				if st.stop then
					st.stop()
				end
				table.clear(st.balloons)
				local stageMap = lane.map.stages[s]
				setBarriers(stageMap, false)
				stageMap.doorLabel.Text = "🎈"
			end
		end
		raceFolder:Destroy()
		remote:FireAllClients("fin")
	end

	local function body()
		-- ─── Preparar cada pista ───────────────────────────────────────────
		for i, player in players do
			local laneMap = map.lanes[i]
			local lane = {
				player = player,
				index = i,
				map = laneMap,
				stages = {},
				current = -1,
				cleared = 0,
				points = 0,
				powerUntil = 0,
				aura = nil :: ParticleEmitter?,
				won = false,
			}
			lanes[i] = lane

			for s, stageMap in laneMap.stages do
				local st = { balloons = {}, popped = 0, goal = 0, done = false, update = nil, stop = nil }
				lane.stages[s] = st
				setBarriers(stageMap, false)

				local rng = Random.new(seed + s) -- misma semilla en las dos pistas
				local rt = {
					player = player,
					folder = raceFolder,
					rng = rng,
				}
				function rt.addBalloon(pos: Vector3, opts)
					-- Siempre usamos el rng las mismas veces para que las dos pistas sean idénticas
					local color = Config.ColoresGlobo[rng:NextInteger(1, #Config.ColoresGlobo)]
					local golden = rng:NextNumber() < Config.ProbabilidadDorado
					if opts.golden ~= nil then
						golden = opts.golden
					end
					local size = opts.size or 3
					local model = Balloons.create(raceFolder, pos, {
						size = size,
						color = opts.color or color,
						golden = golden,
						noString = opts.noString,
						noBob = opts.noBob,
					})
					local body = model.PrimaryPart :: BasePart
					st.balloons[model] = { pos = pos, radius = size * 0.55, golden = golden, color = body.Color }
					return model
				end
				function rt.pop(model: Model)
					popBalloon(lane, s, model)
				end
				function rt.balloons()
					return st.balloons
				end
				function rt.move(model: Model, pos: Vector3)
					local info = st.balloons[model]
					if info then
						info.pos = pos
						model:PivotTo(CFrame.new(pos))
					end
				end
				function rt.hit(pos: Vector3, color: Color3, radius: number)
					if not cleaned then
						score(lane, s, pos, color, radius, false)
					end
				end
				function rt.done(): boolean
					return st.done
				end
				function rt.bounce(velocity: Vector3)
					remote:FireClient(player, "rebote", velocity)
				end
				function rt.fx(kind: string, ...)
					remote:FireAllClients(kind, ...)
				end
				function rt.powerUp(seconds: number)
					powerUp(lane, seconds)
				end

				local control = stageMap.module.start(stageMap.handle, rt)
				st.goal = control.goal
				st.update = control.update
				st.stop = control.stop
				updateDoor(lane, s)
			end
			for s, st in lane.stages do
				if st.goal <= 0 then
					clearStage(lane, s)
				end
			end
		end

		-- Si alguien se muere o se reinicia, reaparece en su última puerta
		for _, lane in lanes do
			table.insert(
				connections,
				lane.player.CharacterAdded:Connect(function(character)
					local root = character:WaitForChild("HumanoidRootPart", 10)
					local humanoid = character:WaitForChild("Humanoid", 10) :: Humanoid?
					if cleaned or not root then
						return
					end
					task.wait()
					lane.aura = nil
					if countingDown then
						-- Reiniciarse en la cuenta atrás no da ventaja: vuelves a la salida, quieto
						local frozen = root :: BasePart
						character:PivotTo(lane.map.startCFrame)
						frozen.Anchored = true
						return
					end
					character:PivotTo(checkpoint(lane))
					if humanoid then
						humanoid.WalkSpeed = Config.VelocidadCarrera
					end
				end)
			)
		end

		-- ─── Cuenta atrás ──────────────────────────────────────────────────
		for _, lane in lanes do
			local _, root = getCharacter(lane.player)
			if root then
				teleport(lane.player, lane.map.startCFrame)
				root.Anchored = true
			end
		end
		broadcastProgress()
		for n = Config.CuentaAtras, 1, -1 do
			remote:FireAllClients("cuenta", n)
			task.wait(1)
		end
		remote:FireAllClients("cuenta", 0)
		countingDown = false
		startTime = os.clock()
		for _, lane in lanes do
			local humanoid, root = getCharacter(lane.player)
			if root then
				root.Anchored = false
			end
			if humanoid then
				humanoid.WalkSpeed = Config.VelocidadCarrera
			end
		end

		-- ─── Bucle de la carrera ───────────────────────────────────────────
		local laneCount = 0
		for _ in lanes do
			laneCount += 1
		end

		local function stepLane(lane, root: BasePart, dt: number)
			local pos = root.Position
			if pos.Y < map.floorY - 30 then
				teleport(lane.player, checkpoint(lane))
				return
			end

			-- ¿En qué etapa está? (para mostrar el cartel e instrucciones)
			local current = 0
			for s, stageMap in lane.map.stages do
				if pos.X >= stageMap.x0 and pos.X < stageMap.x1 + 2 then
					current = s
				end
			end
			if current ~= lane.current then
				lane.current = current
				if current > 0 then
					local st = lane.stages[current]
					local module = lane.map.stages[current].module
					remote:FireClient(
						lane.player,
						"etapa",
						current,
						#lane.stages,
						module.Title,
						module.Hint,
						math.min(st.popped, st.goal),
						st.goal,
						st.done
					)
				end
			end

			-- Tu cuerpo explota los globos que toca
			local reach = Config.AlcanceCuerpo
			if os.clock() < lane.powerUntil then
				reach += Config.Laberinto.PoderAlcanceExtra
			end
			for s, st in lane.stages do
				for model, info in st.balloons do
					if (info.pos - pos).Magnitude <= info.radius + reach then
						popBalloon(lane, s, model)
					end
				end
				if st.update then
					st.update(dt, root, s == current)
				end
			end

			if lane.cleared >= #lane.stages and pos.X >= lane.map.finishX then
				lane.won = true
			end
		end

		local winner = nil
		local timedOut = false
		while not winner do
			local dt = RunService.Heartbeat:Wait()
			if os.clock() - startTime > Config.TiempoMaximoCarrera then
				timedOut = true
				break
			end
			local present = {}
			for _, lane in lanes do
				if lane.player.Parent == Players then
					table.insert(present, lane)
				end
			end
			if #present == 0 then
				break
			end
			if #present == 1 and laneCount > 1 then
				winner = present[1] -- el rival se fue
				break
			end
			for _, lane in present do
				local _, root = getCharacter(lane.player)
				if root then
					stepLane(lane, root, dt)
					if lane.won then
						winner = lane
						break
					end
				end
			end
		end

		-- ─── Ganador ──────────────────────────────────────────────────────
		if timedOut then
			remote:FireAllClients("aviso", "⏱ ¡Se acabó el tiempo!", "Nadie llegó a la meta. ¡Otra vez!")
			task.wait(3)
		elseif winner and not winner.won then
			-- El rival se fue: no cuenta como Win (evita hacer trampa con otra cuenta)
			remote:FireClient(winner.player, "aviso", "Tu rival se fue 😢", "Esta carrera no cuenta. ¡Busca otro rival!")
			task.wait(3)
		elseif winner then
			local seconds = os.clock() - startTime
			local isRecord = Tablas.recordTime(winner.player, seconds)
			remote:FireAllClients(
				"ganador",
				winner.player.DisplayName,
				winner.player.UserId,
				winner.points,
				seconds,
				isRecord,
				laneCount == 1,
				(tonumber(winner.player:GetAttribute("Racha")) or 0) + (if laneCount > 1 then 1 else 0)
			)
			-- El ganador se queda quieto (así puede bailar) y le ponemos una corona
			local winnerHumanoid = getCharacter(winner.player)
			if winnerHumanoid then
				winnerHumanoid.WalkSpeed = 0
			end
			local head = winner.player.Character and winner.player.Character:FindFirstChild("Head")
			if head and head:IsA("BasePart") then
				local crown = Instance.new("BillboardGui")
				crown.Name = "CoronaGanador"
				crown.Size = UDim2.fromScale(4, 4)
				crown.StudsOffset = Vector3.new(0, 4.5, 0)
				crown.LightInfluence = 0
				local icon = Instance.new("TextLabel")
				icon.Size = UDim2.fromScale(1, 1)
				icon.BackgroundTransparency = 1
				icon.TextScaled = true
				icon.Text = "👑"
				icon.Parent = crown
				crown.Parent = head
				task.delay(Config.TiempoCelebracion, function()
					crown:Destroy()
				end)
			end

			-- Racha de victorias seguidas (solo en 1 contra 1)
			local streak = 0
			if laneCount > 1 then
				streak = (tonumber(winner.player:GetAttribute("Racha")) or 0) + 1
				winner.player:SetAttribute("Racha", streak)
				for _, lane in lanes do
					if lane ~= winner and lane.player.Parent == Players then
						lane.player:SetAttribute("Racha", 0)
						Recompensas.apply(lane.player)
					end
				end
			end
			-- Contra el reloj (solo) no suma Win: solo cuenta el tiempo
			if laneCount > 1 then
				Datos.add(winner.player, "Wins", 1)
				Tablas.saveWins(winner.player)
				Recompensas.onWin(winner.player)
			end
			task.wait(Config.TiempoCelebracion)
		end
		for _, lane in lanes do
			if lane.player.Parent == Players then
				Tablas.saveGlobos(lane.player)
			end
		end
		Tablas.refreshSoon()
	end

	local ok, err = pcall(body)
	cleanup()
	if not ok then
		error(err, 0)
	end
end

return Race
