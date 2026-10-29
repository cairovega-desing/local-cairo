"""Importa las fotos reales del cliente (exportadas de WhatsApp) a public/images.

Recorta, redimensiona, comprime y quita los metadatos (EXIF/GPS) de cada foto.
Uso:
  python3 scripts/importar_fotos.py "/ruta/a/la/carpeta/con/las/fotos"

Para cambiar qué foto va en cada lugar, editá FOTOS (nombre original → destino).
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"
PREFIX = "WhatsApp Image 2026-10-28 at "

# destino: (archivo original sin prefijo, tamaño final, recorte opcional en píxeles del original)
# Solo las fotos necesarias: 4 de fondo en la portada, 4 en «Antes y después» y 6 obras terminadas.
FOTOS: dict[str, tuple[str, tuple[int, int], tuple[int, int, int, int] | None]] = {
    # Portada: 4 fondos que se van alternando (horizontal para computadora, vertical para celular).
    "portada/slide-1.jpg": ("17.09.43 (4).jpeg", (1600, 900), None),
    "portada/slide-1-movil.jpg": ("17.09.43 (4).jpeg", (720, 1280), (572, 0, 1078, 900)),
    "portada/slide-2.jpg": ("17.09.43 (15).jpeg", (1600, 900), (0, 560, 900, 1066)),
    "portada/slide-2-movil.jpg": ("17.09.43 (15).jpeg", (720, 1280), None),
    "portada/slide-3.jpg": ("17.17.22 (9).jpeg", (1600, 900), None),
    "portada/slide-3-movil.jpg": ("17.17.22 (9).jpeg", (720, 1280), (687, 0, 1193, 899)),
    "portada/slide-4.jpg": ("17.09.43 (17).jpeg", (1600, 900), (0, 420, 900, 926)),
    "portada/slide-4-movil.jpg": ("17.09.43 (17).jpeg", (720, 1280), None),
    # Antes y después 1: pasillo techado → habitación cerrada (mismo punto de vista).
    "antes-despues/cerramiento-antes.jpg": ("17.09.42 (9).jpeg", (900, 1200), (0, 200, 900, 1400)),
    "antes-despues/cerramiento-despues.jpg": ("17.09.43 (2).jpeg", (900, 1200), (0, 200, 900, 1400)),
    # Antes y después 2: patio con parrillero viejo → parrillero nuevo (encuadres alineados a mano).
    "antes-despues/parrillero-antes.jpg": ("17.17.21 (2).jpeg", (1280, 666), (243, 7, 1520, 671)),
    "antes-despues/parrillero-despues.jpg": ("17.17.22 (9).jpeg", (1280, 666), (53, 95, 1599, 899)),
    # Obras terminadas (cuadradas).
    "obras/obra-01.jpg": ("17.09.48 (1).jpeg", (900, 900), (75, 250, 900, 1075)),
    "obras/obra-02.jpg": ("17.09.43 (17).jpeg", (900, 900), (0, 500, 900, 1400)),
    "obras/obra-03.jpg": ("17.09.42.jpeg", (900, 900), (0, 450, 900, 1350)),
    "obras/obra-04.jpg": ("17.17.24 (9).jpeg", (900, 900), (520, 0, 1222, 702)),
    "obras/obra-05.jpg": ("17.17.24 (2).jpeg", (900, 900), (350, 0, 1250, 900)),
    "obras/obra-06.jpg": ("17.09.42 (3).jpeg", (900, 900), (0, 700, 900, 1600)),
}


def cover(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Recorta al centro para llenar `size` sin deformar."""
    return ImageOps.fit(img, size, Image.LANCZOS, centering=(0.5, 0.5))


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    src_dir = Path(sys.argv[1])
    for dest, (name, size, box) in FOTOS.items():
        src = src_dir / f"{PREFIX}{name}"
        img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        if box:
            img = img.crop(box)
        img = cover(img, size)
        out = OUT / dest
        out.parent.mkdir(parents=True, exist_ok=True)
        # Guardar sin exif: se descartan ubicación y datos del teléfono.
        # Los fondos de portada van bajo un velo oscuro: se pueden comprimir más sin que se note.
        quality = 62 if dest.startswith("portada/") else 76
        img.save(out, "JPEG", quality=quality, optimize=True, progressive=True)
        print(f"{dest:42s} ← {name}")


if __name__ == "__main__":
    main()
