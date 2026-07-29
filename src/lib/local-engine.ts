import { redFlagPatterns } from './red-flag-patterns';
import { AnalysisResult, RedFlag, SafeClause, ReviewClause, RiskLevel } from '@/types';

/**
 * Pola klausul AMAN untuk fallback lokal (tanpa AI).
 *
 * CATATAN AUDIT: sebelumnya hanya ada 1 pola ('bpjs') dibanding 20+ pola
 * red flag — asimetri ini membuat fallback lokal (aktif saat backend Python
 * tidak terjangkau/timeout) TERLIHAT seolah kontrak jarang punya klausul
 * aman, padahal itu keterbatasan detektor, bukan isi kontrak. Semua entri di
 * bawah diberi confidence 'MEDIUM' (bukan 'HIGH') karena keyword-matching
 * sederhana tidak memverifikasi konteks kalimat secara penuh.
 */
const localSafeClausePatterns: {
  keyword: string;
  terjemahan: string;
  referensi: SafeClause['referensi'];
}[] = [
  {
    keyword: 'bpjs',
    terjemahan: 'Anda terdaftar dalam asuransi kesehatan dan ketenagakerjaan resmi.',
    referensi: [],
  },
  {
    keyword: 'uang kompensasi',
    terjemahan: 'Kontrak menyebutkan hak kompensasi PKWT saat kontrak berakhir, sesuai ketentuan.',
    referensi: [
      { peraturan: 'PP 35/2021', pasal: 'Pasal 15-16', judul: 'Kompensasi PKWT', ketentuan_relevan: 'Kompensasi diberikan saat PKWT berakhir.' },
    ],
  },
  {
    keyword: 'cuti tahunan',
    terjemahan: 'Kontrak mencantumkan hak cuti tahunan pekerja.',
    referensi: [
      { peraturan: 'UU 6/2023 (Cipta Kerja)', pasal: 'Pasal 79', judul: 'Waktu Istirahat dan Cuti', ketentuan_relevan: 'Pekerja berhak atas cuti tahunan setelah masa kerja 12 bulan.' },
    ],
  },
  {
    keyword: 'upah lembur',
    terjemahan: 'Kontrak menyebutkan pembayaran upah lembur, sesuai kewajiban pengusaha.',
    referensi: [
      { peraturan: 'UU 6/2023 (Cipta Kerja)', pasal: 'Pasal 78', judul: 'Upah Kerja Lembur', ketentuan_relevan: 'Pengusaha wajib membayar upah lembur bagi pekerja yang bekerja melebihi jam kerja.' },
    ],
  },
  {
    keyword: '40 jam',
    terjemahan: 'Jam kerja dalam kontrak sesuai batas maksimal 40 jam/minggu yang diatur undang-undang.',
    referensi: [
      { peraturan: 'UU 6/2023 (Cipta Kerja)', pasal: 'Pasal 77', judul: 'Waktu Kerja', ketentuan_relevan: 'Waktu kerja paling lama 40 jam dalam 1 minggu.' },
    ],
  },
];

export const DISCLAIMER_TEXT_ID =
  'Analisis ini dihasilkan oleh Kecerdasan Buatan (AI) untuk tujuan literasi dan edukasi hukum, BUKAN nasihat hukum yang mengikat. Untuk sengketa serius, hubungi LBH Indonesia (021-315-1405), konsultan hukum profesional, atau serikat pekerja di organisasi Anda.';

export const DISCLAIMER_TEXT_EN =
  'This analysis is AI-generated for educational and legal literacy purposes, NOT binding legal advice. For serious disputes, contact LBH Indonesia (021-315-1405), a professional legal consultant, or the labor union in your organization.';

async function hashText(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function calculateRiskLevel(redFlags: RedFlag[]): RiskLevel {
  if (redFlags.some((f) => f.severity === 'CRITICAL')) return 'CRITICAL';
  if (redFlags.some((f) => f.severity === 'HIGH')) return 'HIGH';
  if (redFlags.some((f) => f.severity === 'MEDIUM')) return 'MEDIUM';
  return 'LOW';
}

export async function analyzeContractLocal(contractText: string, locale: string = 'id'): Promise<AnalysisResult> {
  const normalizedText = contractText.toLowerCase();

  const redFlags: RedFlag[] = [];
  const safeClauses: SafeClause[] = [];

  for (const pattern of redFlagPatterns) {
    let matched = false;
    for (const keyword of pattern.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matched = true;
        break;
      }
    }

    if (!matched && pattern.regex) {
      const regex = new RegExp(pattern.regex, 'i');
      if (regex.test(contractText)) {
        matched = true;
      }
    }

    if (matched) {
      // Cari kalimat/baris kontrak yang memicu pattern
      const lines = contractText.split('\n');
      let pasal_kontrak = 'Klausul terkait ditemukan dalam dokumen.';
      for (const line of lines) {
        if (pattern.keywords.some((k) => line.toLowerCase().includes(k.toLowerCase()))) {
          pasal_kontrak = line.trim();
          break;
        }
      }

      // Pola bisa menyimpan template sebagai objek {subject, body} —
      // API selalu mengirim string agar kontrak tipe frontend sederhana.
      const template =
        typeof pattern.email_template === 'string'
          ? pattern.email_template
          : `Subject: ${pattern.email_template.subject}\n\n${pattern.email_template.body}`;

      redFlags.push({
        flag_id: pattern.id,
        severity: pattern.severity,
        // Keyword/regex match = bahasa eksplisit ditemukan persis, jadi confidence
        // tinggi bahwa POLA cocok — tapi tetap tandai MEDIUM karena mesin ini tidak
        // memverifikasi konteks kalimat penuh seperti model AI (mis. negasi/pengecualian
        // di kalimat lain bisa terlewat).
        confidence: 'MEDIUM',
        pasal_kontrak,
        potensi_masalah: pattern.why_dangerous,
        referensi_uu: pattern.pasal_references,
        rekomendasi_negosiasi: pattern.recommendation,
        analogi_sederhana: pattern.analogy,
        email_template: template,
      });
    }
  }

  const risk_level = calculateRiskLevel(redFlags);

  for (const safePattern of localSafeClausePatterns) {
    if (normalizedText.includes(safePattern.keyword)) {
      safeClauses.push({
        pasal_kontrak: `Klausul terkait "${safePattern.keyword}" ditemukan dalam dokumen.`,
        confidence: 'MEDIUM',
        terjemahan: safePattern.terjemahan,
        referensi: safePattern.referensi,
      });
    }
  }

  // Fallback lokal ini TIDAK melakukan pemeriksaan pasal-demi-pasal seperti
  // pipeline AI penuh — jadi ia tidak bisa menjamin semua klausul kontrak
  // sudah tertangkap. Beri tahu pengguna secara eksplisit (bukan diam-diam
  // menyembunyikan keterbatasan), konsisten dengan prinsip FR-05.
  const reviewClauses: ReviewClause[] = [
    {
      pasal_kontrak: '(Seluruh dokumen)',
      topik: 'Keterbatasan mesin cadangan',
      alasan:
        locale === 'en'
          ? 'This result was produced by a simplified local pattern-matching engine (the full AI pipeline was unreachable). It only checks for known keyword patterns and cannot guarantee every clause — safe or problematic — was caught. Consider re-running the analysis, or have a human/legal aid review the full contract.'
          : 'Hasil ini dibuat oleh mesin pencocokan pola sederhana (pipeline AI penuh sedang tidak terjangkau). Mesin ini hanya memeriksa pola kata kunci yang sudah dikenal dan tidak bisa menjamin semua klausul — aman maupun bermasalah — tertangkap. Sebaiknya coba analisis ulang, atau minta tinjauan manusia/LBH untuk kontrak lengkap ini.',
      status: 'AMBIGU',
      confidence: 'LOW',
    },
  ];

  const hash = await hashText(contractText);

  return {
    id: `AN-${Date.now()}`,
    status: 'completed',
    created_at: new Date().toISOString(),
    contract_hash: hash,
    red_flags: redFlags,
    klausul_aman: safeClauses,
    klausul_tinjauan: reviewClauses,
    ringkasan: {
      jenis: 'Kontrak Kerja (Umum)',
      status: risk_level === 'LOW' ? 'Aman' : 'Membutuhkan Peninjauan',
      harus_diubah: redFlags
        .filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH')
        .map((f) => f.potensi_masalah),
      sebaiknya_diubah: redFlags.filter((f) => f.severity === 'MEDIUM').map((f) => f.potensi_masalah),
    },
    risk_level,
    langkah_berikutnya: [
      'Pelajari red flags yang ditemukan secara mendetail.',
      'Gunakan template email yang disediakan untuk memulai negosiasi dengan HRD.',
      'Jangan tandatangani kontrak sebelum pasal-pasal bermasalah diubah sesuai kesepakatan.',
    ],
    disclaimer: locale === 'en' ? DISCLAIMER_TEXT_EN : DISCLAIMER_TEXT_ID,
    metadata: {
      engine: 'local-pattern-matching',
      rag_enabled: false,
      model: null,
    },
  };
}
