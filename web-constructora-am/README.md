# Web Constructora A&M

Landing page de una sola página: Next.js (App Router) + TypeScript + Tailwind CSS 4 + Framer Motion + lucide-react,
exportada como sitio estático que funciona abriendo `index.html` con doble clic (file://).

## Comandos

```bash
npm install
npm run dev        # desarrollo en http://localhost:3000
npm run build      # genera out/ (sitio estático con rutas relativas)
npm run package    # build + arma Web_ConstructoraAM.zip
npm run brand      # regenera logo-icon.png y og.jpg desde el logo en vector (requiere Playwright)
python3 scripts/importar_fotos.py "<carpeta con fotos de WhatsApp>"   # recorta y comprime las fotos reales
```

## Dónde se cambia cada cosa

- **Todos los datos y textos:** `src/content/site.ts`. Los valores `null` son datos pendientes
  (la web los marca como «pendiente» o esconde el elemento). Buscá `PENDIENTE` en ese archivo.
- **Fotos:** `public/images/` (mismo nombre de archivo). `scripts/importar_fotos.py` documenta qué foto
  original va en cada lugar, con qué recorte, y les quita los metadatos (ubicación GPS, teléfono).
- **Antes y después:** `site.antesDespues` en `site.ts`. Cada par necesita dos fotos del mismo tamaño,
  sacadas desde el mismo ángulo.
- **Logo:** monograma en vector en `src/components/ui/Logo.tsx` (y `public/favicon.svg`).
- **Colores y tipografías:** paleta del logo (crema, dorado metálico, marrón casi negro) como tokens en
  `src/app/globals.css` (`@theme`, más `.bg-gold` y `.text-gold`); Montserrat + Manrope en `src/app/layout.tsx`.
- **Formulario → Formspree/EmailJS:** poné la URL en `site.formulario.endpoint`; el envío está en
  `src/lib/enviarConsulta.ts`. Sin endpoint, el formulario arma el mensaje y abre WhatsApp.

## Notas técnicas

- `next.config.ts` usa `output: "export"` y `assetPrefix: "./"`; `scripts/relativize.mjs` corrige
  cualquier ruta absoluta que quede en `out/`.
- Las fuentes no se precargan (`preload: false`) porque Chrome bloquea los `<link rel=preload crossorigin>`
  en file://. Se cargan igual desde el CSS, con métricas de respaldo para que no salte el texto.
- Todas las animaciones respetan `prefers-reduced-motion`.
