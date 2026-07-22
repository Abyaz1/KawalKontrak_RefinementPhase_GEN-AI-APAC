"""
Golden-Set Evaluation (Live) — TRD §10 "Validasi Legal Manual" versi otomatis
===============================================================================

Menjalankan pipeline penuh terhadap kontrak sintetis yang dirakit dari
klausul berlabel (golden_set.json), lalu memastikan:
  1. Semua klausul berlabel 'red_flag' benar-benar terdeteksi.
  2. Klausul berlabel 'safe' TIDAK muncul sebagai red flag (false positive).

Test ini butuh GEMINI_API_KEY + corpus terkonfigurasi, sehingga otomatis
di-SKIP di CI tanpa kredensial. Jalankan lokal dengan:
    pytest backend_python/tests/test_golden_set.py -v
"""

import asyncio
import json
import os

import pytest

from backend_python import config

_HAS_CREDENTIALS = bool(config.GEMINI_API_KEY) and config.corpus_mode() != "none"

pytestmark = pytest.mark.skipif(
    not _HAS_CREDENTIALS,
    reason="Membutuhkan GEMINI_API_KEY + corpus (GEMINI_FILE_SEARCH_STORE / GEMINI_CORPUS_FILE_URI)",
)

_GOLDEN_PATH = os.path.join(os.path.dirname(__file__), "golden_set.json")


def _load_golden() -> list[dict]:
    with open(_GOLDEN_PATH, encoding="utf-8") as f:
        return json.load(f)["clauses"]


def _build_contract(clauses: list[dict]) -> str:
    lines = ["SURAT PERJANJIAN KERJA WAKTU TERTENTU (PKWT)", ""]
    for i, clause in enumerate(clauses, start=1):
        lines.append(f"Pasal {i}")
        lines.append(clause["text"])
        lines.append("")
    return "\n".join(lines)


def _flag_mentions(flag_text: str, keywords: list[str]) -> bool:
    lowered = flag_text.lower()
    return any(k.lower() in lowered for k in keywords)


def test_golden_set_end_to_end():
    from backend_python.orchestrator import run_analysis_pipeline

    golden = _load_golden()
    contract = _build_contract(golden)

    result = asyncio.run(
        run_analysis_pipeline(
            contract_text=contract,
            api_key=config.GEMINI_API_KEY,
            locale="id",
        )
    )

    assert result.status == "completed", "Pipeline harus selesai tanpa fallback"

    # Gabungan teks semua red flag untuk pencocokan kata kunci
    all_flag_text = " ".join(
        f"{rf.pasal_kontrak} {rf.potensi_masalah}" for rf in result.red_flags
    )

    missed = [
        g["id"]
        for g in golden
        if g["expected"] == "red_flag" and not _flag_mentions(all_flag_text, g["match_keywords"])
    ]
    assert not missed, f"Klausul pelanggaran tidak terdeteksi: {missed}"

    # Klausul aman tidak boleh jadi false positive
    false_positives = [
        g["id"]
        for g in golden
        if g["expected"] == "safe"
        and any(
            _flag_mentions(rf.pasal_kontrak, g["match_keywords"])
            for rf in result.red_flags
        )
    ]
    assert not false_positives, f"False positive pada klausul aman: {false_positives}"

    # Setiap red flag wajib punya sitasi (FR-03) — kecuali flag deterministik
    for rf in result.red_flags:
        assert rf.referensi_uu, f"Red flag {rf.flag_id} tidak memiliki referensi UU"
