import crypto from 'node:crypto';
import { newDb } from 'pg-mem';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import { applyIntegrationsToPool } from 'drizzle-pgmem';
import type { FastifyInstance } from 'fastify';
import * as schema from '../../src/db/schema/index.js';
import type { DbClient, AppDatabase } from '../../src/db/client.js';
import { buildApp } from '../../src/app.js';
import { loadApiConfig } from '../../src/config/env.js';

export function createTestDb(): DbClient {
  const memDb = newDb();

  // Register gen_random_uuid() function for pg-mem
  memDb.public.registerFunction({
    name: 'gen_random_uuid',
    impure: true,
    implementation: () => crypto.randomUUID(),
  });

  const pgAdapter = memDb.adapters.createPg();
  const pool = new pgAdapter.Pool();

  // Apply drizzle-pgmem integration for rowMode and getTypeParser shims
  applyIntegrationsToPool(pool);

  // Execute Phase 03 initial schema DDL
  memDb.public.none(`
    CREATE TABLE "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "email" varchar(255) NOT NULL UNIQUE,
      "password_hash" text NOT NULL,
      "role" varchar(32) DEFAULT 'creator' NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "sessions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "token_hash" varchar(64) NOT NULL UNIQUE,
      "expires_at" timestamp with time zone NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX "users_email_idx" ON "users" ("email");
    CREATE INDEX "sessions_user_id_idx" ON "sessions" ("user_id");
    CREATE INDEX "sessions_token_hash_idx" ON "sessions" ("token_hash");
    CREATE INDEX "sessions_expires_at_idx" ON "sessions" ("expires_at");

    CREATE TYPE job_status AS ENUM ('queued', 'processing', 'completed', 'failed', 'canceled');

    CREATE TABLE "video_jobs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "provider" varchar(64) DEFAULT 'openshorts' NOT NULL,
      "provider_job_id" varchar(128) UNIQUE,
      "source_url" text NOT NULL,
      "status" job_status DEFAULT 'queued' NOT NULL,
      "error_details" text,
      "webhook_secret" varchar(64),
      "created_at" timestamp with time zone DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now(),
      "started_at" timestamp with time zone,
      "completed_at" timestamp with time zone
    );

    CREATE TABLE "video_clips" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "job_id" uuid NOT NULL REFERENCES "video_jobs"("id") ON DELETE CASCADE,
      "provider_clip_id" varchar(128) NOT NULL,
      "title" text,
      "duration_seconds" integer,
      "video_url" text,
      "thumbnail_url" text,
      "created_at" timestamp with time zone DEFAULT now(),
      UNIQUE("job_id", "provider_clip_id")
    );
  `);

  const db = drizzle(pool as unknown as Pool, { schema }) as AppDatabase;

  return {
    pool: pool as unknown as Pool,
    db,
    close: async () => {
      await pool.end();
    },
    isAlive: async () => true,
  };
}

export async function createTestApp(): Promise<FastifyInstance> {
  const testDb = createTestDb();
  const config = loadApiConfig({
    NODE_ENV: 'test',
    PORT: 4005,
    LOG_LEVEL: 'silent',
  });
  const app = buildApp({ config, dbClient: testDb });
  await app.ready();
  return app;
}
