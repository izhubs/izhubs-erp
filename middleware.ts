import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n';
import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/core/engine/auth';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  // Don't prefix URLs with locale for default locale
  localePrefix: 'as-needed',
});

// Paths that require authentication
const protectedPaths = ['/dashboard', '/setup', '/settings'];
// Paths that redirect to dashboard if already authenticated
const authPaths = ['/login', '/register'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Quick check if path requires auth
  const isProtected = protectedPaths.some(p => path.startsWith(p) || path.match(new RegExp(`^/[a-z]{2}${p}`)));
  const isAuthPath = authPaths.some(p => path.startsWith(p) || path.match(new RegExp(`^/[a-z]{2}${p}`)));
  
  const refreshCookie = req.cookies.get('hz_refresh');
  let isAuthenticated = false;
  
  if (refreshCookie?.value) {
    try {
      const decoded = await verifyJwt(refreshCookie.value);
      if (decoded && decoded.type === 'refresh') {
        isAuthenticated = true;
      }
    } catch (e) {
      // Invalid token
      isAuthenticated = false;
    }
  }

  // Handle redirects before intl routing
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Apply i18n middleware
  return intlMiddleware(req);
}

export const config = {
  // Match all routes except static files and API routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
