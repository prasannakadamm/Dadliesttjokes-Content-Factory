import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { loadApiConfig } from '../src/config/env.js';
import { createTestDb } from './helpers/test-db.js';
import type { DbClient } from '../src/db/client.js';
import { users } from '../src/db/schema/users.js';
import { videoJobs, videoClips } from '../src/db/schema/jobs.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

describe('Video Processing API (Phase 05)', () => {
  let app: FastifyInstance;
  let testDb: DbClient;
  let user1Token: string;

  let user2Token: string;

  beforeAll(async () => {
    testDb = createTestDb();

    // Clear jobs
    await testDb.db.delete(videoClips);
    await testDb.db.delete(videoJobs);
    await testDb.db.delete(users);

    const config = loadApiConfig({
      NODE_ENV: 'test',
      PORT: 4002,
      LOG_LEVEL: 'silent',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/dadliesttjokes_test', // Dummy if bypassed by testDb
      OPENSHORTS_API_KEY: 'test-osk',
      OPENSHORTS_WEBHOOK_SECRET: 'test-webhook-secret',
    });

    app = buildApp({ config, dbClient: testDb });
    await app.ready();

    // Register User 1
    const reg1 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'user1@test.com', password: 'Password1!' },
    });
    // extract id just to ensure payload is valid
    JSON.parse(reg1.payload).data.user.id;
    user1Token = reg1.cookies.find((c) => c.name === 'session_token')?.value || '';

    // Register User 2
    const reg2 = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'user2@test.com', password: 'Password1!' },
    });
    user2Token = reg2.cookies.find((c) => c.name === 'session_token')?.value || '';
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  describe('Authorization and Security', () => {
    it('rejects unauthenticated job submission', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/video/jobs',
        payload: { sourceUrl: 'https://youtube.com/watch' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('sanitizes provider errors and does not expose secrets', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Invalid API key osk_real_key_here'),
      } as Response);

      const res = await app.inject({
        method: 'POST',
        url: '/video/jobs',
        cookies: { session_token: user1Token },
        payload: { sourceUrl: 'https://youtube.com/watch' },
      });

      expect(res.statusCode).toBe(500);
      const body = JSON.parse(res.payload);
      expect(body.error.message).toBe('Video processing is temporarily unavailable.');
      expect(body.error.message).not.toContain('osk_');
    });
  });

  describe('Job Submission and State Machine', () => {
    it('creates a job and transitions to queued', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job_id: 'provider_123' }),
      } as Response);

      const res = await app.inject({
        method: 'POST',
        url: '/video/jobs',
        cookies: { session_token: user1Token },
        payload: { sourceUrl: 'https://youtube.com/watch' },
      });

      expect(res.statusCode).toBe(202);
      const body = JSON.parse(res.payload);
      expect(body.data.status).toBe('queued');
      expect(body.data.jobId).toBeDefined();
    });

    it('rejects cross-user job access', async () => {
      // First user 1 creates a job
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job_id: 'provider_456' }),
      } as Response);
      const createRes = await app.inject({
        method: 'POST',
        url: '/video/jobs',
        cookies: { session_token: user1Token },
        payload: { sourceUrl: 'https://youtube.com/watch' },
      });
      const jobId = JSON.parse(createRes.payload).data.jobId;

      // User 2 tries to read it
      const readRes = await app.inject({
        method: 'GET',
        url: `/video/jobs/${jobId}`,
        cookies: { session_token: user2Token },
      });
      expect(readRes.statusCode).toBe(404);
    });
  });

  describe('Webhook and Idempotency', () => {
    it('authenticates webhook via HMAC SHA256 and updates job', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job_id: 'provider_789' }),
      } as Response);
      const createRes = await app.inject({
        method: 'POST',
        url: '/video/jobs',
        cookies: { session_token: user1Token },
        payload: { sourceUrl: 'https://youtube.com/watch' },
      });
      const jobId = JSON.parse(createRes.payload).data.jobId;

      const [job] = await testDb.db.select().from(videoJobs).where(eq(videoJobs.id, jobId));
      const secret = job!.webhookSecret!;
      const rawBody = '{\n  "job_id": "provider_789"\n}'; // Custom raw body formatting
      const signature = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;

      // Mock getJobStatus response in the service
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'completed',
            result: {
              clips: [{ id: 'clip_1', title: 'Test Clip', video_url: 'https://vid.com' }],
            },
          }),
      } as Response);

      const hookRes = await app.inject({
        method: 'POST',
        url: '/video/webhook',
        headers: { 'x-openshorts-signature': signature, 'content-type': 'application/json' },
        body: rawBody,
      });
      expect(hookRes.statusCode).toBe(200);

      const readRes = await app.inject({
        method: 'GET',
        url: `/video/jobs/${jobId}`,
        cookies: { session_token: user1Token },
      });
      const readBody = JSON.parse(readRes.payload);
      expect(readBody.data.status).toBe('completed');
      expect(readBody.data.clips.length).toBe(1);
    });

    it('rejects invalid webhook signatures', async () => {
      const hookRes = await app.inject({
        method: 'POST',
        url: '/video/webhook',
        headers: {
          'x-openshorts-signature': 'sha256=invalid_signature',
          'content-type': 'application/json',
        },
        payload: { job_id: 'provider_789' },
      });
      expect(hookRes.statusCode).toBe(400);
    });

    it('rejects reformatted body with valid original signature', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job_id: 'provider_999' }),
      } as Response);
      const createRes = await app.inject({
        method: 'POST',
        url: '/video/jobs',
        cookies: { session_token: user1Token },
        payload: { sourceUrl: 'https://youtube.com/watch' },
      });
      const jobId = JSON.parse(createRes.payload).data.jobId;

      const [job] = await testDb.db.select().from(videoJobs).where(eq(videoJobs.id, jobId));
      const secret = job!.webhookSecret!;

      const rawBody = '{"job_id":"provider_999"}';
      const signature = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;

      // Reformat the body to simulate mismatch
      const reformattedBody = '{\n  "job_id": "provider_999"\n}';
      const hookRes = await app.inject({
        method: 'POST',
        url: '/video/webhook',
        headers: { 'x-openshorts-signature': signature, 'content-type': 'application/json' },
        body: reformattedBody, // send the reformatted body with the signature of the non-reformatted body
      });
      expect(hookRes.statusCode).toBe(400);
    });
    it('rejects modified body with valid original signature', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ job_id: 'provider_1010' }),
      } as Response);
      const createRes = await app.inject({
        method: 'POST',
        url: '/video/jobs',
        cookies: { session_token: user1Token },
        payload: { sourceUrl: 'https://youtube.com/watch' },
      });
      const jobId = JSON.parse(createRes.payload).data.jobId;

      const [job] = await testDb.db.select().from(videoJobs).where(eq(videoJobs.id, jobId));
      const secret = job!.webhookSecret!;

      const rawBody = '{"job_id":"provider_1010"}';
      const signature = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;

      // Modify the body to simulate mismatch
      const modifiedBody = '{"job_id":"provider_1010", "hacked":true}';
      const hookRes = await app.inject({
        method: 'POST',
        url: '/video/webhook',
        headers: { 'x-openshorts-signature': signature, 'content-type': 'application/json' },
        body: modifiedBody, // send the modified body with the signature of the non-reformatted body
      });
      expect(hookRes.statusCode).toBe(400);
    });
  });
});
