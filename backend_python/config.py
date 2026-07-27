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

# ── Kredensial & Corpus ───────────────────────────────────────────────────────

GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
FILE_SEARCH_STORE: str | None = os.getenv("GEMINI_FILE_SEARCH_STORE") or None
CORPUS_FILE_URI: str | None = os.getenv("GEMINI_CORPUS_FILE_URI") or None
SHARED_SECRET: str | None = os.getenv("BACKEND_SHARED_SECRET") or None

# ── Pemilihan Model (sesuai TRD §3: model termurah sebagai default) ──────────

MODEL_LITE: str = os.getenv("KK_MODEL_LITE", "gemini-2.5-flash")
MODEL_CORE: str = os.getenv("KK_MODEL_CORE", "gemini-2.5-flash")


def file_search_supported() -> bool:
    """True jika versi SDK google-genai mendukung File Search tool."""
    return hasattr(types, "FileSearch")


def corpus_mode() -> str:
    """
    Menentukan mode akses corpus regulasi:
      'file_search' — File Search Store persisten (managed RAG, direkomendasikan)
      'file_data'   — melampirkan PDF via File API (kedaluwarsa 48 jam)
      'none'        — tidak ada corpus terkonfigurasi
    """
    if FILE_SEARCH_STORE and file_search_supported():
        return "file_search"
    if CORPUS_FILE_URI:
        return "file_data"
    return "none"


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
    if not GEMINI_API_KEY:
        problems.append("GEMINI_API_KEY tidak ditemukan di environment.")

    mode = corpus_mode()
    if mode == "none":
        problems.append(
            "Tidak ada corpus terkonfigurasi. Set GEMINI_FILE_SEARCH_STORE "
            "(jalankan scripts/upload_corpus.py) atau GEMINI_CORPUS_FILE_URI."
        )
    elif mode == "file_data":
        logger.warning(
            "Corpus memakai File API URI — file kedaluwarsa 48 jam setelah "
            "upload. Untuk produksi, migrasikan ke File Search Store "
            "(scripts/upload_corpus.py)."
        )
    if FILE_SEARCH_STORE and not file_search_supported():
        logger.warning(
            "GEMINI_FILE_SEARCH_STORE di-set tetapi versi SDK google-genai "
            "tidak mendukung File Search — fallback ke GEMINI_CORPUS_FILE_URI. "
            "Upgrade: pip install -U google-genai"
        )
    if not SHARED_SECRET:
        logger.warning(
            "BACKEND_SHARED_SECRET tidak di-set — endpoint backend dapat "
            "dipanggil siapa pun yang menjangkau port ini. Set secret yang "
            "sama di backend_python/.env dan .env.local (Next.js) untuk produksi."
        )
    return problems
