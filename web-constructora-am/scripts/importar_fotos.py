"""Importa las fotos reales del cliente (exportadas de WhatsApp) a public/images.

Recorta, redimensiona, comprime y quita los metadatos (EXIF/GPS) de cada foto.
Uso:
  python3 scripts/importar_fotos.py "/ruta/a/la/carpeta/con/las/fotos"

Para cambiar qué foto va en cada lugar, editá FOTOS (nombre original → destino).
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"
PREFIX = "WhatsApp Image 2026-10-28 at "

# Las fotos de fondo van bajo un velo oscuro: se pueden comprimir más sin que se note.
CALIDAD_FONDOS = {"portada.jpg": 60, "portada-movil.jpg": 60, "cierre.jpg": 60}

# destino: (archivo original sin prefijo, tamaño final, recorte opcional en píxeles del original)
FOTOS: dict[str, tuple[str, tuple[int, int], tuple[int, int, int, int] | None]] = {
    # Portada y cierre (horizontales).
    "portada.jpg": ("17.09.43 (4).jpeg", (1600, 900), None),
    "portada-movil.jpg": ("17.09.43 (4).jpeg", (720, 960), (520, 0, 1195, 900)),
    "cierre.jpg": ("17.09.43 (13).jpeg", (1600, 900), (0, 250, 899, 756)),
    # Foto destacada del hero (4:5).
    "obra-destacada.jpg": ("17.09.43 (15).jpeg", (720, 900), (0, 300, 900, 1425)),
    # Antes y después 1: pasillo techado → habitación cerrada (mismo punto de vista).
    "antes-despues/cerramiento-antes.jpg": ("17.09.42 (9).jpeg", (900, 1200), (0, 200, 900, 1400)),
    "antes-despues/cerramiento-despues.jpg": ("17.09.43 (2).jpeg", (900, 1200), (0, 200, 900, 1400)),
    # Antes y después 2: patio con parrillero viejo → parrillero nuevo (encuadres alineados a mano).
    "antes-despues/parrillero-antes.jpg": ("17.17.21 (2).jpeg", (1280, 666), (243, 7, 1520, 671)),
    "antes-despues/parrillero-despues.jpg": ("17.17.22 (9).jpeg", (1280, 666), (53, 95, 1599, 899)),
    # Obras realizadas (cuadradas).
    "obras/obra-01.jpg": ("17.09.43 (15).jpeg", (900, 900), (0, 520, 900, 1420)),
    "obras/obra-02.jpg": ("17.09.43 (4).jpeg", (900, 900), (420, 0, 1320, 900)),
    "obras/obra-03.jpg": ("17.09.43 (17).jpeg", (900, 900), (0, 500, 900, 1400)),
    "obras/obra-04.jpg": ("17.09.42.jpeg", (900, 900), (0, 450, 900, 1350)),
    "obras/obra-05.jpg": ("17.09.42 (3).jpeg", (900, 900), (0, 700, 900, 1600)),
    "obras/obra-06.jpg": ("17.17.22 (9).jpeg", (900, 900), (480, 0, 1379, 899)),
    "obras/obra-07.jpg": ("17.17.24 (2).jpeg", (900, 900), (350, 0, 1250, 900)),
    "obras/obra-08.jpg": ("17.17.24 (9).jpeg", (900, 900), (520, 0, 1222, 702)),
    "obras/obra-09.jpg": ("17.09.43.jpeg", (900, 900), (0, 500, 900, 1400)),
    "obras/obra-10.jpg": ("17.09.43 (13).jpeg", (900, 900), (0, 0, 900, 900)),
    # Servicios (10:7).
    "servicios/servicio-02.jpg": ("17.09.43 (17).jpeg", (800, 560), (0, 500, 900, 1130)),
    "servicios/servicio-03.jpg": ("17.09.43 (4).jpeg", (800, 560), (200, 0, 1486, 900)),
    "servicios/servicio-05.jpg": ("17.09.43 (13).jpeg", (800, 560), (0, 0, 900, 630)),
    "servicios/servicio-06.jpg": ("17.09.43 (11).jpeg", (800, 560), (0, 400, 900, 1030)),
    "servicios/servicio-07.jpg": ("17.09.43 (15).jpeg", (800, 560), (0, 500, 900, 1130)),
    "servicios/servicio-08.jpg": ("17.17.23 (9).jpeg", (800, 560), None),
    # Galería «Nuestra empresa».
    "fachada.jpg": ("17.09.42 (1).jpeg", (900, 900), (0, 250, 900, 1150)),
    "equipo.jpg": ("17.17.21 (9).jpeg", (900, 900), None),
    "obra-en-proceso.jpg": ("17.09.43 (6).jpeg", (900, 900), (0, 400, 900, 1300)),
    "hormigonado.jpg": ("17.17.23 (18).jpeg", (900, 900), None),
}


def cover(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Recorta al centro para llenar `size` sin deformar."""
    return ImageOps.fit(img, size, Image.LANCZOS, centering=(0.5, 0.5))


def og_image(src: Path) -> None:
    w, h = 1200, 630
    img = cover(Image.open(src).convert("RGB"), (w, h))
    shade = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for x in range(w):
        sd.line([(x, 0), (x, h)], fill=(42, 31, 23, int(235 * max(0.0, 1 - x / (w * 0.8)))))
    img.paste(shade, (0, 0), shade)
    d = ImageDraw.Draw(img)
    logo = Image.open(OUT / "logo-icon.png").resize((110, 110))
    img.paste(logo, (80, 80), logo)
    bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    reg = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    d.text((80, 240), "Constructora A&M", font=ImageFont.truetype(bold, 70), fill=(251, 248, 243))
    d.text((80, 340), "Obra nueva, reformas y ampliaciones", font=ImageFont.truetype(reg, 36), fill=(242, 234, 223))
    d.text((80, 392), "La Paloma, Rocha · Uruguay", font=ImageFont.truetype(reg, 36), fill=(242, 234, 223))
    d.rectangle([80, 480, 280, 486], fill=(201, 161, 90))
    img.save(OUT / "og.jpg", "JPEG", quality=84, optimize=True, progressive=True)


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
        img.save(out, "JPEG", quality=CALIDAD_FONDOS.get(dest, 76), optimize=True, progressive=True)
        print(f"{dest:42s} ← {name}")
    og_image(OUT / "portada.jpg")
    print("og.jpg generado desde la portada")


if __name__ == "__main__":
    main()
