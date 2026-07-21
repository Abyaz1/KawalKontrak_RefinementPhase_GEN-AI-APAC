"""
KawalKontrak.ai — Agent 3: Risk Grader
========================================

Tanggung Jawab:
    Mengevaluasi risiko dari setiap klausul yang sudah dicocokkan
    dengan hukum. Agen ini bertugas:
    1. Membuat red flag dengan penjelasan bahasa awam dan analogi sederhana.
    2. Mengidentifikasi klausul yang sudah aman (safe clauses).
    3. Menentukan level risiko keseluruhan kontrak (CRITICAL/HIGH/MEDIUM/LOW).
    4. Menyusun ringkasan kontrak dan langkah aksi untuk pekerja.

Model: gemini-2.5-flash (reasoning mendalam)
Input:  list[MatchedClause]
Output: RiskGraderOutput
"""

import json
import logging
from google import genai
from google.genai import types

from backend_python.models import MatchedClause, RiskGraderOutput

logger = logging.getLogger(__name__)

_MODEL = "gemini-2.5-flash"

_SYSTEM_PROMPT = """
Anda adalah Asisten Hukum Ketenagakerjaan yang empatik dan komunikatif.
Target pembaca Anda adalah pekerja awam yang tidak berlatar belakang hukum.

Tugas Anda:
1. Untuk setiap klausul berstatus MELANGGAR atau AMBIGU:
   - Buat 'red flag' dengan bahasa yang jelas dan mudah dipahami.
   - Sertakan analogi kehidupan sehari-hari yang relatable.
   - Beri rekomendasi negosiasi yang praktis dan realistis.
2. Untuk setiap klausul berstatus SESUAI:
   - Buat 'klausul aman' dengan penjelasan singkat kenapa ini baik.
3. Tentukan level risiko keseluruhan kontrak berdasarkan temuan.
4. Susun ringkasan kontrak dan daftar langkah aksi berurutan untuk pekerja.

Prinsip penulisan:
- Gunakan kata 'Anda' saat merujuk pekerja, bukan 'kamu' atau 'karyawan'.
- Hindari jargon hukum — jelaskan dalam kalimat sederhana.
- Tone: profesional namun hangat, waspada namun tidak menakut-nakuti.
""".strip()


def grade_risks(
    matched_clauses: list[MatchedClause],
    client: genai.Client,
) -> RiskGraderOutput | None:
    """
    Menilai risiko seluruh klausul dan menyusun laporan analisis lengkap.

    Args:
        matched_clauses: Daftar klausul beserta status hukum dan referensi UU
                         dari Legal Matcher Agent.
        client:          Instance Google GenAI client.

    Returns:
        RiskGraderOutput yang berisi red flags, safe clauses, ringkasan,
        dan risk level. Mengembalikan None jika terjadi error fatal.
    """
    if not matched_clauses:
        logger.warning("Risk Grader: Daftar klausul kosong, tidak ada yang dinilai.")
        return None

    logger.info(f"Risk Grader: Menilai {len(matched_clauses)} klausul...")

    # Serialisasi matched_clauses ke JSON yang mudah dibaca model
    payload = json.dumps(
        [c.model_dump() for c in matched_clauses],
        ensure_ascii=False,
        indent=2,
    )

    try:
        response = client.models.generate_content(
            model=_MODEL,
            contents=(
                f"Berikut adalah daftar klausul kontrak beserta status hukum "
                f"dan referensi peraturannya. Evaluasi dan buat laporan risiko:\n\n"
                f"{payload}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                temperature=0.3,  # Sedikit lebih tinggi agar penjelasan lebih natural
                response_mime_type="application/json",
                response_schema=RiskGraderOutput,
            ),
        )

        result: RiskGraderOutput = response.parsed  # type: ignore[assignment]

        logger.info(
            f"Risk Grader: Selesai — {len(result.red_flags)} red flags, "
            f"{len(result.klausul_aman)} klausul aman, "
            f"level risiko: {result.risk_level.value}."
        )
        return result

    except Exception as exc:
        logger.error(f"Risk Grader: Gagal — {exc}", exc_info=True)
        return None
