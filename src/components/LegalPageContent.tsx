'use client';

/**
 * LegalPageContent: tata letak bersama untuk halaman hukum
 * (Disclaimer, Syarat Layanan, Kebijakan Privasi).
 *
 * Seluruh konten dwibahasa dan mengikuti toggle bahasa global lewat useI18n(),
 * sama seperti bagian lain situs. Versi Bahasa Indonesia adalah versi yang
 * berlaku (UU No. 24 Tahun 2009 dan Perpres No. 63 Tahun 2019); ketika pengguna
 * membaca versi Inggris, pemberitahuan itu ditampilkan otomatis.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useI18n } from '@/lib/i18n';
import { EFFECTIVE_DATE, LEGAL_CONFIG, LEGAL_VERSION } from '@/lib/legal';
import { AlertTriangleIcon, InfoIcon, ScaleIcon, ShieldAlertIcon } from '@/components/Icons';
import s from './LegalPageContent.module.css';

/* ──────────────── Model konten ──────────────── */

export type Localized = { en: string; id: string };
export type LocalizedNode = { en: ReactNode; id: ReactNode };

export interface LegalCallout {
  tone: 'info' | 'warning' | 'critical';
  body: LocalizedNode;
}

export interface LegalTable {
  head: [Localized, Localized];
  rows: [LocalizedNode, LocalizedNode][];
}

export interface LegalSubsection {
  heading: Localized;
  paragraphs?: LocalizedNode[];
  bullets?: LocalizedNode[];
}

export interface LegalSection {
  heading: Localized;
  paragraphs?: LocalizedNode[];
  bullets?: LocalizedNode[];
  numbered?: LocalizedNode[];
  callouts?: LegalCallout[];
  table?: LegalTable;
  subsections?: LegalSubsection[];
}

export type LegalSlug = 'disclaimer' | 'syarat' | 'privasi';

interface Props {
  slug: LegalSlug;
  title: Localized;
  tagline: Localized;
  /** Ringkasan singkat di atas dokumen (opsional). */
  summary?: { title: Localized; bullets: LocalizedNode[] };
  sections: LegalSection[];
  /** Alamat surel yang ditampilkan di kartu metadata. */
  contactEmail?: string;
  /**
   * Beri nomor otomatis pada judul bagian dan daftar isi. Matikan bila judul
   * sudah membawa nomornya sendiri (mis. "Pasal 1: Definisi").
   */
  autoNumber?: boolean;
}

/* ──────────────── Label tetap ──────────────── */

const LABEL = {
  eyebrow: { id: 'Dokumen hukum', en: 'Legal document' },
  version: { id: 'Versi', en: 'Version' },
  effective: { id: 'Berlaku sejak', en: 'Effective from' },
  provider: { id: 'Penyelenggara', en: 'Provider' },
  contact: { id: 'Kontak', en: 'Contact' },
  toc: { id: 'Daftar isi', en: 'Contents' },
  prevailing: {
    id: 'Versi Bahasa Indonesia adalah versi yang berlaku bila terdapat perbedaan penafsiran (UU No. 24 Tahun 2009 dan Perpres No. 63 Tahun 2019).',
    en: 'This English text is provided for convenience. Where it differs from the Indonesian version, the Indonesian version prevails (Law No. 24 of 2009 and Presidential Regulation No. 63 of 2019).',
  },
  switchToId: { id: 'Beralih ke Bahasa Indonesia', en: 'Switch to Bahasa Indonesia' },
} as const;

const DOC_LABEL: Record<LegalSlug, Localized> = {
  disclaimer: { id: 'Disclaimer', en: 'Disclaimer' },
  syarat: { id: 'Syarat Layanan', en: 'Terms of Service' },
  privasi: { id: 'Kebijakan Privasi', en: 'Privacy Policy' },
};

const DOC_ORDER: LegalSlug[] = ['disclaimer', 'syarat', 'privasi'];

const CALLOUT_ICON = {
  info: InfoIcon,
  warning: AlertTriangleIcon,
  critical: ShieldAlertIcon,
} as const;

const CALLOUT_CLASS = {
  info: s.calloutInfo,
  warning: s.calloutWarning,
  critical: s.calloutCritical,
} as const;

/** Ubah judul bagian menjadi id anchor yang stabil. */
function anchorId(index: number): string {
  return `bagian-${index + 1}`;
}

/* ──────────────── Komponen ──────────────── */

export function LegalPageContent({
  slug,
  title,
  tagline,
  summary,
  sections,
  contactEmail = LEGAL_CONFIG.contactEmail,
  autoNumber = true,
}: Props) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={s.page}>
      <Header />

      <main className={s.main}>
        <header className={s.docHead}>
          <span className={s.eyebrow}>
            <ScaleIcon />
            {LABEL.eyebrow[locale]}
          </span>
          <h1 className={s.title}>{title[locale]}</h1>
          <p className={s.tagline}>{tagline[locale]}</p>

          <div className={s.metaCard}>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>{LABEL.version[locale]}</span>
              <span className={s.metaValue}>{LEGAL_VERSION}</span>
            </div>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>{LABEL.effective[locale]}</span>
              <span className={s.metaValue}>{EFFECTIVE_DATE[locale]}</span>
            </div>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>{LABEL.provider[locale]}</span>
              <span className={s.metaValue}>{LEGAL_CONFIG.entity}</span>
            </div>
            {contactEmail && (
              <div className={s.metaItem}>
                <span className={s.metaLabel}>{LABEL.contact[locale]}</span>
                <span className={s.metaValue}>
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </span>
              </div>
            )}
          </div>

          {locale === 'en' && (
            <p className={s.prevailing}>
              <AlertTriangleIcon />
              <span>
                {LABEL.prevailing.en}{' '}
                <button
                  type="button"
                  onClick={() => setLocale('id')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    font: 'inherit',
                    color: 'var(--color-brand-light)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                  }}
                >
                  {LABEL.switchToId.en}
                </button>
              </span>
            </p>
          )}

          {summary && (
            <section className={s.summary}>
              <h2 className={s.summaryTitle}>{summary.title[locale]}</h2>
              <ul className={s.summaryList}>
                {summary.bullets.map((b, i) => (
                  <li key={i}>
                    <span>{b[locale]}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <nav className={s.toc} aria-label={LABEL.toc[locale]}>
            <h2 className={s.tocTitle}>{LABEL.toc[locale]}</h2>
            <ol className={`${s.tocList} ${autoNumber ? '' : s.tocListPlain}`}>
              {sections.map((sec, i) => (
                <li key={i}>
                  <a href={`#${anchorId(i)}`}>{sec.heading[locale]}</a>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        <div className={s.sections}>
          {sections.map((sec, i) => (
            <section key={i} id={anchorId(i)} className={s.section}>
              <h2 className={s.sectionHeading}>
                {autoNumber && <span className={s.sectionNum}>{i + 1}.</span>}
                {sec.heading[locale]}
              </h2>

              {sec.paragraphs?.map((p, j) => (
                <p key={j} className={s.paragraph}>
                  {p[locale]}
                </p>
              ))}

              {sec.bullets && (
                <ul className={s.bullets}>
                  {sec.bullets.map((b, j) => (
                    <li key={j}>
                      <span>{b[locale]}</span>
                    </li>
                  ))}
                </ul>
              )}

              {sec.numbered && (
                <ol className={s.numbered}>
                  {sec.numbered.map((n, j) => (
                    <li key={j}>
                      <span>{n[locale]}</span>
                    </li>
                  ))}
                </ol>
              )}

              {sec.table && (
                <div className={s.tableWrap}>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>{sec.table.head[0][locale]}</th>
                        <th>{sec.table.head[1][locale]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.table.rows.map((row, j) => (
                        <tr key={j}>
                          <td>{row[0][locale]}</td>
                          <td>{row[1][locale]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {sec.subsections?.map((sub, j) => (
                <div key={j} className={s.subsection}>
                  <h3 className={s.subHeading}>{sub.heading[locale]}</h3>
                  {sub.paragraphs?.map((p, k) => (
                    <p key={k} className={s.paragraph}>
                      {p[locale]}
                    </p>
                  ))}
                  {sub.bullets && (
                    <ul className={s.bullets}>
                      {sub.bullets.map((b, k) => (
                        <li key={k}>
                          <span>{b[locale]}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {sec.callouts?.map((co, j) => {
                const Icon = CALLOUT_ICON[co.tone];
                return (
                  <div key={j} className={`${s.callout} ${CALLOUT_CLASS[co.tone]}`}>
                    <Icon />
                    <span>{co.body[locale]}</span>
                  </div>
                );
              })}
            </section>
          ))}
        </div>

        <nav className={s.docNav} aria-label={locale === 'id' ? 'Dokumen hukum lain' : 'Other legal documents'}>
          {DOC_ORDER.map((doc) =>
            doc === slug ? (
              <span key={doc} className={`${s.docNavLink} ${s.docNavCurrent}`}>
                {DOC_LABEL[doc][locale]}
              </span>
            ) : (
              <Link key={doc} href={`/${doc}`} className={s.docNavLink}>
                {DOC_LABEL[doc][locale]}
              </Link>
            ),
          )}
        </nav>
      </main>

      <Footer />
    </div>
  );
}
