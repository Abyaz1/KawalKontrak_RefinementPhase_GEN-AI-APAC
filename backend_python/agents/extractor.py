"""
KawalKontrak.ai — Agent 1: Extractor
======================================

Tanggung Jawab:
    Membaca teks kontrak kerja mentah dan menguraikannya menjadi
    daftar klausul terstruktur. Agen ini TIDAK melakukan penghakiman
    hukum — tugasnya murni ekstraksi dan klasifikasi topik.

Model:  KK_MODEL_LITE (default gemini-2.5-flash-lite — sesuai TRD §3,
        tugas ekstraksi volume tinggi memakai model termurah)
Input:  Teks kontrak kerja mentah (str)
Output: list[ExtractedClause]
"""

import logging

from google import genai
from google.genai import types

from backend_python.config import MODEL_LITE
from backend_python.models import ExtractedClause
from backend_python.utils import locale_instruction

logger = logging.getLogger(__name__)

# Batas karakter teks kontrak yang dikirim ke model.
# Kontrak ≤ 5 halaman ± 15.000 karakter; 60.000 memberi ruang untuk kontrak
# panjang. Jika terpotong, orchestrator menandai metadata.truncated = True
# sehingga UI dapat memperingatkan pengguna (bukan memotong diam-diam).
MAX_CONTRACT_CHARS = 60_000

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


async def extract_clauses(
    contract_text: str,
    client: genai.Client,
    locale: str = "id",
) -> list[ExtractedClause]:
    """
    Mengekstrak semua klausul dari teks kontrak kerja (async).

    Args:
        contract_text: Teks mentah SPK (sudah dipotong orchestrator bila perlu).
        client:        Instance Google GenAI client.
        locale:        Bahasa nilai output ('id' / 'en').

    Returns:
        Daftar ExtractedClause. List kosong jika gagal.
    """
    logger.info("Extractor: Memulai ekstraksi klausul...")

    try:
        response = await client.aio.models.generate_content(
            model=MODEL_LITE,
            contents=(
                f"Berikut adalah teks Surat Perjanjian Kerja (SPK):\n\n"
                f"{contract_text}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT + locale_instruction(locale),
                temperature=0.1,  # Rendah = deterministik, lebih presisi untuk ekstraksi
                response_mime_type="application/json",
                response_schema=list[ExtractedClause],
            ),
        )

        result: list[ExtractedClause] = response.parsed  # type: ignore[assignment]

        if not result:
            logger.warning("Extractor: Tidak ada klausul yang berhasil diekstrak.")
            return []

        logger.info(f"Extractor: Berhasil mengekstrak {len(result)} klausul.")
        return result

    except Exception as exc:
        logger.error(f"Extractor: Gagal — {exc}", exc_info=True)
        return []
