"""
KawalKontrak.ai — Agent 2: Legal Matcher
==========================================

Tanggung Jawab:
    Mencocokkan setiap klausul kontrak yang berpotensi bermasalah
    dengan pasal-pasal regulasi ketenagakerjaan Indonesia.

Dua mode akses corpus (lihat backend_python/config.py):
  1. 'file_search' (direkomendasikan) — Gemini File Search Store:
     managed RAG persisten dengan retrieval + sitasi otomatis. Karena
     tool tidak bisa digabung dengan structured output, JSON diminta
     lewat prompt dan diparse secara defensif.
  2. 'file_data' (fallback dev) — melampirkan PDF corpus langsung ke
     konteks. Structured output tetap dipakai. PERINGATAN: file di
     File API kedaluwarsa 48 jam.

Model:  KK_MODEL_CORE (default gemini-2.5-flash)
Input:  list[ExtractedClause]
Output: list[MatchedClause]
"""

import logging

from google import genai
from google.genai import types
from pydantic import TypeAdapter

from backend_python.config import MODEL_CORE, corpus_mode, corpus_parts, corpus_tools
from backend_python.models import ExtractedClause, LegalMatchResult, MatchedClause
from backend_python.utils import locale_instruction, parse_json_response

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """
Anda adalah Analis Hukum Ketenagakerjaan Indonesia yang SANGAT teliti.
Sumber kebenaran Anda adalah dokumen regulasi ketenagakerjaan resmi Indonesia
(UU No. 6 Tahun 2023, PP 35/2021, PP 36/2021) yang tersedia melalui dokumen
terlampir / pencarian dokumen (File Search).

Tugas Anda:
1. Untuk setiap klausul kontrak yang diberikan, cari pasal-pasal yang
   LANGSUNG relevan dalam dokumen regulasi tersebut.
2. Tentukan status hukum klausul:
   - MELANGGAR : klausul bertentangan dengan ketentuan regulasi
   - SESUAI    : klausul konsisten dengan ketentuan regulasi
   - AMBIGU    : klausul berpotensi bermasalah tapi membutuhkan konteks lebih
   - TIDAK_DITEMUKAN: tidak ada regulasi terkait yang ditemukan

PENTING:
- Sitasi pasal HANYA dari dokumen regulasi — DILARANG mengarang pasal.
- Jika tidak yakin, gunakan status TIDAK_DITEMUKAN.
- 'ketentuan_relevan' harus berupa kutipan singkat dari dokumen regulasi.
""".strip()

# Instruksi format JSON untuk mode file_search (tool tidak bisa digabung
# dengan response_schema, jadi formatnya dijelaskan eksplisit di prompt).
_JSON_FORMAT_INSTRUCTION = """
FORMAT OUTPUT (WAJIB): balas HANYA dengan JSON array valid, tanpa teks lain:
[
  {
    "klausul_id": <int, indeks klausul dari daftar input>,
    "status_hukum": "MELANGGAR" | "SESUAI" | "AMBIGU" | "TIDAK_DITEMUKAN",
    "referensi_uu": [
      {
        "peraturan": "<nama peraturan, mis. 'UU No. 6 Tahun 2023'>",
        "pasal": "<nomor pasal, mis. '81'>",
        "judul": "<pokok bahasan pasal>",
        "ketentuan_relevan": "<kutipan singkat isi pasal>"
      }
    ]
  }
]
""".strip()

_MATCH_LIST_ADAPTER = TypeAdapter(list[LegalMatchResult])


def _build_clauses_prompt(clauses: list[ExtractedClause]) -> str:
    """Membangun teks prompt dari daftar klausul untuk dikirim ke model."""
    lines = []
    for i, clause in enumerate(clauses):
        lines.append(
            f"[ID: {i}] Topik: {clause.topik}\n"
            f"Klausul: {clause.klausul}"
        )
    return "\n\n".join(lines)


async def match_laws(
    clauses: list[ExtractedClause],
    client: genai.Client,
    locale: str = "id",
) -> list[MatchedClause]:
    """
    Mencocokkan klausul kontrak dengan peraturan perundang-undangan (async).

    Args:
        clauses: Daftar klausul hasil ekstraksi. Klausul dengan
                 `indikasi_masalah=True` diprioritaskan untuk hemat token.
        client:  Instance Google GenAI client.
        locale:  Bahasa nilai output.

    Returns:
        Daftar MatchedClause. List kosong jika gagal.
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

    mode = corpus_mode()
    logger.info(
        f"Legal Matcher: Memproses {len(candidates)} klausul (corpus mode: {mode})..."
    )

    clauses_text = _build_clauses_prompt(candidates)
    user_text = (
        f"Evaluasi klausul-klausul Surat Perjanjian Kerja berikut "
        f"berdasarkan dokumen regulasi ketenagakerjaan:\n\n{clauses_text}"
    )

    try:
        if mode == "file_search":
            # Managed RAG: retrieval otomatis dari File Search Store.
            response = await client.aio.models.generate_content(
                model=MODEL_CORE,
                contents=user_text,
                config=types.GenerateContentConfig(
                    system_instruction=(
                        _SYSTEM_PROMPT
                        + "\n\n"
                        + _JSON_FORMAT_INSTRUCTION
                        + locale_instruction(locale)
                    ),
                    temperature=0.1,  # Tingkat kreativitas rendah untuk akurasi sitasi
                    tools=corpus_tools(),
                ),
            )
            raw = parse_json_response(response.text)
            match_results = _MATCH_LIST_ADAPTER.validate_python(raw)
        else:
            # Fallback: lampirkan PDF corpus langsung + structured output.
            response = await client.aio.models.generate_content(
                model=MODEL_CORE,
                contents=[
                    types.Content(
                        role="user",
                        parts=[*corpus_parts(), types.Part(text=user_text)],
                    )
                ],
                config=types.GenerateContentConfig(
                    system_instruction=_SYSTEM_PROMPT + locale_instruction(locale),
                    temperature=0.1,
                    response_mime_type="application/json",
                    response_schema=list[LegalMatchResult],
                ),
            )
            match_results = response.parsed  # type: ignore[assignment]

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
