/* ============================================================
   KawalKontrak.ai — UMK (Upah Minimum Kota/Kabupaten) Database
   Data UMK 2024 untuk wilayah-wilayah utama Indonesia.
   Sumber: Keputusan Gubernur masing-masing provinsi.
   ============================================================ */

export interface UMKData {
  /** Nama kota/wilayah */
  region: string;
  /** Provinsi */
  province: string;
  /** UMK bulanan dalam Rupiah (2024) */
  umk_monthly: number;
  /** Label tampilan, e.g. 'Rp 5.067.381' */
  umk_formatted: string;
  /** Tahun data */
  year: number;
}

/**
 * Database UMK untuk wilayah-wilayah utama Indonesia.
 * Data berdasarkan Keputusan Gubernur masing-masing provinsi untuk tahun 2024.
 */
export const umkDatabase: UMKData[] = [
  {
    region: 'Jakarta',
    province: 'DKI Jakarta',
    umk_monthly: 5067381,
    umk_formatted: 'Rp 5.067.381',
    year: 2024,
  },
  {
    region: 'Surabaya',
    province: 'Jawa Timur',
    umk_monthly: 4725479,
    umk_formatted: 'Rp 4.725.479',
    year: 2024,
  },
  {
    region: 'Bandung',
    province: 'Jawa Barat',
    umk_monthly: 4209309,
    umk_formatted: 'Rp 4.209.309',
    year: 2024,
  },
  {
    region: 'Medan',
    province: 'Sumatera Utara',
    umk_monthly: 3069315,
    umk_formatted: 'Rp 3.069.315',
    year: 2024,
  },
  {
    region: 'Semarang',
    province: 'Jawa Tengah',
    umk_monthly: 3243969,
    umk_formatted: 'Rp 3.243.969',
    year: 2024,
  },
  {
    region: 'Makassar',
    province: 'Sulawesi Selatan',
    umk_monthly: 3643321,
    umk_formatted: 'Rp 3.643.321',
    year: 2024,
  },
];

/**
 * Cari data UMK berdasarkan nama wilayah.
 * Mengembalikan undefined jika wilayah tidak ditemukan.
 */
export function getUMKByRegion(region: string): UMKData | undefined {
  return umkDatabase.find(
    (d) => d.region.toLowerCase() === region.toLowerCase()
  );
}

/**
 * Ekstrak angka gaji dari teks kontrak.
 * Mencari pola "Rp X.XXX.XXX" atau angka jutaan.
 * Mengembalikan angka dalam Rupiah atau null jika tidak ditemukan.
 */
export function extractSalaryFromText(text: string): number | null {
  // Pattern 1: "Rp 5.000.000" atau "Rp5.000.000" atau "Rp 5,000,000"
  const rpPattern = /[Rr]p\.?\s*([\d.,]+)/g;
  let match;
  const candidates: number[] = [];

  while ((match = rpPattern.exec(text)) !== null) {
    const numStr = match[1].replace(/[.,]/g, '');
    const num = parseInt(numStr, 10);
    // Hanya terima angka yang masuk akal sebagai gaji (> 500.000, < 1.000.000.000)
    if (num >= 500000 && num <= 1000000000) {
      candidates.push(num);
    }
  }

  // Pattern 2: "X juta" atau "X.X juta"
  const jutaPattern = /([\d.,]+)\s*juta/gi;
  while ((match = jutaPattern.exec(text)) !== null) {
    const numStr = match[1].replace(/,/g, '.');
    const num = parseFloat(numStr) * 1000000;
    if (num >= 500000 && num <= 1000000000) {
      candidates.push(num);
    }
  }

  if (candidates.length === 0) return null;

  // Kembalikan nilai yang paling mungkin gaji bulanan (yang pertama ditemukan)
  return candidates[0];
}

/**
 * Validasi gaji terhadap UMK wilayah.
 * Mengembalikan pesan peringatan atau null jika gaji memenuhi UMK.
 */
export function validateSalaryAgainstUMK(
  salary: number,
  region: string
): { warning: string; umk: UMKData } | null {
  const umk = getUMKByRegion(region);
  if (!umk) return null;

  if (salary < umk.umk_monthly) {
    const deficit = umk.umk_monthly - salary;
    const deficitFormatted = new Intl.NumberFormat('id-ID').format(deficit);
    const salaryFormatted = new Intl.NumberFormat('id-ID').format(salary);

    return {
      warning: `⚠️ PERINGATAN UMK: Gaji yang terdeteksi (Rp ${salaryFormatted}) berada di bawah UMK ${umk.region} ${umk.year} (${umk.umk_formatted}). Kekurangan: Rp ${deficitFormatted}. Berdasarkan UU No. 6 Tahun 2023 Pasal 88 dan PP No. 36/2021 Pasal 23, pengusaha dilarang membayar upah di bawah upah minimum.`,
      umk,
    };
  }

  return null;
}
