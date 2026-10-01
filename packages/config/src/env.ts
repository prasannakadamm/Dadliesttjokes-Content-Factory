import { z } from 'zod';

export const nodeEnvSchema = z.enum(['development', 'test', 'production']).default('development');

export type NodeEnv = z.infer<typeof nodeEnvSchema>;

export const apiEnvSchema = z
  .object({
    NODE_ENV: nodeEnvSchema,
    PORT: z
      .preprocess(
        (val) => (val === undefined || val === '' ? undefined : Number(val)),
        z.number().int().min(1).max(65535).optional(),
      )
      .default(4000),
    HOST: z.string().default('0.0.0.0'),
    CORS_ORIGIN: z
      .string()
      .default('http://localhost:3000')
      .refine((val) => val !== '*', {
        message: 'Wildcard CORS origin ("*") is prohibited when credentials are enabled.',
      }),
    DATABASE_URL: z
      .preprocess(
        (val) => (val === undefined || val === '' ? undefined : String(val).trim()),
        z
          .string()
          .refine((val) => val.startsWith('postgres://') || val.startsWith('postgresql://'), {
            message: 'DATABASE_URL must be a valid postgresql:// or postgres:// connection string.',
          })
          .optional(),
      )
      .default('postgresql://postgres:postgres@localhost:5432/dadliesttjokes_dev'),
    AUTH_SECRET: z
      .string()
      .min(16, { message: 'AUTH_SECRET must be at least 16 characters.' })
      .default('insecure-dev-auth-secret-minimum-16-characters-long'),
    SESSION_TTL_HOURS: z
      .preprocess(
        (val) => (val === undefined || val === '' ? undefined : Number(val)),
        z.number().int().min(1).max(8760).optional(),
      )
      .default(168), // 7 days
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
    OPENSHORTS_API_KEY: z.string().optional(),
    OPENSHORTS_WEBHOOK_SECRET: z.string().optional(),
    OPENSHORTS_API_URL: z.string().url().default('https://api.openshorts.app'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (
        data.AUTH_SECRET.includes('insecure-dev') ||
        data.AUTH_SECRET.includes('dev_insecure') ||
        data.AUTH_SECRET === 'insecure-dev-auth-secret-minimum-16-characters-long'
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['AUTH_SECRET'],
          message: 'Default insecure AUTH_SECRET is strictly prohibited in production environment.',
        });
      }

      const isKnownDevPlaceholder =
        data.DATABASE_URL === 'postgresql://postgres:postgres@localhost:5432/dadliesttjokes_dev' ||
        data.DATABASE_URL === 'postgresql://postgres:postgres@localhost:5432/dadliesttjokes_db' ||
        data.DATABASE_URL === 'postgresql://postgres:postgres@localhost:5432/dadliesttjokes_test' ||
        data.DATABASE_URL === 'postgresql://user:password@localhost:5432/dadliesttjokes_db';

      const usesDefaultLocalCredentials =
        data.DATABASE_URL.includes('postgres:postgres@localhost') ||
        data.DATABASE_URL.includes('postgres:postgres@127.0.0.1') ||
        data.DATABASE_URL.includes('user:password@localhost');

      if (isKnownDevPlaceholder || usesDefaultLocalCredentials) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message:
            'Production environment requires an explicitly supplied, production-safe DATABASE_URL. Default local development database credentials and localhost placeholders are prohibited.',
        });
      }
    }
  });

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export const webEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  PORT: z
    .preprocess(
      (val) => (val === undefined || val === '' ? undefined : Number(val)),
      z.number().int().min(1).max(65535).optional(),
    )
    .default(3000),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

export class EnvironmentValidationError extends Error {
  public readonly issues: Record<string, string[]>;

  constructor(issues: Record<string, string[]>) {
    const formatted = Object.entries(issues)
      .map(([key, msgs]) => `  - ${key}: ${msgs.join(', ')}`)
      .join('\n');
    super(`Environment configuration validation failed:\n${formatted}`);
    this.name = 'EnvironmentValidationError';
    this.issues = issues;
  }
}

export function validateEnv<TOutput>(
  schema: z.ZodType<TOutput, z.ZodTypeDef, unknown>,
  rawEnv: Record<string, unknown>,
): TOutput {
  const result = schema.safeParse(rawEnv);

  if (!result.success) {
    const issues: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || 'root';
      if (!issues[path]) {
        issues[path] = [];
      }
      issues[path].push(issue.message);
    }
    throw new EnvironmentValidationError(issues);
  }

  return result.data;
}
