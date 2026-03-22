import { NextResponse } from 'next/server';
import { verifyJwt, type Claims } from './auth/jwt';
import { withRequestContext } from './request-context';

export type { Claims };

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
  | 'contracts:read'
  | 'contracts:write'
  | 'contracts:delete'
  | 'campaigns:read'
  | 'campaigns:write'
  | 'campaigns:delete'
  | 'activities:read'
  | 'activities:write'
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
    'contracts:read', 'contracts:write', 'contracts:delete',
    'campaigns:read', 'campaigns:write', 'campaigns:delete',
    'activities:read', 'activities:write',
    'users:read', 'users:write', 'users:delete',
    'settings:manage',
  ]),
  admin: new Set([
    'contacts:read', 'contacts:write', 'contacts:delete',
    'deals:read', 'deals:write', 'deals:delete',
    'contracts:read', 'contracts:write', 'contracts:delete',
    'campaigns:read', 'campaigns:write', 'campaigns:delete',
    'activities:read', 'activities:write',
    'users:read', 'users:write',
    'settings:manage',
  ]),
  member: new Set([
    'contacts:read', 'contacts:write',
    'deals:read', 'deals:write',
    'contracts:read',
    'campaigns:read', 'campaigns:write',
    'activities:read', 'activities:write',
  ]),
  viewer: new Set([
    'contacts:read',
    'deals:read',
    'contracts:read',
    'campaigns:read',
    'activities:read',
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
      if (claims.type === 'access') return claims;
      // Wrong token type — fall through to cookie
    } catch {
      // Token expired or invalid — fall through to cookie check below.
      // Do NOT return null here; the cookie may still be valid.
    }
  }

  // 2. Fallback: try hz_access cookie (browser FE sessions)
  // Browser sends this automatically on same-origin requests after login.
  const cookieHeader = req.headers.get('cookie') ?? '';
  const match = cookieHeader.match(/(?:^|;\s*)hz_access=([^;]+)/);
  if (match) {
    try {
      const claims = await verifyJwt(decodeURIComponent(match[1]));
      if (claims.type === 'access') return claims;
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

    // Propagate userId + tenantId through the async call tree via AsyncLocalStorage
    // so engine functions can read them without parameter passing.
    const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';
    return withRequestContext(
      { userId: claims.sub, tenantId: claims.tenantId ?? DEFAULT_TENANT },
      () => handler(req, claims, ctx)
    );
  };
}

/**
 * Route guard HOF that enforces BOTH:
 * 1. RBAC permission check (same as withPermission)
 * 2. Module activation check — blocks 403 if the module is not active for this tenant
 *
 * Use this on ALL routes that belong to a specific module.
 * This ensures hacker cannot bypass by calling /api/premium/xyz directly.
 *
 * Usage:
 *   export const GET = withModule('invoices', 'contacts:read', async (req, claims, ctx) => { ... })
 */
export function withModule(
  moduleId: string,
  permission: Permission,
  handler: RouteHandler
) {
  return async (req: Request, ctx?: { params: Record<string, string> }) => {
    // Step 1: Auth check
    const claims = await getAuthClaims(req);
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: RBAC permission check
    if (!hasPermission(claims.role, permission)) {
      return NextResponse.json(
        { error: 'Forbidden', required: permission },
        { status: 403 }
      );
    }

    // Step 3: Module activation check (uses 60s cached result)
    // Import lazily to avoid circular dependency at module load time
    const { isModuleActive } = await import('./modules');
    const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
    const tenantId = claims.tenantId ?? DEFAULT_TENANT_ID;
    const active = await isModuleActive(tenantId, moduleId);

    if (!active) {
      return NextResponse.json(
        {
          error: 'Module not active',
          code: 'MODULE_NOT_ACTIVE',
          module: moduleId,
          message: `The '${moduleId}' module is not installed. Go to Settings → Modules to activate it.`,
        },
        { status: 403 }
      );
    }

    return handler(req, claims, ctx);
  };
}
