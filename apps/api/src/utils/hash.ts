import crypto from 'crypto';

/**
 * Hashes a plain-text password using Node's PBKDF2 crypto function.
 * Returns the salt and hash in the format: salt:hash
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain-text password against a stored hashed password.
 */
export function verifyPassword(password: string, storedValue: string): boolean {
  const [salt, originalHash] = storedValue.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}
