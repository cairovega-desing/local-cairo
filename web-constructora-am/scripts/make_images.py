"""Genera las imágenes de relleno (placeholders) de la web.

Cada imagen dice claramente «Foto pendiente» y qué foto real va en ese lugar.
Para poner las fotos reales: reemplazá el archivo en public/images/ con el MISMO
nombre (jpg) y volvé a correr `npm run package`. No hace falta tocar código.

Uso: python3 scripts/make_images.py  (necesita Pillow)
"""
from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"

INK = (22, 26, 31)
STEEL = (29, 58, 80)
STEEL_LIGHT = (46, 86, 115)
ACCENT = (245, 180, 0)
CONCRETE = (230, 230, 225)
WHITE = (244, 244, 241)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def grid(d: ImageDraw.ImageDraw, w: int, h: int, step: int, color) -> None:
    for x in range(0, w, step):
        d.line([(x, 0), (x, h)], fill=color, width=1)
    for y in range(0, h, step):
        d.line([(0, y), (w, y)], fill=color, width=1)


def dimension(d: ImageDraw.ImageDraw, x1: int, x2: int, y: int, label: str, color, f) -> None:
    """Cota horizontal estilo plano: línea, marcas a 45° y medida."""
    d.line([(x1, y), (x2, y)], fill=color, width=2)
    for x in (x1, x2):
        d.line([(x - 8, y + 8), (x + 8, y - 8)], fill=color, width=2)
        d.line([(x, y - 14), (x, y + 14)], fill=color, width=1)
    tw = d.textlength(label, font=f)
    cx = (x1 + x2) / 2
    d.rectangle([cx - tw / 2 - 8, y - 14, cx + tw / 2 + 8, y + 14], fill=STEEL)
    d.text((cx - tw / 2, y - 11), label, font=f, fill=color)


def elevation(d: ImageDraw.ImageDraw, w: int, h: int, rnd: random.Random) -> None:
    """Dibuja una fachada simple (vista de plano) que varía con la semilla."""
    line = (200, 214, 226)
    base_y = int(h * 0.74)
    left = int(w * rnd.uniform(0.14, 0.22))
    right = int(w * rnd.uniform(0.78, 0.86))
    wall_top = int(h * rnd.uniform(0.40, 0.48))
    d.line([(int(w * 0.06), base_y), (int(w * 0.94), base_y)], fill=line, width=3)
    d.rectangle([left, wall_top, right, base_y], outline=line, width=3)
    roof = rnd.choice(["gable", "flat", "shed"])
    peak = int(h * rnd.uniform(0.22, 0.30))
    if roof == "gable":
        d.line([(left - 20, wall_top), ((left + right) // 2, peak), (right + 20, wall_top)], fill=line, width=3)
    elif roof == "shed":
        d.line([(left - 20, wall_top), (right + 20, peak)], fill=line, width=3)
        d.line([(right, peak + 6), (right, wall_top)], fill=line, width=3)
    else:
        d.rectangle([left - 14, wall_top - 16, right + 14, wall_top], outline=line, width=3)
    # Puerta y ventanas.
    door_w = int((right - left) * 0.12)
    door_x = rnd.randint(left + 30, right - door_w - 30)
    d.rectangle([door_x, base_y - int((base_y - wall_top) * 0.62), door_x + door_w, base_y], outline=ACCENT, width=3)
    for _ in range(rnd.randint(2, 3)):
        ww = int((right - left) * rnd.uniform(0.12, 0.2))
        wx = rnd.randint(left + 20, right - ww - 20)
        if abs(wx - door_x) < door_w + ww:
            continue
        wy = wall_top + int((base_y - wall_top) * 0.22)
        d.rectangle([wx, wy, wx + ww, wy + int(ww * 0.7)], outline=line, width=2)
        d.line([(wx + ww // 2, wy), (wx + ww // 2, wy + int(ww * 0.7))], fill=line, width=1)


def placeholder(path: Path, size: tuple[int, int], title: str, seed: int) -> None:
    w, h = size
    img = Image.new("RGB", size, STEEL)
    d = ImageDraw.Draw(img)
    grid(d, w, h, max(24, w // 24), (38, 70, 94))
    grid(d, w, h, max(96, w // 6), STEEL_LIGHT)
    rnd = random.Random(seed)
    elevation(d, w, h, rnd)
    small = font(FONT_REG, max(14, w // 48))
    dimension(d, int(w * 0.14), int(w * 0.86), int(h * 0.84), f"{rnd.randint(6, 14)},{rnd.randint(0, 9)}0 m", WHITE, small)

    # Etiqueta «Foto pendiente».
    pad = max(18, w // 36)
    tag_f = font(FONT_BOLD, max(16, w // 34))
    tag = "Foto pendiente"
    tw = d.textlength(tag, font=tag_f)
    d.rounded_rectangle([pad, pad, pad + tw + 28, pad + tag_f.size + 20], radius=10, fill=ACCENT)
    d.text((pad + 14, pad + 9), tag, font=tag_f, fill=INK)

    title_f = font(FONT_BOLD, max(18, w // 26))
    words, lines, cur = title.split(), [], ""
    for word in words:
        test = (cur + " " + word).strip()
        if d.textlength(test, font=title_f) > w - pad * 2:
            lines.append(cur)
            cur = word
        else:
            cur = test
    lines.append(cur)
    y = pad + tag_f.size + 34
    for ln in lines:
        d.text((pad, y), ln, font=title_f, fill=WHITE)
        y += int(title_f.size * 1.2)

    rel = path.relative_to(OUT.parent.parent).as_posix()
    d.text((pad, h - pad - small.size), f"Reemplazar: {rel}", font=small, fill=(176, 196, 212))
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "JPEG", quality=78, optimize=True, progressive=True)


def logo_png(path: Path, s: int = 512) -> None:
    """Mismo dibujo que public/favicon.svg (viewBox 64), escalado."""
    k = s / 64
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(14 * k), fill=INK)

    def poly(points, color, width):
        pts = [(x * k, y * k) for x, y in points]
        d.line(pts, fill=color, width=int(width * k), joint="curve")
        r = width * k / 2
        for x, y in (pts[0], pts[-1]):
            d.ellipse([x - r, y - r, x + r, y + r], fill=color)

    poly([(12, 28), (32, 12), (52, 28)], ACCENT, 5)
    poly([(14, 52), (22, 32), (30, 52)], WHITE, 4)
    poly([(17.5, 45), (26.5, 45)], WHITE, 4)
    poly([(34, 52), (34, 32), (42, 44), (50, 32), (50, 52)], WHITE, 4)
    img.save(path)


def og_image(path: Path) -> None:
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), INK)
    d = ImageDraw.Draw(img)
    grid(d, w, h, 30, (32, 37, 43))
    grid(d, w, h, 150, (44, 50, 58))
    logo = Image.open(OUT / "logo-icon.png").resize((150, 150))
    img.paste(logo, (80, 80), logo)
    d.text((80, 270), "Constructora A&M", font=font(FONT_BOLD, 76), fill=WHITE)
    d.text((80, 370), "Obra nueva, reformas y ampliaciones", font=font(FONT_REG, 40), fill=CONCRETE)
    d.text((80, 425), "La Paloma, Rocha · Uruguay", font=font(FONT_REG, 40), fill=CONCRETE)
    d.rectangle([80, 520, 380, 530], fill=ACCENT)
    img.save(path, "JPEG", quality=85, optimize=True)


def main() -> None:
    obras = [
        "Obra 01: vivienda terminada",
        "Obra 02: reforma de baño, antes y después",
        "Obra 03: ampliación, antes y después",
        "Obra 04: cocina terminada",
        "Obra 05: techo impermeabilizado",
        "Obra 06: estructura en steel framing",
        "Obra 07: fachada renovada",
        "Obra 08: reforma integral, antes y después",
        "Obra 09: instalación sanitaria",
        "Obra 10: vivienda llave en mano",
    ]
    for i, title in enumerate(obras, start=1):
        placeholder(OUT / "obras" / f"obra-{i:02d}.jpg", (800, 800), title, seed=i)

    placeholder(OUT / "responsable.jpg", (960, 1200), "Foto del responsable o de una obra terminada", seed=40)
    placeholder(OUT / "oficina.jpg", (1200, 900), "Oficina / showroom", seed=41)
    placeholder(OUT / "equipo.jpg", (900, 900), "Equipo en obra", seed=42)
    placeholder(OUT / "maquinaria.jpg", (900, 900), "Maquinaria", seed=43)
    placeholder(OUT / "obra-en-proceso.jpg", (900, 900), "Obra en proceso", seed=44)
    placeholder(OUT / "fachada.jpg", (1200, 900), "Fachada de obra terminada", seed=45)
    logo_png(OUT / "logo-icon.png")
    og_image(OUT / "og.jpg")
    print("Imágenes generadas en", OUT)


if __name__ == "__main__":
    main()
