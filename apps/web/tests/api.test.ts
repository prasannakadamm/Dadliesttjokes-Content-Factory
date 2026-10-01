import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchApi, ApiRequestError } from '../src/lib/api';

describe('Security & API Client', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('API requests always use credentials/cookies', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200 }),
    );

    await fetchApi('/test-endpoint');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test-endpoint'),
      expect.objectContaining({
        credentials: 'include',
      }),
    );
  });

  it('no token is placed in URL parameters by default', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200 }),
    );

    await fetchApi('/auth/me');

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const url = callArgs[0] as string;
    expect(url).not.toContain('token=');
  });

  it('safe auth error handling for bad responses', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not logged in' },
        }),
        {
          status: 401,
        },
      ),
    );

    await expect(fetchApi('/auth/me')).rejects.toThrow(ApiRequestError);
  });
});
