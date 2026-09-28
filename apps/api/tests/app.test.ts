import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { loadApiConfig } from '../src/config/env.js';

describe('API Foundation - App Error Handling and Configuration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const config = loadApiConfig({
      NODE_ENV: 'test',
      PORT: 4002,
      CORS_ORIGIN: 'http://localhost:3000',
      LOG_LEVEL: 'silent',
    });
    app = buildApp({ config });

    // Register a test route that throws an internal error
    app.get('/test-error', async () => {
      throw new Error('Simulated internal failure');
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('handles unexpected errors with structured 500 payload', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-error',
    });

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(body.error.message).toBeDefined();
  });

  it('includes proper CORS headers for configured origin', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/health',
      headers: {
        origin: 'http://localhost:3000',
        'access-control-request-method': 'GET',
      },
    });

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });
});
