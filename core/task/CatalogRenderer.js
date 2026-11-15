// @ts-check
'use strict';

/**
 * CatalogRenderer.js — UNICO renderizador del catálogo de tools a prompt.
 *
 * Antes había dos implementaciones que formateaban lo mismo con diferencias
 * sutiles: `ToolRegistry.serializeToPrompt()` y `ToolResolver._buildPromptCatalog()`.
 * Ambas delegan acá; las diferencias reales (notas de disponibilidad, estilo
 * gu��as y secciones extra son flags expl��citos, no c��digo duplicado.
 * Único texto normalizado: la guía de git (se usa la variante del resolver,
 * que es la vía productiva; la diferencia era solo redacción).
 *
 * Marcadores estables que los tests y el truncado esperan:
 *   '# HERRAMIENTAS DISPONIBLES'
 */

const GIT_GUIDE_LINES = [
  'Guía de uso: PREFIERE estas herramientas nativas a exec para operaciones de',
  'git (son más confiables y git_commit ya hace add -A). Si usas exec con',
  'comandos git: (1) corre git status antes de commitear; (2) usa "git add ."',
  'salvo que el usuario pida un archivo puntual; (3) si no hay cambios staged,',
  'AVISA y no inventes un commit; (4) usa el mensaje de commit que pidió el',
  'usuario; (5) cuando el push confirme éxito la tarea está completa — detente.',
];

const LEGACY_USAGE_LINES = [
  '### Formato de uso',
  'Para usar las herramientas locales de Kaoru, describe EXACTAMENTE la acción con el formato apropiado:',
  '  - Comandos: "Ejecutar: <comando>"',
  '  - Leer: "Voy a leer el archivo <ruta>"',
  '  - Escribir: "Voy a escribir el archivo <ruta>"',
  '  - Editar: "Voy a editar el archivo <ruta>"',
  '  - Web: "Buscar en internet: <consulta>"',
];

const RESOLVER_USAGE_LINES = [
  '### Formato de uso',
  'Describe EXACTAMENTE qué acción quieres ejecutar.',
  '  - Para comandos: describe el comando directamente',
  '  - Para archivos: describe qué archivo y qué cambio',
  '  - Para web: describe qué buscar o navegar',
];

const LEGACY_RULES_LINES = [
  '### Reglas importantes',
  '1. NUNCA inventes resultados de comandos o herramientas',
  '2. Anuncia cada acción antes de ejecutarla',
  '3. Si una acción requiere aprobación, espera confirmación',
  '4. No ejecutes acciones que no te hayan pedido explícitamente',
];

/**
 * @param {Array<{name: string, source: string, description?: string, server?: string, highImpact?: boolean}>} tools herramientas ya filtradas/ordenadas por el caller
 * @param {object} [opts]
 * @param {string|null} [opts.domainLabel] línea "Puedes usar estas herramientas para..." (registry)
 * @param {boolean} [opts.skillNote] nota de skills que reemplazan (resolver)
 * @param {boolean} [opts.openclawUnavailableNote] sufijo ' (servicio no disponible)'
 * @param {boolean} [opts.lspUnavailableNote] sufijo ' (LSP no activo)'
 * @param {boolean} [opts.openclawTitleSuffix] ' (OpenClaw)' en el título del sistema (registry)
 * @param {'grouped'|'flat-capped'} [opts.mcpStyle] grouped = resolver, flat-capped = registry
 * @param {number} [opts.maxTools] tope para flat-capped
 * @param {boolean} [opts.includePlugins] sección de plugins (solo registry la tenía)
 * @param {'legacy'|'resolver'} [opts.usageStyle]
 * @param {boolean} [opts.rulesSection] "### Reglas importantes" (solo legacy)
 * @returns {string}
 */
function renderToolCatalog(tools, opts = {}) {
  const {
    domainLabel = null,
    skillNote = false,
    openclawUnavailableNote = false,
    lspUnavailableNote = false,
    openclawTitleSuffix = false,
    mcpStyle: _mcpStyle = 'grouped',
    maxTools: _maxTools = 30,
    includePlugins = false,
    usageStyle = 'resolver',
    rulesSection = false,
  } = opts;

  const lines = ['# HERRAMIENTAS DISPONIBLES'];
  if (domainLabel)
    lines.push(`Puedes usar estas herramientas para tareas relacionadas con: ${domainLabel}`);
  if (skillNote)
    lines.push('Se han cargado skills específicas que reemplazan herramientas genéricas.');
  lines.push('');

  /** @param {string} source */
  const bySource = (source) => tools.filter((t) => t.source === source);
  const openclawTools = bySource('openclaw');
  const desktopTools = bySource('desktop');
  const lspTools = bySource('lsp');
  const gitTools = bySource('git');
  const githubTools = bySource('github');
  const pluginTools = bySource('plugin');

  if (openclawTools.length > 0) {
    lines.push(
      openclawTitleSuffix
        ? '## Herramientas del sistema (motor local de Kaoru)'
        : '## Herramientas del sistema'
    );
    for (const t of openclawTools) {
      let line = `  - ${t.name}`;
      if (t.description) line += `: ${t.description}`;
      if (openclawUnavailableNote) line += ' (servicio no disponible)';
      lines.push(line);
    }
    lines.push('');
  }

  if (desktopTools.length > 0) {
    lines.push('## Control visible del escritorio');
    for (const t of desktopTools) {
      let line = `  - ${t.name}`;
      if (t.description) line += `: ${t.description}`;
      lines.push(line);
    }
    lines.push('');
  }

  if (lspTools.length > 0) {
    lines.push('## Herramientas LSP (análisis de código)');
    for (const t of lspTools) {
      let line = `  - ${t.name}`;
      if (t.description) line += `: ${t.description}`;
      if (lspUnavailableNote) line += ' (LSP no activo)';
      lines.push(line);
    }
    lines.push('');
  }

  if (gitTools.length > 0) {
    lines.push('## Herramientas Git (nativas)');
    for (const t of gitTools) {
      let line = `  - ${t.name}`;
      if (t.description) line += `: ${t.description}`;
      if (t.highImpact) line += ' (requiere aprobación)';
      lines.push(line);
    }
    lines.push(...GIT_GUIDE_LINES);
    lines.push('');
  }

  if (githubTools.length > 0) {
    lines.push('## Herramientas GitHub (nativas)');
    for (const t of githubTools) {
      let line = `  - ${t.name}`;
      if (t.description) line += `: ${t.description}`;
      if (t.highImpact) line += ' (requiere aprobación)';
      lines.push(line);
    }
    lines.push('');
  }

  if (includePlugins && pluginTools.length > 0) {
    lines.push('## Herramientas de plugins');
    for (const t of pluginTools) {
      let line = `  - ${t.name}`;
      if (t.description) line += `: ${t.description}`;
      if (t.highImpact) line += ' (requiere aprobación)';
      lines.push(line);
    }
    lines.push('');
  }

  if (usageStyle === 'legacy') {
    lines.push(...LEGACY_USAGE_LINES);
    lines.push('');
    if (rulesSection) lines.push(...LEGACY_RULES_LINES);
  } else {
    lines.push(...RESOLVER_USAGE_LINES);
  }

  return lines.join('\n');
}

module.exports = { renderToolCatalog };
