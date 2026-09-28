import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  dummyVerify,
} from '../src/services/password.js';

describe('Password Security Service', () => {
  it('enforces password policy correctly', () => {
    expect(validatePasswordStrength('short1').valid).toBe(false);
    expect(validatePasswordStrength('alllowercaseletters').valid).toBe(false);
    expect(validatePasswordStrength('1234567890').valid).toBe(false);
    expect(validatePasswordStrength('StrongP@ssw0rd!').valid).toBe(true);
    expect(validatePasswordStrength('validpassword1').valid).toBe(true);
  });

  it('hashes password and ensures hash differs from plaintext', async () => {
    const plaintext = 'SecurePass123!';
    const hash = await hashPassword(plaintext);

    expect(hash).not.toBe(plaintext);
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
  });

  it('verifies correct password against hash', async () => {
    const plaintext = 'SecurePass123!';
    const hash = await hashPassword(plaintext);

    const matches = await verifyPassword(plaintext, hash);
    expect(matches).toBe(true);

    const wrongMatches = await verifyPassword('WrongPassword123!', hash);
    expect(wrongMatches).toBe(false);
  });

  it('rejects verification with empty strings safely', async () => {
    expect(await verifyPassword('', '')).toBe(false);
    expect(await verifyPassword('test', '')).toBe(false);
  });

  it('provides dummy verify for timing-attack mitigation', async () => {
    const result = await dummyVerify();
    expect(result).toBe(false);
  });
});
