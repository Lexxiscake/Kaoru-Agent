# Web pública de Kaoru

La landing adapta el diseño proporcionado en `Downloads/landing kaoru`: superficies neutras,
tarjetas, modo claro/oscuro, navegación fija y bloques de contraste. La copia de Downloads no se
modifica. La implementación publicada no necesita Tailwind, fuentes ni iconos de CDN.

## Páginas e idiomas

Cada idioma tiene portada, guía, privacidad y términos. El manual completo se publica en
`manual.html` solo en español; las guías inglesa y japonesa lo enlazan indicando el idioma.
Si se exige paridad documental total, ese manual pendiente de traducción es el trabajo restante.
Español usa la raíz; inglés `en/` y japonés `ja/`. Los enlaces de idioma conservan la página y su
fragmento donde existe traducción. Las páginas son HTML estático: el contenido y los enlaces
siguen disponibles sin JavaScript.

- `content/{es,en,ja}.json`: textos de portada y guía.
- `../manual-de-uso.md`: fuente canónica del manual web en español; la plantilla genera su índice,
  secciones y tablas adaptables.
- `content/{es,en,ja}/{privacy,terms}.html`: textos legales. El español es canónico; inglés y
  japonés lo indican. El texto legal español existente se conserva al aplicar la nueva plantilla.
- `assets/styles.css`: diseño compartido y adaptación móvil.
- `assets/main.js`: tema, menú, copia de comandos y aparición suave; respeta movimiento reducido.
- `assets/*.png`: capturas originales del proyecto, servidas desde la propia web.
- `scripts/build-website.js`: plantilla común y generación determinista de las trece páginas.

## Actualizar y comprobar

Edita las fuentes y genera el HTML; no edites directamente las páginas generadas:

```sh
node scripts/build-website.js
node scripts/build-website.js --check
bash tests/run-all.sh tests/test_website.js
```

La prueba necesita Chromium de Playwright y permiso para abrir un servidor HTTP local. Comprueba
las trece rutas, recursos, enlaces y anclas, idiomas, ausencia de desbordamiento, cambio de tema,
navegación móvil, portapapeles, almacenamiento bloqueado, movimiento reducido y lectura sin JS.

## Publicación en GitHub Pages

El sitio es estático (HTML/CSS/JS generado) y está listo para servirse desde la carpeta `docs/` del repositorio: `docs/index.html` redirige a `web/index.html`.

Configuración en GitHub (una vez por repositorio):

1. Ve a **Settings → Pages** del repositorio.
2. En **Build and deployment → Source**, selecciona **Deploy from a branch**.
3. En **Branch**, elige `main` y la carpeta **`/docs`**.
4. Guarda los cambios. GitHub publicará el sitio y mostrará la URL (normalmente `https://<usuario>.github.io/<repositorio>/`).

Notas técnicas:

- No se requiere workflow de Actions ni paso de build en GitHub: los archivos publicados son los ya versionados en `docs/` (incluye `docs/web/` y `docs/index.html`).
- Si actualizas el contenido fuente, regenera y commitea el resultado antes de publicar: `node scripts/build-website.js`.
- El sitio no usa Jekyll; si alguna vez se necesita desactivar su procesamiento, añade un archivo vacío `docs/.nojekyll` (no es necesario con la estructura actual).

## Alcance editorial

El contenido diferencia el flujo smart de otros modos, dependencias opcionales y soporte de OS.
Los controles de permisos, aislamiento, verificación y recuperación no se presentan como garantías
universales. El código MIT se distingue de los derechos de los modelos Live2D. Para uso con clientes,
se explican proveedor, permisos, datos y revisión de resultados sin anunciar soporte contractual.

Referencias de implementación: `core/lsp/RepositoryIntelligence.js`,
`core/planner/AgentLoop.js`, `core/planner/verify-runner.js`, `core/desktop/`,
`core/security/`, `src/chat/asr.js`, `src/chat/tts.js`, `package.json` y `LICENSE`.

El sitio guarda únicamente la elección de tema en localStorage; no incorpora analítica ni formularios.
Los enlaces externos se visitan al abrirlos. Las prácticas de datos de la aplicación se explican
por separado en el aviso de privacidad.
