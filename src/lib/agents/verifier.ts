import { GoogleGenAI, Type } from '@google/genai';
import { RedFlag } from '@/types';

export async function verifyRedFlags(
  redFlags: Omit<RedFlag, 'email_template'>[],
  ai: GoogleGenAI
): Promise<Omit<RedFlag, 'email_template'>[]> {
  
  if (redFlags.length === 0) return [];
  
  const payload = JSON.stringify(redFlags, null, 2);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Sebagai Senior Legal Auditor, tugas Anda adalah memverifikasi hasil temuan red flags berikut.
Pastikan bahwa 'ketentuan_relevan' dari referensi UU benar-benar bertentangan dengan 'pasal_kontrak'. 
Jika referensi tampak mengada-ada (halusinasi) atau tidak relevan, tandai 'is_valid' sebagai false.

Daftar Temuan:
${payload}`,
    config: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            flag_id: { type: Type.STRING },
            is_valid: { type: Type.BOOLEAN, description: "True jika referensi benar-benar relevan dan logis" },
            reason: { type: Type.STRING, description: "Alasan jika tidak valid" }
          },
          required: ["flag_id", "is_valid"]
        }
      }
    }
  });

  if (!response.text) return redFlags;
  
  try {
    const validations = JSON.parse(response.text) as { flag_id: string, is_valid: boolean }[];
    return redFlags.filter(rf => {
      const v = validations.find(v => v.flag_id === rf.flag_id);
      return v ? v.is_valid : true; // Default ke true jika tidak diverifikasi
    });
  } catch (e) {
    console.error("Gagal parse Verifier output", e);
    return redFlags;
  }
}
