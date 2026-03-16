/**
 * apiFetch — thin wrapper around fetch that auto-attaches the access token.
 *
 * The access token is stored in localStorage by the login page as 'hz_access'.
 * All authenticated API calls (POST, PATCH, PUT, DELETE) MUST use this helper,
 * otherwise withPermission() returns 401 and optimistic updates roll back.
 *
 * Usage:
 *   const res = await apiFetch('/api/v1/deals/123', {
 *     method: 'PATCH',
 *     body: JSON.stringify({ stage: 'won' }),
 *   });
 */
export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('hz_access')
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}
