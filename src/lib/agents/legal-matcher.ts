import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedClause } from './extractor';
import { PasalReference } from '@/types';

export interface MatchedClause extends ExtractedClause {
  referensi_uu: PasalReference[];
  status_hukum: 'SESUAI' | 'MELANGGAR' | 'TIDAK_DITEMUKAN' | 'AMBIGU';
}

export async function matchLaws(
  clauses: ExtractedClause[], 
  fileUri: string, 
  ai: GoogleGenAI
): Promise<MatchedClause[]> {
  // Hanya proses klausul yang mungkin relevan secara hukum untuk menghemat token
  // Atau proses semua jika jumlahnya sedikit (< 20)
  
  const clausesText = clauses.map((c, i) => `[ID: ${i}] Topik: ${c.topik}\nKlausul: ${c.klausul}`).join('\n\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { fileData: { fileUri, mimeType: 'application/pdf' } },
          { text: `Berdasarkan dokumen UU Ketenagakerjaan yang dilampirkan, evaluasi klausul-klausul Surat Perjanjian Kerja berikut. Untuk setiap klausul, cari pasal-pasal hukum yang relevan, lalu tentukan apakah klausul tersebut SESUAI dengan hukum, MELANGGAR hukum, atau TIDAK DITEMUKAN aturannya.\n\nDaftar Klausul:\n${clausesText}` }
        ]
      }
    ],
    config: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            klausul_id: { type: Type.INTEGER, description: "ID Klausul (0, 1, 2, dll)" },
            status_hukum: { type: Type.STRING, enum: ["SESUAI", "MELANGGAR", "TIDAK_DITEMUKAN", "AMBIGU"] },
            referensi_uu: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  peraturan: { type: Type.STRING, description: "Misal: UU No. 6 Tahun 2023" },
                  pasal: { type: Type.STRING, description: "Misal: 156" },
                  judul: { type: Type.STRING },
                  ketentuan_relevan: { type: Type.STRING, description: "Kutipan isi pasal" }
                },
                required: ["peraturan", "pasal", "judul", "ketentuan_relevan"]
              }
            }
          },
          required: ["klausul_id", "status_hukum", "referensi_uu"]
        }
      }
    }
  });

  if (!response.text) return [];

  try {
    const matched = JSON.parse(response.text) as { klausul_id: number, status_hukum: any, referensi_uu: any[] }[];
    return matched.map(m => {
      const original = clauses[m.klausul_id];
      if (!original) return null;
      return {
        ...original,
        status_hukum: m.status_hukum,
        referensi_uu: m.referensi_uu
      };
    }).filter(x => x !== null) as MatchedClause[];
  } catch (e) {
    console.error("Gagal parse Legal-Matcher output", e);
    return [];
  }
}
