# Servidor local de Skillario: sirve la carpeta "app" solo en esta PC (http://localhost:8787).
# Se apaga solo después de 30 minutos sin pedidos; el ícono del escritorio lo vuelve a prender.
param([int]$Port = 8787)

$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'app')) + [IO.Path]::DirectorySeparatorChar
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try { $listener.Start() } catch { exit 0 }  # ya estaba prendido

$tipos = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json'; '.webmanifest' = 'application/manifest+json'
  '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.ico' = 'image/x-icon'
}

while ($listener.IsListening) {
  $tarea = $listener.GetContextAsync()
  if (-not $tarea.Wait([TimeSpan]::FromMinutes(30))) { break }
  $ctx = $tarea.Result
  $res = $ctx.Response
  try {
    $ruta = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrEmpty($ruta)) { $ruta = 'index.html' }
    $archivo = [IO.Path]::GetFullPath((Join-Path $root $ruta))
    # Solo archivos de adentro de la carpeta "app"
    if ($archivo.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $archivo -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($archivo)
      $tipo = $tipos[[IO.Path]::GetExtension($archivo).ToLower()]
      if (-not $tipo) { $tipo = 'application/octet-stream' }
      $res.ContentType = $tipo
      $res.Headers.Add('Cache-Control', 'no-cache')
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
    }
  } catch {
    $res.StatusCode = 500
  } finally {
    $res.Close()
  }
}
$listener.Stop()
