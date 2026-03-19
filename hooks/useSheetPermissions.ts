'use client';

/**
 * useSheetPermissions — shared hook for all sheet views.
 *
 * Reads the user's role from the JWT cookie (hz_access) and returns
 * create/update/delete permission flags. No props needed on each page.
 *
 * Role matrix:
 *   admin   → canCreate, canUpdate, canDelete
 *   member  → canCreate, canUpdate
 *   viewer  → read-only (no create / update / delete)
 */

import { useMemo } from 'react';

export interface SheetPermissions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

function readRoleFromCookie(): string {
  if (typeof document === 'undefined') return 'member';
  try {
    const token = document.cookie
      .split('; ')
      .find(r => r.startsWith('hz_access='))
      ?.split('=')[1];
    if (!token) return 'member';    // no cookie = demo/dev → allow create
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? 'member';
  } catch {
    return 'member';                // parse error → allow create
  }
}

export function useSheetPermissions(): SheetPermissions {
  return useMemo(() => {
    const role = readRoleFromCookie();
    return {
      canCreate: role === 'admin' || role === 'member',
      canUpdate:  role === 'admin' || role === 'member',
      canDelete: role === 'admin',
    };
  }, []);
}
