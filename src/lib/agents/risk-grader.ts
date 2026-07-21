import { GoogleGenAI, Type } from '@google/genai';
import { MatchedClause } from './legal-matcher';
import { RedFlag, SafeClause, ContractSummary, RiskLevel } from '@/types';

export interface RiskGraderOutput {
  red_flags: Omit<RedFlag, 'email_template'>[];
  klausul_aman: SafeClause[];
  ringkasan: ContractSummary;
  risk_level: RiskLevel;
  langkah_berikutnya: string[];
}

export async function gradeRisks(
  matchedClauses: MatchedClause[], 
  ai: GoogleGenAI
): Promise<RiskGraderOutput | null> {
  
  const payload = JSON.stringify(matchedClauses, null, 2);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Anda adalah Asisten Hukum Ketenagakerjaan. Berikut adalah daftar klausul kontrak beserta status hukum dan referensi peraturannya. 
Tugas Anda adalah mengevaluasi risiko dari keseluruhan kontrak ini dan menyusun laporannya.
Untuk setiap klausul yang MELANGGAR hukum, buatlah RedFlag dengan bahasa awam yang mudah dipahami, sertakan analogi sederhana.
Untuk setiap klausul yang SESUAI, buatlah SafeClause.
Berikan juga ringkasan jenis kontrak, level risiko keseluruhan, dan langkah selanjutnya yang harus dilakukan pekerja.

Data Klausul:
${payload}`,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          red_flags: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                flag_id: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
                pasal_kontrak: { type: Type.STRING },
                potensi_masalah: { type: Type.STRING, description: "Penjelasan bahasa awam" },
                referensi_uu: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      peraturan: { type: Type.STRING },
                      pasal: { type: Type.STRING },
                      judul: { type: Type.STRING },
                      ketentuan_relevan: { type: Type.STRING }
                    },
                    required: ["peraturan", "pasal", "judul", "ketentuan_relevan"]
                  }
                },
                rekomendasi_negosiasi: { type: Type.STRING },
                analogi_sederhana: { type: Type.STRING }
              },
              required: ["flag_id", "severity", "pasal_kontrak", "potensi_masalah", "referensi_uu", "rekomendasi_negosiasi", "analogi_sederhana"]
            }
          },
          klausul_aman: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pasal_kontrak: { type: Type.STRING },
                terjemahan: { type: Type.STRING },
                referensi: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      peraturan: { type: Type.STRING },
                      pasal: { type: Type.STRING },
                      judul: { type: Type.STRING },
                      ketentuan_relevan: { type: Type.STRING }
                    },
                    required: ["peraturan", "pasal", "judul", "ketentuan_relevan"]
                  }
                }
              },
              required: ["pasal_kontrak", "terjemahan"]
            }
          },
          ringkasan: {
            type: Type.OBJECT,
            properties: {
              jenis: { type: Type.STRING },
              durasi: { type: Type.STRING },
              gaji_bulanan: { type: Type.STRING },
              status: { type: Type.STRING },
              harus_diubah: { type: Type.ARRAY, items: { type: Type.STRING } },
              sebaiknya_diubah: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["jenis", "status", "harus_diubah", "sebaiknya_diubah"]
          },
          risk_level: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
          langkah_berikutnya: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["red_flags", "klausul_aman", "ringkasan", "risk_level", "langkah_berikutnya"]
      }
    }
  });

  if (!response.text) return null;
  
  try {
    return JSON.parse(response.text) as RiskGraderOutput;
  } catch (e) {
    console.error("Gagal parse Risk-Grader output", e);
    return null;
  }
}
