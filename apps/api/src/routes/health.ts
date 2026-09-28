import type { FastifyPluginAsync } from 'fastify';
import type { HealthCheckResponse } from '@dadliesttjokes/types';
import type { ApiEnv } from '@dadliesttjokes/config';
import type { DbClient } from '../db/client.js';

export interface HealthRouteOptions {
  config: ApiEnv;
  dbClient?: DbClient;
}

export const healthRoutes: FastifyPluginAsync<HealthRouteOptions> = async (fastify, opts) => {
  fastify.get('/health', async (_request, reply) => {
    let databaseStatus: 'connected' | 'disconnected' | undefined = undefined;
    if (opts.dbClient) {
      const alive = await opts.dbClient.isAlive();
      databaseStatus = alive ? 'connected' : 'disconnected';
    }

    const payload: HealthCheckResponse = {
      status: 'ok',
      service: 'dadliesttjokes-api',
      version: '0.0.1',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: opts.config.NODE_ENV,
      ...(databaseStatus ? { database: databaseStatus } : {}),
    };

    return reply.status(200).send(payload);
  });
};
