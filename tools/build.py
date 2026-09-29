#!/usr/bin/env python3
"""Empaqueta src/ en CarreraDeGlobos.rbxmx (para «Insert from File» en Roblox Studio)
y genera sourcemap.json (para revisar el código con luau-lsp).

Uso:  python3 tools/build.py
"""
import json
import os
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
OUT = os.path.join(ROOT, "CarreraDeGlobos.rbxmx")
SOURCEMAP = os.path.join(ROOT, "sourcemap.json")

counter = 0


def ref():
    global counter
    counter += 1
    return f"RBX{counter:08X}"


def script_kind(filename):
    """Devuelve (clase, nombre) siguiendo las convenciones de Rojo."""
    base = filename[: -len(".luau")]
    if base.endswith(".server"):
        return "Script", base[: -len(".server")]
    if base.endswith(".client"):
        return "LocalScript", base[: -len(".client")]
    return "ModuleScript", base


def prop_xml(name, value):
    if isinstance(value, bool):
        return f'<bool name="{name}">{"true" if value else "false"}</bool>'
    if isinstance(value, str):
        return f'<string name="{name}">{escape(value)}</string>'
    raise ValueError(f"Propiedad no soportada: {name}={value!r}")


def build_dir(path, name):
    """Devuelve (xml, sourcemap_node) de una carpeta."""
    class_name, props = "Folder", {}
    meta = os.path.join(path, "init.meta.json")
    if os.path.exists(meta):
        with open(meta, encoding="utf-8") as f:
            data = json.load(f)
        class_name = data.get("className", "Folder")
        props = data.get("properties", {})

    children_xml, children_map = [], []
    for entry in sorted(os.listdir(path)):
        full = os.path.join(path, entry)
        if os.path.isdir(full):
            x, m = build_dir(full, entry)
        elif entry.endswith(".luau"):
            x, m = build_script(full, entry)
        else:
            continue
        children_xml.append(x)
        children_map.append(m)

    props_xml = prop_xml("Name", name) + "".join(prop_xml(k, v) for k, v in props.items())
    xml = f'<Item class="{class_name}" referent="{ref()}"><Properties>{props_xml}</Properties>{"".join(children_xml)}</Item>'
    node = {"name": name, "className": class_name, "children": children_map}
    if os.path.exists(meta):
        node["filePaths"] = [os.path.relpath(meta, ROOT)]
    return xml, node


def build_script(path, filename):
    class_name, name = script_kind(filename)
    with open(path, encoding="utf-8") as f:
        source = f.read()
    if "]]>" in source:
        raise ValueError(f"{path} contiene ']]>' y no se puede meter en CDATA")
    xml = (
        f'<Item class="{class_name}" referent="{ref()}"><Properties>'
        f"{prop_xml('Name', name)}"
        f'<ProtectedString name="Source"><![CDATA[{source}]]></ProtectedString>'
        f"</Properties></Item>"
    )
    node = {"name": name, "className": class_name, "filePaths": [os.path.relpath(path, ROOT)]}
    return xml, node


def main():
    xml, node = build_dir(SRC, "CarreraGlobos")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write('<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" '
                'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
                'xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">')
        f.write(xml)
        f.write("</roblox>\n")

    sourcemap = {
        "name": "CarreraDeGlobos",
        "className": "DataModel",
        "children": [{"name": "ServerScriptService", "className": "ServerScriptService", "children": [node]}],
    }
    with open(SOURCEMAP, "w", encoding="utf-8") as f:
        json.dump(sourcemap, f, indent=1)
    print(f"Listo: {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
