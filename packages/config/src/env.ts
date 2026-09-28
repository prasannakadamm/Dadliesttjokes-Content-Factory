import { z } from 'zod';

export const nodeEnvSchema = z.enum(['development', 'test', 'production']).default('development');

export type NodeEnv = z.infer<typeof nodeEnvSchema>;

export const apiEnvSchema = z.object({
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
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
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
