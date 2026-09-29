#!/usr/bin/env python3
"""Genera CONTEXTO_COMPLETO.md: un solo archivo con todo lo necesario para que
otra conversación de Claude siga trabajando (contexto + plan + todo el código).

Uso:  python3 tools/make_context.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "CONTEXTO_COMPLETO.md")

DOCS = ["CLAUDE.md", "PLAN.md", "PRUEBAS.md"]
CODE_DIRS = ["src", "tools"]
EXTRA = ["default.project.json", ".gitignore"]
LANG = {".luau": "lua", ".py": "python", ".json": "json", ".md": "markdown"}

INTRO = """# 🎈 Carrera de Globos — CONTEXTO COMPLETO para Claude

> **Para Claude:** este archivo trae todo lo necesario para seguir trabajando en el juego:
> quién es el usuario y qué quiere, cómo está hecho, cómo verificarlo y **el código completo**.
> 1. Lee primero «CLAUDE.md» (abajo).
> 2. Para reconstruir el proyecto, crea cada archivo de la sección «Código» con su ruta exacta.
> 3. Corre `python3 tools/build.py` para generar `CarreraDeGlobos.rbxmx`, lo que el usuario mete en Roblox Studio.
>
> Repo original: `cairovega-desing/local-cairo`, rama `ccr-f9dac4e9-zok3mj`.
> Los sonidos (`sounds/*.wav`) no van incluidos porque son binarios: se regeneran con
> `tools/make_sounds.py` y `tools/make_music.py` (necesitan numpy).

"""


def fence(text):
    # Usa una cerca más larga que cualquier secuencia de ``` dentro del texto
    longest = 3
    run = 0
    for ch in text:
        run = run + 1 if ch == "`" else 0
        longest = max(longest, run + 1)
    return "`" * longest


def main():
    parts = [INTRO]
    for doc in DOCS:
        path = os.path.join(ROOT, doc)
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                body = f.read()
            parts.append(f"\n---\n\n# 📄 {doc}\n\n")
            # Bajamos un nivel los títulos para que no se mezclen con los del contexto
            parts.append("\n".join("#" + line if line.startswith("#") else line for line in body.splitlines()))
            parts.append("\n")

    files = []
    for d in CODE_DIRS:
        for base, _, names in os.walk(os.path.join(ROOT, d)):
            for name in names:
                if name.endswith((".luau", ".py", ".json")):
                    files.append(os.path.relpath(os.path.join(base, name), ROOT))
    files = sorted(files) + [e for e in EXTRA if os.path.exists(os.path.join(ROOT, e))]

    parts.append("\n---\n\n# 💾 Código (crea cada archivo con esta ruta exacta)\n\n")
    parts.append("Archivos:\n" + "\n".join(f"- `{p}`" for p in files) + "\n")
    for rel in files:
        with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
            code = f.read()
        lang = LANG.get(os.path.splitext(rel)[1], "")
        mark = fence(code)
        parts.append(f"\n## `{rel}`\n\n{mark}{lang}\n{code.rstrip()}\n{mark}\n")

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("".join(parts))
    print(f"Listo: {os.path.relpath(OUT, ROOT)} ({os.path.getsize(OUT) // 1024} KB, {len(files)} archivos de código)")


if __name__ == "__main__":
    main()
