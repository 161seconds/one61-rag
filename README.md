# One61 RAG

A logistics assistant that combines warehouse queries, document retrieval, and AI answers. The project includes a FastAPI service and a full-screen React workspace inspired by macOS.

## Features

- Shipment, delivery, customs, flight, and damage-report queries through a SQL agent.
- Policy and procedure retrieval with LightRAG, Qdrant, and multilingual BGE-M3 embeddings.
- Fast and reasoning modes, source citations, and response verification.
- Conversation-scoped document uploads: PDF, DOCX, TXT, MD, CSV, and JSON. The workspace limits files to 25 MB each.
- Conversation history, saved answers, search, and JSON export.
- Three appearance options: Light, Dark, and Dr. Doom. History and appearance preferences are saved in the current browser.

## Stack

| Component | Technology |
| --- | --- |
| Workspace | React 19, Tailwind CSS 4, Vite 7 |
| API | Python 3.11+, FastAPI, Pydantic |
| Language models | Google Gemini, configured through environment variables |
| Retrieval | LightRAG, BAAI/bge-m3, Qdrant |
| Warehouse data | PostgreSQL 16 |
| Cache and conversation memory | Redis 7 |
| Package managers | pnpm 11.8.0, uv |

The pipeline classifies requests, uses SQL or document retrieval as needed, and verifies responses against the available context. Redis supports caching and conversation memory. An optional BullMQ worker integrates with an external backend.

## Requirements

- Python 3.11 or newer and [uv](https://docs.astral.sh/uv/).
- Node.js 22.13 or newer; Node.js 22 or 24 is recommended.
- pnpm 11.8.0, pinned in `frontend/package.json`.
- Docker with Docker Compose for the local infrastructure.
- A Google Gemini API key and access to the models you configure.

The embedding model downloads on first use. Initial startup can take longer while the model loads and the policy knowledge base is populated.

## Local setup

Run these commands from the repository root unless a step says otherwise.

### 1. Configure the environment

For a new checkout, copy `.env.example` to `.env`:

```sh
cp .env.example .env
```

Set `GEMINI_API_KEY`. Also set `GEMINI_MODEL` and `GEMINI_FAST_MODEL` to model IDs available to your account. The active pipeline uses the Gemini client; `MAIN_MODEL` and `FAST_MODEL` are legacy settings.

The default local service addresses are:

| Setting | Value |
| --- | --- |
| `DATABASE_URL` | `postgresql://one61_rag:one61_rag@localhost:5979/one61_rag` |
| `QDRANT_HOST` / `QDRANT_PORT` | `localhost` / `6333` |
| `REDIS_URL` | `redis://localhost:6382/0` |
| `EMBEDDING_MODEL` | `BAAI/bge-m3` |
| `EMBEDDING_DEVICE` | `cpu` |

Keep `.env` local. BullMQ is disabled by default; enable `ENABLE_BULLMQ` and configure its Redis connection only when integrating with an external queue.

### 2. Start infrastructure and install Python dependencies

```sh
docker compose up -d
uv sync --extra dev
```

Compose starts PostgreSQL, Qdrant, and Redis. It does not start the API. PostgreSQL loads `scripts/sql/warehouse_schema.sql` when its data volume is first created.

To import the included warehouse records:

```sh
uv run python -m scripts.import_warehouse_to_postgres
```

### 3. Start the API

```sh
uv run uvicorn src.main:app --host 127.0.0.1 --port 8000 --workers 1
```

One worker avoids loading multiple copies of the embedding model during local development. Keep this terminal open.

| Service | URL |
| --- | --- |
| API documentation | http://localhost:8000/docs |
| Health endpoint | http://localhost:8000/health |
| Qdrant dashboard | http://localhost:6333/dashboard |

### 4. Start the React workspace

In a separate terminal:

```sh
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

Open **http://localhost:5173/ui/**. Vite proxies `/api/*` and `/health` to `http://127.0.0.1:8000`.

The workspace opens without the API, but chat and document uploads require a running service. Use the appearance button in the header to select Light, Dark, or Dr. Doom. The same options are available in Settings.

## Serve the built workspace

```sh
cd frontend
pnpm install --frozen-lockfile
pnpm build
cd ..
uv run uvicorn src.main:app --host 127.0.0.1 --port 8000 --workers 1
```

Open **http://localhost:8000/demo**. FastAPI serves the built React app and its assets under `/ui/`. If `frontend/dist/index.html` is absent, `/demo` serves the legacy HTML console.

The Dockerfile builds the React workspace before packaging the Python service.

## API

See `/docs` for complete request and response schemas.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/chat` | Process a chat request and return an answer with metadata |
| `POST` | `/api/chat/async` | Accept a gateway request for background processing and callback delivery |
| `POST` | `/api/ingest` | Ingest document text from a JSON body |
| `POST` | `/api/test/upload` | Upload a file using multipart form data and a conversation ID |
| `POST` | `/api/dashboard/analyze` | Analyze supplied dashboard statistics |
| `GET` | `/api/stats` | Read retrieval and cache status |
| `GET` | `/health` | Read service status and `rag_initialized` |
| `GET` | `/demo` | Open the built workspace or legacy console |

Example body for `POST /api/chat`:

```json
{
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "demo-user",
  "session_id": "demo-conversation",
  "message": "Where is shipment TRK0001617?",
  "mode": "fast",
  "conversation_history": []
}
```

The workspace uploads files through `/api/test/upload` and uses the same conversation ID for chat. Stopping a reply cancels the browser's wait; server processing may continue.

## Knowledge base

Startup attempts to ingest `data/extracted/policy_chunks.json` when the LightRAG chunk collection is empty. Warehouse lookup data is imported separately into PostgreSQL.

The `pegaxus-document/` directory contains EU/UK legal, customs, veterinary, and welfare documentation for international racehorse transport. To ingest it into LightRAG:

```sh
uv run python -m scripts.ingest_pegaxus
```

This requires the configured model credentials and a running Qdrant service.

## Checks and CI

```sh
cd frontend
pnpm test
pnpm build
```

Frontend tests use Node's built-in test runner to check history restoration, chat requests, API error handling, and upload validation.

GitHub Actions runs frozen-lockfile installation, tests, and builds from `frontend/` on Node.js 22 and 24. It reads the pnpm version from `frontend/package.json` and uploads `frontend/dist` as a build artifact.

## Project layout

```text
frontend/             React workspace, Tailwind utilities, pnpm lockfile
src/agents/           Request classification, SQL, retrieval, verification
src/rag/              LightRAG engine, embeddings, document processing
src/llm/              Model clients
src/db/               PostgreSQL access
src/cache/            Redis connections and semantic cache
src/memory/           Conversation memory
src/workers/          Optional BullMQ integration
src/main.py           FastAPI application and endpoints
src/static/           Legacy HTML console
data/extracted/       Warehouse records and policy chunks
pegaxus-document/     Racehorse transport reference documents
scripts/              Data import, ingestion, and preprocessing tools
docs/                 Additional setup and workspace documentation
```

## Troubleshooting

- **Chat or upload fails:** confirm the API is listening on port 8000 and inspect its logs. Check Gemini credentials, model access, and rate limits.
- **Retrieval is unavailable:** inspect `rag_initialized` in `/health` and check Qdrant connectivity and ingestion logs.
- **Warehouse results are empty:** import the warehouse data and verify `DATABASE_URL` points to the database containing those records.
- **The old console appears:** build `frontend/`, then restart the API if needed.
- **Frozen installation fails:** run pnpm 11.8.0 inside `frontend/`; the lockfile is `frontend/pnpm-lock.yaml`.
- **History is missing:** browser storage is specific to the origin. The Vite workspace and the API-served workspace have separate local histories; use JSON export to keep a copy.

Additional guides: [React workspace](docs/REACT_WORKSPACE.md), [detailed local setup](docs/HUONG_DAN_CHAY_DU_AN.md). These supporting guides currently use Vietnamese.
