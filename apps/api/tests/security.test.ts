import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestDb } from './helpers/test-db.js';
import { buildApp } from '../src/app.js';
import { loadApiConfig } from '../src/config/env.js';
import type { DbClient } from '../src/db/client.js';
import { sessions } from '../src/db/schema/index.js';
import crypto from 'node:crypto';

describe('Security Audit Tests', () => {
  let app: FastifyInstance;
  let testDb: DbClient;

  beforeEach(async () => {
    testDb = createTestDb();
    const config = loadApiConfig({
      NODE_ENV: 'test',
      PORT: 4005,
      LOG_LEVEL: 'silent',
    });
    app = buildApp({ config, dbClient: testDb });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('never exposes password or passwordHash in registration responses', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'security.user@example.com',
        password: 'SuperSecretPassword123!',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    const rawBodyStr = res.payload;

    expect(rawBodyStr).not.toContain('SuperSecretPassword123!');
    expect(rawBodyStr).not.toContain('passwordHash');
    expect(body.data.user.passwordHash).toBeUndefined();
    expect(body.data.user.password).toBeUndefined();
  });

  it('never exposes password or passwordHash in login responses', async () => {
    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'security.login@example.com',
        password: 'SuperSecretPassword123!',
      },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'security.login@example.com',
        password: 'SuperSecretPassword123!',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    const rawBodyStr = res.payload;

    expect(rawBodyStr).not.toContain('SuperSecretPassword123!');
    expect(rawBodyStr).not.toContain('passwordHash');
    expect(body.data.user.passwordHash).toBeUndefined();
  });

  it('never exposes password or passwordHash in /auth/me responses', async () => {
    const regRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'security.me@example.com',
        password: 'SuperSecretPassword123!',
      },
    });

    const token = regRes.json().data.token;

    const meRes = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(meRes.statusCode).toBe(200);
    const body = meRes.json();
    const rawBodyStr = meRes.payload;

    expect(rawBodyStr).not.toContain('SuperSecretPassword123!');
    expect(rawBodyStr).not.toContain('passwordHash');
    expect(body.data.user.passwordHash).toBeUndefined();
  });

  it('stores session tokens as SHA-256 hashes, never plaintext', async () => {
    const regRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'security.token@example.com',
        password: 'SuperSecretPassword123!',
      },
    });

    const rawToken = regRes.json().data.token;
    expect(typeof rawToken).toBe('string');
    expect(rawToken.length).toBe(64); // 32 bytes hex

    const db = testDb.db;
    const sessionRecords = await db.select().from(sessions);
    expect(sessionRecords.length).toBeGreaterThan(0);

    // Verify plaintext token does not match any tokenHash in DB
    const matchingPlaintext = sessionRecords.find((s) => s.tokenHash === rawToken);
    expect(matchingPlaintext).toBeUndefined();

    // Verify the SHA-256 hash of the token matches the stored tokenHash
    const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const matchingHash = sessionRecords.find((s) => s.tokenHash === expectedHash);
    expect(matchingHash).toBeDefined();
  });

  it('mitigates account enumeration with uniform error messages and codes', async () => {
    await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'existing.account@example.com',
        password: 'SuperSecretPassword123!',
      },
    });

    // 1. Existing account with wrong password
    const wrongPasswordRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'existing.account@example.com',
        password: 'WrongPassword999!',
      },
    });

    // 2. Non-existent account
    const nonExistentRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'does.not.exist@example.com',
        password: 'WrongPassword999!',
      },
    });

    expect(wrongPasswordRes.statusCode).toBe(401);
    expect(nonExistentRes.statusCode).toBe(401);

    const body1 = wrongPasswordRes.json();
    const body2 = nonExistentRes.json();

    expect(body1.error.code).toBe(body2.error.code);
    expect(body1.error.message).toBe(body2.error.message);
    expect(body1.error.message).toBe('Invalid email or password.');
  });

  it('prevents authentication bypass with forged, truncated or malformed bearer tokens', async () => {
    const attempts = [
      '',
      'Bearer ',
      'Bearer invalid_token_value',
      'Bearer null',
      'Bearer undefined',
      'Bearer 0000000000000000000000000000000000000000000000000000000000000000',
      'Basic dXNlcjpwYXNz',
    ];

    for (const authHeader of attempts) {
      const res = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: authHeader ? { authorization: authHeader } : {},
      });

      expect(res.statusCode).toBe(401);
      expect(res.json().error.code).toBe('UNAUTHORIZED');
    }
  });

  it('prevents authentication bypass via forged or expired cookies', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: {
        cookie: 'session_token=forged_session_token_1234567890',
      },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHORIZED');
  });

  it('maintains Phase 02 CORS security: rejects unauthorized origins with credentials', async () => {
    const res = await app.inject({
      method: 'OPTIONS',
      url: '/auth/me',
      headers: {
        origin: 'https://malicious-site.attacker.com',
        'access-control-request-method': 'GET',
      },
    });

    const allowOrigin = res.headers['access-control-allow-origin'];
    expect(allowOrigin).not.toBe('https://malicious-site.attacker.com');
    expect(allowOrigin).not.toBe('*');
  });
});
