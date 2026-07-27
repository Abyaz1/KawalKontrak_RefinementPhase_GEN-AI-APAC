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

    Args:
        contract_text: Teks kontrak kerja yang akan dianalisis.
        locale: Bahasa output ('id' untuk Indonesia, 'en' untuk English).

    Returns:
        dict berisi hasil AnalysisResult yang lengkap.
    """
    logger.info("ADK Tool: Memulai pipeline analisis kontrak...")

    contract_hash = _sha256(contract_text)

    # ── Cache check ───────────────────────────────────────────────────────────
    cached = cache.get(contract_hash, locale)
    if cached is not None:
        logger.info("ADK Tool: Cache HIT — hasil dikembalikan tanpa memanggil AI.")
        cached_result = dict(cached)
        cached_metadata = dict(cached_result.get("metadata") or {})
        cached_metadata["cached"] = True
        cached_result["metadata"] = cached_metadata
        return {"stage": "complete", "result": cached_result}

    # ── Potong kontrak jika terlalu panjang ───────────────────────────────────
    truncated = len(contract_text) > MAX_CONTRACT_CHARS
    trimmed_text = contract_text[:MAX_CONTRACT_CHARS]

    client = genai.Client(api_key=GEMINI_API_KEY)

    try:
        # ── Agent 1: Extractor ────────────────────────────────────────────────
        logger.info("ADK Tool → Extractor: Mengurai klausul kontrak...")
        extracted = await extract_clauses(trimmed_text, client, locale)
        if not extracted:
            raise ValueError("Extractor tidak dapat mengurai klausul dari kontrak ini.")
        logger.info(f"ADK Tool → Extractor: {len(extracted)} klausul diekstrak.")

        # ── Agent 2: Legal Matcher ────────────────────────────────────────────
        logger.info("ADK Tool → Legal Matcher: Mencocokkan klausul dengan regulasi...")
        matched = await match_laws(extracted, client, locale)
        if not matched:
            raise ValueError("Legal Matcher tidak menemukan kecocokan regulasi apapun.")
        logger.info(f"ADK Tool → Legal Matcher: {len(matched)} klausul dicocokkan.")

        # ── FR-05: Klausul TIDAK_DITEMUKAN → daftar tinjauan ─────────────────
        review_reason = _REVIEW_REASON_ID if locale == "id" else _REVIEW_REASON_EN
        review_clauses = [
            ReviewClause(
                pasal_kontrak=m.klausul,
                topik=m.topik,
                alasan=review_reason,
                status=m.status_hukum,
            )
            for m in matched
            if m.status_hukum == LegalStatus.TIDAK_DITEMUKAN
        ]

        # ── Agent 3: Risk Grader ──────────────────────────────────────────────
        logger.info("ADK Tool → Risk Grader: Menilai risiko kontrak...")
        gradable = [m for m in matched if m.status_hukum != LegalStatus.TIDAK_DITEMUKAN]
        graded = await grade_risks(gradable if gradable else matched, client, locale)
        if graded is None:
            raise ValueError("Risk Grader gagal menilai risiko kontrak.")
        logger.info(
            f"ADK Tool → Risk Grader: {len(graded.red_flags)} red flags, "
            f"{len(graded.klausul_aman)} klausul aman."
        )

        # ── Agent 4 & 5: Verifier ∥ Negotiator (paralel) ─────────────────────
        logger.info("ADK Tool → Verifier + Negotiator: Berjalan paralel...")
        (verified_flags, rejected_flags, verifier_status), template_map = await asyncio.gather(
            verify_red_flags(graded.red_flags, client, locale),
            generate_negotiations(graded.red_flags, client, locale),
        )

        # FR-05: Red flag yang ditolak → daftar tinjauan
        for rejected in rejected_flags:
            review_clauses.append(
                ReviewClause(
                    pasal_kontrak=rejected.pasal_kontrak,
                    topik=rejected.potensi_masalah,
                    alasan="Diturunkan dari Red Flag karena bukti regulasi kurang kuat menurut Verifier AI.",
                    status=LegalStatus.AMBIGU,
                )
            )

        logger.info(
            f"ADK Tool → Verifier: {len(verified_flags)}/{len(graded.red_flags)} lolos. "
            f"ADK Tool → Negotiator: {len(template_map)} template email."
        )

        # ── Rakit hasil akhir ─────────────────────────────────────────────────
        final_flags = [
            RedFlag(
                flag_id=draft.flag_id,
                severity=draft.severity,
                pasal_kontrak=draft.pasal_kontrak,
                potensi_masalah=draft.potensi_masalah,
                referensi_uu=draft.referensi_uu,
                rekomendasi_negosiasi=draft.rekomendasi_negosiasi,
                analogi_sederhana=draft.analogi_sederhana,
                email_template=template_map.get(draft.flag_id, ""),
            )
            for draft in verified_flags
        ]

        result = AnalysisResult(
            id=f"AN-{int(datetime.now(timezone.utc).timestamp())}",
            status="completed",
            created_at=datetime.now(timezone.utc).isoformat(),
            contract_hash=contract_hash,
            red_flags=final_flags,
            klausul_aman=graded.klausul_aman,
            klausul_tinjauan=review_clauses,
            ringkasan=graded.ringkasan,
            risk_level=graded.risk_level,
            langkah_berikutnya=graded.langkah_berikutnya,
            disclaimer=_DISCLAIMER_ID if locale == "id" else _DISCLAIMER_EN,
            metadata=AnalysisMetadata(
                engine="google-adk-kawal-kontrak",
                rag_enabled=corpus_mode() != "none",
                model=f"{MODEL_CORE} + {MODEL_LITE}",
                rag_mode=corpus_mode(),
                cached=False,
                verifier_status=verifier_status,
                truncated=truncated,
                locale=locale,
            ),
        )

        result_dict = result.model_dump(mode="json")
        cache.put(contract_hash, locale, result_dict)

        logger.info(
            f"ADK Tool: Pipeline selesai — {len(result.red_flags)} red flags, "
            f"risk level: {result.risk_level.value}"
        )
        return {"stage": "complete", "result": result_dict}

    except Exception as exc:
        logger.error(f"ADK Tool: Pipeline gagal total — {exc}", exc_info=True)
        return {"stage": "error", "result": _build_fallback_result(contract_text, locale)}


# Daftarkan sebagai ADK FunctionTool
pipeline_tool = FunctionTool(_run_full_pipeline)
