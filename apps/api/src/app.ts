import fastify, { FastifyError, FastifyInstance, FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import type { ApiEnv } from '@dadliesttjokes/config';
import type { ApiErrorResponse } from '@dadliesttjokes/types';
import { healthRoutes } from './routes/health.js';

export interface BuildAppOptions {
  config: ApiEnv;
  serverOptions?: FastifyServerOptions;
}

export function buildApp(options: BuildAppOptions): FastifyInstance {
  const { config, serverOptions = {} } = options;

  const isTest = config.NODE_ENV === 'test';
  const isDev = config.NODE_ENV === 'development';

  const app = fastify({
    logger: isTest
      ? false
      : {
          level: config.LOG_LEVEL || (isDev ? 'debug' : 'info'),
        },
    ...serverOptions,
  });

  // Enable CORS with configured origin
  app.register(cors, {
    origin: config.CORS_ORIGIN === '*' ? true : [config.CORS_ORIGIN],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Register Foundation Routes
  app.register(healthRoutes, { config });

  // Custom 404 Not Found Handler
  app.setNotFoundHandler((request, reply) => {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
    };
    reply.status(404).send(errorResponse);
  });

  // Centralized Error Handler
  app.setErrorHandler((error: FastifyError | Error, request, reply) => {
    const fastifyErr = error as Partial<FastifyError>;
    const statusCode =
      fastifyErr.statusCode && fastifyErr.statusCode >= 400 ? fastifyErr.statusCode : 500;

    app.log.error({
      err: error,
      requestId: request.id,
      url: request.raw.url,
      method: request.raw.method,
    });

    const isClientError = statusCode < 500;
    const message =
      isClientError || isDev ? error.message : 'An unexpected internal server error occurred.';

    const code =
      fastifyErr.code || (statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR');

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(isDev && error.stack ? { details: error.stack } : {}),
      },
    };

    reply.status(statusCode).send(errorResponse);
  });

  return app;
}
