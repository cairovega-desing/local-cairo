# Borra Skillario de esta PC (la carpeta y el ícono del escritorio).
$destino = Join-Path $env:LOCALAPPDATA 'Skillario'
Remove-Item -LiteralPath (Join-Path ([Environment]::GetFolderPath('Desktop')) 'Skillario.lnk') -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $destino -Recurse -Force -ErrorAction SilentlyContinue
Write-Host '  Skillario se desinstaló.' -ForegroundColor Green
