import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider } from '../src/components/AuthProvider';
import LoginPage from '../src/app/login/page';
import RegisterPage from '../src/app/register/page';
import { fetchApi } from '../src/lib/api';

vi.mock('../src/lib/api', () => ({
  fetchApi: vi.fn(),
  ApiRequestError: class extends Error {
    constructor(status: number, error: any) {
      super(error.message);
      this.name = 'ApiRequestError';
    }
  },
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
}));

describe('Authentication Flow & Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('no raw authentication token is stored in localStorage or sessionStorage', async () => {
    vi.mocked(fetchApi).mockImplementation(async (url) => {
      if (url === '/auth/login') {
        return { user: { id: '1', email: 'test@example.com' } };
      }
      return { user: null };
    });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('login flow does not require a client token', async () => {
    vi.mocked(fetchApi).mockImplementation(async (url) => {
      if (url === '/auth/login') {
        return { user: { id: '1', email: 'test@example.com' } };
      }
      return { user: null };
    });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123!' } });
    fireEvent.submit(
      screen.getByRole('button', { name: /Sign in/i }).closest('form') as HTMLFormElement,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    // The fetchApi is called directly with email/password, returning just { user }.
    // No mock token is handled by the client.
    expect(fetchApi).toHaveBeenCalledWith(
      '/auth/login',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('login API failure displays error', async () => {
    const { ApiRequestError } = await import('../src/lib/api');
    vi.mocked(fetchApi).mockImplementation(async (url) => {
      if (url === '/auth/login') {
        throw new ApiRequestError(401, { code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }
      return { user: null };
    });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeDefined();
    });
  });

  it('registration success behavior updates user and redirects', async () => {
    vi.mocked(fetchApi).mockImplementation(async (url) => {
      if (url === '/auth/register') {
        return { user: { id: '2', email: 'new@example.com' } };
      }
      return { user: null };
    });

    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('registration API failure displays error', async () => {
    const { ApiRequestError } = await import('../src/lib/api');
    vi.mocked(fetchApi).mockImplementation(async (url) => {
      if (url === '/auth/register') {
        throw new ApiRequestError(400, { code: 'BAD_REQUEST', message: 'Email already in use' });
      }
      return { user: null };
    });

    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123!' } });
    fireEvent.submit(
      screen.getByRole('button', { name: /Create account/i }).closest('form') as HTMLFormElement,
    );

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeDefined();
    });
  });
});
