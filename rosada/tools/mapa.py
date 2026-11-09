#!/usr/bin/env python3
"""Genera js/datos/mapa_geo.js: el mapa real de la Argentina (24 provincias), Malvinas y los países vecinos.

Datos: Natural Earth (dominio público), tomados de los paquetes npm `datamaps` (MIT, provincias argentinas)
y `world-atlas` (ISC, países). Se proyectan, se simplifican y se guardan como caminos SVG livianos.

Uso:
  npm pack datamaps@0.5.10 world-atlas@2.0.2   (o bajar los .tgz del registro de npm y descomprimirlos)
  python3 rosada/tools/mapa.py RUTA/datamaps/package RUTA/world-atlas/package
"""
import json
import math
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent

# Recuadro del mapa (grados) y proyección equirectangular corregida por latitud.
LON_MIN, LON_MAX, LAT_MAX, LAT_MIN = -76.0, -50.0, -18.5, -56.0
COS = math.cos(math.radians(-38))
ANCHO = 300.0
K = ANCHO / ((LON_MAX - LON_MIN) * COS)
ALTO = (LAT_MAX - LAT_MIN) * K
TOL = 0.45  # tolerancia de simplificación en px

IDS = {
    'AR.SC': 'SCR', 'AR.TF': 'TDF', 'AR.SJ': 'SJU', 'AR.CH': 'CHU', 'AR.MZ': 'MZA', 'AR.NQ': 'NQN', 'AR.BA': 'BUE',
    'AR.LP': 'LPA', 'AR.RN': 'RNE', 'AR.SL': 'SLU', 'AR.CB': 'CBA', 'AR.CT': 'CAT', 'AR.JY': 'JUJ', 'AR.LR': 'LRJ',
    'AR.SA': 'SAL', 'AR.SE': 'SGO', 'AR.TM': 'TUC', 'AR.CC': 'CHA', 'AR.FM': 'FOR', 'AR.CN': 'COR', 'AR.ER': 'ERI',
    'AR.SF': 'SFE', 'AR.MN': 'MIS', 'AR.DF': 'CABA',
}
PAISES = {'152': 'CHL', '858': 'URY', '600': 'PRY', '068': 'BOL', '076': 'BRA', '604': 'PER'}


def proyectar(lon, lat):
    return ((lon - LON_MIN) * COS * K, (LAT_MAX - lat) * K)


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
            pts.append(proyectar(lon, lat))
        arcos.append(pts)
    return arcos


def dp(pts, tol):
    """Douglas-Peucker."""
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
    """Douglas-Peucker para anillos cerrados: parte el anillo en el punto más lejano del inicio."""
    if len(r) < 4:
        return r
    x0, y0 = r[0]
    k = max(range(len(r)), key=lambda i: (r[i][0] - x0) ** 2 + (r[i][1] - y0) ** 2)
    a = dp(r[: k + 1], tol)
    b = dp(r[k:], tol)
    return a[:-1] + b


def anillo(arcos, indices):
    out = []
    for i in indices:
        a = arcos[i] if i >= 0 else list(reversed(arcos[~i]))
        out.extend(a if not out else a[1:])
    return out


def recortar(poly):
    """Sutherland-Hodgman contra el recuadro del mapa."""
    def corta(pts, dentro, inter):
        out = []
        for i, cur in enumerate(pts):
            prev = pts[i - 1]
            if dentro(cur):
                if not dentro(prev):
                    out.append(inter(prev, cur))
                out.append(cur)
            elif dentro(prev):
                out.append(inter(prev, cur))
        return out

    def lerp_x(xc):
        return lambda a, b: (xc, a[1] + (b[1] - a[1]) * (xc - a[0]) / ((b[0] - a[0]) or 1e-9))

    def lerp_y(yc):
        return lambda a, b: (a[0] + (b[0] - a[0]) * (yc - a[1]) / ((b[1] - a[1]) or 1e-9), yc)

    pts = poly
    for dentro, inter in (
        (lambda p: p[0] >= 0, lerp_x(0)), (lambda p: p[0] <= ANCHO, lerp_x(ANCHO)),
        (lambda p: p[1] >= 0, lerp_y(0)), (lambda p: p[1] <= ALTO, lerp_y(ALTO)),
    ):
        if not pts:
            break
        pts = corta(pts, dentro, inter)
    return pts


def camino(anillos):
    partes = []
    for r in anillos:
        if len(r) < 3:
            continue
        partes.append('M' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in r) + 'Z')
    return ''.join(partes)


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
        xs = [p[0] for p in r]
        ys = [p[1] for p in r]
        return 0, (sum(xs) / len(xs), sum(ys) / len(ys))
    return abs(a / 2), (cx / (3 * a), cy / (3 * a))


def anillos_de(geom, arcos, simplificar=True):
    polis = [geom['arcs']] if geom['type'] == 'Polygon' else geom['arcs']
    out = []
    for poli in polis:
        for idx in poli:
            out.append(anillo(arcos, idx))
    return out


def main():
    dm = pathlib.Path(sys.argv[1])
    wa = pathlib.Path(sys.argv[2])
    texto = (dm / 'dist' / 'datamaps.arg.js').read_text(encoding='utf-8')
    i = texto.index('argTopo = ') + len('argTopo = ')
    prof = 0
    for k in range(i, len(texto)):
        if texto[k] == '{':
            prof += 1
        elif texto[k] == '}':
            prof -= 1
            if prof == 0:
                fin = k + 1
                break
    topo = json.loads(texto[i:fin])
    # Simplificar arcos mantiene los bordes compartidos. Los arcos cerrados (islas como Tierra del Fuego)
    # van con dp_anillo: con dp común el inicio y el fin coinciden y el anillo se aplasta.
    arcos = [dp_anillo(a, TOL) if len(a) > 3 and a[0] == a[-1] else dp(a, TOL) for a in decodificar_arcos(topo)]
    prov = {}
    for g in topo['objects']['arg']['geometries']:
        pid = IDS[g['id']]
        rs = anillos_de(g, arcos)
        if pid == 'CABA':
            rs = anillos_de(g, decodificar_arcos(topo))  # sin simplificar: es chiquita
        grande = max(rs, key=lambda r: area_centroide(r)[0])
        _, c = area_centroide(grande)
        xs = [p[0] for r in rs for p in r]
        ys = [p[1] for r in rs for p in r]
        prov[pid] = {'d': camino(rs), 'c': [round(c[0], 1), round(c[1], 1)], 'w': round(max(xs) - min(xs), 1), 'h': round(max(ys) - min(ys), 1)}

    mundo = json.loads((wa / 'countries-50m.json').read_text(encoding='utf-8'))
    arcos_m = decodificar_arcos(mundo)
    paises = {}
    malvinas = None
    for g in mundo['objects']['countries']['geometries']:
        gid = g.get('id')
        if gid not in PAISES and gid != '238':
            continue
        rs = []
        for r in anillos_de(g, arcos_m):
            r = recortar(dp_anillo(r, TOL * 1.4))
            if len(r) >= 3 and area_centroide(r)[0] > 2:
                rs.append(r)
        if not rs:
            continue
        if gid == '238':
            grande = max(rs, key=lambda r: area_centroide(r)[0])
            malvinas = {'d': camino(rs), 'c': [round(v, 1) for v in area_centroide(grande)[1]]}
        else:
            grande = max(rs, key=lambda r: area_centroide(r)[0])
            paises[PAISES[gid]] = {'d': camino(rs), 'c': [round(v, 1) for v in area_centroide(grande)[1]]}

    datos = {'w': round(ANCHO, 1), 'h': round(ALTO, 1), 'prov': prov, 'paises': paises, 'malvinas': malvinas}
    salida = RAIZ / 'js' / 'datos' / 'mapa_geo.js'
    js = (
        '// Generado por tools/mapa.py — no editar a mano.\n'
        '// Datos: Natural Earth (dominio público), vía los paquetes npm datamaps (MIT) y world-atlas (ISC).\n'
        '(function (R) {\n  \'use strict\';\n  R.GEO = ' + json.dumps(datos, ensure_ascii=False, separators=(',', ':')) + ';\n'
        '})(globalThis.R = globalThis.R || {});\n'
    )
    salida.write_text(js, encoding='utf-8')
    puntos = len(re.findall(r'\d,\d', js))
    print(f'✅ {salida.relative_to(RAIZ)}: {len(js) // 1024} KB, ~{puntos} puntos, {ANCHO:.0f}×{ALTO:.0f}')


if __name__ == '__main__':
    main()
