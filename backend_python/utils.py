"""
KawalKontrak.ai — Utilitas Bersama Backend
============================================

Berisi helper kecil yang dipakai lintas agen:
  - parse_json_response : parsing JSON yang tahan terhadap output model
                          yang dibungkus code fence / teks tambahan.
  - locale_instruction  : instruksi bahasa output untuk system prompt
                          (memenuhi NFR bilingual — output AI mengikuti
                          bahasa yang dipilih pengguna, bukan hanya UI).
"""

import json
import re
from typing import Any

_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL)


def parse_json_response(text: str | None) -> Any:
    """
    Mem-parsing teks respons model menjadi objek Python.

    Diperlukan karena saat memakai tool (mis. File Search), Gemini tidak
    mendukung structured output (response_schema), sehingga JSON diminta
    lewat prompt dan bisa saja dibungkus markdown fence atau diberi
    kalimat pengantar.

    Raises:
        ValueError: jika tidak ada JSON valid yang bisa ditemukan.
    """
    if not text:
        raise ValueError("Respons model kosong — tidak ada JSON untuk diparse.")

    # 1. Coba langsung
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Coba isi di dalam code fence ```json ... ```
    fence = _FENCE_RE.search(text)
    if fence:
        try:
            return json.loads(fence.group(1))
        except json.JSONDecodeError:
            pass

    # 3. Coba substring dari kurung pembuka pertama sampai penutup terakhir
    for opener, closer in (("[", "]"), ("{", "}")):
        start = text.find(opener)
        end = text.rfind(closer)
        if start != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                continue

    raise ValueError(f"Tidak menemukan JSON valid dalam respons model: {text[:200]}...")


def locale_instruction(locale: str) -> str:
    """
    Instruksi bahasa yang ditambahkan ke system prompt setiap agen.
    Nama field JSON tetap (kontrak API), hanya NILAI field yang berubah bahasa.
    """
    if locale == "en":
        return (
            "\n\nOPERATIONAL PRINCIPLE: Assume the user might only input a partial snippet of the contract. "
            "You are STRICTLY FORBIDDEN from flagging a missing standard clause (e.g., BPJS, leave) as a red flag "
            "just because it is not present in the snippet. Only issue a red flag if the text explicitly states "
            "something illegal."
            "\n\nOUTPUT LANGUAGE: Write ALL user-facing text values "
            "(explanations, danger descriptions, recommendations, analogies, "
            "summaries, next steps, and email templates) in ENGLISH. "
            "Keep JSON field names exactly as specified. Indonesian legal "
            "article names (e.g. 'UU No. 6 Tahun 2023 Pasal 81') stay in "
            "their official Indonesian form."
        )
    return (
        "\n\nPRINSIP OPERASIONAL: Asumsikan pengguna mungkin hanya memasukkan sebagian/potongan teks kontrak. "
        "DILARANG KERAS memberikan red flag (indikasi masalah) karena sebuah klausul standar (misal BPJS, cuti) "
        "tidak tercantum di teks. Hanya berikan red flag jika teks secara eksplisit tertulis melanggar hukum."
        "\n\nBAHASA OUTPUT: Tulis seluruh nilai teks yang dibaca pengguna "
        "dalam BAHASA INDONESIA. Nama field JSON tetap sesuai spesifikasi."
    )
