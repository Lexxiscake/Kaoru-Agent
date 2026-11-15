// @ts-nocheck
'use strict';
const { getToolSchemas } = require('../llm/ToolSchemas.js');
const { getToolRegistry } = require('./ToolRegistry.js');
const { CapabilityRouter } = require('./CapabilityRouter.js');

// Una misión compuesta solo necesita las entradas de alto nivel en el loop
// padre. DesktopMissionLoop posee su propio catálogo acotado de controles UI;
// repetirlo aquí infla cada request y hace que providers con TPM bajo rechacen
// la llamada antes de ejecutar la primera herramienta.
const DESKTOP_ORCHESTRATORS = new Set([
  'list_apps',
  'desktop_mission',
  'launch_app',
  'open_website',
  'play_media',
  'desktop_capabilities',
]);

/** @param {unknown} value @returns {string|null} */
function _domainId(value) {
  if (typeof value === 'string') return value || null;
  if (value && typeof value === 'object' && typeof value.id === 'string') return value.id || null;
  return null;
}

/**
 * Decide si una intención estructurada debe entrar al loop padre de escritorio.
 * Usa dominios y procedencia del detector, no palabras del mensaje, para que la
 * misma política funcione con detección por embeddings en cualquier idioma.
 * @param {any} taskIntent
 * @returns {boolean}
 */
function shouldPreferDesktopOrchestrators(taskIntent) {
  if (!taskIntent?.isTask) return false;
  const matchedDomains = (taskIntent?._debug?.matchedDomains || [])
    .map((item) => _domainId(item?.domain))
    .filter(Boolean);
  if (matchedDomains.length > 1) return true;
  if (_domainId(taskIntent.domain) !== 'system') return false;
  const cameFromSemanticDetection =
    Boolean(taskIntent?._debug?.fusedFrom) || taskIntent?._debug === undefined;
  return taskIntent.confidence === 'high' || cameFromSemanticDetection;
}

async function resolveToolset(context = {}) {
  const {
    userMessage = '',
    domain = null,
    toolRegistry,
    skillManager = null,
    db = null,
    matchedSkills = null,
    capabilityStatsProvider = null,
    domains = [],
    preferOrchestrators = false,
  } = context;

  const registry = toolRegistry || getToolRegistry();

  const result = {
    promptCatalog: null,
    nativeToolSchemas: null,
    excluded: [],
    precedence: 'openclaw',
    matchedSkills: [],
    routing: [],
    allowedToolNames: null,
  };

  // 1. Resolve matched skills
  let skills = matchedSkills;
  if (!skills && skillManager && db) {
    try {
      skills = await skillManager.match(userMessage, db);
    } catch {
      skills = null;
    }
  }
  if (!skills) skills = [];

  result.matchedSkills = skills;

  // 2. Collect all candidate tools
  const openclawTools = registry._getOpenClawTools ? registry._getOpenClawTools() : [];
  const desktopTools = registry._getDesktopTools ? registry._getDesktopTools() : [];
  const lspTools = registry._getLSPTools ? registry._getLSPTools() : [];
  const gitTools = registry._getGitTools ? registry._getGitTools() : [];
  const githubTools = registry._getGitHubTools ? registry._getGitHubTools() : [];
  const router = new CapabilityRouter({
    stats: capabilityStatsProvider ? capabilityStatsProvider() : {},
  });

  // 3. Determine excluded domains
  const excludedDomains = new Set();

  // Skills exclude ONLY if replaces_domains is explicitly set
  for (const skill of skills) {
    if (
      !skill.replaces_domains ||
      !Array.isArray(skill.replaces_domains) ||
      skill.replaces_domains.length === 0
    )
      continue;
    for (const d of skill.replaces_domains) {
      excludedDomains.add(d);
    }
  }

  // Determine precedence winner
  if (skills.length > 0) {
    result.precedence = 'skill';
  }

  // 4. Build filtered OpenClaw tools
  const filteredOpenclaw = openclawTools.filter((t) => {
    const tDomains = t.domain || [];
    const replacedBySkill = tDomains.some((d) => excludedDomains.has(d));
    if (replacedBySkill) {
      result.excluded.push({ source: 'openclaw', tool: t.name, domain: t.domain });
    }
    return !replacedBySkill;
  });

  // 5. Build result
  const requestedDomains = new Set(
    [domain, ...(Array.isArray(domains) ? domains : [])].map(_domainId).filter(Boolean)
  );
  const candidates = [
    ...filteredOpenclaw,
    ...desktopTools,
    ...lspTools,
    ...gitTools,
    ...githubTools,
  ].filter((tool) => {
    if (requestedDomains.size === 0) return true;
    if ((tool.domain || []).some((item) => requestedDomains.has(item))) return true;
    // SYSTEM es el dominio semántico de una tarea entre aplicaciones. Sus
    // entradas web/multimedia de alto nivel también deben estar disponibles
    // aunque sus tools no declaren literalmente el dominio system.
    return requestedDomains.has('system') && DESKTOP_ORCHESTRATORS.has(tool.name);
  });
  const routedCandidates = preferOrchestrators
    ? candidates.filter((tool) => DESKTOP_ORCHESTRATORS.has(tool.name))
    : candidates;
  const ranked = router.rank(routedCandidates);
  const finalTools = ranked.filter((item) => !item.route.unavailable).map((item) => item.tool);
  result.routing = ranked.map((item) => ({
    source: item.tool.source,
    server: item.tool.server || null,
    tool: item.tool.name,
    ...item.route,
  }));

  // Native tool schemas (for tool-calling API)
  const allSchemas = getToolSchemas();
  if (finalTools.length > 0) {
    const schemaByName = new Map(allSchemas.map((schema) => [schema.name, schema]));
    const baseSchemas = finalTools.map((tool) => schemaByName.get(tool.name)).filter(Boolean);
    if (baseSchemas.length > 0) {
      result.nativeToolSchemas = [...baseSchemas];
      if (preferOrchestrators) {
        result.allowedToolNames = new Set(result.nativeToolSchemas.map((schema) => schema.name));
      }
    }
  }

  // Prompt catalog (text for system prompt)
  if (finalTools.length > 0) {
    result.promptCatalog = _buildPromptCatalog(finalTools, domain, {
      hasSkills: skills.length > 0,
      hasLSP: lspTools.length > 0,
    });
  }

  return result;
}

function _buildPromptCatalog(tools, domain, flags) {
  // Render único compartido (CatalogRenderer.js): mismo texto que antes.
  // `domain` no se usaba en el cuerpo (se conserva el parámetro por firma).
  void domain;
  const { renderToolCatalog } = require('./CatalogRenderer.js');
  return renderToolCatalog(tools, {
    skillNote: !!(flags && flags.hasSkills),
    usageStyle: 'resolver',
  });
}

module.exports = { resolveToolset, shouldPreferDesktopOrchestrators };
