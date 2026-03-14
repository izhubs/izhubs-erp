import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// Get secrets from env or use fallback for dev
const getSecret = () => new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-jwt-secret-do-not-use-in-production-123456789'
);

export interface Claims extends JWTPayload {
  sub: string; // User ID
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

/**
 * Sign a new JWT
 */
export async function signJwt(payload: Claims, expiresIn: string | number): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

/**
 * Verify a JWT
 */
export async function verifyJwt(token: string): Promise<Claims> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as Claims;
}
