import { NextResponse } from 'next/server';
import { verifyJwt, type Claims } from './auth/jwt';

// ============================================================
// izhubs ERP — RBAC Engine
// SOURCE OF TRUTH for all permission checks.
// To add permissions: add to Permission type AND ROLE_PERMISSIONS.
// Never bypass this — always use hasPermission() or requirePermission().
// ============================================================

export type Permission =
  | 'contacts:read'
  | 'contacts:write'
  | 'contacts:delete'
  | 'deals:read'
  | 'deals:write'
  | 'deals:delete'
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'settings:manage';

export type Role = 'superadmin' | 'admin' | 'member' | 'viewer';

// ---- Permission Matrix ----
// Explicitly declare what each role can do.
// This is the ONLY place permissions are defined.
export const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  superadmin: new Set([
    'contacts:read', 'contacts:write', 'contacts:delete',
    'deals:read', 'deals:write', 'deals:delete',
    'users:read', 'users:write', 'users:delete',
    'settings:manage',
  ]),
  admin: new Set([
    'contacts:read', 'contacts:write', 'contacts:delete',
    'deals:read', 'deals:write', 'deals:delete',
    'users:read', 'users:write',
    'settings:manage',
  ]),
  member: new Set([
    'contacts:read', 'contacts:write',
    'deals:read', 'deals:write',
  ]),
  viewer: new Set([
    'contacts:read',
    'deals:read',
  ]),
};

/**
 * Check if a role has a specific permission.
 * Pure function — safe to use anywhere.
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const normalized = role as Role;
  const permissions = ROLE_PERMISSIONS[normalized];
  if (!permissions) return false;
  return permissions.has(permission);
}

/**
 * Extract the JWT claims from a request's Authorization header OR cookie.
 * Supports both:
 *   - Browser FE: reads hz_access cookie (set by login endpoint)
 *   - API clients: reads Authorization: Bearer <token> header
 * Returns null if missing or invalid.
 */
export async function getAuthClaims(req: Request): Promise<Claims | null> {
  // 1. Try Authorization header (API clients, MCP tools)
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const claims = await verifyJwt(token);
      if (claims.type !== 'access') return null;
      return claims;
    } catch {
      return null;
    }
  }

  // 2. Fallback: try hz_access cookie (browser FE sessions)
  const cookieHeader = req.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/(?:^|;\s*)hz_access=([^;]+)/);
  if (match) {
    try {
      const claims = await verifyJwt(decodeURIComponent(match[1]));
      if (claims.type !== 'access') return null;
      return claims;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Route guard Higher-Order Function.
 * Wraps a Next.js route handler with a permission check.
 *
 * Usage:
 *   export const GET = withPermission('contacts:read', async (req, claims, ctx) => { ... })
 */
type RouteHandler = (
  req: Request,
  claims: Claims,
  ctx?: { params: Record<string, string> }
) => Promise<NextResponse>;

export function withPermission(
  permission: Permission,
  handler: RouteHandler
) {
  return async (req: Request, ctx?: { params: Record<string, string> }) => {
    const claims = await getAuthClaims(req);

    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(claims.role, permission)) {
      return NextResponse.json(
        { error: 'Forbidden', required: permission },
        { status: 403 }
      );
    }

    return handler(req, claims, ctx);
  };
}
