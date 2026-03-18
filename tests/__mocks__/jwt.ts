// Mock for core/engine/auth/jwt — used to isolate rbac.ts unit tests.
// rbac.ts imports verifyJwt from jwt.ts for the getAuthClaims() and withPermission() functions,
// but unit tests only test hasPermission() which is a pure function with no jwt dependency.
export const verifyJwt = jest.fn().mockResolvedValue(null);
export const signJwt = jest.fn().mockResolvedValue('mock-token');
export type Claims = {
  sub: string;
  email: string;
  role: string;
  type: string;
  tenantId?: string;
};
