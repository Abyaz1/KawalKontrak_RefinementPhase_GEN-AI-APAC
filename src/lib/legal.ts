/**
 * KawalKontrak.ai: modul hukum dan persetujuan.
 *
 * Satu sumber kebenaran untuk:
 *   1. identitas penyelenggara & kontak yang dicantumkan di dokumen hukum;
 *   2. versi + tanggal berlaku dokumen hukum;
 *   3. teks gerbang persetujuan (dwibahasa);
 *   4. pencatatan persetujuan pengguna di localStorage.
 *
 * PENTING: naikkan LEGAL_VERSION setiap kali teks persetujuan berubah secara
 * material. Persetujuan lama otomatis batal dan pengguna diminta menyetujui
 * ulang sebelum boleh memakai halaman analisis.
 */

import type { Locale } from '@/lib/i18n';

/* ------------------------------------------------------------------ */
/*  1. Identitas & versi                                              */
/* ------------------------------------------------------------------ */

/** Versi dokumen hukum. Format: TAHUN.BULAN-REVISI. */
export const LEGAL_VERSION = '2026.07-1';

/** Tanggal berlaku dokumen, per bahasa. */
export const EFFECTIVE_DATE: Record<Locale, string> = {
  id: '29 Juli 2026',
  en: '29 July 2026',
};

/** Bahasa yang berlaku bila terjadi perbedaan penafsiran (UU 24/2009). */
export const PREVAILING_LOCALE: Locale = 'id';

/**
 * Identitas penyelenggara. Diisi lewat variabel lingkungan agar tidak perlu
 * mengubah kode saat badan hukum resmi terbentuk.
 *
 * `contactEmail` dan `privacyEmail` sengaja kosong: KawalKontrak.ai belum
 * memiliki kotak surel yang benar-benar dipantau, dan mencantumkan alamat yang
 * tidak aktif di dokumen hukum sama saja dengan menjanjikan kanal yang tidak
 * ada. Begitu alamatnya aktif, isi NEXT_PUBLIC_LEGAL_EMAIL dan
 * NEXT_PUBLIC_PRIVACY_EMAIL; halaman hukum otomatis menampilkannya kembali.
 */
export const LEGAL_CONFIG = {
  entity: process.env.NEXT_PUBLIC_LEGAL_ENTITY ?? 'Tim KawalKontrak.ai',
  address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS ?? 'Indonesia',
  contactEmail: process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? '',
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? '',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://kawalkontrak.ai',
} as const;

/* ------------------------------------------------------------------ */
/*  2. Pencatatan persetujuan                                         */
/* ------------------------------------------------------------------ */

export const CONSENT_STORAGE_KEY = 'kk-consent';

export interface ConsentRecord {
  /** Versi dokumen yang disetujui. Inilah yang membuat persetujuan terbukti. */
  version: string;
  /** ISO 8601 */
  acceptedAt: string;
  locale: Locale;
  ageConfirmed: boolean;
  method: 'modal-checkbox';
}

export function readConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConsentRecord) : null;
  } catch {
    return null;
  }
}

export function writeConsent(locale: Locale, ageConfirmed: boolean): ConsentRecord {
  const record: ConsentRecord = {
    version: LEGAL_VERSION,
    acceptedAt: new Date().toISOString(),
    locale,
    ageConfirmed,
    method: 'modal-checkbox',
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* mode privat / storage penuh: persetujuan tetap berlaku untuk sesi ini */
  }
  return record;
}

export function clearConsent(): void {
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* diabaikan */
  }
}

/** Persetujuan hanya sah bila versinya sama dengan versi dokumen saat ini. */
export function hasCurrentConsent(): boolean {
  const c = readConsent();
  return !!c && c.version === LEGAL_VERSION && c.ageConfirmed;
}

/* ------------------------------------------------------------------ */
/*  3. Teks gerbang persetujuan (dwibahasa)                           */
/* ------------------------------------------------------------------ */

export interface ConsentPoint {
  heading: string;
  body: string;
}

export interface ConsentCopy {
  eyebrow: string;
  title: string;
  intro: string;
  points: ConsentPoint[];
  footnote: string;
  checkboxTerms: string;
  checkboxTermsSuffix: string;
  checkboxAge: string;
  checkboxAgeHint: string;
  buttonAccept: string;
  buttonDecline: string;
  declineHint: string;
  requiredHint: string;
  versionLabel: string;
  docs: { disclaimer: string; syarat: string; privasi: string };
}

const consentId: ConsentCopy = {
  eyebrow: 'Persetujuan penggunaan',
  title: 'Sebelum Anda mulai: 6 hal yang wajib Anda tahu',
  intro:
    'Halaman ini akan mengirim isi kontrak Anda untuk dianalisis oleh AI. Bacalah enam poin berikut sampai selesai, lalu pilih apakah Anda ingin melanjutkan.',
  points: [
    {
      heading: 'Ini AI, dan AI bisa salah.',
      body: 'KawalKontrak.ai dijalankan oleh kecerdasan buatan. Ia bisa salah baca, salah kutip pasal, atau salah menilai. Hasilnya adalah dugaan, bukan kepastian.',
    },
    {
      heading: 'Ini bukan nasihat hukum, dan kami bukan pengacara Anda.',
      body: 'Tidak ada hubungan advokat–klien yang terbentuk. Tidak ada satu pun advokat berizin yang memeriksa sistem ini maupun hasil analisisnya.',
    },
    {
      heading: 'Isi kontrak Anda dikirim ke Google.',
      body: 'Untuk dianalisis, teks kontrak Anda (dan foto, jika Anda memotret) dikirim ke layanan AI Google (Gemini) yang server-nya berada di luar Indonesia. Kontrak kerja biasanya memuat nama, alamat, NIK, dan gaji Anda. Sensor dulu data yang tidak perlu, terutama NIK dan nomor rekening.',
    },
    {
      heading: 'Hasil "aman" belum tentu berarti kontrak Anda aman.',
      body: 'Kami bisa melewatkan masalah. Kami juga tidak menandai perlindungan yang seharusnya ada tetapi tidak tertulis di kontrak (misalnya BPJS atau cuti). Dan jika analisis gagal di tengah jalan, layar bisa tetap menampilkan "Risiko Rendah, 0 temuan". Nol temuan bukan berarti kontrak Anda bersih.',
    },
    {
      heading: 'Kami juga bisa menuduh yang tidak salah.',
      body: 'Sebagian hal yang kami tandai merah mungkin sebenarnya sah menurut konteks yang tidak kami lihat. Jangan menuduh perusahaan Anda melanggar hukum hanya berdasarkan layar ini.',
    },
    {
      heading: 'Jangan ambil keputusan yang tidak bisa ditarik kembali dari sini saja.',
      body: 'Jangan menandatangani, menolak, mengundurkan diri, mengajukan pengaduan, atau menuntut siapa pun hanya berdasarkan hasil analisis ini. Untuk keputusan sungguhan, temui manusia: LBH terdekat, Dinas Ketenagakerjaan kabupaten/kota Anda, serikat pekerja Anda, atau advokat.',
    },
  ],
  footnote:
    'Layanan ini gratis, tanpa iklan, dan tidak menjual data Anda. Teks mentah kontrak Anda tidak pernah kami simpan di basis data mana pun.',
  checkboxTerms:
    'Saya mengerti bahwa ini adalah alat bantu AI, bukan nasihat hukum, bahwa hasilnya bisa salah atau tidak lengkap, dan bahwa isi kontrak saya akan dikirim ke layanan AI Google untuk diproses. Saya menyetujui',
  checkboxTermsSuffix: '.',
  checkboxAge: 'Saya berusia 18 tahun atau lebih.',
  checkboxAgeHint:
    'Jika Anda berusia 15–17 tahun, Anda hanya boleh menggunakan layanan ini bersama orang tua atau wali Anda.',
  buttonAccept: 'Saya mengerti, lanjutkan analisis',
  buttonDecline: 'Saya tidak setuju',
  declineHint: 'Anda akan diarahkan kembali ke halaman utama.',
  requiredHint: 'Centang kedua pernyataan di atas untuk melanjutkan.',
  versionLabel: 'Versi dokumen',
  docs: {
    disclaimer: 'Disclaimer',
    syarat: 'Syarat Layanan',
    privasi: 'Kebijakan Privasi',
  },
};

const consentEn: ConsentCopy = {
  eyebrow: 'Terms of use',
  title: 'Before you start: 6 things you must know',
  intro:
    'This page will send the contents of your contract to an AI for analysis. Please read all six points below, then choose whether you want to continue.',
  points: [
    {
      heading: 'This is AI, and AI makes mistakes.',
      body: 'KawalKontrak.ai is powered by artificial intelligence. It can misread your contract, cite the wrong article, or reach the wrong conclusion. Its output is a suggestion, not a determination.',
    },
    {
      heading: 'This is not legal advice, and we are not your lawyer.',
      body: 'No advocate–client relationship is created. No licensed Indonesian advocate has reviewed this system or its output.',
    },
    {
      heading: 'Your contract is sent to Google.',
      body: "To analyse it, the text of your contract (and your photograph, if you take one) is transmitted to Google's Gemini AI service, hosted outside Indonesia. Employment contracts usually contain your name, address, national ID number, and salary. Redact what you don't need to send, especially your ID and bank account numbers.",
    },
    {
      heading: 'A "clean" result does not mean your contract is safe.',
      body: 'We can miss problems. We also do not flag protections that ought to be in your contract but are absent (such as social security enrolment or leave). And if the analysis fails midway, the screen may still show "Low Risk, 0 findings". Zero findings does not mean your contract is clean.',
    },
    {
      heading: 'We can also accuse the innocent.',
      body: 'Some of what we flag in red may in fact be lawful in a context we cannot see. Do not accuse your employer of breaking the law on the strength of this screen alone.',
    },
    {
      heading: 'Do not make an irreversible decision based on this alone.',
      body: 'Do not sign, refuse, resign, file a complaint, or sue anyone solely on the basis of this analysis. For real decisions, see a human: your nearest legal aid institute (LBH), your district Manpower Office, your trade union, or an advocate.',
    },
  ],
  footnote:
    'This service is free, ad-free, and does not sell your data. The raw text of your contract is never stored in any database.',
  checkboxTerms:
    "I understand this is an AI tool, not legal advice, that its output may be wrong or incomplete, and that my contract will be sent to Google's AI service for processing. I agree to the",
  checkboxTermsSuffix: '.',
  checkboxAge: 'I am 18 years of age or older.',
  checkboxAgeHint:
    'If you are 15–17, you may use this service only together with your parent or guardian.',
  buttonAccept: 'I understand, continue',
  buttonDecline: 'I do not agree',
  declineHint: 'You will be returned to the home page.',
  requiredHint: 'Tick both statements above to continue.',
  versionLabel: 'Document version',
  docs: {
    disclaimer: 'Disclaimer',
    syarat: 'Terms of Service',
    privasi: 'Privacy Policy',
  },
};

const consentCopies: Record<Locale, ConsentCopy> = { id: consentId, en: consentEn };

export function consentCopy(locale: Locale): ConsentCopy {
  return consentCopies[locale];
}
