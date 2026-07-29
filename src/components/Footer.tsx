'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { AlertTriangleIcon } from '@/components/Icons';
import styles from './Footer.module.css';

export function Footer() {
  const { t, locale } = useI18n();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <Image src="/logo.png" alt="KawalKontrak Logo" width={32} height={32} className={styles.logoImg} /> KawalKontrak.ai
            </div>
            <p className={styles.footerTagline}>
              {t.footer_tagline}
            </p>
          </div>

          {/* Platform */}
          <div className={styles.footerColumn}>
            <h4>{t.footer_platform}</h4>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/analisis">{t.footer_analysis}</Link>
              </li>
              <li>
                <Link href="/#fitur">{t.nav_features}</Link>
              </li>
              <li>
                <Link href="/#cara-kerja">{t.nav_how_it_works}</Link>
              </li>
              <li>
                <Link href="/#faq">{t.nav_faq}</Link>
              </li>
            </ul>
          </div>

          {/* Sumber Daya */}
          <div className={styles.footerColumn}>
            <h4>{t.footer_resources}</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a href="https://jdih.kemnaker.go.id" target="_blank" rel="noopener noreferrer">
                  {locale === 'id' ? 'UU Ketenagakerjaan' : 'Labor Regulations'}
                </a>
              </li>
              <li>
                <a href="https://ylbhi.or.id" target="_blank" rel="noopener noreferrer">
                  {locale === 'id' ? 'YLBHI (Bantuan Hukum)' : 'Indonesian Legal Aid (YLBHI)'}
                </a>
              </li>
              <li>
                <a href="https://kspicitu.org" target="_blank" rel="noopener noreferrer">
                  KSPI
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className={styles.footerColumn}>
            <h4>{t.footer_legal}</h4>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/disclaimer">Disclaimer</Link>
              </li>
              <li>
                <Link href="/privasi">{locale === 'id' ? 'Privasi' : 'Privacy'}</Link>
              </li>
              <li>
                <Link href="/syarat">{locale === 'id' ? 'Syarat Penggunaan' : 'Terms of Service'}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerDivider} />

        <div className={styles.footerBottom}>
          <p className={styles.footerDisclaimer}>
            <AlertTriangleIcon className="icon-inline icon-lead" />
            {t.footer_disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
