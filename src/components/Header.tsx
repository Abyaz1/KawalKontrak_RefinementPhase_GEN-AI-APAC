'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import s from './Header.module.css';

export function Header() {
  const { locale, t, toggleLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className={`${s.header} ${scrolled ? s.headerScrolled : ''}`}>
      <nav className={s.nav}>
        <div className={s.navLeft}>
          <Link href="/" className={s.logo} onClick={closeMobile}>
            <span>KawalKontrak<span style={{ color: 'var(--color-brand-light)' }}>.ai</span></span>
          </Link>

          <div className={s.privacyBadge}>
            <span className={s.privacyDot} />
            {t.hero_trust_badge}
          </div>
        </div>

        <div className={s.navRight}>
          <ul className={s.navLinks}>
            <li>
              <Link href="/#fitur" className={s.navLink}>
                {t.nav_features}
              </Link>
            </li>
            <li>
              <Link href="/#cara-kerja" className={s.navLink}>
                {t.nav_how_it_works}
              </Link>
            </li>
            <li>
              <Link href="/#faq" className={s.navLink}>
                {t.nav_faq}
              </Link>
            </li>
            <li>
              {pathname === '/analisis' ? (
                <Link href="/" className={s.navCta}>
                  {t.nav_home}
                </Link>
              ) : (
                <Link href="/analisis" className={s.navCta}>
                  {t.nav_start_analysis}
                </Link>
              )}
            </li>
          </ul>

          <div className={s.controls}>
            <button
              onClick={toggleTheme}
              className={s.themeToggleSwitch}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              <div className={s.themeToggleTrack}>
                <span className={s.themeIconLight}>☀️</span>
                <span className={s.themeIconDark}>🌙</span>
                <div className={`${s.themeToggleThumb} ${theme === 'dark' ? s.themeToggleThumbDark : ''}`} />
              </div>
            </button>

            <button
              onClick={toggleLocale}
              className={`${s.controlBtn} ${s.langBtn}`}
              aria-label="Toggle language"
              title={locale === 'id' ? 'English' : 'Bahasa Indonesia'}
            >
              {locale === 'id' ? 'EN' : 'ID'}
            </button>
          </div>

          <button
            className={`${s.hamburger} ${mobileMenuOpen ? s.hamburgerOpen : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={s.hamburgerLine} />
            <span className={s.hamburgerLine} />
            <span className={s.hamburgerLine} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`${s.mobileMenu} ${mobileMenuOpen ? s.mobileMenuOpen : ''}`}>
        <Link href="/#fitur" className={s.mobileNavLink} onClick={closeMobile}>
          {t.nav_features}
        </Link>
        <Link href="/#cara-kerja" className={s.mobileNavLink} onClick={closeMobile}>
          {t.nav_how_it_works}
        </Link>
        <Link href="/#faq" className={s.mobileNavLink} onClick={closeMobile}>
          {t.nav_faq}
        </Link>
        {pathname === '/analisis' ? (
          <Link href="/" className={s.mobileNavCta} onClick={closeMobile}>
            {t.nav_home}
          </Link>
        ) : (
          <Link href="/analisis" className={s.mobileNavCta} onClick={closeMobile}>
            {t.nav_start_analysis}
          </Link>
        )}

        <div className={s.mobileControls}>
          <button onClick={toggleTheme} className={s.mobileControlBtn}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={toggleLocale} className={s.mobileControlBtn}>
            🌐 {locale === 'id' ? 'English' : 'Indonesia'}
          </button>
        </div>
      </div>
    </header>
  );
}
