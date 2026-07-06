# KawalKontrak.ai 🛡️

**KawalKontrak.ai** is an AI-powered platform designed to analyze employment contracts for Indonesian workers. It helps detect "red flags" or harmful clauses in employment contracts (PKWT, PKWTT) by cross-referencing them with Indonesian Labor Law (UU No. 6 Tahun 2023), PP No. 35/2021, and PP No. 36/2021 using a **Retrieval-Augmented Generation (RAG)** pipeline powered by the **Google Gemini API**.

## 🚀 Features

- **RAG-Enhanced AI Analysis**: Contract analysis is grounded in a curated database of Indonesian labor-law articles (UU 6/2023, PP 35/2021, PP 36/2021). Relevant regulations are retrieved via hybrid search (Gemini semantic embeddings + keyword scoring) and injected into the prompt.
- **Red Flag Detection (20+ patterns)**: A fast local pattern engine detects harmful clauses (unpaid overtime, PKWT without compensation, unilateral termination, excessive fines, etc.), which are then validated and expanded by the AI.
- **UMK Validation**: Dynamically detects contract salaries and cross-checks them against regional minimum wage database entries.
- **Risk Assessment**: Instantly flags contracts with overall hazard ratings (CRITICAL, HIGH, MEDIUM, LOW).
- **i18n Bilingual Interface**: Fully supports English (Default) and Bahasa Indonesia interfaces.
- **Export to PDF**: Users can download a clean, print-optimized multi-page PDF document of their analysis results natively via the browser's `window.print()`, ensuring fast and robust exports without heavy dependencies.
- **Legal Transparency**: Dedicated routes for Terms of Service, Privacy Policy, and Disclaimers.
- **Firebase Authentication & Cloud Storage**:
  - Optional Google Sign-In to backup analysis history.
  - Automatic synchronization of previous offline history (`localStorage`) to **Cloud Firestore** upon first login.
  - Secure cloud storage across devices, while maintaining a privacy-first option for non-logged-in users.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, CSS Modules
- **AI**: Google Gemini API — `gemini-1.5-flash` (analysis) + `gemini-embedding-001` (RAG semantic retrieval)
- **Database & Auth**: Firebase Authentication & Cloud Firestore
- **RAG**: In-process knowledge base (`src/lib/legal-knowledge-base.ts`) + hybrid retrieval (`src/lib/rag-retrieval.ts`)
- **PDF Extraction**: PDF.js for client-side text extraction + Native CSS `@media print` for document generation
- **Design**: Responsive layout, i18n translation system (English / Bahasa Indonesia)

## 🧠 How the RAG Pipeline Works

```
Contract text
   │
   ├─ 1. Local red-flag detection (pattern matching, instant)
   ├─ 2. Hybrid retrieval from the legal knowledge base
   │       • semantic: gemini-embedding-001 (cosine similarity)
   │       • keyword: topic/area scoring (works offline)
   ├─ 3. Prompt assembly: System Prompt v2.0 + retrieved articles
   │       + regional UMK context + local detection hints
   ├─ 4. Gemini (gemini-2.5-flash, strict JSON output)
   └─ 5. Post-processing: validation, disclaimer, UMK check, metadata
```

If the Gemini call fails, the pipeline falls back to the local engine — the UI always shows honest results (never mock data) and surfaces errors with a retry option.

## 📦 Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the variables in `.env.local`:
   - `GEMINI_API_KEY`: get one free at https://aistudio.google.com/apikey.
   - `NEXT_PUBLIC_FIREBASE_*`: Firebase Web Config values (from Firebase Console project settings) to enable authentication and database features.

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the app** at [http://localhost:3000](http://localhost:3000).

## 📚 Legal Knowledge Base

The RAG knowledge base (`src/lib/legal-knowledge-base.ts`) is compiled from critical articles of:

- **UU No. 6 Tahun 2023** — PKWT (56–59), Alih Daya (64–66), Waktu Kerja & Istirahat (77–79), Pengupahan (88, 88A), PHK & Kompensasi (156–161)
- **PP No. 35 Tahun 2021** — Kompensasi PKWT (15–17), Upah Lembur (26–29), Pesangon (40–47), UPH (50–52)
- **PP No. 36 Tahun 2021** — Komponen upah & upah minimum

Texts are simplified for clarity while preserving legal accuracy. For official documents, refer to [JDIH Setkab RI](https://jdih.setkab.go.id/) or [JDIH Kemenaker](https://jdih.kemenaker.go.id/). Update the knowledge base whenever regulations change (recommended review: every 6 months).

## 🤝 Disclaimer

**KawalKontrak.ai** is strictly an educational tool and does not constitute legally binding advice. For severe or highly specific legal disputes, users should consult professional lawyers or contact the Legal Aid Institute (LBH Indonesia, 021-315-1405).

## 📄 License

This project is open-source and created to protect the rights of Indonesian workers.
