"""
KawalKontrak.ai — Pipeline Orchestrator (Async + Streaming)
=============================================================

Modul ini adalah "konduktor" yang mengatur eksekusi agen-agen AI.
Perubahan besar dari versi sebelumnya (hasil audit):

  1. ASYNC PENUH — semua panggilan Gemini memakai `client.aio`, sehingga
     event loop FastAPI tidak terblokir dan request paralel tetap dilayani.
  2. STREAMING PROGRESS — fungsi utama adalah async generator yang
     memancarkan event per tahap (FR-06: transparansi proses riil,
     bukan animasi palsu di frontend).
  3. PARALELISASI — Verifier dan Negotiator berjalan BERSAMAAN
     (keduanya hanya butuh draft red flags), memangkas latensi satu
     tahap penuh.
  4. CACHE — kontrak identik (hash + locale sama) dikembalikan instan
     tanpa memanggil Gemini lagi.
  5. FR-05 UTUH — klausul berstatus TIDAK_DITEMUKAN masuk ke daftar
     `klausul_tinjauan` ("tidak ditemukan referensi pasti"), tidak
     lagi hilang diam-diam.

Alur pipeline:
  [Kontrak Mentah]
      │
      ▼
  Extractor        → list[ExtractedClause]
      │
      ▼
  Legal Matcher    → list[MatchedClause]  (File Search Store / PDF)
      │
      ▼
  Risk Grader      → RiskGraderOutput
      │
      ├────────────┬──────────────── (paralel)
      ▼            ▼
  Verifier      Negotiator
      │            │
      └─────┬──────┘
            ▼
  [AnalysisResult] → dikirim ke Next.js (via stream atau sekali kirim)
"""

import asyncio
import hashlib
import logging
from collections.abc import AsyncIterator
from datetime import datetime, timezone
from typing import Any

from google import genai

from backend_python import cache
from backend_python.agents.extractor import MAX_CONTRACT_CHARS, extract_clauses
from backend_python.agents.legal_matcher import match_laws
from backend_python.agents.negotiator import generate_negotiations
from backend_python.agents.risk_grader import grade_risks
from backend_python.agents.verifier import verify_red_flags
from backend_python.config import MODEL_CORE, MODEL_LITE, corpus_mode
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

# Teks disclaimer (ditampilkan selalu di bagian bawah hasil analisis)
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
    """Menghasilkan hash SHA-256 dari teks kontrak untuk deduplication/cache."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _stage_event(stage: str, status: str, detail: dict[str, Any] | None = None) -> dict[str, Any]:
    """Membangun satu event progres untuk dikirim ke frontend."""
    event: dict[str, Any] = {"type": "stage", "stage": stage, "status": status}
    if detail:
        event["detail"] = detail
    return event


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
    )


async def run_analysis_pipeline_stream(
    contract_text: str,
    api_key: str,
    locale: str = "id",
) -> AsyncIterator[dict[str, Any]]:
    """
    Menjalankan pipeline analisis sebagai async generator.

    Event yang dipancarkan (dict siap diserialisasi ke JSON):
        {"type": "stage",  "stage": "<nama>", "status": "running"|"done", "detail": {...}}
        {"type": "result", "data": {<AnalysisResult>}}

    Nama stage: cache, extractor, legal_matcher, risk_grader,
                verifier, negotiator.
    """
    logger.info("=" * 60)
    logger.info("Pipeline: Memulai analisis kontrak kerja...")
    logger.info("=" * 60)

    contract_hash = _sha256(contract_text)

    # ── Tahap 0: Cache ─────────────────────────────────────────────
    cached = cache.get(contract_hash, locale)
    if cached is not None:
        logger.info("Pipeline: Cache HIT — hasil dikembalikan tanpa memanggil AI.")
        cached_result = dict(cached)
        cached_metadata = dict(cached_result.get("metadata") or {})
        cached_metadata["cached"] = True
        cached_result["metadata"] = cached_metadata
        yield _stage_event("cache", "done", {"hit": True})
        yield {"type": "result", "data": cached_result}
        return

    # Deteksi & tandai pemotongan teks (tidak lagi diam-diam)
    truncated = len(contract_text) > MAX_CONTRACT_CHARS
    trimmed_text = contract_text[:MAX_CONTRACT_CHARS]
    if truncated:
        logger.warning(
            f"Pipeline: Kontrak {len(contract_text)} karakter dipotong ke "
            f"{MAX_CONTRACT_CHARS} — metadata.truncated = True."
        )

    # Inisialisasi Gemini client (satu instance, dipakai semua agen)
    client = genai.Client(api_key=api_key)

    try:
        # ── Agent 1: Extractor ────────────────────────────────────
        yield _stage_event("extractor", "running")
        extracted = await extract_clauses(trimmed_text, client, locale)
        if not extracted:
            raise ValueError("Extractor tidak dapat mengurai klausul dari kontrak ini.")
        yield _stage_event("extractor", "done", {"clauses": len(extracted)})

        # ── Agent 2: Legal Matcher ────────────────────────────────
        yield _stage_event("legal_matcher", "running")
        matched = await match_laws(extracted, client, locale)
        if not matched:
            raise ValueError("Legal Matcher tidak menemukan kecocokan regulasi apapun.")
        yield _stage_event(
            "legal_matcher",
            "done",
            {
                "matched": len(matched),
                "melanggar": sum(
                    1 for m in matched if m.status_hukum == LegalStatus.MELANGGAR
                ),
            },
        )

        # ── FR-05: klausul tanpa referensi pasti → daftar tinjauan ─
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

        # ── Agent 3: Risk Grader ──────────────────────────────────
        yield _stage_event("risk_grader", "running")
        gradable = [m for m in matched if m.status_hukum != LegalStatus.TIDAK_DITEMUKAN]
        graded = await grade_risks(gradable if gradable else matched, client, locale)
        if graded is None:
            raise ValueError("Risk Grader gagal menilai risiko kontrak.")
        yield _stage_event(
            "risk_grader",
            "done",
            {"red_flags": len(graded.red_flags), "safe": len(graded.klausul_aman)},
        )

        # ── Agent 4 & 5: Verifier ∥ Negotiator (paralel) ──────────
        # Keduanya hanya membutuhkan draft red flags, jadi dijalankan
        # bersamaan untuk memangkas latensi satu tahap penuh.
        yield _stage_event("verifier", "running")
        yield _stage_event("negotiator", "running")
        (verified_flags, verifier_status), template_map = await asyncio.gather(
            verify_red_flags(graded.red_flags, client, locale),
            generate_negotiations(graded.red_flags, client, locale),
        )
        yield _stage_event(
            "verifier",
            "done",
            {
                "valid": len(verified_flags),
                "total": len(graded.red_flags),
                "status": verifier_status,
            },
        )
        yield _stage_event("negotiator", "done", {"templates": len(template_map)})

        # ── Rakit Hasil Akhir ─────────────────────────────────────
        final_flags = [
            RedFlag(
                flag_id=draft.flag_id,
                severity=draft.severity,
                pasal_kontrak=draft.pasal_kontrak,
                potensi_masalah=draft.potensi_masalah,
                referensi_uu=draft.referensi_uu,
                rekomendasi_negosiasi=draft.rekomendasi_negosiasi,
                analogi_sederhana=draft.analogi_sederhana,
                # String kosong jika template tidak ditemukan (graceful fallback)
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
                engine="gemini-multi-agent-python",
                rag_enabled=corpus_mode() != "none",
                model=f"{MODEL_CORE} + {MODEL_LITE}",
                rag_mode=corpus_mode(),
                cached=False,
                verifier_status=verifier_status,
                truncated=truncated,
                locale=locale,
            ),
        )

        logger.info("Pipeline: Analisis selesai dengan sukses!")
        logger.info(
            f"  → {len(result.red_flags)} red flags | "
            f"{len(result.klausul_aman)} klausul aman | "
            f"{len(result.klausul_tinjauan)} perlu tinjauan | "
            f"Risk level: {result.risk_level.value}"
        )

        result_dict = result.model_dump(mode="json")
        cache.put(contract_hash, locale, result_dict)
        yield {"type": "result", "data": result_dict}

    except Exception as exc:
        logger.error(f"Pipeline: Gagal total — {exc}", exc_info=True)
        fallback = _build_fallback_result(contract_text, locale)
        yield {"type": "result", "data": fallback.model_dump(mode="json")}


async def run_analysis_pipeline(
    contract_text: str,
    api_key: str,
    locale: str = "id",
) -> AnalysisResult:
    """
    Wrapper non-streaming: menjalankan pipeline dan mengembalikan hanya
    hasil akhirnya. Dipakai oleh endpoint POST /analyze (kompatibilitas).
    """
    final_data: dict[str, Any] | None = None
    async for event in run_analysis_pipeline_stream(contract_text, api_key, locale):
        if event.get("type") == "result":
            final_data = event["data"]

    if final_data is None:  # Seharusnya tidak pernah terjadi
        return _build_fallback_result(contract_text, locale)
    return AnalysisResult.model_validate(final_data)
