import { GoogleGenAI } from '@google/genai';
import { extractClauses } from './agents/extractor';
import { matchLaws } from './agents/legal-matcher';
import { gradeRisks, RiskGraderOutput } from './agents/risk-grader';
import { verifyRedFlags } from './agents/verifier';
import { generateNegotiations } from './agents/negotiator';
import { analyzeContractLocal } from './local-engine';
import { AnalysisResult } from '@/types';
import { getUMKByRegion } from './umk-database';

const DISCLAIMER_TEXT_ID =
  'Analisis ini dihasilkan oleh Kecerdasan Buatan (AI) untuk tujuan literasi dan edukasi hukum, BUKAN nasihat hukum yang mengikat. Untuk sengketa serius, hubungi LBH Indonesia (021-315-1405), konsultan hukum profesional, atau serikat pekerja di organisasi Anda.';

const DISCLAIMER_TEXT_EN =
  'This analysis is AI-generated for educational and legal literacy purposes, NOT binding legal advice. For serious disputes, contact LBH Indonesia (021-315-1405), a professional legal consultant, or the labor union in your organization.';

async function hashText(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function analyzeWithGemini(
  contractText: string,
  apiKey: string,
  region?: string,
  locale: string = 'id',
): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey });
  const hash = await hashText(contractText);
  const fileUri = process.env.GEMINI_CORPUS_FILE_NAME || "https://generativelanguage.googleapis.com/v1beta/files/xaavv8m89jxs";

  try {
    // 1. EXTRACTOR
    console.log("Agent 1: Extractor started");
    const extractedClauses = await extractClauses(contractText, ai);
    if (extractedClauses.length === 0) {
      throw new Error("Extractor returned no clauses");
    }

    // 2. LEGAL-MATCHER
    console.log("Agent 2: Legal Matcher started");
    // Filter out clauses that are purely informational
    const problematicClauses = extractedClauses.filter(c => c.indikasi_masalah);
    const matched = await matchLaws(problematicClauses.length > 0 ? problematicClauses : extractedClauses, fileUri, ai);

    // 3. RISK-GRADER
    console.log("Agent 3: Risk Grader started");
    const gradedOutput = await gradeRisks(matched, ai);
    if (!gradedOutput) {
      throw new Error("Risk Grader failed");
    }

    // 4. VERIFIER
    console.log("Agent 4: Verifier started");
    const verifiedFlags = await verifyRedFlags(gradedOutput.red_flags, ai);

    // 5. NEGOTIATOR
    console.log("Agent 5: Negotiator started");
    const finalizedFlags = await generateNegotiations(verifiedFlags, ai);

    // Assemble final result
    return {
      id: `AN-${Date.now()}`,
      status: 'completed',
      created_at: new Date().toISOString(),
      contract_hash: hash,
      red_flags: finalizedFlags,
      klausul_aman: gradedOutput.klausul_aman,
      ringkasan: gradedOutput.ringkasan,
      risk_level: gradedOutput.risk_level,
      langkah_berikutnya: gradedOutput.langkah_berikutnya,
      disclaimer: locale === 'en' ? DISCLAIMER_TEXT_EN : DISCLAIMER_TEXT_ID,
      metadata: {
        engine: 'gemini-rag',
        rag_enabled: true,
        model: 'gemini-2.5-flash (multi-agent)',
      },
    };
  } catch (error) {
    console.error('Multi-agent pipeline failed, falling back to local...', error);
    return analyzeContractLocal(contractText, locale);
  }
}
