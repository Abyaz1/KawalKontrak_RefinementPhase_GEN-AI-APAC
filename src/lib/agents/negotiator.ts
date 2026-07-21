import { GoogleGenAI, Type } from '@google/genai';
import { RedFlag } from '@/types';

export async function generateNegotiations(
  verifiedRedFlags: Omit<RedFlag, 'email_template'>[],
  ai: GoogleGenAI
): Promise<RedFlag[]> {
  
  if (verifiedRedFlags.length === 0) return [];
  
  const payload = JSON.stringify(verifiedRedFlags, null, 2);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Sebagai Negosiator Ketenagakerjaan, buatkan template email negosiasi yang profesional dan sopan kepada HRD untuk setiap masalah (red flag) kontrak berikut.
Template harus ringkas, jelas, dan memohon klarifikasi atau perubahan tanpa bersikap agresif.
\nDaftar Red Flags:\n${payload}`,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            flag_id: { type: Type.STRING },
            email_template: { type: Type.STRING }
          },
          required: ["flag_id", "email_template"]
        }
      }
    }
  });

  if (!response.text) return verifiedRedFlags as RedFlag[];
  
  try {
    const templates = JSON.parse(response.text) as { flag_id: string, email_template: string }[];
    return verifiedRedFlags.map(rf => {
      const t = templates.find(t => t.flag_id === rf.flag_id);
      return {
        ...rf,
        email_template: t ? t.email_template : ""
      } as RedFlag;
    });
  } catch (e) {
    console.error("Gagal parse Negotiator output", e);
    return verifiedRedFlags as RedFlag[];
  }
}
