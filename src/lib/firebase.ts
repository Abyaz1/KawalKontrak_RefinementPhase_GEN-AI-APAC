/**
 * KawalKontrak.ai — Inisialisasi Firebase (terjaga / guarded)
 * =============================================================
 *
 * Firebase bersifat OPSIONAL (login hanya untuk sinkronisasi riwayat).
 * Inisialisasi hanya dilakukan jika konfigurasi env tersedia, sehingga:
 *   1. `next build` / CI tidak gagal tanpa kredensial Firebase.
 *   2. Aplikasi tetap berjalan penuh tanpa fitur login (privacy-first).
 *
 * Konsumen wajib memeriksa `firebaseEnabled` (atau null) sebelum
 * memakai `auth`/`db`.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True jika konfigurasi Firebase tersedia — fitur login/riwayat cloud aktif */
export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (firebaseEnabled) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  // Always prompt for account selection when logging in via Google
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} else if (process.env.NODE_ENV !== 'production') {
  /* Tanpa peringatan ini, konfigurasi yang hilang tidak menimbulkan gejala apa
     pun selain tombol "Masuk" yang lenyap dari header — Header.tsx memang
     menyembunyikannya lewat `authAvailable`. Gejalanya mudah dikira bug UI,
     padahal penyebabnya .env.local yang belum dibuat. Sengaja hanya di
     development: di produksi ini tidak berguna bagi pengguna akhir. */
  const missing = (
    [
      ['NEXT_PUBLIC_FIREBASE_API_KEY', firebaseConfig.apiKey],
      ['NEXT_PUBLIC_FIREBASE_PROJECT_ID', firebaseConfig.projectId],
    ] as const
  )
    .filter(([, value]) => !value)
    .map(([name]) => name);

  console.warn(
    `[KawalKontrak] Firebase tidak dikonfigurasi (${missing.join(', ')} kosong). ` +
      'Login Google dimatikan dan tombol "Masuk" disembunyikan dari header. ' +
      'Salin .env.example ke .env.local, isi nilai NEXT_PUBLIC_FIREBASE_* dari ' +
      'Firebase Console, lalu jalankan ulang dev server (nilai NEXT_PUBLIC_* ' +
      'dibaca saat build, hot reload tidak cukup).',
  );
}

export { app, auth, db, googleProvider };
