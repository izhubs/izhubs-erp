import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Paths that require an active session
const PROTECTED_PATHS = ['/dashboard', '/contacts', '/deals', '/settings', '/setup', '/reports', '/automation', '/audit-log', '/contracts'];
// Auth paths that redirect away if already logged in
const AUTH_PATHS = ['/login', '/register'];

// Edge-compatible JWT verify — no pg, no Node.js crypto
const getSecret = () => new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-jwt-secret-do-not-use-in-production-123456789'
);

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtected = PROTECTED_PATHS.some(p => path === p || path.startsWith(p + '/'));
  const isAuthPath = AUTH_PATHS.some(p => path === p || path.startsWith(p + '/'));

  // Read refresh token from cookie
  const refreshCookie = req.cookies.get('hz_refresh');
  let isAuthenticated = false;

  if (refreshCookie?.value) {
    try {
      const { payload } = await jwtVerify(refreshCookie.value, getSecret());
      if ((payload as any).type === 'refresh') isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Unauthenticated user hitting protected page → send to login
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged-in user hitting auth page → send to dashboard
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If authenticated, we need to inject user context headers for Server Components
  if (isAuthenticated && refreshCookie?.value) {
    try {
      const { payload } = await jwtVerify(refreshCookie.value, getSecret());
      
      const reqHeaders = new Headers(req.headers);
      reqHeaders.set('x-user-id', (payload as any).sub || '');
      reqHeaders.set('x-user-role', (payload as any).role || 'viewer');
      reqHeaders.set('x-tenant-id', (payload as any).tenantId || '');

      return NextResponse.next({
        request: {
          headers: reqHeaders,
        },
      });
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|\\..*).*)'],
};
