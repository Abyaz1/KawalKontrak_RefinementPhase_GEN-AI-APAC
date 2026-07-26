"""
KawalKontrak.ai — Agent 5: Negotiator
========================================

Tanggung Jawab:
    Menghasilkan template email negosiasi profesional untuk setiap
    red flag. Dalam pipeline paralel, agen ini berjalan BERSAMAAN
    dengan Verifier terhadap draft red flags — template untuk flag
    yang kemudian gugur diverifikasi cukup dibuang saat perakitan.

    Prinsip penulisan email:
    - Sopan dan profesional — tidak konfrontatif.
    - Spesifik menyebut pasal UU yang dilanggar.
    - Memohon klarifikasi atau perubahan, bukan langsung menuntut.
    - Singkat dan langsung ke pokok masalah.

Model:  KK_MODEL_LITE (default gemini-2.5-flash-lite — sesuai TRD §3)
Input:  list[RedFlagDraft]
Output: dict[flag_id → email_template]
"""

import json
import logging

from google import genai
from google.genai import types

from backend_python.config import MODEL_LITE
from backend_python.models import NegotiationTemplate, RedFlagDraft
from backend_python.utils import locale_instruction

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """
Anda adalah Negosiator Ketenagakerjaan berpengalaman yang membantu pekerja
berkomunikasi secara profesional dengan HRD perusahaan.

Untuk setiap masalah kontrak yang diberikan, tuliskan template email
negosiasi yang:
1. Dimulai dengan sapaan formal "Yth. Bapak/Ibu HRD,"
2. Menyebutkan konteks secara singkat (posisi yang dilamar/diterima).
3. Menyatakan klausul spesifik yang ingin didiskusikan.
4. Menyebut pasal UU yang relevan sebagai dasar permintaan.
5. Memohon dengan sopan agar klausul ditinjau ulang atau diklarifikasi.
6. Diakhiri dengan "Terima kasih atas perhatiannya." dan tanda tangan
   "[Nama Anda]".

Nada: hangat, profesional, assertif namun tidak agresif.
Panjang: 100-180 kata per email.
""".strip()


async def generate_negotiations(
    flags: list[RedFlagDraft],
    client: genai.Client,
    locale: str = "en",
) -> dict[str, str]:
    """
    Menghasilkan template email negosiasi untuk setiap red flag (async).

    Args:
        flags:  Daftar draft red flag (boleh sebelum verifikasi — dipanggil
                paralel dengan Verifier untuk memangkas latensi pipeline).
        client: Instance Google GenAI client.
        locale: Bahasa email template.

    Returns:
        Peta flag_id → email_template. Peta kosong jika gagal
        (red flag tetap ditampilkan tanpa email — graceful fallback).
    """
    if not flags:
        logger.info("Negotiator: Tidak ada red flag untuk dibuatkan template email.")
        return {}

    logger.info(f"Negotiator: Membuat {len(flags)} template email negosiasi...")

    # Kirim ringkasan red flags (tanpa field verbose) untuk efisiensi token
    payload = json.dumps(
        [
            {
                "flag_id": rf.flag_id,
                "pasal_kontrak": rf.pasal_kontrak,
                "potensi_masalah": rf.potensi_masalah,
                "referensi_uu": [r.model_dump() for r in rf.referensi_uu],
                "rekomendasi_negosiasi": rf.rekomendasi_negosiasi,
            }
            for rf in flags
        ],
        ensure_ascii=False,
        indent=2,
    )

    try:
        response = await client.aio.models.generate_content(
            model=MODEL_LITE,
            contents=(
                f"Buatkan template email negosiasi untuk setiap masalah "
                f"kontrak berikut:\n\n{payload}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT + locale_instruction(locale),
                temperature=0.5,  # Lebih tinggi agar email terasa natural dan tidak kaku
                response_mime_type="application/json",
                response_schema=list[NegotiationTemplate],
            ),
        )

        templates: list[NegotiationTemplate] = response.parsed  # type: ignore[assignment]

        template_map = {t.flag_id: t.email_template for t in templates}
        logger.info(f"Negotiator: Berhasil membuat {len(template_map)} template email.")
        return template_map

    except Exception as exc:
        logger.error(f"Negotiator: Gagal membuat email — {exc}", exc_info=True)
        return {}
