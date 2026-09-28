import { describe, it, expect } from 'vitest';
import type { HealthCheckResponse, ApiResponse } from '../src/index.js';

describe('packages/types - Foundation Types', () => {
  it('correctly constructs a HealthCheckResponse compliant object', () => {
    const health: HealthCheckResponse = {
      status: 'ok',
      service: 'test-service',
      version: '0.0.1',
      uptimeSeconds: 42,
      timestamp: new Date().toISOString(),
      environment: 'test',
    };

    expect(health.status).toBe('ok');
    expect(health.uptimeSeconds).toBe(42);
    expect(health.environment).toBe('test');
  });

  it('correctly constructs ApiResponse success and error variants', () => {
    const success: ApiResponse<{ value: number }> = {
      success: true,
      data: { value: 100 },
    };

    const error: ApiResponse<never> = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource was not found',
      },
    };

    expect(success.success).toBe(true);
    expect(error.success).toBe(false);
  });
});
