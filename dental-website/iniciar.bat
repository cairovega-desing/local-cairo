@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Web Consultorio - servidor local

echo Verificando que Node.js este instalado...
where node >nul 2>nul || (echo No se encontro Node.js. Instalalo desde nodejs.org y volve a abrir este archivo. & pause & exit /b 1)

if not exist node_modules (
  echo Instalando dependencias. Esto tarda un par de minutos, no cierres la ventana...
  call npm install || (echo Fallo la instalacion. Copia el error y mandaselo a Claude. & pause & exit /b 1)
)

echo.
echo Iniciando el sitio. En unos segundos se abre el navegador en http://localhost:3000
echo Para apagarlo, cerra esta ventana o presiona Ctrl + C.
echo.
start "" cmd /c "timeout /t 12 /nobreak >nul & start http://localhost:3000"
call npm run dev
pause
