/**
 * KawalKontrak.ai — API Route: Proxy ke Python AI Backend
 * =========================================================
 *
 * Rute ini berfungsi sebagai **proxy** antara frontend Next.js dan
 * server Python FastAPI yang menjalankan multi-agent pipeline.
 *
 * Alur:
 *   1. Terima request dari browser (kontrak teks, region, locale).
 *   2. Validasi input dasar (panjang, format).
 *   3. Teruskan ke Python backend di http://127.0.0.1:8000/analyze.
 *   4. Setelah respons diterima, jalankan validasi UMK deterministik
 *      (tidak bergantung AI) untuk memastikan pelanggaran upah minimum
 *      tidak pernah terlewat.
 *   5. Kembalikan hasil ke browser.
 *
 * Jika Python backend tidak tersedia, rute ini akan otomatis fallback
 * ke local-engine (pattern matching lokal) agar UI tidak mati total.
 *
 * Konfigurasi:
 *   PYTHON_BACKEND_URL di .env.local (default: http://127.0.0.1:8000)
 */

import { NextResponse } from 'next/server';
import { analyzeContractLocal } from '@/lib/local-engine';
import { extractSalaryFromText, validateSalaryAgainstUMK } from '@/lib/umk-database';

// ── Konstanta ──────────────────────────────────────────────────────────────

/** Batas panjang teks kontrak: 1 MB (sesuai TRD input validation) */
const MAX_CONTRACT_LENGTH = 1_000_000;

/** Minimal panjang teks agar analisis bermakna */
const MIN_CONTRACT_LENGTH = 50;

/**
 * URL server Python FastAPI.
 * Baca dari env var PYTHON_BACKEND_URL, fallback ke localhost:8000.
 */
const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL ?? 'http://127.0.0.1:8000';


// ── Handler ────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // 1. Parse request body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Format request tidak valid.' } },
      { status: 400 },
    );
  }

  const { contractText, region = '', locale = 'id' } = body as {
    contractText?: string;
    region?: string;
    locale?: string;
  };

  // 2. Validasi input
  if (!contractText || typeof contractText !== 'string' || contractText.trim() === '') {
    return NextResponse.json(
      { error: { code: 'INVALID_INPUT', message: 'Teks kontrak tidak valid atau kosong.' } },
      { status: 400 },
    );
  }
  if (contractText.length > MAX_CONTRACT_LENGTH) {
    return NextResponse.json(
      { error: { code: 'FILE_TOO_LARGE', message: 'Teks kontrak melebihi batas 1 MB.' } },
      { status: 413 },
    );
  }
  if (contractText.trim().length < MIN_CONTRACT_LENGTH) {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_INPUT',
          message: 'Teks kontrak terlalu pendek. Pastikan seluruh isi kontrak tertempel.',
        },
      },
      { status: 422 },
    );
  }

  // 3. Teruskan ke Python backend (dengan fallback ke local engine)
  let result: Record<string, unknown>;

  try {
    const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractText, region, locale }),
      // Timeout 120 detik — pipeline 5-agent membutuhkan waktu lebih lama
      signal: AbortSignal.timeout(120_000),
    });

    if (!pythonResponse.ok) {
      const errorBody = await pythonResponse.json().catch(() => ({}));
      throw new Error(`Python backend error ${pythonResponse.status}: ${JSON.stringify(errorBody)}`);
    }

    result = await pythonResponse.json();
    console.log('[API Proxy] Python backend berhasil merespons.');

  } catch (proxyError) {
    // Fallback: Python backend tidak tersedia → gunakan local pattern matching
    console.warn('[API Proxy] Python backend tidak tersedia, fallback ke local engine:', proxyError);
    const localResult = await analyzeContractLocal(contractText, locale ?? 'id');
    result = localResult as unknown as Record<string, unknown>;
  }

  // 4. Validasi UMK deterministik (berjalan terlepas dari sumber analisis)
  //    Memastikan pelanggaran upah minimum tidak pernah terlewatkan oleh AI.
  if (region && region !== 'Lainnya') {
    const detectedSalary = extractSalaryFromText(contractText);
    if (detectedSalary) {
      const umkCheck = validateSalaryAgainstUMK(detectedSalary, region);
      const currentFlags = result.red_flags as Array<{ flag_id: string }> ?? [];
      const alreadyFlagged = currentFlags.some((f) => f.flag_id === 'RF_UMK');

      if (umkCheck && !alreadyFlagged) {
        (result.red_flags as unknown[]).unshift({
          flag_id: 'RF_UMK',
          severity: 'CRITICAL',
          pasal_kontrak: (
            `Gaji terdeteksi: Rp ${new Intl.NumberFormat('id-ID').format(detectedSalary)} — ` +
            `UMK ${umkCheck.umk.region} ${umkCheck.umk.year}: ${umkCheck.umk.umk_formatted}`
          ),
          potensi_masalah: umkCheck.warning,
          referensi_uu: [
            {
              peraturan: 'UU No. 6 Tahun 2023',
              pasal: '88',
              judul: 'Upah Minimum',
              ketentuan_relevan: 'Pengusaha dilarang membayar upah lebih rendah dari upah minimum.',
            },
            {
              peraturan: 'PP No. 36 Tahun 2021',
              pasal: 'Upah Minimum',
              judul: 'Larangan Upah di Bawah Minimum',
              ketentuan_relevan:
                'Pengusaha dilarang membayar upah lebih rendah dari Upah Minimum yang berlaku di wilayah tempat pekerja bekerja.',
            },
          ],
          rekomendasi_negosiasi: (
            `Negosiasikan kenaikan gaji minimal ke ${umkCheck.umk.umk_formatted} ` +
            `sesuai UMK ${umkCheck.umk.region} ${umkCheck.umk.year}. ` +
            `Jika perusahaan menolak, laporkan ke Dinas Ketenagakerjaan setempat.`
          ),
          analogi_sederhana:
            'Bayangkan Anda membeli barang seharga Rp 100.000, tapi hanya dibayar Rp 70.000. ' +
            'Itulah yang terjadi ketika gaji Anda di bawah upah minimum.',
          email_template: (
            `Yth. HRD,\n\nSaya ingin mendiskusikan besaran gaji dalam kontrak kerja saya. ` +
            `Berdasarkan UU No. 6 Tahun 2023 Pasal 88 dan ` +
            `UMK ${umkCheck.umk.region} ${umkCheck.umk.year} sebesar ${umkCheck.umk.umk_formatted}, ` +
            `gaji yang ditawarkan masih di bawah ketentuan minimum.\n\nMohon dapat disesuaikan.\n\nTerima kasih.`
          ),
        });
        result.risk_level = 'CRITICAL';
      }
    }
  }

  // 5. Kembalikan hasil ke browser
  return NextResponse.json(result);
}
