# python
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, requests, uuid
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss

# Config
OLLAMA_URL = os.getenv("MODEL_SERVER_URL", "http://localhost:11434/api/generate")
EMBED_MODEL = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")

app = Flask(__name__)
CORS(app)

# Embedding + FAISS store
embedder = SentenceTransformer(EMBED_MODEL)
DIM = embedder.get_sentence_embedding_dimension()
_index = None
_meta = []

def ensure_index():
    global _index
    if _index is None:
        _index = faiss.IndexFlatIP(DIM)

@app.route("/api/llm", methods=["POST"])
def llm_proxy():
    data = request.get_json() or {}
    prompt = data.get("prompt") or ""
    model = data.get("model")
    max_tokens = data.get("max_tokens", 512)
    payload = {"prompt": prompt, "max_tokens": max_tokens}
    if model:
        payload["model"] = model
    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=60)
        r.raise_for_status()
        try:
            return jsonify(r.json())
        except Exception:
            return jsonify({"text": r.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/embed", methods=["POST"])
def embed_text():
    data = request.get_json() or {}
    texts = data.get("texts") or []
    if not isinstance(texts, list):
        return jsonify({"error": "texts must be a list"}), 400
    vecs = embedder.encode(texts, show_progress_bar=False)
    return jsonify({"vectors": [v.tolist() for v in vecs]})

@app.route("/api/index", methods=["POST"])
def index_documents():
    global _meta, _index
    data = request.get_json() or {}
    docs = data.get("docs") or []
    if not isinstance(docs, list) or len(docs) == 0:
        return jsonify({"error": "docs must be a non-empty list"}), 400
    texts, metas = [], []
    for d in docs:
        text = d.get("text")
        if not text:
            continue
        doc_id = d.get("id") or str(uuid.uuid4())
        texts.append(text)
        metas.append({"id": doc_id, "text": text, "meta": d.get("meta", {})})
    if not texts:
        return jsonify({"indexed": 0})
    vecs = embedder.encode(texts, show_progress_bar=False).astype("float32")
    faiss.normalize_L2(vecs)
    ensure_index()
    _index.add(vecs)
    _meta.extend(metas)
    return jsonify({"indexed": len(texts)})

@app.route("/api/retrieve", methods=["POST"])
def retrieve():
    data = request.get_json() or {}
    query = data.get("query", "")
    k = int(data.get("k", 4))
    if _index is None or _index.ntotal == 0:
        return jsonify({"hits": []})
    qvec = embedder.encode([query]).astype("float32")
    faiss.normalize_L2(qvec)
    D, I = _index.search(qvec, k)
    hits = []
    for score, idx in zip(D[0], I[0]):
        if idx < 0 or idx >= len(_meta):
            continue
        m = _meta[int(idx)]
        hits.append({"id": m["id"], "text": m["text"], "meta": m["meta"], "score": float(score)})
    return jsonify({"hits": hits})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=True)