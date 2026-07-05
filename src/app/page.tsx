'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useI18n } from "@/lib/i18n";
import styles from './page.module.css';

/* ─── Testimonial Data ─── */
const backgroundFacts = [
  {
    titleId: '66% Pekerja Kontrak',
    titleEn: '66% of Contract Workers',
    descId: 'Tidak menerima pesangon saat kontrak berakhir karena ketidaktahuan atas hak yang tertulis (atau tidak tertulis) di SPK.',
    descEn: 'Do not receive severance pay when their contract ends due to ignorance of their rights written in the contract.'
  },
  {
    titleId: 'Asimetri Informasi',
    titleEn: 'Information Asymmetry',
    descId: 'Bahasa hukum sengaja dibuat rumit (center-embedding) sehingga mayoritas orang menyetujui dokumen tanpa membaca atau memahami penuh implikasinya.',
    descEn: 'Legal language is deliberately complex (center-embedding), causing most people to agree to documents without fully reading or understanding the implications.'
  },
  {
    titleId: '55% Pekerja Lembur',
    titleEn: '55% of Overtime Workers',
    descId: 'Pekerja tidak dibayar sesuai standar karena klausul lembur yang ambigu atau bersifat sepihak sejak awal penandatanganan kontrak.',
    descEn: 'Workers are not paid according to standards due to ambiguous or one-sided overtime clauses from the moment the contract is signed.'
  },
];

export default function HomePage() {
  const { locale, t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const localizedFeatures = [
    { title: t.feature_1_title, description: t.feature_1_desc },
    { title: t.feature_2_title, description: t.feature_2_desc },
    { title: t.feature_3_title, description: t.feature_3_desc },
    { title: t.feature_4_title, description: t.feature_4_desc },
    { title: t.feature_5_title, description: t.feature_5_desc },
    { title: t.feature_6_title, description: t.feature_6_desc },
  ];

  const localizedSteps = [
    { number: 1, title: t.how_step1_title, description: t.how_step1_desc },
    { number: 2, title: t.how_step2_title, description: t.how_step2_desc },
    { number: 3, title: t.how_step3_title, description: t.how_step3_desc },
  ];

  const localizedFaq = [
    { question: t.faq_q1, answer: t.faq_a1 },
    { question: t.faq_q2, answer: t.faq_a2 },
    { question: t.faq_q3, answer: t.faq_a3 },
    { question: t.faq_q4, answer: t.faq_a4 },
    { question: t.faq_q5, answer: t.faq_a5 },
  ];

  return (
    <>
      {/* ════════════ HEADER ════════════ */}
      <Header />

      {/* ════════════ HERO ════════════ */}
      <section className={styles.hero}>
        {/* Animated background blobs */}
        <div className={styles.heroBackground}>
          <div className={`${styles.heroBlob} ${styles.heroBlob1}`} />
          <div className={`${styles.heroBlob} ${styles.heroBlob2}`} />
          <div className={`${styles.heroBlob} ${styles.heroBlob3}`} />
        </div>

        <div className={styles.heroContent} style={{ paddingTop: '80px' }}>
          <h1 className={styles.heroTitle}>
            {t.hero_title_1}
            <span className={styles.heroTitleAccent}>{t.hero_title_accent}</span>
            {t.hero_title_2}
          </h1>

          <p className={styles.heroSubtitle}>
            {t.hero_subtitle}
          </p>

          <div className={styles.heroActions}>
            <Link href="/analisis" className={styles.ctaPrimary}>
              {t.hero_cta_primary}
            </Link>
            <a href="#fitur" className={styles.ctaSecondary}>
              {t.hero_cta_secondary}
            </a>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>20+</span>
              <span className={styles.statLabel}>{t.hero_stat_flags}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>100%</span>
              <span className={styles.statLabel}>{t.hero_stat_free}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>0</span>
              <span className={styles.statLabel}>{t.hero_stat_data}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <div className={styles.sectionAltWrapper}>
        <section id="fitur" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSubtitle}>{t.features_subtitle}</span>
            <h2 className={styles.sectionTitle}>{t.features_title}</h2>
            <p className={styles.sectionDescription}>
              {t.features_desc}
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {localizedFeatures.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="cara-kerja" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>{t.how_subtitle}</span>
          <h2 className={styles.sectionTitle}>{t.how_title}</h2>
          <p className={styles.sectionDescription}>
            {t.how_desc}
          </p>
        </div>

        <div className={styles.stepsContainer}>
          {localizedSteps.map((step, index) => (
            <div key={index} className={styles.step}>
              <div className={styles.stepIndicator}>
                <div className={styles.stepNumber}>{step.number}</div>
                {index < localizedSteps.length - 1 && <div className={styles.stepConnector} />}
              </div>
              <div className={styles.stepContent}>
                <h3 className={step.number ? '' : styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <div className={styles.sectionAltWrapper}>
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSubtitle}>{t.testimonials_subtitle}</span>
            <h2 className={styles.sectionTitle}>{t.testimonials_title}</h2>
            <p className={styles.sectionDescription}>
              {t.testimonials_desc}
            </p>
          </div>

          <div className={styles.testimonialsGrid}>
            {backgroundFacts.map((fact, index) => (
              <div key={index} className={styles.testimonialCard} style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-dark)', margin: 0 }}>
                  {locale === 'id' ? fact.titleId : fact.titleEn}
                </h3>
                <p style={{ fontStyle: 'normal', color: 'var(--color-neutral-light)', fontSize: 'var(--text-base)', lineHeight: 1.6, margin: 0 }}>
                  {locale === 'id' ? fact.descId : fact.descEn}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ════════════ FAQ ════════════ */}
      <section id="faq" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>{t.faq_subtitle}</span>
          <h2 className={styles.sectionTitle}>{t.faq_title}</h2>
          <p className={styles.sectionDescription}>
            {t.faq_desc}
          </p>
        </div>

        <div className={styles.faqContainer}>
          {localizedFaq.map((faq, index) => (
            <div
              key={index}
              className={`${styles.faqItem} ${openFaq === index ? styles.faqItemOpen : ''}`}
            >
              <button
                className={styles.faqQuestion}
                onClick={() => toggleFaq(index)}
                aria-expanded={openFaq === index}
              >
                <span>{faq.question}</span>
                <span
                  className={`${styles.faqChevron} ${openFaq === index ? styles.faqChevronOpen : ''}`}
                >
                  ▼
                </span>
              </button>
              <div
                className={`${styles.faqAnswerWrapper} ${openFaq === index ? styles.faqAnswerWrapperOpen : ''}`}
              >
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ CTA BANNER ════════════ */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerContent}>
          <h2 className={styles.ctaBannerTitle}>
            {t.cta_title}
          </h2>
          <p className={styles.ctaBannerSubtitle}>
            {t.cta_subtitle}
          </p>
          <Link href="/analisis" className={styles.ctaBannerButton}>
            {t.cta_button}
          </Link>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <Footer />
    </>
  );
}
