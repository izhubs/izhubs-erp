// =============================================================
// izhubs ERP — Server Context Helpers
// Server-side only utilities for Server Components and Route Handlers.
// Reads tenant/user identity from request headers set by middleware.
//
// Middleware sets:
//   x-tenant-id: string  (from JWT claim tenantId)
//   x-user-id:   string  (from JWT claim sub)
//   x-user-role: string  (from JWT claim role)
// =============================================================

import { headers } from 'next/headers';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

/**
 * Get the current tenant ID from the request headers.
 * Falls back to the default single-tenant UUID in dev mode.
 * Server Components + Route Handlers only.
 */
export async function getTenantId(): Promise<string> {
  const h = await headers();
  return h.get('x-tenant-id') ?? DEFAULT_TENANT;
}

/**
 * Get the current authenticated user ID from the request headers.
 * Throws if not authenticated (middleware should have blocked unauthenticated routes).
 * Server Components + Route Handlers only.
 */
export async function getCurrentUserId(): Promise<string> {
  const h = await headers();
  const userId = h.get('x-user-id');
  if (!userId) throw new Error('Unauthenticated: x-user-id header missing');
  return userId;
}

/**
 * Get the current user role from the request headers.
 * Returns 'viewer' as the most restrictive fallback.
 */
export async function getCurrentUserRole(): Promise<string> {
  const h = await headers();
  return h.get('x-user-role') ?? 'viewer';
}
