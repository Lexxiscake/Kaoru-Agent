# Inicialización de base de datos vectorial (`infrastructure/database/`)

Prepara las tablas de índices vectoriales en `core.db` para la **detección semántica de intenciones**
y el **recall de memoria** — embeddings locales, sin dependencia de servicios externos.

---

## `init_vectors.js`

Inicializa y puebla las tablas vectoriales:

| Tabla | Propósito |
|---|---|
| `intent_catalog` | Catálogo de frases de referencia para la detección de intenciones |
| `intent_vectors` | Embeddings 384d (`all-MiniLM-L6-v2`) de cada frase |

**Intenciones soportadas (60+ frases):** `read_file`, `edit_file`, `run_command`, `web_search`,
`browser`, `create_file`, `apply_patch`, `list_directory`, `code_execution` y más — con variantes
multilingües y narrativas.

**Uso:**

```bash
npm run init-db                                       # inicializa userData/core.db (el que abre la app)
node infrastructure/database/init_vectors.js --force  # reindexado forzado
node infrastructure/database/init_vectors.js --db=ruta/core.db  # otra base (tests/CI)
```

La ruta por defecto la resuelve `appDbPath.js`: `KAORU_DB_PATH` > `ASISTENTE_DATA_DIR` >
userData de la app (`%APPDATA%\vtuber-overlay\core.db` en Windows,
`~/.config/vtuber-overlay/core.db` en Linux).

Dependencia: `@xenova/transformers` (misma BD del asistente, misma sesión de embeddings que el `StateGraph`).

```mermaid
flowchart LR
    INIT["init_vectors.js"] --> EMB["@xenova/transformers<br/>all-MiniLM-L6-v2<br/>embeddings 384d"]
    EMB -->|"frases de referencia"| CAT["intent_catalog<br/>60+ intenciones multilingües"]
    EMB -->|"vectores"| VEC["intent_vectors<br/>(tabla vec0)"]
    VEC --> DET["IntentDetector<br/>búsqueda coseno"]
    DET -->|"toolIntent"| SER["Serializador / contexto"]
```

---

## Verificación

`test_intent_detection` cubre el pipeline completo con la BD vectorial poblada, incluido el fallback
a LLM cuando los embeddings no son suficientes.
