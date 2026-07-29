"""
KawalKontrak.ai — FastAPI Backend Server
==========================================

Server ini adalah backend Python yang menjalankan pipeline multi-agent
analisis kontrak kerja. Ia dikonsumsi oleh Next.js frontend sebagai
sebuah microservice.

Cara menjalankan (dari root direktori proyek):
    python -m uvicorn backend_python.main:app --reload --port 8000

Endpoint utama:
    POST /analyze         → Analisis kontrak (respons tunggal, kompatibilitas)
    POST /analyze/stream  → Analisis kontrak dengan progres real-time (NDJSON)
    POST /transcribe      → Transkripsi foto kontrak via Gemini Vision (FR-01)
    GET  /health          → Cek status server (untuk monitoring & load balancer)
    GET  /                → Info API (untuk debugging)

Google ADK Endpoints (via mounted sub-app di /adk):
    POST /adk/run         → ADK non-streaming
    POST /adk/run_sse     → ADK Server-Sent Events (SSE) streaming
    GET  /adk/list-apps   → Daftar agent yang tersedia
    GET  /adk/health      → ADK health check

Keamanan:
    Jika BACKEND_SHARED_SECRET di-set, semua endpoint (kecuali /health
    dan /) mewajibkan header 'x-backend-secret' — sehingga hanya proxy
    Next.js yang memegang secret yang bisa memicu panggilan Gemini.
"""

import base64
import binascii
import json
import logging
import os
import psutil
import sys
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from backend_python import config, genai_client
from backend_python.agents.transcriber import transcribe_contract_image
from backend_python.models import (
    AnalysisResult,
    AnalyzeRequest,
    TranscribeRequest,
    TranscribeResponse,
)
from backend_python.orchestrator import (
    run_analysis_pipeline,
    run_analysis_pipeline_stream,
)

# ── Google ADK FastAPI Sub-App ────────────────────────────────────────────────
# ADK menyediakan endpoint standar /run, /run_sse, dsb. untuk agent kawal_kontrak.
# Sub-app ini di-mount ke /adk sehingga tidak konflik dengan endpoint custom.
try:
    from pathlib import Path as _Path
    from google.adk.cli.fast_api import get_fast_api_app as _get_adk_app

    _agents_dir = str(_Path(__file__).parent / "agents")
    _adk_app = _get_adk_app(
        agents_dir=_agents_dir,
        web=False,
        allow_origins=None,
        use_local_storage=True,
    )
    _ADK_AVAILABLE = True
except Exception as _adk_err:
    _ADK_AVAILABLE = False
    _adk_app = None
    logging.getLogger(__name__).warning(
        f"Google ADK sub-app tidak bisa dimuat: {_adk_err}. "
        "Endpoint /adk/* tidak tersedia."
    )



# ── Konfigurasi Logging ───────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Validasi Konfigurasi ─────────────────────────────────────────────────────

_problems = config.validate_config()
if _problems:
    for p in _problems:
        logger.error(p)
    sys.exit(1)

_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
_MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB


# ── Lifespan (startup & shutdown hooks) ──────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Dijalankan satu kali saat server startup dan shutdown."""
    logger.info("=" * 60)
    logger.info("KawalKontrak.ai Python Backend — Starting up")
    logger.info(f"  Corpus mode : {config.corpus_mode()}")
    logger.info(f"  Model core  : {config.MODEL_CORE}")
    logger.info(f"  Model lite  : {config.MODEL_LITE}")
    logger.info(f"  Auth        : {'shared-secret AKTIF' if config.SHARED_SECRET else 'TERBUKA (dev only)'}")
    logger.info("=" * 60)
    yield  # Server berjalan di sini
    logger.info("KawalKontrak.ai Python Backend — Shutting down")



# ── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="KawalKontrak.ai — AI Backend",
    description=(
        "Backend Python multi-agent untuk analisis kontrak kerja Indonesia. "
        "Menggunakan Google Gemini API dengan Managed RAG (File Search Store)."
    ),
    version="3.0.0",
    lifespan=lifespan,
    docs_url=None if config.IS_PRODUCTION else "/docs",
    redoc_url=None if config.IS_PRODUCTION else "/redoc",
    openapi_url=None if config.IS_PRODUCTION else "/openapi.json",
)

cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# Mount ADK sub-app ke /adk jika berhasil dimuat
if _ADK_AVAILABLE and _adk_app is not None:
    app.mount("/adk", _adk_app)
    logger.info("Google ADK sub-app berhasil di-mount di /adk")


# ── Middleware: Shared Secret (proteksi endpoint AI) ─────────────────────────

@app.middleware("http")
async def shared_secret_middleware(request: Request, call_next):
    """
    Menolak request tanpa header 'x-backend-secret' yang benar,
    kecuali untuk endpoint publik (/health, /) atau jika secret tidak
    dikonfigurasi (mode development).
    """
    public_paths = {"/", "/health"}
    if not config.IS_PRODUCTION:
        public_paths.update({"/docs", "/openapi.json", "/redoc"})
    if config.SHARED_SECRET and request.url.path not in public_paths:
        provided = request.headers.get("x-backend-secret", "")
        if provided != config.SHARED_SECRET:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Header x-backend-secret tidak valid.",
                    }
                },
            )
    return await call_next(request)


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
        "version": "3.0.0",
        "status": "online",
        "corpus_mode": config.corpus_mode(),
        "adk_enabled": _ADK_AVAILABLE,
        "adk_endpoint": "/adk" if _ADK_AVAILABLE else None,
        "pipeline": [
            f"0. Transcriber — foto/scan ({config.MODEL_CORE}, vision)",
            f"1. Extractor ({config.MODEL_LITE})",
            f"2. Legal Matcher ({config.MODEL_CORE} + File Search)",
            f"3. Risk Grader ({config.MODEL_CORE})",
            f"4. Verifier ({config.MODEL_CORE} + File Search) ∥ 5. Negotiator ({config.MODEL_LITE})",
        ],
    }


@app.get("/health", tags=["Monitoring"])
async def health_check() -> dict[str, str]:
    """
    Health check endpoint untuk load balancer dan monitoring.
    Selama server berjalan, ini akan selalu mengembalikan status 'healthy'.
    """
    process = psutil.Process(os.getpid())
    mem_info = process.memory_info()
    return {
        "status": "healthy",
        "memory_mb": str(round(mem_info.rss / 1024 / 1024, 2)),
        "model_core": config.MODEL_CORE,
        "model_lite": config.MODEL_LITE
    }


@app.post(
    "/analyze",
    response_model=AnalysisResult,
    tags=["Analysis"],
    summary="Analisis Kontrak Kerja (respons tunggal)",
    description=(
        "Menerima teks kontrak kerja dan menjalankan pipeline multi-agent. "
        "Untuk progres real-time gunakan POST /analyze/stream."
    ),
)
async def analyze_contract(request: AnalyzeRequest) -> AnalysisResult:
    """Endpoint kompatibilitas: menunggu pipeline selesai, lalu kirim hasil."""
    logger.info(
        f"POST /analyze — kontrak {len(request.contractText)} karakter, "
        f"region='{request.region}', locale='{request.locale}'"
    )

    result = await run_analysis_pipeline(
        contract_text=request.contractText,
        locale=request.locale,
    )

    if result.status == "failed":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "PIPELINE_FAILED",
                "message": "Pipeline analisis gagal. Silakan coba lagi.",
            },
        )

    return result


@app.post(
    "/analyze/stream",
    tags=["Analysis"],
    summary="Analisis Kontrak Kerja dengan progres real-time (NDJSON)",
    description=(
        "Memancarkan satu objek JSON per baris (NDJSON): event "
        '{"type":"stage",...} untuk tiap tahap pipeline, ditutup '
        '{"type":"result","data":{...}} berisi hasil akhir. '
        "Memenuhi PRD FR-06 — transparansi proses AI."
    ),
)
async def analyze_contract_stream(request: AnalyzeRequest) -> StreamingResponse:
    """Endpoint streaming: progres tiap agent dikirim saat terjadi."""
    logger.info(
        f"POST /analyze/stream — kontrak {len(request.contractText)} karakter, "
        f"locale='{request.locale}'"
    )

    async def event_generator():
        async for event in run_analysis_pipeline_stream(
            contract_text=request.contractText,
            locale=request.locale,
        ):
            yield json.dumps(event, ensure_ascii=False) + "\n"

    return StreamingResponse(
        event_generator(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Matikan buffering reverse-proxy
        },
    )


@app.post(
    "/transcribe",
    response_model=TranscribeResponse,
    tags=["Analysis"],
    summary="Transkripsi Foto Kontrak (Gemini Vision)",
    description=(
        "Menerima foto/scan kontrak (base64) dan mengembalikan teks "
        "verbatim hasil transkripsi vision. Memenuhi PRD FR-01."
    ),
)
async def transcribe_image(request: TranscribeRequest) -> TranscribeResponse:
    """Transkripsi foto kontrak → teks yang bisa dianalisis pipeline."""
    if request.mimeType not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "UNSUPPORTED_IMAGE",
                "message": "Format gambar harus JPEG, PNG, atau WebP.",
            },
        )

    try:
        image_bytes = base64.b64decode(request.imageBase64, validate=True)
    except (binascii.Error, ValueError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "INVALID_BASE64", "message": "Encoding base64 tidak valid."},
        )

    if len(image_bytes) > _MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={"code": "IMAGE_TOO_LARGE", "message": "Ukuran gambar melebihi 10 MB."},
        )

    client = genai_client.get_client()
    text, warning = await transcribe_contract_image(
        image_bytes, request.mimeType, client, request.locale
    )

    if len(text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "TRANSCRIPTION_FAILED",
                "message": (
                    "Teks kontrak tidak dapat dibaca dari foto. "
                    "Coba foto ulang dengan pencahayaan lebih baik dan pastikan "
                    "seluruh halaman terlihat."
                    if request.locale == "id"
                    else "Could not read contract text from the photo. Retake the "
                    "photo with better lighting and make sure the whole page is visible."
                ),
            },
        )

    return TranscribeResponse(text=text, warning=warning)
