"""
KawalKontrak.ai — Agent 3: Risk Grader
========================================

Tanggung Jawab:
    Mengevaluasi risiko dari setiap klausul yang sudah dicocokkan
    dengan hukum. Agen ini bertugas:
    1. Membuat red flag dengan penjelasan bahasa awam dan analogi sederhana.
    2. Mengidentifikasi klausul yang sudah aman (safe clauses).
    3. Memberikan estimasi awal risk_level (akan di-override deterministik
       oleh orchestrator berdasarkan severity tertinggi — lihat E1b).
    4. Menyusun ringkasan kontrak dan langkah aksi untuk pekerja.

    Catatan: klausul berstatus TIDAK_DITEMUKAN TIDAK diproses di sini —
    orchestrator memasukkannya ke daftar 'klausul_tinjauan' agar tetap
    terlihat pengguna (FR-05), bukan hilang diam-diam.

Model:  KK_MODEL_CORE (default gemini-2.5-flash — reasoning mendalam)
Input:  list[MatchedClause]
Output: RiskGraderOutput
"""

import json
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

from google import genai
from google.genai import types

from backend_python.config import MODEL_CORE
from backend_python.models import MatchedClause, RiskGraderOutput
from backend_python.utils import locale_instruction

logger = logging.getLogger(__name__)

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
3. Abaikan klausul berstatus TIDAK_DITEMUKAN — klausul tersebut sudah
   ditangani terpisah sebagai "perlu tinjauan manusia".
4. Tentukan level risiko keseluruhan kontrak (estimasi awal — sistem akan menghitung ulang secara deterministik).
5. Susun ringkasan kontrak dan daftar langkah aksi berurutan untuk pekerja.

RUBRIK SEVERITY — WAJIB DIIKUTI (menentukan tingkat keparahan tiap red flag):

| status_hukum | Kondisi Klausul                                                                 | Severity yang Ditetapkan          |
|---|---|---|
| MELANGGAR    | Menyangkut hak dasar: upah/gaji, pesangon, kompensasi PKWT, PHK sepihak        | CRITICAL                          |
| MELANGGAR    | Menyangkut hal prosedural/administratif (format, bahasa kontrak, dll.)          | HIGH atau MEDIUM                  |
| AMBIGU       | Berpotensi merugikan tapi membutuhkan konteks tambahan                          | MEDIUM (DILARANG CRITICAL — status belum pasti melanggar) |
| AMBIGU       | Klausul wajib (kompensasi, pengupahan, jam kerja) tidak disebutkan sama sekali  | HIGH atau MEDIUM                  |

ATURAN KONSISTENSI SEVERITY (WAJIB):
- Klausul MELANGGAR tidak boleh diberi severity lebih rendah dari klausul AMBIGU sejenis.
- Klausul AMBIGU DILARANG diberi severity CRITICAL — status belum pasti melanggar.
- Jika ragu antara dua severity yang berdekatan, pilih yang lebih tinggi untuk klausul yang memengaruhi upah/status kerja pekerja.

Prinsip penulisan:
- Gunakan kata 'Anda' saat merujuk pekerja, bukan 'kamu' atau 'karyawan'.
- Hindari jargon hukum — jelaskan dalam kalimat sederhana.
- Tone: profesional namun hangat, waspada namun tidak menakut-nakuti.
""".strip()


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), reraise=True)
async def grade_risks(
    matched_clauses: list[MatchedClause],
    client: genai.Client,
    locale: str = "en",
) -> RiskGraderOutput | None:
    """
    Menilai risiko seluruh klausul dan menyusun laporan analisis lengkap (async).

    Args:
        matched_clauses: Daftar klausul + status hukum dari Legal Matcher.
        client:          Instance Google GenAI client.
        locale:          Bahasa nilai output.

    Returns:
        RiskGraderOutput, atau None jika terjadi error fatal.
        Catatan: field `risk_level` di output ini adalah estimasi model —
        orchestrator akan menggantinya dengan nilai deterministik (E1b fix).
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
        response = await client.aio.models.generate_content(
            model=MODEL_CORE,
            contents=(
                f"Berikut adalah daftar klausul kontrak beserta status hukum "
                f"dan referensi peraturannya. Evaluasi dan buat laporan risiko:\n\n"
                f"{payload}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT + locale_instruction(locale),
                temperature=0.3,  # Sedikit lebih tinggi agar penjelasan lebih natural
                response_mime_type="application/json",
                response_schema=RiskGraderOutput,
            ),
        )

        result: RiskGraderOutput = response.parsed  # type: ignore[assignment]

        logger.info(
            f"Risk Grader: Selesai — {len(result.red_flags)} red flags, "
            f"{len(result.klausul_aman)} klausul aman, "
            f"level risiko model: {result.risk_level.value} "
            f"(akan di-override deterministik oleh orchestrator)."
        )
        return result

    except Exception as exc:
        logger.error(f"Risk Grader: Gagal — {exc}", exc_info=True)
        return None
