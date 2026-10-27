# VISSION — sitio web

Sitio del estudio VISSION (Montevideo). HTML + CSS + JS, sin build.

## Verlo en localhost

```bash
cd vission
npm start            # → http://localhost:5173
```

(Sin Node: `python3 -m http.server 5173` dentro de `vission/` también sirve.)

## Un solo archivo descargable

`dist/VISSION.html` es el sitio entero en un archivo (código, librerías, fuentes e imágenes adentro).
Se abre con doble clic, sin servidor y sin internet. Para regenerarlo después de cambiar algo:

```bash
npm install esbuild   # una vez, en cualquier carpeta
ESBUILD=/ruta/a/node_modules/esbuild/lib/main.js node tools/build-single.mjs
```

## Cómo está hecho el ojo

- Tres fotos en capas (`assets/eye/`): ojo sin iris (`open.webp`), ojo cerrado (`closed.webp`) e iris en macro (`iris.webp`).
- `js/eye-shader.js`: un shader WebGL (Three.js) con una cámara perspectiva real. Compone párpados, esclerótica, iris,
  pupila que se dilata, escorzo al mirar de costado, sombra del párpado y el parpadeo (cortinas con la foto del ojo cerrado).
  Una segunda pasada dibuja solo los reflejos de la córnea, por encima del wordmark.
- El wordmark **VISSION** es texto HTML real, ubicado con la misma matemática de la cámara: siempre dentro de la pupila
  y recortado por los párpados.
- `js/eye-life.js`: mirada con cuaterniones (slerp), parpadeo cada 20 s ± 2 s, pupila que enfoca y se dilata sobre el CTA,
  giroscopio en celular (o mirada autónoma) y modo de movimiento reducido.
- `js/hero.js`: la secuencia de scroll (GSAP ScrollTrigger + Lenis) y la intro.
- `js/sections.js`: el resto de las secciones.

## Qué completar

| Qué | Dónde |
|---|---|
| Número de WhatsApp | `js/sections.js` → `CONTACT.whatsapp` (ej. `59899123456`) |
| Fotos del equipo | `assets/equipo/lorenzo.jpg` y `assets/equipo/alejandro.jpg` (4:5). Si no están, se ve un marco neutro. |
| Roles del equipo | `index.html`, sección `#nosotros` |
| Precios de los planes | `index.html`, sección `#planes` |
| Testimonios reales | `js/sections.js` → `STATEMENTS` (`{ quote, name, business, rubro }`) |
| Mail del botón «Pedí tu demo» | `index.html`, sección `#contacto` (hoy `hola@vission.uy`) |

Los casos de «Antes / Después» son conceptuales (negocios ficticios) y están marcados así en la página.
