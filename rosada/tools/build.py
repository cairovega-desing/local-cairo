#!/usr/bin/env python3
"""Arma el juego en un solo archivo.

- dist/index.html  → página completa: se abre con doble clic o se sube a Netlify/GitHub Pages.
- dist/pagina.html → mismo juego sin <html>/<head>/<body>, para publicarlo como página de Claude.

Uso: python3 rosada/tools/build.py
"""
import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DIST = RAIZ / "dist"


def main() -> None:
    html = (RAIZ / "index.html").read_text(encoding="utf-8")

    def css(m: re.Match) -> str:
        ruta = RAIZ / m.group(1)
        return "<style>\n" + ruta.read_text(encoding="utf-8") + "\n</style>"

    def js(m: re.Match) -> str:
        ruta = RAIZ / m.group(1)
        codigo = ruta.read_text(encoding="utf-8")
        if "</script" in codigo:
            raise SystemExit(f"{ruta} contiene '</script' y rompería el HTML")
        return f"<script>\n// ── {m.group(1)} ──\n{codigo}\n</script>"

    html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', css, html)
    html = re.sub(r'<script src="(js/[^"]+)"></script>', js, html)
    html = html.replace("<!-- ORDEN DE CARGA (tools/build.py usa esta lista) -->\n", "")
    DIST.mkdir(exist_ok=True)
    (DIST / "index.html").write_text(html, encoding="utf-8")

    # Versión para publicar: solo lo de adentro del <head> y del <body>.
    cabeza = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
    cuerpo = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
    cabeza = re.sub(r'<meta charset="utf-8">\s*', "", cabeza)
    cabeza = re.sub(r'<meta name="viewport"[^>]*>\s*', "", cabeza)
    pagina = cabeza.strip() + "\n" + cuerpo.strip() + "\n"
    # El <title> tiene que estar en los primeros 8 KB.
    assert pagina.find("<title>") < 8000
    (DIST / "pagina.html").write_text(pagina, encoding="utf-8")

    kb = (DIST / "index.html").stat().st_size / 1024
    print(f"✅ dist/index.html ({kb:.0f} KB) y dist/pagina.html")


if __name__ == "__main__":
    main()
