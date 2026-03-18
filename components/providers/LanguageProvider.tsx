'use client';

// =============================================================
// izhubs ERP — LanguageProvider
// Lightweight client-side i18n. Reads messages/en.json or vi.json.
// Persists locale choice in localStorage('hz_locale').
// Usage: const { t, locale, setLocale } = useLanguage();
// =============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Locale = 'en' | 'vi';

// Inline message bundles — avoid a network fetch
import enMessages from '@/messages/en.json';
import viMessages from '@/messages/vi.json';

type Messages = typeof enMessages;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Dot-notation key lookup. e.g. t('nav.dashboard') */
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const parts = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return key;
    current = current[part];
  }
  return typeof current === 'string' ? current : key;
}

const BUNDLES: Record<Locale, Messages> = { en: enMessages, vi: viMessages };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hz_locale') as Locale | null;
    if (saved === 'en' || saved === 'vi') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('hz_locale', l);
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    const messages = BUNDLES[locale] as unknown as Record<string, unknown>;
    const value = getNestedValue(messages, key);
    // If key not found (returns key itself), try fallback or EN
    if (value === key) {
      if (fallback) return fallback;
      const enVal = getNestedValue(BUNDLES['en'] as unknown as Record<string, unknown>, key);
      return enVal !== key ? enVal : key;
    }
    return value;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
