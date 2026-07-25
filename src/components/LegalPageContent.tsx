'use client';

/**
 * LegalPageContent — tata letak bersama untuk halaman legal (Disclaimer,
 * Privasi, Ketentuan Layanan). Konten dwibahasa; teks mengikuti toggle
 * bahasa global lewat useI18n(), sama seperti slider di beranda.
 */

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useI18n } from '@/lib/i18n';

type Localized = { en: string; id: string };

interface Section {
  heading: Localized;
  body: Localized;
}

interface Props {
  title: Localized;
  sections: Section[];
}

export function LegalPageContent({ title, sections }: Props) {
  const { locale } = useI18n();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '104px 20px 64px', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
        <div className="content-panel">
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--color-brand)' }}>
            {title[locale]}
          </h1>
          <div style={{ lineHeight: '1.8', color: 'var(--color-neutral)', fontSize: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sections.map((section, index) => (
              <p key={index}>
                <strong>{section.heading[locale]}</strong>
                <br />
                {section.body[locale]}
              </p>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
