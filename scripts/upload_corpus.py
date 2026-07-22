"""
KawalKontrak.ai — Upload Corpus Regulasi ke Gemini
====================================================

Mengunggah PDF corpus UU Ketenagakerjaan (UU 6/2023, PP 35/2021,
PP 36/2021) agar bisa dirujuk pipeline sebagai sumber kebenaran RAG.

Dua mode:

  1. store (DEFAULT — direkomendasikan)
     Membuat Gemini File Search Store: managed RAG persisten dengan
     chunking + embedding + retrieval otomatis. TIDAK kedaluwarsa.
     Hasil: nama store → isi ke GEMINI_FILE_SEARCH_STORE di
     backend_python/.env.

  2. file (fallback dev)
     Upload biasa ke Gemini File API. PERINGATAN: file KEDALUWARSA
     48 JAM setelah upload — hanya untuk uji cepat.
     Hasil: URI file → isi ke GEMINI_CORPUS_FILE_URI.

Cara pakai (dari root proyek, setelah mengisi backend_python/.env):
    python scripts/upload_corpus.py [path_pdf] [--mode store|file]

Default path_pdf: docs/UU_Ketenagakerjaan_Embedding.pdf
"""

import argparse
import os
import sys
import time

from dotenv import load_dotenv
from google import genai

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Muat env dari backend_python/.env, fallback .env.local
load_dotenv(os.path.join(_ROOT, "backend_python", ".env"))
load_dotenv(os.path.join(_ROOT, ".env.local"))

_API_KEY = os.getenv("GEMINI_API_KEY")
_DEFAULT_PDF = os.path.join(_ROOT, "docs", "UU_Ketenagakerjaan_Embedding.pdf")


def upload_to_store(client: genai.Client, pdf_path: str) -> None:
    """Mode store: File Search Store persisten (managed RAG)."""
    if not hasattr(client, "file_search_stores"):
        print(
            "ERROR: Versi SDK google-genai terpasang belum mendukung File "
            "Search Store.\nJalankan: pip install -U google-genai",
            file=sys.stderr,
        )
        sys.exit(1)

    print("1/3 Membuat File Search Store...")
    store = client.file_search_stores.create(
        config={"display_name": "kawalkontrak-uu-ketenagakerjaan"}
    )
    print(f"    Store dibuat: {store.name}")

    print(f"2/3 Mengunggah & mengindeks {os.path.basename(pdf_path)}...")
    operation = client.file_search_stores.upload_to_file_search_store(
        file=pdf_path,
        file_search_store_name=store.name,
        config={"display_name": "UU_Ketenagakerjaan_Corpus"},
    )

    # Tunggu proses indexing selesai (biasanya < 1 menit untuk 1 PDF)
    while not operation.done:
        print("    ... masih mengindeks, tunggu 5 detik")
        time.sleep(5)
        operation = client.operations.get(operation)

    print("3/3 Indexing selesai!")
    print()
    print("=" * 64)
    print("BERHASIL. Tambahkan baris berikut ke backend_python/.env:")
    print()
    print(f"    GEMINI_FILE_SEARCH_STORE={store.name}")
    print()
    print("Store ini PERSISTEN (tidak kedaluwarsa 48 jam seperti File API).")
    print("=" * 64)


def upload_as_file(client: genai.Client, pdf_path: str) -> None:
    """Mode file: Gemini File API (kedaluwarsa 48 jam — dev only)."""
    print(f"Mengunggah {os.path.basename(pdf_path)} ke Gemini File API...")
    uploaded = client.files.upload(
        file=pdf_path,
        config={"display_name": "UU_Ketenagakerjaan_Corpus"},
    )
    print()
    print("=" * 64)
    print("BERHASIL. Tambahkan baris berikut ke backend_python/.env:")
    print()
    print(f"    GEMINI_CORPUS_FILE_URI={uploaded.uri}")
    print()
    print("PERINGATAN: file ini KEDALUWARSA 48 JAM setelah upload.")
    print("Untuk produksi/demo, pakai mode store (default):")
    print("    python scripts/upload_corpus.py")
    print("=" * 64)


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload corpus regulasi ke Gemini")
    parser.add_argument(
        "pdf_path",
        nargs="?",
        default=_DEFAULT_PDF,
        help=f"Path PDF corpus (default: {_DEFAULT_PDF})",
    )
    parser.add_argument(
        "--mode",
        choices=["store", "file"],
        default="store",
        help="store = File Search Store persisten (default); file = File API 48 jam",
    )
    args = parser.parse_args()

    if not _API_KEY:
        print(
            "ERROR: GEMINI_API_KEY tidak ditemukan.\n"
            "Isi backend_python/.env terlebih dahulu (lihat .env.example).",
            file=sys.stderr,
        )
        sys.exit(1)

    if not os.path.isfile(args.pdf_path):
        print(f"ERROR: File PDF tidak ditemukan: {args.pdf_path}", file=sys.stderr)
        sys.exit(1)

    client = genai.Client(api_key=_API_KEY)

    if args.mode == "store":
        upload_to_store(client, args.pdf_path)
    else:
        upload_as_file(client, args.pdf_path)


if __name__ == "__main__":
    main()
