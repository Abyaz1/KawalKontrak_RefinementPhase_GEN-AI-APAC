"""
KawalKontrak.ai — Agent 5: Negotiator
========================================

Tanggung Jawab:
    Menghasilkan template email negosiasi profesional untuk setiap
    red flag yang sudah terverifikasi. Ini adalah agen terakhir dalam
    pipeline, yang mengubah temuan hukum menjadi alat aksi nyata bagi
    pekerja.

    Prinsip penulisan email:
    - Sopan dan profesional — tidak konfrontatif.
    - Spesifik menyebut pasal UU yang dilanggar.
    - Memohon klarifikasi atau perubahan, bukan langsung menuntut.
    - Singkat dan langsung ke pokok masalah.

Model: gemini-2.5-flash (ringan, cepat — tugas ini lebih kreatif)
Input:  list[RedFlagDraft] (yang sudah terverifikasi)
Output: list[RedFlag] (red flag final dengan email_template)
"""

import json
import logging
from google import genai
from google.genai import types

from backend_python.models import RedFlagDraft, NegotiationTemplate, RedFlag

logger = logging.getLogger(__name__)

_MODEL = "gemini-2.5-flash"

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


def generate_negotiations(
    verified_flags: list[RedFlagDraft],
    client: genai.Client,
) -> list[RedFlag]:
    """
    Menghasilkan template email negosiasi untuk setiap red flag terverifikasi.

    Args:
        verified_flags: Daftar red flag yang sudah lolos dari Verifier Agent.
        client:         Instance Google GenAI client.

    Returns:
        Daftar RedFlag final, lengkap dengan field 'email_template'.
        Jika generasi email gagal, red flag tetap dikembalikan dengan
        'email_template' berisi string kosong (fallback graceful).
    """
    if not verified_flags:
        logger.info("Negotiator: Tidak ada red flag untuk dibuatkan template email.")
        return []

    logger.info(f"Negotiator: Membuat {len(verified_flags)} template email negosiasi...")

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
            for rf in verified_flags
        ],
        ensure_ascii=False,
        indent=2,
    )

    try:
        response = client.models.generate_content(
            model=_MODEL,
            contents=(
                f"Buatkan template email negosiasi untuk setiap masalah "
                f"kontrak berikut:\n\n{payload}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                temperature=0.5,  # Lebih tinggi agar email terasa natural dan tidak kaku
                response_mime_type="application/json",
                response_schema=list[NegotiationTemplate],
            ),
        )

        templates: list[NegotiationTemplate] = response.parsed  # type: ignore[assignment]

        # Buat peta flag_id → email_template untuk pencarian cepat
        template_map: dict[str, str] = {
            t.flag_id: t.email_template for t in templates
        }

        # Rakit RedFlag final dengan menggabungkan draft + email template
        final_flags: list[RedFlag] = []
        for draft in verified_flags:
            final_flags.append(
                RedFlag(
                    flag_id=draft.flag_id,
                    severity=draft.severity,
                    pasal_kontrak=draft.pasal_kontrak,
                    potensi_masalah=draft.potensi_masalah,
                    referensi_uu=draft.referensi_uu,
                    rekomendasi_negosiasi=draft.rekomendasi_negosiasi,
                    analogi_sederhana=draft.analogi_sederhana,
                    # Gunakan string kosong jika template tidak ditemukan (graceful fallback)
                    email_template=template_map.get(draft.flag_id, ""),
                )
            )

        logger.info(f"Negotiator: Berhasil membuat {len(final_flags)} red flag final.")
        return final_flags

    except Exception as exc:
        logger.error(f"Negotiator: Gagal membuat email — {exc}", exc_info=True)

        # Graceful fallback: kembalikan red flags tanpa email template
        return [
            RedFlag(
                flag_id=rf.flag_id,
                severity=rf.severity,
                pasal_kontrak=rf.pasal_kontrak,
                potensi_masalah=rf.potensi_masalah,
                referensi_uu=rf.referensi_uu,
                rekomendasi_negosiasi=rf.rekomendasi_negosiasi,
                analogi_sederhana=rf.analogi_sederhana,
                email_template="",
            )
            for rf in verified_flags
        ]
