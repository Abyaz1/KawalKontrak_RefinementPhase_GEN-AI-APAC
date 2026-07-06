'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/context/AuthContext';
import s from './Header.module.css';

export function Header() {
  const { locale, t, toggleLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

          {/* Desktop Auth */}
          <div className={s.authWrapper}>
            {loading ? (
              <div className={s.avatarPlaceholder} />
            ) : user ? (
              <div className={s.avatarContainer} ref={dropdownRef}>
                <button
                  className={s.avatarBtn}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="User profile"
                  type="button"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className={s.avatarImg} />
                  ) : (
                    <span className={s.avatarText}>{(user.displayName || user.email || '?')[0].toUpperCase()}</span>
                  )}
                </button>
                {dropdownOpen && (
                  <div className={s.dropdownMenu}>
                    <div className={s.dropdownUser}>
                      <div className={s.dropdownName}>{user.displayName || 'Pekerja KawalKontrak'}</div>
                      <div className={s.dropdownEmail}>{user.email}</div>
                    </div>
                    <hr className={s.dropdownDivider} />
                    <Link href="/analisis" className={s.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      {locale === 'id' ? 'Riwayat Analisis' : 'Analysis History'}
                    </Link>
                    <button
                      className={s.dropdownItem}
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      type="button"
                    >
                      {locale === 'id' ? 'Keluar' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className={s.loginBtn} onClick={loginWithGoogle} type="button">
                {locale === 'id' ? 'Masuk' : 'Sign In'}
              </button>
            )}
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

        {/* Mobile Auth */}
        <div className={s.mobileAuth}>
          {loading ? (
            <div className={s.avatarPlaceholder} style={{ margin: '0 auto' }} />
          ) : user ? (
            <div className={s.mobileUser}>
              <div className={s.mobileUserDetails}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className={s.mobileAvatar} />
                ) : (
                  <div className={s.mobileAvatar} style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                    {(user.displayName || user.email || '?')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className={s.mobileUserName}>{user.displayName || 'Pekerja KawalKontrak'}</div>
                  <div className={s.mobileUserEmail}>{user.email}</div>
                </div>
              </div>
              <button
                className={s.mobileLogoutBtn}
                onClick={() => {
                  logout();
                  closeMobile();
                }}
                type="button"
              >
                {locale === 'id' ? 'Keluar' : 'Sign Out'}
              </button>
            </div>
          ) : (
            <button
              className={s.mobileLoginBtn}
              onClick={() => {
                loginWithGoogle();
                closeMobile();
              }}
              type="button"
            >
              {locale === 'id' ? 'Masuk dengan Google' : 'Sign In with Google'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
