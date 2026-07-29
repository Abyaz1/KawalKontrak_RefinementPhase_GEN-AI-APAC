/* ============================================================
   KawalKontrak.ai — UMK (Upah Minimum Kota/Kabupaten) Database
   Data UMK 2025 untuk wilayah-wilayah utama Indonesia.

   Dasar hukum kenaikan 2025: Permenaker No. 16 Tahun 2024
   (kenaikan upah minimum 6,5% dari nilai 2024).

   PENTING — VERIFIKASI BERKALA & LIMITASI:
   1. Angka di bawah dikompilasi dari publikasi Keputusan Gubernur
      masing-masing provinsi. Sebelum rilis produksi, verifikasi ulang
      setiap nilai terhadap Kepgub resmi (jdih.kemenaker.go.id) dan
      perbarui setiap kali tahun berganti. Nilai yang salah berarti
      flag UMK yang salah kepada pengguna.
   2. Berdasarkan regulasi PP No. 49 Tahun 2025, mekanisme UMK mungkin berubah.
      Nilai saat ini hanya valid untuk 2025 dan harus diverifikasi untuk 2026.
   3. Basis data ini HANYA MENCANGKUP 13 wilayah utama. Ini adalah batasan sadar
      (known limitation) untuk fase saat ini.
   ============================================================ */

export interface UMKData {
  /** Nama kota/wilayah */
  region: string;
  /** Provinsi */
  province: string;
  /** UMK bulanan dalam Rupiah */
  umk_monthly: number;
  /** Label tampilan, e.g. 'Rp 5.396.761' */
  umk_formatted: string;
  /** Tahun data */
  year: number;
}

function formatRupiah(value: number): string {
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
}

function umk(region: string, province: string, umk_monthly: number, year = 2025): UMKData {
  return { region, province, umk_monthly, umk_formatted: formatRupiah(umk_monthly), year };
}

/**
 * Database UMK/UMP 2025 wilayah-wilayah utama Indonesia.
 * Jakarta memakai UMP DKI (tidak ada UMK per kota administratif).
 */
export const umkDatabase: UMKData[] = [
  umk('Jakarta', 'DKI Jakarta', 5396761),
  umk('Surabaya', 'Jawa Timur', 4961753),
  umk('Bandung', 'Jawa Barat', 4482914),
  umk('Bekasi', 'Jawa Barat', 5690752),
  umk('Karawang', 'Jawa Barat', 5599593),
  umk('Depok', 'Jawa Barat', 5195721),
  umk('Tangerang', 'Banten', 4901117),
  umk('Semarang', 'Jawa Tengah', 3454827),
  umk('Medan', 'Sumatera Utara', 4014072),
  umk('Makassar', 'Sulawesi Selatan', 3880137),
  umk('Yogyakarta', 'DI Yogyakarta', 2655041),
  umk('Denpasar', 'Bali', 3298116),
  umk('Batam', 'Kepulauan Riau', 4989766),
];

/**
 * Daftar wilayah untuk dropdown UI — diturunkan dari database agar
 * tidak pernah tidak sinkron, ditambah opsi 'Lainnya' (lewati cek UMK).
 */
export const UMK_REGIONS: string[] = [...umkDatabase.map((d) => d.region), 'Lainnya'];

/**
 * Cari data UMK berdasarkan nama wilayah.
 * Mengembalikan undefined jika wilayah tidak ditemukan.
 */
export function getUMKByRegion(region: string): UMKData | undefined {
  return umkDatabase.find(
    (d) => d.region.toLowerCase() === region.toLowerCase()
  );
}

/* ── Ekstraksi gaji dari teks kontrak ─────────────────────────────

   Perbaikan hasil audit: heuristik lama mengambil ANGKA PERTAMA yang
   ditemukan, sehingga nominal denda/ganti rugi bisa keliru dianggap
   gaji dan memicu flag UMK CRITICAL yang salah. Versi ini membaca
   KONTEKS di sekitar angka:
     1. Prioritas: angka yang dekat kata gaji/upah/salary.
     2. Angka yang dekat kata denda/penalti/ganti rugi DIKECUALIKAN.
     3. Fallback: angka pertama yang tidak berkonteks denda.        */

const SALARY_CONTEXT = /(gaji|upah|honorarium|salary|wage|remunerasi|penghasilan|take\s*home\s*pay)/i;
const PENALTY_CONTEXT = /(denda|penalti|pinalti|ganti\s*rugi|sanksi|potongan|fine|penalty|deposit|jaminan)/i;

/** Jarak (karakter) ke belakang/depan untuk membaca konteks angka. */
const CONTEXT_WINDOW = 90;

interface SalaryCandidate {
  value: number;
  isSalaryContext: boolean;
  isPenaltyContext: boolean;
}

function classifyCandidate(text: string, matchIndex: number, value: number): SalaryCandidate {
  const before = text.slice(Math.max(0, matchIndex - CONTEXT_WINDOW), matchIndex);
  const after = text.slice(matchIndex, matchIndex + CONTEXT_WINDOW);
  const context = before + ' ' + after;
  return {
    value,
    isSalaryContext: SALARY_CONTEXT.test(context),
    isPenaltyContext: PENALTY_CONTEXT.test(context),
  };
}

/**
 * Mengubah string nominal rupiah menjadi angka.
 * Menangani pemisah ribuan titik/koma dan 2 digit desimal
 * ("5.000.000,00" → 5000000, bukan 500000000).
 */
function parseRupiahNumber(raw: string): number {
  const withoutDecimals = raw.replace(/[.,]\d{1,2}$/, '');
  const digits = withoutDecimals.replace(/[^\d]/g, '');
  return parseInt(digits, 10);
}

/**
 * Ekstrak angka gaji dari teks kontrak.
 * Mengembalikan angka dalam Rupiah atau null jika tidak ditemukan.
 */
export function extractSalaryFromText(text: string): number | null {
  const candidates: SalaryCandidate[] = [];

  // Pattern 1: "Rp 5.000.000" / "Rp5.000.000" / "Rp 5,000,000" / "Rp 5.000.000,-"
  const rpPattern = /[Rr]p\.?\s*([\d.,]+)/g;
  let match: RegExpExecArray | null;
  while ((match = rpPattern.exec(text)) !== null) {
    const num = parseRupiahNumber(match[1]);
    // Hanya terima angka yang masuk akal sebagai gaji bulanan
    if (num >= 500_000 && num <= 1_000_000_000) {
      candidates.push(classifyCandidate(text, match.index, num));
    }
  }

  // Pattern 2: "X juta" atau "X,X juta"
  const jutaPattern = /([\d.,]+)\s*juta/gi;
  while ((match = jutaPattern.exec(text)) !== null) {
    const numStr = match[1].replace(/\./g, '').replace(/,/g, '.');
    const num = Math.round(parseFloat(numStr) * 1_000_000);
    if (num >= 500_000 && num <= 1_000_000_000) {
      candidates.push(classifyCandidate(text, match.index, num));
    }
  }

  if (candidates.length === 0) return null;

  // 1. Prioritas tertinggi: konteks gaji eksplisit (dan bukan konteks denda)
  const salaryMatch = candidates.find((c) => c.isSalaryContext && !c.isPenaltyContext);
  if (salaryMatch) return salaryMatch.value;

  // 2. Konteks gaji walaupun ambigu (gaji dan denda disebut berdekatan)
  const looseSalaryMatch = candidates.find((c) => c.isSalaryContext);
  if (looseSalaryMatch) return looseSalaryMatch.value;

  // 3. Fallback: angka pertama yang TIDAK berkonteks denda
  const neutral = candidates.find((c) => !c.isPenaltyContext);
  return neutral ? neutral.value : null;
}

/**
 * Validasi gaji terhadap UMK wilayah.
 * Mengembalikan pesan peringatan atau null jika gaji memenuhi UMK.
 */
export function validateSalaryAgainstUMK(
  salary: number,
  region: string,
  locale: string = 'id'
): { warning: string; umk: UMKData } | null {
  const umkData = getUMKByRegion(region);
  if (!umkData) return null;

  if (salary < umkData.umk_monthly) {
    const deficit = umkData.umk_monthly - salary;
    const deficitFormatted = new Intl.NumberFormat('id-ID').format(deficit);
    const salaryFormatted = new Intl.NumberFormat('id-ID').format(salary);

    const warning =
      locale === 'en'
        ? `MINIMUM WAGE WARNING: The detected salary (Rp ${salaryFormatted}) is below the ${umkData.region} ${umkData.year} minimum wage (${umkData.umk_formatted}). Shortfall: Rp ${deficitFormatted}. Under Law No. 6/2023 Article 88 and Government Regulation No. 36/2021, employers are prohibited from paying below the applicable minimum wage.`
        : `PERINGATAN UMK: Gaji yang terdeteksi (Rp ${salaryFormatted}) berada di bawah UMK ${umkData.region} ${umkData.year} (${umkData.umk_formatted}). Kekurangan: Rp ${deficitFormatted}. Berdasarkan UU No. 6 Tahun 2023 Pasal 88 dan PP No. 36/2021, pengusaha dilarang membayar upah di bawah upah minimum.`;

    return { warning, umk: umkData };
  }

  return null;
}
