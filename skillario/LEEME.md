# Skillario (versión para tu PC)

Las skills de Claude más populares y útiles de GitHub, con filtro de seguridad, en tu escritorio.
Corre en tu compu (`http://localhost:8787`) y no necesita instalar nada: usa PowerShell, que ya viene con Windows.

## Instalar
1. Descomprimí `Skillario.zip`.
2. Doble clic en **`Instalar Skillario.bat`**.
   - Si Windows muestra «Windows protegió su PC», tocá **Más información → Ejecutar de todas formas**.
3. Listo: aparece el ícono **Skillario** en el escritorio y se abre la app.

Se instala en `%LOCALAPPDATA%\Skillario`. Ya podés borrar la carpeta descomprimida.

## Desinstalar
Doble clic en **`Desinstalar Skillario.bat`**.

## Cómo funciona
- `servidor.ps1` sirve la carpeta `app` solo para esta PC. Se apaga solo tras 30 minutos sin uso.
- `iniciar.ps1` prende el servidor si hace falta y abre la app en una ventana propia de Edge (o Chrome).
- La app busca los datos en vivo en GitHub y guarda tus favoritas en esta PC.
- **Copiar para Claude** copia tus listas para pegarlas en el chat con Claude.
