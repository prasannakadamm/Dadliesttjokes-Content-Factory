import type { FastifyPluginAsync } from 'fastify';
import type { HealthCheckResponse } from '@dadliesttjokes/types';
import type { ApiEnv } from '@dadliesttjokes/config';

export interface HealthRouteOptions {
  config: ApiEnv;
}

export const healthRoutes: FastifyPluginAsync<HealthRouteOptions> = async (fastify, opts) => {
  fastify.get('/health', async (_request, reply) => {
    const payload: HealthCheckResponse = {
      status: 'ok',
      service: 'dadliesttjokes-api',
      version: '0.0.1',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: opts.config.NODE_ENV,
    };

    return reply.status(200).send(payload);
  });
};
