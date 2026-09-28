import dotenv from 'dotenv';
import { apiEnvSchema, validateEnv, type ApiEnv } from '@dadliesttjokes/config';

// Load local .env if present
dotenv.config();

export function loadApiConfig(overrides: Partial<Record<string, unknown>> = {}): ApiEnv {
  return validateEnv(apiEnvSchema, {
    PORT: process.env.API_PORT || process.env.PORT,
    ...process.env,
    ...overrides,
  });
}
