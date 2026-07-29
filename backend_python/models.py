"""
KawalKontrak.ai — Shared Pydantic Data Models
==============================================

Modul ini mendefinisikan seluruh *schema* data yang digunakan
oleh agen AI dan API FastAPI. Dengan menggunakan Pydantic:
  1. Gemini API akan menghasilkan JSON yang secara otomatis
     divalidasi sesuai struktur ini (Structured Output).
  2. FastAPI akan menggunakan model ini untuk validasi input
     dan serialisasi output secara otomatis.
  3. Tipe data konsisten dari ujung ke ujung (AI → API → UI).

Hierarki:
  PasalReference  →  dipakai oleh RedFlag & SafeClause
  ExtractedClause →  output Extractor Agent
  MatchedClause   →  output Legal Matcher Agent
  RiskGraderOutput→  output Risk Grader Agent
  AnalysisResult  →  output final yang dikirim ke Next.js
"""

from __future__ import annotations

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────────────────

class Severity(str, Enum):
    """Tingkat keparahan sebuah red flag."""
    CRITICAL = "CRITICAL"
    HIGH     = "HIGH"
    MEDIUM   = "MEDIUM"
    LOW      = "LOW"


class RiskLevel(str, Enum):
    """Tingkat risiko keseluruhan kontrak."""
    CRITICAL = "CRITICAL"
    HIGH     = "HIGH"
    MEDIUM   = "MEDIUM"
    LOW      = "LOW"


class LegalStatus(str, Enum):
    """Status hukum sebuah klausul hasil pencocokan."""
    SESUAI          = "SESUAI"
    MELANGGAR       = "MELANGGAR"
    TIDAK_DITEMUKAN = "TIDAK_DITEMUKAN"
    AMBIGU          = "AMBIGU"


class ConfidenceLevel(str, Enum):
    """
    Tingkat keyakinan model terhadap penilaian sebuah klausul.

    HIGH   — status hukum & sitasi pasal jelas dan eksplisit.
    MEDIUM — indikasi cukup kuat, tapi ada nuansa/konteks yang bisa
             menggeser kesimpulan (mis. tergantung definisi lain di kontrak).
    LOW    — bahasa klausul terdengar berpotensi bermasalah secara linguistik
             (mis. sepihak, tidak jelas, memberatkan pekerja) TETAPI tidak ada
             pasal yang bisa disitasi dengan pasti dari korpus. Tetap WAJIB
             ditampilkan ke pengguna — bukan alasan untuk didrop.
    """
    HIGH   = "HIGH"
    MEDIUM = "MEDIUM"
    LOW    = "LOW"


# ── Sub-models (dipakai oleh beberapa model utama) ─────────────────────────

class PasalReference(BaseModel):
    """Referensi pasal peraturan perundang-undangan Indonesia."""
    peraturan: str = Field(
        description="Nama peraturan, contoh: 'UU No. 6 Tahun 2023'"
    )
    pasal: str = Field(
        description="Nomor pasal, contoh: '156'"
    )
    judul: str = Field(
        description="Judul atau pokok bahasan pasal"
    )
    ketentuan_relevan: str = Field(
        description="Kutipan isi pasal yang relevan dengan klausul kontrak"
    )


# ── Agent 1: Extractor Output ───────────────────────────────────────────────

class ExtractedClause(BaseModel):
    """
    Satu klausul yang berhasil diekstrak dari teks kontrak mentah.
    Dihasilkan oleh: ExtractorAgent

    Catatan: `perlu_perhatian_ekstra` adalah sinyal tampilan UI (urutan/penanda)
    saja — bukan gerbang pemrosesan. Seluruh klausul tetap dikirim ke Legal
    Matcher terlepas dari nilai field ini.
    """
    klausul: str = Field(
        description="Kutipan asli teks klausul dari kontrak"
    )
    topik: str = Field(
        description=(
            "Topik utama klausul ini, contoh: 'Pengupahan', "
            "'Waktu Kerja', 'PHK', 'PKWT', 'Lembur', dll."
        )
    )
    perlu_perhatian_ekstra: bool = Field(
        description=(
            "True jika klausul terlihat memberatkan pihak pekerja atau "
            "perlu dicermati lebih lanjut — dipakai HANYA sebagai penanda "
            "urutan tampilan di UI, bukan untuk menggugurkan klausul dari "
            "pemrosesan lebih lanjut."
        )
    )


# ── Agent 2: Legal Matcher Output ──────────────────────────────────────────

class LegalMatchResult(BaseModel):
    """
    Hasil pencocokan satu klausul dengan peraturan perundang-undangan.
    Dihasilkan oleh: LegalMatcherAgent
    """
    klausul_id: int = Field(
        description="Indeks klausul (0-based) dari daftar input"
    )
    status_hukum: LegalStatus = Field(
        description="Status hukum: SESUAI, MELANGGAR, TIDAK_DITEMUKAN, atau AMBIGU"
    )
    confidence: ConfidenceLevel = Field(
        default=ConfidenceLevel.MEDIUM,
        description=(
            "Keyakinan model atas status_hukum di atas. WAJIB diisi LOW jika "
            "klausul terdengar berpotensi bermasalah secara bahasa namun tidak "
            "ada pasal yang bisa disitasi dengan pasti — bukan alasan untuk "
            "menandai TIDAK_DITEMUKAN dan berhenti di situ."
        )
    )
    referensi_uu: list[PasalReference] = Field(
        default_factory=list,
        description="Pasal-pasal UU yang relevan dengan klausul ini"
    )


class MatchedClause(BaseModel):
    """
    Klausul lengkap beserta hasil pencocokan hukumnya.
    Merupakan gabungan ExtractedClause + LegalMatchResult.
    """
    klausul: str
    topik: str
    status_hukum: LegalStatus
    confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM
    referensi_uu: list[PasalReference]


# ── Agent 3: Risk Grader Output ────────────────────────────────────────────

class RedFlagDraft(BaseModel):
    """
    Draft red flag yang belum melalui verifikasi.
    Dihasilkan oleh: RiskGraderAgent
    """
    flag_id: str = Field(
        description="ID unik, contoh: 'RF_001'"
    )
    severity: Severity
    confidence: ConfidenceLevel = Field(
        default=ConfidenceLevel.MEDIUM,
        description=(
            "Keyakinan atas temuan ini. LOW berarti indikasi berasal dari "
            "bahasa klausul semata (berpotensi sepihak/tidak jelas/memberatkan) "
            "tanpa sitasi pasal yang pasti — tetap ditampilkan ke pengguna "
            "sebagai 'perlu ditinjau lebih lanjut', bukan dihilangkan."
        )
    )
    pasal_kontrak: str = Field(
        description="Kutipan asli klausul bermasalah dari kontrak"
    )
    potensi_masalah: str = Field(
        description="Penjelasan mengapa berbahaya, dalam bahasa awam yang mudah dipahami"
    )
    referensi_uu: list[PasalReference]
    rekomendasi_negosiasi: str = Field(
        description="Saran konkret untuk menegosiasikan atau mengubah klausul ini"
    )
    analogi_sederhana: str = Field(
        description="Analogi kehidupan sehari-hari untuk membantu pemahaman"
    )


class SafeClause(BaseModel):
    """Klausul yang telah dikonfirmasi sesuai dengan hukum ketenagakerjaan."""
    pasal_kontrak: str = Field(
        description="Kutipan asli klausul yang aman dari kontrak"
    )
    confidence: ConfidenceLevel = Field(
        default=ConfidenceLevel.MEDIUM,
        description="Keyakinan bahwa klausul ini benar-benar sesuai/aman."
    )
    terjemahan: str = Field(
        description="Penjelasan dalam bahasa awam mengapa klausul ini aman"
    )
    referensi: list[PasalReference] = Field(
        default_factory=list,
        description="Pasal-pasal UU yang mengkonfirmasi klausul ini sudah benar"
    )


class ContractSummary(BaseModel):
    """Ringkasan singkat hasil analisis kontrak secara keseluruhan."""
    jenis: str = Field(
        description="Jenis kontrak: PKWT, PKWTT, Freelance, Magang, dll."
    )
    durasi: Optional[str] = Field(
        default=None,
        description="Durasi kontrak jika disebutkan, contoh: '12 bulan'"
    )
    gaji_bulanan: Optional[str] = Field(
        default=None,
        description="Gaji jika disebutkan, format: 'Rp X.XXX.XXX'"
    )
    status: str = Field(
        description="Status keseluruhan: TIDAK AMAN / BERISIKO / CUKUP AMAN / AMAN"
    )
    harus_diubah: list[str] = Field(
        description="Poin-poin yang WAJIB diubah karena melanggar hukum"
    )
    sebaiknya_diubah: list[str] = Field(
        description="Poin-poin yang direkomendasikan untuk diubah"
    )


class RiskGraderOutput(BaseModel):
    """Output lengkap dari Risk Grader Agent sebelum verifikasi.

    Catatan: field `risk_level` di sini dihasilkan model sebagai estimasi awal,
    namun akan DIGANTIKAN oleh nilai deterministik yang dihitung di orchestrator
    berdasarkan severity tertinggi dari red_flags yang terverifikasi.
    """
    red_flags: list[RedFlagDraft]
    klausul_aman: list[SafeClause]
    ringkasan: ContractSummary
    risk_level: RiskLevel
    langkah_berikutnya: list[str] = Field(
        description="Daftar langkah aksi konkret berurutan yang harus dilakukan pekerja"
    )


# ── Agent 4: Verifier Output ───────────────────────────────────────────────

class VerificationResult(BaseModel):
    """Hasil verifikasi satu red flag oleh Verifier Agent."""
    flag_id: str
    is_valid: bool = Field(
        description=(
            "True jika referensi UU benar-benar relevan dan logis. "
            "False jika referensi tidak sesuai atau kemungkinan halusinasi."
        )
    )
    reason: Optional[str] = Field(
        default=None,
        description="Alasan jika flag dinyatakan tidak valid"
    )


# ── Agent 5: Negotiator Output ─────────────────────────────────────────────

class NegotiationTemplate(BaseModel):
    """Template email negosiasi untuk satu red flag."""
    flag_id: str
    email_template: str = Field(
        description=(
            "Draf email profesional dan sopan kepada HRD untuk menegosiasikan "
            "klausul bermasalah ini"
        )
    )


# ── Final Result (output ke Next.js) ───────────────────────────────────────

class RedFlag(BaseModel):
    """
    Red flag final yang sudah terverifikasi dan dilengkapi template email.
    Ini adalah bentuk akhir yang dikirim ke frontend Next.js.
    """
    flag_id: str
    severity: Severity
    confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM
    pasal_kontrak: str
    potensi_masalah: str
    referensi_uu: list[PasalReference]
    rekomendasi_negosiasi: str
    analogi_sederhana: str
    email_template: str = ""


class ReviewClause(BaseModel):
    """
    Klausul yang TIDAK bisa dinilai otomatis dan butuh tinjauan manusia.
    Memenuhi PRD FR-05: jika sistem tidak menemukan dasar hukum yang
    relevan, ia WAJIB menyatakan "tidak ditemukan referensi pasti" —
    bukan menghilangkan klausul tersebut secara diam-diam.

    Catatan (perbaikan distribusi flag ambigu): item di sini SEKARANG
    membawa `severity` dan `confidence` sendiri (bukan lagi bucket tanpa
    tingkatan), supaya klausul "bahasa mencurigakan tapi sitasi lemah"
    tidak terlihat setara dengan klausul yang murni di luar cakupan korpus.
    """
    pasal_kontrak: str = Field(
        description="Kutipan asli klausul dari kontrak"
    )
    topik: str = Field(
        description="Topik utama klausul"
    )
    alasan: str = Field(
        description="Mengapa klausul ini butuh tinjauan manusia"
    )
    status: LegalStatus = Field(
        description="TIDAK_DITEMUKAN atau AMBIGU"
    )
    severity: Optional[Severity] = Field(
        default=None,
        description=(
            "Perkiraan tingkat keparahan jika ternyata benar melanggar "
            "(None jika benar-benar tidak ada indikasi apapun)."
        )
    )
    confidence: ConfidenceLevel = Field(
        default=ConfidenceLevel.LOW,
        description="Keyakinan atas status di atas — biasanya LOW untuk item di bucket ini."
    )


class AnalysisMetadata(BaseModel):
    """Metadata teknis tentang bagaimana analisis diproduksi."""
    engine: str
    rag_enabled: bool
    model: str
    # Mode akses corpus: 'file_search' | 'file_data' | 'none'
    rag_mode: str = "none"
    # True jika hasil diambil dari cache (kontrak identik pernah dianalisis)
    cached: bool = False
    # Status Verifier: 'passed' (audit berjalan) | 'skipped' (tidak ada flag)
    # | 'failed_open' (audit error — flag diloloskan tanpa filter, lihat UI)
    verifier_status: str = "skipped"
    # True jika teks kontrak melebihi batas dan dipotong sebelum dianalisis
    truncated: bool = False
    # Bahasa output yang diminta
    locale: str = "en"


class AnalysisResult(BaseModel):
    """
    Hasil analisis kontrak lengkap yang dikirimkan oleh API ke frontend.
    Struktur ini harus kompatibel dengan TypeScript interface di Next.js.
    """
    id: str
    status: str
    created_at: str
    contract_hash: str
    red_flags: list[RedFlag]
    klausul_aman: list[SafeClause]
    # Klausul yang butuh tinjauan manusia (FR-05: "tidak ditemukan
    # referensi pasti" harus dinyatakan eksplisit, bukan disembunyikan)
    klausul_tinjauan: list[ReviewClause] = Field(default_factory=list)
    ringkasan: ContractSummary
    risk_level: RiskLevel
    langkah_berikutnya: list[str]
    disclaimer: str
    metadata: AnalysisMetadata


# ── API Request/Response ───────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    """Body request yang diterima oleh endpoint POST /analyze."""
    contractText: str = Field(
        min_length=50,
        max_length=1_000_000,
        description="Teks lengkap kontrak kerja yang akan dianalisis"
    )
    region: str = Field(
        default="",
        description="Wilayah kerja untuk validasi UMK, contoh: 'Jakarta'"
    )
    locale: str = Field(
        default="en",
        description="Bahasa output AI: 'id' (Indonesia) atau 'en' (English)"
    )


class TranscribeRequest(BaseModel):
    """Body request POST /transcribe — transkripsi foto kontrak (FR-01)."""
    imageBase64: str = Field(
        min_length=100,
        max_length=15_000_000,  # ~11 MB biner setelah decode base64
        description="Isi file gambar kontrak dalam encoding base64 (tanpa prefix data URI)"
    )
    mimeType: str = Field(
        description="MIME type gambar: image/jpeg, image/png, atau image/webp"
    )
    locale: str = Field(
        default="en",
        description="Bahasa pesan peringatan: 'id' atau 'en'"
    )


class TranscribeResponse(BaseModel):
    """Respons POST /transcribe."""
    text: str = Field(
        description="Teks kontrak hasil transkripsi (verbatim)"
    )
    warning: Optional[str] = Field(
        default=None,
        description="Peringatan kualitas foto jika ada bagian yang tidak terbaca"
    )
