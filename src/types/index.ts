/* ============================================================
   KawalKontrak.ai — TypeScript Type Definitions
   Core domain types for the contract analysis platform
   ============================================================ */

// ── Enums / Union Types ──────────────────────────────────────

/** Overall risk assessment for a contract */
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/** Severity level for individual red flags */
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

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
  /** Optional email template for negotiation */
  email_template?: string | { subject: string; body: string };
}

// ── Safe Clause ──────────────────────────────────────────────

/** A clause that complies with labour law */
export interface SafeClause {
  /** Excerpt from the contract clause */
  pasal_kontrak: string;
  /** Plain-language translation of legal jargon */
  terjemahan: string;
  /** Optional legal references confirming compliance */
  referensi?: PasalReference[];
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
  /** High-level contract summary */
  ringkasan: ContractSummary;
  /** Overall risk assessment */
  risk_level: RiskLevel;
  /** Ordered list of recommended next steps */
  langkah_berikutnya: string[];
}

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
