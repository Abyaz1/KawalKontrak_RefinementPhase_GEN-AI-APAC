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

from backend_python import cache, genai_client
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
    Severity,
)
from backend_python.results import build_fallback_result, _DISCLAIMER_EN, _DISCLAIMER_ID

logger = logging.getLogger(__name__)

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


def _compute_risk_level(red_flags: list[RedFlag]) -> RiskLevel:
    """
    Hitung risk_level kontrak secara deterministik berdasarkan severity
    tertinggi dari red flags yang telah terverifikasi (E1b fix).

    Ini menggantikan nilai 'bebas' yang dihasilkan model Risk Grader,
    sehingga risk_level SELALU konsisten dengan daftar red_flags yang tampil.
    Jika tidak ada red flags, kontrak dianggap LOW risk.
    """
    if any(rf.severity == Severity.CRITICAL for rf in red_flags):
        return RiskLevel.CRITICAL
    if any(rf.severity == Severity.HIGH for rf in red_flags):
        return RiskLevel.HIGH
    if any(rf.severity == Severity.MEDIUM for rf in red_flags):
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


def _smart_truncate(text: str, max_chars: int) -> str:
    """
    Potong teks kontrak di batas paragraf/klausul terdekat sebelum max_chars
    — bukan di tengah kalimat (E3b fix).

    Strategi:
    1. Cari baris kosong ganda (\n\n) terdekat sebelum batas — tanda antar paragraf.
    2. Fallback ke newline tunggal terdekat jika tidak ada.
    3. Fallback ke batas karakter keras jika tidak ada newline sama sekali.
    Titik potong minimal 80% dari max_chars agar tidak terlalu banyak hilang.
    """
    if len(text) <= max_chars:
        return text

    candidate = text[:max_chars]
    min_cut = int(max_chars * 0.8)  # jangan potong lebih dari 20% dari batas

    # Cari baris kosong ganda (antar paragraf/klausul)
    pos = candidate.rfind('\n\n')
    if pos >= min_cut:
        return text[:pos]

    # Fallback: newline tunggal
    pos = candidate.rfind('\n')
    if pos >= min_cut:
        return text[:pos]

    # Fallback keras: potong di batas karakter
    return candidate


async def run_analysis_pipeline_stream(
    contract_text: str,
    locale: str = "en",
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

    # Deteksi & potong teks di batas klausul/paragraf terdekat (E3b fix)
    truncated = len(contract_text) > MAX_CONTRACT_CHARS
    trimmed_text = _smart_truncate(contract_text, MAX_CONTRACT_CHARS)
    if truncated:
        logger.warning(
            f"Pipeline: Kontrak {len(contract_text)} karakter dipotong ke "
            f"{len(trimmed_text)} (batas paragraf) — metadata.truncated = True."
        )

    # Inisialisasi Gemini client (satu instance, dipakai semua agen)
    client = genai_client.get_client()

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
        (verified_flags, rejected_flags, verifier_status), template_map = await asyncio.gather(
            verify_red_flags(graded.red_flags, client, locale),
            generate_negotiations(graded.red_flags, client, locale),
        )

        # Convert rejected red flags back to review clauses (FR-05 fallback rule)
        for rejected in rejected_flags:
            review_clauses.append(
                ReviewClause(
                    pasal_kontrak=rejected.pasal_kontrak,
                    topik=rejected.potensi_masalah,
                    alasan="Diturunkan dari Red Flag karena bukti regulasi kurang kuat menurut Verifier AI." if locale == "id" else "Downgraded from Red Flag due to inconclusive regulatory evidence.",
                    status=LegalStatus.AMBIGU,
                )
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

        # Hitung risk_level deterministik dari severity tertinggi red flags (E1b fix)
        # Nilai dari model (graded.risk_level) diabaikan — ini menjamin konsistensi 100%
        computed_risk_level = _compute_risk_level(final_flags)
        logger.info(
            f"Pipeline: risk_level model={graded.risk_level.value!r}, "
            f"deterministik={computed_risk_level.value!r}"
        )

        result = AnalysisResult(
            id=f"AN-{int(datetime.now(timezone.utc).timestamp())}",
            status="completed",
            created_at=datetime.now(timezone.utc).isoformat(),
            contract_hash=contract_hash,
            red_flags=final_flags,
            klausul_aman=graded.klausul_aman,
            klausul_tinjauan=review_clauses,
            ringkasan=graded.ringkasan,
            risk_level=computed_risk_level,
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
        yield _stage_event("pipeline", "error", {"message": str(exc)})
        yield {"type": "result", "data": build_fallback_result(contract_hash, locale, return_dict=True)}


async def run_analysis_pipeline(
    contract_text: str,
    locale: str = "en",
) -> AnalysisResult:
    """
    Wrapper non-streaming: menjalankan pipeline dan mengembalikan hanya
    hasil akhirnya. Dipakai oleh endpoint POST /analyze (kompatibilitas).
    """
    final_result: dict[str, Any] | None = None
    async for event in run_analysis_pipeline_stream(contract_text, locale):
        if event.get("type") == "result":
            final_result = event.get("data")

    if not final_result:
        logger.error("Pipeline: Selesai tapi tidak ada data hasil. Mengembalikan fallback.")
        return build_fallback_result(_sha256(contract_text), locale, return_dict=False) # type: ignore[return-value]
    return AnalysisResult.model_validate(final_result)
