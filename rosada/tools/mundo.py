#!/usr/bin/env python3
"""Genera js/datos/mundo_geo.js: el mapamundi para la pestaña Mundo.

Datos: Natural Earth (dominio público), del paquete npm `world-atlas` (ISC), archivo countries-110m.json.
Proyección Natural Earth I (la misma fórmula que d3.geoNaturalEarth1), sin la Antártida, simplificado y guardado
como caminos SVG livianos: un camino por cada país del juego (la UE es un solo camino con sus 27 países),
Malvinas aparte, el resto del mundo en un solo camino de fondo, una grilla de meridianos/paralelos y el borde del océano.

Uso:
  npm pack world-atlas@2.0.2 && tar xzf world-atlas-2.0.2.tgz
  python3 rosada/tools/mundo.py RUTA/world-atlas/package
"""
import json
import math
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ANCHO = 1000.0
TOL = 0.55  # tolerancia de simplificación en px
LAT_MIN, LAT_MAX = -58.0, 84.0

JUEGO = {
    '032': 'ARG', '076': 'BRA', '152': 'CHL', '858': 'URY', '600': 'PRY', '068': 'BOL', '604': 'PER', '862': 'VEN',
    '840': 'USA', '156': 'CHN', '643': 'RUS', '826': 'GBR', '238': 'FLK',
}
UE = {'040', '056', '100', '191', '196', '203', '208', '233', '246', '250', '276', '300', '348', '372', '380', '428',
      '440', '442', '470', '528', '616', '620', '642', '703', '705', '724', '752'}
SIN = {'010'}  # Antártida


def ne1(lon, lat):
    """Natural Earth I (radianes → unidades de la proyección)."""
    l, p = math.radians(lon), math.radians(lat)
    p2 = p * p
    p4 = p2 * p2
    x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)))
    y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)))
    return x, y


X0, _ = ne1(-180, 0)
X1, _ = ne1(180, 0)
_, Y_ARRIBA = ne1(0, LAT_MAX)
_, Y_ABAJO = ne1(0, LAT_MIN)
K = ANCHO / (X1 - X0)
ALTO = (Y_ARRIBA - Y_ABAJO) * K


def proyectar(lon, lat):
    lon = max(-200, min(200, lon))  # lo que cae del otro lado del antimeridiano queda apenas afuera (se recorta)
    x, y = ne1(lon, max(LAT_MIN, min(LAT_MAX, lat)))
    return ((x - X0) * K, (Y_ARRIBA - y) * K)


def decodificar_arcos(topo):
    tr = topo.get('transform')
    arcos = []
    for a in topo['arcs']:
        x = y = 0
        pts = []
        for p in a:
            if tr:
                x += p[0]
                y += p[1]
                lon = x * tr['scale'][0] + tr['translate'][0]
                lat = y * tr['scale'][1] + tr['translate'][1]
            else:
                lon, lat = p[0], p[1]
            pts.append((lon, lat))
        arcos.append(pts)
    return arcos


def dp(pts, tol):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    largo = math.hypot(dx, dy) or 1e-9
    mejor, idx = -1, 0
    for i in range(1, len(pts) - 1):
        x0, y0 = pts[i]
        d = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / largo
        if d > mejor:
            mejor, idx = d, i
    if mejor > tol:
        return dp(pts[: idx + 1], tol)[:-1] + dp(pts[idx:], tol)
    return [pts[0], pts[-1]]


def dp_anillo(r, tol):
    if len(r) < 4:
        return r
    x0, y0 = r[0]
    k = max(range(len(r)), key=lambda i: (r[i][0] - x0) ** 2 + (r[i][1] - y0) ** 2)
    return dp(r[: k + 1], tol)[:-1] + dp(r[k:], tol)


def anillo(arcos, indices):
    out = []
    for i in indices:
        a = arcos[i] if i >= 0 else list(reversed(arcos[~i]))
        out.extend(a if not out else a[1:])
    return out


def area_centroide(r):
    a = cx = cy = 0.0
    for i in range(len(r)):
        x0, y0 = r[i - 1]
        x1, y1 = r[i]
        f = x0 * y1 - x1 * y0
        a += f
        cx += (x0 + x1) * f
        cy += (y0 + y1) * f
    if abs(a) < 1e-9:
        return 0.0, r[0]
    return a / 2, (cx / (3 * a), cy / (3 * a))


def anillos_de(geo, arcos):
    polys = geo['arcs'] if geo['type'] == 'MultiPolygon' else [geo['arcs']] if geo['type'] == 'Polygon' else []
    out = []
    for poly in polys:
        for k, idx in enumerate(poly):
            crudo = anillo(arcos, idx)
            # Anillos que cruzan el antimeridiano (Chukotka, Fiyi, Aleutianas): el lado con menos puntos se corre 360°
            # para que quede afuera del mapa (después se recorta con el borde) y no cruce todo el mundo.
            if any(abs(crudo[i][0] - crudo[i - 1][0]) > 180 for i in range(1, len(crudo))):
                negativos = sum(1 for lon, _ in crudo if lon < 0)
                if negativos * 2 >= len(crudo):
                    crudo = [(lon - 360 if lon > 0 else lon, lat) for lon, lat in crudo]
                else:
                    crudo = [(lon + 360 if lon < 0 else lon, lat) for lon, lat in crudo]
            r = [proyectar(lon, lat) for lon, lat in crudo]
            r = dp_anillo(r, TOL)
            if len(r) >= 3:
                out.append((k == 0, r))
    return out


def camino(anillos):
    partes = []
    for _, r in anillos:
        # Saltear islitas de menos de ~1,5 px² (no se ven y pesan).
        if abs(area_centroide(r)[0]) < 1.5:
            continue
        partes.append('M' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in r) + 'Z')
    return ''.join(partes)


def centro(anillos):
    """Centro del polígono exterior más grande (para poner la bandera)."""
    mejor = max((r for ext, r in anillos if ext), key=lambda r: abs(area_centroide(r)[0]))
    return area_centroide(mejor)[1]


def linea(pts):
    return 'M' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)


def main():
    base = pathlib.Path(sys.argv[1])
    topo = json.loads((base / 'countries-110m.json').read_text())
    arcos = decodificar_arcos(topo)
    paises = {}
    centros = {}
    resto = []
    ue = []
    for g in topo['objects']['countries']['geometries']:
        cid = g.get('id')
        if cid in SIN or g['type'] not in ('Polygon', 'MultiPolygon'):
            continue
        an = anillos_de(g, arcos)
        if not an:
            continue
        if cid in JUEGO:
            paises[JUEGO[cid]] = camino(an)
            centros[JUEGO[cid]] = centro(an)
        elif cid in UE:
            ue.extend(an)
            if cid == '276':  # Alemania: centro de la UE
                centros['UE'] = centro(an)
        else:
            resto.extend(an)
    paises['UE'] = camino(ue)
    # Ajustes a mano de dónde va la bandera (para que no caiga en el borde o en el mar).
    ajustes = {'USA': (-98, 39), 'RUS': (95, 61), 'CHN': (103, 34), 'GBR': (-2, 53.5), 'UE': (12, 48), 'CHL': (-70.2, -22.5),
               'BRA': (-49, -9), 'ARG': (-65.5, -39), 'FLK': (-59, -51.7), 'URY': (-55.6, -32.2), 'PRY': (-58.3, -23),
               'BOL': (-64.8, -16.2), 'PER': (-75.5, -9.5), 'VEN': (-66, 7.5)}
    for k, (lon, lat) in ajustes.items():
        centros[k] = proyectar(lon, lat)
    # Grilla: meridianos cada 30° y paralelos cada 30°.
    grilla = []
    for lon in range(-180, 181, 30):
        grilla.append(linea([proyectar(lon, lat) for lat in range(int(LAT_MIN), int(LAT_MAX) + 1, 2)]))
    for lat in (-30, 0, 30, 60):
        grilla.append(linea([proyectar(lon, lat) for lon in range(-180, 181, 3)]))
    # Borde del océano (la forma de la proyección recortada).
    borde = [proyectar(lon, LAT_MAX) for lon in range(-180, 181, 3)]
    borde += [proyectar(180, lat) for lat in range(int(LAT_MAX), int(LAT_MIN) - 1, -2)]
    borde += [proyectar(lon, LAT_MIN) for lon in range(180, -181, -3)]
    borde += [proyectar(-180, lat) for lat in range(int(LAT_MIN), int(LAT_MAX) + 1, 2)]
    # Vistas (viewBox): el mundo, América y Sudamérica.
    def caja(lon0, lat0, lon1, lat1):
        xs, ys = [], []
        for lon in (lon0, lon1):
            for lat in (lat0, lat1, (lat0 + lat1) / 2):
                x, y = proyectar(lon, lat)
                xs.append(x)
                ys.append(y)
        return [round(min(xs), 1), round(min(ys), 1), round(max(xs) - min(xs), 1), round(max(ys) - min(ys), 1)]
    vistas = {'mundo': [0, 0, ANCHO, round(ALTO, 1)], 'america': caja(-128, 50, -28, -58), 'sudamerica': caja(-90, 13, -32, -57)}
    datos = {
        'ancho': ANCHO, 'alto': round(ALTO, 1),
        'paises': paises,
        'centros': {k: [round(x, 1), round(y, 1)] for k, (x, y) in centros.items()},
        'resto': camino(resto),
        'grilla': ''.join(grilla),
        'borde': linea(borde) + 'Z',
        'vistas': vistas,
    }
    js = ('// Generado por tools/mundo.py con datos de Natural Earth (dominio público, vía npm world-atlas). No editar a mano.\n'
          '(function (R) {\n  R.MUNDO_GEO = ' + json.dumps(datos, ensure_ascii=False, separators=(',', ':')) + ';\n})(globalThis.R = globalThis.R || {});\n')
    destino = RAIZ / 'js' / 'datos' / 'mundo_geo.js'
    destino.write_text(js)
    print('Escrito', destino, len(js) // 1024, 'KB', 'alto', round(ALTO, 1), 'países', sorted(paises))


if __name__ == '__main__':
    main()
