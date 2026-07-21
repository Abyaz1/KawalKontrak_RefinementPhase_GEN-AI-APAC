"""
KawalKontrak.ai — Agent 4: Verifier
======================================

Tanggung Jawab:
    Melakukan "self-critique" atau audit independen terhadap red flags
    yang dihasilkan Risk Grader. Agen ini menjadi penjaga gerbang
    anti-halusinasi: memastikan setiap sitasi hukum benar-benar logis
    dan konsisten dengan klausul yang dikritisi.

    Red flag yang dinyatakan tidak valid akan difilter dan TIDAK masuk
    ke dalam hasil akhir yang dilihat pengguna.

Model: gemini-2.5-flash
Input:  list[RedFlagDraft]
Output: list[RedFlagDraft] (hanya yang valid)
"""

import json
import logging
from google import genai
from google.genai import types

from backend_python.models import RedFlagDraft, VerificationResult

logger = logging.getLogger(__name__)

_MODEL = "gemini-2.5-flash"

_SYSTEM_PROMPT = """
Anda adalah Senior Legal Auditor dengan pengalaman 20 tahun di bidang
hukum ketenagakerjaan Indonesia. Tugas Anda adalah mengaudit temuan
hukum yang dibuat oleh analis junior.

Untuk setiap red flag yang diberikan, periksa:
1. Apakah 'pasal_kontrak' memang bermasalah dari perspektif hukum?
2. Apakah 'referensi_uu' yang dikutip benar-benar relevan dan logis
   dengan masalah yang ditemukan?
3. Apakah 'ketentuan_relevan' dalam referensi memang bertentangan
   dengan klausul kontrak tersebut?

Tandai is_valid = False jika:
- Referensi UU tidak relevan dengan masalah yang diklaim.
- Pasal yang dikutip tidak ada atau tidak sesuai konteks.
- Klausul kontrak sebenarnya tidak melanggar hukum (false positive).

Sertakan 'reason' yang jelas jika is_valid = False.
""".strip()


def verify_red_flags(
    red_flags: list[RedFlagDraft],
    client: genai.Client,
) -> list[RedFlagDraft]:
    """
    Memverifikasi validitas setiap red flag untuk mencegah halusinasi.

    Agen ini mengimplementasikan prinsip "Guardrail Anti-Halusinasi"
    yang tercantum dalam PRD FR-05.

    Args:
        red_flags: Daftar draft red flag dari Risk Grader Agent.
        client:    Instance Google GenAI client.

    Returns:
        Daftar RedFlagDraft yang sudah difilter, hanya berisi temuan
        yang valid. Jika terjadi error, mengembalikan daftar asli
        (fail-open agar pipeline tidak berhenti total).
    """
    if not red_flags:
        logger.info("Verifier: Tidak ada red flag untuk diverifikasi.")
        return []

    logger.info(f"Verifier: Mengaudit {len(red_flags)} red flags...")

    # Kirim red flags sebagai JSON untuk diaudit
    payload = json.dumps(
        [rf.model_dump() for rf in red_flags],
        ensure_ascii=False,
        indent=2,
    )

    try:
        response = client.models.generate_content(
            model=_MODEL,
            contents=(
                f"Audit temuan red flag hukum berikut:\n\n{payload}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                temperature=0.1,  # Sangat deterministik untuk audit
                response_mime_type="application/json",
                response_schema=list[VerificationResult],
            ),
        )

        verifications: list[VerificationResult] = response.parsed  # type: ignore[assignment]

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

        # Filter: hanya loloskan red flag yang dinyatakan valid
        # Jika suatu flag_id tidak ada dalam hasil verifikasi (edge case),
        # anggap valid agar tidak ada data yang hilang secara diam-diam.
        valid_flags = [
            rf for rf in red_flags
            if validity_map.get(rf.flag_id, True)
        ]

        logger.info(
            f"Verifier: {len(valid_flags)}/{len(red_flags)} red flags lolos verifikasi."
        )
        return valid_flags

    except Exception as exc:
        # Fail-open: jika verifikasi gagal, kembalikan semua flag asli
        # agar analisis tetap berjalan (lebih baik hasil dengan false positive
        # daripada tidak ada hasil sama sekali)
        logger.error(
            f"Verifier: Gagal, mengembalikan semua red flags tanpa filter — {exc}",
            exc_info=True,
        )
        return red_flags
