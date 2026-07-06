'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// ── Supported Languages ──
export type Locale = 'id' | 'en';

// ── Dictionary type ──
export interface Dictionary {
  // Nav
  nav_features: string;
  nav_how_it_works: string;
  nav_faq: string;
  nav_start_analysis: string;
  nav_home: string;
  nav_analysis: string;

  // Hero
  hero_badge: string;
  hero_title_1: string;
  hero_title_accent: string;
  hero_title_2: string;
  hero_subtitle: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  hero_stat_flags: string;
  hero_stat_free: string;
  hero_stat_data: string;
  hero_trust_badge: string;

  // Features
  features_subtitle: string;
  features_title: string;
  features_desc: string;
  feature_1_title: string;
  feature_1_desc: string;
  feature_2_title: string;
  feature_2_desc: string;
  feature_3_title: string;
  feature_3_desc: string;
  feature_4_title: string;
  feature_4_desc: string;
  feature_5_title: string;
  feature_5_desc: string;
  feature_6_title: string;
  feature_6_desc: string;

  // How it works
  how_subtitle: string;
  how_title: string;
  how_desc: string;
  how_step1_title: string;
  how_step1_desc: string;
  how_step2_title: string;
  how_step2_desc: string;
  how_step3_title: string;
  how_step3_desc: string;

  // Testimonials
  testimonials_subtitle: string;
  testimonials_title: string;
  testimonials_desc: string;

  // FAQ
  faq_subtitle: string;
  faq_title: string;
  faq_desc: string;
  faq_q1: string;
  faq_a1: string;
  faq_q2: string;
  faq_a2: string;
  faq_q3: string;
  faq_a3: string;
  faq_q4: string;
  faq_a4: string;
  faq_q5: string;
  faq_a5: string;

  // CTA Banner
  cta_title: string;
  cta_subtitle: string;
  cta_button: string;

  // Footer
  footer_tagline: string;
  footer_platform: string;
  footer_resources: string;
  footer_legal: string;
  footer_disclaimer: string;
  footer_copyright: string;
  footer_analysis: string;

  // Analysis page
  analysis_title: string;
  analysis_subtitle: string;
  analysis_tab_paste: string;
  analysis_tab_upload: string;
  analysis_placeholder: string;
  analysis_drop_title: string;
  analysis_drop_sub: string;
  analysis_region_label: string;
  analysis_cta: string;
  analysis_privacy: string;
  analysis_empty_title: string;
  analysis_empty_desc: string;
  analysis_loading: string;
  analysis_error_title: string;
  analysis_error_desc: string;
  analysis_retry: string;
  analysis_risk_label: string;
  analysis_risk_critical: string;
  analysis_risk_high: string;
  analysis_risk_medium: string;
  analysis_risk_low: string;
  analysis_total_flags: string;
  analysis_share: string;
  analysis_download: string;
  analysis_new: string;
  analysis_tab_flags: string;
  analysis_tab_safe: string;
  analysis_tab_summary: string;
  analysis_why_dangerous: string;
  analysis_legal_basis: string;
  analysis_recommendation: string;
  analysis_copy_email: string;
  analysis_contract_type: string;
  analysis_duration: string;
  analysis_salary: string;
  analysis_region: string;
  analysis_must_change: string;
  analysis_should_change: string;
  analysis_final_reco: string;
  analysis_next_steps: string;
  analysis_need_help: string;
  analysis_history_title: string;
  analysis_history_empty: string;
  analysis_history_clear_all: string;
  analysis_history_view: string;
  analysis_history_delete: string;
  analysis_history_flags: string;

  // 404
  not_found_title: string;
  not_found_desc: string;
  not_found_home: string;
  not_found_analysis: string;
}

// ── Indonesian Dictionary ──
const id: Dictionary = {
  nav_features: 'Fitur',
  nav_how_it_works: 'Cara Kerja',
  nav_faq: 'FAQ',
  nav_start_analysis: 'Mulai Analisis',
  nav_home: 'Beranda',
  nav_analysis: 'Analisis',

  hero_badge: 'Gratis untuk Semua',
  hero_title_1: 'Lindungi ',
  hero_title_accent: 'Hak Kerja Anda',
  hero_title_2: ' dengan AI',
  hero_subtitle: 'Analisis kontrak kerja Anda secara gratis. Deteksi klausul berbahaya dalam hitungan detik.',
  hero_cta_primary: 'Analisis Kontrak Gratis →',
  hero_cta_secondary: 'Pelajari Lebih Lanjut ↓',
  hero_stat_flags: 'Red Flags Terdeteksi',
  hero_stat_free: 'Gratis',
  hero_stat_data: 'Data Disimpan',
  hero_trust_badge: 'Privacy Protected',

  features_subtitle: 'Fitur Analisis',
  features_title: 'Apa yang Kami Deteksi',
  features_desc: 'AI kami memeriksa kontrak kerja Anda terhadap berbagai pola klausul yang berpotensi merugikan pekerja.',
  feature_1_title: 'PKWT Tanpa Kompensasi',
  feature_1_desc: 'Deteksi kontrak kerja waktu tertentu yang tidak mencantumkan kompensasi sesuai ketentuan UU Cipta Kerja.',
  feature_2_title: 'Lembur Tanpa Pembayaran',
  feature_2_desc: 'Identifikasi klausul yang menghilangkan hak upah lembur atau memberlakukan lembur tanpa persetujuan pekerja.',
  feature_3_title: 'Upah di Bawah Minimum',
  feature_3_desc: 'Periksa apakah upah dalam kontrak Anda memenuhi standar Upah Minimum Provinsi (UMP) yang berlaku.',
  feature_4_title: 'PHK Sewenang-wenang',
  feature_4_desc: 'Temukan klausul PHK sepihak yang bertentangan dengan prosedur dan ketentuan yang diatur undang-undang.',
  feature_5_title: 'Klausul Non-Compete Berlebihan',
  feature_5_desc: 'Analisis pembatasan pasca-kerja yang tidak wajar dan berpotensi merugikan karier Anda di masa depan.',
  feature_6_title: 'Dan 15+ Pola Lainnya',
  feature_6_desc: 'Termasuk cuti, BPJS, kerahasiaan berlebihan, pengalihan tanggung jawab, dan pola bermasalah lainnya.',

  how_subtitle: 'Langkah Mudah',
  how_title: 'Cara Kerja',
  how_desc: 'Tiga langkah sederhana untuk melindungi hak Anda.',
  how_step1_title: 'Upload Kontrak',
  how_step1_desc: 'Tempel teks atau upload PDF kontrak kerja Anda. Data Anda tidak akan disimpan.',
  how_step2_title: 'Analisis AI',
  how_step2_desc: 'AI kami menganalisis kontrak Anda berdasarkan UU Ketenagakerjaan 2023 dan peraturan turunannya.',
  how_step3_title: 'Hasil & Rekomendasi',
  how_step3_desc: 'Dapatkan hasil analisis lengkap beserta langkah negosiasi yang dapat Anda ambil.',

  testimonials_subtitle: 'Latar Belakang',
  testimonials_title: 'Mengapa Kami Membangun Ini',
  testimonials_desc: 'Kenyataan pahit di lapangan yang mendorong lahirnya KawalKontrak.',

  faq_subtitle: 'Bantuan',
  faq_title: 'Pertanyaan Umum',
  faq_desc: 'Jawaban atas pertanyaan yang sering diajukan.',
  faq_q1: 'Apakah KawalKontrak.ai gratis?',
  faq_a1: 'Ya, sepenuhnya gratis untuk semua pekerja Indonesia. Misi kami adalah memberdayakan pekerja dengan informasi yang tepat tentang hak-hak mereka.',
  faq_q2: 'Apakah data kontrak saya aman?',
  faq_a2: 'Ya. Kontrak Anda dianalisis secara real-time dan TIDAK disimpan di server kami. Setelah analisis selesai, semua data dihapus secara otomatis.',
  faq_q3: 'Apakah ini nasihat hukum?',
  faq_a3: 'Tidak. KawalKontrak.ai adalah alat edukasi yang membantu Anda memahami kontrak kerja. Untuk kasus serius, kami rekomendasikan konsultasi dengan Lembaga Bantuan Hukum (LBH) atau pengacara profesional.',
  faq_q4: 'UU apa yang menjadi acuan?',
  faq_a4: 'UU No. 6 Tahun 2023 tentang Cipta Kerja, PP No. 35/2021 tentang PKWT, PKWTT, Alih Daya, Waktu Kerja, dan PHK, serta PP No. 36/2021 tentang Pengupahan.',
  faq_q5: 'Siapa yang membuat platform ini?',
  faq_a5: 'Tim independen yang peduli dengan perlindungan hak pekerja Indonesia. Kami percaya setiap pekerja berhak memahami isi kontraknya sebelum menandatangani.',

  cta_title: 'Siap Melindungi Hak Kerja Anda?',
  cta_subtitle: 'Analisis kontrak kerja Anda sekarang, gratis, aman, dan tanpa perlu daftar akun.',
  cta_button: 'Mulai Analisis Kontrak →',

  footer_tagline: 'Platform analisis kontrak kerja berbasis AI untuk melindungi hak-hak pekerja Indonesia. Gratis, aman, dan transparan.',
  footer_platform: 'Platform',
  footer_resources: 'Sumber Daya',
  footer_legal: 'Legal',
  footer_disclaimer: 'KawalKontrak.ai bukan nasihat hukum. Hasil analisis bersifat edukatif. Konsultasikan dengan profesional hukum untuk kasus yang memerlukan penanganan serius.',
  footer_copyright: '© 2024 KawalKontrak.ai | Dibuat untuk Pekerja Indonesia',
  footer_analysis: 'Analisis Kontrak',

  analysis_title: 'Analisis Kontrak Kerja',
  analysis_subtitle: 'Tempel teks atau upload file kontrak kerja Anda. AI kami akan mendeteksi klausul bermasalah dan memberikan rekomendasi hukum.',
  analysis_tab_paste: 'Tempel Teks',
  analysis_tab_upload: 'Upload File',
  analysis_placeholder: 'Tempel seluruh teks kontrak kerja Anda di sini...',
  analysis_drop_title: 'Seret & lepas file di sini, atau klik untuk memilih',
  analysis_drop_sub: 'Format: PDF, TXT · Maks 10 MB',
  analysis_region_label: 'Wilayah Kerja',
  analysis_cta: 'ANALISIS KONTRAK →',
  analysis_privacy: 'Kontrak Anda tidak disimpan di server kami',
  analysis_empty_title: 'Belum Ada Hasil',
  analysis_empty_desc: 'Masukkan teks kontrak kerja Anda untuk memulai analisis. AI kami akan memeriksa klausul bermasalah dan memberikan rekomendasi hukum yang akurat.',
  analysis_loading: 'Menganalisis Kontrak...',
  analysis_error_title: 'Terjadi Kesalahan',
  analysis_error_desc: 'Maaf, kami tidak dapat menganalisis kontrak Anda saat ini. Silakan periksa koneksi internet Anda dan coba lagi.',
  analysis_retry: 'Coba Lagi',
  analysis_risk_label: 'Tingkat Risiko',
  analysis_risk_critical: 'Risiko Sangat Tinggi',
  analysis_risk_high: 'Risiko Tinggi',
  analysis_risk_medium: 'Risiko Sedang',
  analysis_risk_low: 'Risiko Rendah',
  analysis_total_flags: 'Total Red Flags',
  analysis_share: 'Bagikan',
  analysis_download: 'Download PDF',
  analysis_new: 'Analisis Baru',
  analysis_tab_flags: 'Red Flags',
  analysis_tab_safe: 'Klausul Aman',
  analysis_tab_summary: 'Ringkasan',
  analysis_why_dangerous: 'Mengapa Berbahaya',
  analysis_legal_basis: 'Dasar Hukum',
  analysis_recommendation: 'Rekomendasi Negosiasi',
  analysis_copy_email: 'Salin Template Email',
  analysis_contract_type: 'Jenis Kontrak',
  analysis_duration: 'Durasi',
  analysis_salary: 'Gaji',
  analysis_region: 'Wilayah',
  analysis_must_change: 'Harus Diubah',
  analysis_should_change: 'Sebaiknya Diubah',
  analysis_final_reco: 'Rekomendasi Akhir',
  analysis_next_steps: 'Langkah Selanjutnya',
  analysis_need_help: 'Butuh Bantuan Hukum?',
  analysis_history_title: 'Riwayat Analisis',
  analysis_history_empty: 'Belum ada riwayat analisis.',
  analysis_history_clear_all: 'Hapus Semua',
  analysis_history_view: 'Lihat',
  analysis_history_delete: 'Hapus',
  analysis_history_flags: 'red flags',

  not_found_title: 'Halaman Tidak Ditemukan',
  not_found_desc: 'Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.',
  not_found_home: '← Kembali ke Beranda',
  not_found_analysis: 'Analisis Kontrak →',
};

// ── English Dictionary ──
const en: Dictionary = {
  nav_features: 'Features',
  nav_how_it_works: 'How It Works',
  nav_faq: 'FAQ',
  nav_start_analysis: 'Start Analysis',
  nav_home: 'Home',
  nav_analysis: 'Analysis',

  hero_badge: 'Free for Everyone',
  hero_title_1: 'Protect Your ',
  hero_title_accent: 'Employment Rights',
  hero_title_2: ' with AI',
  hero_subtitle: 'Analyze your employment contract for free. Detect dangerous clauses in seconds.',
  hero_cta_primary: 'Free Contract Analysis →',
  hero_cta_secondary: 'Learn More ↓',
  hero_stat_flags: 'Red Flags Detected',
  hero_stat_free: 'Free',
  hero_stat_data: 'Data Stored',
  hero_trust_badge: 'Privacy Protected',

  features_subtitle: 'Analysis Features',
  features_title: 'What We Detect',
  features_desc: 'Our AI checks your employment contract against patterns that could harm workers.',
  feature_1_title: 'Fixed-term Without Compensation',
  feature_1_desc: 'Detect fixed-term contracts that don\'t include compensation as required by Indonesian labor law.',
  feature_2_title: 'Overtime Without Pay',
  feature_2_desc: 'Identify clauses that eliminate overtime pay rights or enforce overtime without worker consent.',
  feature_3_title: 'Below Minimum Wage',
  feature_3_desc: 'Check if the salary in your contract meets the applicable Provincial Minimum Wage (UMP) standard.',
  feature_4_title: 'Arbitrary Termination',
  feature_4_desc: 'Find unilateral termination clauses that violate procedures set by law.',
  feature_5_title: 'Excessive Non-Compete',
  feature_5_desc: 'Analyze unreasonable post-employment restrictions that could harm your future career.',
  feature_6_title: 'And 15+ More Patterns',
  feature_6_desc: 'Including leave, social security (BPJS), excessive confidentiality, liability shifts, and more.',

  how_subtitle: 'Easy Steps',
  how_title: 'How It Works',
  how_desc: 'Three simple steps to protect your rights.',
  how_step1_title: 'Upload Contract',
  how_step1_desc: 'Paste text or upload your employment contract PDF. Your data won\'t be stored.',
  how_step2_title: 'AI Analysis',
  how_step2_desc: 'Our AI analyzes your contract based on Indonesian Labor Law 2023 and its derivatives.',
  how_step3_title: 'Results & Recommendations',
  how_step3_desc: 'Get complete analysis results along with actionable negotiation steps.',

  testimonials_subtitle: 'Background',
  testimonials_title: 'Why We Built This',
  testimonials_desc: 'The harsh realities that drove the creation of KawalKontrak.',

  faq_subtitle: 'Help',
  faq_title: 'Frequently Asked Questions',
  faq_desc: 'Answers to commonly asked questions.',
  faq_q1: 'Is KawalKontrak.ai free?',
  faq_a1: 'Yes, completely free for all Indonesian workers. Our mission is to empower workers with accurate information about their rights.',
  faq_q2: 'Is my contract data safe?',
  faq_a2: 'Yes. Your contract is analyzed in real-time and is NOT stored on our servers. All data is automatically deleted after analysis.',
  faq_q3: 'Is this legal advice?',
  faq_a3: 'No. KawalKontrak.ai is an educational tool to help you understand employment contracts. For serious cases, we recommend consulting with a Legal Aid Institute (LBH) or professional lawyer.',
  faq_q4: 'What laws are referenced?',
  faq_a4: 'Law No. 6/2023 on Job Creation, Government Regulation No. 35/2021 on PKWT, Outsourcing, Working Hours, and Termination, and GR No. 36/2021 on Wages.',
  faq_q5: 'Who built this platform?',
  faq_a5: 'An independent team committed to protecting Indonesian workers\' rights. We believe every worker deserves to understand their contract before signing.',

  cta_title: 'Ready to Protect Your Employment Rights?',
  cta_subtitle: 'Analyze your employment contract now, free, safe, and no registration required.',
  cta_button: 'Start Contract Analysis →',

  footer_tagline: 'AI-powered employment contract analysis platform to protect Indonesian workers\' rights. Free, safe, and transparent.',
  footer_platform: 'Platform',
  footer_resources: 'Resources',
  footer_legal: 'Legal',
  footer_disclaimer: 'KawalKontrak.ai is not legal advice. Analysis results are educational. Consult a legal professional for cases requiring serious attention.',
  footer_copyright: '© 2024 KawalKontrak.ai | Made for Indonesian Workers',
  footer_analysis: 'Contract Analysis',

  analysis_title: 'Employment Contract Analysis',
  analysis_subtitle: 'Paste text or upload your employment contract file. Our AI will detect problematic clauses and provide legal recommendations.',
  analysis_tab_paste: 'Paste Text',
  analysis_tab_upload: 'Upload File',
  analysis_placeholder: 'Paste your entire employment contract text here...',
  analysis_drop_title: 'Drag & drop file here, or click to select',
  analysis_drop_sub: 'Format: PDF, TXT · Max 10 MB',
  analysis_region_label: 'Work Region',
  analysis_cta: 'ANALYZE CONTRACT →',
  analysis_privacy: 'Your contract is not stored on our servers',
  analysis_empty_title: 'No Results Yet',
  analysis_empty_desc: 'Enter your employment contract text to start analysis. Our AI will check for problematic clauses and provide accurate legal recommendations.',
  analysis_loading: 'Analyzing Contract...',
  analysis_error_title: 'An Error Occurred',
  analysis_error_desc: 'Sorry, we cannot analyze your contract right now. Please check your internet connection and try again.',
  analysis_retry: 'Try Again',
  analysis_risk_label: 'Risk Level',
  analysis_risk_critical: 'Very High Risk',
  analysis_risk_high: 'High Risk',
  analysis_risk_medium: 'Medium Risk',
  analysis_risk_low: 'Low Risk',
  analysis_total_flags: 'Total Red Flags',
  analysis_share: 'Share',
  analysis_download: 'Download PDF',
  analysis_new: 'New Analysis',
  analysis_tab_flags: 'Red Flags',
  analysis_tab_safe: 'Safe Clauses',
  analysis_tab_summary: 'Summary',
  analysis_why_dangerous: 'Why It\'s Dangerous',
  analysis_legal_basis: 'Legal Basis',
  analysis_recommendation: 'Negotiation Recommendation',
  analysis_copy_email: 'Copy Email Template',
  analysis_contract_type: 'Contract Type',
  analysis_duration: 'Duration',
  analysis_salary: 'Salary',
  analysis_region: 'Region',
  analysis_must_change: 'Must Change',
  analysis_should_change: 'Should Change',
  analysis_final_reco: 'Final Recommendation',
  analysis_next_steps: 'Next Steps',
  analysis_need_help: 'Need Legal Help?',
  analysis_history_title: 'Analysis History',
  analysis_history_empty: 'No analysis history yet.',
  analysis_history_clear_all: 'Clear All',
  analysis_history_view: 'View',
  analysis_history_delete: 'Delete',
  analysis_history_flags: 'red flags',

  not_found_title: 'Page Not Found',
  not_found_desc: 'Sorry, the page you are looking for does not exist or has been moved.',
  not_found_home: '← Back to Home',
  not_found_analysis: 'Contract Analysis →',
};

const dictionaries: Record<Locale, Dictionary> = { id, en };

// ── Context ──
interface I18nContextType {
  locale: Locale;
  t: Dictionary;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  t: en,
  setLocale: () => {},
  toggleLocale: () => {},
});

// ── Provider ──
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Load from localStorage on mount — localStorage hanya ada di client,
  // sehingga sinkronisasi state awal memang harus lewat effect (SSR-safe)
  useEffect(() => {
    const saved = localStorage.getItem('kk-locale') as Locale | null;
    if (saved && (saved === 'id' || saved === 'en')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = 'en';
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('kk-locale', l);
    document.documentElement.lang = l;
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'id' ? 'en' : 'id');
  }, [locale, setLocale]);

  return (
    <I18nContext.Provider value={{ locale, t: dictionaries[locale], setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

// ── Hook ──
export function useI18n() {
  return useContext(I18nContext);
}
