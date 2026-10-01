import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { VideoProcessingService } from '../services/video/service.js';
import type { AppDatabase } from '../db/client.js';

import type { ApiEnv } from '@dadliesttjokes/config';

const submitJobSchema = z.object({
  sourceUrl: z.string().url(),
});

export interface VideoRoutesOptions {
  db: AppDatabase;
  config: ApiEnv;
}

export const videoRoutes: FastifyPluginAsync<VideoRoutesOptions> = async (fastify, opts) => {
  const { db, config } = opts;
  const videoService = new VideoProcessingService(
    db,
    config.OPENSHORTS_API_KEY,
    config.OPENSHORTS_API_URL,
    config.OPENSHORTS_WEBHOOK_URL,
    config.OPENSHORTS_WEBHOOK_SECRET
  );

  fastify.post<{ Body: { sourceUrl: string } }>(
    '/jobs',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } });
      }

      const parseResult = submitJobSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: parseResult.error.issues,
          },
        });
      }

      try {
        const jobId = await videoService.createJob(request.user.id, parseResult.data.sourceUrl);
        return reply.status(202).send({
          success: true,
          data: {
            jobId,
            status: 'queued',
          },
        });
      } catch (error) {
        request.log.error(error, 'Failed to create video job');
        return reply.status(500).send({
          success: false,
          error: {
            code: 'PROVIDER_ERROR',
            message: error instanceof Error ? error.message : 'Unknown provider error',
          },
        });
      }
    }
  );

  fastify.get<{ Params: { jobId: string } }>(
    '/jobs/:jobId',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } });
      }

      const { jobId } = request.params;

      try {
        // First, attempt to get it from DB. If it's still processing, we sync it.
        const jobData = await videoService.syncJobStatus(jobId, request.user.id);
        
        if (!jobData) {
          return reply.status(404).send({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Job not found',
            },
          });
        }

        return reply.status(200).send({
          success: true,
          data: {
            id: jobData.job.id,
            status: jobData.job.status,
            sourceUrl: jobData.job.sourceUrl,
            createdAt: jobData.job.createdAt,
            error: jobData.job.errorDetails,
            clips: jobData.clips.map(c => ({
              id: c.id,
              title: c.title,
              durationSeconds: c.durationSeconds,
              videoUrl: c.videoUrl,
              thumbnailUrl: c.thumbnailUrl,
            })),
          },
        });
      } catch (error) {
        request.log.error(error, 'Failed to fetch job status');
        return reply.status(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch job status',
          },
        });
      }
    }
  );

  fastify.post(
    '/webhook',
    async (request, reply) => {
      // The webhook comes from OpenShorts
      const payload = request.body;

      try {
        await videoService.handleWebhook(payload);
        return reply.status(200).send({ success: true });
      } catch (error) {
        request.log.error(error, 'Webhook handling failed');
        // Return 200 anyway so provider doesn't infinitely retry unless we want them to
        // For security, if it's not found we shouldn't leak that, but here we just return 400 for bad payloads
        return reply.status(400).send({ success: false, error: { message: 'Webhook processing failed' }});
      }
    }
  );
};
