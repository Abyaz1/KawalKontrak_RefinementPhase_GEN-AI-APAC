'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';

/**
 * Root client-side providers.
 * Wraps all pages with Theme + i18n context.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
