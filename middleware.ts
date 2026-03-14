import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  // Don't prefix URLs with locale for default locale
  // /contacts → English (no prefix)
  // /vi/contacts → Vietnamese
  localePrefix: 'as-needed',
});

export const config = {
  // Match all routes except static files and API routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
