"""
KawalKontrak.ai — Constants and Results Helpers
================================================

Berisi konstanta teks fallback dan helper untuk membangun
hasil analisis default jika pipeline mengalami error fatal.
"""

from datetime import datetime, timezone
from typing import Any
from backend_python.config import corpus_mode
from backend_python.models import (
    AnalysisMetadata,
    AnalysisResult,
    ContractSummary,
    RiskLevel,
)

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

def build_fallback_result(contract_hash: str, locale: str, return_dict: bool = False) -> Any:
    """
    Fallback result jika pipeline gagal total.
    
    Args:
        contract_hash: SHA-256 hash dari teks kontrak.
        locale: Bahasa ('id' atau 'en').
        return_dict: Jika True mengembalikan dictionary, jika False mengembalikan model AnalysisResult.
    """
    result = AnalysisResult(
        id=f"AN-FALLBACK-{int(datetime.now(timezone.utc).timestamp())}",
        status="failed",
        created_at=datetime.now(timezone.utc).isoformat(),
        contract_hash=contract_hash,
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
    
    if return_dict:
        return result.model_dump(mode="json")
    return result
