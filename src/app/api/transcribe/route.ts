/**
 * KawalKontrak.ai — API Route: Transkripsi Foto Kontrak (FR-01)
 * ===============================================================
 *
 * Meneruskan foto/scan kontrak (base64) ke backend Python yang
 * melakukan transkripsi verbatim via Gemini Vision, lalu mengembalikan
 * teksnya untuk DIPERIKSA pengguna sebelum dianalisis.
 *
 * Proteksi: rate limiting per IP (transkripsi juga panggilan Gemini)
 * dan header shared-secret ke backend.
 */

import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL ?? 'http://127.0.0.1:8000';

const BACKEND_SHARED_SECRET = process.env.BACKEND_SHARED_SECRET ?? '';

/** Batas ukuran payload base64 (~10 MB gambar biner) */
const MAX_BASE64_LENGTH = 15_000_000;

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(req: Request) {
  // 1. Rate limiting per IP
  const ip = getClientIp(req);
  const rl = checkRateLimit(`transcribe:${ip}`, { perMinute: 4, perHour: 20 });
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMITED',
          message: 'Terlalu banyak permintaan. Silakan coba lagi beberapa saat lagi.',
        },
      },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } },
    );
  }

  // 2. Parse & validasi input
  let body: { imageBase64?: string; mimeType?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Format request tidak valid.' } },
      { status: 400 },
    );
  }

  const { imageBase64, mimeType, locale = 'en' } = body;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return NextResponse.json(
      { error: { code: 'INVALID_INPUT', message: 'Data gambar tidak valid.' } },
      { status: 400 },
    );
  }
  if (imageBase64.length > MAX_BASE64_LENGTH) {
    return NextResponse.json(
      { error: { code: 'IMAGE_TOO_LARGE', message: 'Ukuran gambar melebihi 10 MB.' } },
      { status: 413 },
    );
  }
  if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json(
      {
        error: {
          code: 'UNSUPPORTED_IMAGE',
          message: 'Format gambar harus JPEG, PNG, atau WebP.',
        },
      },
      { status: 422 },
    );
  }

  // 3. Teruskan ke backend Python
  try {
    const upstream = await fetch(`${PYTHON_BACKEND_URL}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(BACKEND_SHARED_SECRET ? { 'x-backend-secret': BACKEND_SHARED_SECRET } : {}),
      },
      body: JSON.stringify({
        imageBase64,
        mimeType,
        locale: locale === 'en' ? 'en' : 'id',
      }),
      signal: AbortSignal.timeout(90_000),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      // Teruskan detail error backend (mis. TRANSCRIPTION_FAILED) apa adanya
      const detail = data?.detail ?? data?.error ?? {
        code: 'TRANSCRIBE_FAILED',
        message: 'Transkripsi gagal. Silakan coba lagi.',
      };
      return NextResponse.json({ error: detail }, { status: upstream.status });
    }

    return NextResponse.json(data);
  } catch (proxyError) {
    console.error('[API Transcribe] Backend tidak tersedia:', proxyError);
    return NextResponse.json(
      {
        error: {
          code: 'BACKEND_UNAVAILABLE',
          message:
            'Server AI tidak tersedia — fitur foto membutuhkan backend AI. ' +
            'Gunakan input teks/PDF, atau coba lagi nanti.',
        },
      },
      { status: 503 },
    );
  }
}
