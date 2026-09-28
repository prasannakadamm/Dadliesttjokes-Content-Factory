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
  });

  it('coerces string port correctly', () => {
    const env = validateEnv(apiEnvSchema, { PORT: '5050' });
    expect(env.PORT).toBe(5050);
  });

  it('throws EnvironmentValidationError on invalid port number', () => {
    expect(() => validateEnv(apiEnvSchema, { PORT: '999999' })).toThrow(EnvironmentValidationError);
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
