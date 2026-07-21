import { GoogleGenAI, Type } from '@google/genai';

export interface ExtractedClause {
  klausul: string;
  topik: string;
  indikasi_masalah: boolean;
}

export async function extractClauses(contractText: string, ai: GoogleGenAI): Promise<ExtractedClause[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Berikut adalah teks Surat Perjanjian Kerja (SPK). Ekstrak seluruh klausul/pasal yang ada di dalamnya secara terstruktur. Untuk setiap klausul, tentukan topiknya dan apakah ada potensi masalah secara kasat mata.\n\nTeks Kontrak:\n${contractText.slice(0, 30000)}`,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            klausul: {
              type: Type.STRING,
              description: "Kutipan asli klausul dari kontrak"
            },
            topik: {
              type: Type.STRING,
              description: "Topik dari klausul (misalnya: 'Pengupahan', 'Waktu Kerja', 'PHK', dll)"
            },
            indikasi_masalah: {
              type: Type.BOOLEAN,
              description: "True jika klausul terlihat memberatkan pihak pekerja atau berpotensi melanggar hukum"
            }
          },
          required: ["klausul", "topik", "indikasi_masalah"]
        }
      }
    }
  });

  if (!response.text) {
    return [];
  }
  
  try {
    return JSON.parse(response.text) as ExtractedClause[];
  } catch (e) {
    console.error("Gagal parse Extractor output", e);
    return [];
  }
}
