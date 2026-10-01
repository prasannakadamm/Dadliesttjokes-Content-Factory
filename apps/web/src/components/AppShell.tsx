'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { AuthGuard } from './AuthGuard';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', active: true },
  { name: 'Content', href: '/dashboard/content', active: false },
  { name: 'Videos', href: '/dashboard/videos', active: true },
  { name: 'Publishing', href: '/dashboard/publishing', active: false },
  { name: 'Analytics', href: '/dashboard/analytics', active: false },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Mobile sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/80"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            ></div>
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card pt-5 pb-4">
              <div className="flex items-center px-4">
                <h1 className="text-xl font-bold text-white">Content Factory</h1>
                <button
                  type="button"
                  className="ml-auto flex h-10 w-10 items-center justify-center rounded-md hover:bg-border"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close sidebar"
                >
                  <span aria-hidden="true" className="text-white">
                    ✕
                  </span>
                </button>
              </div>
              <div className="mt-8 flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 space-y-1 px-2">
                  {navigation.map((item) =>
                    item.active ? (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                          pathname === item.href
                            ? 'bg-border text-white'
                            : 'text-muted hover:bg-border/50 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <div
                        key={item.name}
                        className="group flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-muted/50"
                      >
                        {item.name}
                        <span className="rounded-full bg-border px-2 py-0.5 text-xs">Soon</span>
                      </div>
                    ),
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:inset-y-0">
          <div className="flex flex-grow flex-col overflow-y-auto border-r border-border bg-card pt-5 pb-4">
            <div className="flex items-center px-4">
              <h1 className="text-xl font-bold text-white">Content Factory</h1>
            </div>
            <div className="mt-8 flex flex-1 flex-col">
              <nav className="flex-1 space-y-1 px-2">
                {navigation.map((item) =>
                  item.active ? (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                        pathname === item.href
                          ? 'bg-border text-white'
                          : 'text-muted hover:bg-border/50 hover:text-white'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <div
                      key={item.name}
                      className="group flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-muted/50 cursor-not-allowed"
                    >
                      {item.name}
                      <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted/70">
                        Soon
                      </span>
                    </div>
                  ),
                )}
              </nav>
            </div>
          </div>
        </div>

        {/* Main column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center border-b border-border bg-card px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="border-r border-border pr-4 text-muted lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={mobileMenuOpen}
            >
              <span aria-hidden="true" className="text-xl">
                ☰
              </span>
            </button>
            <div className="flex flex-1 justify-end px-4 lg:px-0">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/profile"
                  className="text-sm font-medium text-muted hover:text-white"
                >
                  {user?.email}
                </Link>
                <button
                  onClick={logout}
                  className="rounded-md bg-border px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-border/80"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-background">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
