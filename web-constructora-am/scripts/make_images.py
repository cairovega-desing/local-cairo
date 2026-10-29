"""Genera las imágenes de relleno (placeholders) de la web.

Son ilustraciones cálidas (marrón, beige, blanco y dorado) de casas modernas, con una
etiqueta chica «Foto pendiente». Sirven para ver el diseño completo antes de tener las
fotos reales.

Para poner las fotos reales: reemplazá el archivo en public/images/ con el MISMO
nombre (jpg) y volvé a correr `npm run package`. No hace falta tocar código.

Uso: python3 scripts/make_images.py  (necesita Pillow)
Después: python3 scripts/importar_fotos.py "<carpeta con las fotos del cliente>"
"""
from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"

ESPRESSO = (42, 31, 23)
BROWN = (107, 74, 51)
BROWN_DEEP = (62, 42, 30)
WOOD = (150, 104, 66)
WOOD_LIGHT = (184, 138, 92)
GOLD = (201, 161, 90)
GOLD_LIGHT = (232, 205, 150)
BEIGE = (242, 234, 223)
SAND = (230, 215, 195)
WHITE = (251, 248, 243)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SS = 2  # supersampling para bordes suaves


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def vgradient(w, h, top, bottom):
    img = Image.new("RGB", (w, h), top)
    d = ImageDraw.Draw(img)
    for y in range(h):
        d.line([(0, y), (w, y)], fill=lerp(top, bottom, y / max(1, h - 1)))
    return img


PALETTES = {
    "dia": dict(sky=((247, 240, 229), (233, 218, 197)), hills=(222, 205, 182), ground=(214, 196, 170), glow=(255, 236, 196)),
    "tarde": dict(sky=((236, 214, 178), (214, 170, 120)), hills=(196, 158, 116), ground=(168, 128, 90), glow=(255, 214, 140)),
    "noche": dict(sky=((52, 38, 30), (110, 78, 54)), hills=(80, 58, 42), ground=(58, 42, 31), glow=(255, 200, 120)),
}


def house_scene(w: int, h: int, rnd: random.Random, mood: str) -> Image.Image:
    p = PALETTES[mood]
    W, H = w * SS, h * SS
    img = vgradient(W, H, *p["sky"])
    d = ImageDraw.Draw(img)

    # Sol / luna
    r = int(min(W, H) * rnd.uniform(0.07, 0.1))
    sx, sy = int(W * rnd.uniform(0.62, 0.85)), int(H * rnd.uniform(0.16, 0.3))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([sx - r * 3, sy - r * 3, sx + r * 3, sy + r * 3], fill=(*GOLD_LIGHT, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(r))
    img.paste(glow, (0, 0), glow)
    d.ellipse([sx - r, sy - r, sx + r, sy + r], fill=GOLD_LIGHT if mood != "noche" else (240, 226, 200))

    # Colinas
    horizon = int(H * rnd.uniform(0.66, 0.72))
    pts = [(0, horizon)]
    for i in range(9):
        pts.append((int(W * i / 8), int(horizon - H * rnd.uniform(0.03, 0.1))))
    pts += [(W, horizon), (W, H), (0, H)]
    d.polygon(pts, fill=p["hills"])
    d.rectangle([0, horizon, W, H], fill=p["ground"])

    # Casa moderna: 2–3 volúmenes rectos con techo plano.
    base = horizon + int(H * 0.04)
    x = int(W * rnd.uniform(0.12, 0.2))
    total = int(W * rnd.uniform(0.6, 0.72))
    widths = [rnd.uniform(0.3, 0.45), rnd.uniform(0.25, 0.4), rnd.uniform(0.2, 0.3)]
    widths = widths[: rnd.choice([2, 3])]
    s = sum(widths)
    vols = []
    for i, f in enumerate(widths):
        vw = int(total * f / s)
        vh = int(H * rnd.uniform(0.2, 0.36))
        vols.append((x, base - vh, x + vw, base, i))
        x += vw
    # Sombra en el piso
    d.rectangle([vols[0][0] - 30, base, vols[-1][2] + 60, base + int(H * 0.02)], fill=lerp(p["ground"], ESPRESSO, 0.25))
    for (x0, y0, x1, y1, i) in sorted(vols, key=lambda v: v[1]):
        style = rnd.choice(["blanco", "madera", "hormigon"])
        fill = {"blanco": WHITE, "madera": WOOD, "hormigon": SAND}[style]
        if mood == "noche":
            fill = lerp(fill, ESPRESSO, 0.45)
        d.rectangle([x0, y0, x1, y1], fill=fill)
        if style == "madera":
            step = max(8, (x1 - x0) // 28)
            for lx in range(x0 + step, x1, step):
                d.line([(lx, y0), (lx, y1)], fill=lerp(fill, BROWN_DEEP, 0.35), width=2)
        # Alero / techo
        d.rectangle([x0 - 14, y0 - 16, x1 + 14, y0], fill=BROWN_DEEP if style != "blanco" else (70, 52, 40))
        # Ventanal con luz cálida
        gw = int((x1 - x0) * rnd.uniform(0.45, 0.7))
        gh = int((y1 - y0) * rnd.uniform(0.45, 0.65))
        gx = x0 + (x1 - x0 - gw) // 2
        gy = y1 - gh - int((y1 - y0) * 0.12)
        win = vgradient(gw, gh, lerp(p["glow"], (255, 255, 255), 0.2), lerp(p["glow"], BROWN, 0.35))
        img.paste(win, (gx, gy))
        d.rectangle([gx, gy, gx + gw, gy + gh], outline=ESPRESSO, width=6)
        for k in range(1, rnd.choice([2, 3, 4])):
            mx = gx + gw * k // rnd.choice([2, 3, 4])
            d.line([(mx, gy), (mx, gy + gh)], fill=ESPRESSO, width=5)

    # Árboles redondeados
    for _ in range(rnd.randint(2, 4)):
        tx = rnd.choice([int(W * rnd.uniform(0.02, 0.12)), int(W * rnd.uniform(0.84, 0.97))])
        tr = int(H * rnd.uniform(0.05, 0.09))
        ty = base - tr - int(H * 0.06)
        d.rectangle([tx - 6, ty, tx + 6, base], fill=BROWN_DEEP)
        d.ellipse([tx - tr, ty - tr, tx + tr, ty + tr], fill=lerp((120, 128, 84), p["hills"], 0.35))
    # Camino
    d.polygon([(int(W * 0.45), H), (int(W * 0.55), H), (int(W * 0.52), base + 8), (int(W * 0.49), base + 8)], fill=lerp(p["ground"], WHITE, 0.35))

    return img.resize((w, h), Image.LANCZOS)


def label(img: Image.Image, text: str) -> None:
    """Etiqueta chica «Foto pendiente» abajo a la izquierda."""
    w, h = img.size
    d = ImageDraw.Draw(img, "RGBA")
    f = ImageFont.truetype(FONT_BOLD, max(13, w // 52))
    pad = max(12, w // 50)
    tw = d.textlength(text, font=f)
    box = [pad, h - pad - f.size - 16, pad + tw + 24, h - pad]
    d.rounded_rectangle(box, radius=(box[3] - box[1]) // 2, fill=(42, 31, 23, 200))
    d.text((pad + 12, box[1] + 7), text, font=f, fill=GOLD_LIGHT)


def placeholder(path: Path, size: tuple[int, int], title: str, seed: int, mood: str | None = None, tag: bool = True) -> None:
    rnd = random.Random(seed)
    mood = mood or rnd.choice(["dia", "dia", "tarde", "noche"])
    img = house_scene(*size, rnd, mood)
    if tag:
        label(img, f"Foto pendiente · {title}")
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "JPEG", quality=80, optimize=True, progressive=True)


def logo_png(path: Path, s: int = 512) -> None:
    """Mismo dibujo que public/favicon.svg (viewBox 64), escalado."""
    k = s / 64
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(14 * k), fill=BROWN_DEEP)

    def poly(points, color, width):
        pts = [(x * k, y * k) for x, y in points]
        d.line(pts, fill=color, width=int(width * k), joint="curve")
        r = width * k / 2
        for x, y in (pts[0], pts[-1]):
            d.ellipse([x - r, y - r, x + r, y + r], fill=color)

    poly([(12, 28), (32, 12), (52, 28)], GOLD, 5)
    poly([(14, 52), (22, 32), (30, 52)], WHITE, 4)
    poly([(17.5, 45), (26.5, 45)], WHITE, 4)
    poly([(34, 52), (34, 32), (42, 44), (50, 32), (50, 52)], WHITE, 4)
    img.save(path)


def og_image_placeholder(path: Path) -> None:
    w, h = 1200, 630
    img = house_scene(w, h, random.Random(7), "tarde")
    shade = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for x in range(w):
        a = int(235 * max(0, 1 - x / (w * 0.75)))
        sd.line([(x, 0), (x, h)], fill=(*ESPRESSO, a))
    img.paste(shade, (0, 0), shade)
    d = ImageDraw.Draw(img)
    logo = Image.open(OUT / "logo-icon.png").resize((120, 120))
    img.paste(logo, (80, 80), logo)
    d.text((80, 250), "Constructora A&M", font=ImageFont.truetype(FONT_BOLD, 72), fill=WHITE)
    reg = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    d.text((80, 350), "Obra nueva, reformas y ampliaciones", font=ImageFont.truetype(reg, 38), fill=BEIGE)
    d.text((80, 405), "La Paloma, Rocha · Uruguay", font=ImageFont.truetype(reg, 38), fill=BEIGE)
    d.rectangle([80, 500, 300, 506], fill=GOLD)
    img.save(path, "JPEG", quality=85, optimize=True)


def main() -> None:
    # Solo los lugares que todavía no tienen foto real (las reales las pone importar_fotos.py).
    placeholder(OUT / "servicios" / "servicio-01.jpg", (800, 560), "Obra nueva", seed=101)
    placeholder(OUT / "servicios" / "servicio-04.jpg", (800, 560), "Baños y cocinas", seed=104)
    placeholder(OUT / "oficina.jpg", (1200, 900), "Oficina / showroom", seed=41)
    logo_png(OUT / "logo-icon.png")
    print("Placeholders y logo generados en", OUT)


if __name__ == "__main__":
    main()
