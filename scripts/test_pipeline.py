"""
KawalKontrak.ai — End-to-End Pipeline Test
============================================
Script ini menguji pipeline Python secara langsung (tanpa server HTTP),
cocok untuk debugging cepat saat pengembangan.

Cara menjalankan:
    python scripts/test_pipeline.py
"""

import sys
import os
import json
import logging

# Tambahkan root proyek ke path agar dapat mengimpor package
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Muat variabel lingkungan dari .env
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend_python", ".env"))

from backend_python.orchestrator import run_analysis_pipeline

# Konfigurasi logging supaya output lebih informatif
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)

# ── Contoh kontrak kerja dengan 3 pelanggaran jelas ───────────────────────────
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

api_key = os.getenv("GEMINI_API_KEY")
corpus_uri = os.getenv("GEMINI_CORPUS_FILE_URI")

if not api_key or not corpus_uri:
    print("ERROR: GEMINI_API_KEY atau GEMINI_CORPUS_FILE_URI tidak ditemukan.")
    sys.exit(1)

print("\n" + "="*60)
print("Memulai test pipeline multi-agent Python...")
print("="*60 + "\n")

result = run_analysis_pipeline(
    contract_text=SAMPLE_CONTRACT,
    api_key=api_key,
    corpus_file_uri=corpus_uri,
    locale="id",
)

print("\n" + "="*60)
print("HASIL ANALISIS:")
print("="*60)
print(json.dumps(result.model_dump(), ensure_ascii=False, indent=2))
