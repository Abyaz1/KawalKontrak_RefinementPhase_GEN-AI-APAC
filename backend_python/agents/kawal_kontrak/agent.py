"""
KawalKontrak.ai — Google ADK Agent Definition
===============================================

File ini adalah entry point yang dikenali oleh Google ADK CLI.
Ketika dijalankan dengan:
    adk api_server backend_python/agents/kawal_kontrak

ADK akan otomatis mengekspos endpoint REST:
    POST /run         → non-streaming
    POST /run_sse     → Server-Sent Events (SSE) streaming

Arsitektur:
    • `root_agent` adalah orchestrator LLM yang menerima instruksi
      dari pengguna, lalu memanggil `pipeline_tool` (yang berisi
      seluruh pipeline multi-agent KawalKontrak: Extractor →
      Legal Matcher → Risk Grader → Verifier ∥ Negotiator).
    • Hasil akhir dikembalikan sebagai JSON terstruktur.

Cara test lokal:
    adk web backend_python/agents/kawal_kontrak
    # Lalu buka http://localhost:8001 di browser
"""

from google import adk

from backend_python.agents.kawal_kontrak.tools import pipeline_tool
from backend_python.config import MODEL_CORE

# ── System Instruction Orchestrator ──────────────────────────────────────────

_ORCHESTRATOR_INSTRUCTION = """
Anda adalah KawalKontrak.ai — asisten analisis kontrak kerja Indonesia.

Ketika pengguna mengirimkan teks kontrak kerja, Anda HARUS:
1. Memanggil tool `_run_full_pipeline` dengan parameter:
   - contract_text: teks kontrak yang diberikan
   - locale: "id" (default) atau "en" sesuai permintaan pengguna

2. Mengembalikan hasil dari tool tersebut PERSIS sebagaimana adanya
   dalam format JSON. JANGAN menambahkan interpretasi, komentar,
   atau ringkasan — frontend Next.js yang akan menampilkan hasilnya.

Anda TIDAK perlu menjelaskan proses analisis kepada pengguna.
Cukup jalankan pipeline dan kembalikan hasilnya.
""".strip()

# ── ADK Agent (Root Agent / Entry Point) ─────────────────────────────────────

root_agent = adk.Agent(
    name="kawal_kontrak",
    model=MODEL_CORE,
    instruction=_ORCHESTRATOR_INSTRUCTION,
    tools=[pipeline_tool],
    description=(
        "Agen analisis kontrak kerja Indonesia. Menerima teks kontrak, "
        "menjalankan pipeline multi-agent (Extractor → Legal Matcher → "
        "Risk Grader → Verifier ∥ Negotiator), dan mengembalikan "
        "laporan risiko terstruktur beserta rekomendasi negosiasi."
    ),
)
