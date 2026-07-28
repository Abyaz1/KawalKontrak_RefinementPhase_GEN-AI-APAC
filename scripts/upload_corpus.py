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
    python scripts/upload_corpus.py [path_pdf_or_folder_or_gcs_uri] [--mode store|file|vertex-rag]

Default path: Law_file
Jika menggunakan mode vertex-rag, argumen pertama bisa berupa GCS URI, misal: gs://bucket-anda/Law_file/
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
_DEFAULT_PDF = os.path.join(_ROOT, "Law_file")


def upload_to_store(client: genai.Client, path: str) -> None:
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

    files_to_upload = []
    if os.path.isdir(path):
        files_to_upload = [os.path.join(path, f) for f in os.listdir(path) if f.lower().endswith(".pdf")]
    else:
        files_to_upload = [path]

    if not files_to_upload:
        print("ERROR: Tidak ada file PDF yang ditemukan untuk diunggah.", file=sys.stderr)
        sys.exit(1)

    print(f"2/3 Mengunggah & mengindeks {len(files_to_upload)} file PDF...")
    
    for f in files_to_upload:
        file_name = os.path.basename(f)
        print(f"    Mengunggah {file_name}...")
        operation = client.file_search_stores.upload_to_file_search_store(
            file=f,
            file_search_store_name=store.name,
            config={"display_name": file_name},
        )

        # Tunggu proses indexing selesai
        while not operation.done:
            print("    ... masih mengindeks, tunggu 5 detik")
            time.sleep(5)
            operation = client.operations.get(operation)
            
        print(f"    -> Selesai mengindeks {file_name}")

    print("3/3 Semua indexing selesai!")
    print()
    print("=" * 64)
    print("BERHASIL. Tambahkan baris berikut ke backend_python/.env:")
    print()
    print(f"    GEMINI_FILE_SEARCH_STORE={store.name}")
    print()
    print("Store ini PERSISTEN (tidak kedaluwarsa 48 jam seperti File API).")
    print("=" * 64)


def upload_as_file(client: genai.Client, path: str) -> None:
    """Mode file: Gemini File API (kedaluwarsa 48 jam — dev only)."""
    files_to_upload = []
    if os.path.isdir(path):
        files_to_upload = [os.path.join(path, f) for f in os.listdir(path) if f.lower().endswith(".pdf")]
    else:
        files_to_upload = [path]

    if not files_to_upload:
        print("ERROR: Tidak ada file PDF yang ditemukan untuk diunggah.", file=sys.stderr)
        sys.exit(1)

    print(f"Mengunggah {len(files_to_upload)} file PDF ke Gemini File API...")
    
    uris = []
    for f in files_to_upload:
        file_name = os.path.basename(f)
        print(f"    Mengunggah {file_name}...")
        uploaded = client.files.upload(
            file=f,
            config={"display_name": file_name},
        )
        uris.append(uploaded.uri)
        
    print()
    print("=" * 64)
    print("BERHASIL. File berhasil diunggah (Mode File API tidak ideal untuk >1 file).")
    print("URI:")
    for uri in uris:
        print(f"    {uri}")
    print()
    print("PERINGATAN: file ini KEDALUWARSA 48 JAM setelah upload.")
    print("Disarankan pakai mode store (default) untuk banyak file.")
    print("=" * 64)


def upload_to_vertex_rag(project: str, location: str, gcs_uri: str) -> None:
    """Mode vertex-rag: Membuat RagCorpus di Vertex AI menggunakan vertexai SDK."""
    try:
        import vertexai
        from vertexai.preview import rag
    except ImportError:
        print("ERROR: Pastikan 'google-cloud-aiplatform' terinstal. (pip install google-cloud-aiplatform)", file=sys.stderr)
        sys.exit(1)

    print(f"Menginisialisasi Vertex AI (Project: {project}, Location: {location})...")
    vertexai.init(project=project, location=location)

    print("1/2 Membuat Vertex AI RagCorpus...")
    try:
        corpus = rag.create_corpus(display_name="kawalkontrak-uu-ketenagakerjaan")
        print(f"    RagCorpus berhasil dibuat: {corpus.name}")
    except Exception as e:
        print(f"ERROR gagal membuat RagCorpus: {e}", file=sys.stderr)
        sys.exit(1)

    print("2/2 Mengimpor file PDF dari GCS...")
    
    if not gcs_uri.startswith("gs://"):
        # Jika user tidak memasukkan gs://, kita beri contoh bucket default,
        # tapi idealnya user harus memasukkan gs:// URI mereka.
        print(f"    Peringatan: {gcs_uri} bukan GCS URI yang valid.")
        gcs_uri = "gs://kawalkontrak-corpus-bucket/Law_file/"
        print(f"    Menggunakan default GCS URI: {gcs_uri}")

    print(f"    Mengimpor dari: {gcs_uri}")
    print("    (Proses ini mungkin memakan waktu beberapa menit...)")
    try:
        response = rag.import_files(
            corpus_name=corpus.name,
            paths=[gcs_uri],
            chunk_size=1024,
            chunk_overlap=200,
        )
        print(f"    Selesai! Diimpor: {response.imported_rag_files_count} file.")
        if getattr(response, 'failed_rag_files_count', 0) > 0:
            print(f"    PERINGATAN: {response.failed_rag_files_count} file gagal diimpor.")
    except Exception as e:
        print(f"ERROR gagal mengimpor file: {e}", file=sys.stderr)
        print("Pastikan Anda sudah mengunggah folder Law_file ke GCS (gs://kawalkontrak-corpus-bucket/).")
        sys.exit(1)

    print()
    print("=" * 64)
    print("BERHASIL. Tambahkan baris berikut ke backend_python/.env:")
    print()
    print(f"    VERTEX_RAG_CORPUS={corpus.name}")
    print("    GOOGLE_GENAI_USE_VERTEXAI=true")
    print("=" * 64)

def main() -> None:
    parser = argparse.ArgumentParser(description="Upload corpus regulasi ke Gemini")
    parser.add_argument(
        "path",
        nargs="?",
        default=_DEFAULT_PDF,
        help=f"Path PDF atau Folder corpus (default: {_DEFAULT_PDF})",
    )
    parser.add_argument(
        "--mode",
        choices=["store", "file", "vertex-rag"],
        default="store",
        help="store = File Search Store (default); file = File API; vertex-rag = Vertex AI RAG",
    )
    args = parser.parse_args()

    if args.mode != "vertex-rag" and not _API_KEY:
        print(
            "ERROR: GEMINI_API_KEY tidak ditemukan.\n"
            "Isi backend_python/.env terlebih dahulu (lihat .env.example).",
            file=sys.stderr,
        )
        sys.exit(1)

    if not args.path.startswith("gs://") and not os.path.exists(args.path):
        print(f"ERROR: Path tidak ditemukan: {args.path}", file=sys.stderr)
        sys.exit(1)

    if args.mode == "vertex-rag":
        project = os.getenv("GOOGLE_CLOUD_PROJECT")
        location = os.getenv("GOOGLE_CLOUD_LOCATION", "asia-southeast1")
        if not project:
            print("ERROR: GOOGLE_CLOUD_PROJECT wajib di-set untuk mode vertex-rag.", file=sys.stderr)
            sys.exit(1)
        upload_to_vertex_rag(project, location, args.path)
    else:
        client = genai.Client(api_key=_API_KEY)
        if args.mode == "store":
            upload_to_store(client, args.path)
        else:
            upload_as_file(client, args.path)


if __name__ == "__main__":
    main()
