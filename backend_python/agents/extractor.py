"""
KawalKontrak.ai — Agent 1: Extractor
======================================

Tanggung Jawab:
    Membaca teks kontrak kerja mentah dan menguraikannya menjadi
    daftar klausul terstruktur. Agen ini TIDAK melakukan penghakiman
    hukum — tugasnya murni ekstraksi dan klasifikasi topik.

Model: gemini-2.5-flash (ringan, cepat, hemat biaya)
Input:  Teks kontrak kerja mentah (str)
Output: list[ExtractedClause]
"""

import logging
from google import genai
from google.genai import types

from backend_python.models import ExtractedClause

logger = logging.getLogger(__name__)

# Batas karakter teks kontrak yang dikirim ke model (hemat token)
_MAX_CONTRACT_CHARS = 30_000

# Nama model yang digunakan (Flash ringan untuk tugas ekstraksi)
_MODEL = "gemini-2.5-flash"

_SYSTEM_PROMPT = """
Anda adalah seorang paralegal spesialis ketenagakerjaan Indonesia.
Tugas Anda hanya satu: membaca Surat Perjanjian Kerja (SPK) dan
mengurai setiap klausul/pasal yang ada menjadi data terstruktur.

Panduan:
- Ekstrak setiap klausul secara verbatim (kutipan asli).
- Tentukan topik utamanya (Pengupahan, Waktu Kerja, PHK, PKWT, Lembur,
  Cuti, Nonkompetisi, dll.).
- Tandai 'indikasi_masalah' = true jika klausul terlihat memberatkan
  pekerja atau berpotensi melanggar hukum secara kasat mata.
- JANGAN menganalisis atau memberikan saran hukum — hanya ekstraksi.
""".strip()


def extract_clauses(contract_text: str, client: genai.Client) -> list[ExtractedClause]:
    """
    Mengekstrak semua klausul dari teks kontrak kerja.

    Args:
        contract_text: Teks mentah Surat Perjanjian Kerja.
        client:        Instance Google GenAI client yang sudah dikonfigurasi.

    Returns:
        Daftar ExtractedClause. Mengembalikan list kosong jika gagal.
    """
    logger.info("Extractor: Memulai ekstraksi klausul...")

    # Potong teks jika terlalu panjang untuk menghemat token
    trimmed_text = contract_text[:_MAX_CONTRACT_CHARS]

    try:
        response = client.models.generate_content(
            model=_MODEL,
            contents=(
                f"Berikut adalah teks Surat Perjanjian Kerja (SPK):\n\n"
                f"{trimmed_text}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                temperature=0.1,  # Rendah = deterministik, lebih presisi untuk ekstraksi
                response_mime_type="application/json",
                response_schema=list[ExtractedClause],
            ),
        )

        # Gemini dengan Structured Output sudah menghasilkan objek Python,
        # bukan string JSON — kita tinggal akses .parsed
        result: list[ExtractedClause] = response.parsed  # type: ignore[assignment]

        if not result:
            logger.warning("Extractor: Tidak ada klausul yang berhasil diekstrak.")
            return []

        logger.info(f"Extractor: Berhasil mengekstrak {len(result)} klausul.")
        return result

    except Exception as exc:
        logger.error(f"Extractor: Gagal — {exc}", exc_info=True)
        return []
