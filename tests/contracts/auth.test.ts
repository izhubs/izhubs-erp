import { hashPassword, verifyPassword, signJwt, verifyJwt } from '@/core/engine/auth';

// Mock jose instead of fighting with ESM in Jest
jest.mock('jose', () => {
  return {
    SignJWT: class {
      private payload: any;
      constructor(payload: any) { this.payload = payload; }
      setProtectedHeader() { return this; }
      setIssuedAt() { return this; }
      setExpirationTime() { return this; }
      async sign() { return `mock.jwt.token.${JSON.stringify(this.payload)}`; }
    },
    jwtVerify: async (token: string, secret: Uint8Array) => {
      if (token === 'invalid.token.string') throw new Error('Invalid token');
      const payloadString = token.split('mock.jwt.token.')[1];
      if (!payloadString) throw new Error('Invalid token format');
      return { payload: JSON.parse(payloadString) };
    }
  };
});

describe('Auth Contracts', () => {
  describe('Password Hashing', () => {
    it('should correctly hash and verify passwords', () => {
      const password = 'mySecretPassword123!';
      const hash = hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).toContain(':'); // Verify salt format
      
      expect(verifyPassword(password, hash)).toBe(true);
      expect(verifyPassword('wrongpassword', hash)).toBe(false);
    });
  });
  
  describe('JWT Signing and Verification', () => {
    it('should correctly sign and verify a jwt', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        type: 'access' as const
      };
      
      const token = await signJwt(payload, '1h');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const verified = await verifyJwt(token);
      
      expect(verified.sub).toBe(payload.sub);
      expect(verified.email).toBe(payload.email);
      expect(verified.role).toBe(payload.role);
      expect(verified.type).toBe(payload.type);
    });
    
    it('should fail with an invalid token', async () => {
      await expect(verifyJwt('invalid.token.string')).rejects.toThrow();
    });
  });
});
