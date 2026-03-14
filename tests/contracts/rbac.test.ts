// We must mock jose at the top since rbac.ts → jwt.ts → jose (ESM)
jest.mock('jose', () => ({
  SignJWT: class {
    private payload: any;
    constructor(p: any) { this.payload = p; }
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    async sign() { return `mock.jwt.${JSON.stringify(this.payload)}`; }
  },
  jwtVerify: async (token: string) => {
    if (!token.startsWith('mock.jwt.')) throw new Error('Invalid token');
    return { payload: JSON.parse(token.replace('mock.jwt.', '')) };
  },
}));

import { hasPermission, type Permission } from '@/core/engine/rbac';

// ============================================================
// RBAC Contract Tests
// Source-of-truth regression test for the full permission matrix.
// Any change to ROLE_PERMISSIONS MUST be reflected here.
// ============================================================

describe('RBAC Permission Matrix', () => {
  const allPermissions: Permission[] = [
    'contacts:read', 'contacts:write', 'contacts:delete',
    'deals:read', 'deals:write', 'deals:delete',
    'users:read', 'users:write', 'users:delete',
    'settings:manage',
  ];

  describe('superadmin', () => {
    it('should have ALL permissions', () => {
      for (const perm of allPermissions) {
        expect(hasPermission('superadmin', perm)).toBe(true);
      }
    });
  });

  describe('admin', () => {
    it('should have read/write/delete on contacts and deals', () => {
      expect(hasPermission('admin', 'contacts:read')).toBe(true);
      expect(hasPermission('admin', 'contacts:write')).toBe(true);
      expect(hasPermission('admin', 'contacts:delete')).toBe(true);
      expect(hasPermission('admin', 'deals:read')).toBe(true);
      expect(hasPermission('admin', 'deals:write')).toBe(true);
      expect(hasPermission('admin', 'deals:delete')).toBe(true);
    });

    it('should have user read/write but NOT user delete', () => {
      expect(hasPermission('admin', 'users:read')).toBe(true);
      expect(hasPermission('admin', 'users:write')).toBe(true);
      expect(hasPermission('admin', 'users:delete')).toBe(false);
    });

    it('should have settings:manage', () => {
      expect(hasPermission('admin', 'settings:manage')).toBe(true);
    });
  });

  describe('member', () => {
    it('should have read and write on contacts and deals', () => {
      expect(hasPermission('member', 'contacts:read')).toBe(true);
      expect(hasPermission('member', 'contacts:write')).toBe(true);
      expect(hasPermission('member', 'deals:read')).toBe(true);
      expect(hasPermission('member', 'deals:write')).toBe(true);
    });

    it('should NOT be able to delete contacts or deals', () => {
      expect(hasPermission('member', 'contacts:delete')).toBe(false);
      expect(hasPermission('member', 'deals:delete')).toBe(false);
    });

    it('should NOT have user or settings permissions', () => {
      expect(hasPermission('member', 'users:read')).toBe(false);
      expect(hasPermission('member', 'users:write')).toBe(false);
      expect(hasPermission('member', 'users:delete')).toBe(false);
      expect(hasPermission('member', 'settings:manage')).toBe(false);
    });
  });

  describe('viewer', () => {
    it('should ONLY have contacts:read and deals:read', () => {
      expect(hasPermission('viewer', 'contacts:read')).toBe(true);
      expect(hasPermission('viewer', 'deals:read')).toBe(true);
    });

    it('should be denied all write, delete, users, and settings operations', () => {
      expect(hasPermission('viewer', 'contacts:write')).toBe(false);
      expect(hasPermission('viewer', 'contacts:delete')).toBe(false);
      expect(hasPermission('viewer', 'deals:write')).toBe(false);
      expect(hasPermission('viewer', 'deals:delete')).toBe(false);
      expect(hasPermission('viewer', 'users:read')).toBe(false);
      expect(hasPermission('viewer', 'users:write')).toBe(false);
      expect(hasPermission('viewer', 'users:delete')).toBe(false);
      expect(hasPermission('viewer', 'settings:manage')).toBe(false);
    });
  });

  describe('invalid role', () => {
    it('should deny all permissions for an unrecognized role', () => {
      expect(hasPermission('hacker', 'contacts:read')).toBe(false);
      expect(hasPermission('', 'contacts:read')).toBe(false);
    });
  });
});
