import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheckIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan',
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-family)',
      background: 'var(--color-bg)',
      color: 'var(--color-dark)',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ marginBottom: '0.75rem', lineHeight: 1, color: 'var(--color-brand)' }}>
        <ShieldCheckIcon size={72} strokeWidth={1.2} />
      </div>
      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: 900,
        letterSpacing: '-0.03em',
        marginBottom: '0.75rem',
        color: 'var(--color-brand)',
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
      }}>
        Halaman Tidak Ditemukan
      </h2>
      <p style={{
        fontSize: '1rem',
        color: 'var(--color-neutral)',
        maxWidth: '420px',
        lineHeight: 1.6,
        marginBottom: '2rem',
      }}>
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        <br />
        <em style={{ fontSize: '0.9rem' }}>
          Sorry, the page you are looking for does not exist.
        </em>
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            background: 'var(--color-brand)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderRadius: '12px',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(31, 58, 147, 0.25)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          ← Kembali ke Beranda
        </Link>
        <Link
          href="/analisis"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            background: 'transparent',
            color: 'var(--color-brand)',
            fontWeight: 600,
            fontSize: '0.95rem',
            borderRadius: '12px',
            textDecoration: 'none',
            border: '2px solid var(--color-brand)',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          Analisis Kontrak →
        </Link>
      </div>
    </div>
  );
}
