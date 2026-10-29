# Web Constructora A&M

Landing page de una sola página: Next.js (App Router) + TypeScript + Tailwind CSS 4 + Framer Motion + lucide-react,
exportada como sitio estático que funciona abriendo `index.html` con doble clic (file://).

## Comandos

```bash
npm install
npm run dev        # desarrollo en http://localhost:3000
npm run build      # genera out/ (sitio estático con rutas relativas)
npm run package    # build + arma Web_ConstructoraAM.zip
npm run images     # regenera las imágenes de relleno (requiere Python + Pillow)
```

## Dónde se cambia cada cosa

- **Todos los datos y textos:** `src/content/site.ts`. Los valores `null` son datos pendientes
  (la web los marca como «pendiente» o esconde el elemento). Buscá `PENDIENTE` en ese archivo.
- **Fotos:** `public/images/` (mismo nombre de archivo).
- **Colores y tipografías:** tokens en `src/app/globals.css` (`@theme`) y fuentes en `src/app/layout.tsx`.
- **Formulario → Formspree/EmailJS:** poné la URL en `site.formulario.endpoint`; el envío está en
  `src/lib/enviarConsulta.ts`. Sin endpoint, el formulario arma el mensaje y abre WhatsApp.

## Notas técnicas

- `next.config.ts` usa `output: "export"` y `assetPrefix: "./"`; `scripts/relativize.mjs` corrige
  cualquier ruta absoluta que quede en `out/`.
- Las fuentes no se precargan (`preload: false`) porque Chrome bloquea los `<link rel=preload crossorigin>`
  en file://. Se cargan igual desde el CSS, con métricas de respaldo para que no salte el texto.
- Todas las animaciones respetan `prefers-reduced-motion`.
