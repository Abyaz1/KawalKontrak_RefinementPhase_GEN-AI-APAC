import { redFlagPatterns } from './red-flag-patterns';
import { AnalysisResult, RedFlag, SafeClause, RiskLevel } from '@/types';

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

  if (normalizedText.includes('bpjs')) {
    safeClauses.push({
      pasal_kontrak: 'Perusahaan mendaftarkan pekerja pada program BPJS.',
      terjemahan: 'Anda terdaftar dalam asuransi kesehatan dan ketenagakerjaan resmi.',
      referensi: [],
    });
  }

  const hash = await hashText(contractText);

  return {
    id: `AN-${Date.now()}`,
    status: 'completed',
    created_at: new Date().toISOString(),
    contract_hash: hash,
    red_flags: redFlags,
    klausul_aman: safeClauses,
    klausul_tinjauan: [],
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
