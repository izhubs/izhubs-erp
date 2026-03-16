/**
 * apiFetch — thin wrapper around fetch that auto-attaches the access token.
 *
 * The access token is stored in:
 *   1. localStorage 'hz_access' (set by login page after successful login)
 *   2. Cookie 'hz_access' (set by login API since commit dd9a714 — browser sends automatically)
 *
 * We check localStorage first, then fall back to the cookie value.
 * The cookie alone is sufficient (browser sends it automatically with same-origin requests),
 * but setting the Authorization header explicitly is belt-and-suspenders for API clients.
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  // 1. localStorage (set by login page)
  const local = localStorage.getItem('hz_access');
  if (local) return local;
  // 2. Cookie fallback (set by login API)
  const match = document.cookie.match(/(?:^|;\s*)hz_access=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

