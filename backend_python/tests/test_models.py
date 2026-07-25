"""Unit test untuk backend_python/models.py (tanpa API key)."""

import pytest
from pydantic import ValidationError

from backend_python.models import (
    AnalysisMetadata,
    AnalysisResult,
    AnalyzeRequest,
    ContractSummary,
    LegalStatus,
    ReviewClause,
    RiskLevel,
    TranscribeRequest,
)


def _minimal_result(**overrides) -> AnalysisResult:
    base = dict(
        id="AN-1",
        status="completed",
        created_at="2026-07-22T00:00:00Z",
        contract_hash="abc",
        red_flags=[],
        klausul_aman=[],
        ringkasan=ContractSummary(
            jenis="PKWT",
            status="AMAN",
            harus_diubah=[],
            sebaiknya_diubah=[],
        ),
        risk_level=RiskLevel.LOW,
        langkah_berikutnya=[],
        disclaimer="x",
        metadata=AnalysisMetadata(engine="test", rag_enabled=False, model="none"),
    )
    base.update(overrides)
    return AnalysisResult(**base)


def test_klausul_tinjauan_defaults_to_empty():
    result = _minimal_result()
    assert result.klausul_tinjauan == []


def test_review_clause_serializes():
    result = _minimal_result(
        klausul_tinjauan=[
            ReviewClause(
                pasal_kontrak="Pasal X",
                topik="Nonkompetisi",
                alasan="Tidak ditemukan referensi pasti",
                status=LegalStatus.TIDAK_DITEMUKAN,
            )
        ]
    )
    dumped = result.model_dump(mode="json")
    assert dumped["klausul_tinjauan"][0]["status"] == "TIDAK_DITEMUKAN"


def test_metadata_new_fields_have_safe_defaults():
    md = AnalysisMetadata(engine="e", rag_enabled=True, model="m")
    assert md.rag_mode == "none"
    assert md.cached is False
    assert md.verifier_status == "skipped"
    assert md.truncated is False
    assert md.locale == "en"


def test_analyze_request_enforces_min_length():
    with pytest.raises(ValidationError):
        AnalyzeRequest(contractText="terlalu pendek")


def test_transcribe_request_enforces_min_payload():
    with pytest.raises(ValidationError):
        TranscribeRequest(imageBase64="abc", mimeType="image/jpeg")
