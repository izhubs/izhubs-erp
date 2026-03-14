import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Hash a password using scrypt
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  if (!hash || !hash.includes(':')) return false;
  
  const [salt, key] = hash.split(':');
  
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKeyBuffer = scryptSync(password, salt, 64);
    
    // Use timingSafeEqual to prevent timing attacks
    if (keyBuffer.length !== derivedKeyBuffer.length) return false;
    return timingSafeEqual(keyBuffer, derivedKeyBuffer);
  } catch (error) {
    return false;
  }
}
