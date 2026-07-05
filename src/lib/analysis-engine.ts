import { redFlagPatterns } from './red-flag-patterns';
import { AnalysisResult, RedFlag, SafeClause, RiskLevel, ContractSummary, RedFlagPattern } from '@/types';

// Utility for hashing text
async function hashText(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 1. Local Pattern Matching (MVP fallback or hybrid base)
export async function analyzeContractLocal(contractText: string): Promise<AnalysisResult> {
  const normalizedText = contractText.toLowerCase();
  
  const redFlags: RedFlag[] = [];
  const safeClauses: SafeClause[] = [];
  
  // Pattern matching
  for (const pattern of redFlagPatterns) {
    let matched = false;
    // Simple keyword matching
    for (const keyword of pattern.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matched = true;
        break;
      }
    }
    
    // Optional Regex matching
    if (!matched && pattern.regex) {
      const regex = new RegExp(pattern.regex, 'i');
      if (regex.test(contractText)) {
        matched = true;
      }
    }
    
    if (matched) {
      // Find the approximate sentence for pasal_kontrak
      // (Very basic extraction for MVP)
      const lines = contractText.split('\n');
      let pasal_kontrak = "Klausul terkait ditemukan dalam dokumen.";
      for (const line of lines) {
        if (pattern.keywords.some(k => line.toLowerCase().includes(k.toLowerCase()))) {
          pasal_kontrak = line.trim();
          break;
        }
      }
      
      redFlags.push({
        flag_id: pattern.id,
        severity: pattern.severity,
        pasal_kontrak,
        potensi_masalah: pattern.why_dangerous,
        referensi_uu: pattern.pasal_references,
        rekomendasi_negosiasi: pattern.recommendation,
        analogi_sederhana: pattern.analogy,
        email_template: pattern.email_template
      });
    }
  }
  
  // Calculate risk level
  let risk_level: RiskLevel = 'LOW';
  if (redFlags.some(f => f.severity === 'CRITICAL')) {
    risk_level = 'CRITICAL';
  } else if (redFlags.some(f => f.severity === 'HIGH')) {
    risk_level = 'HIGH';
  } else if (redFlags.some(f => f.severity === 'MEDIUM')) {
    risk_level = 'MEDIUM';
  }
  
  // Identify safe clauses basics (Mock for local)
  if (normalizedText.includes('bpjs')) {
    safeClauses.push({
      pasal_kontrak: "Perusahaan mendaftarkan pekerja pada program BPJS.",
      terjemahan: "Anda terdaftar dalam asuransi kesehatan dan ketenagakerjaan resmi.",
      referensi: []
    });
  }
  
  const hash = await hashText(contractText);
  
  return {
    id: `AN-${Date.now()}`,
    status: 'completed',
    created_at: new Date().toISOString(),
    contract_hash: hash,
    red_flags: redFlags,
    klausul_aman: safeClauses,
    ringkasan: {
      jenis: 'Kontrak Kerja (Umum)',
      status: risk_level === 'LOW' ? 'Aman' : 'Membutuhkan Peninjauan',
      harus_diubah: redFlags.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').map(f => f.potensi_masalah),
      sebaiknya_diubah: redFlags.filter(f => f.severity === 'MEDIUM').map(f => f.potensi_masalah)
    },
    risk_level,
    langkah_berikutnya: [
      "Pelajari red flags yang ditemukan secara mendetail.",
      "Gunakan template email yang disediakan untuk memulai negosiasi dengan HRD.",
      "Jangan tandatangani kontrak sebelum pasal-pasal bermasalah diubah sesuai kesepakatan."
    ]
  };
}

// 2. Gemini API Integration
export async function analyzeWithGemini(contractText: string, apiKey: string): Promise<AnalysisResult> {
  // Use Gemini REST API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
  
  const systemPrompt = `Anda adalah AI ahli Hukum Ketenagakerjaan Indonesia. 
Tugas Anda adalah menganalisis kontrak kerja berdasarkan UU No. 6 Tahun 2023 (Cipta Kerja) dan turunannya.
Anda HANYA boleh membalas dengan JSON yang 100% valid, tanpa markdown \`\`\`json. Output harus sesuai dengan interface TypeScript berikut:

interface AnalysisResult {
  red_flags: Array<{
    flag_id: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    pasal_kontrak: string;
    potensi_masalah: string;
    referensi_uu: Array<{ peraturan: string; pasal: string; judul: string; ketentuan_relevan: string; }>;
    rekomendasi_negosiasi: string;
    analogi_sederhana: string;
    email_template: string;
  }>;
  klausul_aman: Array<{
    pasal_kontrak: string;
    terjemahan: string;
    referensi?: Array<{ peraturan: string; pasal: string; judul: string; ketentuan_relevan: string; }>;
  }>;
  ringkasan: {
    jenis: string;
    durasi?: string;
    gaji_bulanan?: string;
    status: string;
    harus_diubah: string[];
    sebaiknya_diubah: string[];
  };
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  langkah_berikutnya: string[];
}`;

  const prompt = `Tolong analisis secara mendalam kontrak kerja di bawah ini dan temukan pasal-pasal yang merugikan pekerja (red flags) serta klausul aman.\n\nKONTRAK:\n${contractText.substring(0, 30000)}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error("Empty response from Gemini");
    }
    
    // Parse the JSON
    let parsed: any;
    try {
      parsed = JSON.parse(textContent);
    } catch (e) {
      // Try to clean markdown
      const cleaned = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    }
    
    const hash = await hashText(contractText);
    
    // Map parsed result into full AnalysisResult
    return {
      id: `AN-${Date.now()}`,
      status: 'completed',
      created_at: new Date().toISOString(),
      contract_hash: hash,
      red_flags: parsed.red_flags || [],
      klausul_aman: parsed.klausul_aman || [],
      ringkasan: parsed.ringkasan || {
        jenis: "Tidak Diketahui",
        status: "Perlu ditinjau",
        harus_diubah: [],
        sebaiknya_diubah: []
      },
      risk_level: parsed.risk_level || 'LOW',
      langkah_berikutnya: parsed.langkah_berikutnya || ["Review kontrak kembali secara teliti."]
    };
    
  } catch (error) {
    console.error("Gemini analysis failed, falling back to local...", error);
    // Fallback to local regex matching
    return analyzeContractLocal(contractText);
  }
}
