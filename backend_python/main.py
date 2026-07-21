"""
KawalKontrak.ai — FastAPI Backend Server
==========================================

Server ini adalah backend Python yang menjalankan pipeline multi-agent
analisis kontrak kerja. Ia dikonsumsi oleh Next.js frontend sebagai
sebuah microservice.

Cara menjalankan (dari root direktori proyek):
    python -m uvicorn backend_python.main:app --reload --port 8000

Endpoint utama:
    POST /analyze   → Analisis kontrak kerja dengan multi-agent pipeline
    GET  /health    → Cek status server (untuk monitoring & load balancer)
    GET  /          → Info API (untuk debugging)
"""

import logging
import os
import sys
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend_python.models import AnalyzeRequest, AnalysisResult
from backend_python.orchestrator import run_analysis_pipeline

# ── Konfigurasi Logging ───────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Load Environment Variables ────────────────────────────────────────────────

# Cari file .env di direktori backend_python/
_env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=_env_path)

_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
_CORPUS_FILE_URI = os.getenv("GEMINI_CORPUS_FILE_URI")

if not _GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY tidak ditemukan di environment variable!")
    sys.exit(1)

if not _CORPUS_FILE_URI:
    logger.error("GEMINI_CORPUS_FILE_URI tidak ditemukan di environment variable!")
    sys.exit(1)


# ── Lifespan (startup & shutdown hooks) ──────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Dijalankan satu kali saat server startup dan shutdown."""
    logger.info("=" * 60)
    logger.info("KawalKontrak.ai Python Backend — Starting up")
    logger.info(f"  Corpus URI : {_CORPUS_FILE_URI[:60]}...")
    logger.info(f"  API Key    : {'*' * 8}{_GEMINI_API_KEY[-4:]}")  # type: ignore
    logger.info("=" * 60)
    yield  # Server berjalan di sini
    logger.info("KawalKontrak.ai Python Backend — Shutting down")


# ── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="KawalKontrak.ai — AI Backend",
    description=(
        "Backend Python multi-agent untuk analisis kontrak kerja Indonesia. "
        "Menggunakan Google Gemini API dengan Managed RAG (File Search)."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# Izinkan request dari server Next.js (localhost:3000) saat development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ── Exception Handler Global ──────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Menangkap semua exception yang tidak tertangkap dan mengembalikan JSON."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Terjadi kesalahan internal pada server AI.",
            }
        },
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Info"])
async def root() -> dict[str, Any]:
    """Informasi dasar API (untuk verifikasi deployment)."""
    return {
        "service": "KawalKontrak.ai Python AI Backend",
        "version": "2.0.0",
        "status": "online",
        "pipeline": [
            "1. Extractor (gemini-2.5-flash)",
            "2. Legal Matcher (gemini-2.5-flash + File Search)",
            "3. Risk Grader (gemini-2.5-flash)",
            "4. Verifier (gemini-2.5-flash)",
            "5. Negotiator (gemini-2.5-flash)",
        ],
    }


@app.get("/health", tags=["Monitoring"])
async def health_check() -> dict[str, str]:
    """
    Health check endpoint untuk load balancer dan monitoring.
    Selama server berjalan, ini akan selalu mengembalikan status 'healthy'.
    """
    return {"status": "healthy"}


@app.post(
    "/analyze",
    response_model=AnalysisResult,
    tags=["Analysis"],
    summary="Analisis Kontrak Kerja",
    description=(
        "Menerima teks kontrak kerja dan menjalankan pipeline 5-agent "
        "untuk mendeteksi red flags, mencocokkan regulasi, dan menghasilkan "
        "template negosiasi."
    ),
)
async def analyze_contract(request: AnalyzeRequest) -> AnalysisResult:
    """
    Endpoint utama: menerima teks kontrak dan mengembalikan hasil analisis.

    Body (JSON):
        contractText  (str, wajib) : Teks lengkap kontrak kerja.
        region        (str, opsional): Wilayah kerja untuk validasi UMK.
        locale        (str, opsional): 'id' (default) atau 'en'.

    Returns:
        AnalysisResult dengan red_flags, klausul_aman, ringkasan, dll.
    """
    logger.info(
        f"POST /analyze — kontrak {len(request.contractText)} karakter, "
        f"region='{request.region}', locale='{request.locale}'"
    )

    # Jalankan pipeline multi-agent
    result = run_analysis_pipeline(
        contract_text=request.contractText,
        api_key=_GEMINI_API_KEY,          # type: ignore[arg-type]
        corpus_file_uri=_CORPUS_FILE_URI,  # type: ignore[arg-type]
        locale=request.locale,
    )

    # Kembalikan HTTP 500 jika pipeline gagal total
    if result.status == "failed":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "PIPELINE_FAILED",
                "message": "Pipeline analisis gagal. Silakan coba lagi.",
            },
        )

    return result
