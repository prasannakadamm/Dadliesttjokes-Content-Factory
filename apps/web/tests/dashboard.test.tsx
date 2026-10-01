import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider } from '../src/components/AuthProvider';
import { AuthGuard } from '../src/components/AuthGuard';
import DashboardPage from '../src/app/dashboard/page';
import ProfilePage from '../src/app/dashboard/profile/page';
import { AppShell } from '../src/components/AppShell';
import { fetchApi } from '../src/lib/api';

vi.mock('../src/lib/api', () => ({
  fetchApi: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
}));

describe('Dashboard & Protected Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unauthenticated state redirects to login', async () => {
    vi.mocked(fetchApi).mockImplementation(async () => {
      throw new Error('Unauthorized');
    });

    render(
      <AuthProvider>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('authenticated session detection renders protected content', async () => {
    vi.mocked(fetchApi).mockImplementation(async (url) => {
      if (url === '/auth/me') return { user: { id: '1', email: 'test@example.com' } };
      return {};
    });

    render(
      <AuthProvider>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeDefined();
    });
  });

  it('dashboard rendering and authenticated user display', async () => {
    vi.mocked(fetchApi).mockImplementation(async (url) => {
      if (url === '/auth/me') return { user: { id: '1', email: 'test@example.com' } };
      return {};
    });

    render(
      <AuthProvider>
        <AuthGuard>
          <DashboardPage />
        </AuthGuard>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/test@example.com/i)).toBeDefined();
      expect(screen.getByText('Dashboard Overview')).toBeDefined();
    });
  });

  it('profile rendering', async () => {
    vi.mocked(fetchApi).mockImplementation(async (url) => {
      if (url === '/auth/me') return { user: { id: '1', email: 'test@example.com', role: 'user', createdAt: '2024-01-01' } };
      return {};
    });

    render(
      <AuthProvider>
        <AuthGuard>
          <ProfilePage />
        </AuthGuard>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Account Profile')).toBeDefined();
      expect(screen.getByText(/test@example.com/i)).toBeDefined();
      expect(screen.getByText('user')).toBeDefined();
    });
  });

  it('logout behavior clears session and redirects', async () => {
    vi.mocked(fetchApi).mockImplementation(async (url) => {
      if (url === '/auth/me') return { user: { id: '1', email: 'test@example.com' } };
      if (url === '/auth/logout') return { success: true };
      return {};
    });

    render(
      <AuthProvider>
        <AppShell>
          <div data-testid="content-div">Content</div>
        </AppShell>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('content-div')).toBeDefined();
    });

    // Find and click the desktop logout button (which is rendered in AppShell)
    const logoutButtons = screen.getAllByRole('button', { name: /Logout/i });
    fireEvent.click(logoutButtons[0]);

    await waitFor(() => {
      expect(fetchApi).toHaveBeenCalledWith('/auth/logout', expect.objectContaining({ method: 'POST' }));
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('AppShell rendering and navigation rendering', async () => {
    vi.mocked(fetchApi).mockImplementation(async (url) => {
      if (url === '/auth/me') return { user: { id: '1', email: 'test@example.com' } };
      return {};
    });

    render(
      <AuthProvider>
        <AppShell>
          <div>Content</div>
        </AppShell>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Content Factory').length).toBeGreaterThan(0);
    });
    // Check if nav items exist
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
  });
});
