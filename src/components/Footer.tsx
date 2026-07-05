import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span>🛡️</span> KawalKontrak.ai
            </div>
            <p className={styles.footerTagline}>
              Platform analisis kontrak kerja berbasis AI untuk melindungi hak-hak pekerja Indonesia. Gratis, aman, dan transparan.
            </p>
          </div>

          {/* Platform */}
          <div className={styles.footerColumn}>
            <h4>Platform</h4>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/analisis">Analisis Kontrak</Link>
              </li>
              <li>
                <Link href="/#fitur">Fitur</Link>
              </li>
              <li>
                <Link href="/#cara-kerja">Cara Kerja</Link>
              </li>
              <li>
                <Link href="/#faq">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Sumber Daya */}
          <div className={styles.footerColumn}>
            <h4>Sumber Daya</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a href="https://jdih.kemnaker.go.id" target="_blank" rel="noopener noreferrer">
                  UU Ketenagakerjaan
                </a>
              </li>
              <li>
                <a href="https://www.bantuanhukum.or.id" target="_blank" rel="noopener noreferrer">
                  LBH Indonesia
                </a>
              </li>
              <li>
                <a href="https://kspi.or.id" target="_blank" rel="noopener noreferrer">
                  KSPI
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className={styles.footerColumn}>
            <h4>Legal</h4>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/disclaimer">Disclaimer</Link>
              </li>
              <li>
                <Link href="/privasi">Privasi</Link>
              </li>
              <li>
                <Link href="/syarat">Syarat Penggunaan</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerDivider} />

        <div className={styles.footerBottom}>
          <p className={styles.footerDisclaimer}>
            ⚠️ KawalKontrak.ai bukan nasihat hukum. Hasil analisis bersifat edukatif.
            Konsultasikan dengan profesional hukum untuk kasus yang memerlukan penanganan serius. Data yang diunggah tidak disimpan secara permanen.
          </p>

          <div className={styles.footerSocials}>
            <a href="#" className={styles.socialLink} aria-label="Twitter" title="Twitter">
              𝕏
            </a>
            <a href="#" className={styles.socialLink} aria-label="GitHub" title="GitHub">
              GH
            </a>
            <a href="#" className={styles.socialLink} aria-label="Instagram" title="Instagram">
              IG
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
