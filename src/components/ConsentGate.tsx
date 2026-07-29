'use client';

/**
 * ConsentGate: gerbang persetujuan wajib untuk halaman analisis.
 *
 * Alur:
 *   - Pengguna masuk ke /analisis → modal tampil menutupi halaman.
 *   - Menolak    → diarahkan kembali ke halaman utama ("/").
 *   - Menyetujui → persetujuan dicatat di localStorage, modal ditutup,
 *                  pengguna melanjutkan di halaman analisis.
 *
 * Persetujuan terikat pada LEGAL_VERSION. Menaikkan versi dokumen otomatis
 * membatalkan persetujuan lama dan meminta pengguna menyetujui ulang.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import {
  EFFECTIVE_DATE,
  LEGAL_VERSION,
  consentCopy,
  hasCurrentConsent,
  writeConsent,
} from '@/lib/legal';
import { ScaleIcon, ShieldCheckIcon, SpinnerIcon } from '@/components/Icons';
import s from './ConsentGate.module.css';

type GateState = 'checking' | 'open' | 'granted' | 'declined';

interface ConsentGateProps {
  /** Ke mana pengguna diarahkan bila menolak. Default: halaman utama. */
  declineHref?: string;
  /** Halaman yang dilindungi. Dinonaktifkan sampai persetujuan diberikan. */
  children: React.ReactNode;
}

export function ConsentGate({ declineHref = '/', children }: ConsentGateProps) {
  const { locale } = useI18n();
  const router = useRouter();
  const c = consentCopy(locale);

  const [state, setState] = useState<GateState>('checking');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);

  /* localStorage hanya ada di client, jadi cek setelah mount agar SSR aman. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(hasCurrentConsent() ? 'granted' : 'open');
  }, []);

  /* Kunci gulir latar selama modal terbuka. */
  useEffect(() => {
    if (state === 'granted' || state === 'checking') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [state]);

  const accept = useCallback(() => {
    if (!agreeTerms || !agreeAge) return;
    writeConsent(locale, true);
    setState('granted');
  }, [agreeTerms, agreeAge, locale]);

  const decline = useCallback(() => {
    setState('declined');
    router.push(declineHref);
  }, [router, declineHref]);

  if (state === 'granted') return <>{children}</>;

  const canAccept = agreeTerms && agreeAge;

  /* Halaman tetap dirender di belakang modal supaya pengguna tahu di mana ia
     berada, tetapi dinonaktifkan sepenuhnya (inert) sampai ia menyetujui. */
  return (
    <>
      <div inert>{children}</div>

      {state !== 'checking' && (
        <div className={s.overlay} role="dialog" aria-modal="true" aria-labelledby="consent-title">
          <div className={s.dialog}>
            {state === 'declined' ? (
              <div className={s.leaving}>
                <SpinnerIcon />
                <p className={s.leavingText}>{c.declineHint}</p>
              </div>
            ) : (
              <>
                <div className={s.head}>
                  <span className={s.eyebrow}>
                    <ScaleIcon />
                    {c.eyebrow}
                  </span>
                  <h2 id="consent-title" className={s.title}>
                    {c.title}
                  </h2>
                  <p className={s.intro}>{c.intro}</p>
                </div>

                <div className={s.body}>
                  <ol className={s.points}>
                    {c.points.map((p, i) => (
                      <li key={i} className={s.point}>
                        <span className={s.pointNum}>{i + 1}</span>
                        <p className={s.pointText}>
                          <strong className={s.pointHeading}>{p.heading}</strong> {p.body}
                        </p>
                      </li>
                    ))}
                  </ol>

                  <p className={s.footnote}>
                    <ShieldCheckIcon />
                    <span>{c.footnote}</span>
                  </p>
                </div>

                <div className={s.foot}>
                  <label className={s.check}>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>
                      {c.checkboxTerms}{' '}
                      <Link href="/syarat" target="_blank" rel="noopener noreferrer">
                        {c.docs.syarat}
                      </Link>
                      {', '}
                      <Link href="/disclaimer" target="_blank" rel="noopener noreferrer">
                        {c.docs.disclaimer}
                      </Link>
                      {', '}
                      <Link href="/privasi" target="_blank" rel="noopener noreferrer">
                        {c.docs.privasi}
                      </Link>
                      {c.checkboxTermsSuffix}
                    </span>
                  </label>

                  <label className={s.check}>
                    <input
                      type="checkbox"
                      checked={agreeAge}
                      onChange={(e) => setAgreeAge(e.target.checked)}
                    />
                    <span>
                      {c.checkboxAge}
                      <span className={s.checkHint}>{c.checkboxAgeHint}</span>
                    </span>
                  </label>

                  <div className={s.actions}>
                    <button
                      type="button"
                      className={s.accept}
                      onClick={accept}
                      disabled={!canAccept}
                    >
                      {c.buttonAccept}
                    </button>
                    <button type="button" className={s.decline} onClick={decline}>
                      {c.buttonDecline}
                    </button>
                  </div>

                  {!canAccept && <p className={s.hint}>{c.requiredHint}</p>}

                  <div className={s.meta}>
                    <span>
                      {c.versionLabel}: {LEGAL_VERSION} · {EFFECTIVE_DATE[locale]}
                    </span>
                    <span>{c.declineHint}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ConsentGate;
