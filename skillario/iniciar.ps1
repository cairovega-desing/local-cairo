# Abre Skillario: prende el servidor local (si no estaba) y abre la app en su propia ventana.
$Port = 8787
$url = "http://localhost:$Port/"

function Listo {
  try { (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1).StatusCode -eq 200 } catch { $false }
}

if (-not (Listo)) {
  Start-Process powershell -WindowStyle Hidden -ArgumentList @(
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$(Join-Path $PSScriptRoot 'servidor.ps1')`""
  )
  for ($i = 0; $i -lt 40 -and -not (Listo); $i++) { Start-Sleep -Milliseconds 150 }
}

# Edge viene con Windows; --app la abre como programa, sin barras del navegador.
try {
  Start-Process msedge -ArgumentList "--app=$url" -ErrorAction Stop
} catch {
  try { Start-Process chrome -ArgumentList "--app=$url" -ErrorAction Stop }
  catch { Start-Process $url }
}
