'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SlideParticles } from "@/components/SlideParticles";
import { useI18n } from "@/lib/i18n";
import { AlertTriangleIcon } from "@/components/Icons";
import styles from './page.module.css';

/* ─── Testimonial / Background Facts Data ─── */
const backgroundFacts = [
  {
    titleId: '66% Pekerja Kontrak',
    titleEn: '66% of Contract Workers',
    descId: 'Tidak menerima pesangon saat kontrak berakhir karena ketidaktahuan atas hak yang tertulis (atau tidak tertulis) di SPK.',
    descEn: 'Do not receive severance pay when their contract ends due to ignorance of their rights written in the contract.',
    detailId: 'Menurut hukum Indonesia, pekerja dengan kontrak waktu tertentu (PKWT) berhak atas uang kompensasi saat kontrak berakhir. Karena hak ini jarang ditulis jelas dalam dokumen, banyak pekerja tidak pernah menuntutnya. Mengetahui klausul ini sebelum menandatangani adalah pembeda antara Anda dan hak yang seharusnya diterima.',
    detailEn: 'Under Indonesian law, fixed-term (PKWT) workers are entitled to compensation pay when their contract ends. Because this right is rarely stated plainly in the document, many workers never claim it. Knowing the clause exists before you sign is what stands between you and the money you are owed.',
    sourceId: 'Dasar hukum: PP No. 35 Tahun 2021 tentang PKWT.',
    sourceEn: 'Legal basis: Government Regulation (PP) No. 35/2021 on fixed-term employment (PKWT).',
  },
  {
    titleId: 'Asimetri Informasi',
    titleEn: 'Information Asymmetry',
    descId: 'Bahasa hukum sengaja dibuat rumit (center-embedding) sehingga mayoritas orang menyetujui dokumen tanpa membaca atau memahami penuh implikasinya.',
    descEn: 'Legal language is deliberately complex (center-embedding), causing most people to agree to documents without fully reading or understanding the implications.',
    detailId: 'Asimetri informasi terjadi ketika satu pihak dalam kesepakatan mengetahui jauh lebih banyak daripada pihak lain. Kontrak sering memakai kalimat bertumpuk (center-embedding) yang sulit dicerna, sehingga kebanyakan orang menandatangani tanpa memahami penuh implikasinya. Makin jelas bahasanya, makin adil perjanjiannya.',
    detailEn: 'Information asymmetry is when one side of a deal knows far more than the other. Contracts often use deeply nested, center-embedded sentences that are hard to parse, so most people sign without fully grasping the implications. The clearer the language, the fairer the agreement.',
    sourceId: 'Konsep: asimetri informasi, George Akerlof, "The Market for Lemons" (1970).',
    sourceEn: 'Concept: information asymmetry, George Akerlof, "The Market for Lemons" (1970).',
  },
  {
    titleId: '55% Pekerja Lembur',
    titleEn: '55% of Overtime Workers',
    descId: 'Pekerja tidak dibayar sesuai standar karena klausul lembur yang ambigu atau bersifat sepihak sejak awal penandatanganan kontrak.',
    descEn: 'Workers are not paid according to standards due to ambiguous or one-sided overtime clauses from the moment the contract is signed.',
    detailId: 'Upah lembur diatur oleh hukum ketenagakerjaan Indonesia, namun klausul lembur yang ambigu atau sepihak membuat sebagian pemberi kerja membayar di bawah standar. Mengenali klausul lembur yang ambigu sebelum menandatangani membantu Anda menuntut jam kerja yang benar-benar Anda lakukan.',
    detailEn: 'Overtime pay is regulated by Indonesian labor law, yet vague or one-sided overtime clauses let some employers pay below the standard. Spotting an ambiguous overtime clause before signing helps you claim the hours you actually work.',
    sourceId: 'Dasar hukum: UU Ketenagakerjaan No. 13 Tahun 2003 (ketentuan upah lembur).',
    sourceEn: 'Legal basis: Manpower Law No. 13/2003 (overtime pay provisions).',
  },
];

/* ─── Monochrome line icons (inherit theme color via currentColor) ─── */
const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const DiplomaIcon = () => (
  <svg {...iconProps}>
    <path d="M2 8.5 12 4l10 4.5-10 4.5z" />
    <path d="M6 10.5V15c0 1.2 2.7 2.6 6 2.6s6-1.4 6-2.6v-4.5" />
    <path d="M22 8.5v4.5" />
  </svg>
);

const ExitIcon = () => (
  <svg {...iconProps}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
    <path d="M18 8l4 4-4 4" />
    <path d="M22 12H10" />
  </svg>
);

const ClockIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

const BanIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.6 5.6 18.4 18.4" />
  </svg>
);

const DocEditIcon = () => (
  <svg {...iconProps}>
    <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
    <path d="M8 8h5M8 12h4" />
    <path d="M17.5 3.5a2.12 2.12 0 0 1 3 3L15 12l-4 1 1-4z" />
  </svg>
);

const ScaleIcon = () => (
  <svg {...iconProps}>
    <path d="M12 4v16" />
    <path d="M8 20h8" />
    <path d="M5 7h14" />
    <path d="M5 7 2.5 12.2h5z" />
    <path d="M19 7l-2.5 5.2h5z" />
  </svg>
);

/* ─── Privacy icons (Slide 4) ─── */
const ShieldIllustration = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <defs>
      <linearGradient id="privacyShieldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" style={{ stopColor: 'var(--color-primary)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--color-brand-accent)' }} />
      </linearGradient>
    </defs>
    <path
      stroke="url(#privacyShieldGrad)"
      d="M12 2.5l7.5 3.2v5.1c0 4.8-3.2 8.1-7.5 9.7-4.3-1.6-7.5-4.9-7.5-9.7V5.7z"
    />
    <path stroke="url(#privacyShieldGrad)" d="M8.5 12l2.5 2.5 4.5-4.7" />
  </svg>
);

const DatabaseOffIcon = () => (
  <svg {...iconProps}>
    <ellipse cx="12" cy="5.5" rx="7" ry="3" />
    <path d="M5 5.5v13c0 1.66 3.13 3 7 3s7-1.34 7-3v-13" />
    <path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3" />
    <path d="M3.5 3.5l17 17" />
  </svg>
);

const EyeOffIcon = () => (
  <svg {...iconProps}>
    <path d="M10.7 5.1A10.6 10.6 0 0 1 12 5c6 0 10 7 10 7a17.7 17.7 0 0 1-3.3 3.9" />
    <path d="M6.6 6.6A17.6 17.6 0 0 0 2 12s4 7 10 7a10.2 10.2 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="M2 2l20 20" />
  </svg>
);

const DiscardIcon = () => (
  <svg {...iconProps}>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

/* ─── Bilingual copy for slides 2-4 (react to the language toggle) ─── */
const sliderCopy = {
  free: {
    title: { en: 'Zero Cost to Pay', id: 'Tanpa Biaya Sepeser Pun' },
    subtitle: {
      en: 'KawalKontrak.ai is completely free. There are no fees, no subscriptions, and no hidden charges. Analyze every employment contract without paying a thing.',
      id: 'KawalKontrak.ai sepenuhnya gratis. Tidak ada biaya, tanpa langganan, dan tanpa pungutan tersembunyi. Analisis setiap kontrak kerja tanpa membayar sepeser pun.',
    },
  },
  redFlags: {
    badge: { en: 'Common Contract Red Flags', id: 'Tanda Bahaya Umum dalam Kontrak' },
    titleLead: { en: 'Clauses That Quietly Work', id: 'Klausul yang Diam-Diam' },
    titleAccent: { en: 'Against You', id: 'Merugikan Anda' },
    subtitle: {
      en: 'These provisions frequently appear in employment contracts and can trap workers unfairly.',
      id: 'Ketentuan seperti ini sering muncul dalam kontrak kerja dan dapat menjebak pekerja secara tidak adil.',
    },
  },
  privacy: {
    title: { en: 'Zero Data Stored', id: 'Tidak Ada Data Disimpan' },
    subtitle: {
      en: 'We keep no records. Every contract you upload is analyzed instantly and then permanently discarded, so nothing about you is ever retained.',
      id: 'Kami tidak menyimpan catatan apa pun. Setiap kontrak yang Anda unggah dianalisis seketika lalu langsung dihapus permanen, sehingga tidak ada data tentang Anda yang tersimpan.',
    },
  },
} as const;

/* ─── Red Flags (Slide 3) ─── */
const redFlags = [
  {
    icon: <DiplomaIcon />,
    title: { en: 'Diploma Withholding', id: 'Penahanan Ijazah' },
    desc: {
      en: 'The employer retains your original diploma or certificates as collateral until an undefined condition is met.',
      id: 'Perusahaan menahan ijazah atau sertifikat asli Anda sebagai jaminan hingga syarat yang tidak jelas terpenuhi.',
    },
  },
  {
    icon: <ExitIcon />,
    title: { en: 'Exit Penalty', id: 'Penalti Pengunduran Diri' },
    desc: {
      en: 'You are required to pay a substantial fee or "training cost" simply to resign before an arbitrary date.',
      id: 'Anda diwajibkan membayar denda atau "biaya pelatihan" yang besar hanya untuk mengundurkan diri sebelum tanggal tertentu.',
    },
  },
  {
    icon: <ClockIcon />,
    title: { en: 'Unpaid Overtime', id: 'Lembur Tanpa Bayaran' },
    desc: {
      en: 'Ambiguous clauses classify extra hours as "voluntary dedication," removing your right to overtime pay.',
      id: 'Klausul yang ambigu menggolongkan jam kerja tambahan sebagai "pengabdian sukarela", sehingga menghapus hak Anda atas upah lembur.',
    },
  },
  {
    icon: <BanIcon />,
    title: { en: 'Excessive Non-Compete', id: 'Larangan Bersaing Berlebihan' },
    desc: {
      en: 'You are barred from working in your entire field for years after leaving, with no compensation offered.',
      id: 'Anda dilarang bekerja di seluruh bidang Anda selama bertahun-tahun setelah keluar, tanpa kompensasi apa pun.',
    },
  },
  {
    icon: <DocEditIcon />,
    title: { en: 'Unilateral Amendment', id: 'Perubahan Sepihak' },
    desc: {
      en: 'The company reserves the right to change your salary, role, or duties at any time without your consent.',
      id: 'Perusahaan berhak mengubah gaji, jabatan, atau tugas Anda kapan saja tanpa persetujuan Anda.',
    },
  },
  {
    icon: <ScaleIcon />,
    title: { en: 'Severance Waiver', id: 'Pengguguran Pesangon' },
    desc: {
      en: 'Hidden wording forces you to forfeit legally mandated severance or compensation when the contract ends.',
      id: 'Kalimat tersembunyi memaksa Anda melepaskan pesangon atau kompensasi yang diwajibkan hukum saat kontrak berakhir.',
    },
  },
];

/* ─── Privacy guarantees (Slide 4) ─── */
const privacyPoints = [
  {
    icon: <DatabaseOffIcon />,
    title: { en: 'Nothing Stored', id: 'Tidak Ada yang Disimpan' },
    text: {
      en: 'Files are processed in memory and never saved to any database.',
      id: 'Berkas diproses di memori dan tidak pernah disimpan ke basis data mana pun.',
    },
  },
  {
    icon: <EyeOffIcon />,
    title: { en: 'No Tracking', id: 'Tanpa Pelacakan' },
    text: {
      en: 'There are no accounts, no cookies, and no profiling of any kind.',
      id: 'Tidak ada akun, tidak ada cookie, dan tidak ada pembuatan profil dalam bentuk apa pun.',
    },
  },
  {
    icon: <DiscardIcon />,
    title: { en: 'Instantly Discarded', id: 'Langsung Dihapus' },
    text: {
      en: 'Your contract is deleted the moment the analysis is complete.',
      id: 'Kontrak Anda dihapus begitu analisis selesai.',
    },
  },
];

export default function HomePage() {
  const { locale, t } = useI18n();
  /* Akordeon FAQ: hanya satu jawaban terbuka pada satu waktu. */
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openFacts, setOpenFacts] = useState<number[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const slideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TOTAL_SLIDES = 4;

  const goToSlide = (index: number) => {
    setCurrentSlide((index + TOTAL_SLIDES) % TOTAL_SLIDES);
    // Pause slide particles for the duration of the transform so it stays smooth.
    setIsSliding(true);
    if (slideTimer.current) clearTimeout(slideTimer.current);
    slideTimer.current = setTimeout(() => setIsSliding(false), 900);
  };

  useEffect(
    () => () => {
      if (slideTimer.current) clearTimeout(slideTimer.current);
    },
    []
  );

  /* Membuka satu pertanyaan menutup yang sedang terbuka. */
  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const toggleFact = (index: number) => {
    setOpenFacts((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
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

      {/* ════════════ HERO SLIDER ════════════ */}
      <div className={styles.heroSlider}>
        <div
          className={styles.heroTrack}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* ── Slide 1: Hero (unchanged) ── */}
          <section className={`${styles.hero} ${styles.heroSlide}`}>
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
            </div>
          </section>

          {/* ── Slide 2: Zero Cost ── */}
          <section className={`${styles.hero} ${styles.heroSlide} ${styles.solidSlide}`}>
            <SlideParticles paused={isSliding || currentSlide !== 1} />
            <div className={styles.freeContent}>
              <div className={styles.freeZero} data-text="Rp.0,-">Rp.0,-</div>
              <h2 className={styles.freeTitle}>{sliderCopy.free.title[locale]}</h2>
              <p className={styles.freeSubtitle}>
                {sliderCopy.free.subtitle[locale]}
              </p>
            </div>
          </section>

          {/* ── Slide 3: Red Flags Showcase ── */}
          <section className={`${styles.hero} ${styles.heroSlide} ${styles.solidSlide}`}>
            <SlideParticles paused={isSliding || currentSlide !== 2} />
            <div className={styles.redFlagsContent}>
              <span className={styles.redFlagsBadge}>
                <AlertTriangleIcon className="icon-inline" />
                {sliderCopy.redFlags.badge[locale]}
              </span>
              <h2 className={styles.redFlagsTitle}>
                {sliderCopy.redFlags.titleLead[locale]}{' '}
                <span className={styles.redFlagsTitleAccent}>{sliderCopy.redFlags.titleAccent[locale]}</span>
              </h2>
              <p className={styles.redFlagsSubtitle}>
                {sliderCopy.redFlags.subtitle[locale]}
              </p>

              <div className={styles.redFlagsGrid}>
                {redFlags.map((flag, index) => (
                  <div key={index} className={styles.redFlagCard}>
                    <span className={styles.redFlagIcon}>{flag.icon}</span>
                    <div className={styles.redFlagText}>
                      <h3 className={styles.redFlagCardTitle}>{flag.title[locale]}</h3>
                      <p className={styles.redFlagCardDesc}>{flag.desc[locale]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Slide 4: Data Safety / Zero Data Stored ── */}
          <section className={`${styles.hero} ${styles.heroSlide} ${styles.solidSlide}`}>
            <SlideParticles paused={isSliding || currentSlide !== 3} />
            <div className={styles.privacyContent}>
              <div className={styles.privacyShield}>
                <ShieldIllustration />
              </div>
              <h2 className={styles.privacyTitle}>{sliderCopy.privacy.title[locale]}</h2>
              <p className={styles.privacySubtitle}>
                {sliderCopy.privacy.subtitle[locale]}
              </p>

              <div className={styles.privacyPoints}>
                {privacyPoints.map((point, index) => (
                  <div key={index} className={styles.privacyCard}>
                    <span className={styles.privacyIcon}>{point.icon}</span>
                    <h3 className={styles.privacyCardTitle}>{point.title[locale]}</h3>
                    <p className={styles.privacyCardDesc}>{point.text[locale]}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── Slider Controls ── */}
        <button
          type="button"
          className={`${styles.sliderArrow} ${styles.sliderArrowLeft}`}
          onClick={() => goToSlide(currentSlide - 1)}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          type="button"
          className={`${styles.sliderArrow} ${styles.sliderArrowRight}`}
          onClick={() => goToSlide(currentSlide + 1)}
          aria-label="Next slide"
        >
          ›
        </button>

        <div className={styles.sliderDots}>
          {Array.from({ length: TOTAL_SLIDES }).map((_, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.sliderDot} ${currentSlide === index ? styles.sliderDotActive : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

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
            {backgroundFacts.map((fact, index) => {
              const open = openFacts.includes(index);
              return (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  className={`${styles.factCard} ${open ? styles.factCardOpen : ''}`}
                  onClick={() => toggleFact(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleFact(index);
                    }
                  }}
                  aria-expanded={open}
                >
                  <div className={styles.factHead}>
                    <h3 className={styles.factTitle}>
                      {locale === 'id' ? fact.titleId : fact.titleEn}
                    </h3>
                    <span className={`${styles.factChevron} ${open ? styles.factChevronOpen : ''}`}>▾</span>
                  </div>
                  <p className={styles.factDesc}>
                    {locale === 'id' ? fact.descId : fact.descEn}
                  </p>
                  {open && (
                    <div className={styles.factDetail}>
                      <p className={styles.factDetailText}>
                        {locale === 'id' ? fact.detailId : fact.detailEn}
                      </p>
                      <p className={styles.factSource}>
                        {locale === 'id' ? fact.sourceId : fact.sourceEn}
                      </p>
                    </div>
                  )}
                  <span className={styles.factToggleHint}>
                    {open
                      ? locale === 'id' ? 'Tutup' : 'Close'
                      : locale === 'id' ? 'Selengkapnya' : 'Learn more'}
                  </span>
                </div>
              );
            })}
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
          {localizedFaq.map((faq, index) => {
            const open = openFaq === index;
            return (
              <div
                key={index}
                className={`${styles.faqItem} ${open ? styles.faqItemOpen : ''}`}
              >
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(index)}
                  aria-expanded={open}
                >
                  <span>{faq.question}</span>
                  <span
                    className={`${styles.faqChevron} ${open ? styles.faqChevronOpen : ''}`}
                  >
                    ▼
                  </span>
                </button>
                <div
                  className={`${styles.faqAnswerWrapper} ${open ? styles.faqAnswerWrapperOpen : ''}`}
                >
                  <p className={styles.faqAnswer}>{faq.answer}</p>
                </div>
              </div>
            );
          })}
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
