export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export class ApiRequestError extends Error {
  public code: string;
  public details?: unknown;
  public status: number;

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = 'ApiRequestError';
    this.code = error.code;
    this.details = error.details;
    this.status = status;
  }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  let result: ApiResponse<T>;
  try {
    result = await response.json();
  } catch (err) {
    throw new Error('Failed to parse API response');
  }

  if (!response.ok || !result.success) {
    throw new ApiRequestError(
      response.status,
      result.error || {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred.',
      },
    );
  }

  return result.data as T;
}
