"""
KawalKontrak.ai — Pipeline Orchestrator
=========================================

Modul ini adalah "konduktor" yang mengatur eksekusi kelima agen AI
secara berurutan (sequential). Setiap agen menerima output dari agen
sebelumnya sebagai inputnya.

Alur pipeline:
  [Kontrak Mentah]
      │
      ▼
  Extractor        → list[ExtractedClause]
      │
      ▼
  Legal Matcher    → list[MatchedClause]  (pakai File Search PDF)
      │
      ▼
  Risk Grader      → RiskGraderOutput
      │
      ▼
  Verifier         → list[RedFlagDraft]  (filter halusinasi)
      │
      ▼
  Negotiator       → list[RedFlag]       (lengkap dengan email template)
      │
      ▼
  [AnalysisResult] → dikirim ke Next.js

Jika pipeline gagal di tahap manapun, fungsi akan me-raise exception
yang akan ditangkap oleh API layer untuk dikembalikan sebagai respons
error yang jelas kepada client.
"""

import hashlib
import logging
import os
from datetime import datetime, timezone

from google import genai

from backend_python.agents.extractor import extract_clauses
from backend_python.agents.legal_matcher import match_laws
from backend_python.agents.risk_grader import grade_risks
from backend_python.agents.verifier import verify_red_flags
from backend_python.agents.negotiator import generate_negotiations
from backend_python.models import (
    AnalysisMetadata,
    AnalysisResult,
    ContractSummary,
    RiskLevel,
    SafeClause,
)

logger = logging.getLogger(__name__)

# Teks disclaimer (ditampilkan selalu di bagian bawah hasil analisis)
_DISCLAIMER_ID = (
    "Analisis ini dihasilkan oleh Kecerdasan Buatan (AI) untuk tujuan literasi "
    "dan edukasi hukum, BUKAN nasihat hukum yang mengikat. Untuk sengketa serius, "
    "hubungi LBH Indonesia (021-315-1405), konsultan hukum profesional, atau "
    "serikat pekerja di organisasi Anda."
)
_DISCLAIMER_EN = (
    "This analysis is AI-generated for educational and legal literacy purposes, "
    "NOT binding legal advice. For serious disputes, contact LBH Indonesia "
    "(021-315-1405), a professional legal consultant, or the labor union in your organization."
)


def _sha256(text: str) -> str:
    """Menghasilkan hash SHA-256 dari teks kontrak untuk deduplication."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _build_fallback_result(contract_text: str, locale: str) -> AnalysisResult:
    """
    Membangun hasil analisis kosong (fallback) ketika pipeline gagal total.
    Ini memastikan API selalu mengembalikan respons yang valid, bukan crash.
    """
    return AnalysisResult(
        id=f"AN-FALLBACK-{int(datetime.now(timezone.utc).timestamp())}",
        status="failed",
        created_at=datetime.now(timezone.utc).isoformat(),
        contract_hash=_sha256(contract_text),
        red_flags=[],
        klausul_aman=[],
        ringkasan=ContractSummary(
            jenis="Tidak Diketahui",
            status="Analisis gagal — silakan coba lagi",
            harus_diubah=[],
            sebaiknya_diubah=[],
        ),
        risk_level=RiskLevel.LOW,
        langkah_berikutnya=["Coba unggah ulang kontrak Anda."],
        disclaimer=_DISCLAIMER_ID if locale == "id" else _DISCLAIMER_EN,
        metadata=AnalysisMetadata(
            engine="pipeline-failed",
            rag_enabled=False,
            model="N/A",
        ),
    )


def run_analysis_pipeline(
    contract_text: str,
    api_key: str,
    corpus_file_uri: str,
    locale: str = "id",
) -> AnalysisResult:
    """
    Menjalankan pipeline analisis kontrak kerja secara berurutan.

    Ini adalah satu-satunya fungsi publik yang perlu dipanggil dari luar
    modul ini. Semua kompleksitas multi-agent tersembunyi di sini.

    Args:
        contract_text:    Teks lengkap Surat Perjanjian Kerja.
        api_key:          Google Gemini API key.
        corpus_file_uri:  URI file PDF corpus di Gemini File API.
        locale:           Kode bahasa output ('id' atau 'en').

    Returns:
        AnalysisResult berisi red flags, safe clauses, ringkasan,
        dan semua metadata. Pada kegagalan fatal, mengembalikan
        fallback result dengan status='failed'.
    """
    logger.info("=" * 60)
    logger.info("Pipeline: Memulai analisis kontrak kerja...")
    logger.info("=" * 60)

    # Inisialisasi Gemini client (satu instance, dipakai semua agen)
    client = genai.Client(api_key=api_key)

    try:
        # ── Agent 1: Extractor ────────────────────────────────────
        extracted = extract_clauses(contract_text, client)
        if not extracted:
            raise ValueError("Extractor tidak dapat mengurai klausul dari kontrak ini.")

        # ── Agent 2: Legal Matcher ────────────────────────────────
        matched = match_laws(extracted, corpus_file_uri, client)
        if not matched:
            raise ValueError("Legal Matcher tidak menemukan kecocokan regulasi apapun.")

        # ── Agent 3: Risk Grader ──────────────────────────────────
        graded = grade_risks(matched, client)
        if graded is None:
            raise ValueError("Risk Grader gagal menilai risiko kontrak.")

        # ── Agent 4: Verifier ─────────────────────────────────────
        verified_flags = verify_red_flags(graded.red_flags, client)

        # ── Agent 5: Negotiator ───────────────────────────────────
        final_flags = generate_negotiations(verified_flags, client)

        # ── Rakit Hasil Akhir ─────────────────────────────────────
        result = AnalysisResult(
            id=f"AN-{int(datetime.now(timezone.utc).timestamp())}",
            status="completed",
            created_at=datetime.now(timezone.utc).isoformat(),
            contract_hash=_sha256(contract_text),
            red_flags=final_flags,
            klausul_aman=graded.klausul_aman,
            ringkasan=graded.ringkasan,
            risk_level=graded.risk_level,
            langkah_berikutnya=graded.langkah_berikutnya,
            disclaimer=_DISCLAIMER_ID if locale == "id" else _DISCLAIMER_EN,
            metadata=AnalysisMetadata(
                engine="gemini-multi-agent-python",
                rag_enabled=True,
                model="gemini-2.5-flash",
            ),
        )

        logger.info("Pipeline: Analisis selesai dengan sukses!")
        logger.info(
            f"  → {len(result.red_flags)} red flags | "
            f"{len(result.klausul_aman)} klausul aman | "
            f"Risk level: {result.risk_level.value}"
        )
        return result

    except Exception as exc:
        logger.error(f"Pipeline: Gagal total — {exc}", exc_info=True)
        return _build_fallback_result(contract_text, locale)
