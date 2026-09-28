import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { loadApiConfig } from '../src/config/env.js';
import { createTestDb } from './helpers/test-db.js';
import type { DbClient } from '../src/db/client.js';

describe('Authentication API & Middleware Integration', () => {
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

  describe('POST /auth/register', () => {
    it('registers a new user successfully and sets session cookie', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'newuser@dadliesttjokes.com',
          password: 'ValidPassword123!',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.user.id).toBeDefined();
      expect(body.data.user.email).toBe('newuser@dadliesttjokes.com');
      expect(body.data.user.role).toBe('creator');
      expect(body.data.token).toBeDefined();
      expect(body.data.expiresAt).toBeDefined();

      // Verify cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies).toContain('session_token=');
      expect(cookies).toContain('HttpOnly');
    });

    it('rejects registration with duplicate email with 409 conflict', async () => {
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'duplicate@dadliesttjokes.com',
          password: 'ValidPassword123!',
        },
      });

      const second = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'duplicate@dadliesttjokes.com',
          password: 'AnotherPassword456!',
        },
      });

      expect(second.statusCode).toBe(409);
      const body = JSON.parse(second.payload);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('EMAIL_EXISTS');
    });

    it('rejects weak password with 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'user@dadliesttjokes.com',
          password: 'short',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid email format with 400', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'not-an-email',
          password: 'ValidPassword123!',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'existing@dadliesttjokes.com',
          password: 'ValidPassword123!',
        },
      });
    });

    it('logs in successfully with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'existing@dadliesttjokes.com',
          password: 'ValidPassword123!',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe('existing@dadliesttjokes.com');
      expect(body.data.token).toBeDefined();

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies).toContain('session_token=');
    });

    it('rejects login with incorrect password with 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'existing@dadliesttjokes.com',
          password: 'WrongPassword999!',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_CREDENTIALS');
      expect(body.error.message).toBe('Invalid email or password.');
    });

    it('rejects login for unknown email with generic 401 (no enumeration leak)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'unknown@dadliesttjokes.com',
          password: 'SomePassword123!',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_CREDENTIALS');
      expect(body.error.message).toBe('Invalid email or password.');
    });
  });

  describe('GET /auth/me & Protected Route Authorization', () => {
    let token: string;

    beforeEach(async () => {
      const regResponse = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'me-test@dadliesttjokes.com',
          password: 'ValidPassword123!',
        },
      });
      const body = JSON.parse(regResponse.payload);
      token = body.data.token;
    });

    it('returns current user via Authorization Bearer token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe('me-test@dadliesttjokes.com');
      expect(body.data.user.role).toBe('creator');
    });

    it('returns current user via session_token cookie', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        cookies: {
          session_token: token,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe('me-test@dadliesttjokes.com');
    });

    it('rejects unauthenticated request with 401', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects invalid or tampered session token with 401', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          authorization: 'Bearer invalid-tampered-token-123',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /auth/logout', () => {
    it('invalidates active session and clears cookie', async () => {
      const reg = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'logout-user@dadliesttjokes.com',
          password: 'ValidPassword123!',
        },
      });
      const token = JSON.parse(reg.payload).data.token;

      // Ensure /auth/me works before logout
      const beforeLogout = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: `Bearer ${token}` },
      });
      expect(beforeLogout.statusCode).toBe(200);

      // Perform logout
      const logoutResponse = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        headers: { authorization: `Bearer ${token}` },
      });

      expect(logoutResponse.statusCode).toBe(200);
      const clearCookie = logoutResponse.headers['set-cookie'];
      expect(clearCookie).toBeDefined();

      // Subsequent /auth/me with revoked token must fail with 401
      const afterLogout = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: `Bearer ${token}` },
      });

      expect(afterLogout.statusCode).toBe(401);
    });
  });
});
