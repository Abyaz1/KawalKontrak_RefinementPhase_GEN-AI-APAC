"""
KawalKontrak.ai — Agent 0: Transcriber (Vision)
=================================================

Tanggung Jawab:
    Mentranskripsi foto/scan kontrak kerja menjadi teks verbatim
    menggunakan kemampuan vision native Gemini. Memenuhi PRD FR-01:
    "Mendukung copy-paste teks, upload PDF, DAN upload foto/scan kontrak."

    Hasil transkripsi dikembalikan ke frontend agar pengguna dapat
    MEMERIKSA dan mengoreksi teks sebelum dianalisis — lebih aman
    daripada langsung menganalisis hasil OCR yang mungkin salah baca.

Model:  KK_MODEL_CORE (default gemini-2.5-flash — multimodal)
Input:  bytes gambar + MIME type
Output: teks kontrak + peringatan kualitas (jika ada)
"""

import logging

from google import genai
from google.genai import types

from backend_python.config import MODEL_CORE

logger = logging.getLogger(__name__)

# Penanda yang diminta ke model bila ada bagian tidak terbaca —
# dipakai untuk membangun peringatan kualitas foto ke pengguna.
_UNREADABLE_MARK = "[TIDAK TERBACA]"

_SYSTEM_PROMPT = f"""
Anda adalah mesin transkripsi dokumen yang sangat teliti.
Tugas: salin SELURUH teks yang terlihat pada foto/scan Surat Perjanjian
Kerja ini secara VERBATIM (apa adanya), termasuk nomor pasal dan format.

Aturan:
- JANGAN menganalisis, meringkas, menerjemahkan, atau menambah komentar.
- Pertahankan struktur baris/pasal semirip mungkin dengan dokumen asli.
- Jika ada bagian yang buram/terpotong dan tidak terbaca, tulis penanda
  {_UNREADABLE_MARK} di posisi tersebut.
- Jika gambar sama sekali bukan dokumen kontrak atau tidak ada teks yang
  terbaca, balas persis dengan: KOSONG
""".strip()


async def transcribe_contract_image(
    image_bytes: bytes,
    mime_type: str,
    client: genai.Client,
    locale: str = "en",
) -> tuple[str, str | None]:
    """
    Mentranskripsi gambar kontrak menjadi teks (async).

    Args:
        image_bytes: Isi biner file gambar.
        mime_type:   image/jpeg, image/png, atau image/webp.
        client:      Instance Google GenAI client.
        locale:      Bahasa pesan peringatan.

    Returns:
        Tuple (teks transkripsi, peringatan atau None).
        Teks kosong jika gambar tidak bisa ditranskripsi.
    """
    logger.info(
        f"Transcriber: Mentranskripsi gambar {mime_type} ({len(image_bytes)} bytes)..."
    )

    try:
        response = await client.aio.models.generate_content(
            model=MODEL_CORE,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                        types.Part(text="Transkripsikan dokumen pada gambar ini."),
                    ],
                )
            ],
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                temperature=0.0,  # Transkripsi harus deterministik penuh
            ),
        )

        text = (response.text or "").strip()

        if not text or text.upper() == "KOSONG":
            logger.warning("Transcriber: Tidak ada teks yang bisa ditranskripsi.")
            return "", None

        warning: str | None = None
        if _UNREADABLE_MARK in text:
            warning = (
                "Sebagian teks tidak terbaca dari foto. Periksa hasil transkripsi "
                "dan lengkapi bagian yang bertanda [TIDAK TERBACA] sebelum analisis."
                if locale == "id"
                else "Some text could not be read from the photo. Review the "
                "transcription and fill in the parts marked [TIDAK TERBACA] "
                "before analyzing."
            )

        logger.info(f"Transcriber: Berhasil — {len(text)} karakter.")
        return text, warning

    except Exception as exc:
        logger.error(f"Transcriber: Gagal — {exc}", exc_info=True)
        return "", None
