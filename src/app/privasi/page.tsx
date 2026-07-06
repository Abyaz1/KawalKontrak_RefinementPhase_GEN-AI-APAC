import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | KawalKontrak.ai',
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '80px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--color-brand)' }}>Privacy Policy</h1>
        <div style={{ lineHeight: '1.8', color: 'var(--color-neutral)', fontSize: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>
            <strong>Data Collection and Usage</strong><br />
            We take your privacy seriously. The employment contracts and documents you upload or paste for analysis are processed securely. We only use the provided text to perform the requested analysis against labor regulations.
          </p>
          <p>
            <strong>Data Storage</strong><br />
            Unless you are logged into your account and explicitly save your analysis history, the text you submit is not stored permanently on our servers. Your contract data is processed in-memory or via secure APIs and is discarded after the analysis is complete. For logged-in users, analysis history is securely stored in Firebase and can be deleted by you at any time.
          </p>
          <p>
            <strong>Third-Party Services</strong><br />
            We utilize Google Gemini AI to process and analyze the contracts. Your text is transmitted securely to their API. We do not sell, rent, or share your personal data or contract contents with any other third parties for marketing purposes.
          </p>
          <p>
            <strong>Cookies and Local Storage</strong><br />
            We use local storage in your browser to save your language preference, theme settings, and recent analysis history (if not logged in) to provide a better user experience. You can clear this data at any time by clearing your browser data.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
