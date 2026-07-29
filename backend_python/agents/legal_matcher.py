"""
KawalKontrak.ai — Agent 2: Legal Matcher
==========================================

Tanggung Jawab:
    Mencocokkan setiap klausul kontrak dengan pasal-pasal regulasi
    ketenagakerjaan Indonesia. Seluruh klausul diproses — tidak ada
    yang difilter berdasarkan `perlu_perhatian_ekstra` (E2a fix).

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

import json
import logging
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

from google import genai
from google.genai import types
from pydantic import TypeAdapter

from backend_python.config import (
    MODEL_CORE,
    corpus_mode,
    corpus_parts,
    corpus_tools,
    corpus_tools_vertex,
)
from backend_python.models import (
    ConfidenceLevel,
    ExtractedClause,
    LegalMatchResult,
    LegalStatus,
    MatchedClause,
)
from backend_python.utils import locale_instruction, parse_json_response

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """
Anda adalah Analis Hukum Ketenagakerjaan Indonesia yang SANGAT teliti.
Sumber kebenaran Anda adalah dokumen regulasi ketenagakerjaan resmi Indonesia
(UU No. 6 Tahun 2023, PP 35/2021, PP 36/2021) yang tersedia melalui dokumen
terlampir / pencarian dokumen (File Search).

Tugas Anda:
1. Untuk SETIAP klausul kontrak yang diberikan (tanpa terkecuali — jangan
   pernah melewatkan satu klausul pun dari daftar input), cari pasal-pasal
   yang LANGSUNG relevan dalam dokumen regulasi tersebut.
2. Tentukan status hukum klausul:
   - MELANGGAR : klausul bertentangan dengan ketentuan regulasi
   - SESUAI    : klausul konsisten dengan ketentuan regulasi
   - AMBIGU    : klausul berpotensi bermasalah tapi membutuhkan konteks lebih,
     ATAU bahasa klausul terdengar sepihak/tidak jelas/memberatkan pekerja
     namun Anda tidak bisa menemukan pasal yang persis mengatur situasi ini
   - TIDAK_DITEMUKAN: klausul benar-benar di luar cakupan hukum ketenagakerjaan
     (mis. klausul administratif murni seperti alamat kantor, definisi istilah)
     DAN tidak ada indikasi bahasa yang merugikan pekerja sama sekali

   ATURAN WAJIB — JANGAN PERNAH MENJADIKAN "TIDAK ADA PASAL PERSIS" SEBAGAI
   ALASAN UNTUK TIDAK_DITEMUKAN: jika sebuah klausul memakai bahasa yang
   berpotensi merugikan pekerja (misal: sepihak, "atas kebijakan perusahaan
   tanpa kompensasi", "tidak berhak menuntut", denda tidak proporsional, syarat
   yang tidak wajar) TAPI Anda tidak yakin pasal mana yang persis berlaku,
   WAJIB tandai AMBIGU dengan confidence LOW — BUKAN TIDAK_DITEMUKAN. Status
   TIDAK_DITEMUKAN hanya untuk klausul yang memang netral dan tidak
   mengandung indikasi masalah apapun secara bahasa.
3. Tentukan 'confidence' Anda atas status_hukum di atas:
   - HIGH   : sitasi pasal jelas & langsung berlaku, tidak ada ambiguitas.
   - MEDIUM : indikasi cukup kuat tapi ada nuansa yang bisa menggeser kesimpulan.
   - LOW    : penilaian didasarkan pada bahasa/nada klausul semata (bukan sitasi
     pasal yang pasti) — WAJIB dipakai untuk kasus "bahasa mencurigakan, pasal
     tidak pasti" di atas. Klausul ini TETAP HARUS muncul di output, tidak
     boleh dihilangkan hanya karena confidence rendah.

PANDUAN KHUSUS UNTUK TOPIK KRITIS (WAJIB DIIKUTI):
- Denda Resign / Pemutusan PKWT sebelum selesai: Jika ada denda tetap/exit penalty untuk resign sebelum masa kontrak berakhir (misal denda Rp 50 juta), tandai MELANGGAR Pasal 62 UU No. 6 Tahun 2023 (atau UU No. 13 Tahun 2003) karena ganti rugi harusnya sebesar sisa upah sisa kontrak.
- Penahanan Ijazah / Dokumen Asli: Jika kontrak memuat penahanan ijazah asli pekerja sebagai jaminan, tandai MELANGGAR Surat Edaran Kemnaker No. SE.M/3/HK.04/III/2023.
- Masa Percobaan PKWT: Jika kontrak PKWT mensyaratkan masa percobaan (probation), tandai MELANGGAR Pasal 58 UU No. 6 Tahun 2023 (atau UU No. 13 Tahun 2003).
- Upah di bawah UMK: Jika upah di bawah standar UMK daerah terkait, tandai MELANGGAR PP No. 36 Tahun 2021 / UU No. 6 Tahun 2023 tentang Pengupahan.
- Lembur Tanpa Upah: Jika wajib lembur tanpa dibayar upah lembur, tandai MELANGGAR Pasal 78 UU No. 6 Tahun 2023 (atau PP No. 35 Tahun 2021 Pasal 26-29).
- Non-compete Clause: Jika dilarang bekerja di kompetitor setelah kontrak berakhir secara berlebihan, tandai MELANGGAR Pasal 28 UUD 1945 tentang hak memilih pekerjaan.

PENTING:
- Sitasi pasal HANYA dari dokumen regulasi — DILARANG mengarang pasal.
- Jika tidak yakin PASAL MANA yang berlaku TAPI bahasa klausul mencurigakan,
  gunakan AMBIGU + confidence LOW (lihat aturan wajib di atas) — bukan
  TIDAK_DITEMUKAN. TIDAK_DITEMUKAN hanya untuk klausul netral tanpa indikasi masalah.
- 'ketentuan_relevan' harus berupa ringkasan/parafrase singkat dari isi pasal tersebut (maksimal 15 kata). DILARANG KERAS menyalin/mengutip teks pasal secara verbatim panjang-panjang agar tidak memicu filter keamanan sistem (recitation/copyright filter).
- SETIAP klausul di daftar input WAJIB punya tepat satu hasil di output.
  Jangan pernah melewatkan atau meringkas klausul karena jumlahnya banyak.
""".strip()

# Instruksi format JSON untuk mode file_search (tool tidak bisa digabung
# dengan response_schema, jadi formatnya dijelaskan eksplisit di prompt).
_JSON_FORMAT_INSTRUCTION = """
FORMAT OUTPUT (WAJIB): balas HANYA dengan JSON array valid, tanpa teks lain:
[
  {
    "klausul_id": <int, indeks klausul dari daftar input>,
    "status_hukum": "MELANGGAR" | "SESUAI" | "AMBIGU" | "TIDAK_DITEMUKAN",
    "confidence": "HIGH" | "MEDIUM" | "LOW",
    "referensi_uu": [
      {
        "peraturan": "<nama peraturan, mis. 'UU No. 6 Tahun 2023'>",
        "pasal": "<nomor pasal, mis. '81'>",
        "judul": "<pokok bahasan pasal>",
        "ketentuan_relevan": "<ringkasan/parafrase singkat isi pasal, maks 15 kata>"
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


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), reraise=True)
async def _match_laws_once(
    candidates: list[ExtractedClause],
    client: genai.Client,
    locale: str,
    mode: str,
) -> list[MatchedClause]:
    """
    Satu percobaan pemanggilan Gemini untuk pencocokan hukum. Sengaja
    MEMBIARKAN exception naik ke pemanggil (bukan ditelan di sini) supaya
    `@retry` benar-benar mengulang pada error transient (rate limit, timeout,
    JSON korup) alih-alih diam-diam mengembalikan list kosong di percobaan
    pertama seperti versi sebelumnya.
    """
    clauses_text = _build_clauses_prompt(candidates)
    user_text = (
        f"Evaluasi klausul-klausul Surat Perjanjian Kerja berikut "
        f"berdasarkan dokumen regulasi ketenagakerjaan:\n\n{clauses_text}"
    )

    if mode in ["file_search", "vertex_rag"]:
        # Managed RAG: retrieval otomatis dari File Search Store atau Vertex RAG
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
                tools=corpus_tools() if mode == "file_search" else corpus_tools_vertex(),
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
        raise ValueError("Legal Matcher: model mengembalikan hasil kosong.")

    # Gabungkan data klausul asli dengan hasil pencocokan
    seen_ids: set[int] = set()
    matched_clauses: list[MatchedClause] = []
    for match in match_results:
        if 0 <= match.klausul_id < len(candidates):
            seen_ids.add(match.klausul_id)
            original = candidates[match.klausul_id]
            matched_clauses.append(
                MatchedClause(
                    klausul=original.klausul,
                    topik=original.topik,
                    status_hukum=match.status_hukum,
                    confidence=match.confidence,
                    referensi_uu=match.referensi_uu,
                )
            )

    # Jaminan "tidak ada klausul yang hilang": jika model melewatkan
    # sebagian klausul (mis. array terpotong karena token limit di mode
    # RAG), jangan biarkan klausul itu hilang begitu saja dari hasil.
    # Sisipkan sebagai AMBIGU + confidence LOW agar tetap terlihat user
    # dan diproses lebih lanjut oleh Risk Grader, alih-alih raib diam-diam.
    missing_ids = [i for i in range(len(candidates)) if i not in seen_ids]
    if missing_ids:
        logger.warning(
            f"Legal Matcher: {len(missing_ids)} klausul tidak ada di respons model "
            f"(ids={missing_ids}) — disisipkan sebagai AMBIGU/confidence LOW, bukan hilang."
        )
        for i in missing_ids:
            original = candidates[i]
            matched_clauses.append(
                MatchedClause(
                    klausul=original.klausul,
                    topik=original.topik,
                    status_hukum=LegalStatus.AMBIGU,
                    confidence=ConfidenceLevel.LOW,
                    referensi_uu=[],
                )
            )

    return matched_clauses


async def match_laws(
    clauses: list[ExtractedClause],
    client: genai.Client,
    locale: str = "en",
) -> list[MatchedClause]:
    """
    Mencocokkan klausul kontrak dengan peraturan perundang-undangan (async).

    Seluruh klausul dari Extractor diproses — tidak ada filtering berdasarkan
    `perlu_perhatian_ekstra`. Ini memastikan klausul positif (SESUAI) dan
    negatif (MELANGGAR/AMBIGU) sama-sama tertangkap dalam hasil akhir (E2a fix).

    Args:
        clauses: Daftar SEMUA klausul hasil ekstraksi.
        client:  Instance Google GenAI client.
        locale:  Bahasa nilai output.

    Returns:
        Daftar MatchedClause. Jika SEMUA percobaan retry gagal (bukan lagi
        gagal di percobaan pertama seperti sebelumnya), setiap klausul tetap
        disisipkan sebagai AMBIGU/confidence LOW — bukan list kosong — supaya
        FR "semua klausul tertangkap" tetap terpenuhi bahkan saat AI error total.
    """
    candidates = list(clauses)
    if not candidates:
        logger.warning("Legal Matcher: Daftar klausul kosong, melewati tahap ini.")
        return []

    mode = corpus_mode()
    logger.info(
        f"Legal Matcher: Memproses {len(candidates)} klausul (corpus mode: {mode})..."
    )

    try:
        matched_clauses = await _match_laws_once(candidates, client, locale, mode)
        logger.info(f"Legal Matcher: Berhasil mencocokkan {len(matched_clauses)} klausul.")
        return matched_clauses
    except Exception as exc:
        logger.error(
            f"Legal Matcher: Gagal total setelah retry (mode={mode}) — {exc}. "
            f"Menyisipkan semua {len(candidates)} klausul sebagai AMBIGU/confidence LOW "
            f"alih-alih mengembalikan list kosong.",
            exc_info=True,
        )
        return [
            MatchedClause(
                klausul=c.klausul,
                topik=c.topik,
                status_hukum=LegalStatus.AMBIGU,
                confidence=ConfidenceLevel.LOW,
                referensi_uu=[],
            )
            for c in candidates
        ]
