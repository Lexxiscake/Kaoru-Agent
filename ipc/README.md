# Capa IPC (`ipc/`)

Puente entre el proceso principal de Electron y los renderers (`src/` y `src/chat/`).
Cada módulo expone `register(ctx)` y recibe el contexto compartido (`S`) y helpers
creados en `main.js`.

## `state.js`

`createSharedState(initial)` crea el estado compartido del proceso principal:
ventanas (`mainWindow`, `chatWindow`), tray, flags de overlay/modelo, tema y
modelo activo.

## Registro de handlers

Registrados en `main.js`:

| Módulo | Responsabilidad |
| --- | --- |
| `window-model-handlers.js` | Ventana overlay, click-through, vistas y cambios de modelo Live2D |
| `memory-handlers.js` | Memoria, contexto/grounding, sesiones y skills/facts |
| `config-handlers.js` | Configuración, claves, mantenimiento (`update:open-releases`, reset) y utilidades asociadas |
| `init-vectors-handlers.js` | `exec-command` con allowlist estricta de comandos de solo lectura |
| `openclaw-handlers.js` | Disponibilidad del tool host, ejecución/cancelación/steer del agente y aprobaciones |
| `mcp-handlers.js` | MCP, workspace activo y telemetría |
| `github-handlers.js` | OAuth/login y operaciones de GitHub |
| `security-handlers.js` | Seguridad, permisos y flujos relacionados |
| `proactive-handlers.js` | Motor proactivo y notificaciones/eventos asociados |
| `overlay-handlers.js` | Interacciones y estado del overlay |
| `chat-handlers.js` | Flujo de chat, streaming, voz/ASR-TTS y llamadas UI |
| `terminal-handlers.js` | Terminal integrada (PTY) |
| `intentions-handlers.js` | Intenciones/objetivos expuestos al renderer |

## Canales y allowlists

- `channel-whitelist.js` es la fuente canónica de canales permitidos (`invoke`,
  `send`, `on`) y los preloads mantienen copias locales como defensa en
  profundidad.
- `tests/test_channel_whitelist.js` valida consistencia entre allowlists y
  canales críticos.
- Las ejecuciones de agente usan `AbortController` y el canal de aprobación
  distingue `ask/allow/deny`, timeout (`agent.approvalTimeoutMs`) y expiración.

## Verificación

La salud IPC y de seguridad se cubre con la suite curada (`npm test`) y los
checks estáticos (`npm run lint`, `npm run typecheck`).
