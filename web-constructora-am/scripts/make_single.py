"""Arma un único archivo HTML con toda la web adentro, para mandar por WhatsApp.

Parte de la compilación especial (`SINGLE_FILE=1 next build --webpack`, en .next-single/)
y mete dentro del HTML: el JavaScript, el CSS, las tipografías, las fotos y el ícono.
El archivo resultante no necesita carpetas al lado: se abre solo.

Uso:  npm run single   →   Constructora-AM.html
"""
from __future__ import annotations

import base64
import mimetypes
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / ".next-single"
PUBLIC = ROOT / "public"
OUT = ROOT / "Constructora-AM.html"


def data_uri(path: Path, mime: str | None = None) -> str:
    mime = mime or mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def main() -> None:
    html = (BUILD / "index.html").read_text(encoding="utf-8")

    # 1) CSS con las tipografías incrustadas → <style>. El <link> queda apuntando a un CSS vacío
    #    (la misma URL que figura en los datos de React, así no intenta descargar nada).
    css_links = re.findall(r'<link rel="stylesheet" href="(/_next/static/css/[^"]+\.css)"[^>]*/>', html)
    styles = ""
    for href in css_links:
        css = (BUILD / href.lstrip("/")).read_text(encoding="utf-8")
        css = re.sub(
            r"url\((/_next/static/media/[^)]+)\)",
            lambda m: f"url({data_uri(BUILD / m.group(1).lstrip('/'), 'font/woff2')})",
            css,
        )
        styles += f"<style>{css}</style>"
        html = html.replace(href, "data:text/css,")
    html = html.replace("</head>", styles + "</head>", 1)

    # 2) Fuera precargas (fuentes y scripts) y el polyfill para navegadores viejos. Las precargas de
    #    fuentes que figuran en los datos de React apuntan a una fuente vacía (la real ya está en el CSS).
    html = re.sub(r'<link rel="preload"[^>]*/>', "", html)
    html = re.sub(r"/_next/static/media/[\w.-]+\.woff2", "data:font/woff2,", html)
    html = re.sub(r'<script src="[^"]*polyfills[^"]*" noModule=""></script>', "", html)

    # 3) Scripts: se sacan de su lugar y se incrustan al final del <body>, con el runtime primero.
    tags = re.findall(r'<script src="(/_next/static/chunks/[^"]+\.js)"([^>]*)></script>', html)
    for src, attrs in tags:
        html = html.replace(f'<script src="{src}"{attrs}></script>', "", 1)
    # Orden: runtime de webpack, luego el resto, y al final main-app (que arranca React y pide los demás).
    tags.sort(key=lambda t: 0 if "/webpack-" in t[0] else 2 if "/main-app-" in t[0] else 1)
    # Next.js deduce su ruta base de `document.currentScript.src` (que debe contener /_next/). Como los
    # scripts van incrustados, mientras arrancan se le muestra un <script> ficticio con esa ruta.
    scripts = (
        "<script>(function(){var s=document.createElement('script');"
        "s.src=new URL('/_next/static/chunks/app.js',location.href).href;"
        "Object.defineProperty(document,'currentScript',{configurable:true,get:function(){return s}})})()</script>"
    )
    for src, attrs in tags:
        js = (BUILD / src.lstrip("/")).read_text(encoding="utf-8").replace("</script", "<\\/script")
        script_id = ' id="_R_"' if 'id="_R_"' in attrs else ""
        scripts += f"<script{script_id}>{js}</script>"
    scripts += "<script>delete document.currentScript</script>"
    html = html.replace("</body>", scripts + "</body>", 1)

    # 4) Fotos e ícono incrustados (en el HTML y en los datos de React, para que coincidan).
    def img(m: re.Match[str]) -> str:
        return data_uri(PUBLIC / m.group(1))

    html = re.sub(r"(?<![\w/])(?:\./)?(images/[\w/-]+\.(?:jpg|png))", img, html)
    html = html.replace('href="./favicon.svg"', f'href="{data_uri(PUBLIC / "favicon.svg", "image/svg+xml")}"')

    leftovers = sorted(set(re.findall(r'(?:"|\()(?:\./|/)(?:_next|images)/[^"\\)]+', html)))
    if leftovers:
        raise SystemExit(f"Quedaron rutas sin incrustar: {leftovers[:5]}")

    OUT.write_text(html, encoding="utf-8")
    print(f"Listo: {OUT.name} ({OUT.stat().st_size / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    main()
