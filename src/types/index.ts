/* ============================================================
   KawalKontrak.ai — TypeScript Type Definitions
   Core domain types for the contract analysis platform
   ============================================================ */

// ── Enums / Union Types ──────────────────────────────────────

/** Overall risk assessment for a contract */
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/** Severity level for individual red flags */
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * How confident the analysis is in a given clause's classification.
 * LOW means the finding is based on the clause's language/tone alone
 * (e.g. one-sided, vague, or burdensome wording) without a definitive
 * legal citation — still shown to the user, never silently dropped.
 */
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

/** Types of user feedback on analysis results */
export type FeedbackType =
  | 'accurate'
  | 'inaccurate'
  | 'helpful'
  | 'not_helpful'
  | 'suggest'
  | 'report';

// ── Legal Reference ──────────────────────────────────────────

/** Reference to a specific article in Indonesian labour law */
export interface PasalReference {
  /** Name of the regulation, e.g. 'UU No. 6 Tahun 2023' */
  peraturan: string;
  /** Article number, e.g. '156' */
  pasal: string;
  /** Title / short description, e.g. 'Pesangon PHK' */
  judul: string;
  /** Relevant provision text */
  ketentuan_relevan: string;
}

// ── Red Flag ─────────────────────────────────────────────────

/** A problematic clause detected in the contract */
export interface RedFlag {
  /** Unique identifier, e.g. 'RF_001' */
  flag_id: string;
  /** How severe this issue is */
  severity: Severity;
  /** Confidence in this finding — LOW if based on wording alone, no definitive citation */
  confidence?: Confidence;
  /** Excerpt from the contract clause */
  pasal_kontrak: string;
  /** Plain-language explanation of the danger */
  potensi_masalah: string;
  /** Legal references backing up the flag */
  referensi_uu: PasalReference[];
  /** Suggested negotiation strategy */
  rekomendasi_negosiasi: string;
  /** Simple analogy for non-legal readers */
  analogi_sederhana: string;
  /** Email template for negotiation (empty string when unavailable) */
  email_template?: string;
}

// ── Safe Clause ──────────────────────────────────────────────

/** A clause that complies with labour law */
export interface SafeClause {
  /** Excerpt from the contract clause */
  pasal_kontrak: string;
  /** Confidence that this clause is genuinely safe/compliant */
  confidence?: Confidence;
  /** Plain-language translation of legal jargon */
  terjemahan: string;
  /** Optional legal references confirming compliance */
  referensi?: PasalReference[];
}

// ── Review Clause (FR-05) ────────────────────────────────────

/**
 * A clause the pipeline could NOT judge automatically — no definitive
 * legal reference was found. Shown explicitly to the user
 * ("tidak ditemukan referensi pasti") instead of being dropped.
 */
export interface ReviewClause {
  /** Excerpt from the contract clause */
  pasal_kontrak: string;
  /** Main topic of the clause */
  topik: string;
  /** Why this clause needs human review */
  alasan: string;
  /** Legal-match status: 'TIDAK_DITEMUKAN' | 'AMBIGU' */
  status: string;
  /** Estimated severity if this turns out to be a real violation (undefined = no indication at all) */
  severity?: Severity;
  /** Confidence in the status above — usually LOW for items in this bucket */
  confidence?: Confidence;
}

// ── Contract Summary ─────────────────────────────────────────

/** High-level summary of the analysed contract */
export interface ContractSummary {
  /** Contract type: PKWT, PKWTT, Freelance, etc. */
  jenis: string;
  /** Duration, e.g. '12 bulan' (for fixed-term contracts) */
  durasi?: string;
  /** Monthly salary, e.g. 'Rp 5.000.000' */
  gaji_bulanan?: string;
  /** Employment status description */
  status: string;
  /** Items that MUST be changed (legally required) */
  harus_diubah: string[];
  /** Items that SHOULD be changed (recommended) */
  sebaiknya_diubah: string[];
}

// ── Full Analysis Result ─────────────────────────────────────

/** Complete output from the contract analysis pipeline */
export interface AnalysisResult {
  /** Unique analysis ID */
  id: string;
  /** Processing status */
  status: 'completed' | 'failed';
  /** ISO 8601 timestamp */
  created_at: string;
  /** SHA-256 hash of the uploaded contract (for deduplication) */
  contract_hash: string;
  /** All detected red flags */
  red_flags: RedFlag[];
  /** All clauses confirmed as safe / compliant */
  klausul_aman: SafeClause[];
  /** Clauses needing human review — no definitive reference found (FR-05) */
  klausul_tinjauan?: ReviewClause[];
  /** High-level contract summary */
  ringkasan: ContractSummary;
  /** Overall risk assessment */
  risk_level: RiskLevel;
  /** Ordered list of recommended next steps */
  langkah_berikutnya: string[];
  /** Legal disclaimer — always shown with results */
  disclaimer: string;
  /** Engine metadata (which pipeline produced this result) */
  metadata: AnalysisMetadata;
}

/** Metadata about how the analysis was produced */
export interface AnalysisMetadata {
  /** Which engine produced the result, e.g. 'gemini-multi-agent-python' | 'local-pattern-matching' */
  engine: string;
  /** Whether RAG retrieval was used */
  rag_enabled: boolean;
  /** LLM model name, null for local engine */
  model: string | null;
  /** Corpus access mode: 'file_search' | 'file_data' | 'none' */
  rag_mode?: string;
  /** True if this result was served from the backend cache */
  cached?: boolean;
  /** Verifier status: 'passed' | 'skipped' | 'failed_open' */
  verifier_status?: string;
  /** True if the contract text was truncated before analysis */
  truncated?: boolean;
  /** Output language of the analysis */
  locale?: string;
  /** Regulations retrieved by RAG (e.g. 'UU No. 6 Tahun 2023 Pasal 156') */
  retrieved_regulations?: string[];
}

// ── Streaming Progress (FR-06) ───────────────────────────────

/** One NDJSON event emitted by the analysis pipeline stream */
export interface PipelineStageEvent {
  type: 'stage';
  /** 'cache' | 'extractor' | 'legal_matcher' | 'risk_grader' | 'verifier' | 'negotiator' */
  stage: string;
  status: 'running' | 'done';
  /** Stage-specific details, e.g. { clauses: 12 } */
  detail?: Record<string, number | string | boolean>;
}

/** Final NDJSON event carrying the analysis result */
export interface PipelineResultEvent {
  type: 'result';
  data: AnalysisResult;
}

export type PipelineEvent = PipelineStageEvent | PipelineResultEvent;

// ── Red Flag Pattern (Detection Engine) ──────────────────────

/** Pattern used by the detection engine to find red flags */
export interface RedFlagPattern {
  /** Pattern identifier, e.g. 'PATTERN_001' */
  id: string;
  /** Severity if this pattern matches */
  severity: Severity;
  /** Category grouping, e.g. 'kompensasi', 'PHK', 'jam_kerja' */
  category: string;
  /** Trigger words / phrases to search for */
  keywords: string[];
  /** Optional regular expression for advanced matching */
  regex?: string;
  /** Human-readable description of what this flag means */
  description: string;
  /** Explanation of why this clause is dangerous */
  why_dangerous: string;
  /** Legal references supporting this pattern */
  pasal_references: PasalReference[];
  /** Negotiation recommendation text */
  recommendation: string;
  /** Simple analogy for lay readers */
  analogy: string;
  /** Email template for negotiation */
  email_template: string | { subject: string; body: string };
}

// ── Analysis Progress ────────────────────────────────────────

/** A single step in the multi-step analysis pipeline */
export interface AnalysisStep {
  /** Unique step identifier */
  id: string;
  /** Human-readable label, e.g. 'Membaca dokumen…' */
  label: string;
  /** Current status of this step */
  status: 'pending' | 'loading' | 'done' | 'error';
}

// ── API Error ────────────────────────────────────────────────

/** Standardised API error response */
export interface APIError {
  /** Machine-readable error code, e.g. 'FILE_TOO_LARGE' */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Optional key-value details (e.g. field validation errors) */
  details?: Record<string, string>;
  /** Optional trace ID for debugging / support */
  trace_id?: string;
}
