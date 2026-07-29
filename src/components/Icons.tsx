/**
 * Icons: pustaka ikon garis monokrom untuk seluruh antarmuka.
 *
 * Semua ikon memakai `currentColor`, jadi warnanya mengikuti warna teks
 * induknya dan otomatis benar di tema terang maupun gelap. Ukuran default
 * 1em supaya ikon menyatu dengan baris teks di sekitarnya.
 *
 * Ikon ini menggantikan emoji berwarna agar tampilan tetap satu gaya dengan
 * ikon garis yang sudah dipakai di beranda (lihat src/app/page.tsx).
 */

import type { SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Ukuran sisi (px atau satuan CSS). Default: 1em, mengikuti font-size. */
  size?: number | string;
}

/** Atribut dasar yang dipakai semua ikon. */
function base({ size = '1em', ...rest }: IconProps): SVGProps<SVGSVGElement> {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    width: size,
    height: size,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: 'false',
    ...rest,
  };
}

/* ─────────── Status & peringatan ─────────── */

/** Segitiga peringatan, pengganti ⚠️ */
export const AlertTriangleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10.3 3.9 1.9 18.2a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9.2v4.4" />
    <path d="M12 17.3h.01" />
  </svg>
);

/** Lingkaran silang, pengganti ❌ */
export const CircleCrossIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.8 9.2 9.2 14.8M9.2 9.2l5.6 5.6" />
  </svg>
);

/** Lingkaran centang, pengganti ✅ */
export const CircleCheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.2 12.2l2.6 2.6 5-5.4" />
  </svg>
);

/** Centang polos, pengganti ✓ pada tahapan pipeline */
export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 12.5l5 5 10-11" />
  </svg>
);

/** Lingkaran informasi, pengganti ℹ️ */
export const InfoIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11.2v5" />
    <path d="M12 7.8h.01" />
  </svg>
);

/** Lingkaran tanya, pengganti ❓ */
export const HelpCircleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.4 9.3a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.7-2.6 2.7" />
    <path d="M12 16.6h.01" />
  </svg>
);

/** Perisai peringatan, pengganti 🚨 (temuan paling kritis) */
export const ShieldAlertIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2.7l7.5 3v5.1c0 4.7-3.2 8-7.5 9.5-4.3-1.5-7.5-4.8-7.5-9.5V5.7z" />
    <path d="M12 8.4v3.9" />
    <path d="M12 15.6h.01" />
  </svg>
);

/** Perisai bercentang, pengganti 🛡️ */
export const ShieldCheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2.7l7.5 3v5.1c0 4.7-3.2 8-7.5 9.5-4.3-1.5-7.5-4.8-7.5-9.5V5.7z" />
    <path d="M8.8 11.9l2.4 2.4 4.2-4.5" />
  </svg>
);

/* ─────────── Berkas & unggahan ─────────── */

/** Map terbuka, pengganti 📂 */
export const FolderOpenIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 8V6.5A1.5 1.5 0 0 1 4.5 5h4.2l2 2.4h6.8A1.5 1.5 0 0 1 19 8.9V10" />
    <path d="M3.4 10.6h17.2a1 1 0 0 1 .97 1.24l-1.6 6.4a1.5 1.5 0 0 1-1.46 1.14H5.5a1.5 1.5 0 0 1-1.46-1.14l-1.6-6.4A1 1 0 0 1 3.4 10.6z" />
  </svg>
);

/** Dokumen teks, pengganti 📄 */
export const FileTextIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 12.5h6M9 16h4" />
  </svg>
);

/** Papan klip, pengganti 📋 */
export const ClipboardIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="8" y="3" width="8" height="4" rx="1.2" />
    <path d="M16 5h1.5A1.5 1.5 0 0 1 19 6.5v12A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-12A1.5 1.5 0 0 1 6.5 5H8" />
    <path d="M9 11.5h6M9 15h4" />
  </svg>
);

/** Kamera, pengganti 📷 */
export const CameraIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7.8h3l1.5-2.3h7L17 7.8h3a1.5 1.5 0 0 1 1.5 1.5v8.2A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5V9.3A1.5 1.5 0 0 1 4 7.8z" />
    <circle cx="12" cy="13.2" r="3.3" />
  </svg>
);

/** Gambar, pengganti 🖼️ */
export const ImageIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <circle cx="8.5" cy="10" r="1.5" />
    <path d="M3.5 17.2l4.7-4.4a1.6 1.6 0 0 1 2.2 0l4.3 4.1" />
    <path d="M13.6 14.7l2-1.8a1.6 1.6 0 0 1 2.2 0l2.7 2.5" />
  </svg>
);

/** Gunting, pengganti ✂️ (kontrak dipotong) */
export const ScissorsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="6.2" cy="6.4" r="2.6" />
    <circle cx="6.2" cy="17.6" r="2.6" />
    <path d="M8.5 7.9 20 18.4" />
    <path d="M8.5 16.1 20 5.6" />
  </svg>
);

/* ─────────── Aksi ─────────── */

/** Tempat sampah, pengganti 🗑️ */
export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16" />
    <path d="M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7" />
    <path d="M6.2 7l.9 12a2 2 0 0 0 2 1.9h5.8a2 2 0 0 0 2-1.9l.9-12" />
    <path d="M10.2 11v6M13.8 11v6" />
  </svg>
);

/** Panah melingkar, pengganti 🔄 */
export const RefreshIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.4 11a8.5 8.5 0 0 0-14.6-4.3L3.6 8.9" />
    <path d="M3.6 13a8.5 8.5 0 0 0 14.6 4.3l2.2-2.2" />
    <path d="M3.6 4.6v4.3h4.3" />
    <path d="M20.4 19.4v-4.3h-4.3" />
  </svg>
);

/** Spinner tahapan yang sedang berjalan, pengganti ⟳ */
export const SpinnerIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.2a8.8 8.8 0 1 0 8.8 8.8" />
  </svg>
);

/** Tutup / hapus, pengganti ✕ */
export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

/* ─────────── Mesin analisis ─────────── */

/** Kaca pembesar, penanda mesin pola lokal (pengganti 🔍) */
export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="10.8" cy="10.8" r="6.3" />
    <path d="M15.4 15.4 20.5 20.5" />
  </svg>
);

/** Cip pemroses, penanda analisis AI (pengganti 🤖) */
export const ChipIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <path d="M10 3.5v3M14 3.5v3M10 17.5v3M14 17.5v3" />
    <path d="M3.5 10h3M3.5 14h3M17.5 10h3M17.5 14h3" />
  </svg>
);

/** Bola lampu, pengganti 💡 (panduan/tips) */
export const LightbulbIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9.2 17.2a6 6 0 1 1 5.6 0" />
    <path d="M9.6 17.5h4.8" />
    <path d="M10.4 20.4h3.2" />
  </svg>
);

/** Jam riwayat, pengganti 🕘 */
export const HistoryIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.6 12a8.4 8.4 0 1 0 2.6-6.1" />
    <path d="M3.5 4.4v4.2h4.2" />
    <path d="M12 7.9V12l2.9 1.7" />
  </svg>
);

/** Jam pasir / proses berjalan, pengganti ⏳ */
export const HourglassIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 3.5h10M7 20.5h10" />
    <path d="M8 3.5v3.1c0 1.6 4 3.5 4 5.4 0 1.9-4 3.8-4 5.4v3.1" />
    <path d="M16 3.5v3.1c0 1.6-4 3.5-4 5.4 0 1.9 4 3.8 4 5.4v3.1" />
  </svg>
);

/* ─────────── Kontrol antarmuka ─────────── */

/** Matahari, pengganti ☀️ */
export const SunIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.6v2.2M12 19.2v2.2M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.4 19.6 6 18M18 6l1.6-1.6" />
  </svg>
);

/** Bulan sabit, pengganti 🌙 */
export const MoonIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.5 14.4A8.6 8.6 0 0 1 9.6 3.5a8.6 8.6 0 1 0 10.9 10.9z" />
  </svg>
);

/** Bola dunia, pengganti 🌐 */
export const GlobeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.2 12h17.6" />
    <path d="M12 3a13.6 13.6 0 0 1 0 18 13.6 13.6 0 0 1 0-18z" />
  </svg>
);

/** Panah bawah, chevron akordeon */
export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);

/** Timbangan, penanda dokumen hukum */
export const ScaleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v16" />
    <path d="M8 20h8" />
    <path d="M5 7h14" />
    <path d="M5 7 2.5 12.2h5z" />
    <path d="M19 7l-2.5 5.2h5z" />
  </svg>
);
