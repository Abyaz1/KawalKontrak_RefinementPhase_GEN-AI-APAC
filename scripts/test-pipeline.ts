import * as dotenv from 'dotenv';
import * as path from 'path';
import { analyzeWithGemini } from '../src/lib/analysis-engine';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No API key");
  process.exit(1);
}

const sampleContract = `
SURAT PERJANJIAN KERJA WAKTU TERTENTU (PKWT)
Pasal 1
Pihak Kedua (Pekerja) akan menerima gaji sebesar Rp 3.000.000 per bulan.
Pasal 2
Pekerja wajib bekerja selama 10 jam per hari tanpa hitungan lembur.
Pasal 3
Pihak Pertama dapat melakukan PHK kapan saja tanpa memberikan uang pesangon atau kompensasi.
Pasal 4
Perusahaan mendaftarkan pekerja pada program BPJS Kesehatan dan Ketenagakerjaan.
`;

async function runTest() {
  console.log("Starting multi-agent pipeline test...");
  const result = await analyzeWithGemini(sampleContract, apiKey, "Jakarta", "id");
  console.log("=== FINAL RESULT ===");
  console.log(JSON.stringify(result, null, 2));
}

runTest();
