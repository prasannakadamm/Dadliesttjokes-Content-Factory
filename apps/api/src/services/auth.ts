import crypto from 'node:crypto';
import { eq, and, gt } from 'drizzle-orm';
import type { AppDatabase } from '../db/client.js';
import { users, sessions, type User, type Session } from '../db/schema/index.js';
import type { UserDto, RegisterInput, LoginInput } from '@dadliesttjokes/types';
import { hashPassword, verifyPassword, validatePasswordStrength, dummyVerify } from './password.js';

export class AuthError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = 'AUTH_ERROR', statusCode: number = 400) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function normalizeEmail(email: string): string {
  if (typeof email !== 'string') {
    throw new AuthError('Email must be a valid string.', 'INVALID_INPUT', 400);
  }
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    throw new AuthError('Invalid email address format.', 'INVALID_EMAIL', 400);
  }
  return normalized;
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function createSession(
  db: AppDatabase,
  userId: string,
  ttlHours: number = 168,
): Promise<{ session: Session; rawToken: string; expiresAt: Date }> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      tokenHash,
      expiresAt,
    })
    .returning();

  if (!session) {
    throw new AuthError('Failed to create user session.', 'SESSION_CREATION_FAILED', 500);
  }

  return { session, rawToken, expiresAt };
}

export async function registerUser(
  db: AppDatabase,
  input: RegisterInput,
  ttlHours: number = 168,
): Promise<{ user: UserDto; token: string; expiresAt: Date }> {
  const email = normalizeEmail(input.email);

  const passwordCheck = validatePasswordStrength(input.password);
  if (!passwordCheck.valid) {
    throw new AuthError(passwordCheck.message || 'Weak password.', 'WEAK_PASSWORD', 400);
  }

  // Check for existing user with identical email
  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser) {
    throw new AuthError('An account with this email address already exists.', 'EMAIL_EXISTS', 409);
  }

  const passwordHash = await hashPassword(input.password);

  const [newUser] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role: 'creator',
    })
    .returning();

  if (!newUser) {
    throw new AuthError('Failed to create account.', 'REGISTRATION_FAILED', 500);
  }

  const { rawToken, expiresAt } = await createSession(db, newUser.id, ttlHours);

  return {
    user: toUserDto(newUser),
    token: rawToken,
    expiresAt,
  };
}

export async function loginUser(
  db: AppDatabase,
  input: LoginInput,
  ttlHours: number = 168,
): Promise<{ user: UserDto; token: string; expiresAt: Date }> {
  const email = normalizeEmail(input.email);

  if (!input.password) {
    throw new AuthError('Password is required.', 'INVALID_CREDENTIALS', 401);
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    // Run dummy verify to avoid timing attack enumeration
    await dummyVerify();
    throw new AuthError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
  }

  const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
  }

  const { rawToken, expiresAt } = await createSession(db, user.id, ttlHours);

  return {
    user: toUserDto(user),
    token: rawToken,
    expiresAt,
  };
}

export async function authenticateSessionToken(
  db: AppDatabase,
  rawToken: string,
): Promise<{ user: UserDto; session: Session } | null> {
  if (!rawToken || typeof rawToken !== 'string') {
    return null;
  }

  const tokenHash = hashSessionToken(rawToken);
  const now = new Date();

  // Query valid, non-expired session
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  if (!session) {
    return null;
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

  if (!user) {
    return null;
  }

  return {
    user: toUserDto(user),
    session,
  };
}

export async function invalidateSession(db: AppDatabase, rawToken: string): Promise<boolean> {
  if (!rawToken || typeof rawToken !== 'string') {
    return false;
  }

  const tokenHash = hashSessionToken(rawToken);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  return true;
}
