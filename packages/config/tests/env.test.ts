import { describe, it, expect } from 'vitest';
import {
  apiEnvSchema,
  webEnvSchema,
  validateEnv,
  EnvironmentValidationError,
} from '../src/index.js';

describe('packages/config - Environment Validation', () => {
  it('applies defaults when empty object provided for apiEnvSchema in development', () => {
    const env = validateEnv(apiEnvSchema, {});
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(4000);
    expect(env.HOST).toBe('0.0.0.0');
    expect(env.CORS_ORIGIN).toBe('http://localhost:3000');
    expect(env.DATABASE_URL).toBe(
      'postgresql://postgres:postgres@localhost:5432/dadliesttjokes_dev',
    );
    expect(env.AUTH_SECRET).toBeDefined();
    expect(env.SESSION_TTL_HOURS).toBe(168);
  });

  it('development configuration loads successfully with documented local development setup', () => {
    const devEnv = validateEnv(apiEnvSchema, {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/dadliesttjokes_dev',
      AUTH_SECRET: 'dev_insecure_auth_secret_must_change_in_production',
    });
    expect(devEnv.NODE_ENV).toBe('development');
    expect(devEnv.DATABASE_URL).toBe(
      'postgresql://postgres:postgres@localhost:5432/dadliesttjokes_dev',
    );
    expect(devEnv.PORT).toBe(4000);
  });

  it('test configuration loads successfully using test environment', () => {
    const testEnv = validateEnv(apiEnvSchema, {
      NODE_ENV: 'test',
    });
    expect(testEnv.NODE_ENV).toBe('test');
    expect(testEnv.DATABASE_URL).toBeDefined();
  });

  it('production configuration without explicitly supplied DATABASE_URL is rejected', () => {
    expect(() =>
      validateEnv(apiEnvSchema, {
        NODE_ENV: 'production',
        AUTH_SECRET: 'production-valid-secret-key-32-chars-long',
      }),
    ).toThrow(/DATABASE_URL/);
  });

  it('production configuration using known local development DATABASE_URL placeholders is rejected', () => {
    const devPlaceholders = [
      'postgresql://postgres:postgres@localhost:5432/dadliesttjokes_dev',
      'postgresql://postgres:postgres@localhost:5432/dadliesttjokes_db',
      'postgresql://postgres:postgres@127.0.0.1:5432/dadliesttjokes_dev',
      'postgresql://user:password@localhost:5432/dadliesttjokes_db',
    ];
    for (const placeholderUrl of devPlaceholders) {
      expect(() =>
        validateEnv(apiEnvSchema, {
          NODE_ENV: 'production',
          AUTH_SECRET: 'production-valid-secret-key-32-chars-long',
          DATABASE_URL: placeholderUrl,
        }),
      ).toThrow(/DATABASE_URL/);
    }
  });

  it('production configuration with explicitly supplied valid PostgreSQL DATABASE_URL is accepted structurally', () => {
    const prodEnv = validateEnv(apiEnvSchema, {
      NODE_ENV: 'production',
      AUTH_SECRET: 'production-valid-secret-key-32-chars-long',
      DATABASE_URL:
        'postgresql://prod_admin:HighlySecureProdPassword2026!@prod-db.internal.net:5432/dadliest_prod',
    });
    expect(prodEnv.NODE_ENV).toBe('production');
    expect(prodEnv.DATABASE_URL).toBe(
      'postgresql://prod_admin:HighlySecureProdPassword2026!@prod-db.internal.net:5432/dadliest_prod',
    );
    expect(prodEnv.AUTH_SECRET).toBe('production-valid-secret-key-32-chars-long');
  });

  it('production configuration rejects insecure or default AUTH_SECRET', () => {
    expect(() =>
      validateEnv(apiEnvSchema, {
        NODE_ENV: 'production',
        AUTH_SECRET: 'insecure-dev-auth-secret-minimum-16-characters-long',
        DATABASE_URL:
          'postgresql://prod_admin:HighlySecureProdPassword2026!@prod-db.internal.net:5432/dadliest_prod',
      }),
    ).toThrow(/AUTH_SECRET/);

    expect(() =>
      validateEnv(apiEnvSchema, {
        NODE_ENV: 'production',
        AUTH_SECRET: 'dev_insecure_auth_secret_must_change_in_production',
        DATABASE_URL:
          'postgresql://prod_admin:HighlySecureProdPassword2026!@prod-db.internal.net:5432/dadliest_prod',
      }),
    ).toThrow(/AUTH_SECRET/);
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

  it('throws EnvironmentValidationError on non-postgres DATABASE_URL', () => {
    expect(() => validateEnv(apiEnvSchema, { DATABASE_URL: 'mysql://localhost:3306/db' })).toThrow(
      EnvironmentValidationError,
    );
  });

  it('throws EnvironmentValidationError on short AUTH_SECRET', () => {
    expect(() => validateEnv(apiEnvSchema, { AUTH_SECRET: 'too-short' })).toThrow(
      EnvironmentValidationError,
    );
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
