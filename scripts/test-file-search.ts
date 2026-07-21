import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const apiKey = process.env.GEMINI_API_KEY;
const fileUri = 'https://generativelanguage.googleapis.com/v1beta/files/xaavv8m89jxs'; 

const ai = new GoogleGenAI({ apiKey });

async function testFileSearch() {
  console.log('Testing File Search with Gemini...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { fileData: { fileUri: fileUri, mimeType: 'application/pdf' } },
            { text: 'Sebutkan pasal yang membahas tentang pesangon (PHK) di dalam dokumen ini.' }
          ]
        }
      ]
    });
    console.log('Response:', response.text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testFileSearch();
