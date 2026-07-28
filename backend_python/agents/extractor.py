"""
KawalKontrak.ai — Agent 1: Extractor
======================================

Dua mode penggunaan:
  1. Sebagai ADK Agent (`extractor_agent`) — untuk integrasi Google ADK.
  2. Sebagai fungsi `extract_clauses()` — dipanggil oleh pipeline tools.
"""

import logging
from tenacity import retry, stop_after_attempt, wait_exponential

from google import adk, genai
from google.genai import types
from pydantic import BaseModel, Field

from backend_python.config import MODEL_LITE
from backend_python.models import ExtractedClause
from backend_python.utils import locale_instruction

logger = logging.getLogger(__name__)

MAX_CONTRACT_CHARS = 80_000  # ~20.000 kata, cukup untuk kontrak besar

_SYSTEM_PROMPT = """
Anda adalah seorang paralegal spesialis ketenagakerjaan Indonesia yang sangat jeli.
Tugas Anda: membaca Surat Perjanjian Kerja (SPK) dan mengurai setiap klausul/pasal menjadi data terstruktur.

Panduan Ekstraksi:
1. Ekstrak setiap klausul secara verbatim (kutipan asli dari teks). JANGAN ringkas atau ubah kalimatnya.
2. Tentukan topik utama klausul. Gunakan salah satu label berikut (atau gabungan jika relevan):
   "Pengupahan", "Waktu Kerja", "Status Kerja (PKWT/PKWTT)", "Lembur", "Cuti",
   "PHK / Pemutusan Kontrak", "PKWT / Masa Percobaan", "Nonkompetisi", atau topik lain yang sesuai.
3. Set 'perlu_perhatian_ekstra' = true jika klausul terlihat memberatkan pekerja atau patut dicermati.
   Field ini HANYA dipakai sebagai penanda urutan tampilan di UI — bukan untuk menggugurkan klausul dari
   pemrosesan lebih lanjut. SEMUA klausul wajib diekstrak lengkap.
4. JANGAN menganalisis pasal atau memberikan saran hukum — tugas Anda murni ekstraksi.

PRIORITAS EKSTRAKSI (WAJIB):
Klausul mengenai (1) Pengupahan/Upah, (2) Waktu Kerja/Lembur, dan
(3) Status Kerja (PKWT/PKWTT/masa percobaan) WAJIB diekstrak lengkap dan akurat,
bahkan jika itu berarti memberikan perhatian lebih sedikit pada topik yang kurang kritis
(mis. seragam kerja, tata tertib kantor) jika ruang konteks terbatas.
""".strip()

# ── ADK Agent Definition ─────────────────────────────────────────────────────

class ExtractorInput(BaseModel):
    contract_text: str = Field(description="Raw contract text")
    locale: str = Field(default="en")

class ExtractorOutput(BaseModel):
    clauses: list[ExtractedClause]

extractor_agent = adk.Agent(
    name="extractor",
    model=MODEL_LITE,
    instruction=_SYSTEM_PROMPT,
    input_schema=ExtractorInput,
    output_schema=ExtractorOutput,
)

# ── Fungsi Pipeline (dipanggil oleh tools.py) ────────────────────────────────

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), reraise=True)
async def extract_clauses(
    contract_text: str,
    client: genai.Client,
    locale: str = "en",
) -> list[ExtractedClause]:
    """
    Mengurai teks kontrak menjadi daftar klausul terstruktur (async).

    Args:
        contract_text: Teks kontrak yang sudah dipotong ke MAX_CONTRACT_CHARS.
        client:        Instance Google GenAI client.
        locale:        Bahasa nilai output.

    Returns:
        Daftar ExtractedClause. List kosong jika gagal.
    """
    logger.info(f"Extractor: Memproses kontrak {len(contract_text)} karakter...")
    try:
        response = await client.aio.models.generate_content(
            model=MODEL_LITE,
            contents=(
                f"Ekstrak semua klausul dari Surat Perjanjian Kerja berikut:\n\n"
                f"{contract_text}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT + locale_instruction(locale),
                temperature=0.1,  # Deterministik untuk ekstraksi faktual
                response_mime_type="application/json",
                response_schema=list[ExtractedClause],
            ),
        )
        clauses: list[ExtractedClause] = response.parsed  # type: ignore[assignment]
        logger.info(f"Extractor: {len(clauses)} klausul berhasil diekstrak.")
        return clauses
    except Exception as exc:
        logger.error(f"Extractor: Gagal — {exc}", exc_info=True)
        return []
