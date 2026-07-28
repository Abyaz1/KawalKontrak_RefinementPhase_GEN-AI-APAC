"""
Test Integrasi Orchestrator (tanpa API key)
============================================
Menguji logika non-AI dari orchestrator: SHA-256 hash, cache hit/miss,
fallback result, stage event generator, dan perakitan AnalysisResult.
Sesuai Testing Plan §2 (Level Integrasi) untuk komponen deterministik.

Cara menjalankan:
    python -m pytest backend_python/tests/test_orchestrator.py -v
"""

import asyncio

import pytest

from backend_python import cache
from backend_python.orchestrator import (
    _sha256,
    _stage_event,
)
from backend_python.results import build_fallback_result


# ─── Setup ────────────────────────────────────────────────────────────────────

def setup_function():
    cache.clear()


# ─── SHA-256 Hash ─────────────────────────────────────────────────────────────

class TestSha256:
    def test_same_text_same_hash(self):
        """Kontrak identik → hash yang sama (deterministic)."""
        assert _sha256("abc") == _sha256("abc")

    def test_different_text_different_hash(self):
        """Kontrak berbeda → hash berbeda."""
        assert _sha256("abc") != _sha256("def")

    def test_hash_length(self):
        """Hash SHA-256 selalu 64 karakter hex."""
        assert len(_sha256("kontrak kerja")) == 64

    def test_unicode_contract_text(self):
        """Hash kontrak berisi karakter Unicode (aksara Indonesia) tidak error."""
        text = "Pasal 1 — Pihak Kedua berhak atas upah sesuai UU No. 6 Tahun 2023."
        result = _sha256(text)
        assert len(result) == 64


# ─── Stage Events ──────────────────────────────────────────────────────────────

class TestStageEvent:
    def test_stage_event_minimal(self):
        """Stage event tanpa detail → hanya type, stage, status."""
        ev = _stage_event("extractor", "running")
        assert ev == {"type": "stage", "stage": "extractor", "status": "running"}

    def test_stage_event_with_detail(self):
        """Stage event dengan detail → menyertakan key 'detail'."""
        ev = _stage_event("verifier", "done", {"valid": 2, "total": 3})
        assert ev["detail"]["valid"] == 2
        assert ev["detail"]["total"] == 3

    def test_stage_event_no_detail_key_absent(self):
        """Stage event tanpa detail → key 'detail' tidak ada sama sekali."""
        ev = _stage_event("negotiator", "running")
        assert "detail" not in ev


# ─── Fallback Result ───────────────────────────────────────────────────────────

class TestFallbackResult:
    def test_fallback_has_failed_status(self):
        """Fallback result selalu punya status='failed'."""
        result = build_fallback_result(_sha256("teks kontrak"), locale="id")
        assert result.status == "failed"

    def test_fallback_has_no_red_flags(self):
        """Fallback result tidak boleh berisi red flag."""
        result = build_fallback_result(_sha256("teks kontrak"), locale="id")
        assert result.red_flags == []
        assert result.klausul_aman == []

    def test_fallback_id_starts_with_an_fallback(self):
        """Fallback result ID dimulai dengan 'AN-FALLBACK-'."""
        result = build_fallback_result(_sha256("teks kontrak"), locale="id")
        assert result.id.startswith("AN-FALLBACK-")

    def test_fallback_contract_hash_matches_input(self):
        """Fallback result hash sesuai kontrak yang gagal diproses."""
        text = "kontrak gagal diproses"
        result = build_fallback_result(_sha256(text), locale="id")
        assert result.contract_hash == _sha256(text)

    def test_fallback_en_locale(self):
        """Pastikan lokalisasi bahasa Inggris pada fallback bekerja."""
        result = build_fallback_result(_sha256("contract"), locale="en")
        assert "failed" in result.ringkasan.status.lower()
        assert "LBH" in result.disclaimer  # disclaimer selalu menyebut LBH

    def test_fallback_metadata_engine_is_pipeline_failed(self):
        """Fallback metadata menandai engine='pipeline-failed' untuk monitoring."""
        result = build_fallback_result(_sha256("teks"), locale="id")
        assert result.metadata.engine == "pipeline-failed"
        assert result.metadata.rag_enabled is False


# ─── Cache Integration ────────────────────────────────────────────────────────

class TestCacheIntegration:
    """
    Memastikan orchestrator menggunakan cache dengan benar.
    Diuji tanpa memanggil API.
    """

    def test_cache_hit_returns_cached_result(self):
        """Jika hash + locale ada di cache → kembalikan tanpa memanggil AI."""
        from backend_python.orchestrator import run_analysis_pipeline_stream

        # Siapkan data di cache
        contract = "kontrak yang sudah pernah dianalisis"
        contract_hash = _sha256(contract)
        fake_result = {
            "type": "result",
            "id": "AN-CACHED",
            "status": "completed",
            "risk_level": "LOW",
        }
        cache.put(contract_hash, "id", fake_result)

        # Jalankan stream — harus mengembalikan cache hit event
        events = asyncio.run(_collect_stream(run_analysis_pipeline_stream(
            contract_text=contract,
            locale="id",
        )))

        stage_events = [e for e in events if e.get("type") == "stage"]
        assert any(
            e.get("stage") == "cache" and e.get("detail", {}).get("hit") is True
            for e in stage_events
        ), "Harus ada stage event cache dengan hit=True"

    def test_cache_hit_marks_cached_in_metadata(self):
        """Hasil dari cache harus punya metadata.cached = True."""
        from backend_python.orchestrator import run_analysis_pipeline_stream

        contract = "kontrak test cache metadata"
        contract_hash = _sha256(contract)
        fake_result = {
            "id": "AN-1",
            "metadata": {"engine": "test", "rag_enabled": False, "model": "none"},
        }
        cache.put(contract_hash, "id", fake_result)

        events = asyncio.run(_collect_stream(run_analysis_pipeline_stream(
            contract_text=contract,
            locale="id",
        )))

        result_events = [e for e in events if e.get("type") == "result"]
        assert result_events, "Harus ada result event"
        metadata = result_events[0]["data"].get("metadata", {})
        assert metadata.get("cached") is True


async def _collect_stream(stream):
    """Helper: kumpulkan semua event dari async generator."""
    events = []
    async for event in stream:
        events.append(event)
    return events
