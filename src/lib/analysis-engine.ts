/* ============================================================
   KawalKontrak.ai — Analysis Engine (RAG-enhanced)

   Pipeline (mengikuti APPFLOW & TECHNICAL_RAG_IMPLEMENTATION):
   1. Deteksi red flag lokal (pattern matching — cepat, offline)
   2. Retrieval pasal UU relevan dari knowledge base (hybrid search)
   3. Bangun prompt: System Prompt v2.0 + konteks RAG + konteks
      regional + hasil deteksi lokal + teks kontrak
   4. Panggil Gemini API (structured JSON output)
   5. Post-process: validasi, disclaimer, metadata
   Fallback: jika Gemini gagal → hasil deteksi lokal
   ============================================================ */

import { redFlagPatterns } from './red-flag-patterns';
import { retrieveRelevantRegulations } from './rag-retrieval';
import { formatChunkForPrompt } from './legal-knowledge-base';
import { getUMKByRegion } from './umk-database';
import {
  AnalysisResult,
  RedFlag,
  SafeClause,
  RiskLevel,
} from '@/types';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_TIMEOUT_MS = 60_000;

export const DISCLAIMER_TEXT =
  'Analisis ini dihasilkan oleh Kecerdasan Buatan (AI) untuk tujuan literasi dan edukasi hukum, BUKAN nasihat hukum yang mengikat. Untuk sengketa serius, hubungi LBH Indonesia (021-315-1405), konsultan hukum profesional, atau serikat pekerja di organisasi Anda.';

// ── Utilities ────────────────────────────────────────────────

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

// ── 1. Local Pattern Matching (fallback / hybrid base) ──────

export async function analyzeContractLocal(contractText: string): Promise<AnalysisResult> {
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
      // Cari kalimat/baris kontrak yang memicu pattern (ekstraksi sederhana)
      const lines = contractText.split('\n');
      let pasal_kontrak = 'Klausul terkait ditemukan dalam dokumen.';
      for (const line of lines) {
        if (pattern.keywords.some((k) => line.toLowerCase().includes(k.toLowerCase()))) {
          pasal_kontrak = line.trim();
          break;
        }
      }

      redFlags.push({
        flag_id: pattern.id,
        severity: pattern.severity,
        pasal_kontrak,
        potensi_masalah: pattern.why_dangerous,
        referensi_uu: pattern.pasal_references,
        rekomendasi_negosiasi: pattern.recommendation,
        analogi_sederhana: pattern.analogy,
        email_template: pattern.email_template,
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
    disclaimer: DISCLAIMER_TEXT,
    metadata: {
      engine: 'local-pattern-matching',
      rag_enabled: false,
      model: null,
    },
  };
}

// ── 2. System Prompt v2.0 (dari PANDUAN_RAG_KawalKontrak.ai) ─

const SYSTEM_PROMPT_V2 = `Anda adalah Asisten Hukum Ketenagakerjaan Indonesia yang empatik, sangat analitis, dan ahli dalam menyederhanakan bahasa hukum yang rumit. Anda dilengkapi dengan database regulasi ketenagakerjaan Indonesia yang up-to-date (UU No. 6 Tahun 2023 dan peraturan pelaksananya).

=== IDENTITAS & PERAN ===
- Nama: KawalKontrak.ai (Asisten Hukum Empatik untuk Pekerja Indonesia)
- Keahlian: Hukum Ketenagakerjaan Indonesia, Simplifikasi Bahasa Hukum, Deteksi Klausul Berbahaya
- Target User: Pekerja kelas menengah-bawah dengan literasi hukum terbatas

=== TUGAS UTAMA ===
1. Analisis mendalam teks Surat Perjanjian Kerja (SPK) yang diberikan
2. Deteksi klausul yang berpotensi melanggar UU Ketenagakerjaan dengan presisi tinggi
3. Terjemahkan kalimat hukum kompleks menjadi bahasa sehari-hari (plain language)
4. Sitasi referensi pasal HANYA dari "REFERENSI REGULASI TERKAIT" yang disediakan di bawah

=== AREA PELANGGARAN PRIORITAS (Red Flag Detector) ===
A. PKWT & ALIH DAYA (UU 2023 Pasal 56-66; PP 35/2021 Pasal 15-17)
   ❌ kontrak dapat diakhiri kapan saja tanpa pesangon
   ❌ tidak berhak kompensasi ketika masa kontrak berakhir
   ❌ bekerja melalui pihak ketiga tanpa jaminan keselamatan kerja
B. WAKTU KERJA, LEMBUR & ISTIRAHAT (UU 2023 Pasal 77-79; PP 35/2021 Pasal 26-29)
   ❌ lembur tidak dibayar atau dibayar di bawah standar (min. 1,5x jam 1-3, 2x jam 4+)
   ❌ tidak ada hari libur mingguan yang dijamin
   ❌ cuti tahunan kurang dari 12 hari atau dikurangi sepihak
C. PENGUPAHAN (UU 2023 Pasal 88, 88A; PP 36/2021)
   ❌ upah di bawah upah minimum regional
   ❌ pengurangan upah tanpa alasan hukum yang sah
   ❌ potongan gaji untuk denda yang tidak jelas
D. KOMPENSASI PHK (UU 2023 Pasal 156-161; PP 35/2021 Pasal 40-52)
   ❌ perusahaan tidak memberikan uang pesangon saat PHK
   ❌ PHK sepihak tanpa prosedur dan alasan yang sah
   ❌ tidak ada kompensasi hak cuti yang belum digunakan

=== FORMAT OUTPUT (STRICT JSON) ===
Balas HANYA dengan JSON valid (tanpa markdown code fence), struktur persis:
{
  "red_flags": [
    {
      "flag_id": "RF_AI_001",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "pasal_kontrak": "Kutipan teks asli klausul berbahaya dari SPK",
      "potensi_masalah": "Penjelasan rinci mengapa berbahaya, dalam bahasa awam",
      "referensi_uu": [
        {
          "peraturan": "UU No. 6 Tahun 2023",
          "pasal": "156",
          "judul": "Judul pasal",
          "ketentuan_relevan": "Isi pasal yang berlawanan dengan klausul kontrak"
        }
      ],
      "rekomendasi_negosiasi": "Saran konkret untuk mengubah/menghapus klausul ini",
      "analogi_sederhana": "Contoh situasi sehari-hari untuk memudahkan pemahaman",
      "email_template": "Template email negosiasi singkat kepada HRD"
    }
  ],
  "klausul_aman": [
    {
      "pasal_kontrak": "Kutipan teks asli klausul yang aman",
      "terjemahan": "Penjelasan bahasa awam apa maksud klausul ini dan kenapa aman",
      "referensi": [{ "peraturan": "...", "pasal": "...", "judul": "...", "ketentuan_relevan": "..." }]
    }
  ],
  "ringkasan": {
    "jenis": "PKWT | PKWTT | Magang | Freelance | dst",
    "durasi": "durasi kontrak jika disebutkan",
    "gaji_bulanan": "gaji jika disebutkan, format 'Rp X.XXX.XXX'",
    "status": "Kontrak ini [TIDAK AMAN|BERISIKO|CUKUP AMAN|AMAN] untuk ditandatangani",
    "harus_diubah": ["poin yang WAJIB diubah (pelanggaran hukum)"],
    "sebaiknya_diubah": ["poin yang direkomendasikan diubah"]
  },
  "risk_level": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "langkah_berikutnya": ["saran aksi konkret berurutan"]
}

=== PRINSIP OPERASIONAL ===
1. AKURASI: Sitasi HANYA pasal yang benar-benar ada di referensi yang disediakan. Jika tidak yakin, nyatakan ketidakpastian. Prioritaskan UU No. 6 Tahun 2023 (terbaru).
2. EMPATIK & ACCESSIBLE: Bahasa mudah dipahami pekerja kelas menengah-bawah, hindari jargon.
3. SENSITIF POWER DYNAMICS: Akui posisi tawar lemah pekerja. Tawarkan negosiasi dulu (bukan langsung gugat). Sebutkan LBH/serikat pekerja sebagai resource gratis.
4. STRUKTUR ANALISIS: (a) baca seluruh SPK, (b) identifikasi struktur kontrak, (c) scan area pelanggaran prioritas, (d) ranking berdasarkan severity, (e) tulis JSON.
5. KETIDAKPASTIAN: Jika klausul ambigu, perlakukan ambiguitas sebagai risiko dan jelaskan.

=== BATASAN & ETIKA ===
- Anda BUKAN pengganti advokat profesional; jangan menjamin outcome hukum
- Jangan mendorong litigasi yang tidak perlu
- Tone: profesional namun accessible, empatik namun objektif, waspada namun optimis
- Bahasa: Indonesia yang baik dan mudah dipahami`;

// ── 3. Retrieval query generation ────────────────────────────

/**
 * Susun query retrieval dari teks kontrak + kategori red flag lokal
 * yang terdeteksi (tanpa panggilan LLM tambahan — hemat latensi).
 */
function buildRetrievalQueries(contractText: string, localFlags: RedFlag[]): string[] {
  const queries: string[] = [];

  // Query 1: potongan awal kontrak (biasanya memuat jenis, durasi, upah)
  queries.push(contractText.slice(0, 1500));

  // Query 2: potongan tengah/akhir (biasanya memuat PHK, sanksi, penutup)
  if (contractText.length > 3000) {
    queries.push(contractText.slice(-1500));
  }

  // Query 3+: deskripsi masalah dari deteksi lokal
  const flagDescriptions = localFlags
    .slice(0, 5)
    .map((f) => f.potensi_masalah.slice(0, 200));
  if (flagDescriptions.length > 0) {
    queries.push(flagDescriptions.join(' '));
  }

  return queries;
}

// ── 4. Gemini API call with RAG context ─────────────────────

interface GeminiParsedResult {
  red_flags?: RedFlag[];
  klausul_aman?: SafeClause[];
  ringkasan?: AnalysisResult['ringkasan'];
  risk_level?: RiskLevel;
  langkah_berikutnya?: string[];
}

async function callGemini(prompt: string, apiKey: string): Promise<GeminiParsedResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT_V2 }],
        },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('Empty response from Gemini');
    }

    try {
      return JSON.parse(textContent);
    } catch {
      // Jaga-jaga jika model membungkus jawaban dengan code fence
      const cleaned = textContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return JSON.parse(cleaned);
    }
  } finally {
    clearTimeout(timer);
  }
}

// ── 5. Main: RAG-enhanced analysis ───────────────────────────

export async function analyzeWithGemini(
  contractText: string,
  apiKey: string,
  region?: string,
): Promise<AnalysisResult> {
  try {
    // Step 1: Deteksi lokal (cepat) — hasilnya menjadi "hint" untuk AI
    const localResult = await analyzeContractLocal(contractText);
    const localFlags = localResult.red_flags;

    // Step 2: Retrieval pasal relevan dari knowledge base (hybrid search)
    const queries = buildRetrievalQueries(contractText, localFlags);
    const retrieved = await retrieveRelevantRegulations(queries, apiKey, 8);

    // Step 3: Bangun prompt dengan konteks RAG
    const ragContext = retrieved
      .map((r) => formatChunkForPrompt(r.chunk))
      .join('\n\n');

    const localHints =
      localFlags.length > 0
        ? localFlags
            .map((f) => `- [${f.severity}] ${f.flag_id}: ${f.potensi_masalah.slice(0, 150)}`)
            .join('\n')
        : '(tidak ada — tetap lakukan analisis mendalam sendiri)';

    let regionalContext = '';
    if (region) {
      const umk = getUMKByRegion(region);
      if (umk) {
        regionalContext = `\n=== KONTEKS REGIONAL ===\nWilayah kerja: ${umk.region}, ${umk.province}\nUMK ${umk.year}: ${umk.umk_formatted} per bulan\nGunakan angka UMK ini saat menilai apakah upah dalam kontrak memenuhi upah minimum.\n`;
      }
    }

    const prompt = `=== REFERENSI REGULASI TERKAIT (hasil retrieval RAG — gunakan HANYA ini untuk sitasi) ===

${ragContext}
${regionalContext}
=== HASIL DETEKSI POLA OTOMATIS (verifikasi kebenarannya terhadap teks kontrak) ===
${localHints}

=== SURAT PERJANJIAN KERJA YANG AKAN DIANALISIS ===

${contractText.slice(0, 30000)}

Analisis kontrak di atas menggunakan referensi regulasi yang telah disediakan. Verifikasi setiap hasil deteksi pola otomatis: jika benar merupakan pelanggaran, sertakan dengan kutipan klausul aslinya; jika false positive, abaikan. Temukan juga pelanggaran lain yang tidak terdeteksi pola otomatis. Output HANYA JSON valid sesuai struktur di system prompt.`;

    // Step 4: Panggil Gemini
    const parsed = await callGemini(prompt, apiKey);

    // Step 5: Post-process & validasi
    const hash = await hashText(contractText);
    const redFlags: RedFlag[] = Array.isArray(parsed.red_flags) ? parsed.red_flags : [];

    return {
      id: `AN-${Date.now()}`,
      status: 'completed',
      created_at: new Date().toISOString(),
      contract_hash: hash,
      red_flags: redFlags,
      klausul_aman: Array.isArray(parsed.klausul_aman) ? parsed.klausul_aman : [],
      ringkasan: parsed.ringkasan ?? {
        jenis: 'Tidak Diketahui',
        status: 'Perlu ditinjau',
        harus_diubah: [],
        sebaiknya_diubah: [],
      },
      risk_level: parsed.risk_level ?? calculateRiskLevel(redFlags),
      langkah_berikutnya:
        Array.isArray(parsed.langkah_berikutnya) && parsed.langkah_berikutnya.length > 0
          ? parsed.langkah_berikutnya
          : ['Review kontrak kembali secara teliti.'],
      disclaimer: DISCLAIMER_TEXT,
      metadata: {
        engine: 'gemini-rag',
        rag_enabled: true,
        model: GEMINI_MODEL,
        retrieved_regulations: retrieved.map(
          (r) => `${r.chunk.sumber} Pasal ${r.chunk.pasal}`,
        ),
      },
    };
  } catch (error) {
    console.error('Gemini RAG analysis failed, falling back to local...', error);
    return analyzeContractLocal(contractText);
  }
}
