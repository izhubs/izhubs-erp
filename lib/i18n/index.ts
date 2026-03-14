import { getRequestConfig } from 'next-intl/server';

// Supported locales — add more here as translations are contributed
export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate locale
  const locale = (await requestLocale) as Locale;
  const validLocale = locales.includes(locale) ? locale : defaultLocale;

  // Load requested locale messages
  const messages = (await import(`../../messages/${validLocale}.json`)).default as Record<string, unknown>;

  // Fallback: if not English, deep-merge with English so no key is ever missing
  // Any key not translated will transparently show in English instead of blank
  let finalMessages = messages;
  if (validLocale !== defaultLocale) {
    const enMessages = (await import(`../../messages/en.json`)).default as Record<string, unknown>;
    finalMessages = deepMerge(enMessages, messages);
  }

  return {
    locale: validLocale,
    messages: finalMessages,
    timeZone: 'Asia/Ho_Chi_Minh',
  };
});

// Deep merge: base = English, override = target locale
// Missing keys in target locale silently fall back to English
function deepMerge(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const val = override[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      result[key] = deepMerge(
        (base[key] as Record<string, unknown>) ?? {},
        val as Record<string, unknown>
      );
    } else {
      result[key] = val;
    }
  }
  return result;
}
