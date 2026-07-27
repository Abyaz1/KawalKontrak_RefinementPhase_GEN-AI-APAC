'use client';

import { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from 'react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useI18n } from '@/lib/i18n';
import type {
  AnalysisResult as ApiAnalysisResult,
  PipelineEvent,
} from '@/types';
import { UMK_REGIONS } from '@/lib/umk-database';
import { DEMO_CONTRACT_RISKY, DEMO_CONTRACT_FAIR } from '@/lib/demo-contracts';
import { useAuth } from '@/context/AuthContext';
import { saveContractAnalysis, getUserAnalyses, deleteUserAnalysis } from '@/lib/firebase-db';
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
  excerpt: string;
}

interface ReviewClauseUI {
  id: number;
  excerpt: string;
  topic: string;
  reason: string;
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
  reviewClauses: ReviewClauseUI[];
  summary: Summary;
  nextSteps: NextStep[];
  disclaimer: string;
  /** 'ai' | 'local' — badge transparansi engine */
  engine: 'ai' | 'local';
  cached: boolean;
  verifierWarning: boolean;
  truncatedWarning: boolean;
}

type AnalysisState = 'idle' | 'loading' | 'done' | 'error';
type InputTab = 'paste' | 'upload' | 'photo';
type ResultTab = 'flags' | 'safe' | 'review' | 'contract' | 'summary';

/* Status tahapan pipeline riil (FR-06) */
interface StageState {
  id: string;
  status: 'pending' | 'running' | 'done';
  note?: string;
}

const PIPELINE_STAGE_IDS = [
  'extractor',
  'legal_matcher',
  'risk_grader',
  'verifier',
  'negotiator',
] as const;

/* ──────────────── Constants ──────────────── */

const SEVERITY_ORDER: Record<Severity, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

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

function newHistoryId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `H-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ──────────────── PDF/TXT file reader ──────────────── */

async function readFileAsText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'txt') {
    return file.text();
  }

  if (ext === 'pdf') {
    // Dynamic import of pdf.js for client-side PDF parsing.
    // Worker di-bundle lokal (perbaikan audit B5: tanpa CDN eksternal).
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      pages.push(text);
    }

    const pdfText = pages.join('\n\n');
    if (!pdfText.trim()) {
      throw new Error('PDF berisi gambar hasil scan tanpa teks yang bisa dibaca. Silakan gunakan tab "Dari Foto/Scan" untuk mengekstrak teksnya.');
    }
    return pdfText;
  }

  throw new Error('Format file tidak didukung. Gunakan PDF atau TXT.');
}

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

/* ──────────────── Highlight in-situ (teks kontrak) ──────────────── */

type HighlightType = 'critical' | 'high' | 'medium' | 'low' | 'safe';

interface HighlightSegment {
  text: string;
  type: HighlightType | 'normal';
}

/** Cari posisi excerpt di teks kontrak (exact → prefix 60 karakter). */
function findExcerptRange(text: string, excerpt: string): [number, number] | null {
  const clean = excerpt.trim();
  if (clean.length < 12) return null;
  let idx = text.indexOf(clean);
  if (idx !== -1) return [idx, idx + clean.length];
  const prefix = clean.slice(0, 60);
  idx = text.indexOf(prefix);
  if (idx !== -1) return [idx, idx + prefix.length];
  return null;
}

function buildHighlightSegments(
  text: string,
  redFlags: RedFlag[],
  safeClauses: SafeClause[],
): HighlightSegment[] {
  const ranges: { start: number; end: number; type: HighlightType }[] = [];

  const tryAdd = (excerpt: string, type: HighlightType) => {
    const range = findExcerptRange(text, excerpt);
    if (!range) return;
    const [start, end] = range;
    // Lewati jika tumpang tindih dengan range yang sudah ada
    if (ranges.some((r) => start < r.end && end > r.start)) return;
    ranges.push({ start, end, type });
  };

  for (const flag of redFlags) {
    tryAdd(flag.excerpt, flag.severity.toLowerCase() as HighlightType);
  }
  for (const clause of safeClauses) {
    tryAdd(clause.excerpt, 'safe');
  }

  ranges.sort((a, b) => a.start - b.start);

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) segments.push({ text: text.slice(cursor, r.start), type: 'normal' });
    segments.push({ text: text.slice(r.start, r.end), type: r.type });
    cursor = r.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), type: 'normal' });
  return segments;
}

/* ──────────────── Component ──────────────── */

export default function AnalisisPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();

  const placeholderText = locale === 'id' ? PLACEHOLDER_TEXT_ID : PLACEHOLDER_TEXT_EN;

  /* input state */
  const [inputTab, setInputTab] = useState<InputTab>('paste');
  const [contractText, setContractText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileText, setFileText] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [region, setRegion] = useState('Jakarta');
  const [dragActive, setDragActive] = useState(false);

  /* photo state (FR-01) */
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoText, setPhotoText] = useState('');
  const [photoWarning, setPhotoWarning] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  /* results state */
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<ResultTab>('flags');
  const [expandedFlags, setExpandedFlags] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* progres pipeline riil (FR-06) */
  const [stages, setStages] = useState<StageState[]>([]);

  /* teks yang terakhir dianalisis — untuk tab highlight kontrak.
     Sengaja TIDAK ikut disimpan ke riwayat/cloud (privacy-first). */
  const [analyzedText, setAnalyzedText] = useState<string | null>(null);

  /* history state */
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  /* toast */
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* refs */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  /* ──── helpers ──── */

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2600);
  }, []);

  /* Load/Sync history based on auth state */
  useEffect(() => {
    async function syncAndFetchHistory() {
      if (user) {
        try {
          // 1. Sync local history to Firestore if it exists
          const localEntries = loadHistory();
          if (localEntries.length > 0) {
            for (const entry of localEntries) {
              await saveContractAnalysis(user.uid, entry);
            }
            localStorage.removeItem(HISTORY_KEY);
            showToast(locale === 'id' ? '🔄 Riwayat disinkronkan ke akun Anda!' : '🔄 History synced to your account!');
          }

          // 2. Fetch history from Firestore
          const dbHistory = await getUserAnalyses<AnalysisResult>(user.uid);
          setHistory(dbHistory);
        } catch (error) {
          console.error('Gagal memuat riwayat dari Firestore:', error);
          setHistory(loadHistory());
        }
      } else {
        setHistory(loadHistory());
      }
    }
    syncAndFetchHistory();
  }, [user, locale, showToast]);

  const activeText =
    inputTab === 'paste' ? contractText : inputTab === 'upload' ? (fileText ?? '') : photoText;

  const canSubmit = analysisState !== 'loading' && !isTranscribing && activeText.trim().length > 0;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /* ──── file handling (PDF/TXT) ──── */

  const processDocumentFile = useCallback(async (selected: File) => {
    setFileError(null);
    setFile(selected);
    try {
      const text = await readFileAsText(selected);
      setFileText(text);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Gagal membaca file');
      setFileText(null);
    }
  }, []);

  const handleFileDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) await processDocumentFile(droppedFile);
  }, [processDocumentFile]);

  const handleFileInput = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) await processDocumentFile(selected);
  }, [processDocumentFile]);

  /* ──── photo handling (FR-01: transkripsi via Gemini Vision) ──── */

  const processPhotoFile = useCallback(async (selected: File) => {
    setPhotoError(null);
    setPhotoWarning(null);
    setPhotoText('');

    if (!IMAGE_MIME_TYPES.has(selected.type)) {
      setPhotoError(
        locale === 'id'
          ? 'Format foto harus JPG, PNG, atau WebP.'
          : 'Photo must be JPG, PNG, or WebP.',
      );
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setPhotoError(
        locale === 'id' ? 'Ukuran foto maksimal 10 MB.' : 'Photo size is limited to 10 MB.',
      );
      return;
    }

    setPhotoFile(selected);
    setIsTranscribing(true);
    try {
      const imageBase64 = await fileToBase64(selected);
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType: selected.type, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error?.message ??
            (locale === 'id' ? 'Transkripsi foto gagal.' : 'Photo transcription failed.'),
        );
      }
      setPhotoText(data.text ?? '');
      setPhotoWarning(data.warning ?? null);
    } catch (err) {
      setPhotoError(
        err instanceof Error
          ? err.message
          : locale === 'id'
            ? 'Transkripsi foto gagal.'
            : 'Photo transcription failed.',
      );
      setPhotoFile(null);
    } finally {
      setIsTranscribing(false);
    }
  }, [locale]);

  const handlePhotoInput = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) await processPhotoFile(selected);
  }, [processPhotoFile]);

  /* ──── demo mode (FR-14) ──── */

  const loadDemoContract = useCallback((variant: 'risky' | 'fair') => {
    setInputTab('paste');
    setContractText(variant === 'risky' ? DEMO_CONTRACT_RISKY : DEMO_CONTRACT_FAIR);
  }, []);

  /* ──── adaptasi hasil API → state UI ──── */

  const adaptApiResult = useCallback((apiData: ApiAnalysisResult): AnalysisResult => {
    const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    apiData.red_flags?.forEach((f) => {
      if (severityCounts[f.severity] !== undefined) {
        severityCounts[f.severity]++;
      }
    });

    const riskLevel = apiData.risk_level || 'LOW';
    const riskLabel =
      riskLevel === 'CRITICAL' ? t.analysis_risk_critical
      : riskLevel === 'HIGH' ? t.analysis_risk_high
      : riskLevel === 'MEDIUM' ? t.analysis_risk_medium
      : t.analysis_risk_low;

    const makeTitle = (text: string | undefined, fallback: string, max: number) => {
      if (!text) return fallback;
      return text.length > max ? text.slice(0, max) + '…' : text;
    };

    const metadata = apiData.metadata;

    return {
      riskLevel,
      riskLabel,
      riskDescription: locale === 'id'
        ? 'Berikut adalah hasil analisis kontrak Anda berdasarkan perundang-undangan.'
        : 'Below are the results of your contract analysis based on legislation.',
      totalFlags: apiData.red_flags?.length || 0,
      severityCounts,
      redFlags: (apiData.red_flags || []).map((f, i) => ({
        id: i + 1,
        severity: f.severity,
        title: makeTitle(
          f.potensi_masalah,
          locale === 'id' ? 'Klausul Bermasalah' : 'Problematic Clause',
          70,
        ),
        excerpt: f.pasal_kontrak || '',
        explanation: f.potensi_masalah || '',
        legalRefs: f.referensi_uu?.map((r) => `${r.peraturan} Pasal ${r.pasal}`) || [],
        recommendation: f.rekomendasi_negosiasi || '',
        emailTemplate: f.email_template || '',
      })),
      safeClauses: (apiData.klausul_aman || []).map((c, i) => ({
        id: i + 1,
        title: makeTitle(c.terjemahan, locale === 'id' ? 'Klausul Aman' : 'Safe Clause', 60),
        description: c.terjemahan || '',
        excerpt: c.pasal_kontrak || '',
      })),
      reviewClauses: (apiData.klausul_tinjauan || []).map((c, i) => ({
        id: i + 1,
        excerpt: c.pasal_kontrak || '',
        topic: c.topik || '',
        reason: c.alasan || '',
      })),
      summary: {
        contractType: apiData.ringkasan?.jenis || (locale === 'id' ? 'Tidak Diketahui' : 'Unknown'),
        duration: apiData.ringkasan?.durasi || '-',
        salary: apiData.ringkasan?.gaji_bulanan || '-',
        mustChange: apiData.ringkasan?.harus_diubah || [],
        shouldChange: apiData.ringkasan?.sebaiknya_diubah || [],
        finalRecommendation: locale === 'id'
          ? 'Silakan pelajari langkah berikutnya untuk negosiasi.'
          : 'Please study the next steps for negotiation.',
      },
      nextSteps: (apiData.langkah_berikutnya || []).map((step: string) => ({ text: step })),
      disclaimer: apiData.disclaimer || (locale === 'id'
        ? 'Analisis ini dihasilkan oleh AI dan bukan nasihat hukum yang mengikat. Untuk kasus serius, konsultasikan dengan LBH atau advokat profesional.'
        : 'This analysis is AI-generated and does not constitute binding legal advice. For serious cases, consult LBH or a professional lawyer.'),
      engine: metadata?.engine === 'local-pattern-matching' ? 'local' : 'ai',
      cached: metadata?.cached === true,
      verifierWarning: metadata?.verifier_status === 'failed_open',
      truncatedWarning: metadata?.truncated === true,
    };
  }, [t, locale]);

  /* ──── analysis submit (streaming NDJSON — FR-06) ──── */

  const runAnalysis = useCallback(async () => {
    const textToAnalyze = activeText;
    if (!textToAnalyze.trim()) return;

    setAnalysisState('loading');
    setErrorMsg(null);
    setExpandedFlags(new Set());
    setActiveResultTab('flags');
    setStages(PIPELINE_STAGE_IDS.map((id) => ({ id, status: 'pending' })));

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText: textToAnalyze, region, locale }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error?.message ?? `API error (${res.status})`);
      }

      let apiData: ApiAnalysisResult | null = null;
      const contentType = res.headers.get('content-type') ?? '';

      if (contentType.includes('ndjson') && res.body) {
        // Konsumsi stream NDJSON: progres riil per agent
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const handleEvent = (event: PipelineEvent) => {
          if (event.type === 'stage') {
            setStages((prev) => {
              const next = prev.some((st) => st.id === event.stage)
                ? prev.map((st) =>
                    st.id === event.stage
                      ? { ...st, status: event.status === 'done' ? 'done' as const : 'running' as const }
                      : st,
                  )
                : [...prev, { id: event.stage, status: event.status === 'done' ? 'done' as const : 'running' as const }];
              // Cache hit / fallback lokal: tandai semua tahap selesai
              if (event.stage === 'cache' || event.stage === 'local_fallback') {
                return next.map((st) => ({ ...st, status: 'done' as const }));
              }
              return next;
            });
          } else if (event.type === 'result') {
            apiData = event.data;
          }
        };

        const processLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed) return;
          try {
            handleEvent(JSON.parse(trimmed) as PipelineEvent);
          } catch { /* baris korup — abaikan */ }
        };

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf('\n')) !== -1) {
            processLine(buffer.slice(0, idx));
            buffer = buffer.slice(idx + 1);
          }
        }
        processLine(buffer);
      } else {
        // Fallback: respons JSON biasa
        apiData = await res.json();
      }

      if (!apiData) throw new Error('No result received');

      const adaptedData = adaptApiResult(apiData);
      setStages((prev) => prev.map((st) => ({ ...st, status: 'done' })));
      setAnalyzedText(textToAnalyze);
      setAnalysisResult(adaptedData);
      setAnalysisState('done');

      // Save to history — TANPA teks kontrak mentah (privacy-first)
      const entry: HistoryEntry = {
        id: newHistoryId(),
        date: new Date().toLocaleString(locale === 'id' ? 'id-ID' : 'en-US'),
        riskLevel: adaptedData.riskLevel,
        riskLabel: adaptedData.riskLabel,
        totalFlags: adaptedData.totalFlags,
        result: adaptedData,
      };
      const updated = [entry, ...history];
      setHistory(updated);

      if (user) {
        saveContractAnalysis(user.uid, entry).catch((err) => {
          console.error('Gagal menyimpan ke Firestore:', err);
        });
      } else {
        saveHistory(updated);
      }
    } catch (err) {
      /* tampilkan error yang jujur — jangan pernah menampilkan hasil palsu */
      setErrorMsg(err instanceof Error ? err.message : null);
      setAnalysisState('error');
    }
  }, [activeText, region, locale, history, user, adaptApiResult]);

  /* ──── actions ──── */

  const handleShare = useCallback(() => {
    if (!analysisResult) return;
    // Salin ringkasan hasil (bukan URL halaman — hasil tidak punya permalink)
    const topFindings = analysisResult.redFlags
      .slice(0, 3)
      .map((f, i) => `${i + 1}. [${f.severity}] ${f.title}`)
      .join('\n');
    const summaryText =
      locale === 'id'
        ? `Hasil Analisis KawalKontrak.ai\nTingkat Risiko: ${analysisResult.riskLabel}\nTotal Red Flags: ${analysisResult.totalFlags}\n${topFindings ? `\nTemuan utama:\n${topFindings}\n` : ''}\nCek kontrakmu gratis di ${window.location.origin}`
        : `KawalKontrak.ai Analysis Result\nRisk Level: ${analysisResult.riskLabel}\nTotal Red Flags: ${analysisResult.totalFlags}\n${topFindings ? `\nTop findings:\n${topFindings}\n` : ''}\nCheck your contract for free at ${window.location.origin}`;
    navigator.clipboard.writeText(summaryText);
    showToast(t.analysis_share_copied);
  }, [analysisResult, locale, showToast, t]);

  const handleDownloadPDF = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  const handleNewAnalysis = useCallback(() => {
    setContractText('');
    setFile(null);
    setFileText(null);
    setFileError(null);
    setPhotoFile(null);
    setPhotoText('');
    setPhotoWarning(null);
    setPhotoError(null);
    setAnalysisState('idle');
    setAnalysisResult(null);
    setAnalyzedText(null);
    setStages([]);
    setErrorMsg(null);
    setExpandedFlags(new Set());
    setActiveResultTab('flags');
  }, []);

  /* ──── history actions ──── */

  const handleViewHistory = useCallback((entry: HistoryEntry) => {
    // Riwayat tidak menyimpan teks kontrak (privasi) → tab highlight nonaktif
    setAnalyzedText(null);
    setAnalysisResult({
      ...entry.result,
      reviewClauses: entry.result.reviewClauses ?? [],
      engine: entry.result.engine ?? 'ai',
      cached: entry.result.cached ?? false,
      verifierWarning: entry.result.verifierWarning ?? false,
      truncatedWarning: entry.result.truncatedWarning ?? false,
    });
    setAnalysisState('done');
    setActiveResultTab('flags');
    setExpandedFlags(new Set());
  }, []);

  const handleDeleteHistory = useCallback(async (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);

    if (user) {
      try {
        await deleteUserAnalysis(user.uid, id);
        showToast(locale === 'id' ? '🗑️ Riwayat dihapus dari cloud' : '🗑️ History deleted from cloud');
      } catch (err) {
        console.error('Gagal menghapus riwayat dari Firestore:', err);
        showToast(locale === 'id' ? '❌ Gagal menghapus riwayat cloud' : '❌ Failed to delete cloud history');
      }
    } else {
      saveHistory(updated);
      showToast(locale === 'id' ? '🗑️ Riwayat dihapus' : '🗑️ Entry deleted');
    }
  }, [history, user, locale, showToast]);

  const handleClearHistory = useCallback(async () => {
    if (history.length === 0) return;

    setHistory([]);
    if (user) {
      try {
        const deletePromises = history.map((item) => deleteUserAnalysis(user.uid, item.id));
        await Promise.all(deletePromises);
        showToast(locale === 'id' ? '🗑️ Semua riwayat akun dihapus' : '🗑️ All account history cleared');
      } catch (err) {
        console.error('Gagal membersihkan riwayat dari Firestore:', err);
        showToast(locale === 'id' ? '❌ Gagal membersihkan riwayat cloud' : '❌ Failed to clear cloud history');
      }
    } else {
      localStorage.removeItem(HISTORY_KEY);
      showToast(locale === 'id' ? '🗑️ Semua riwayat lokal dihapus' : '🗑️ All local history cleared');
    }
  }, [history, user, locale, showToast]);


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
      showToast(t.analysis_email_copied);
    },
    [showToast, t],
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

  const highlightClass = (type: HighlightType) =>
    ({
      critical: s.hlCritical,
      high: s.hlHigh,
      medium: s.hlMedium,
      low: s.hlLow,
      safe: s.hlSafe,
    })[type];

  const stageLabel = (id: string): string => {
    const labels: Record<string, string> = {
      cache: t.stage_cache,
      extractor: t.stage_extractor,
      legal_matcher: t.stage_legal_matcher,
      risk_grader: t.stage_risk_grader,
      verifier: t.stage_verifier,
      negotiator: t.stage_negotiator,
      local_fallback: t.stage_local_fallback,
    };
    return labels[id] ?? id;
  };

  /* Progressive disclosure (FR-11): flag paling kritis dulu */
  const sortedFlags = analysisResult
    ? [...analysisResult.redFlags].sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
      )
    : [];
  const heroFlag = sortedFlags[0] ?? null;
  const otherFlags = sortedFlags.slice(1);

  const doneStages = stages.filter((st) => st.status === 'done').length;

  /* render satu kartu flag (dipakai hero + daftar) */
  const renderFlagCard = (flag: RedFlag, forceOpen = false) => {
    const isOpen = forceOpen || expandedFlags.has(flag.id);
    return (
      <div key={flag.id} className={`${s.flagCard} ${severityClass(flag.severity)}`}>
        <div
          className={s.flagHeader}
          onClick={() => !forceOpen && toggleFlag(flag.id)}
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          onKeyDown={(e) => {
            if (!forceOpen && (e.key === 'Enter' || e.key === ' ')) toggleFlag(flag.id);
          }}
        >
          <span className={`${s.severityBadge} ${badgeClass(flag.severity)}`}>
            {flag.severity}
          </span>
          <span className={s.flagTitle}>{flag.title}</span>
          {!forceOpen && (
            <span className={`${s.flagToggle} ${isOpen ? s.flagToggleOpen : ''}`}>▾</span>
          )}
        </div>

        <div className={`${s.flagBody} ${isOpen ? s.flagBodyOpen : ''}`}>
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

          {flag.emailTemplate && (
            <button
              className={s.copyEmailBtn}
              onClick={() => handleCopyEmail(flag.emailTemplate)}
              type="button"
            >
              {t.analysis_copy_email}
            </button>
          )}
        </div>
      </div>
    );
  };

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
            <button
              className={`${s.tabBtn} ${inputTab === 'photo' ? s.tabBtnActive : ''}`}
              onClick={() => setInputTab('photo')}
              type="button"
            >
              📷 {t.analysis_tab_photo}
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
                      setFileText(null);
                      setFileError(null);
                    }}
                    aria-label={locale === 'id' ? 'Hapus file' : 'Remove file'}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              )}

              {fileError && (
                <div role="alert" className={s.inlineError}>
                  ⚠️ {fileError}
                </div>
              )}
            </>
          )}

          {/* Photo mode (FR-01 + FR-10) */}
          {inputTab === 'photo' && (
            <>
              {/* Panduan foto (FR-10) — tampil SEBELUM upload */}
              <div className={s.photoGuide}>
                <div className={s.photoGuideTitle}>💡 {t.analysis_photo_guide_title}</div>
                <ul className={s.photoGuideList}>
                  {(locale === 'id'
                    ? [
                        '✅ Foto tegak lurus dari atas, seluruh halaman terlihat',
                        '✅ Pencahayaan terang dan merata (tanpa bayangan)',
                        '✅ Teks tajam — cek dulu apakah bisa Anda baca sendiri',
                        '❌ Hindari foto miring, buram, atau terpotong',
                        '❌ Hindari pantulan cahaya/flash pada kertas',
                      ]
                    : [
                        '✅ Shoot straight from above, whole page visible',
                        '✅ Bright, even lighting (no shadows)',
                        '✅ Sharp text — check you can read it yourself first',
                        '❌ Avoid tilted, blurry, or cropped photos',
                        '❌ Avoid light/flash glare on the paper',
                      ]
                  ).map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div
                className={s.dropZone}
                onClick={() => photoInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label={locale === 'id' ? 'Unggah foto kontrak' : 'Upload contract photo'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') photoInputRef.current?.click();
                }}
              >
                <div className={s.dropZoneIcon}>📷</div>
                <div className={s.dropZoneText}>
                  {locale === 'id'
                    ? 'Klik untuk memilih foto kontrak'
                    : 'Click to select a contract photo'}
                </div>
                <div className={s.dropZoneSub}>
                  {locale === 'id' ? 'Format: JPG, PNG, WebP · Maks 10 MB' : 'Format: JPG, PNG, WebP · Max 10 MB'}
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  className={s.dropZoneInput}
                  onChange={handlePhotoInput}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>

              {photoFile && !isTranscribing && (
                <div className={s.filePreview}>
                  <span>🖼️</span>
                  <span className={s.filePreviewName}>{photoFile.name}</span>
                  <span className={s.filePreviewSize}>{formatFileSize(photoFile.size)}</span>
                  <button
                    className={s.fileRemoveBtn}
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoText('');
                      setPhotoWarning(null);
                      setPhotoError(null);
                    }}
                    aria-label={locale === 'id' ? 'Hapus foto' : 'Remove photo'}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              )}

              {isTranscribing && (
                <div className={s.noticeBox} role="status">
                  ⏳ {t.analysis_photo_processing}
                </div>
              )}

              {photoError && (
                <div role="alert" className={s.inlineError}>
                  ⚠️ {photoError}
                </div>
              )}

              {photoWarning && (
                <div className={s.noticeBoxWarning} role="alert">
                  ⚠️ {photoWarning}
                </div>
              )}

              {photoText && !isTranscribing && (
                <>
                  <div className={s.noticeBox}>{t.analysis_photo_review_hint}</div>
                  <textarea
                    className={s.textarea}
                    value={photoText}
                    onChange={(e) => setPhotoText(e.target.value)}
                    aria-label={
                      locale === 'id' ? 'Hasil transkripsi foto kontrak' : 'Contract photo transcription'
                    }
                  />
                </>
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
              {UMK_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#854d0e', backgroundColor: '#fef9c3', padding: '8px', borderRadius: '4px' }} role="alert">
              ⚠️ Data UMK per 2025 (Permenaker No. 16/2024), harap verifikasi ulang ke Kepgub resmi untuk tahun berjalan.
            </div>
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

          {/* Demo mode (FR-14) */}
          <div className={s.demoRow}>
            <span className={s.demoLabel}>{t.analysis_demo_label}</span>
            <button
              type="button"
              className={`${s.demoBtn} ${s.demoBtnRisky}`}
              onClick={() => loadDemoContract('risky')}
            >
              {t.analysis_demo_risky}
            </button>
            <button
              type="button"
              className={`${s.demoBtn} ${s.demoBtnFair}`}
              onClick={() => loadDemoContract('fair')}
            >
              {t.analysis_demo_safe}
            </button>
          </div>

          {/* ── Riwayat analisis ── */}
          {history.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  🕘 {t.analysis_history_title}
                </span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: 'var(--color-neutral-light, #6B7280)',
                    textDecoration: 'underline',
                  }}
                >
                  {t.analysis_history_clear_all}
                </button>
              </div>
              {history.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    marginBottom: 6,
                    borderRadius: 6,
                    border: '1px solid var(--color-border, #E5E7EB)',
                    fontSize: 13,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleViewHistory(entry)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 2,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'inherit',
                      padding: 0,
                    }}
                    aria-label={
                      locale === 'id'
                        ? `Lihat hasil analisis ${entry.date}`
                        : `View analysis result ${entry.date}`
                    }
                  >
                    <span style={{ fontWeight: 500 }}>
                      {entry.riskLabel} · {entry.totalFlags}{' '}
                      {locale === 'id' ? 'temuan' : 'findings'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-neutral-light, #6B7280)' }}>
                      {entry.date}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteHistory(entry.id)}
                    aria-label={locale === 'id' ? 'Hapus riwayat ini' : 'Delete this entry'}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-neutral-light, #6B7280)',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {user && (
                <div style={{ fontSize: 11, color: 'var(--color-neutral-light, #6B7280)', marginTop: 4 }}>
                  {locale === 'id'
                    ? 'ℹ️ Riwayat berisi kutipan klausul dari kontrak Anda dan tersimpan di akun cloud Anda. Teks kontrak lengkap tidak pernah disimpan.'
                    : 'ℹ️ History contains clause excerpts from your contract and is stored in your cloud account. The full contract text is never stored.'}
                </div>
              )}
            </div>
          )}
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

          {/* ── Loading — progres pipeline RIIL (FR-06) ── */}
          {analysisState === 'loading' && (
            <div className={s.loadingState}>
              <h2 className={s.loadingTitle}>{t.analysis_loading}</h2>

              <div className={s.steps}>
                {stages.map((stage, i) => {
                  const done = stage.status === 'done';
                  const active = stage.status === 'running';
                  return (
                    <div
                      key={stage.id}
                      className={`${s.step} ${done ? s.stepDone : ''} ${active ? s.stepActive : ''}`}
                    >
                      <span className={s.stepIcon}>
                        {done ? '✓' : active ? '⟳' : `${i + 1}`}
                      </span>
                      <span>{stageLabel(stage.id)}</span>
                    </div>
                  );
                })}
              </div>

              <div className={s.progressBarOuter}>
                <div
                  className={s.progressBarInner}
                  style={{
                    width: `${stages.length > 0 ? (doneStages / stages.length) * 100 : 0}%`,
                  }}
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
                {errorMsg ?? t.analysis_error_desc}
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

              {/* Badge transparansi engine */}
              <div className={s.engineRow}>
                <span
                  className={`${s.engineBadge} ${analysisResult.engine === 'local' ? s.engineBadgeLocal : ''}`}
                >
                  {analysisResult.engine === 'local' ? '🔍 ' : '🤖 '}
                  {analysisResult.engine === 'local' ? t.analysis_engine_local : t.analysis_engine_ai}
                  {analysisResult.cached ? ` · ${t.analysis_engine_cached}` : ''}
                </span>
              </div>

              {/* Peringatan integritas hasil */}
              {analysisResult.verifierWarning && (
                <div className={s.noticeBoxWarning} role="alert">
                  ⚠️ {t.analysis_verifier_warning}
                </div>
              )}
              {analysisResult.truncatedWarning && (
                <div className={s.noticeBoxWarning} role="alert">
                  ✂️ {t.analysis_truncated_warning}
                </div>
              )}

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
                {analysisResult.reviewClauses.length > 0 && (
                  <button
                    className={`${s.resultTabBtn} ${activeResultTab === 'review' ? s.resultTabBtnActive : ''}`}
                    onClick={() => setActiveResultTab('review')}
                    type="button"
                  >
                    {t.analysis_tab_review}
                    <span className={`${s.resultTabBadge} ${s.resultTabBadgeAmber}`}>
                      {analysisResult.reviewClauses.length}
                    </span>
                  </button>
                )}
                {analyzedText && (
                  <button
                    className={`${s.resultTabBtn} ${activeResultTab === 'contract' ? s.resultTabBtnActive : ''}`}
                    onClick={() => setActiveResultTab('contract')}
                    type="button"
                  >
                    {t.analysis_tab_contract}
                  </button>
                )}
                <button
                  className={`${s.resultTabBtn} ${activeResultTab === 'summary' ? s.resultTabBtnActive : ''}`}
                  onClick={() => setActiveResultTab('summary')}
                  type="button"
                >
                  {t.analysis_tab_summary}
                </button>
              </div>

              {/* ── TAB: Red Flags (progressive disclosure — FR-11) ── */}
              {activeResultTab === 'flags' && (
                <div>
                  {heroFlag && (
                    <div className={s.criticalHero}>
                      <div className={s.criticalHeroLabel}>
                        🚨 {t.analysis_most_critical}
                      </div>
                      {renderFlagCard(heroFlag, true)}
                    </div>
                  )}

                  {otherFlags.length > 0 && (
                    <>
                      <div className={s.sectionLabel}>
                        {t.analysis_all_findings} ({otherFlags.length})
                      </div>
                      {otherFlags.map((flag) => renderFlagCard(flag))}
                    </>
                  )}
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
                      <div className={s.safeText}>{clause.excerpt || clause.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TAB: Perlu Tinjauan (FR-05) ── */}
              {activeResultTab === 'review' && (
                <div>
                  <div className={s.noticeBox}>{t.analysis_review_note}</div>
                  {analysisResult.reviewClauses.map((clause) => (
                    <div key={clause.id} className={s.reviewCard}>
                      <div className={s.reviewTopic}>❓ {clause.topic}</div>
                      <div className={s.flagExcerpt}>{clause.excerpt}</div>
                      <div className={s.reviewReason}>{clause.reason}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TAB: Teks Kontrak (highlight in-situ) ── */}
              {activeResultTab === 'contract' && analyzedText && (
                <div>
                  <div className={s.noticeBox}>{t.analysis_contract_hint}</div>
                  <div className={s.contractView}>
                    {buildHighlightSegments(
                      analyzedText,
                      analysisResult.redFlags,
                      analysisResult.safeClauses,
                    ).map((seg, i) =>
                      seg.type === 'normal' ? (
                        <span key={i}>{seg.text}</span>
                      ) : (
                        <mark key={i} className={highlightClass(seg.type)}>
                          {seg.text}
                        </mark>
                      ),
                    )}
                  </div>
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

              {/* ── Disclaimer (selalu tampil di setiap hasil) ── */}
              <div
                style={{
                  marginTop: 24,
                  padding: '14px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border, #E5E7EB)',
                  background: 'var(--color-surface-alt, rgba(107,114,128,0.08))',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--color-neutral-light, #6B7280)',
                }}
                role="note"
              >
                ⚠️ {analysisResult.disclaimer}
              </div>

              {/* ── Hidden Container for PDF Export ── */}
              <div id="pdf-export-container" className={s.pdfHiddenContainer}>
                <h1 className={s.pdfTitle}>KawalKontrak.ai - {t.analysis_title || 'Analysis Report'}</h1>
                <div style={{ marginBottom: 16 }}>
                  <p><strong>{t.analysis_contract_type || 'Tipe Kontrak'}:</strong> {analysisResult.summary.contractType}</p>
                  <p><strong>{t.analysis_salary || 'Gaji'}:</strong> {analysisResult.summary.salary}</p>
                  <p><strong>{t.analysis_duration || 'Durasi'}:</strong> {analysisResult.summary.duration}</p>
                  <p><strong>{t.analysis_risk_label || 'Tingkat Risiko'}:</strong> {analysisResult.riskLabel}</p>
                </div>

                <div className={s.pdfSectionTitle}>{t.analysis_tab_summary || 'Ringkasan Akhir'}</div>
                <div className={s.pdfText}>
                  {analysisResult.summary.finalRecommendation}
                </div>

                <div className={s.pdfSectionTitle}>{t.analysis_tab_flags || 'Klausul Berbahaya (Red Flags)'} ({analysisResult.redFlags.length})</div>
                {analysisResult.redFlags.map((flag) => (
                  <div key={flag.id} className={s.pdfCard}>
                    <div className={s.pdfCardTitle}>[{flag.severity}] {flag.title}</div>
                    <div className={s.pdfText}><strong>Teks Kontrak:</strong> {flag.excerpt}</div>
                    <div className={s.pdfText}><strong>Penjelasan:</strong> {flag.explanation}</div>
                    <div className={s.pdfText}><strong>Saran:</strong> {flag.recommendation}</div>
                  </div>
                ))}

                <div className={s.pdfSectionTitle}>{t.analysis_tab_safe || 'Klausul Aman'} ({analysisResult.safeClauses.length})</div>
                {analysisResult.safeClauses.map((clause) => (
                  <div key={clause.id} className={s.pdfCard}>
                    <div className={s.pdfCardTitle}>{clause.title}</div>
                    <div className={s.pdfText}>{clause.excerpt || clause.description}</div>
                  </div>
                ))}

                {analysisResult.reviewClauses.length > 0 && (
                  <>
                    <div className={s.pdfSectionTitle}>{t.analysis_tab_review} ({analysisResult.reviewClauses.length})</div>
                    {analysisResult.reviewClauses.map((clause) => (
                      <div key={clause.id} className={s.pdfCard}>
                        <div className={s.pdfCardTitle}>{clause.topic}</div>
                        <div className={s.pdfText}>{clause.excerpt}</div>
                        <div className={s.pdfText}><em>{clause.reason}</em></div>
                      </div>
                    ))}
                  </>
                )}

                <div style={{ marginTop: 24, fontSize: 11, color: '#6B7280', borderTop: '1px solid #E5E7EB', paddingTop: 12 }}>
                  {analysisResult.disclaimer}
                </div>
              </div>

            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
