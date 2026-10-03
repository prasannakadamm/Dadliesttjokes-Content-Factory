import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import type { AppDatabase } from '../../db/client.js';
import { videoJobs, videoClips } from '../../db/schema/jobs.js';
import { OpenShortsProvider } from './openshorts.js';
import { VideoProcessorProvider, VideoProcessorError, JobStatusResult } from './provider.js';

export class VideoProcessingService {
  private readonly provider: VideoProcessorProvider;

  constructor(
    private readonly db: AppDatabase,
    apiKey?: string,
    apiUrl?: string,
    private readonly webhookUrl?: string,
    private readonly globalWebhookSecret?: string,
  ) {
    this.provider = new OpenShortsProvider(apiKey, apiUrl);
  }

  async createJob(userId: string, sourceUrl: string): Promise<string> {
    const webhookSecret = this.globalWebhookSecret || crypto.randomBytes(32).toString('hex');

    // 1. Create job in DB
    const [job] = await this.db
      .insert(videoJobs)
      .values({
        userId,
        sourceUrl,
        status: 'queued',
        webhookSecret,
      })
      .returning();

    if (!job) {
      throw new Error('Failed to create job record in database');
    }

    // 2. Submit to provider
    try {
      const result = await this.provider.submitJob({
        sourceUrl,
        webhookUrl: this.webhookUrl,
        webhookSecret: webhookSecret,
      });

      // 3. Update job with provider ID
      await this.db
        .update(videoJobs)
        .set({
          providerJobId: result.providerJobId,
          updatedAt: new Date(),
        })
        .where(eq(videoJobs.id, job.id));

      return job.id;
    } catch (error) {
      // Mark as failed if submission fails
      await this.db
        .update(videoJobs)
        .set({
          status: 'failed',
          errorDetails: error instanceof Error ? error.message : String(error),
          updatedAt: new Date(),
        })
        .where(eq(videoJobs.id, job.id));

      throw error;
    }
  }

  async getJob(jobId: string, userId: string) {
    const [job] = await this.db
      .select()
      .from(videoJobs)
      .where(and(eq(videoJobs.id, jobId), eq(videoJobs.userId, userId)));

    if (!job) {
      return null;
    }

    const clips = await this.db.select().from(videoClips).where(eq(videoClips.jobId, jobId));

    return { job, clips };
  }

  async syncJobStatus(jobId: string, userId: string) {
    const [job] = await this.db
      .select()
      .from(videoJobs)
      .where(and(eq(videoJobs.id, jobId), eq(videoJobs.userId, userId)));

    if (!job) {
      return null;
    }

    if (!job.providerJobId) {
      throw new Error('Job has no provider ID');
    }

    if (job.status === 'completed' || job.status === 'failed' || job.status === 'canceled') {
      return this.getJob(jobId, userId);
    }

    try {
      const statusResult = await this.provider.getJobStatus(job.providerJobId);

      await this.updateJobFromProviderStatus(job.id, statusResult);
    } catch (error) {
      if (error instanceof VideoProcessorError) {
        // Log it, but maybe don't fail the job immediately just because status check failed once
        console.error(`Failed to sync job ${jobId}:`, error.message);
      } else {
        throw error;
      }
    }

    return this.getJob(jobId, userId);
  }

  private async updateJobFromProviderStatus(jobId: string, statusResult: JobStatusResult) {
    const [job] = await this.db.select().from(videoJobs).where(eq(videoJobs.id, jobId));
    if (!job) return;

    // Enforce valid state transitions
    const validTransitions: Record<string, string[]> = {
      queued: ['processing', 'completed', 'failed', 'canceled'],
      processing: ['completed', 'failed', 'canceled'],
      completed: [],
      failed: [],
      canceled: [],
    };

    if (
      job.status !== statusResult.status &&
      !validTransitions[job.status]?.includes(statusResult.status)
    ) {
      // Invalid transition, ignore to enforce centralized policy
      return;
    }

    const now = new Date();
    const updateData: Partial<typeof videoJobs.$inferInsert> = {
      status: statusResult.status as 'queued' | 'processing' | 'completed' | 'failed' | 'canceled',
      updatedAt: now,
    };

    if (job.status !== statusResult.status) {
      if (statusResult.status === 'processing') {
        updateData.startedAt = now;
      } else if (
        statusResult.status === 'completed' ||
        statusResult.status === 'failed' ||
        statusResult.status === 'canceled'
      ) {
        updateData.completedAt = now;
        if (statusResult.error) {
          updateData.errorDetails = statusResult.error;
        }
      }
    }

    await this.db.transaction(async (tx) => {
      // Only update if data changed
      if (Object.keys(updateData).length > 2 || updateData.status !== job.status) {
        await tx.update(videoJobs).set(updateData).where(eq(videoJobs.id, jobId));
      }

      if (
        statusResult.status === 'completed' &&
        statusResult.clips &&
        statusResult.clips.length > 0
      ) {
        for (const clip of statusResult.clips) {
          await tx
            .insert(videoClips)
            .values({
              jobId,
              providerClipId: clip.providerClipId,
              title: clip.title,
              durationSeconds: clip.durationSeconds,
              videoUrl: clip.videoUrl,
              thumbnailUrl: clip.thumbnailUrl,
            })
            .onConflictDoNothing({ target: [videoClips.jobId, videoClips.providerClipId] });
        }
      }
    });
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    signature?: string,
    rawBody?: string,
  ): Promise<void> {
    const providerJobId = (payload.job_id || payload.id) as string | undefined;

    if (!providerJobId) {
      throw new Error('Invalid webhook payload: missing job identifier');
    }

    const [job] = await this.db
      .select()
      .from(videoJobs)
      .where(eq(videoJobs.providerJobId, providerJobId));

    if (!job) {
      throw new Error(`Job with provider ID ${providerJobId} not found`);
    }

    // Verify secret if provided by provider
    if (job.webhookSecret) {
      if (!signature) {
        throw new Error('Webhook authentication failed: missing signature header');
      }

      const bodyToHash = rawBody || JSON.stringify(payload);
      const hmacHex = crypto
        .createHmac('sha256', job.webhookSecret)
        .update(bodyToHash)
        .digest('hex');
      const expectedSignature = `sha256=${hmacHex}`;

      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const providedBuffer = Buffer.from(signature, 'utf8');

      if (
        expectedBuffer.length !== providedBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
      ) {
        throw new Error('Webhook authentication failed: invalid signature');
      }
    }

    try {
      const statusResult = await this.provider.getJobStatus(providerJobId);
      await this.updateJobFromProviderStatus(job.id, statusResult);
    } catch (error) {
      console.error(`Webhook reconciliation failed for job ${job.id}:`, error);
      throw error;
    }
  }
}
