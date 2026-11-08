// Para probar con la fuente real (Archivo, variable en ancho y peso) sin internet: se sirve desde una carpeta local.
// Bajarla una vez: el paquete npm @fontsource-variable/archivo (descomprimido en <carpeta>/archivo/package),
// y pasar la carpeta en ROSADA_FUENTES.
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = async function usarFuentes(page, dir) {
  dir = dir || process.env.ROSADA_FUENTES;
  const archivo = dir && path.join(dir, 'archivo/package/files/archivo-latin-wdth-normal.woff2');
  if (!archivo || !fs.existsSync(archivo)) {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    return false;
  }
  const css = "@font-face{font-family:'Archivo';font-style:normal;font-weight:100 900;font-stretch:62% 125%;src:url(https://fonts.gstatic.com/archivo.woff2) format('woff2')}";
  await page.route(/fonts\.googleapis\.com/, (r) => r.fulfill({ contentType: 'text/css', body: css }));
  await page.route(/fonts\.gstatic\.com/, (r) => r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(archivo) }));
  return true;
};
