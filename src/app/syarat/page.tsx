import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | KawalKontrak.ai',
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '80px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--color-brand)' }}>Terms of Service</h1>
        <div style={{ lineHeight: '1.8', color: 'var(--color-neutral)', fontSize: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>
            <strong>Acceptance of Terms</strong><br />
            By accessing and using KawalKontrak.ai, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
          </p>
          <p>
            <strong>Service Description</strong><br />
            KawalKontrak.ai provides an AI-powered tool to analyze employment contracts against Indonesian labor laws. The service is provided &ldquo;as is&rdquo; and is intended for informational and educational purposes.
          </p>
          <p>
            <strong>User Conduct</strong><br />
            You agree not to use the service for any unlawful purpose or in any way that might harm, damage, or disparage any other party. You must not submit sensitive personal information (such as ID numbers or banking details) if it is not necessary for the analysis.
          </p>
          <p>
            <strong>Modifications</strong><br />
            We reserve the right to modify or discontinue the service with or without notice to the user. We shall not be liable to you or any third party should we exercise our right to modify or discontinue the service.
          </p>
          <p>
            <strong>Governing Law</strong><br />
            These Terms shall be governed and construed in accordance with the laws of Indonesia, without regard to its conflict of law provisions.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
