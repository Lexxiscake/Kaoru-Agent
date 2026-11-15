<div align="center">

<img src="../../../screenshots/02-overlay-character.png" width="150" alt="Kaoru Live2D desktop assistant" />

# Kaoru

### An intelligent presence on your desktop

**Understands context · remembers what matters · asks before acting**

[Español](../../../README.md) · [日本語](../ja/README.md) · **English**

</div>

---

## Demos

<div align="center">

https://github.com/user-attachments/assets/51607f76-a4db-4959-baf5-92f70caec34d

<details>
<summary><b>Quick demo (GIF)</b></summary>
<br/>
<img src="../../../screenshots/demo.gif" alt="Kaoru in action" width="860" />
</details>

</div>

---

Kaoru is a Windows and Linux desktop assistant (Electron + Live2D) that combines conversation, local semantic memory, OS signals, and a permission-aware tool agent. Sensor-driven initiative is evaluated by deterministic policy before an LLM writes the message.

> **Status:** beta. Some areas are experimental and still need external validation. Detailed technical docs are mainly in Spanish during migration; this page is a curated entry point.

## What makes Kaoru different

- **Context-aware:** configurable OS, Git, LSP, focus, idle, and event sensors.
- **Local memory:** StateGraph stores facts, preferences, episodes, and intentions with semantic retrieval and temporal decay.
- **Auditable initiative:** sensor signals are normalized and classified as `ACT`, `QUEUE`, `DROP`, or `ESCALATE`.
- **Governed actions:** proposals, permission policy, consent, execution, verification, and recovery remain separate stages.
- **Extensible:** local plugins, skills, subagent profiles, and LSP servers.
- **A real desktop presence:** Live2D overlay, gestures, voice, and a streaming Markdown chat.

## Security model

The LLM is not Kaoru's authorization authority. Tool-impact classification, `allow`/`ask`/`deny` rules, session approvals, workspace path controls, and execution boundaries are enforced outside model output. Approval is policy-dependent—not every operation prompts.

Command sandboxing is platform-specific: Windows uses AppContainer; Linux uses `bubblewrap` when available; macOS currently has no additional process sandbox. Electron renderer sandboxing is a separate control.

## Quick start

Requirements: Node.js 18+, npm 9+, and Windows or Linux for implemented OS sensors.

```bash
git clone https://github.com/Lexxiscake/Kaoru-Agent.git
cd Kaoru-Agent
npm install
npm run rebuild
npm start
```

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
```

> Tests touching `better-sqlite3`/`sqlite-vec` run through Electron's Node runtime (`npm test` handles this).

## Documentation

Memory, embeddings, preferences, and telemetry are stored locally. Kaoru is not necessarily offline: selected context may be sent to the configured LLM, speech service, or enabled integrations. Desktop access is split into independently configurable capabilities (apps, browser, screen, pointer, keyboard, processes, camera).

- [Documentation center](../../README.md)
- [Main README (Spanish)](../../../README.md)
- [Website & user guide](../../web/en/index.html)
- [Privacy notice](../../web/en/privacy.html)
- [Terms of use](../../web/en/terms.html)
- [Architecture (Spanish)](../../arquitectura.md)
- [Core](../../../core/README.md) · [IPC](../../../ipc/README.md) · [Testing](../../../tests/README.md)

<div align="center">

*Built with care so a desktop AI can be useful without forgetting to ask.*

</div>
