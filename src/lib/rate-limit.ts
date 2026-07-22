/**
 * KawalKontrak.ai — Rate Limiter Sederhana (per-IP, in-memory)
 * =============================================================
 *
 * Perbaikan hasil audit (C1): satu request analisis = beberapa panggilan
 * Gemini. Tanpa pembatasan, siapa pun bisa menghabiskan kuota/budget API
 * dengan loop sederhana. Limiter ini membatasi frekuensi per alamat IP
 * dengan sliding window dua tingkat (per menit + per jam).
 *
 * Catatan deployment: state disimpan in-memory per instance — cukup untuk
 * satu instance Cloud Run/dev. Untuk multi-instance, ganti backing store
 * dengan Redis/Memorystore (antarmuka fungsi tidak perlu berubah).
 */

interface RateLimitResult {
  allowed: boolean;
  /** Detik yang disarankan sebelum mencoba lagi (untuk header Retry-After) */
  retryAfterSeconds: number;
}

interface RateLimitOptions {
  perMinute?: number;
  perHour?: number;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
/** Batas jumlah key yang dilacak agar memori tidak tumbuh tanpa batas */
const MAX_TRACKED_KEYS = 5_000;

// key → daftar timestamp request (ms) dalam 1 jam terakhir
const buckets = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  { perMinute = 6, perHour = 30 }: RateLimitOptions = {},
): RateLimitResult {
  const now = Date.now();

  const history = (buckets.get(key) ?? []).filter((t) => now - t < HOUR_MS);
  const lastMinute = history.filter((t) => now - t < MINUTE_MS);

  if (lastMinute.length >= perMinute) {
    const oldest = Math.min(...lastMinute);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + MINUTE_MS - now) / 1000)),
    };
  }
  if (history.length >= perHour) {
    const oldest = Math.min(...history);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + HOUR_MS - now) / 1000)),
    };
  }

  history.push(now);
  buckets.set(key, history);

  // Jaga ukuran map: buang key terlama saat melewati batas
  if (buckets.size > MAX_TRACKED_KEYS) {
    const firstKey = buckets.keys().next().value;
    if (firstKey !== undefined) buckets.delete(firstKey);
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Ambil alamat IP client dari request (di belakang proxy/CDN). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
