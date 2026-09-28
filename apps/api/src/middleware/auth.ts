import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import type { AppDatabase } from '../db/client.js';
import type { UserDto } from '@dadliesttjokes/types';
import type { Session } from '../db/schema/index.js';
import { authenticateSessionToken } from '../services/auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserDto;
    session?: Session;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (role: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export interface AuthPluginOptions {
  db: AppDatabase;
  cookieSecret?: string;
}

export function extractToken(request: FastifyRequest): string | null {
  // 1. Try Authorization header: Bearer <token>
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    if (bearerToken) {
      return bearerToken;
    }
  }

  // 2. Try Cookie: session_token
  if (request.cookies && request.cookies.session_token) {
    return request.cookies.session_token;
  }

  return null;
}

const authPluginCallback: FastifyPluginAsync<AuthPluginOptions> = async (fastify, opts) => {
  // Register cookie support if not already registered
  if (!fastify.hasPlugin('@fastify/cookie')) {
    await fastify.register(cookie, {
      secret: opts.cookieSecret || 'default-session-cookie-secret-min-16-chars',
    });
  }

  // Decorate fastify with authenticate preHandler guard
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const token = extractToken(request);

      if (!token) {
        reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. No session token provided.',
          },
        });
        return;
      }

      const authResult = await authenticateSessionToken(opts.db, token);
      if (!authResult) {
        reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired session token.',
          },
        });
        return;
      }

      request.user = authResult.user;
      request.session = authResult.session;
    },
  );

  // Decorate fastify with role-based authorization guard
  fastify.decorate(
    'requireRole',
    (requiredRole: string) =>
      async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        if (!request.user) {
          reply.status(401).send({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required.',
            },
          });
          return;
        }

        if (request.user.role !== requiredRole && request.user.role !== 'admin') {
          reply.status(403).send({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Insufficient permissions for this action.',
            },
          });
          return;
        }
      },
  );
};

export const authPlugin = fp(authPluginCallback, {
  name: 'auth-plugin',
  fastify: '5.x',
});
