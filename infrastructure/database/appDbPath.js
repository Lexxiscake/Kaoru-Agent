// @ts-check
'use strict';
/**
 * appDbPath.js — resuelve la ruta de `core.db` que usa la aplicación.
 *
 * La app Electron abre `core.db` dentro de su userData (ver core/core/init.js).
 * Los scripts de mantenimiento (init_vectors, tests) necesitan apuntar a la
 * MISMA base; antes `init_vectors.js` usaba `data/core.db`, así que `npm run
 * init-db` poblaba una base que la app nunca leía y el IntentDetector quedaba
 * desactivado con "Tablas de intenciones no encontradas".
 *
 * Prioridad:
 *   1. `KAORU_DB_PATH` — override explícito (tests/CI).
 *   2. `ASISTENTE_DATA_DIR` — mismo contrato que core/core/init.js sin app.
 *   3. userData por plataforma, con el nombre que fija `app.setName` en main.js.
 */

const os = require('os');
const path = require('path');

const APP_NAME = 'vtuber-overlay';

/**
 * Directorio de datos de usuario que Electron asigna a la app.
 * @returns {string}
 */
function resolveAppDataDir() {
  const home = os.homedir();
  if (process.platform === 'win32') {
    return process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
  }
  if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support');
  }
  return process.env.XDG_CONFIG_HOME || path.join(home, '.config');
}

/**
 * Ruta absoluta de la base que abre la app.
 * @returns {string}
 */
function resolveAppDbPath() {
  if (process.env.KAORU_DB_PATH) return path.resolve(process.env.KAORU_DB_PATH);
  if (process.env.ASISTENTE_DATA_DIR) {
    return path.join(path.resolve(process.env.ASISTENTE_DATA_DIR), 'core.db');
  }
  return path.join(resolveAppDataDir(), APP_NAME, 'core.db');
}

module.exports = { APP_NAME, resolveAppDataDir, resolveAppDbPath };
