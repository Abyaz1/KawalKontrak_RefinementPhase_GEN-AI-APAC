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
from backend_python.models import (
    AnalysisMetadata,
    AnalysisResult,
    ContractSummary,
    LegalStatus,
    RedFlag,
    ReviewClause,
    RiskLevel,
)
from backend_python.results import build_fallback_result

logger = logging.getLogger(__name__)

def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

# ── Removed duplicate constants and fallback (moved to results.py) ──

# ── Tool 1: Jalankan Seluruh Pipeline ────────────────────────────────────────

async def _run_full_pipeline(contract_text: str, locale: str = "id") -> dict:
    """
    Menjalankan seluruh pipeline analisis KawalKontrak secara async.
    Dipanggil oleh ADK Agent sebagai satu tool terintegrasi.
    """
    from backend_python.orchestrator import run_analysis_pipeline

    logger.info("ADK Tool: Memanggil orchestrator.run_analysis_pipeline...")
    try:
        result = await run_analysis_pipeline(contract_text, locale)
        # Check if the result is already a dict or Pydantic model
        if hasattr(result, "model_dump"):
            result_dict = result.model_dump(mode="json")
        else:
            result_dict = result
        return {"stage": "complete", "result": result_dict}
    except Exception as exc:
        logger.error(f"ADK Tool: Pipeline gagal total — {exc}", exc_info=True)
        return {"stage": "error", "result": build_fallback_result(_sha256(contract_text), locale, return_dict=True)}


# Daftarkan sebagai ADK FunctionTool
pipeline_tool = FunctionTool(_run_full_pipeline)
