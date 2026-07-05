/* ============================================================
   KawalKontrak.ai — RAG Retrieval Pipeline
   Hybrid search: semantic (Gemini Embedding API) + keyword,
   sesuai strategi "Hybrid Search" di PANDUAN_RAG (Step 3):
     1. Semantic search  → similarity terhadap input user
     2. Keyword search   → exact matching topik/pasal
     3. Ranking & merge  → skor gabungan

   Berjalan di server (API route). Embedding knowledge base
   dihitung sekali per instance lalu di-cache di module scope.
   Jika Embedding API gagal, retrieval turun ke keyword-only
   sehingga analisis tetap berjalan.
   ============================================================ */

import { legalKnowledgeBase, LegalChunk } from './legal-knowledge-base';

const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIM = 768;
const EMBEDDING_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}`;

/** Hasil retrieval: chunk + skor relevansi */
export interface RetrievedChunk {
  chunk: LegalChunk;
  score: number;
}

// ── Embedding cache (per server instance) ────────────────────
let kbEmbeddings: number[][] | null = null;
let kbEmbeddingPromise: Promise<number[][] | null> | null = null;

function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0));
  if (norm === 0) return vec;
  return vec.map((v) => v / norm);
}

function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

/**
 * Batch-embed seluruh pasal knowledge base (task: RETRIEVAL_DOCUMENT).
 * Dipanggil sekali; hasil di-cache di module scope.
 */
async function embedKnowledgeBase(apiKey: string): Promise<number[][] | null> {
  try {
    const res = await fetch(`${EMBEDDING_URL}:batchEmbedContents?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: legalKnowledgeBase.map((chunk) => ({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text: `${chunk.judul}\n${chunk.teks}` }] },
          taskType: 'RETRIEVAL_DOCUMENT',
          outputDimensionality: EMBEDDING_DIM,
        })),
      }),
    });

    if (!res.ok) {
      console.warn(`RAG: embedding KB gagal (${res.status}), fallback ke keyword-only`);
      return null;
    }

    const data = await res.json();
    const embeddings: number[][] | undefined = data.embeddings?.map(
      (e: { values: number[] }) => normalize(e.values),
    );
    if (!embeddings || embeddings.length !== legalKnowledgeBase.length) return null;
    return embeddings;
  } catch (err) {
    console.warn('RAG: embedding KB error, fallback ke keyword-only', err);
    return null;
  }
}

/** Embed satu query pencarian (task: RETRIEVAL_QUERY). */
async function embedQuery(query: string, apiKey: string): Promise<number[] | null> {
  try {
    const res = await fetch(`${EMBEDDING_URL}:embedContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text: query }] },
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: EMBEDDING_DIM,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const values: number[] | undefined = data.embedding?.values;
    return values ? normalize(values) : null;
  } catch {
    return null;
  }
}

// ── Keyword scoring ──────────────────────────────────────────

/**
 * Skor keyword sederhana: berapa banyak topik/area/judul chunk
 * yang muncul di teks query (case-insensitive).
 */
function keywordScore(query: string, chunk: LegalChunk): number {
  const q = query.toLowerCase();
  let score = 0;

  for (const kw of chunk.topik_keyword) {
    if (q.includes(kw.toLowerCase())) score += 1;
  }
  for (const area of chunk.area_pelanggaran) {
    // Cocokkan per kata untuk frasa area yang panjang
    const words = area.toLowerCase().split(' ').filter((w) => w.length > 4);
    const matched = words.filter((w) => q.includes(w)).length;
    if (words.length > 0 && matched / words.length >= 0.5) score += 1.5;
  }
  if (q.includes(`pasal ${chunk.pasal.toLowerCase()}`)) score += 2;

  return score;
}

// ── Main retrieval ───────────────────────────────────────────

/**
 * Cari pasal-pasal paling relevan untuk teks kontrak/query.
 *
 * @param queries  Daftar query pencarian (potongan kontrak + kategori red flag)
 * @param apiKey   Gemini API key (untuk semantic search; opsional)
 * @param topK     Jumlah pasal yang dikembalikan
 */
export async function retrieveRelevantRegulations(
  queries: string[],
  apiKey: string | undefined,
  topK = 8,
): Promise<RetrievedChunk[]> {
  const scores = new Map<string, number>();

  // 1) Keyword scoring — selalu berjalan, tanpa network
  for (const query of queries) {
    for (const chunk of legalKnowledgeBase) {
      const s = keywordScore(query, chunk);
      if (s > 0) {
        scores.set(chunk.id, (scores.get(chunk.id) ?? 0) + s);
      }
    }
  }

  // 2) Semantic scoring — via Gemini Embedding API (best effort)
  if (apiKey) {
    if (!kbEmbeddings && !kbEmbeddingPromise) {
      kbEmbeddingPromise = embedKnowledgeBase(apiKey).then((result) => {
        kbEmbeddings = result;
        return result;
      });
    }
    const embeddings = kbEmbeddings ?? (await kbEmbeddingPromise);

    if (embeddings) {
      // Embed maksimal 3 query pertama untuk menjaga latensi
      const queryVectors = await Promise.all(
        queries.slice(0, 3).map((q) => embedQuery(q.slice(0, 1500), apiKey)),
      );

      for (const qVec of queryVectors) {
        if (!qVec) continue;
        embeddings.forEach((docVec, i) => {
          const similarity = dot(qVec, docVec); // cosine (sudah dinormalisasi)
          if (similarity > 0.3) {
            const id = legalKnowledgeBase[i].id;
            // Bobot semantic 5x agar sebanding dengan skor keyword
            scores.set(id, (scores.get(id) ?? 0) + similarity * 5);
          }
        });
      }
    }
  }

  // 3) Ranking: urutkan berdasarkan skor gabungan
  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([id, score]) => ({
      chunk: legalKnowledgeBase.find((c) => c.id === id)!,
      score,
    }));

  // Jika retrieval kosong (kontrak sangat pendek/tidak relevan),
  // kembalikan pasal-pasal fondasi yang hampir selalu relevan.
  if (ranked.length === 0) {
    const fallbackIds = [
      'uu6_2023_pasal_88',
      'uu6_2023_pasal_77',
      'uu6_2023_pasal_79',
      'uu6_2023_pasal_156',
      'pp35_2021_pasal_15',
    ];
    return legalKnowledgeBase
      .filter((c) => fallbackIds.includes(c.id))
      .map((chunk) => ({ chunk, score: 0 }));
  }

  return ranked;
}
