# Instala Skillario en esta PC y crea el acceso directo en el escritorio.
$ErrorActionPreference = 'Stop'
$destino = Join-Path $env:LOCALAPPDATA 'Skillario'

Write-Host ''
Write-Host '  Instalando Skillario...' -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path $destino | Out-Null
foreach ($item in @('app', 'servidor.ps1', 'iniciar.ps1', 'skillario.ico')) {
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot $item) -Destination $destino -Recurse -Force
}
# Quita la marca de "descargado de internet" para que Windows no bloquee los scripts.
Get-ChildItem -LiteralPath $destino -Recurse -File | Unblock-File

$escritorio = [Environment]::GetFolderPath('Desktop')
$shell = New-Object -ComObject WScript.Shell
$acceso = $shell.CreateShortcut((Join-Path $escritorio 'Skillario.lnk'))
$acceso.TargetPath = Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
$acceso.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$destino\iniciar.ps1`""
$acceso.WorkingDirectory = $destino
$acceso.IconLocation = "$destino\skillario.ico"
$acceso.WindowStyle = 7  # minimizado: casi no se ve la ventanita de PowerShell
$acceso.Description = 'Skillario: skills de Claude populares y útiles'
$acceso.Save()

Write-Host '  Listo. Ya tenés el ícono "Skillario" en el escritorio.' -ForegroundColor Green
Write-Host ''
Start-Process -FilePath $acceso.TargetPath -ArgumentList $acceso.Arguments -WindowStyle Hidden
