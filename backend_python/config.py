"""
KawalKontrak.ai — Konfigurasi Terpusat Backend
================================================

Semua environment variable dan pemilihan model dibaca di satu tempat
agar mudah diaudit dan diubah tanpa menyentuh logika agen.

Variabel yang dikenali:
    GEMINI_API_KEY            (wajib)  API key Google Gemini.
    GEMINI_FILE_SEARCH_STORE  (rekomendasi) Nama File Search Store persisten,
                              contoh: 'fileSearchStores/xxxx'. Dibuat oleh
                              scripts/upload_corpus.py. Tidak kedaluwarsa.
    GEMINI_CORPUS_FILE_URI    (fallback) URI file PDF di Gemini File API.
                              PERINGATAN: file di File API kedaluwarsa 48 jam
                              setelah upload — hanya untuk development singkat.
    BACKEND_SHARED_SECRET     (rekomendasi) Secret bersama antara proxy
                              Next.js dan backend ini. Jika di-set, semua
                              request (kecuali /health) wajib membawa header
                              'x-backend-secret' dengan nilai yang sama.
    KK_MODEL_LITE             Model untuk tugas ringan (default:
                              gemini-2.5-flash-lite) — Extractor, Negotiator.
    KK_MODEL_CORE             Model untuk reasoning (default: gemini-2.5-flash)
                              — Legal Matcher, Risk Grader, Verifier.
"""

import logging
import os

from dotenv import load_dotenv
from google.genai import types

logger = logging.getLogger(__name__)

# Muat .env dari direktori backend_python/
_env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=_env_path)

# ── Vertex AI ─────────────────────────────────────────────────────────────────

USE_VERTEXAI: bool = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "false").lower() == "true"
GCP_PROJECT: str | None = os.getenv("GOOGLE_CLOUD_PROJECT")
GCP_LOCATION: str | None = os.getenv("GOOGLE_CLOUD_LOCATION", "asia-southeast1")
VERTEX_RAG_CORPUS: str | None = os.getenv("VERTEX_RAG_CORPUS")

# ── Kredensial & Corpus ───────────────────────────────────────────────────────

GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
FILE_SEARCH_STORE: str | None = os.getenv("GEMINI_FILE_SEARCH_STORE") or None
CORPUS_FILE_URI: str | None = os.getenv("GEMINI_CORPUS_FILE_URI") or None
SHARED_SECRET: str | None = os.getenv("BACKEND_SHARED_SECRET") or None

# ── Pemilihan Model (sesuai TRD §3: model termurah sebagai default) ──────────

MODEL_LITE = os.getenv("KK_MODEL_LITE", "gemini-2.5-flash")
MODEL_CORE: str = os.getenv("KK_MODEL_CORE", "gemini-2.5-flash")


def file_search_supported() -> bool:
    """True jika versi SDK google-genai mendukung File Search tool."""
    return hasattr(types, "FileSearch")


def corpus_mode() -> str:
    """
    Menentukan mode akses corpus regulasi:
      'vertex_rag'  — Vertex AI RAG Engine (direkomendasikan untuk Cloud Run)
      'file_search' — File Search Store persisten (Gemini Developer API)
      'file_data'   — melampirkan PDF via File API (kedaluwarsa 48 jam)
      'none'        — tidak ada corpus terkonfigurasi
    """
    if USE_VERTEXAI and VERTEX_RAG_CORPUS:
        return "vertex_rag"
    if FILE_SEARCH_STORE and file_search_supported():
        return "file_search"
    if CORPUS_FILE_URI:
        return "file_data"
    return "none"

def corpus_tools_vertex() -> list[types.Tool] | None:
    """Tool Vertex RAG untuk GenerateContentConfig (mode vertex_rag saja)."""
    if corpus_mode() != "vertex_rag":
        return None
    return [
        types.Tool(
            retrieval=types.Retrieval(
                vertex_rag_store=types.VertexRagStore(
                    rag_resources=[
                        types.VertexRagStoreRagResource(rag_corpus=VERTEX_RAG_CORPUS)
                    ],
                    rag_retrieval_config=types.RagRetrievalConfig(top_k=8),
                )
            )
        )
    ]


def corpus_tools() -> list[types.Tool] | None:
    """Tool File Search untuk GenerateContentConfig (mode file_search saja)."""
    if corpus_mode() != "file_search":
        return None
    return [
        types.Tool(
            file_search=types.FileSearch(
                file_search_store_names=[FILE_SEARCH_STORE],  # type: ignore[list-item]
            )
        )
    ]


def corpus_parts() -> list[types.Part]:
    """Part file PDF untuk dilampirkan ke prompt (mode file_data saja)."""
    if corpus_mode() != "file_data":
        return []
    return [
        types.Part(
            file_data=types.FileData(
                file_uri=CORPUS_FILE_URI,
                mime_type="application/pdf",
            )
        )
    ]


def validate_config() -> list[str]:
    """
    Memvalidasi konfigurasi saat startup.
    Mengembalikan daftar pesan masalah fatal (kosong = OK).
    """
    problems: list[str] = []
    if not GEMINI_API_KEY and not USE_VERTEXAI:
        problems.append("GEMINI_API_KEY tidak ditemukan (dibutuhkan jika tidak memakai Vertex AI).")
    if USE_VERTEXAI and not GCP_PROJECT:
        problems.append("GOOGLE_CLOUD_PROJECT wajib di-set jika GOOGLE_GENAI_USE_VERTEXAI=true.")

    mode = corpus_mode()
    if mode == "none":
        problems.append(
            "Tidak ada corpus terkonfigurasi. Set VERTEX_RAG_CORPUS (Vertex AI), "
            "GEMINI_FILE_SEARCH_STORE, atau GEMINI_CORPUS_FILE_URI."
        )
    elif mode == "file_data":
        logger.warning(
            "Corpus memakai File API URI — file kedaluwarsa 48 jam setelah "
            "upload. Untuk produksi, migrasikan ke Vertex RAG atau File Search Store."
        )
    if FILE_SEARCH_STORE and not file_search_supported() and not USE_VERTEXAI:
        logger.warning(
            "GEMINI_FILE_SEARCH_STORE di-set tetapi versi SDK google-genai "
            "tidak mendukung File Search — fallback ke GEMINI_CORPUS_FILE_URI. "
            "Upgrade: pip install -U google-genai"
        )

    is_production = os.getenv("K_SERVICE") is not None or os.getenv("ENV") == "production"
    if not SHARED_SECRET:
        msg = "BACKEND_SHARED_SECRET tidak di-set — endpoint backend terbuka tanpa otentikasi."
        if is_production:
            problems.append(f"{msg} Wajib di-set untuk production.")
        else:
            logger.warning(f"{msg} Set secret untuk production.")
    return problems
