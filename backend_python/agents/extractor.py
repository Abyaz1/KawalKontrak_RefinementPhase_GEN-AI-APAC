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
Anda adalah seorang paralegal spesialis ketenagakerjaan Indonesia yang sangat jeli.
Tugas Anda: membaca Surat Perjanjian Kerja (SPK) dan mengurai setiap klausul/pasal menjadi data terstruktur.

Panduan Ekstraksi:
1. Ekstrak setiap klausul secara verbatim (kutipan asli dari teks). JANGAN ringkas atau ubah kalimatnya.
2. Tentukan topik utama (mis. Pengupahan, Waktu Kerja, PHK, PKWT, Lembur, Cuti, Nonkompetisi, Penahanan Dokumen, Denda, dll.).
3. Aturan 'indikasi_masalah' (KRUSIAL): Set 'indikasi_masalah' = true untuk semua klausul yang berpotensi melanggar hukum, merugikan pekerja, atau berisi topik-topik kritis berikut (sekalipun kalimatnya pendek atau terlihat biasa):
   - Pengupahan/Gaji: Semua klausul yang menyebutkan nominal gaji (untuk diverifikasi terhadap UMP/UMK).
   - Penahanan Dokumen: Penahanan ijazah asli, sertifikat, atau dokumen pribadi pekerja.
   - Masa Percobaan (Probation): Klausul percobaan untuk pekerja kontrak (PKWT) — dilarang oleh undang-undang.
   - Waktu Kerja & Lembur: Jam kerja berlebih, atau denda lembur/kerja tanpa uang lembur.
   - Penalti/Denda: Kewajiban membayar denda jika mengundurkan diri (exit penalty), ganti rugi biaya training.
   - Hak Cuti/Istirahat: Pembatasan cuti, cuti hamil/melahirkan, atau tidak adanya hari libur.
   - Pemutusan Hubungan Kerja (PHK): Klausul pemecatan sepihak, pelepasan hak pesangon/uang kompensasi PKWT.
   - Non-kompetisi (Non-compete): Larangan bekerja di perusahaan kompetitor pasca-kerja.
4. JANGAN menganalisis pasal atau memberikan saran hukum — tugas Anda murni ekstraksi sensitif.
""".strip()


async def extract_clauses(
    contract_text: str,
    client: genai.Client,
    locale: str = "en",
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
