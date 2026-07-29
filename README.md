# KawalKontrak.ai 🛡️

**KawalKontrak.ai** is an AI-powered platform that analyzes employment contracts for Indonesian workers. It detects "red flags" (harmful clauses) in employment contracts (PKWT, PKWTT) by cross-referencing them against Indonesian Labor Law (UU No. 6/2023, PP No. 35/2021, PP No. 36/2021) using a **multi-agent pipeline** with **managed RAG (Gemini File Search)**.



## 🚀 Features

- **Multi-Agent AI Pipeline** — 5 specialized agents (Extractor → Legal Matcher → Risk Grader → Verifier ∥ Negotiator) running async on the Gemini API.
- **Managed RAG (File Search Store)** — legal citations are retrieved from an indexed corpus of official regulations; the store is persistent (no 48-hour File API expiry).
- **Photo/Scan Input (Vision)** — snap a photo of a paper contract; Gemini Vision transcribes it verbatim, and the user reviews the text before analysis (PRD FR-01 + FR-10).
- **Real-time Pipeline Progress** — the UI streams actual per-agent progress over NDJSON, not a fake loading animation (FR-06).
- **Anti-Hallucination Guardrails** — a Verifier agent audits every citation against the corpus; clauses with no definitive reference are surfaced in a dedicated **"Needs Review"** tab instead of being silently dropped (FR-05).
- **Progressive Disclosure** — the single most critical finding is highlighted first, with the full list below (FR-11).
- **In-situ Contract Highlighting** — the original contract text is displayed with problematic clauses marked in red and safe clauses in green.
- **Demo Mode** — one-click sample contracts (problematic & fair) for instant trial (FR-14).
- **UMK Validation (deterministic)** — detected salaries are checked against a 2025 regional minimum-wage database with context-aware salary extraction; this check never depends on the AI.
- **Result Caching** — identical contracts (SHA-256 + locale) return instantly without re-billing the API.
- **Cost & Abuse Protection** — per-IP rate limiting on all AI endpoints and a shared-secret handshake between the Next.js proxy and the Python backend.
- **Bilingual AI Output** — the analysis itself (not just the UI) follows the selected language (ID/EN).
- **Optional Cloud History** — Google Sign-In stores analysis results (never the raw contract text) in a per-user Firestore subcollection, protected by committed security rules.
- **PDF Export** — clean print-optimized report via the browser's native `window.print()`.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, CSS Modules |
| API Proxy | Next.js Route Handlers (streaming NDJSON pass-through + rate limit + UMK post-check) |
| AI Backend | Python 3.11–3.13, FastAPI, async `google-genai` SDK |
| Models | `gemini-2.5-flash` (matcher/grader/verifier/vision) + `gemini-2.5-flash-lite` (extractor/negotiator) — per TRD §3 |
| RAG | Gemini **File Search Store** (managed, persistent) with `file_data` attachment fallback |
| Auth & DB | Firebase Authentication + Cloud Firestore (optional, guarded init) |
| PDF Input | PDF.js (worker bundled locally — no CDN) |
| Testing | pytest (unit + live golden-set eval), GitHub Actions CI |
| Deployment | Dockerfiles + docker-compose; Cloud Run-ready |

## 🧠 Architecture

```
Browser ──POST /api/analyze──▶ Next.js proxy ──POST /analyze/stream──▶ FastAPI
   ▲   ◀── NDJSON stream ─────  (rate limit,   (shared secret)          │
   │        stage events         UMK check)                             ▼
   │                                                    ┌────────────────────────┐
   │                                                    │ 0. Cache (SHA-256)     │
   │                                                    │ 1. Extractor (lite)    │
   │                                                    │ 2. Legal Matcher ─ RAG │──▶ File Search Store
   │                                                    │ 3. Risk Grader         │    (UU 6/2023, PP 35 &
   │                                                    │ 4. Verifier ─ RAG   ∥  │     PP 36/2021)
   │                                                    │ 5. Negotiator (lite)   │
   │                                                    └────────────────────────┘
   └── photo → /api/transcribe → /transcribe (Gemini Vision, verbatim OCR)
```

If the Python backend is unreachable, the proxy falls back to a local
pattern-matching engine (20+ rules) — the UI always shows honest results and
labels the engine used with a visible badge.

## 📦 Installation & Setup

### 1. Frontend (Next.js)

```bash
npm install
cp .env.example .env.local        # isi PYTHON_BACKEND_URL, BACKEND_SHARED_SECRET, (opsional) Firebase
```

### 2. Backend (Python 3.11–3.13)

```bash
pip install -r backend_python/requirements.txt
cp backend_python/.env.example backend_python/.env   # isi GEMINI_API_KEY, dst.
```

### 3. Upload the legal corpus (one-time)

```bash
# Recommended: persistent File Search Store (managed RAG)
python scripts/upload_corpus.py path/to/UU_Ketenagakerjaan.pdf
# → copy the printed GEMINI_FILE_SEARCH_STORE value into backend_python/.env

# Dev-only fallback (⚠️ expires after 48 hours):
python scripts/upload_corpus.py path/to/UU_Ketenagakerjaan.pdf --mode file
```

### 4. Run both servers

```bash
npm run dev          # menjalankan Next.js (3000) + FastAPI (8000) bersamaan
```

Or individually: `npm run dev:next` / `npm run dev:python`.
Or with Docker: `docker compose up --build`.

Open [http://localhost:3000](http://localhost:3000).

### 5. (Optional) Firebase

Fill the `NEXT_PUBLIC_FIREBASE_*` values in `.env.local` and deploy the
security rules: `firebase deploy --only firestore:rules`. Without Firebase
config the app runs fully — the login feature simply hides itself.

## 🧪 Testing

```bash
pip install -r backend_python/requirements-dev.txt
pytest backend_python/tests -v        # unit tests (no API key needed)
pytest backend_python/tests/test_golden_set.py -v   # live golden-set eval (needs API key + corpus)
python scripts/test_pipeline.py       # live end-to-end debug run
```

CI (GitHub Actions) runs frontend lint + build and backend unit tests on every push.

## 📚 Legal Corpus & UMK Data

- Corpus: **UU No. 6/2023 (Cipta Kerja)**, **PP No. 35/2021**, **PP No. 36/2021** — indexed into a Gemini File Search Store. For official texts see [JDIH Setkab](https://jdih.setkab.go.id/) / [JDIH Kemenaker](https://jdih.kemenaker.go.id/). Review every 6 months or when regulations change.
- UMK database (`src/lib/umk-database.ts`): 13 major regions, **2025 values** (Permenaker 16/2024, +6.5%). ⚠️ Verify each value against the official Kepgub before production releases and update annually.

## ⚠️ Architecture Decisions & Known Deviations from the TRD

- **Google ADK is not used** — orchestration is hand-rolled async Python. This was a deliberate trade-off for simplicity; the per-agent NDJSON trace provides the equivalent demo/debug visibility that `adk web` would.
- Model tiering follows TRD §3 (`flash-lite` for light tasks, `flash` for reasoning) and is overridable via `KK_MODEL_LITE` / `KK_MODEL_CORE` env vars.

## 🤝 Disclaimer

**KawalKontrak.ai** is strictly an educational tool and does not constitute legally binding advice. For severe or highly specific legal disputes, consult a professional lawyer or the Legal Aid Institute (LBH Indonesia, 021-315-1405).

## 📄 License

This project is open-source and created to protect the rights of Indonesian workers.
