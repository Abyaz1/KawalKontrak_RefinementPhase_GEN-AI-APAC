/**
 * KawalKontrak.ai — Lapisan Data Firestore (Riwayat Analisis)
 * =============================================================
 *
 * Perbaikan hasil audit (C3/C4):
 *   1. Dokumen kini disimpan di SUBCOLLECTION per pengguna
 *      (`users/{uid}/analyses/{id}`) — bukan koleksi global 'contracts',
 *      sehingga aturan keamanan per-pemilik sederhana & ID antar user
 *      tidak mungkin bertabrakan.
 *   2. Semua operasi (termasuk delete) mewajibkan uid pemilik.
 *   3. ID dokumen memakai crypto.randomUUID() (bukan timestamp).
 *   4. Tipe `any` dihapus.
 *   5. Yang disimpan HANYA hasil analisis — teks kontrak mentah tidak
 *      pernah dikirim ke cloud (prinsip privacy-first TRD §6).
 *
 * Aturan keamanan server-side ada di `firestore.rules` (root repo) —
 * deploy dengan: firebase deploy --only firestore:rules
 */

import { db } from './firebase';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

/** Firestore hanya dipakai ketika pengguna login — dan login hanya
 *  mungkin jika Firebase terkonfigurasi. Guard ini menjaga type-safety. */
function requireDb(): Firestore {
  if (!db) {
    throw new Error('Firebase tidak dikonfigurasi — fitur riwayat cloud tidak tersedia.');
  }
  return db;
}

export interface HistoryEntry<TResult = unknown> {
  id: string;
  date: string;
  riskLevel: string;
  riskLabel: string;
  totalFlags: number;
  /** Hasil analisis lengkap (format UI) — tanpa teks kontrak mentah */
  result: TResult;
  createdAt?: Date;
}

function userAnalysesCollection(userId: string) {
  return collection(requireDb(), 'users', userId, 'analyses');
}

/**
 * Menyimpan satu entri riwayat analisis milik pengguna.
 */
export async function saveContractAnalysis<TResult>(
  userId: string,
  entry: HistoryEntry<TResult>,
): Promise<void> {
  const docRef = doc(userAnalysesCollection(userId), entry.id);
  await setDoc(docRef, {
    date: entry.date,
    riskLevel: entry.riskLevel,
    riskLabel: entry.riskLabel,
    totalFlags: entry.totalFlags,
    result: entry.result,
    createdAt: serverTimestamp(), // Timestamp sisi server
  });
}

/**
 * Mengambil seluruh riwayat analisis milik pengguna,
 * diurutkan terbaru dulu (sort in-memory — tanpa composite index).
 */
export async function getUserAnalyses<TResult>(
  userId: string,
): Promise<HistoryEntry<TResult>[]> {
  const snapshot = await getDocs(userAnalysesCollection(userId));

  const entries: HistoryEntry<TResult>[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(typeof data.date === 'string' ? data.date : Date.now());
    return {
      id: docSnap.id,
      date: String(data.date ?? ''),
      riskLevel: String(data.riskLevel ?? ''),
      riskLabel: String(data.riskLabel ?? ''),
      totalFlags: Number(data.totalFlags ?? 0),
      result: data.result as TResult,
      createdAt,
    };
  });

  return entries.sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
  );
}

/**
 * Menghapus satu entri riwayat. Membutuhkan uid pemilik —
 * path dokumen berada di bawah `users/{uid}`, sehingga Firestore rules
 * menjamin pengguna hanya bisa menghapus miliknya sendiri.
 */
export async function deleteUserAnalysis(
  userId: string,
  analysisId: string,
): Promise<void> {
  await deleteDoc(doc(userAnalysesCollection(userId), analysisId));
}
