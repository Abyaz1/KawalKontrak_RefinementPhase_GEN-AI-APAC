"""
Test per-Agent dengan Mock Gemini Client
==========================================
Menguji logika internal masing-masing agen TANPA memanggil API Gemini.
Sesuai Testing Plan §2 (Level Unit) dan §5 (Test Case per Agent).

Skenario yang dicakup:
  EXT-* : Agent Extractor
  LM-*  : Agent Legal-Matcher
  RG-*  : Agent Risk-Grader
  VER-* : Agent Verifier (guardrail anti-halusinasi — paling kritis)
  NEG-* : Agent Negotiator

Cara menjalankan:
    python -m pytest backend_python/tests/test_agents.py -v
"""

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from backend_python.models import (
    ExtractedClause,
    LegalStatus,
    MatchedClause,
    NegotiationTemplate,
    PasalReference,
    RedFlagDraft,
    RiskGraderOutput,
    ContractSummary,
    RiskLevel,
    SafeClause,
    Severity,
    VerificationResult,
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

from pydantic import BaseModel
import json

def _make_client(parsed_value=None, text_value=None):
    """Membuat mock genai.Client yang mengembalikan nilai tertentu dari parsed/text."""
    response = MagicMock()
    response.parsed = parsed_value
    
    if text_value is not None:
        response.text = text_value
    elif parsed_value is not None:
        if isinstance(parsed_value, list):
            try:
                response.text = json.dumps([v.model_dump() if isinstance(v, BaseModel) else v for v in parsed_value])
            except Exception:
                response.text = str(parsed_value)
        elif isinstance(parsed_value, BaseModel):
            response.text = parsed_value.model_dump_json()
        else:
            response.text = str(parsed_value)
    else:
        response.text = None

    aio_mock = AsyncMock()
    aio_mock.models.generate_content = AsyncMock(return_value=response)

    client = MagicMock()
    client.aio = aio_mock
    return client


def _pasal(peraturan="UU No. 6 Tahun 2023", pasal="79", judul="Waktu Istirahat",
           ketentuan="Pekerja berhak atas istirahat mingguan."):
    return PasalReference(
        peraturan=peraturan, pasal=pasal,
        judul=judul, ketentuan_relevan=ketentuan,
    )


# ─── EXT: Agent Extractor ─────────────────────────────────────────────────────

class TestExtractor:
    """
    Testing Plan §5.1 — Agent Extractor
    EXT-01: Kontrak bersih → semua klausul terstruktur
    EXT-03: Kontrak foto buram → list kosong, tidak error
    EXT-04: Kontrak panjang (> MAX_CHARS) → dipotong sebelum dikirim ke model
    """

    def test_ext01_returns_clauses_when_model_returns_results(self):
        """EXT-01: Model berhasil mengembalikan klausul terstruktur."""
        from backend_python.agents.extractor import extract_clauses

        expected = [
            ExtractedClause(klausul="Gaji Rp 2.500.000", topik="Pengupahan", perlu_perhatian_ekstra=False),
            ExtractedClause(klausul="Bekerja 10 jam tanpa lembur", topik="Waktu Kerja", perlu_perhatian_ekstra=True),
        ]
        client = _make_client(parsed_value=expected)

        result = asyncio.run(extract_clauses("teks kontrak contoh", client, locale="id"))

        assert len(result) == 2
        assert result[1].perlu_perhatian_ekstra is True

    def test_ext03_returns_empty_list_on_model_failure(self):
        """EXT-03: Jika model error, kembalikan list kosong — tidak raise exception."""
        from backend_python.agents.extractor import extract_clauses

        client = MagicMock()
        client.aio.models.generate_content = AsyncMock(side_effect=RuntimeError("API timeout"))

        result = asyncio.run(extract_clauses("teks kontrak", client, locale="id"))

        assert result == []

    def test_ext04_contract_truncated_before_sending(self):
        """EXT-04: Teks kontrak > MAX_CONTRACT_CHARS harus dipotong di orchestrator, bukan agent."""
        from backend_python.agents.extractor import MAX_CONTRACT_CHARS
        # Verifikasi konstanta ada dan masuk akal (≥ 10.000 karakter)
        assert MAX_CONTRACT_CHARS >= 10_000

    def test_ext_empty_response_returns_empty_list(self):
        """Model mengembalikan None → kembalikan list kosong."""
        from backend_python.agents.extractor import extract_clauses

        client = _make_client(parsed_value=None)
        result = asyncio.run(extract_clauses("teks kontrak", client, locale="id"))
        assert result == []


# ─── LM: Agent Legal-Matcher ──────────────────────────────────────────────────

class TestLegalMatcher:
    """
    Testing Plan §5.2 — Agent Legal-Matcher
    LM-01: Semua klausul (positif + negatif) harus dikirim ke model (E2a fix — tidak ada filtering)
    LM-03: Jika tidak ada klausul → kembalikan list kosong
    """

    def test_lm01_only_flagged_clauses_are_sent(self):
        """LM-01: Semua klausul dikirim ke model — tidak ada filtering berdasarkan perlu_perhatian_ekstra (E2a fix)."""
        from backend_python.agents.legal_matcher import _build_clauses_prompt

        clauses = [
            ExtractedClause(klausul="Klausul aman", topik="Cuti", perlu_perhatian_ekstra=False),
            ExtractedClause(klausul="Klausul bermasalah", topik="PHK", perlu_perhatian_ekstra=True),
        ]
        prompt = _build_clauses_prompt(clauses)
        # Keduanya harus ada di prompt — tidak ada yang difilter
        assert "Klausul bermasalah" in prompt
        assert "Klausul aman" in prompt

    def test_lm03_empty_candidates_returns_empty_list(self):
        """LM-03: Input kosong → kembalikan list kosong tanpa error."""
        from backend_python.agents.legal_matcher import match_laws

        client = _make_client(parsed_value=[])
        result = asyncio.run(match_laws([], client, locale="id"))
        assert result == []

    def test_lm_filter_only_flagged_clauses(self):
        """LM: Semua klausul diproses terlepas dari perlu_perhatian_ekstra (E2a fix)."""
        from backend_python.agents.legal_matcher import match_laws

        clauses = [
            ExtractedClause(klausul="Aman saja", topik="Cuti", perlu_perhatian_ekstra=False),
        ]
        client = _make_client(parsed_value=[])
        # Klausul diproses (bukan difilter), model mengembalikan [] → hasil kosong
        result = asyncio.run(match_laws(clauses, client, locale="id"))
        assert result == []


# ─── RG: Agent Risk-Grader ────────────────────────────────────────────────────

class TestRiskGrader:
    """
    Testing Plan §5.3 — Agent Risk-Grader
    RG-01: Klausul MELANGGAR → red flag dengan severity
    RG-02: Input kosong → kembalikan None, tidak crash
    """

    def test_rg01_returns_grader_output_on_success(self):
        """RG-01: Jika model berhasil, kembalikan RiskGraderOutput."""
        from backend_python.agents.risk_grader import grade_risks

        mock_output = RiskGraderOutput(
            red_flags=[
                RedFlagDraft(
                    flag_id="RF_001",
                    severity=Severity.CRITICAL,
                    pasal_kontrak="PHK tanpa pesangon",
                    potensi_masalah="Anda tidak mendapat kompensasi apapun.",
                    referensi_uu=[_pasal(pasal="156")],
                    rekomendasi_negosiasi="Minta klausul ini dihapus.",
                    analogi_sederhana="Seperti dipecat tanpa dibayar gaji terakhir.",
                )
            ],
            klausul_aman=[],
            ringkasan=ContractSummary(
                jenis="PKWT",
                status="TIDAK AMAN",
                harus_diubah=["Klausul PHK"],
                sebaiknya_diubah=[],
            ),
            risk_level=RiskLevel.CRITICAL,
            langkah_berikutnya=["Jangan tandatangani sebelum revisi."],
        )
        client = _make_client(parsed_value=mock_output)

        clause = MatchedClause(
            klausul="PHK tanpa pesangon",
            topik="PHK",
            status_hukum=LegalStatus.MELANGGAR,
            referensi_uu=[_pasal(pasal="156")],
        )
        result = asyncio.run(grade_risks([clause], client, locale="id"))

        assert result is not None
        assert len(result.red_flags) == 1
        assert result.risk_level == RiskLevel.CRITICAL

    def test_rg02_empty_input_returns_none(self):
        """RG-02: Input klausul kosong → None (bukan exception)."""
        from backend_python.agents.risk_grader import grade_risks

        client = _make_client(parsed_value=None)
        result = asyncio.run(grade_risks([], client, locale="id"))
        assert result is None

    def test_rg_api_error_returns_none(self):
        """RG: Error API → kembalikan None secara graceful."""
        from backend_python.agents.risk_grader import grade_risks

        client = MagicMock()
        client.aio.models.generate_content = AsyncMock(side_effect=Exception("Model error"))

        clause = MatchedClause(
            klausul="Klausul bermasalah",
            topik="PHK",
            status_hukum=LegalStatus.MELANGGAR,
            referensi_uu=[],
        )
        result = asyncio.run(grade_risks([clause], client, locale="id"))
        assert result is None


# ─── VER: Agent Verifier — PALING KRITIS ──────────────────────────────────────

class TestVerifier:
    """
    Testing Plan §5.4 — Agent Verifier (guardrail anti-halusinasi)

    Ini adalah agen paling kritis. Testing Plan §8 menyatakan:
    "Verifier terbukti menolak minimal 1 kasus pasal fiktif/salah"

    VER-01: Referensi benar → lolos
    VER-02: Referensi tidak relevan → ditolak
    VER-03: Pasal fiktif → diblokir
    VER-04: Tidak ada flag → ([], 'passed') instan tanpa memanggil API
    """

    def _make_flag(self, flag_id="RF_001"):
        return RedFlagDraft(
            flag_id=flag_id,
            severity=Severity.HIGH,
            pasal_kontrak="Klausul uji",
            potensi_masalah="Potensi masalah.",
            referensi_uu=[_pasal()],
            rekomendasi_negosiasi="Negosiasikan.",
            analogi_sederhana="Analogi sederhana.",
        )

    def test_ver01_valid_flag_passes_through(self):
        """VER-01: Flag dengan referensi valid → lolos verifikasi."""
        from backend_python.agents.verifier import verify_red_flags

        verifications = [VerificationResult(flag_id="RF_001", is_valid=True, reason=None)]
        client = _make_client(parsed_value=verifications)

        flags = [self._make_flag("RF_001")]
        valid_flags, rejected_flags, status = asyncio.run(verify_red_flags(flags, client, locale="id"))

        assert len(valid_flags) == 1
        assert status == "passed"

    def test_ver02_invalid_reference_rejected(self):
        """VER-02: Flag dengan referensi tidak relevan → ditolak Verifier."""
        from backend_python.agents.verifier import verify_red_flags

        verifications = [
            VerificationResult(
                flag_id="RF_001",
                is_valid=False,
                reason="Pasal yang dikutip tentang TKA, tidak relevan untuk PKWT lokal.",
            )
        ]
        client = _make_client(parsed_value=verifications)

        flags = [self._make_flag("RF_001")]
        valid_flags, rejected_flags, status = asyncio.run(verify_red_flags(flags, client, locale="id"))

        assert len(valid_flags) == 0  # Flag ditolak
        assert status == "passed"

    def test_ver03_fictitious_pasal_blocked(self):
        """VER-03: Pasal fiktif/tidak ditemukan di corpus → diblokir Verifier."""
        from backend_python.agents.verifier import verify_red_flags

        verifications = [
            VerificationResult(
                flag_id="RF_001",
                is_valid=False,
                reason="Pasal 999 UU No. 6 Tahun 2023 tidak ada dalam dokumen regulasi.",
            )
        ]
        client = _make_client(parsed_value=verifications)

        flags = [self._make_flag("RF_001")]
        valid_flags, rejected_flags, status = asyncio.run(verify_red_flags(flags, client, locale="id"))

        assert len(valid_flags) == 0
        assert status == "passed"

    def test_ver04_no_flags_returns_immediately(self):
        """VER-04: Tidak ada red flag → ('passed', []) tanpa memanggil API."""
        from backend_python.agents.verifier import verify_red_flags

        client = _make_client()  # API tidak boleh dipanggil
        valid_flags, rejected_flags, status = asyncio.run(verify_red_flags([], client, locale="id"))

        assert valid_flags == []
        assert status == "passed"
        # Pastikan API tidak dipanggil sama sekali
        client.aio.models.generate_content.assert_not_called()

    def test_ver_api_failure_is_fail_open_with_report(self):
        """VER: Error API → fail-open (semua flag lolos) TAPI status='failed_open'."""
        from backend_python.agents.verifier import verify_red_flags

        client = MagicMock()
        client.aio.models.generate_content = AsyncMock(side_effect=Exception("API down"))

        flags = [self._make_flag("RF_001"), self._make_flag("RF_002")]
        valid_flags, rejected_flags, status = asyncio.run(verify_red_flags(flags, client, locale="id"))

        # Fail-open: semua flag dikembalikan
        assert len(valid_flags) == 2
        # Tapi status dilaporkan sebagai 'failed_open' untuk frontend
        assert status == "failed_open"

    def test_ver_unknown_flag_id_defaults_to_invalid(self):
        """VER: Flag_id tidak ada dalam hasil verifikasi → dianggap TIDAK valid."""
        from backend_python.agents.verifier import verify_red_flags

        # Verifier mengembalikan hasil untuk RF_999 (ID berbeda)
        verifications = [VerificationResult(flag_id="RF_999", is_valid=False, reason="beda")]
        client = _make_client(parsed_value=verifications)

        flags = [self._make_flag("RF_001")]  # RF_001 tidak ada di hasil verifikasi
        valid_flags, rejected_flags, status = asyncio.run(verify_red_flags(flags, client, locale="id"))

        # RF_001 tidak ditemukan di peta → default valid=False → ditolak
        assert len(valid_flags) == 0
        assert len(rejected_flags) == 1


# ─── NEG: Agent Negotiator ────────────────────────────────────────────────────

class TestNegotiator:
    """
    Testing Plan §5.5 — Agent Negotiator
    NEG-01: 1 flag → 1 template email
    NEG-03: Tidak ada flag → dict kosong tanpa memanggil API
    """

    def _make_flag(self, flag_id="RF_001"):
        return RedFlagDraft(
            flag_id=flag_id,
            severity=Severity.HIGH,
            pasal_kontrak="Klausul bermasalah",
            potensi_masalah="Deskripsi masalah.",
            referensi_uu=[_pasal()],
            rekomendasi_negosiasi="Minta revisi.",
            analogi_sederhana="Analogi.",
        )

    def test_neg01_one_flag_returns_one_template(self):
        """NEG-01: 1 red flag → 1 template email dihasilkan."""
        from backend_python.agents.negotiator import generate_negotiations

        templates = [NegotiationTemplate(flag_id="RF_001", email_template="Yth. HRD, ...")]
        client = _make_client(parsed_value=templates)

        result = asyncio.run(generate_negotiations([self._make_flag("RF_001")], client))

        assert "RF_001" in result
        assert "HRD" in result["RF_001"]

    def test_neg02_multiple_flags_return_multiple_templates(self):
        """NEG-02: 3 red flag → 3 template terpisah."""
        from backend_python.agents.negotiator import generate_negotiations

        flag_ids = ["RF_001", "RF_002", "RF_003"]
        templates = [
            NegotiationTemplate(flag_id=fid, email_template=f"Email untuk {fid}")
            for fid in flag_ids
        ]
        client = _make_client(parsed_value=templates)

        flags = [self._make_flag(fid) for fid in flag_ids]
        result = asyncio.run(generate_negotiations(flags, client))

        assert len(result) == 3
        for fid in flag_ids:
            assert fid in result

    def test_neg03_no_flags_returns_empty_dict_no_api_call(self):
        """NEG-03: Tidak ada red flag → dict kosong, API tidak dipanggil."""
        from backend_python.agents.negotiator import generate_negotiations

        client = _make_client()
        result = asyncio.run(generate_negotiations([], client))

        assert result == {}
        client.aio.models.generate_content.assert_not_called()

    def test_neg_api_error_returns_empty_dict(self):
        """NEG: Error API → dict kosong (graceful fallback, red flag tetap ditampilkan)."""
        from backend_python.agents.negotiator import generate_negotiations

        client = MagicMock()
        client.aio.models.generate_content = AsyncMock(side_effect=Exception("timeout"))

        result = asyncio.run(generate_negotiations([self._make_flag()], client))
        assert result == {}
