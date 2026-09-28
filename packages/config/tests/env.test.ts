import { describe, it, expect } from 'vitest';
import {
  apiEnvSchema,
  webEnvSchema,
  validateEnv,
  EnvironmentValidationError,
} from '../src/index.js';

describe('packages/config - Environment Validation', () => {
  it('applies defaults when empty object provided for apiEnvSchema', () => {
    const env = validateEnv(apiEnvSchema, {});
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(4000);
    expect(env.HOST).toBe('0.0.0.0');
    expect(env.CORS_ORIGIN).toBe('http://localhost:3000');
    expect(env.DATABASE_URL).toContain('postgresql://');
    expect(env.AUTH_SECRET).toBeDefined();
    expect(env.SESSION_TTL_HOURS).toBe(168);
  });

  it('coerces string port correctly', () => {
    const env = validateEnv(apiEnvSchema, { PORT: '5050' });
    expect(env.PORT).toBe(5050);
  });

  it('throws EnvironmentValidationError on invalid port number', () => {
    expect(() => validateEnv(apiEnvSchema, { PORT: '999999' })).toThrow(EnvironmentValidationError);
  });

  it('throws EnvironmentValidationError when CORS_ORIGIN is wildcard *', () => {
    expect(() => validateEnv(apiEnvSchema, { CORS_ORIGIN: '*' })).toThrow(
      EnvironmentValidationError,
    );
  });

  it('throws EnvironmentValidationError on invalid DATABASE_URL', () => {
    expect(() => validateEnv(apiEnvSchema, { DATABASE_URL: 'mysql://localhost:3306/db' })).toThrow(
      EnvironmentValidationError,
    );
  });

  it('throws EnvironmentValidationError on short AUTH_SECRET', () => {
    expect(() => validateEnv(apiEnvSchema, { AUTH_SECRET: 'too-short' })).toThrow(
      EnvironmentValidationError,
    );
  });

  it('throws EnvironmentValidationError when default insecure AUTH_SECRET is used in production', () => {
    expect(() =>
      validateEnv(apiEnvSchema, {
        NODE_ENV: 'production',
        AUTH_SECRET: 'insecure-dev-auth-secret-minimum-16-characters-long',
      }),
    ).toThrow(EnvironmentValidationError);
  });

  it('validates webEnvSchema with defaults', () => {
    const env = validateEnv(webEnvSchema, {});
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3000);
    expect(env.NEXT_PUBLIC_API_URL).toBe('http://localhost:4000');
  });

  it('throws EnvironmentValidationError on invalid web NEXT_PUBLIC_API_URL', () => {
    expect(() => validateEnv(webEnvSchema, { NEXT_PUBLIC_API_URL: 'not-a-url' })).toThrow(
      EnvironmentValidationError,
    );
  });
});
