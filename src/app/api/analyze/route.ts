import { NextResponse } from 'next/server';
import { analyzeWithGemini, analyzeContractLocal } from '@/lib/analysis-engine';
import { extractSalaryFromText, validateSalaryAgainstUMK } from '@/lib/umk-database';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contractText, useAI = true, region = '' } = body;

    if (!contractText || typeof contractText !== 'string' || contractText.trim() === '') {
      return NextResponse.json({ error: 'Teks kontrak tidak valid atau kosong' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    let result;
    if (useAI && apiKey) {
      console.log('Analyzing contract using Gemini API...');
      result = await analyzeWithGemini(contractText, apiKey);
    } else {
      console.log('Analyzing contract using Local Engine...');
      result = await analyzeContractLocal(contractText);
    }

    // UMK Validation — check salary against regional minimum wage
    if (region && region !== 'Lainnya') {
      const detectedSalary = extractSalaryFromText(contractText);
      if (detectedSalary) {
        const umkCheck = validateSalaryAgainstUMK(detectedSalary, region);
        if (umkCheck) {
          // Add UMK warning as a CRITICAL red flag
          result.red_flags.unshift({
            flag_id: 'RF_UMK',
            severity: 'CRITICAL',
            pasal_kontrak: `Gaji terdeteksi: Rp ${new Intl.NumberFormat('id-ID').format(detectedSalary)} — UMK ${umkCheck.umk.region} ${umkCheck.umk.year}: ${umkCheck.umk.umk_formatted}`,
            potensi_masalah: umkCheck.warning,
            referensi_uu: [{
              peraturan: 'UU No. 6 Tahun 2023',
              pasal: '88',
              judul: 'Upah Minimum',
              ketentuan_relevan: 'Pengusaha dilarang membayar upah lebih rendah dari upah minimum.'
            }, {
              peraturan: 'PP No. 36 Tahun 2021',
              pasal: '23',
              judul: 'Pengupahan',
              ketentuan_relevan: 'Upah minimum berlaku bagi pekerja/buruh dengan masa kerja kurang dari 1 tahun pada perusahaan yang bersangkutan.'
            }],
            rekomendasi_negosiasi: `Negosiasikan kenaikan gaji minimal ke ${umkCheck.umk.umk_formatted} sesuai UMK ${umkCheck.umk.region} ${umkCheck.umk.year}. Jika perusahaan menolak, laporkan ke Dinas Ketenagakerjaan setempat.`,
            analogi_sederhana: 'Bayangkan Anda membeli barang seharga Rp 100.000, tapi hanya dibayar Rp 70.000. Itulah yang terjadi ketika gaji Anda di bawah upah minimum.',
            email_template: `Yth. HRD,\n\nSaya ingin mendiskusikan besaran gaji dalam kontrak kerja saya. Berdasarkan UU No. 6 Tahun 2023 Pasal 88 dan UMK ${umkCheck.umk.region} ${umkCheck.umk.year} sebesar ${umkCheck.umk.umk_formatted}, gaji yang ditawarkan masih di bawah ketentuan minimum.\n\nMohon dapat disesuaikan.\n\nTerima kasih.`
          });

          // Recalculate risk level to CRITICAL
          result.risk_level = 'CRITICAL';
        }
      }
    }

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal saat menganalisis kontrak' },
      { status: 500 }
    );
  }
}
