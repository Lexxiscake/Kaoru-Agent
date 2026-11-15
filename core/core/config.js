// @ts-nocheck
const logger = require('../observability/Logger.js');

const { readJsonFile } = require('../utils/fsUtils.js');
const LLMProvider = require('../llm/LLMProvider.js');
const KeychainManager = require('../../infrastructure/keychain/KeychainManager.js');
const SafeStorageCrypto = require('../../infrastructure/config/SafeStorageCrypto.js');

const state = require('./state.js');

function loadLLMConfig() {
  try {
    if (!state.configPath || !require('fs').existsSync(state.configPath)) return;
    const cfg = readJsonFile(state.configPath, null);

    if (cfg?.llm?.apiKeys) {
      cfg.llm.apiKeys = SafeStorageCrypto.decryptAllKeys(cfg.llm.apiKeys);
    }
    if (cfg?.llm?.providers) {
      for (const provider of Object.values(cfg.llm.providers)) {
        if (provider?.apiKey) provider.apiKey = SafeStorageCrypto.decrypt(provider.apiKey);
      }
    }

    if (cfg?.llm) {
      cfg.llm.apiKeys = cfg.llm.apiKeys || {};
      const providerIds = [
        'groq',
        'gemini',
        'openai',
        'anthropic',
        'xai',
        'nvidia',
        'huggingface',
        'deepseek',
        ...Object.keys(cfg.llm.providers || {}),
      ];
      const keychainKeys = KeychainManager.getAllKeys([...new Set(providerIds)]);
      for (const [k, v] of Object.entries(keychainKeys)) {
        if (v) {
          cfg.llm.apiKeys[k] = v;
          cfg.llm.providers = cfg.llm.providers || {};
          cfg.llm.providers[k] = { ...(cfg.llm.providers[k] || {}), apiKey: v };
        }
      }
    }

    if (cfg?.llm) {
      LLMProvider.configure(cfg, { resetApiKeys: true });
      if (typeof LLMProvider.setNoEmojis === 'function') {
        LLMProvider.setNoEmojis(!(cfg.persona && cfg.persona.noEmojis === false));
      }
      logger.info(
        'config',
        '[core] LLMProvider configurado, provider:',
        LLMProvider.getActiveProvider()
      );
    }
  } catch (e) {
    logger.warn('config', '[core] error cargando config:', e.message);
  }
}

function reloadLLMConfig() {
  loadLLMConfig();
}

function readSensorsConfig() {
  const cfg = readJsonFile(state.configPath, null);
  return (cfg && cfg.sensors) || {};
}

function readAutonomyConfig() {
  const cfg = readJsonFile(state.configPath, null);
  return (cfg && cfg.autonomy) || 'suggest';
}

function readBrowserConfig() {
  const cfg = readJsonFile(state.configPath, null);
  const preferred = String(cfg?.browser?.preferred || 'default').toLowerCase();
  return {
    mediaControl: cfg?.browser?.mediaControl === 'managed' ? 'managed' : 'external',
    preferred: ['default', 'brave', 'chrome', 'chromium', 'edge', 'firefox'].includes(preferred)
      ? preferred
      : 'default',
  };
}

function readGesturesConfig() {
  const cfg = readJsonFile(state.configPath, null);
  return (cfg && cfg.gestures) || null;
}

module.exports = {
  loadLLMConfig,
  reloadLLMConfig,
  readSensorsConfig,
  readAutonomyConfig,
  readBrowserConfig,
  readGesturesConfig,
};
