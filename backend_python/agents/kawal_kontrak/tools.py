"""
KawalKontrak.ai — ADK Pipeline Tools
======================================

Modul ini membungkus setiap agen dalam pipeline KawalKontrak
sebagai "tool" yang dapat dipanggil oleh Google ADK Agent.

Setiap tool menerima input berbasis state session (dict) dan
mengembalikan hasil parsial ke agent orchestrator.

Alur pipeline (berurutan):
  1. tool_extract_clauses     → list[ExtractedClause]
  2. tool_match_laws          → list[MatchedClause]
  3. tool_grade_risks         → RiskGraderOutput
  4. tool_verify_and_negotiate → AnalysisResult (final)
"""

import asyncio
import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Any

from google import genai
from google.adk.tools import FunctionTool

from backend_python import cache
from backend_python.agents.extractor import MAX_CONTRACT_CHARS, extract_clauses
from backend_python.agents.legal_matcher import match_laws
from backend_python.agents.negotiator import generate_negotiations
from backend_python.agents.risk_grader import grade_risks
from backend_python.agents.verifier import verify_red_flags
from backend_python.config import GEMINI_API_KEY, MODEL_CORE, MODEL_LITE, corpus_mode
from backend_python.models import (
    AnalysisMetadata,
    AnalysisResult,
    ContractSummary,
    LegalStatus,
    RedFlag,
    ReviewClause,
    RiskLevel,
)

logger = logging.getLogger(__name__)

# ── Konstanta Disclaimer ──────────────────────────────────────────────────────

_DISCLAIMER_ID = (
    "Analisis ini dihasilkan oleh Kecerdasan Buatan (AI) untuk tujuan literasi "
    "dan edukasi hukum, BUKAN nasihat hukum yang mengikat. Untuk sengketa serius, "
    "hubungi LBH Indonesia ((021) 3929840), konsultan hukum profesional, atau "
    "serikat pekerja di organisasi Anda."
)
_DISCLAIMER_EN = (
    "This analysis is AI-generated for educational and legal literacy purposes, "
    "NOT binding legal advice. For serious disputes, contact LBH Indonesia "
    "((021) 3929840), a professional legal consultant, or the labor union in your organization."
)
_REVIEW_REASON_ID = (
    "Tidak ditemukan referensi pasti dalam korpus regulasi ketenagakerjaan. "
    "Klausul ini sebaiknya ditinjau oleh manusia (LBH/serikat pekerja/konsultan hukum)."
)
_REVIEW_REASON_EN = (
    "No definitive reference was found in the labor-regulation corpus. "
    "This clause should be reviewed by a human (legal aid/union/legal counsel)."
)


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _build_fallback_result(contract_text: str, locale: str) -> dict[str, Any]:
    """Fallback result jika pipeline gagal total."""
    return AnalysisResult(
        id=f"AN-FALLBACK-{int(datetime.now(timezone.utc).timestamp())}",
        status="failed",
        created_at=datetime.now(timezone.utc).isoformat(),
        contract_hash=_sha256(contract_text),
        red_flags=[],
        klausul_aman=[],
        klausul_tinjauan=[],
        ringkasan=ContractSummary(
            jenis="Tidak Diketahui" if locale == "id" else "Unknown",
            status=(
                "Analisis gagal — silakan coba lagi"
                if locale == "id"
                else "Analysis failed — please try again"
            ),
            harus_diubah=[],
            sebaiknya_diubah=[],
        ),
        risk_level=RiskLevel.LOW,
        langkah_berikutnya=(
            ["Coba unggah ulang kontrak Anda."]
            if locale == "id"
            else ["Try re-uploading your contract."]
        ),
        disclaimer=_DISCLAIMER_ID if locale == "id" else _DISCLAIMER_EN,
        metadata=AnalysisMetadata(
            engine="pipeline-failed",
            rag_enabled=False,
            model="N/A",
            rag_mode=corpus_mode(),
            locale=locale,
        ),
    ).model_dump(mode="json")


# ── Tool 1: Jalankan Seluruh Pipeline ────────────────────────────────────────

async def _run_full_pipeline(contract_text: str, locale: str = "id") -> dict:
    """
    Menjalankan seluruh pipeline analisis KawalKontrak secara async.
    Dipanggil oleh ADK Agent sebagai satu tool terintegrasi.
    """
    from backend_python.orchestrator import run_analysis_pipeline

    logger.info("ADK Tool: Memanggil orchestrator.run_analysis_pipeline...")
    try:
        result = await run_analysis_pipeline(contract_text, GEMINI_API_KEY, locale)
        # Check if the result is already a dict or Pydantic model
        if hasattr(result, "model_dump"):
            result_dict = result.model_dump(mode="json")
        else:
            result_dict = result
        return {"stage": "complete", "result": result_dict}
    except Exception as exc:
        logger.error(f"ADK Tool: Pipeline gagal total — {exc}", exc_info=True)
        return {"stage": "error", "result": _build_fallback_result(contract_text, locale)}


# Daftarkan sebagai ADK FunctionTool
pipeline_tool = FunctionTool(_run_full_pipeline)
