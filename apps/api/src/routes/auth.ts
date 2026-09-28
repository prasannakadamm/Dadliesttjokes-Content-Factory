import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { AppDatabase } from '../db/client.js';
import type { ApiEnv } from '@dadliesttjokes/config';
import { registerUser, loginUser, invalidateSession, AuthError } from '../services/auth.js';
import { extractToken } from '../middleware/auth.js';

export interface AuthRoutesOptions {
  db: AppDatabase;
  config: ApiEnv;
}

const registerSchema = z.object({
  email: z.string().email({ message: 'A valid email address is required.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .max(128, { message: 'Password must not exceed 128 characters.' }),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'A valid email address is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export const authRoutes: FastifyPluginAsync<AuthRoutesOptions> = async (fastify, opts) => {
  const { db, config } = opts;
  const isProd = config.NODE_ENV === 'production';

  // Helper to set session cookie
  const setSessionCookie = (reply: FastifyReply, token: string, expiresAt: Date) => {
    const maxAgeSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    reply.setCookie('session_token', token, {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      expires: expiresAt,
      maxAge: maxAgeSeconds,
    });
  };

  // POST /auth/register
  fastify.post('/auth/register', async (request, reply) => {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0]?.message || 'Invalid registration request body.',
          details: parseResult.error.format(),
        },
      });
    }

    try {
      const result = await registerUser(db, parseResult.data, config.SESSION_TTL_HOURS);
      setSessionCookie(reply, result.token, result.expiresAt);

      return reply.status(201).send({
        success: true,
        data: {
          user: result.user,
          expiresAt: result.expiresAt.toISOString(),
        },
      });
    } catch (err) {
      if (err instanceof AuthError) {
        return reply.status(err.statusCode).send({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
      }
      throw err;
    }
  });

  // POST /auth/login
  fastify.post('/auth/login', async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0]?.message || 'Invalid login request body.',
          details: parseResult.error.format(),
        },
      });
    }

    try {
      const result = await loginUser(db, parseResult.data, config.SESSION_TTL_HOURS);
      setSessionCookie(reply, result.token, result.expiresAt);

      return reply.status(200).send({
        success: true,
        data: {
          user: result.user,
          expiresAt: result.expiresAt.toISOString(),
        },
      });
    } catch (err) {
      if (err instanceof AuthError) {
        return reply.status(err.statusCode).send({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
      }
      throw err;
    }
  });

  // POST /auth/logout
  fastify.post('/auth/logout', async (request, reply) => {
    const token = extractToken(request);
    if (token) {
      await invalidateSession(db, token);
    }

    reply.clearCookie('session_token', {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
    });

    return reply.status(200).send({
      success: true,
      data: {
        message: 'Logged out successfully.',
      },
    });
  });

  // GET /auth/me (Protected route)
  fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    return reply.status(200).send({
      success: true,
      data: {
        user: request.user,
      },
    });
  });
};
