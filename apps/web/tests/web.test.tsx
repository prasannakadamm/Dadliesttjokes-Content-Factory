import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock Auth Provider
vi.mock('../src/components/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import HomePage from '../src/app/page';
import LoginPage from '../src/app/login/page';
import RegisterPage from '../src/app/register/page';

describe('Web Foundation Pages', () => {
  it('renders root landing page', () => {
    render(<HomePage />);
    expect(screen.getByText('Dadliesttjokes Content Factory')).toBeDefined();
  });

  it('renders login page', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign in to your account')).toBeDefined();
  });

  it('renders registration page', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Create an account')).toBeDefined();
  });
});
