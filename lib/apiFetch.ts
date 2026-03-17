/**
 * apiFetch — thin wrapper around fetch that auto-attaches the access token
 * and automatically refreshes expired tokens.
 *
 * The access token is stored in:
 *   1. localStorage 'hz_access' (set by login page after successful login)
 *   2. Cookie 'hz_access' (set by login API — browser sends automatically)
 *
 * When a request returns 401, apiFetch will attempt to call
 * /api/v1/auth/refresh to get a new access token, then retry the original
 * request once. If refresh also fails, return the 401 response.
 */

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  // 1. localStorage (set by login page)
  const local = localStorage.getItem('hz_access');
  if (local) return local;
  // 2. Cookie fallback (set by login API)
  const match = document.cookie.match(/(?:^|;\s*)hz_access=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include', // sends hz_refresh httpOnly cookie
    });
    if (!res.ok) return false;

    const json = await res.json();
    if (json.data?.accessToken) {
      // Update localStorage so subsequent calls pick it up
      localStorage.setItem('hz_access', json.data.accessToken);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Attempt to refresh the access token. Deduplicates concurrent calls
 * so multiple 401 responses don't trigger multiple refresh requests.
 */
function tryRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise; // piggyback on in-flight refresh
  }
  isRefreshing = true;
  refreshPromise = refreshAccessToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });
  return refreshPromise;
}

function buildHeaders(options: RequestInit): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = buildHeaders(options);

  // credentials: 'include' ensures the httpOnly hz_access cookie is sent
  // automatically on same-origin requests.
  let res = await fetch(url, { ...options, headers, credentials: 'include' });

  // Auto-refresh on 401: try to get a new token and retry once
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      // Rebuild headers with the new token
      const retryHeaders = buildHeaders(options);
      res = await fetch(url, { ...options, headers: retryHeaders, credentials: 'include' });
    }
  }

  return res;
}
