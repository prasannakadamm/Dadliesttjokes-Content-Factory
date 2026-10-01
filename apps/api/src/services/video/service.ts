import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import type { AppDatabase } from '../../db/client.js';
import { videoJobs, videoClips } from '../../db/schema/jobs.js';
import { OpenShortsProvider } from './openshorts.js';
import { VideoProcessorProvider, VideoProcessorError } from './provider.js';

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
    const [job] = await this.db.insert(videoJobs).values({
      userId,
      sourceUrl,
      status: 'queued',
      webhookSecret,
    }).returning();

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
      await this.db.update(videoJobs)
        .set({
          providerJobId: result.providerJobId,
          updatedAt: new Date(),
        })
        .where(eq(videoJobs.id, job.id));

      return job.id;
    } catch (error) {
      // Mark as failed if submission fails
      await this.db.update(videoJobs)
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

    const clips = await this.db
      .select()
      .from(videoClips)
      .where(eq(videoClips.jobId, jobId));

    return { job, clips };
  }

  async syncJobStatus(jobId: string, userId: string) {
    const [job] = await this.db
      .select()
      .from(videoJobs)
      .where(and(eq(videoJobs.id, jobId), eq(videoJobs.userId, userId)));

    if (!job) {
      throw new Error('Job not found');
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

  private async updateJobFromProviderStatus(jobId: string, statusResult: any) {
    const now = new Date();
    const updateData: any = {
      status: statusResult.status,
      updatedAt: now,
    };

    if (statusResult.status === 'processing') {
      updateData.startedAt = now;
    } else if (statusResult.status === 'completed' || statusResult.status === 'failed' || statusResult.status === 'canceled') {
      updateData.completedAt = now;
      if (statusResult.error) {
        updateData.errorDetails = statusResult.error;
      }
    }

    await this.db.transaction(async (tx: any) => {
      await tx.update(videoJobs)
        .set(updateData)
        .where(eq(videoJobs.id, jobId));

      if (statusResult.status === 'completed' && statusResult.clips && statusResult.clips.length > 0) {
        for (const clip of statusResult.clips) {
          // Check if clip exists
          const [existing] = await tx
            .select()
            .from(videoClips)
            .where(and(
              eq(videoClips.jobId, jobId),
              eq(videoClips.providerClipId, clip.providerClipId)
            ));

          if (!existing) {
            await tx.insert(videoClips).values({
              jobId,
              providerClipId: clip.providerClipId,
              title: clip.title,
              durationSeconds: clip.durationSeconds,
              videoUrl: clip.videoUrl,
              thumbnailUrl: clip.thumbnailUrl,
            });
          }
        }
      }
    });
  }

  async handleWebhook(payload: any, signature: string | undefined): Promise<void> {
    const providerJobId = payload.job_id || payload.id;
    
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

    // Verify signature if provided by provider
    if (job.webhookSecret && signature) {
      // signature check implementation would go here
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
