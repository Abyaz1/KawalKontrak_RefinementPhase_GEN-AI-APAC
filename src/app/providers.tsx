'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/context/AuthContext';

/**
 * Root client-side providers.
 * Wraps all pages with Theme + i18n + Auth context.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
