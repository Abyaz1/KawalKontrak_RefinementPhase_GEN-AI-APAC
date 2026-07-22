"""
KawalKontrak.ai — End-to-End Pipeline Test (Live)
===================================================
Script ini menguji pipeline Python secara langsung (tanpa server HTTP),
cocok untuk debugging cepat saat pengembangan. Membutuhkan
backend_python/.env yang sudah terisi (API key + corpus).

Cara menjalankan (dari root proyek):
    python scripts/test_pipeline.py

Untuk unit test otomatis (tanpa API key), lihat backend_python/tests/.
"""

import asyncio
import json
import logging
import os
import sys

# Tambahkan root proyek ke path agar dapat mengimpor package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_python import config  # noqa: E402  (memuat .env saat import)
from backend_python.orchestrator import run_analysis_pipeline_stream  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)

# ── Contoh kontrak kerja dengan beberapa pelanggaran jelas ────────────────────
SAMPLE_CONTRACT = """
SURAT PERJANJIAN KERJA WAKTU TERTENTU (PKWT)

Pasal 1 — Identitas
Pihak Pertama (PT Maju Mundur) dan Pihak Kedua (Pekerja)

Pasal 2 — Pengupahan
Pihak Kedua akan menerima gaji sebesar Rp 2.500.000 per bulan.
Gaji dapat dipotong oleh Pihak Pertama apabila dinilai kinerja kurang memuaskan.

Pasal 3 — Waktu Kerja
Pekerja wajib bekerja selama 10 jam per hari tanpa hitungan lembur.
Tidak ada hari libur mingguan yang dijamin.

Pasal 4 — Pemutusan Hubungan Kerja
Pihak Pertama dapat melakukan PHK kapan saja tanpa memberikan
uang pesangon, uang penghargaan masa kerja, atau kompensasi apapun.

Pasal 5 — Hak Normatif
Perusahaan mendaftarkan pekerja pada program BPJS Kesehatan dan BPJS Ketenagakerjaan.
"""


async def main() -> None:
    problems = config.validate_config()
    if problems:
        for p in problems:
            print(f"ERROR: {p}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print(f"Memulai test pipeline (corpus mode: {config.corpus_mode()})...")
    print("=" * 60 + "\n")

    final_result = None
    async for event in run_analysis_pipeline_stream(
        contract_text=SAMPLE_CONTRACT,
        api_key=config.GEMINI_API_KEY,
        locale="id",
    ):
        if event["type"] == "stage":
            detail = event.get("detail", {})
            print(f"  [{event['status']:>7}] {event['stage']} {detail if detail else ''}")
        elif event["type"] == "result":
            final_result = event["data"]

    print("\n" + "=" * 60)
    print("HASIL ANALISIS:")
    print("=" * 60)
    print(json.dumps(final_result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
