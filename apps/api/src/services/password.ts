import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 10;

// Dummy hash for constant-time comparisons when user is not found (mitigates timing attacks)
const DUMMY_HASH = '$2a$10$wT2m7J2Vb11X7kI589G.Nu4z3e8z9oM1k7g2s4x8k1g7j3v5l8p7e';

export interface PasswordValidationResult {
  valid: boolean;
  message?: string;
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  if (typeof password !== 'string') {
    return { valid: false, message: 'Password must be a string.' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password must not exceed 128 characters.' };
  }

  // Check for at least one letter and at least one digit or special symbol
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigitOrSpecial = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

  if (!hasLetter || !hasDigitOrSpecial) {
    return {
      valid: false,
      message: 'Password must contain at least one letter and one number or special character.',
    };
  }

  return { valid: true };
}

export async function hashPassword(password: string): Promise<string> {
  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid password according to policy.');
  }

  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
}

export async function dummyVerify(): Promise<boolean> {
  await bcrypt.compare('dummy-password', DUMMY_HASH);
  return false;
}
