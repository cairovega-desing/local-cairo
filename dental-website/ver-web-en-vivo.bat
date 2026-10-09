@echo off
chcp 65001 >nul
title Web dental - en vivo
rem Descarga la web desde GitHub, la abre en http://localhost:3000
rem y cada 20 segundos trae los cambios nuevos (la pagina se actualiza sola).

set "DEST=%USERPROFILE%\web-dental-vivo"
set "BRANCH=claude/dental-site-design-improvements-the2lr"
set "REPO=https://github.com/cairovega-desing/local-cairo.git"

where git >nul 2>nul || (
  echo Instalando Git, acepta los permisos que te pida Windows...
  winget install -e --id Git.Git --accept-package-agreements --accept-source-agreements
  echo.
  echo Listo. Cerra esta ventana y volve a abrir este archivo.
  pause & exit /b
)
where node >nul 2>nul || (
  echo Instalando Node.js, acepta los permisos que te pida Windows...
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  echo.
  echo Listo. Cerra esta ventana y volve a abrir este archivo.
  pause & exit /b
)

if not exist "%DEST%\.git" (
  echo Descargando la web por primera vez. Si te pide iniciar sesion en GitHub, hacelo.
  git clone --depth 1 --branch "%BRANCH%" --filter=blob:none --sparse "%REPO%" "%DEST%" || (echo No se pudo descargar. Copia el error y mandaselo a Claude. & pause & exit /b 1)
  git -C "%DEST%" sparse-checkout set dental-website
)

echo Buscando cambios nuevos...
git -C "%DEST%" pull -q

cd /d "%DEST%\dental-website"
if not exist node_modules (
  echo Instalando lo necesario. La primera vez tarda unos minutos, no cierres la ventana...
  call npm install --no-audit --no-fund || (echo Fallo la instalacion. Copia el error y mandaselo a Claude. & pause & exit /b 1)
)

rem Ventana aparte que trae los cambios cada 20 segundos
start "Actualizador web dental (no cerrar)" /min cmd /c "for /l %%i in () do (git -C "%DEST%" pull -q & timeout /t 20 /nobreak >nul)"

echo.
echo La web se abre en http://localhost:3000
echo Cuando Claude haga cambios, en unos segundos se ven solos en el navegador.
echo Para apagar todo, cerra esta ventana y la del actualizador.
echo.
start "" cmd /c "timeout /t 15 /nobreak >nul & start http://localhost:3000"
call npm run dev
pause
