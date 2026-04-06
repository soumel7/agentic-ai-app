Plan for agentic-ai-app — RAG, Ollama, REST APIs (Free)

Summary
- Goal: Turn the existing Create React App into a small fullstack project that demonstrates agentic loops, retrieval-augmented generation (RAG), and local LLMs (Ollama), using only free/open tools and local components.

Prerequisites (local, free)
- Node.js & npm (frontend)
- Python 3.10+ (backend tooling)
- Ollama installed locally (https://ollama.com) — free local models
- Git (optional)

High-level tech choices (all free / local-capable)
- Frontend: existing React app (in `src/`) — add UI to call REST APIs and show agent loop
- Backend: FastAPI (Python) exposing REST endpoints for: ingestion, search, and agent-run
- Embeddings: `sentence-transformers` (local) to compute embeddings
- Vector DB: `chromadb` (local) or `faiss` via `chromadb` for portability
- LLM: Ollama (local models via HTTP API at `http://localhost:11434`)
- RAG: combine vector search (Chroma) + context + Ollama generate
- Scripts: Python scripts to ingest docs, compute embeddings, store to vector DB

Step-by-step Plan (actions you can follow)
1) Audit repo & baseline (0.5–1h)
- Inspect current files: `src/components/AgentChat.js`, `src/utils/tools.js` and `public/` content.
- Decide where to place backend: new folder `backend/` at repo root.
- Outcome: a short list of gaps to implement.

2) Define goals & minimal MVP (0.5h)
- MVP: single-page agent chat that can answer questions using local docs via RAG and Ollama.
- Define API surface: `/ingest`, `/search`, `/agent`.

3) Scaffold backend REST API (1h)
- Create `backend/` with FastAPI app `app.py`.
- Install: `pip install fastapi uvicorn chromadb sentence-transformers python-dotenv requests`.
- Run dev: `uvicorn app:app --reload --host 0.0.0.0 --port 8000`.

4) Add ingestion & embedding script (1–2h)
- Script `backend/ingest.py`: read local docs (e.g., `docs/` or `public/`), split text, compute embeddings with `sentence-transformers`, upsert into Chroma collection.
- Add simple CLI: `python ingest.py --source ./public/docs --collection default`.

5) Add vector DB and search endpoints (1h)
- Endpoint `/search` accepts `q` and returns top-k docs with metadata and scores.
- Use chromadb client in-memory or persisted on disk (persist directory under `backend/.chroma`).

6) Integrate Ollama for generation (1h)
- Interact via HTTP: POST to `http://localhost:11434/api/generate` with `model` and `prompt` (Ollama docs for payload).
- Create `backend/ollama.py` helper to call Ollama and stream generation if desired.

7) Build RAG agent endpoint (1–2h)
- Endpoint `/agent` accepts `question`, runs `/search`, formats a prompt with retrieved contexts and system instructions, then calls Ollama to generate an answer.
- Keep prompt template small; include citations or source ids.

8) Connect frontend to backend (1–2h)
- Update `src/utils/tools.js` to call new REST endpoints instead of local-only tools when needed.
- Add UI in `AgentChat.js` to call `/agent` and show sources and LLM output.

9) Implement agentic loop & tooling (2–4h)
- Implement tool definitions (search, call-api, calculator) on backend or as thin endpoints and expose them via the frontend agent UI.
- Support a loop: assistant suggests tool_use → frontend calls backend tool → append results → repeat until final.

10) Examples, docs & runbook (0.5–1h)
- Add `README.md` run instructions for installing Ollama, creating a Python venv, installing deps, and running ingest + backend + frontend.
- Provide example commands to download a free Ollama model.

11) Security, privacy, and cleanup (0.5–1h)
- Keep no secrets in the repo; add `.env` handling for any keys (though primary tools are local)
- Add rate-limiting, input size guards, and safe default system prompts.

Developer notes & pointers
- Ollama: prefer local deployment for free usage. Use its local HTTP API for generation and streaming.
- Embeddings: `sentence-transformers/all-MiniLM-L6-v2` is compact and free to download.
- Vector DB: `chromadb` is quick to integrate; set `persist_directory` for durability.
- Avoid external paid APIs: do not add OpenAI or paid YouTube APIs unless you want optional integrations.

Minimal commands (copyable)
- Create backend venv & install:

```
python -m venv .venv
.venv\Scripts\activate.pspip install --upgrade pip
pip install fastapi uvicorn chromadb sentence-transformers python-dotenv requests
```

- Run backend dev server:

```
cd backend
uvicorn app:app --reload --port 8000
```

- Run frontend dev:

```
npm install
npm start
```

Where to start now (recommended next steps)
- Step A: Run an audit (step 1) and tell me the gaps you want prioritized.
- Step B: I can scaffold `backend/` with FastAPI endpoints and a sample ingest script next. Say "scaffold backend" to proceed and I'll implement it.

File created: Plan.md
