import { NextResponse } from 'next/server';
import { analyzeWithGemini, analyzeContractLocal } from '@/lib/analysis-engine';
import { extractSalaryFromText, validateSalaryAgainstUMK } from '@/lib/umk-database';

/** Batas panjang teks kontrak: 1 MB (sesuai TRD input validation) */
const MAX_CONTRACT_LENGTH = 1_000_000;
/** Minimal panjang teks agar analisis bermakna */
const MIN_CONTRACT_LENGTH = 50;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contractText, useAI = true, region = '', locale = 'id' } = body;

    if (!contractText || typeof contractText !== 'string' || contractText.trim() === '') {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Teks kontrak tidak valid atau kosong' } },
        { status: 400 },
      );
    }

    if (contractText.length > MAX_CONTRACT_LENGTH) {
      return NextResponse.json(
        { error: { code: 'FILE_TOO_LARGE', message: 'Teks kontrak melebihi batas 1 MB' } },
        { status: 413 },
      );
    }

    if (contractText.trim().length < MIN_CONTRACT_LENGTH) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Teks kontrak terlalu pendek untuk dianalisis. Pastikan seluruh isi kontrak tertempel.',
          },
        },
        { status: 422 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    let result;
    if (useAI && apiKey) {
      result = await analyzeWithGemini(contractText, apiKey, region, locale);
    } else {
      result = await analyzeContractLocal(contractText);
    }

    // Validasi UMK — cek gaji terhadap upah minimum regional (deterministik,
    // berjalan terlepas dari hasil AI supaya pelanggaran upah tidak terlewat)
    if (region && region !== 'Lainnya') {
      const detectedSalary = extractSalaryFromText(contractText);
      if (detectedSalary) {
        const umkCheck = validateSalaryAgainstUMK(detectedSalary, region);
        const alreadyFlagged = result.red_flags.some((f) => f.flag_id === 'RF_UMK');
        if (umkCheck && !alreadyFlagged) {
          result.red_flags.unshift({
            flag_id: 'RF_UMK',
            severity: 'CRITICAL',
            pasal_kontrak: `Gaji terdeteksi: Rp ${new Intl.NumberFormat('id-ID').format(detectedSalary)} — UMK ${umkCheck.umk.region} ${umkCheck.umk.year}: ${umkCheck.umk.umk_formatted}`,
            potensi_masalah: umkCheck.warning,
            referensi_uu: [{
              peraturan: 'UU No. 6 Tahun 2023',
              pasal: '88',
              judul: 'Upah Minimum',
              ketentuan_relevan: 'Pengusaha dilarang membayar upah lebih rendah dari upah minimum.',
            }, {
              peraturan: 'PP No. 36 Tahun 2021',
              pasal: 'Upah Minimum',
              judul: 'Larangan Upah di Bawah Minimum',
              ketentuan_relevan: 'Pengusaha dilarang membayar upah lebih rendah dari Upah Minimum yang berlaku di wilayah tempat pekerja bekerja.',
            }],
            rekomendasi_negosiasi: `Negosiasikan kenaikan gaji minimal ke ${umkCheck.umk.umk_formatted} sesuai UMK ${umkCheck.umk.region} ${umkCheck.umk.year}. Jika perusahaan menolak, laporkan ke Dinas Ketenagakerjaan setempat.`,
            analogi_sederhana: 'Bayangkan Anda membeli barang seharga Rp 100.000, tapi hanya dibayar Rp 70.000. Itulah yang terjadi ketika gaji Anda di bawah upah minimum.',
            email_template: `Yth. HRD,\n\nSaya ingin mendiskusikan besaran gaji dalam kontrak kerja saya. Berdasarkan UU No. 6 Tahun 2023 Pasal 88 dan UMK ${umkCheck.umk.region} ${umkCheck.umk.year} sebesar ${umkCheck.umk.umk_formatted}, gaji yang ditawarkan masih di bawah ketentuan minimum.\n\nMohon dapat disesuaikan.\n\nTerima kasih.`,
          });

          result.risk_level = 'CRITICAL';
        }
      }
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan internal saat menganalisis kontrak',
        },
      },
      { status: 500 },
    );
  }
}
