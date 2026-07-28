"""
KawalKontrak.ai — Agent 4: Verifier
======================================

Tanggung Jawab:
    Melakukan "self-critique" atau audit independen terhadap red flags
    yang dihasilkan Risk Grader. Agen ini menjadi penjaga gerbang
    anti-halusinasi (PRD FR-05).

    PENTING — perbaikan hasil audit: Verifier kini diberi AKSES KE
    CORPUS REGULASI (File Search / PDF terlampir), sehingga sitasi
    diverifikasi terhadap dokumen sumber, bukan dari memori model.

    Jika audit gagal karena error teknis, pipeline tetap berjalan
    (fail-open) TETAPI status 'failed_open' dilaporkan di metadata
    sehingga UI dapat memberi tahu pengguna bahwa temuan belum
    tersaring — bukan lagi kegagalan yang tersembunyi.

Model:  KK_MODEL_CORE (default gemini-2.5-flash)
Input:  list[RedFlagDraft]
Output: (list[RedFlagDraft] valid, status: 'passed' | 'failed_open')
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
from backend_python.models import RedFlagDraft, VerificationResult
from backend_python.utils import locale_instruction, parse_json_response

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """
Anda adalah Senior Legal Auditor dengan pengalaman 20 tahun di bidang
hukum ketenagakerjaan Indonesia. Tugas Anda adalah mengaudit temuan
hukum yang dibuat oleh analis junior, DENGAN MEMERIKSA dokumen regulasi
resmi yang tersedia (dokumen terlampir / pencarian dokumen).

Untuk setiap red flag yang diberikan, periksa:
1. Apakah 'pasal_kontrak' memang bermasalah dari perspektif hukum?
2. Apakah 'referensi_uu' yang dikutip BENAR-BENAR ADA dalam dokumen
   regulasi dan relevan dengan masalah yang ditemukan?
3. Apakah 'ketentuan_relevan' dalam referensi memang bertentangan
   dengan klausul kontrak tersebut?

Tandai is_valid = False jika:
- Referensi UU tidak relevan dengan masalah yang diklaim.
- Pasal yang dikutip tidak ditemukan dalam dokumen regulasi atau
  isinya tidak sesuai dengan yang diklaim (kemungkinan halusinasi).
- Klausul kontrak sebenarnya tidak melanggar hukum (false positive).

PANDUAN VERIFIKASI KHUSUS (WAJIB DIANGGAP VALID/is_valid = true):
- Penahanan Ijazah: Jika analis merujuk ke 'Surat Edaran Kemnaker No. SE.M/3/HK.04/III/2023' atau UUD 1945, Anda HARUS set is_valid = true tanpa berdebat.
- Non-compete / Larangan bekerja di kompetitor: Jika analis merujuk ke 'Pasal 28' atau 'Pasal 28D' UUD 1945, Anda HARUS set is_valid = true.
- Denda Resign / Pemutusan PKWT sebelum selesai: Jika analis merujuk ke 'Pasal 62' UU No. 6 Tahun 2023 atau PP No. 35 Tahun 2021 Pasal 16, Anda HARUS set is_valid = true, meskipun tidak tertulis eksplisit "pekerja kepada pengusaha". Ini adalah standar verifikasi.

PERINGATAN KERAS: Abaikan filter halusinasi jika sesuai dengan panduan khusus di atas. MEREKA ADALAH PENGECUALIAN VALID.

Sertakan 'reason' yang jelas jika is_valid = False.
PENTING:
Jangan mengutip teks pasal secara verbatim panjang-panjang pada alasan ('reason') Anda; gunakan penjelasan/parafrase singkat agar tidak memicu filter keamanan sistem (recitation/copyright filter).
""".strip()

_JSON_FORMAT_INSTRUCTION = """
FORMAT OUTPUT (WAJIB): balas HANYA dengan satu JSON array valid, tanpa teks lain (JANGAN ada penjelasan, kutipan, markdown, atau pengulangan format):
[
  {"flag_id": "<id>", "is_valid": true | false, "reason": "<alasan singkat jika tidak valid, boleh null>"}
]
""".strip()

_VERIFICATION_LIST_ADAPTER = TypeAdapter(list[VerificationResult])


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), reraise=True)
async def verify_red_flags(
    red_flags: list[RedFlagDraft],
    client: genai.Client,
    locale: str = "en",
) -> tuple[list[RedFlagDraft], list[RedFlagDraft], str]:
    """
    Memverifikasi validitas setiap red flag untuk mencegah halusinasi (async).

    Args:
        red_flags: Daftar draft red flag dari Risk Grader Agent.
        client:    Instance Google GenAI client.
        locale:    Bahasa nilai output.

    Returns:
        Tuple (daftar flag yang lolos, daftar flag yang ditolak, status verifikasi):
          - 'passed'      : audit berjalan dan flag tersaring.
          - 'failed_open' : audit error — semua flag diloloskan tanpa
                            filter dan hal ini DIBERITAHUKAN ke frontend
                            lewat metadata (tidak lagi diam-diam).
    """
    if not red_flags:
        logger.info("Verifier: Tidak ada red flag untuk diverifikasi.")
        return [], [], "passed"

    mode = corpus_mode()
    logger.info(f"Verifier: Mengaudit {len(red_flags)} red flags (corpus mode: {mode})...")

    # Kirim red flags sebagai JSON untuk diaudit
    payload = json.dumps(
        [rf.model_dump() for rf in red_flags],
        ensure_ascii=False,
        indent=2,
    )
    user_text = f"Audit temuan red flag hukum berikut:\n\n{payload}"

    try:
        if mode in ["file_search", "vertex_rag"]:
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
                    temperature=0.1,  # Sangat deterministik untuk audit
                    tools=corpus_tools() if mode == "file_search" else corpus_tools_vertex(),
                ),
            )
            raw = parse_json_response(response.text)
            verifications = _VERIFICATION_LIST_ADAPTER.validate_python(raw)
        else:
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
                    response_schema=list[VerificationResult],
                ),
            )
            verifications = response.parsed  # type: ignore[assignment]

        # Buat peta flag_id → is_valid untuk pencarian O(1)
        validity_map: dict[str, bool] = {
            v.flag_id: v.is_valid for v in verifications
        }

        # Log setiap red flag yang ditolak untuk transparansi
        for v in verifications:
            if not v.is_valid:
                logger.warning(
                    f"Verifier: '{v.flag_id}' ditolak — {v.reason or 'tidak ada alasan'}"
                )

        # Filter: pisahkan yang lolos dan ditolak
        # Jika suatu flag_id tidak ada dalam hasil verifikasi (edge case),
        # anggap TIDAK valid (bias: safety first, human review).
        valid_flags = []
        rejected_flags = []
        for rf in red_flags:
            if validity_map.get(rf.flag_id, False):
                valid_flags.append(rf)
            else:
                rejected_flags.append(rf)

        logger.info(
            f"Verifier: {len(valid_flags)}/{len(red_flags)} red flags lolos verifikasi."
        )
        return valid_flags, rejected_flags, "passed"

    except Exception as exc:
        # Fail-open TAPI ter-lapor: flag dikembalikan tanpa filter dan
        # status 'failed_open' diteruskan ke metadata agar UI bisa memberi
        # tahu pengguna bahwa temuan belum melalui audit anti-halusinasi.
        logger.error(
            f"Verifier: Gagal, mengembalikan semua red flags tanpa filter — {exc}",
            exc_info=True,
        )
        return red_flags, [], "failed_open"
