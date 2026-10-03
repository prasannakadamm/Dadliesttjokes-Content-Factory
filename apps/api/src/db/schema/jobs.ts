import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  pgEnum,
  integer,
  unique,
} from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const jobStatusEnum = pgEnum('job_status', [
  'queued',
  'processing',
  'completed',
  'failed',
  'canceled',
]);

export const videoJobs = pgTable('video_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 64 }).notNull().default('openshorts'),
  providerJobId: varchar('provider_job_id', { length: 128 }).unique(),
  sourceUrl: text('source_url').notNull(),
  status: jobStatusEnum('status').notNull().default('queued'),
  errorDetails: text('error_details'),
  webhookSecret: varchar('webhook_secret', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const videoClips = pgTable(
  'video_clips',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id')
      .notNull()
      .references(() => videoJobs.id, { onDelete: 'cascade' }),
    providerClipId: varchar('provider_clip_id', { length: 128 }).notNull(),
    title: text('title'),
    durationSeconds: integer('duration_seconds'),
    videoUrl: text('video_url'),
    thumbnailUrl: text('thumbnail_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    unq: unique().on(t.jobId, t.providerClipId),
  }),
);
