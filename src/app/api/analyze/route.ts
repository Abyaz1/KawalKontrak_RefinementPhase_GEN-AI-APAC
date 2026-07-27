/**
 * KawalKontrak.ai — API Route: Proxy Streaming ke Python AI Backend
 * ===================================================================
 *
 * Rute ini adalah proxy antara frontend Next.js dan server Python
 * FastAPI yang menjalankan multi-agent pipeline.
 *
 * Respons SELALU berupa NDJSON stream (application/x-ndjson):
 *   {"type":"stage","stage":"extractor","status":"running"}   ← progres riil
 *   {"type":"stage","stage":"extractor","status":"done",...}
 *   ...
 *   {"type":"result","data":{...AnalysisResult...}}           ← hasil akhir
 *
 * Alur:
 *   1. Rate limiting per IP (proteksi biaya — audit C1).
 *   2. Validasi input dasar (panjang, format).
 *   3. Teruskan ke Python /analyze/stream dengan header shared-secret
 *      (audit C2), lalu pipe event progres apa adanya ke browser (FR-06).
 *   4. Event 'result' dicegat: validasi UMK deterministik dijalankan
 *      (tidak bergantung AI, ter-lokalisasi) sebelum diteruskan.
 *   5. Jika backend Python tidak tersedia → fallback ke local-engine,
 *      tetap dikirim dalam format NDJSON yang sama.
 *
 * Konfigurasi (.env.local):
 *   PYTHON_BACKEND_URL     (default: http://127.0.0.1:8000)
 *   BACKEND_SHARED_SECRET  (harus sama dengan backend_python/.env)
 */

import { analyzeContractLocal } from '@/lib/local-engine';
import { checkRateLimit, getClientIp, incrementActive, decrementActive } from '@/lib/rate-limit';
import { extractSalaryFromText, validateSalaryAgainstUMK } from '@/lib/umk-database';
import type { AnalysisResult, RedFlag } from '@/types';

// ── Konstanta ──────────────────────────────────────────────────────────────

/** Batas panjang teks kontrak: 1 MB (sesuai TRD input validation) */
const MAX_CONTRACT_LENGTH = 1_000_000;

/** Minimal panjang teks agar analisis bermakna */
const MIN_CONTRACT_LENGTH = 50;

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL ?? 'http://127.0.0.1:8000';

const BACKEND_SHARED_SECRET = process.env.BACKEND_SHARED_SECRET ?? '';

const NDJSON_HEADERS = {
  'Content-Type': 'application/x-ndjson; charset=utf-8',
  'Cache-Control': 'no-cache',
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────

function jsonError(code: string, message: string, status: number, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function ndjsonLine(obj: unknown): string {
  return JSON.stringify(obj) + '\n';
}

/**
 * Validasi UMK deterministik (audit: kini ter-lokalisasi & dengan guard).
 * Berjalan terlepas dari sumber analisis (AI atau lokal) sehingga
 * pelanggaran upah minimum tidak pernah terlewat.
 */
function applyUmkValidation(
  result: AnalysisResult,
  contractText: string,
  region: string,
  locale: string,
): AnalysisResult {
  if (!region || region === 'Lainnya') return result;

  const detectedSalary = extractSalaryFromText(contractText);
  if (!detectedSalary) return result;

  const umkCheck = validateSalaryAgainstUMK(detectedSalary, region, locale);
  if (!umkCheck) return result;

  // Guard: pastikan red_flags selalu array sebelum dimodifikasi (audit B7)
  if (!Array.isArray(result.red_flags)) result.red_flags = [];
  if (result.red_flags.some((f) => f.flag_id === 'RF_UMK')) return result;

  const salaryFormatted = new Intl.NumberFormat('id-ID').format(detectedSalary);
  const isEn = locale === 'en';

  const umkFlag: RedFlag = {
    flag_id: 'RF_UMK',
    severity: 'CRITICAL',
    pasal_kontrak: isEn
      ? `Detected salary: Rp ${salaryFormatted} — ${umkCheck.umk.region} minimum wage ${umkCheck.umk.year}: ${umkCheck.umk.umk_formatted}`
      : `Gaji terdeteksi: Rp ${salaryFormatted} — UMK ${umkCheck.umk.region} ${umkCheck.umk.year}: ${umkCheck.umk.umk_formatted}`,
    potensi_masalah: umkCheck.warning,
    referensi_uu: [
      {
        peraturan: 'UU No. 6 Tahun 2023',
        pasal: '88',
        judul: isEn ? 'Minimum Wage' : 'Upah Minimum',
        ketentuan_relevan: isEn
          ? 'Employers are prohibited from paying wages below the minimum wage.'
          : 'Pengusaha dilarang membayar upah lebih rendah dari upah minimum.',
      },
      {
        peraturan: 'PP No. 36 Tahun 2021',
        pasal: 'Upah Minimum',
        judul: isEn ? 'Prohibition of Sub-Minimum Wages' : 'Larangan Upah di Bawah Minimum',
        ketentuan_relevan: isEn
          ? 'Employers are prohibited from paying wages lower than the minimum wage applicable in the region where the worker is employed.'
          : 'Pengusaha dilarang membayar upah lebih rendah dari Upah Minimum yang berlaku di wilayah tempat pekerja bekerja.',
      },
    ],
    rekomendasi_negosiasi: isEn
      ? `Negotiate a salary increase to at least ${umkCheck.umk.umk_formatted} per the ${umkCheck.umk.region} ${umkCheck.umk.year} minimum wage. If the company refuses, report it to the local Manpower Office (Dinas Ketenagakerjaan).`
      : `Negosiasikan kenaikan gaji minimal ke ${umkCheck.umk.umk_formatted} sesuai UMK ${umkCheck.umk.region} ${umkCheck.umk.year}. Jika perusahaan menolak, laporkan ke Dinas Ketenagakerjaan setempat.`,
    analogi_sederhana: isEn
      ? 'Imagine buying an item priced at Rp 100,000 but only being paid Rp 70,000 for it. That is what happens when your salary is below the minimum wage.'
      : 'Bayangkan Anda membeli barang seharga Rp 100.000, tapi hanya dibayar Rp 70.000. Itulah yang terjadi ketika gaji Anda di bawah upah minimum.',
    email_template: isEn
      ? `Dear HR,\n\nI would like to discuss the salary stated in my employment contract. Based on Law No. 6 of 2023 Article 88 and the ${umkCheck.umk.region} ${umkCheck.umk.year} minimum wage of ${umkCheck.umk.umk_formatted}, the offered salary is below the legal minimum.\n\nI kindly request an adjustment.\n\nThank you.`
      : `Yth. HRD,\n\nSaya ingin mendiskusikan besaran gaji dalam kontrak kerja saya. Berdasarkan UU No. 6 Tahun 2023 Pasal 88 dan UMK ${umkCheck.umk.region} ${umkCheck.umk.year} sebesar ${umkCheck.umk.umk_formatted}, gaji yang ditawarkan masih di bawah ketentuan minimum.\n\nMohon dapat disesuaikan.\n\nTerima kasih.`,
  };

  result.red_flags.unshift(umkFlag);
  result.risk_level = 'CRITICAL';
  return result;
}

/** Respons fallback (local engine) dalam format NDJSON yang sama. */
async function localFallbackResponse(
  contractText: string,
  region: string,
  locale: string,
): Promise<Response> {
  const localResult = await analyzeContractLocal(contractText, locale);
  const finalResult = applyUmkValidation(localResult, contractText, region, locale);
  const body =
    ndjsonLine({ type: 'stage', stage: 'local_fallback', status: 'done' }) +
    ndjsonLine({ type: 'result', data: finalResult });
  return new Response(body, { headers: NDJSON_HEADERS });
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // 1. Rate limiting per IP (proteksi biaya API)
  const ip = getClientIp(req);
  const rl = checkRateLimit(`analyze:${ip}`, { perMinute: 6, perHour: 30 });
  if (!rl.allowed) {
    return jsonError(
      'RATE_LIMITED',
      'Terlalu banyak permintaan. Silakan coba lagi beberapa saat lagi.',
      429,
      { 'Retry-After': String(rl.retryAfterSeconds) },
    );
  }
  
  if (!incrementActive(`concurrent:${ip}`, 5)) {
    return jsonError(
      'CONCURRENCY_LIMITED',
      'Terlalu banyak analisis berjalan bersamaan. Tunggu proses yang sedang berjalan selesai.',
      429,
    );
  }

  try {
    // 2. Parse & validasi input
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonError('INVALID_JSON', 'Format request tidak valid.', 400);
    }

  const { contractText, region = '', locale = 'en' } = body as {
    contractText?: string;
    region?: string;
    locale?: string;
  };

  if (!contractText || typeof contractText !== 'string' || contractText.trim() === '') {
    return jsonError('INVALID_INPUT', 'Teks kontrak tidak valid atau kosong.', 400);
  }
  if (contractText.length > MAX_CONTRACT_LENGTH) {
    return jsonError('FILE_TOO_LARGE', 'Teks kontrak melebihi batas 1 MB.', 413);
  }
  if (contractText.trim().length < MIN_CONTRACT_LENGTH) {
    return jsonError(
      'INVALID_INPUT',
      'Teks kontrak terlalu pendek. Pastikan seluruh isi kontrak tertempel.',
      422,
    );
  }

  const safeLocale = locale === 'en' ? 'en' : 'id';
  const safeRegion = typeof region === 'string' ? region : '';

  // 3. Teruskan ke Python backend (streaming), fallback ke local engine
  let upstream: Response;
  try {
    upstream = await fetch(`${PYTHON_BACKEND_URL}/analyze/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(BACKEND_SHARED_SECRET ? { 'x-backend-secret': BACKEND_SHARED_SECRET } : {}),
      },
      body: JSON.stringify({ contractText, region: safeRegion, locale: safeLocale }),
      // Menggunakan req.signal (agar batal jika user menutup tab) ATAU timeout 3 menit.
      signal: req.signal ? (AbortSignal as any).any([req.signal, AbortSignal.timeout(180_000)]) : AbortSignal.timeout(180_000),
    });
    if (!upstream.ok || !upstream.body) {
      throw new Error(`Python backend error ${upstream.status}`);
    }
  } catch (proxyError) {
    console.warn('[API Proxy] Python backend tidak tersedia, fallback ke local engine:', proxyError);
    return localFallbackResponse(contractText, safeRegion, safeLocale);
  }

  // 4. Pipe NDJSON dari backend → browser, cegat event 'result' untuk UMK
  const upstreamBody = upstream.body;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstreamBody.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = '';

      const processLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        let event: { type?: string; data?: AnalysisResult };
        try {
          event = JSON.parse(trimmed);
        } catch {
          return; // Baris korup — abaikan, jangan matikan stream
        }
        if (event.type === 'result' && event.data) {
          event.data = applyUmkValidation(event.data, contractText, safeRegion, safeLocale);
        }
        controller.enqueue(encoder.encode(ndjsonLine(event)));
      };

      try {
        for (;;) {
          if (req.signal.aborted) {
            await reader.cancel();
            break;
          }
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let newlineIdx: number;
          while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
            processLine(buffer.slice(0, newlineIdx));
            buffer = buffer.slice(newlineIdx + 1);
          }
        }
        if (!req.signal.aborted) {
          processLine(buffer); // Sisa buffer tanpa newline penutup
          controller.close();
        }
      } catch (streamError: any) {
        if (streamError?.name !== 'AbortError') {
          console.error('[API Proxy] Stream terputus:', streamError);
          try { controller.error(streamError); } catch {}
        }
      } finally {
        try { reader.releaseLock(); } catch {}
      }
    },
  });

  return new Response(stream, { headers: NDJSON_HEADERS });
}
