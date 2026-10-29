"""Arma Web_ConstructoraAM.zip con el sitio listo para abrir y el código fuente.

Estructura del zip:
  Web_ConstructoraAM/
    index.html, _next/, images/, favicon.svg   ← el sitio (doble clic en index.html)
    LEEME - como abrir.txt
    codigo-fuente/                              ← proyecto Next.js
"""
from __future__ import annotations

import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NAME = "Web_ConstructoraAM"
ZIP = ROOT / f"{NAME}.zip"

SOURCE = [
    "src", "public", "scripts", "package.json", "package-lock.json", "next.config.ts",
    "tsconfig.json", "postcss.config.mjs", ".gitignore", "README.md", "LEEME - como abrir.txt",
]
# Archivos del export que no hacen falta para abrir la página.
SKIP_OUT = {"404.html", "_not-found.html", "_not-found.txt"}


def add_tree(zf: zipfile.ZipFile, src: Path, dest: str) -> None:
    if src.is_file():
        zf.write(src, dest)
        return
    for f in sorted(src.rglob("*")):
        if f.is_file() and "__pycache__" not in f.parts:
            zf.write(f, f"{dest}/{f.relative_to(src).as_posix()}")


def main() -> None:
    out = ROOT / "out"
    if not (out / "index.html").exists():
        raise SystemExit("Falta out/index.html: corré `npm run build` primero.")
    ZIP.unlink(missing_ok=True)
    with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for f in sorted(out.rglob("*")):
            rel = f.relative_to(out)
            if f.is_file() and rel.parts[0] not in SKIP_OUT and rel.parts[0] != "_not-found":
                zf.write(f, f"{NAME}/{rel.as_posix()}")
        zf.write(ROOT / "LEEME - como abrir.txt", f"{NAME}/LEEME - como abrir.txt")
        for item in SOURCE:
            add_tree(zf, ROOT / item, f"{NAME}/codigo-fuente/{item}")
    print(f"Listo: {ZIP} ({ZIP.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
