# KawalKontrak.ai 🛡️

**KawalKontrak.ai** is an AI-powered platform designed to analyze employment contracts for Indonesian workers. It helps detect "red flags" or harmful clauses in employment contracts (PKWT, PKWTT) by cross-referencing them with the Indonesian Labor Law (UU Ketenagakerjaan No. 13/2003) and the Job Creation Law (UU Cipta Kerja).

## 🚀 Features

- **Automated AI Contract Analysis**: Simply upload a PDF or paste the text of an employment contract, and our AI will evaluate it within seconds.
- **Red Flag Detection**: Identifies potentially harmful clauses (e.g., unpaid overtime, illegal probationary periods for temporary contracts, unfair non-compete clauses).
- **Risk Assessment**: Categorizes the overall contract risk level (CRITICAL, HIGH, MEDIUM, LOW) to give workers an immediate understanding of the contract's safety.
- **Legal References**: Provides direct references to the relevant Indonesian Labor Laws (UU) and Government Regulations (PP) for each detected issue.
- **Negotiation Recommendations**: Offers actionable advice and email templates to help workers negotiate better terms with HR or management.
- **Privacy First**: Uploaded contracts are analyzed on the fly and are not stored permanently.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, CSS Modules
- **Design**: Modern Glassmorphism UI, Responsive Design, Dark/Light Mode support
- **PDF Parsing**: PDF.js for client-side text extraction

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abyaz1/Abyaz-rama-rafi-belajar-bikin-website.git
   cd Abyaz-rama-rafi-belajar-bikin-website
   cd app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file inside the `app/` directory (if required for the AI backend API).

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Disclaimer

**KawalKontrak.ai** is strictly an educational tool and does not constitute legally binding advice. For severe or highly specific legal disputes, users should consult with professional lawyers or contact the Legal Aid Institute (LBH) in Indonesia.

## 📄 License

This project is open-source and created to protect the rights of Indonesian workers.
