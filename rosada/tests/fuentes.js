// Para probar con las fuentes reales (Lilita One y Nunito) sin internet: se sirven desde una carpeta local.
// Bajarlas una vez: los paquetes npm @fontsource/lilita-one y @fontsource/nunito, y pasar la carpeta en ROSADA_FUENTES.
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = async function usarFuentes(page, dir) {
  dir = dir || process.env.ROSADA_FUENTES;
  const archivos = {
    'lilita.woff2': 'lilita-one/package/files/lilita-one-latin-400-normal.woff2',
    'n600.woff2': 'nunito/package/files/nunito-latin-600-normal.woff2',
    'n700.woff2': 'nunito/package/files/nunito-latin-700-normal.woff2',
    'n800.woff2': 'nunito/package/files/nunito-latin-800-normal.woff2',
    'n900.woff2': 'nunito/package/files/nunito-latin-900-normal.woff2',
  };
  if (!dir || !fs.existsSync(path.join(dir, archivos['lilita.woff2']))) {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    return false;
  }
  const css = "@font-face{font-family:'Lilita One';font-weight:400;src:url(https://fonts.gstatic.com/lilita.woff2) format('woff2')}" +
    [600, 700, 800, 900].map((w) => `@font-face{font-family:'Nunito';font-weight:${w};src:url(https://fonts.gstatic.com/n${w}.woff2) format('woff2')}`).join('');
  await page.route(/fonts\.googleapis\.com/, (r) => r.fulfill({ contentType: 'text/css', body: css }));
  await page.route(/fonts\.gstatic\.com/, (r) => {
    const nombre = r.request().url().split('/').pop();
    const f = archivos[nombre];
    if (!f) return r.abort();
    r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(path.join(dir, f)) });
  });
  return true;
};
