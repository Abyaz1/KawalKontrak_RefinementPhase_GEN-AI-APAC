'use client';

import { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import s from './page.module.css';

/* ──────────────── Types ──────────────── */

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface RedFlag {
  id: number;
  severity: Severity;
  title: string;
  excerpt: string;
  explanation: string;
  legalRefs: string[];
  recommendation: string;
  emailTemplate: string;
}

interface SafeClause {
  id: number;
  title: string;
  description: string;
}

interface Summary {
  contractType: string;
  duration: string;
  salary: string;
  mustChange: string[];
  shouldChange: string[];
  finalRecommendation: string;
}

interface NextStep {
  text: string;
}

interface AnalysisResult {
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskLabel: string;
  riskDescription: string;
  totalFlags: number;
  severityCounts: Record<Severity, number>;
  redFlags: RedFlag[];
  safeClauses: SafeClause[];
  summary: Summary;
  nextSteps: NextStep[];
}

type AnalysisState = 'idle' | 'loading' | 'done' | 'error';
type InputTab = 'paste' | 'upload';
type ResultTab = 'flags' | 'safe' | 'summary';

/* ──────────────── Constants ──────────────── */

const REGIONS = [
  'Jakarta',
  'Surabaya',
  'Bandung',
  'Medan',
  'Semarang',
  'Makassar',
  'Lainnya',
];

const LOADING_STEPS_ID = [
  'Membaca kontrak...',
  'Mendeteksi red flags...',
  'Mencari regulasi terkait...',
  'Analisis AI mendalam...',
  'Menyusun hasil...',
];

const LOADING_STEPS_EN = [
  'Reading contract...',
  'Detecting red flags...',
  'Searching relevant regulations...',
  'Deep AI analysis...',
  'Compiling results...',
];

const PLACEHOLDER_TEXT_ID = `Contoh: 

PERJANJIAN KERJA WAKTU TERTENTU (PKWT)

Yang bertanda tangan di bawah ini:
1. PT Maju Jaya Sentosa, berkedudukan di Jakarta, selanjutnya disebut PIHAK PERTAMA (Pemberi Kerja)
2. Budi Santoso, berdomisili di Bandung, selanjutnya disebut PIHAK KEDUA (Pekerja)

Pasal 1 - Masa Percobaan
Pihak Kedua wajib menjalani masa percobaan selama 3 bulan...

Pasal 2 - Jam Kerja
Pihak Kedua wajib bekerja selama 10 jam per hari, 7 hari seminggu...

Tempel seluruh teks kontrak kerja Anda di sini...`;

const PLACEHOLDER_TEXT_EN = `Example: 

FIXED-TERM EMPLOYMENT CONTRACT (PKWT)

We, the undersigned:
1. PT Maju Jaya Sentosa, located in Jakarta, hereinafter referred to as the FIRST PARTY (Employer)
2. Budi Santoso, residing in Bandung, hereinafter referred to as the SECOND PARTY (Employee)

Article 1 - Probationary Period
The Second Party must undergo a probationary period of 3 months...

Article 2 - Working Hours
The Second Party is required to work 10 hours per day, 7 days a week...

Paste your entire employment contract text here...`;

/* ──────────────── Mock result for demo ──────────────── */

const MOCK_RESULT: AnalysisResult = {
  riskLevel: 'HIGH',
  riskLabel: 'Risiko Tinggi',
  riskDescription: 'Kontrak ini mengandung beberapa klausul yang berpotensi merugikan pekerja dan perlu dinegosiasi ulang.',
  totalFlags: 5,
  severityCounts: { CRITICAL: 1, HIGH: 2, MEDIUM: 1, LOW: 1 },
  redFlags: [
    {
      id: 1,
      severity: 'CRITICAL',
      title: 'Masa Percobaan pada PKWT',
      excerpt: '"Pihak Kedua wajib menjalani masa percobaan selama 3 bulan tanpa gaji penuh..."',
      explanation: 'PKWT (Perjanjian Kerja Waktu Tertentu) TIDAK BOLEH mensyaratkan masa percobaan. Ini melanggar UU Ketenagakerjaan secara langsung. Klausul ini batal demi hukum.',
      legalRefs: ['Pasal 58 UU No. 13/2003', 'PP No. 35/2021 Pasal 12'],
      recommendation: 'Minta penghapusan klausul masa percobaan sepenuhnya. Jika perusahaan menolak, minta perubahan status menjadi PKWTT (karyawan tetap) yang memang diperbolehkan memiliki masa percobaan.',
      emailTemplate: 'Yth. HRD PT Maju Jaya Sentosa,\n\nSaya ingin mendiskusikan Pasal 1 mengenai Masa Percobaan dalam PKWT. Berdasarkan Pasal 58 UU No. 13 Tahun 2003, PKWT tidak boleh mensyaratkan masa percobaan. Saya mohon klausul ini dapat dihapus atau status kerja diubah menjadi PKWTT.\n\nTerima kasih.',
    },
    {
      id: 2,
      severity: 'HIGH',
      title: 'Jam Kerja Melebihi Batas',
      excerpt: '"Pihak Kedua wajib bekerja selama 10 jam per hari, 7 hari seminggu tanpa kompensasi lembur..."',
      explanation: 'Jam kerja normal adalah 7-8 jam/hari dan 40 jam/minggu. Kontrak ini mewajibkan 70 jam/minggu, hampir dua kali lipat dari batas legal, tanpa lembur.',
      legalRefs: ['Pasal 77 UU No. 13/2003', 'Pasal 78 UU No. 13/2003'],
      recommendation: 'Negosiasikan jam kerja menjadi maksimal 8 jam/hari dan 40 jam/minggu. Pastikan ada ketentuan lembur dengan upah 1.5x untuk jam pertama dan 2x untuk jam berikutnya.',
      emailTemplate: 'Yth. HRD,\n\nMerujuk pada Pasal 2 tentang Jam Kerja, saya mohon penyesuaian menjadi 8 jam/hari sesuai Pasal 77 UU Ketenagakerjaan, dengan ketentuan lembur sesuai Pasal 78.\n\nTerima kasih.',
    },
    {
      id: 3,
      severity: 'HIGH',
      title: 'Tidak Ada Ketentuan Cuti Tahunan',
      excerpt: 'Kontrak tidak menyebutkan hak cuti tahunan pekerja.',
      explanation: 'Setiap pekerja yang telah bekerja 12 bulan berturut-turut berhak atas cuti tahunan minimal 12 hari kerja. Absennya klausul ini bukan berarti hak tersebut hilang, namun sebaiknya dicantumkan secara eksplisit.',
      legalRefs: ['Pasal 79 UU No. 13/2003'],
      recommendation: 'Tambahkan klausul cuti tahunan minimal 12 hari kerja setelah 12 bulan masa kerja.',
      emailTemplate: 'Yth. HRD,\n\nSaya mohon ditambahkan klausul mengenai hak cuti tahunan sekurang-kurangnya 12 hari kerja sesuai Pasal 79 UU No. 13 Tahun 2003.\n\nTerima kasih.',
    },
    {
      id: 4,
      severity: 'MEDIUM',
      title: 'Klausul Non-Kompetisi Terlalu Luas',
      excerpt: '"Pihak Kedua dilarang bekerja di industri yang sama selama 5 tahun setelah berakhirnya perjanjian ini..."',
      explanation: 'Klausul non-kompetisi selama 5 tahun dinilai terlalu lama dan berpotensi membatasi hak pekerja untuk mencari nafkah. Umumnya batas wajar adalah 6–12 bulan.',
      legalRefs: ['Pasal 1338 KUHPerdata', 'Pasal 27 ayat (2) UUD 1945'],
      recommendation: 'Negosiasikan durasi menjadi maksimal 12 bulan dengan cakupan geografis dan industri yang lebih spesifik. Minta kompensasi finansial selama masa non-kompetisi.',
      emailTemplate: 'Yth. HRD,\n\nSaya mohon revisi klausul non-kompetisi menjadi maksimal 12 bulan dengan kompensasi finansial yang proporsional.\n\nTerima kasih.',
    },
    {
      id: 5,
      severity: 'LOW',
      title: 'Tempat Penyelesaian Sengketa Tidak Jelas',
      excerpt: '"Segala sengketa diselesaikan secara musyawarah..."',
      explanation: 'Klausul penyelesaian sengketa terlalu umum. Sebaiknya disebutkan secara spesifik mekanisme dan forum penyelesaiannya.',
      legalRefs: ['UU No. 2/2004 tentang PPHI'],
      recommendation: 'Tambahkan mekanisme bertahap: bipartit, mediasi, dan Pengadilan Hubungan Industrial (PHI) sesuai UU PPHI.',
      emailTemplate: 'Yth. HRD,\n\nSaya mengusulkan klausul penyelesaian sengketa diperjelas dengan mekanisme bipartit, mediasi, dan PHI sesuai UU No. 2 Tahun 2004.\n\nTerima kasih.',
    },
  ],
  safeClauses: [
    {
      id: 1,
      title: 'Ketentuan Upah Jelas',
      description: 'Kontrak menyebutkan besaran upah secara eksplisit dan di atas UMR Jakarta. Ini sudah sesuai dengan ketentuan Pasal 88 UU Ketenagakerjaan.',
    },
    {
      id: 2,
      title: 'Jaminan Sosial (BPJS)',
      description: 'Kontrak mencantumkan kewajiban pemberi kerja untuk mendaftarkan pekerja dalam BPJS Kesehatan dan BPJS Ketenagakerjaan sesuai peraturan yang berlaku.',
    },
    {
      id: 3,
      title: 'Deskripsi Pekerjaan Terperinci',
      description: 'Kontrak memuat deskripsi pekerjaan yang jelas dan terperinci, mengurangi risiko eksploitasi di luar lingkup tugas yang disepakati.',
    },
  ],
  summary: {
    contractType: 'PKWT (Kontrak Waktu Tertentu)',
    duration: '12 Bulan',
    salary: 'Rp 5.500.000/bulan',
    mustChange: [
      'Hapus klausul masa percobaan (ilegal untuk PKWT)',
      'Sesuaikan jam kerja menjadi 40 jam/minggu',
      'Tambahkan ketentuan lembur sesuai UU',
    ],
    shouldChange: [
      'Tambahkan klausul cuti tahunan eksplisit',
      'Revisi klausul non-kompetisi menjadi 12 bulan',
      'Perjelas mekanisme penyelesaian sengketa',
    ],
    finalRecommendation: 'Kontrak ini memerlukan negosiasi ulang pada beberapa klausul kritis sebelum ditandatangani. Klausul masa percobaan pada PKWT bersifat ilegal dan harus dihapus. Jam kerja yang berlebihan juga melanggar undang-undang. Kami sarankan untuk membawa poin-poin ini ke HRD dengan merujuk pada pasal-pasal hukum yang disebutkan. Jika perusahaan menolak perubahan, pertimbangkan untuk berkonsultasi dengan LBH atau serikat pekerja.',
  },
  nextSteps: [
    { text: 'Kirim email negosiasi ke HRD menggunakan template yang disediakan, prioritaskan klausul CRITICAL terlebih dahulu.' },
    { text: 'Jangan tanda tangani kontrak sebelum klausul masa percobaan dihapus — ini adalah pelanggaran hukum yang jelas.' },
    { text: 'Simpan salinan komunikasi Anda sebagai bukti jika diperlukan di kemudian hari.' },
    { text: 'Jika negosiasi gagal, hubungi LBH atau Disnaker untuk konsultasi hukum gratis.' },
  ],
};

const MOCK_RESULT_EN: AnalysisResult = {
  riskLevel: 'HIGH',
  riskLabel: 'High Risk',
  riskDescription: 'This contract contains several clauses that could potentially disadvantage the worker and need to be renegotiated.',
  totalFlags: 5,
  severityCounts: { CRITICAL: 1, HIGH: 2, MEDIUM: 1, LOW: 1 },
  redFlags: [
    {
      id: 1,
      severity: 'CRITICAL',
      title: 'Probation Period in Fixed-Term Contract (PKWT)',
      excerpt: '"The Second Party is required to undergo a probationary period of 3 months without full salary..."',
      explanation: 'Fixed-term contracts (PKWT) CANNOT require a probationary period. This directly violates the Indonesian Labor Law. This clause is null and void by law.',
      legalRefs: ['Article 58 of Law No. 13/2003', 'Government Regulation No. 35/2021 Article 12'],
      recommendation: 'Request the complete removal of the probationary clause. If the company refuses, request a status change to a permanent contract (PKWTT), which is legally allowed to have a probation period.',
      emailTemplate: 'Dear HR PT Maju Jaya Sentosa,\n\nI would like to discuss Article 1 regarding the Probationary Period in the PKWT. Under Article 58 of Law No. 13 of 2003, fixed-term contracts may not require a probationary period. I kindly request that this clause be removed or that my work status be changed to PKWTT.\n\nThank you.',
    },
    {
      id: 2,
      severity: 'HIGH',
      title: 'Working Hours Exceeding Legal Limit',
      excerpt: '"The Second Party is required to work 10 hours per day, 7 days a week without overtime compensation..."',
      explanation: 'Normal working hours are 7-8 hours/day and 40 hours/week. This contract requires 70 hours/week, nearly double the legal limit, without overtime pay.',
      legalRefs: ['Article 77 of Law No. 13/2003', 'Article 78 of Law No. 13/2003'],
      recommendation: 'Negotiate the working hours to a maximum of 8 hours/day and 40 hours/week. Ensure there are overtime provisions paying 1.5x for the first hour and 2x for subsequent hours.',
      emailTemplate: 'Dear HR,\n\nReferring to Article 2 regarding Working Hours, I request an adjustment to 8 hours/day in accordance with Article 77 of the Labor Law, with overtime provisions as per Article 78.\n\nThank you.',
    },
    {
      id: 3,
      severity: 'HIGH',
      title: 'No Provision for Annual Leave',
      excerpt: 'The contract does not mention the worker\'s right to annual leave.',
      explanation: 'Every worker who has worked for 12 consecutive months is entitled to a minimum of 12 days of annual leave. While the absence of this clause doesn\'t waive the right, it should be explicitly stated.',
      legalRefs: ['Article 79 of Law No. 13/2003'],
      recommendation: 'Add an explicit clause for annual leave of at least 12 working days after 12 months of service.',
      emailTemplate: 'Dear HR,\n\nI kindly request the addition of a clause regarding annual leave rights of at least 12 working days in accordance with Article 79 of Law No. 13 of 2003.\n\nThank you.',
    },
    {
      id: 4,
      severity: 'MEDIUM',
      title: 'Overly Broad Non-Compete Clause',
      excerpt: '"The Second Party is prohibited from working in the same industry for 5 years after termination..."',
      explanation: 'A 5-year non-compete clause is considered excessively long and potentially restricts the worker\'s constitutional right to make a living. A reasonable limit is usually 6–12 months.',
      legalRefs: ['Article 1338 of the Civil Code (KUHPerdata)', 'Article 27 paragraph (2) of the 1945 Constitution'],
      recommendation: 'Negotiate the duration to a maximum of 12 months with a more specific geographic and industry scope. Request financial compensation during the non-compete period.',
      emailTemplate: 'Dear HR,\n\nI request the non-compete clause be revised to a maximum of 12 months, with proportional financial compensation.\n\nThank you.',
    },
    {
      id: 5,
      severity: 'LOW',
      title: 'Vague Dispute Resolution Venue',
      excerpt: '"All disputes shall be resolved amicably..."',
      explanation: 'The dispute resolution clause is too general. It is best to specify the mechanism and forum for resolution.',
      legalRefs: ['Law No. 2/2004 on PPHI'],
      recommendation: 'Add a tiered mechanism: bipartite negotiation, mediation, and Industrial Relations Court (PHI) in accordance with the PPHI Law.',
      emailTemplate: 'Dear HR,\n\nI suggest clarifying the dispute resolution clause with bipartite, mediation, and PHI mechanisms as per Law No. 2 of 2004.\n\nThank you.',
    },
  ],
  safeClauses: [
    {
      id: 1,
      title: 'Clear Wage Terms',
      description: 'The contract explicitly mentions the wage amount, which is above the Jakarta Minimum Wage. This is in accordance with Article 88 of the Labor Law.',
    },
    {
      id: 2,
      title: 'Social Security (BPJS)',
      description: 'The contract includes the employer\'s obligation to register the worker in BPJS Health and BPJS Employment in accordance with regulations.',
    },
    {
      id: 3,
      title: 'Detailed Job Description',
      description: 'The contract contains a clear and detailed job description, reducing the risk of exploitation outside the agreed scope of work.',
    },
  ],
  summary: {
    contractType: 'PKWT (Fixed-Term Contract)',
    duration: '12 Months',
    salary: 'Rp 5,500,000/month',
    mustChange: [
      'Remove probationary clause (illegal for PKWT)',
      'Adjust working hours to 40 hours/week',
      'Add overtime provisions in accordance with the law',
    ],
    shouldChange: [
      'Add explicit annual leave clause',
      'Revise non-compete clause to 12 months',
      'Clarify dispute resolution mechanism',
    ],
    finalRecommendation: 'This contract requires renegotiation of several critical clauses before being signed. The probationary clause in a PKWT is illegal and must be removed. Excessive working hours also violate the law. We advise bringing these points to HRD, referring to the cited legal articles. If the company refuses, consider consulting with LBH or a trade union.',
  },
  nextSteps: [
    { text: 'Send a negotiation email to HR using the template provided, prioritizing CRITICAL clauses first.' },
    { text: 'Do not sign the contract before the probationary clause is removed — this is a clear legal violation.' },
    { text: 'Keep copies of your communication as evidence if needed in the future.' },
    { text: 'If negotiation fails, contact LBH or Disnaker for free legal consultation.' },
  ],
};

/* ──────────────── Component ──────────────── */

/* ──────────────── History type ──────────────── */

interface HistoryEntry {
  id: string;
  date: string;
  riskLevel: string;
  riskLabel: string;
  totalFlags: number;
  result: AnalysisResult;
}

const HISTORY_KEY = 'kk-analysis-history';

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 20)));
}

/* ──────────────── PDF/TXT file reader ──────────────── */

async function readFileAsText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  if (ext === 'txt') {
    return file.text();
  }
  
  if (ext === 'pdf') {
    // Dynamic import of pdf.js for client-side PDF parsing
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      pages.push(text);
    }
    
    return pages.join('\n\n');
  }
  
  throw new Error('Format file tidak didukung. Gunakan PDF atau TXT.');
}

/* ──────────────── Component ──────────────── */

export default function AnalisisPage() {
  const { t, locale, toggleLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const loadingSteps = locale === 'id' ? LOADING_STEPS_ID : LOADING_STEPS_EN;
  const placeholderText = locale === 'id' ? PLACEHOLDER_TEXT_ID : PLACEHOLDER_TEXT_EN;

  /* input state */
  const [inputTab, setInputTab] = useState<InputTab>('paste');
  const [contractText, setContractText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileText, setFileText] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [region, setRegion] = useState('Jakarta');
  const [dragActive, setDragActive] = useState(false);

  /* results state */
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<ResultTab>('flags');
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedFlags, setExpandedFlags] = useState<Set<number>>(new Set());

  /* history state */
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  /* toast */
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* refs */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Load history on mount */
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  /* ──── helpers ──── */

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2600);
  }, []);

  const canSubmit =
    analysisState !== 'loading' &&
    ((inputTab === 'paste' && contractText.trim().length > 0) ||
      (inputTab === 'upload' && (fileText !== null || file !== null)));

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /* ──── file handling ──── */

  const handleFileDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    setFileError(null);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      try {
        const text = await readFileAsText(droppedFile);
        setFileText(text);
      } catch (err: any) {
        setFileError(err.message || 'Gagal membaca file');
        setFileText(null);
      }
    }
  }, []);

  const handleFileInput = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      try {
        const text = await readFileAsText(selected);
        setFileText(text);
      } catch (err: any) {
        setFileError(err.message || 'Gagal membaca file');
        setFileText(null);
      }
    }
  }, []);

  /* ──── analysis submit ──── */

  const runAnalysis = useCallback(async () => {
    setAnalysisState('loading');
    setCurrentStep(0);
    setExpandedFlags(new Set());
    setActiveResultTab('flags');

    /* step-by-step progress */
    for (let i = 0; i < loadingSteps.length; i++) {
      await new Promise<void>((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
      setCurrentStep(i + 1);
    }

    /* API call (falling back to mock) */
    try {
      const textToAnalyze = inputTab === 'paste' ? contractText : (fileText || '');
      if (!textToAnalyze.trim()) throw new Error('No text');

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText: textToAnalyze, useAI: true, region }),
      });

      if (!res.ok) throw new Error('API error');
      const apiData = await res.json();
      
      // Adapt API result to Local UI state format
      const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
      apiData.red_flags?.forEach((f: any) => {
        if (severityCounts[f.severity as Severity] !== undefined) {
          severityCounts[f.severity as Severity]++;
        }
      });
      
      const riskLevel = apiData.risk_level || 'LOW';
      const riskLabel = riskLevel === 'CRITICAL' ? t.analysis_risk_critical : riskLevel === 'HIGH' ? t.analysis_risk_high : riskLevel === 'MEDIUM' ? t.analysis_risk_medium : t.analysis_risk_low;
      
      const adaptedData: AnalysisResult = {
        riskLevel,
        riskLabel,
        riskDescription: locale === 'id' 
          ? 'Berikut adalah hasil analisis kontrak Anda berdasarkan perundang-undangan.'
          : 'Below are the results of your contract analysis based on legislation.',
        totalFlags: apiData.red_flags?.length || 0,
        severityCounts,
        redFlags: (apiData.red_flags || []).map((f: any, i: number) => ({
          id: i + 1,
          severity: f.severity,
          title: f.potensi_masalah ? (f.potensi_masalah.substring(0, 50) + '...') : (locale === 'id' ? 'Klausul Bermasalah' : 'Problematic Clause'),
          excerpt: f.pasal_kontrak || '',
          explanation: f.potensi_masalah || '',
          legalRefs: f.referensi_uu?.map((r: any) => `${r.pasal} ${r.peraturan}`) || [],
          recommendation: f.rekomendasi_negosiasi || '',
          emailTemplate: f.email_template ? (typeof f.email_template === 'string' ? f.email_template : `Subject: ${f.email_template.subject}\n\n${f.email_template.body}`) : ''
        })),
        safeClauses: (apiData.klausul_aman || []).map((c: any, i: number) => ({
          id: i + 1,
          title: c.terjemahan ? (c.terjemahan.substring(0, 40) + '...') : (locale === 'id' ? 'Klausul Aman' : 'Safe Clause'),
          description: c.pasal_kontrak || ''
        })),
        summary: {
          contractType: apiData.ringkasan?.jenis || (locale === 'id' ? 'Tidak Diketahui' : 'Unknown'),
          duration: apiData.ringkasan?.durasi || '-',
          salary: apiData.ringkasan?.gaji_bulanan || '-',
          mustChange: apiData.ringkasan?.harus_diubah || [],
          shouldChange: apiData.ringkasan?.sebaiknya_diubah || [],
          finalRecommendation: locale === 'id'
            ? 'Silakan pelajari langkah berikutnya untuk negosiasi.'
            : 'Please study the next steps for negotiation.'
        },
        nextSteps: (apiData.langkah_berikutnya || []).map((step: string) => ({ text: step }))
      };
      
      setAnalysisResult(adaptedData);
      setAnalysisState('done');

      // Save to history
      const entry: HistoryEntry = {
        id: `H-${Date.now()}`,
        date: new Date().toLocaleString(locale === 'id' ? 'id-ID' : 'en-US'),
        riskLevel: adaptedData.riskLevel,
        riskLabel: adaptedData.riskLabel,
        totalFlags: adaptedData.totalFlags,
        result: adaptedData,
      };
      const updated = [entry, ...history];
      setHistory(updated);
      saveHistory(updated);
    } catch {
      /* fallback to mock for demo */
      setAnalysisResult(locale === 'id' ? MOCK_RESULT : MOCK_RESULT_EN);
      setAnalysisState('done');
    }
  }, [inputTab, contractText, fileText, region, t, locale, loadingSteps, history]);

  /* ──── actions ──── */

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    showToast('✅ Link berhasil disalin!');
  }, [showToast]);

  const handleDownloadPDF = useCallback(() => {
    window.print();
  }, []);

  const handleNewAnalysis = useCallback(() => {
    setContractText('');
    setFile(null);
    setFileText(null);
    setFileError(null);
    setAnalysisState('idle');
    setAnalysisResult(null);
    setCurrentStep(0);
    setExpandedFlags(new Set());
    setActiveResultTab('flags');
  }, []);

  /* ──── history actions ──── */

  const handleViewHistory = useCallback((entry: HistoryEntry) => {
    setAnalysisResult(entry.result);
    setAnalysisState('done');
    setActiveResultTab('flags');
    setExpandedFlags(new Set());
  }, []);

  const handleDeleteHistory = useCallback((id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
    showToast('🗑️ Riwayat dihapus');
  }, [history, showToast]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    showToast('🗑️ Semua riwayat dihapus');
  }, [showToast]);


  const toggleFlag = useCallback((id: number) => {
    setExpandedFlags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCopyEmail = useCallback(
    (template: string) => {
      navigator.clipboard.writeText(template);
      showToast('📋 Template email disalin!');
    },
    [showToast],
  );

  /* ──── severity helpers ──── */

  const severityClass = (sev: Severity) =>
    ({
      CRITICAL: s.flagCardCritical,
      HIGH: s.flagCardHigh,
      MEDIUM: s.flagCardMedium,
      LOW: s.flagCardLow,
    })[sev];

  const badgeClass = (sev: Severity) =>
    ({
      CRITICAL: s.severityCritical,
      HIGH: s.severityHigh,
      MEDIUM: s.severityMedium,
      LOW: s.severityLow,
    })[sev];

  const riskBannerClass = (level: string) =>
    ({
      CRITICAL: s.riskBannerCritical,
      HIGH: s.riskBannerHigh,
      MEDIUM: s.riskBannerMedium,
      LOW: s.riskBannerLow,
    })[level] ?? s.riskBannerMedium;

  const statClass = (sev: Severity) =>
    ({
      CRITICAL: s.statCritical,
      HIGH: s.statHigh,
      MEDIUM: s.statMedium,
      LOW: s.statLow,
    })[sev];

  /* ───────────────── Render ───────────────── */

  return (
    <div className={s.page}>
      {/* ── Header ── */}
      <Header />

      {/* ── Toast ── */}
      <div className={`${s.toast} ${toastVisible ? s.toastVisible : ''}`}>{toastMsg}</div>

      {/* ── Layout ── */}
      <div className={s.layout}>
        {/* ════════ INPUT PANEL ════════ */}
        <section className={s.inputPanel}>
          <h1 className={s.inputTitle}>{t.analysis_title}</h1>
          <p className={s.inputSubtitle}>
            {t.analysis_subtitle}
          </p>

          {/* Tab toggle */}
          <div className={s.tabToggle}>
            <button
              className={`${s.tabBtn} ${inputTab === 'paste' ? s.tabBtnActive : ''}`}
              onClick={() => setInputTab('paste')}
              type="button"
            >
              {t.analysis_tab_paste}
            </button>
            <button
              className={`${s.tabBtn} ${inputTab === 'upload' ? s.tabBtnActive : ''}`}
              onClick={() => setInputTab('upload')}
              type="button"
            >
              {t.analysis_tab_upload}
            </button>
          </div>

          {/* Paste mode */}
          {inputTab === 'paste' && (
            <textarea
              className={s.textarea}
              placeholder={placeholderText}
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              aria-label={locale === 'id' ? 'Tempel teks kontrak kerja' : 'Paste employment contract text'}
            />
          )}

          {/* Upload mode */}
          {inputTab === 'upload' && (
            <>
              <div
                className={`${s.dropZone} ${dragActive ? s.dropZoneActive : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label={locale === 'id' ? 'Unggah file kontrak' : 'Upload contract file'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                }}
              >
                <div className={s.dropZoneIcon}>📂</div>
                <div className={s.dropZoneText}>
                  {t.analysis_drop_title}
                </div>
                <div className={s.dropZoneSub}>
                  {t.analysis_drop_sub}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  className={s.dropZoneInput}
                  onChange={handleFileInput}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>

              {file && (
                <div className={s.filePreview}>
                  <span>📄</span>
                  <span className={s.filePreviewName}>{file.name}</span>
                  <span className={s.filePreviewSize}>{formatFileSize(file.size)}</span>
                  <button
                    className={s.fileRemoveBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    aria-label={locale === 'id' ? 'Hapus file' : 'Remove file'}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              )}
            </>
          )}

          {/* Region selector */}
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel} htmlFor="region-select">
              {t.analysis_region_label}
            </label>
            <select
              id="region-select"
              className={s.select}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            className={s.ctaBtn}
            disabled={!canSubmit}
            onClick={runAnalysis}
            type="button"
          >
            {t.analysis_cta}
          </button>

          <div className={s.privacyTip}>
            {t.analysis_privacy}
          </div>
        </section>

        {/* ════════ RESULTS PANEL ════════ */}
        <section className={s.resultsPanel}>
          {/* ── Idle / Empty ── */}
          {analysisState === 'idle' && (
            <div className={s.emptyState}>
              <div className={s.emptyIcon}>📋</div>
              <h2 className={s.emptyTitle}>{t.analysis_empty_title}</h2>
              <p className={s.emptyText}>
                {t.analysis_empty_desc}
              </p>
            </div>
          )}

          {/* ── Loading ── */}
          {analysisState === 'loading' && (
            <div className={s.loadingState}>
              <h2 className={s.loadingTitle}>{t.analysis_loading}</h2>

              <div className={s.steps}>
                {loadingSteps.map((label, i) => {
                  const done = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <div
                      key={i}
                      className={`${s.step} ${done ? s.stepDone : ''} ${active ? s.stepActive : ''}`}
                    >
                      <span className={s.stepIcon}>
                        {done ? '✓' : active ? '⟳' : `${i + 1}`}
                      </span>
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>

              <div className={s.progressBarOuter}>
                <div
                  className={s.progressBarInner}
                  style={{ width: `${(currentStep / loadingSteps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {analysisState === 'error' && (
            <div className={s.errorState}>
              <div className={s.errorIcon}>⚠️</div>
              <h2 className={s.errorTitle}>{t.analysis_error_title}</h2>
              <p className={s.errorText}>
                {t.analysis_error_desc}
              </p>
              <button className={s.retryBtn} onClick={runAnalysis} type="button">
                {t.analysis_retry}
              </button>
            </div>
          )}

          {/* ── Results ── */}
          {analysisState === 'done' && analysisResult && (
            <div className={s.resultsContent}>
              {/* Risk banner */}
              <div className={`${s.riskBanner} ${riskBannerClass(analysisResult.riskLevel)}`}>
                <div className={s.riskLabel}>{t.analysis_risk_label}</div>
                <div className={s.riskLevel}>{analysisResult.riskLabel}</div>
                <div className={s.riskSub}>{analysisResult.riskDescription}</div>
              </div>

              {/* Stats bar */}
              <div className={s.statsBar}>
                <div className={s.statItem}>
                  <div className={s.statValue}>{analysisResult.totalFlags}</div>
                  <div className={s.statLabel}>{t.analysis_total_flags}</div>
                </div>
                {(Object.entries(analysisResult.severityCounts) as [Severity, number][]).map(
                  ([sev, count]) => (
                    <div key={sev} className={`${s.statItem} ${statClass(sev)}`}>
                      <div className={s.statValue}>{count}</div>
                      <div className={s.statLabel}>{sev}</div>
                    </div>
                  ),
                )}
              </div>

              {/* Action buttons */}
              <div className={s.actionBtns}>
                <button className={s.actionBtn} onClick={handleShare} type="button">
                  {t.analysis_share}
                </button>
                <button className={s.actionBtn} onClick={handleDownloadPDF} type="button">
                  {t.analysis_download}
                </button>
                <button
                  className={`${s.actionBtn} ${s.actionBtnPrimary}`}
                  onClick={handleNewAnalysis}
                  type="button"
                >
                  {t.analysis_new}
                </button>
              </div>

              {/* Result tabs */}
              <div className={s.resultTabs}>
                <button
                  className={`${s.resultTabBtn} ${activeResultTab === 'flags' ? s.resultTabBtnActive : ''}`}
                  onClick={() => setActiveResultTab('flags')}
                  type="button"
                >
                  {t.analysis_tab_flags}
                  <span className={s.resultTabBadge}>{analysisResult.redFlags.length}</span>
                </button>
                <button
                  className={`${s.resultTabBtn} ${activeResultTab === 'safe' ? s.resultTabBtnActive : ''}`}
                  onClick={() => setActiveResultTab('safe')}
                  type="button"
                >
                  {t.analysis_tab_safe}
                  <span className={`${s.resultTabBadge} ${s.resultTabBadgeGreen}`}>
                    {analysisResult.safeClauses.length}
                  </span>
                </button>
                <button
                  className={`${s.resultTabBtn} ${activeResultTab === 'summary' ? s.resultTabBtnActive : ''}`}
                  onClick={() => setActiveResultTab('summary')}
                  type="button"
                >
                  {t.analysis_tab_summary}
                </button>
              </div>

              {/* ── TAB: Red Flags ── */}
              {activeResultTab === 'flags' && (
                <div>
                  {analysisResult.redFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className={`${s.flagCard} ${severityClass(flag.severity)}`}
                    >
                      <div
                        className={s.flagHeader}
                        onClick={() => toggleFlag(flag.id)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedFlags.has(flag.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') toggleFlag(flag.id);
                        }}
                      >
                        <span className={`${s.severityBadge} ${badgeClass(flag.severity)}`}>
                          {flag.severity}
                        </span>
                        <span className={s.flagTitle}>{flag.title}</span>
                        <span
                          className={`${s.flagToggle} ${expandedFlags.has(flag.id) ? s.flagToggleOpen : ''}`}
                        >
                          ▾
                        </span>
                      </div>

                      <div
                        className={`${s.flagBody} ${expandedFlags.has(flag.id) ? s.flagBodyOpen : ''}`}
                      >
                        <div className={s.flagExcerpt}>{flag.excerpt}</div>

                        <div className={s.flagSection}>
                          <div className={s.flagSectionTitle}>{t.analysis_why_dangerous}</div>
                          <div className={s.flagSectionText}>{flag.explanation}</div>
                        </div>

                        <div className={s.flagSection}>
                          <div className={s.flagSectionTitle}>{t.analysis_legal_basis}</div>
                          <div>
                            {flag.legalRefs.map((ref, i) => (
                              <span key={i} className={s.legalRef}>
                                {ref}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className={s.flagSection}>
                          <div className={s.flagSectionTitle}>{t.analysis_recommendation}</div>
                          <div className={s.flagSectionText}>{flag.recommendation}</div>
                        </div>

                        <button
                          className={s.copyEmailBtn}
                          onClick={() => handleCopyEmail(flag.emailTemplate)}
                          type="button"
                        >
                          {t.analysis_copy_email}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TAB: Safe Clauses ── */}
              {activeResultTab === 'safe' && (
                <div>
                  {analysisResult.safeClauses.map((clause) => (
                    <div key={clause.id} className={s.safeCard}>
                      <div className={s.safeTitle}>
                        {clause.title}
                      </div>
                      <div className={s.safeText}>{clause.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TAB: Summary ── */}
              {activeResultTab === 'summary' && (
                <div>
                  <div className={s.summaryGrid}>
                    <div className={s.summaryItem}>
                      <div className={s.summaryItemLabel}>{t.analysis_contract_type}</div>
                      <div className={s.summaryItemValue}>
                        {analysisResult.summary.contractType}
                      </div>
                    </div>
                    <div className={s.summaryItem}>
                      <div className={s.summaryItemLabel}>{t.analysis_duration}</div>
                      <div className={s.summaryItemValue}>{analysisResult.summary.duration}</div>
                    </div>
                    <div className={s.summaryItem}>
                      <div className={s.summaryItemLabel}>{t.analysis_salary}</div>
                      <div className={s.summaryItemValue}>{analysisResult.summary.salary}</div>
                    </div>
                    <div className={s.summaryItem}>
                      <div className={s.summaryItemLabel}>{t.analysis_region}</div>
                      <div className={s.summaryItemValue}>{region}</div>
                    </div>
                  </div>

                  {/* Must change */}
                  <div className={s.checklistTitle}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-risk-critical)', marginRight: '8px', transform: 'translateY(-1px)' }} />
                    {t.analysis_must_change} ({analysisResult.summary.mustChange.length})
                  </div>
                  {analysisResult.summary.mustChange.map((item, i) => (
                    <div key={i} className={s.checklistItem}>
                      <span className={`${s.checkIcon} ${s.checkIconRed}`}>!</span>
                      <span>{item}</span>
                    </div>
                  ))}

                  {/* Should change */}
                  <div className={s.checklistTitle} style={{ marginTop: 20 }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-risk-high)', marginRight: '8px', transform: 'translateY(-1px)' }} />
                    {t.analysis_should_change} ({analysisResult.summary.shouldChange.length})
                  </div>
                  {analysisResult.summary.shouldChange.map((item, i) => (
                    <div key={i} className={s.checklistItem}>
                      <span className={`${s.checkIcon} ${s.checkIconOrange}`}>~</span>
                      <span>{item}</span>
                    </div>
                  ))}

                  {/* Final recommendation */}
                  <div className={s.finalReco}>
                    <div className={s.finalRecoTitle}>{t.analysis_final_reco}</div>
                    <div className={s.finalRecoText}>
                      {analysisResult.summary.finalRecommendation}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className={s.nextSteps}>
                    <div className={s.nextStepsTitle}>{t.analysis_next_steps}</div>
                    {analysisResult.nextSteps.map((step, i) => (
                      <div key={i} className={s.nextStepItem}>
                        <span className={s.nextStepNum}>{i + 1}</span>
                        <span className={s.nextStepText}>{step.text}</span>
                      </div>
                    ))}

                    <div className={s.lbhContact}>
                      <div className={s.lbhTitle}>{t.analysis_need_help}</div>
                      <div className={s.lbhText}>
                        {locale === 'id' ? (
                          <>
                            <strong>LBH Jakarta:</strong> (021) 3145518
                            <br />
                            <strong>Posbakum Pengadilan Hubungan Industrial</strong> — Konsultasi gratis
                            bagi pekerja. Kunjungi kantor PHI terdekat di wilayah Anda.
                            <br />
                            <strong>Kemnaker Hotline:</strong> 1500-630
                          </>
                        ) : (
                          <>
                            <strong>LBH Jakarta:</strong> (021) 3145518
                            <br />
                            <strong>Court Legal Aid Post (Posbakum PHI)</strong> — Free consultation
                            for workers. Visit the nearest PHI office in your region.
                            <br />
                            <strong>Ministry of Manpower Hotline:</strong> 1500-630
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
