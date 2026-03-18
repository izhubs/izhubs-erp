// Mock next/server BEFORE any imports that use it
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body,
    }),
  },
  NextRequest: class {},
}));

// Mock jose (used by jwt.ts)
jest.mock('jose', () => ({
  SignJWT: jest.fn(),
  jwtVerify: jest.fn(),
}));

// Now import what we actually want to test
import { hasPermission } from '@/core/engine/rbac';
import type { Permission } from '@/core/engine/rbac';

// =============================================================
// Unit Tests — RBAC Permission Matrix (Phase 2.3)
// Tests hasPermission() — pure function, no DB.
// =============================================================

describe('RBAC — hasPermission()', () => {
  describe('superadmin', () => {
    const role = 'superadmin';
    it('can read contacts', () => expect(hasPermission(role, 'contacts:read')).toBe(true));
    it('can write contacts', () => expect(hasPermission(role, 'contacts:write')).toBe(true));
    it('can delete contacts', () => expect(hasPermission(role, 'contacts:delete')).toBe(true));
    it('can read deals', () => expect(hasPermission(role, 'deals:read')).toBe(true));
    it('can write deals', () => expect(hasPermission(role, 'deals:write')).toBe(true));
    it('can delete deals', () => expect(hasPermission(role, 'deals:delete')).toBe(true));
    it('can delete users', () => expect(hasPermission(role, 'users:delete')).toBe(true));
    it('can manage settings', () => expect(hasPermission(role, 'settings:manage')).toBe(true));
  });

  describe('admin', () => {
    const role = 'admin';
    it('can read contacts', () => expect(hasPermission(role, 'contacts:read')).toBe(true));
    it('can write contacts', () => expect(hasPermission(role, 'contacts:write')).toBe(true));
    it('can delete contacts', () => expect(hasPermission(role, 'contacts:delete')).toBe(true));
    it('can read deals', () => expect(hasPermission(role, 'deals:read')).toBe(true));
    it('can write deals', () => expect(hasPermission(role, 'deals:write')).toBe(true));
    it('can manage settings', () => expect(hasPermission(role, 'settings:manage')).toBe(true));
    it('CANNOT delete users', () => expect(hasPermission(role, 'users:delete')).toBe(false));
  });

  describe('member', () => {
    const role = 'member';
    it('can read contacts', () => expect(hasPermission(role, 'contacts:read')).toBe(true));
    it('can write contacts', () => expect(hasPermission(role, 'contacts:write')).toBe(true));
    it('CANNOT delete contacts', () => expect(hasPermission(role, 'contacts:delete')).toBe(false));
    it('can read deals', () => expect(hasPermission(role, 'deals:read')).toBe(true));
    it('can write deals', () => expect(hasPermission(role, 'deals:write')).toBe(true));
    it('CANNOT delete deals', () => expect(hasPermission(role, 'deals:delete')).toBe(false));
    it('CANNOT delete users', () => expect(hasPermission(role, 'users:delete')).toBe(false));
    it('CANNOT manage settings', () => expect(hasPermission(role, 'settings:manage')).toBe(false));
  });

  describe('viewer', () => {
    const role = 'viewer';
    it('can read contacts', () => expect(hasPermission(role, 'contacts:read')).toBe(true));
    it('can read deals', () => expect(hasPermission(role, 'deals:read')).toBe(true));
    it('CANNOT write contacts', () => expect(hasPermission(role, 'contacts:write')).toBe(false));
    it('CANNOT write deals', () => expect(hasPermission(role, 'deals:write')).toBe(false));
    it('CANNOT delete contacts', () => expect(hasPermission(role, 'contacts:delete')).toBe(false));
    it('CANNOT delete deals', () => expect(hasPermission(role, 'deals:delete')).toBe(false));
    it('CANNOT delete users', () => expect(hasPermission(role, 'users:delete')).toBe(false));
    it('CANNOT manage settings', () => expect(hasPermission(role, 'settings:manage')).toBe(false));
  });

  describe('unknown role', () => {
    it('denies all for garbage role', () => {
      expect(hasPermission('hacker', 'contacts:read' as Permission)).toBe(false);
    });
    it('denies write for unknown role', () => {
      expect(hasPermission('guest', 'deals:write' as Permission)).toBe(false);
    });
  });
});
