"""
KawalKontrak.ai — Agent 2: Legal Matcher
==========================================

Tanggung Jawab:
    Mencocokkan setiap klausul kontrak yang berpotensi bermasalah
    dengan pasal-pasal regulasi ketenagakerjaan Indonesia, menggunakan
    Gemini File Search (Managed RAG) pada dokumen PDF corpus yang sudah
    diupload ke Gemini File API.

    Ini adalah agen kunci yang memastikan sitasi hukum akurat — model
    langsung merujuk ke dokumen UU asli, bukan mengandalkan memorinya.

Model: gemini-2.5-flash + File Search via fileData
Input:  list[ExtractedClause], corpus_file_uri (str)
Output: list[MatchedClause]
"""

import logging
from google import genai
from google.genai import types

from backend_python.models import ExtractedClause, LegalMatchResult, MatchedClause

logger = logging.getLogger(__name__)

_MODEL = "gemini-2.5-flash"

_SYSTEM_PROMPT = """
Anda adalah Analis Hukum Ketenagakerjaan Indonesia yang SANGAT teliti.
Dokumen PDF yang dilampirkan berisi regulasi ketenagakerjaan resmi Indonesia
(UU No. 6 Tahun 2023, PP 35/2021, PP 36/2021).

Tugas Anda:
1. Untuk setiap klausul kontrak yang diberikan, cari pasal-pasal yang
   LANGSUNG relevan dalam dokumen PDF tersebut.
2. Tentukan status hukum klausul:
   - MELANGGAR : klausul bertentangan dengan ketentuan dalam PDF
   - SESUAI    : klausul konsisten dengan ketentuan dalam PDF
   - AMBIGU    : klausul berpotensi bermasalah tapi membutuhkan konteks lebih
   - TIDAK_DITEMUKAN: tidak ada regulasi terkait yang ditemukan dalam PDF

PENTING:
- Sitasi pasal HANYA dari dokumen PDF yang dilampirkan.
- Jika tidak yakin, gunakan status TIDAK_DITEMUKAN — jangan mengarang pasal.
- 'ketentuan_relevan' harus berupa kutipan singkat dari dokumen PDF.
""".strip()


def _build_clauses_prompt(clauses: list[ExtractedClause]) -> str:
    """Membangun teks prompt dari daftar klausul untuk dikirim ke model."""
    lines = []
    for i, clause in enumerate(clauses):
        lines.append(
            f"[ID: {i}] Topik: {clause.topik}\n"
            f"Klausul: {clause.klausul}"
        )
    return "\n\n".join(lines)


def match_laws(
    clauses: list[ExtractedClause],
    corpus_file_uri: str,
    client: genai.Client,
) -> list[MatchedClause]:
    """
    Mencocokkan klausul-klausul kontrak dengan peraturan perundang-undangan
    menggunakan Gemini File Search (Managed RAG).

    Args:
        clauses:          Daftar klausul hasil ekstraksi. Hanya klausul
                          dengan `indikasi_masalah=True` yang diproses
                          untuk menghemat token.
        corpus_file_uri:  URI lengkap file PDF di Gemini File API,
                          contoh: 'https://generativelanguage.googleapis.com/...'
        client:           Instance Google GenAI client.

    Returns:
        Daftar MatchedClause (klausul + status hukum + referensi UU).
        Mengembalikan list kosong jika gagal.
    """
    # Filter hanya klausul yang berpotensi bermasalah untuk efisiensi token
    candidates = [c for c in clauses if c.indikasi_masalah]

    # Jika semua klausul terlihat aman, proses semua (tidak boleh ada yang dilewati)
    if not candidates:
        logger.info("Legal Matcher: Tidak ada indikasi masalah — memproses semua klausul.")
        candidates = clauses

    if not candidates:
        logger.warning("Legal Matcher: Daftar klausul kosong, melewati tahap ini.")
        return []

    logger.info(f"Legal Matcher: Memproses {len(candidates)} klausul dengan File Search...")

    clauses_text = _build_clauses_prompt(candidates)

    try:
        response = client.models.generate_content(
            model=_MODEL,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        # Melampirkan dokumen PDF corpus sebagai konteks (File Search)
                        types.Part(
                            file_data=types.FileData(
                                file_uri=corpus_file_uri,
                                mime_type="application/pdf",
                            )
                        ),
                        types.Part(
                            text=(
                                f"Evaluasi klausul-klausul Surat Perjanjian Kerja "
                                f"berikut berdasarkan dokumen regulasi yang dilampirkan:\n\n"
                                f"{clauses_text}"
                            )
                        ),
                    ],
                )
            ],
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                temperature=0.1,  # Tingkat kreativitas rendah untuk akurasi sitasi
                response_mime_type="application/json",
                response_schema=list[LegalMatchResult],
            ),
        )

        match_results: list[LegalMatchResult] = response.parsed  # type: ignore[assignment]

        if not match_results:
            logger.warning("Legal Matcher: Tidak ada hasil pencocokan yang dikembalikan.")
            return []

        # Gabungkan data klausul asli dengan hasil pencocokan
        matched_clauses: list[MatchedClause] = []
        for match in match_results:
            if 0 <= match.klausul_id < len(candidates):
                original = candidates[match.klausul_id]
                matched_clauses.append(
                    MatchedClause(
                        klausul=original.klausul,
                        topik=original.topik,
                        status_hukum=match.status_hukum,
                        referensi_uu=match.referensi_uu,
                    )
                )

        logger.info(f"Legal Matcher: Berhasil mencocokkan {len(matched_clauses)} klausul.")
        return matched_clauses

    except Exception as exc:
        logger.error(f"Legal Matcher: Gagal — {exc}", exc_info=True)
        return []
