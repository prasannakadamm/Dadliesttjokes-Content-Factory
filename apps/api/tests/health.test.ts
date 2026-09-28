import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { loadApiConfig } from '../src/config/env.js';
import type { HealthCheckResponse } from '@dadliesttjokes/types';

describe('API Foundation - Health Endpoint', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const config = loadApiConfig({
      NODE_ENV: 'test',
      PORT: 4001,
      LOG_LEVEL: 'silent',
    });
    app = buildApp({ config });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 with valid health check payload', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');

    const body = JSON.parse(response.payload) as HealthCheckResponse;
    expect(body.status).toBe('ok');
    expect(body.service).toBe('dadliesttjokes-api');
    expect(body.version).toBe('0.0.1');
    expect(body.environment).toBe('test');
    expect(typeof body.uptimeSeconds).toBe('number');
    expect(new Date(body.timestamp).getTime()).not.toBeNaN();
  });

  it('GET /non-existent-route returns 404 with structured error response', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/non-existent-route',
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('/non-existent-route');
  });
});
