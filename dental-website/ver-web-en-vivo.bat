@echo off
chcp 65001 >nul
title Web dental - en vivo
rem Descarga la web desde GitHub, la abre en http://localhost:3000
rem y cada 20 segundos trae los cambios nuevos (la pagina se actualiza sola).

set "DEST=%USERPROFILE%\web-dental-vivo"
set "BRANCH=claude/dental-site-design-improvements-the2lr"
set "REPO=https://github.com/cairovega-desing/local-cairo.git"
rem Rutas donde se instalan Git y Node, por si la ventana todavia no las conoce
set "PATH=%PATH%;%ProgramFiles%\Git\cmd;%ProgramFiles%\nodejs;%APPDATA%\npm"

echo [1/5] Revisando Git...
where git >nul 2>nul || (
  echo     No esta instalado. Instalando Git, acepta los permisos que pida Windows...
  winget install -e --id Git.Git --accept-package-agreements --accept-source-agreements
)
where git >nul 2>nul || (
  echo.
  echo     ERROR: no se pudo instalar Git. Instalalo desde https://git-scm.com y volve a abrir este archivo.
  pause & exit /b 1
)

echo [2/5] Revisando Node.js...
where node >nul 2>nul || (
  echo     No esta instalado. Instalando Node.js, acepta los permisos que pida Windows...
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
)
where node >nul 2>nul || (
  echo.
  echo     ERROR: no se pudo instalar Node.js. Instalalo desde https://nodejs.org y volve a abrir este archivo.
  pause & exit /b 1
)

echo [3/5] Descargando la ultima version de la web...
if not exist "%DEST%\.git" (
  git clone --depth 1 --branch "%BRANCH%" --filter=blob:none --sparse "%REPO%" "%DEST%" || (
    echo.
    echo     ERROR: no se pudo descargar. Saca una foto de esta ventana y mandasela a Claude.
    pause & exit /b 1
  )
  git -C "%DEST%" sparse-checkout set dental-website
)
git -C "%DEST%" pull -q

cd /d "%DEST%\dental-website" || (
  echo     ERROR: no encuentro la carpeta de la web. Saca una foto de esta ventana y mandasela a Claude.
  pause & exit /b 1
)

echo [4/5] Instalando lo necesario (la primera vez tarda varios minutos, no cierres la ventana)...
if not exist node_modules\next (
  call npm install --no-audit --no-fund || (
    echo.
    echo     ERROR: fallo la instalacion. Saca una foto de esta ventana y mandasela a Claude.
    pause & exit /b 1
  )
)

rem Ventana aparte que trae los cambios cada 20 segundos
start "Actualizador web dental (no cerrar)" /min cmd /c "for /l %%i in () do (git -C "%DEST%" pull -q & timeout /t 20 /nobreak >nul)"

rem Abre el navegador recien cuando la web responde
start "" /min cmd /c "for /l %%i in (1,1,90) do (curl -s -o nul http://localhost:3000 && (start http://localhost:3000 & exit) & timeout /t 2 /nobreak >nul)"

echo [5/5] Arrancando la web. En cuanto este lista se abre sola en el navegador.
echo     Direccion: http://localhost:3000
echo     Si no se abre, entra a esa direccion a mano y espera unos segundos.
echo     No cierres esta ventana: si la cerras, la web se apaga.
echo.
call npm run dev
echo.
echo La web se detuvo. Si ves un error arriba, saca una foto y mandasela a Claude.
pause
